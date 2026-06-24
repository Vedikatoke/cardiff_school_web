import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import api from '../lib/api';

interface FeeItem {
  id?: string;
  medium: string;
  class: string;
  admission: string;
  regOther: string;
  monthly: string;
  term: string;
  total: string;
}

const fallbackSemiEnglishFees = [
  { class: '8th Standard', admission: '₹1,350', regOther: '₹2,500', monthly: '₹1,350', term: '₹2,700', total: '₹22,750' },
  { class: '9th Standard', admission: '₹1,490', regOther: '₹2,500', monthly: '₹1,490', term: '₹2,980', total: '₹24,850' },
  { class: '10th Standard', admission: '₹1,490', regOther: '₹2,500', monthly: '₹1,490', term: '₹2,980', total: '₹24,850' },
];

const fallbackEnglishMediumFees = [
  { class: '8th Standard', admission: '₹0', regOther: '₹0', monthly: '₹1,485', term: '₹2,970', total: '₹20,790' },
  { class: '9th Standard', admission: '₹0', regOther: '₹0', monthly: '₹1,540', term: '₹3,080', total: '₹21,560' },
  { class: '10th Standard', admission: '₹0', regOther: '₹0', monthly: '₹1,560', term: '₹3,120', total: '₹21,840' },
];

export default function Fees() {
  const [activeMedium, setActiveMedium] = useState<'semi-english' | 'english'>('semi-english');
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFees() {
      try {
        const response = await api.get('/fees');
        if (response.data && response.data.length > 0) {
          setFees(response.data);
        } else {
          const initialMerged: FeeItem[] = [
            ...fallbackSemiEnglishFees.map(f => ({ ...f, medium: 'semi-english' })),
            ...fallbackEnglishMediumFees.map(f => ({ ...f, medium: 'english' }))
          ];
          setFees(initialMerged);
        }
      } catch (err) {
        console.error('Failed to load dynamic fees:', err);
        const initialMerged: FeeItem[] = [
          ...fallbackSemiEnglishFees.map(f => ({ ...f, medium: 'semi-english' })),
          ...fallbackEnglishMediumFees.map(f => ({ ...f, medium: 'english' }))
        ];
        setFees(initialMerged);
      } finally {
        setLoading(false);
      }
    }
    loadFees();
  }, []);

  const activeFees = fees.filter(f => f.medium === activeMedium);

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-24">
            <h1 className="text-5xl lg:text-7xl font-black text-brand-navy mb-8 tracking-tighter">Fees Structure.</h1>
            <p className="text-xl text-slate-500 max-w-3xl font-medium leading-relaxed">
                Transparent and straightforward pricing for the Academic Year 2026-2027. Choose between our Semi-English or English Medium tracks in the tab below to view standard rates.
            </p>
        </div>

        {/* Tab Controllers */}
        <div className="flex p-1.5 bg-slate-100 rounded-2xl max-w-md mb-12 border border-slate-200/50">
          <button
            onClick={() => setActiveMedium('semi-english')}
            className={`flex-1 py-3 px-6 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeMedium === 'semi-english'
                ? 'bg-white text-brand-navy shadow-md shadow-slate-200/80 scale-[1.02]'
                : 'text-slate-500 hover:text-brand-navy'
            }`}
          >
            Semi-English Medium
          </button>
          <button
            onClick={() => setActiveMedium('english')}
            className={`flex-1 py-3 px-6 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeMedium === 'english'
                ? 'bg-white text-brand-navy shadow-md shadow-slate-200/80 scale-[1.02]'
                : 'text-slate-500 hover:text-brand-navy'
            }`}
          >
            English Medium
          </button>
        </div>

        {/* Fee Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400">
            <p className="animate-pulse tracking-widest text-xs font-bold uppercase">Loading Dynamic Fee Calendars...</p>
          </div>
        ) : (
          <div className="mb-40 overflow-hidden rounded-[40px] border border-slate-100 shadow-2xl bg-white animate-fade-in">
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-brand-navy text-white text-xs font-black uppercase tracking-[0.2em]">
                              <th className="px-8 py-6">Academic Grade</th>
                              {activeMedium === 'semi-english' && (
                                <>
                                  <th className="px-8 py-6 text-center">Admission Fees</th>
                                  <th className="px-8 py-6 text-center">Reg/Other Fees</th>
                                </>
                              )}
                              <th className="px-8 py-6 text-center">Class Fee (Monthly)</th>
                              <th className="px-8 py-6 text-center">Term Fees</th>
                              <th className="px-8 py-6 text-center bg-brand-accent">Total Annual Fees</th>
                          </tr>
                      </thead>
                      <tbody className="text-slate-600 font-bold">
                          {activeFees.map((item, idx) => (
                             <tr key={item.id || item.class} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100 transition-colors`}>
                                  <td className="px-8 py-6 text-brand-navy text-base">{item.class}</td>
                                  {activeMedium === 'semi-english' && (
                                    <>
                                      <td className="px-8 py-6 text-center font-medium">{item.admission}</td>
                                      <td className="px-8 py-6 text-center font-medium">{item.regOther}</td>
                                    </>
                                  )}
                                  <td className="px-8 py-6 text-center font-medium">{item.monthly}</td>
                                  <td className="px-8 py-6 text-center font-medium">{item.term}</td>
                                  <td className="px-8 py-6 text-center bg-brand-accent/5 text-brand-navy font-black text-lg">{item.total}</td>
                             </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
        )}

      </div>
    </div>
  );
}
