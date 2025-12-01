import { forwardRef } from 'react';
import { CalculationResult, CalculatedMember, FixedCosts } from '../types';
import { PLACEHOLDER_AVATAR } from '../constants';

interface ReportTemplateProps {
  result: CalculationResult | null;
  adminPhoto: string;
  signature: string;
  fixedCosts: FixedCosts;
  onIndividualDownload: (member: CalculatedMember) => void;
}

export const ReportTemplate = forwardRef<HTMLDivElement, ReportTemplateProps>(
  ({ result, adminPhoto, signature, fixedCosts, onIndividualDownload }, ref) => {
    if (!result) return null;

    const { stats, members } = result;
    const fixedBreakdown = `বাসা ভাড়া (${fixedCosts.rent}) + খালা (${fixedCosts.maid}) + গ্যাস (${fixedCosts.gas}) + ওয়াইফাই (${fixedCosts.wifi}) + মশলা (${fixedCosts.masala}) + অন্যান্য (${fixedCosts.utility}) = মোট ${Math.round(stats.totalFixedCost)} টাকা (জনপ্রতি ${Math.round(stats.fixedPerMember)} টাকা)`;

    const receivables = members.filter(m => m.balance > 1);
    const payables = members.filter(m => m.balance < -1);

    return (
      <div className="mt-8 overflow-auto">
        <div 
          ref={ref} 
          id="report-content"
          className="bg-white w-full max-w-[800px] mx-auto p-10 box-border border border-gray-200 relative shadow-2xl"
        >
          {/* Header Section */}
          <div className="flex justify-between border-b-[3px] border-primary pb-5 mb-8 items-end relative">
            <img 
              src={adminPhoto} 
              className="absolute -top-5 left-0 w-[80px] h-[80px] rounded-full object-cover border-[4px] border-white shadow-lg bg-white z-10"
              alt="Admin" 
            />
            <div className="ml-[95px] flex flex-col justify-end h-full">
              <h1 className="text-[2.75rem] font-black text-slate-900 leading-none uppercase tracking-tighter">Happy Family</h1>
              <span className="text-sm text-primary tracking-[0.35em] uppercase font-extrabold mt-1">Mess Management Pro</span>
            </div>
            <div className="text-right text-sm text-slate-600 flex flex-col justify-end h-full min-h-[80px]">
              <div className="font-mono font-semibold text-slate-500 mb-2">{result.generatedAt}</div>
              <div className="text-slate-900 font-bold uppercase tracking-widest text-[10px] bg-slate-100 border border-slate-300 px-3 py-1 rounded-full self-end">
                Monthly Statement
              </div>
            </div>
          </div>

          {/* Highlights - Animated Black Info Boxes */}
          <div className="grid grid-cols-3 gap-5 mb-10">
            {/* Meal Rate Card */}
            <div className="bg-slate-900 p-5 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden group animate-fade-in-up flex flex-col justify-between h-32" style={{animationDelay: '0ms'}}>
               <div className="absolute -right-6 -top-6 w-28 h-28 bg-slate-700 rounded-full opacity-30 blur-2xl group-hover:bg-slate-600 transition-colors"></div>
               <div className="absolute right-3 top-3 opacity-20">
                  <i className="fas fa-chart-line text-4xl text-white"></i>
               </div>
               <small className="relative z-10 block text-slate-400 text-[11px] uppercase font-bold tracking-[0.2em]">মিল রেট</small>
               <div className="relative z-10 text-4xl font-black text-white font-sans tracking-tight flex items-baseline gap-1 mt-auto">
                 {stats.mealRate.toFixed(2)}
                 <span className="text-sm font-medium text-slate-500">tk</span>
               </div>
            </div>

            {/* Fixed Card */}
            <div className="bg-slate-900 p-5 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden group animate-fade-in-up flex flex-col justify-between h-32" style={{animationDelay: '100ms'}}>
               <div className="absolute -right-6 -top-6 w-28 h-28 bg-blue-900 rounded-full opacity-30 blur-2xl group-hover:bg-blue-800 transition-colors"></div>
               <div className="absolute right-3 top-3 opacity-20">
                  <i className="fas fa-home text-4xl text-white"></i>
               </div>
               <small className="relative z-10 block text-slate-400 text-[11px] uppercase font-bold tracking-[0.2em]">ফিক্সড (জনপ্রতি)</small>
               <div className="relative z-10 text-4xl font-black text-white font-sans tracking-tight flex items-baseline gap-1 mt-auto">
                 {Math.round(stats.fixedPerMember)}
                 <span className="text-sm font-medium text-slate-500">tk</span>
               </div>
            </div>

            {/* Total Card - Premium Black/Gold */}
            <div className="bg-black p-5 rounded-xl shadow-xl border border-gray-800 relative overflow-hidden group animate-fade-in-up flex flex-col justify-between h-32" style={{animationDelay: '200ms'}}>
               <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-black opacity-90"></div>
               <div className="absolute -right-6 -top-6 w-28 h-28 bg-amber-600 rounded-full opacity-20 blur-xl animate-pulse-slow"></div>
               <div className="absolute right-3 top-3 opacity-20 text-amber-500">
                  <i className="fas fa-coins text-4xl"></i>
               </div>
               <small className="relative z-10 block text-amber-500 text-[11px] uppercase font-bold tracking-[0.2em]">সর্বমোট খরচ</small>
               <div className="relative z-10 text-4xl font-black text-white font-sans tracking-tight flex items-baseline gap-1 mt-auto">
                 {Math.round(stats.grandTotalCost).toLocaleString()}
                 <span className="text-sm font-medium text-slate-500">tk</span>
               </div>
            </div>
          </div>

          {/* Table */}
          <div className="mb-10 rounded-t-xl overflow-hidden border border-gray-200">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="py-4 px-3 text-left pl-4 font-bold uppercase tracking-wider text-[11px] w-[25%]">সদস্য বিবরণ</th>
                  <th className="py-4 px-3 text-center font-bold uppercase tracking-wider text-[11px]">মিল</th>
                  <th className="py-4 px-3 text-center font-bold uppercase tracking-wider text-[11px]">মিল খরচ</th>
                  <th className="py-4 px-3 text-center font-bold uppercase tracking-wider text-[11px]">ফিক্সড</th>
                  <th className="py-4 px-3 text-center font-bold uppercase tracking-wider text-[11px]">মোট খরচ</th>
                  <th className="py-4 px-3 text-center font-bold uppercase tracking-wider text-[11px]">জমা</th>
                  <th className="py-4 px-3 text-center font-bold uppercase tracking-wider text-[11px]">অবস্থা</th>
                  <th className="py-4 px-3 text-center font-bold uppercase tracking-wider text-[11px] no-print w-[40px]">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((m, idx) => (
                  <tr key={m.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                    <td className="py-3 px-3 pl-4 align-middle">
                      <div className="flex items-center gap-3">
                        <img 
                          src={m.photo || PLACEHOLDER_AVATAR} 
                          className="w-9 h-9 rounded-full border border-gray-200 object-cover shadow-sm" 
                          alt="p"
                          crossOrigin="anonymous" 
                        />
                        <div className="flex flex-col justify-center">
                          <div className="font-bold text-slate-800 text-sm leading-tight">{m.name}</div>
                          {m.isManager && <span className="mt-0.5 bg-slate-800 text-white text-[9px] px-1.5 py-[1px] rounded-[3px] font-bold uppercase tracking-wider w-fit">Manager</span>}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3 align-middle font-semibold text-slate-600 text-sm">{m.meal}</td>
                    <td className="text-center py-3 px-3 align-middle font-medium text-slate-600">{Math.round(m.mealCost)}</td>
                    <td className="text-center py-3 px-3 align-middle font-medium text-slate-600">{Math.round(m.fixedCostShare)}</td>
                    <td className="text-center py-3 px-3 align-middle font-bold text-slate-900 text-sm">{Math.round(m.totalCost)}</td>
                    <td className="text-center py-3 px-3 align-middle font-semibold text-primary">{m.deposit}</td>
                    <td className="text-center py-3 px-3 align-middle">
                      {m.balance > 1 ? (
                        <span className="inline-block min-w-[80px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">পাবে {Math.round(m.balance)}</span>
                      ) : m.balance < -1 ? (
                        <span className="inline-block min-w-[80px] bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">দিবে {Math.round(Math.abs(m.balance))}</span>
                      ) : (
                        <span className="inline-block min-w-[80px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">সমান</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-3 align-middle no-print">
                      <button 
                        onClick={() => onIndividualDownload(m)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center transition-all transform hover:scale-110"
                        title="Download Individual PDF"
                      >
                        <i className="fas fa-file-pdf"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 font-bold text-white text-sm border-t-2 border-slate-800">
                  <td className="py-4 px-3 pl-4 text-left uppercase tracking-wider text-xs text-slate-400">Total Calculation</td>
                  <td className="text-center py-4 px-3 text-slate-200">{stats.totalMeals}</td>
                  <td className="text-center py-4 px-3 text-slate-200">{Math.round(stats.totalMealCost)}</td>
                  <td className="text-center py-4 px-3 text-slate-200">{Math.round(stats.totalFixedCost)}</td>
                  <td className="text-center py-4 px-3 text-amber-400 text-base">{Math.round(stats.grandTotalCost)}</td>
                  <td className="text-center py-4 px-3 text-slate-200">{stats.totalDeposit}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary Lists */}
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="border border-rose-100 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col h-full">
              <div className="bg-rose-50 text-rose-800 px-5 py-3 text-xs font-bold uppercase border-b border-rose-100 tracking-wide flex justify-between items-center">
                <span><i className="fas fa-arrow-down mr-2"></i> বকেয়া তালিকা (দিবে)</span>
                <span className="bg-rose-200 text-rose-900 px-2 py-0.5 rounded text-[10px]">{payables.length}</span>
              </div>
              <div className="p-5 flex-1">
                {payables.length === 0 && <div className="text-xs text-gray-400 italic text-center py-4">সবাই ক্লিয়ার!</div>}
                {payables.map(m => (
                  <div key={m.id} className="flex justify-between items-center text-xs py-2.5 border-b border-dashed border-rose-100 last:border-0 text-slate-600 hover:bg-rose-50/50 px-2 rounded transition-colors">
                    <span className="font-semibold">{m.name}</span>
                    <strong className="text-rose-600 font-mono text-sm">{Math.round(Math.abs(m.balance))}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-emerald-100 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col h-full">
              <div className="bg-emerald-50 text-emerald-800 px-5 py-3 text-xs font-bold uppercase border-b border-emerald-100 tracking-wide flex justify-between items-center">
                <span><i className="fas fa-arrow-up mr-2"></i> ফেরত তালিকা (পাবে)</span>
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[10px]">{receivables.length}</span>
              </div>
              <div className="p-5 flex-1">
                {receivables.length === 0 && <div className="text-xs text-gray-400 italic text-center py-4">কেউ পাবে না!</div>}
                {receivables.map(m => (
                  <div key={m.id} className="flex justify-between items-center text-xs py-2.5 border-b border-dashed border-emerald-100 last:border-0 text-slate-600 hover:bg-emerald-50/50 px-2 rounded transition-colors">
                    <span className="font-semibold">{m.name}</span>
                    <strong className="text-emerald-600 font-mono text-sm">{Math.round(m.balance)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Cost Breakdown */}
          <div className="mt-8">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">বিস্তারিত ফিক্সড খরচ</span>
            <div className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
              * {fixedBreakdown}
            </div>
          </div>

          {/* Notice Box */}
          <div className="mt-6 p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl flex items-start gap-4 shadow-sm">
            <div className="text-xl text-amber-500 mt-0.5"><i className="fas fa-bullhorn"></i></div>
            <div>
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide mb-1">নোটিশ</div>
              <div className="text-sm font-medium text-slate-800 leading-relaxed">
                বিশেষ বিজ্ঞপ্তি: আগামী ১০ তারিখের মধ্যে সকল সদস্যকে তাদের বকেয়া টাকা পরিশোধ করার জন্য বিশেষভাবে অনুরোধ করা হলো।
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="mt-16 flex justify-end px-4">
            <div className="text-center min-w-[200px]">
              {signature && <img src={signature} className="h-[50px] mx-auto mb-[-15px] block mix-blend-multiply opacity-85" alt="Sig" />}
              <div className="border-t border-slate-900 w-full mt-4 mb-3"></div>
              <div className="font-bold text-sm uppercase text-slate-900 tracking-wider">{stats.managerName}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Manager, Happy Family Mess</div>
            </div>
          </div>

          <div className="text-center mt-12 pt-6 border-t border-gray-100 text-[9px] text-slate-300 font-bold uppercase tracking-[0.4em]">
            Made by Mess Manager Pro
          </div>
        </div>
      </div>
    );
  }
);