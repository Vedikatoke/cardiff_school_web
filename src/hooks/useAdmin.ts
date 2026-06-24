import { useUser } from '@clerk/clerk-react';

export function useAdmin() {
  const { user } = useUser();
  const adminEmails = ['vedikatoke1211@gmail.com', 'vadutoke@gmail.com'];
  if (!user) return false;
  
  const emails = user.emailAddresses.map(e => e.emailAddress.toLowerCase());
  const admins = adminEmails.map(e => e.toLowerCase());
  return emails.some(email => admins.includes(email));
}
