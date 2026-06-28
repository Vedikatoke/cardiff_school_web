import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClerkClient, verifyToken } from '@clerk/backend';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'school-admin-jwt-secret-key-2026';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// Pre-warm database connection
prisma.$connect()
  .then(() => console.log('Database connection established successfully'))
  .catch((err) => console.error('Failed to pre-warm database connection:', err));

// Lazy initialize clerk client to ensure env vars are loaded
let clerkClient: any = null;
function getClerkClient() {
  if (clerkClient) return clerkClient;

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error('CRITICAL: CLERK_SECRET_KEY is not defined in environment variables. Authentication will fail.');
    // We don't throw yet to allow the server to start, but subsequent calls will fail clearly
    return {
      users: {
        getUser: () => { throw new Error('CLERK_SECRET_KEY is missing'); }
      }
    };
  }

  clerkClient = createClerkClient({ secretKey });
  return clerkClient;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Seed initial data if database is empty
  const seedDatabase = async () => {
    try {
      const studentCount = await prisma.student.count();
      if (studentCount === 0) {
        console.log('Seeding initial data...');
        await prisma.student.createMany({
          data: [
            { name: 'Alice Henderson', rollNumber: 'S2401', class: '10A', email: 'alice.h@school.edu' },
            { name: 'Mark Thompson', rollNumber: 'S2402', class: '11B', email: 'm.thompson@school.edu' },
            { name: 'Sarah Jenkins', rollNumber: 'S2403', class: '10C', email: 's.jenkins@school.edu' },
          ],
        });
        await prisma.staff.createMany({
          data: [
            { name: 'Dr. Emily Watson', role: 'Head of Dept', department: 'Mathematics', email: 'e.watson@school.edu' },
            { name: 'Prof. Robert Blake', role: 'Senior Lecturer', department: 'Science', email: 'r.blake@school.edu' },
          ],
        });
        console.log('Seeding completed successfully.');
      }

      // Check for Admin User seeding
      const adminCount = await prisma.adminUser.count();
      if (adminCount === 0) {
        console.log('Seeding initial admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.adminUser.create({
          data: {
            username: 'admin',
            password: hashedPassword,
            name: 'School Administrator',
          },
        });
        console.log('Admin seeding completed successfully (admin/admin123).');
      }

      // Check for Fees seeding
      const feesCount = await prisma.fee.count();
      if (feesCount === 0) {
        console.log('Seeding initial fees...');
        await prisma.fee.createMany({
          data: [
            // Semi-english
            { medium: 'semi-english', class: '8th Standard', admission: '₹1,350', regOther: '₹2,500', monthly: '₹1,350', term: '₹2,700', total: '₹22,750' },
            { medium: 'semi-english', class: '9th Standard', admission: '₹1,490', regOther: '₹2,500', monthly: '₹1,490', term: '₹2,980', total: '₹24,850' },
            { medium: 'semi-english', class: '10th Standard', admission: '₹1,490', regOther: '₹2,500', monthly: '₹1,490', term: '₹2,980', total: '₹24,850' },
            // English
            { medium: 'english', class: '8th Standard', admission: '₹0', regOther: '₹0', monthly: '₹1,485', term: '₹2,970', total: '₹20,790' },
            { medium: 'english', class: '9th Standard', admission: '₹0', regOther: '₹0', monthly: '₹1,540', term: '₹3,080', total: '₹21,560' },
            { medium: 'english', class: '10th Standard', admission: '₹0', regOther: '₹0', monthly: '₹1,560', term: '₹3,120', total: '₹21,840' },
          ]
        });
        console.log('Fees seeding completed successfully.');
      }
    } catch (err) {
      console.error('Database seeding failed:', err);
    }
  };
  
  // Wait for seeding (in background to not block startup)
  seedDatabase().then(() => {
    console.log('Post-startup background check complete.');
  }).catch(err => {
    console.error('Background seed failed:', err);
  });

  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  
  // Custom error handler to log details and prevent generic 500s
  const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
    console.error('Unhandled Server Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body
    });
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message 
    });
  };

  // --- API Routes ---

  // Auth Middleware Helpers
  const adminEmails: string[] = [];

  const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.warn('Auth Failure: No Authorization header provided');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: 'Unauthorized: Token is empty' });
    }

    // Try custom JWT first
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).adminUser = decoded;
      return next();
    } catch (err) {
      // If it's not a custom JWT, we try Clerk below
    }

    try {
      if (!process.env.CLERK_SECRET_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Clerk key not configured' });
      }
      // In @clerk/backend v3, we can use verifyToken utility
      const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
      (req as any).auth = payload;
      next();
    } catch (err) {
      console.error('Auth Failure: Token verification failed', err);
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
  };

  const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await requireAuth(req, res, () => {
      next(); 
    });
  };

  // In-memory cache for admin status to avoid redundant Clerk API calls
  const adminStatusCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
  const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

  // Improved requireAdmin that actually checks the user from Clerk with caching
  const requireAdminCheck = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: 'Unauthorized: Empty token' });
    }

    // Try Custom JWT first
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).adminUser = decoded;
      return next();
    } catch (err) {
      // Fall through to Clerk
    }

    try {
      if (!process.env.CLERK_SECRET_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
      const userId = payload.sub;
      const now = Date.now();

      // Check cache first
      const cached = adminStatusCache.get(userId);
      if (cached && now - cached.timestamp < CACHE_TTL) {
        if (!cached.isAdmin) {
          return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        (req as any).auth = payload;
        return next();
      }

      const user = await getClerkClient().users.getUser(userId);
      const userEmails = user.emailAddresses.map((e: any) => e.emailAddress.toLowerCase());
      const admins = adminEmails.map(e => e.toLowerCase());
      
      const isUserAdmin = userEmails.some((email: string) => admins.includes(email));

      // Update cache
      adminStatusCache.set(userId, { isAdmin: isUserAdmin, timestamp: now });

      if (!isUserAdmin) {
        console.warn(`Access Denied: User ${userId} with emails ${userEmails.join(', ')} is not an admin.`);
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }
      (req as any).auth = payload;
      next();
    } catch (err) {
      console.error('Admin Check Failure:', err);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // --- Admin Custom JWT Login Route ---
  app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const admin = await prisma.adminUser.findUnique({
        where: { username }
      });

      if (!admin) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const token = jwt.sign(
        { id: admin.id, username: admin.username, name: admin.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          username: admin.username,
          name: admin.name,
        }
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ error: 'Internal server error during authentication' });
    }
  });

  // Health Check
  app.get('/api/health', async (req, res) => {
    try {
      // Small query to wake up Neon compute if idle
      await prisma.$queryRaw`SELECT 1`;
      res.json({ 
        status: 'ok', 
        database: 'connected', 
        authConfigured: !!process.env.CLERK_SECRET_KEY 
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Database check failed' });
    }
  });

  // Get Unique Classes
  app.get('/api/classes', requireAuth, async (req, res) => {
    try {
      const classes = await prisma.student.findMany({
        select: { class: true },
        distinct: ['class'],
      });
      res.json(classes.map(c => c.class).sort());
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch classes' });
    }
  });

  // Dashboard Stats
  app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
    try {
      const studentCount = await prisma.student.count();
      const staffCount = await prisma.staff.count();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const attendanceSummary = await prisma.attendance.groupBy({
        by: ['status'],
        where: {
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        _count: {
          _all: true
        }
      });

      res.json({
        students: studentCount,
        staff: staffCount,
        attendance: attendanceSummary.reduce((acc: any, curr) => {
          acc[curr.status.toLowerCase()] = curr._count._all;
          return acc;
        }, { present: 0, absent: 0 })
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Students CRUD
  app.get('/api/students', requireAuth, async (req, res) => {
    const students = await prisma.student.findMany({ orderBy: { name: 'asc' } });
    res.json(students);
  });

  app.post('/api/students', requireAdminCheck, async (req, res) => {
    try {
      const { name, email, rollNumber, class: className } = req.body;
      
      if (!name || !email || !rollNumber || !className) {
        return res.status(400).json({ error: 'All fields (Name, Email, Roll Number, Class) are required.' });
      }

      const existingEmail = await prisma.student.findUnique({
        where: { email }
      });
      if (existingEmail) {
        return res.status(400).json({ error: 'A student with this Email already exists.' });
      }

      const existingRoll = await prisma.student.findUnique({
        where: { rollNumber }
      });
      if (existingRoll) {
        return res.status(400).json({ error: 'A student with this Roll Number already exists.' });
      }

      const student = await prisma.student.create({
        data: {
          name,
          email,
          rollNumber,
          class: className
        }
      });
      res.json(student);
    } catch (error) {
      console.error('Error creating student:', error);
      res.status(400).json({ error: 'Failed to create student in database.' });
    }
  });

  app.put('/api/students/:id', requireAdminCheck, async (req, res) => {
    try {
      const student = await prisma.student.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(student);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update student' });
    }
  });

  app.delete('/api/students/:id', requireAdminCheck, async (req, res) => {
    try {
      await prisma.student.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Delete Student Error:', error);
      res.status(400).json({ error: 'Failed to delete student. They might have related records or already be removed.' });
    }
  });

  // Staff CRUD
  app.get('/api/staff', requireAuth, async (req, res) => {
    const staff = await prisma.staff.findMany({ orderBy: { name: 'asc' } });
    res.json(staff);
  });

  app.post('/api/staff', requireAdminCheck, async (req, res) => {
    try {
      const staff = await prisma.staff.create({ data: req.body });
      res.json(staff);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create staff' });
    }
  });

  app.put('/api/staff/:id', requireAdminCheck, async (req, res) => {
    try {
      const staff = await prisma.staff.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(staff);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update staff' });
    }
  });

  app.delete('/api/staff/:id', requireAdminCheck, async (req, res) => {
    try {
      await prisma.staff.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Delete Staff Error:', error);
      res.status(400).json({ error: 'Failed to delete staff member.' });
    }
  });

  // Attendance
  app.get('/api/attendance', requireAuth, async (req, res) => {
    const { date, class: className } = req.query;
    if (!date || !className) return res.status(400).json({ error: 'Date and class are required' });

    const targetDate = new Date(date as string);
    targetDate.setHours(0, 0, 0, 0);

    const isAll = className === 'All' || className === 'all' || className === 'All Classes';
    const whereClause = isAll ? {} : { class: className as string };

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        attendance: {
          where: {
            date: {
              gte: targetDate,
              lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    });

    res.json(students);
  });

  app.post('/api/attendance/bulk', requireAdminCheck, async (req, res) => {
    const { records, date } = req.body;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    try {
      // Use transaction to ensure bulk insert or fail
      await prisma.$transaction(
        records.map((record: any) => 
          prisma.attendance.upsert({
            where: {
              studentId_date: {
                studentId: record.studentId,
                date: targetDate
              }
            },
            update: { status: record.status },
            create: {
              studentId: record.studentId,
              date: targetDate,
              status: record.status
            }
          })
        )
      );
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Failed to save attendance' });
    }
  });

  // Admissions API
  app.post('/api/admissions', async (req, res) => {
    try {
      const admission = await prisma.admission.create({
        data: {
          studentName: req.body.studentName,
          grade: req.body.grade,
          parentEmail: req.body.parentEmail,
          phone: req.body.phone,
          previousSchool: req.body.previousSchool || null,
        }
      });
      res.json(admission);
    } catch (error) {
      console.error('Admission Error:', error);
      res.status(400).json({ error: 'Failed to submit application' });
    }
  });

  app.get('/api/admissions', requireAdminCheck, async (req, res) => {
    try {
      const admissions = await prisma.admission.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json(admissions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch admissions' });
    }
  });

  app.put('/api/admissions/:id', requireAdminCheck, async (req, res) => {
    try {
      const { status } = req.body;
      const admission = await prisma.admission.update({
        where: { id: req.params.id },
        data: { status }
      });

      // If marked as Approved, promote/create a Student in the database
      if (status === 'Approved') {
        const existingStudent = await prisma.student.findUnique({
          where: { email: admission.parentEmail }
        });

        if (!existingStudent) {
          // Find a unique roll number
          let isUnique = false;
          let rollNo = '';
          while (!isUnique) {
            const tempVal = Math.floor(1000 + Math.random() * 9000);
            rollNo = `S26${tempVal}`;
            const checkRoll = await prisma.student.findUnique({
              where: { rollNumber: rollNo }
            });
            if (!checkRoll) {
              isUnique = true;
            }
          }

          await prisma.student.create({
            data: {
              name: admission.studentName,
              email: admission.parentEmail,
              class: admission.grade,
              rollNumber: rollNo
            }
          });
        }
      }

      res.json(admission);
    } catch (error) {
      console.error('Error updating admission status:', error);
      res.status(400).json({ error: 'Failed to update admission' });
    }
  });

  app.delete('/api/admissions/:id', requireAdminCheck, async (req, res) => {
    try {
      await prisma.admission.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Delete Admission Error:', error);
      res.status(400).json({ error: 'Failed to delete admission application' });
    }
  });

  // --- Fees Management Routes ---
  app.get('/api/fees', async (req, res) => {
    try {
      const fees = await prisma.fee.findMany();
      res.json(fees);
    } catch (error) {
      console.error('Fetch Fees Error:', error);
      res.status(500).json({ error: 'Failed to fetch fees structure' });
    }
  });

  app.post('/api/fees', requireAdminCheck, async (req, res) => {
    try {
      const { medium, class: className, admission, regOther, monthly, term, total } = req.body;
      if (!medium || !className || !monthly || !term) {
        return res.status(400).json({ error: 'Medium, Class, Monthly and Term fees are required' });
      }
      const newFee = await prisma.fee.create({
        data: {
          medium,
          class: className,
          admission: admission || '₹0',
          regOther: regOther || '₹0',
          monthly,
          term,
          total: total || '₹0'
        }
      });
      res.status(201).json(newFee);
    } catch (error) {
      console.error('Create Fee Error:', error);
      res.status(400).json({ error: 'Failed to create fee standard' });
    }
  });

  app.put('/api/fees/:id', requireAdminCheck, async (req, res) => {
    try {
      const { medium, class: className, admission, regOther, monthly, term, total } = req.body;
      const updatedFee = await prisma.fee.update({
        where: { id: req.params.id },
        data: {
          medium,
          class: className,
          admission,
          regOther,
          monthly,
          term,
          total
        }
      });
      res.json(updatedFee);
    } catch (error) {
      console.error('Update Fee Error:', error);
      res.status(400).json({ error: 'Failed to update fee record' });
    }
  });

  app.delete('/api/fees/:id', requireAdminCheck, async (req, res) => {
    try {
      await prisma.fee.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Delete Fee Error:', error);
      res.status(400).json({ error: 'Failed to delete fee record' });
    }
  });

  // --- Vite / Frontend Setup ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Apply error handler LAST
  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await prisma.$disconnect();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await prisma.$disconnect();
    process.exit(0);
  });
}

startServer().catch(async (err) => {
  console.error('Critical server startup failure:', err);
  await prisma.$disconnect();
  process.exit(1);
});
