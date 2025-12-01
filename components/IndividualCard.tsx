import React, { forwardRef } from 'react';
import { CalculatedMember, CalculationResult, FixedCosts } from '../types';
import { PLACEHOLDER_AVATAR } from '../constants';

interface IndividualCardProps {
  member: CalculatedMember | null;
  result: CalculationResult | null;
  adminPhoto: string;
  signature: string;
  fixedCosts: FixedCosts;
}

export const IndividualCard = forwardRef<HTMLDivElement, IndividualCardProps>(
  ({ member, result, adminPhoto, signature, fixedCosts }, ref) => {
    if (!member || !result) return null;

    const { stats } = result;

    // Detailed Fixed Cost Breakdown
    const fixedDetails = [
      { label: 'বাসা ভাড়া', value: fixedCosts.rent },
      { label: 'খালা বিল', value: fixedCosts.maid },
      { label: 'গ্যাস বিল', value: fixedCosts.gas },
      { label: 'ওয়াই ফাই', value: fixedCosts.wifi },
      { label: 'মশলা', value: fixedCosts.masala },
      { label: 'অন্যান্য', value: fixedCosts.utility },
    ];
    
    // Explicit calculation string for transparency
    const calculationFormula = `(${member.meal} Meals × ${stats.mealRate.toFixed(2)} Rate) + ${Math.round(member.fixedCostShare)} Fixed = ${Math.round(member.totalCost)}`;

    const getStatus = () => {
      if (member.balance > 1) return { text: `পাবে (Receivable): ${Math.round(member.balance)} টাকা`, colorClass: 'bg-emerald-600 text-white border-emerald-700' };
      if (member.balance < -1) return { text: `দিবে (Payable): ${Math.round(Math.abs(member.balance))} টাকা`, colorClass: 'bg-rose-600 text-white border-rose-700' };
      return { text: 'হিসাব সমান (Settled)', colorClass: 'bg-slate-600 text-white border-slate-700' };
    };

    const status = getStatus();

    return (
      <div 
        ref={ref} 
        className="w-[700px] bg-white text-slate-900 relative box-border"
        style={{ position: 'absolute', top: '-9999px', left: '-9999px', padding: '40px' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-5 mb-8">
            <div className="flex items-center gap-5">
                <img src={adminPhoto} className="w-14 h-14 rounded-full border-2 border-slate-800 object-cover shadow-sm" alt="Admin" />
                <div>
                    <h1 className="text-4xl font-black uppercase text-slate-900 tracking-tighter leading-none">Happy Family</h1>
                    <p className="text-sm font-bold tracking-[0.35em] text-slate-500 uppercase mt-1">Mess Management Pro</p>
                </div>
            </div>
            <div className="text-right pt-2">
                <div className="bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest inline-block mb-2 shadow-sm">Monthly Statement</div>
                <div className="text-slate-500 text-sm font-mono font-bold tracking-wide">{result.generatedAt}</div>
            </div>
        </div>

        {/* Member Profile */}
        <div className="flex items-center gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative">
                <img 
                src={member.photo || PLACEHOLDER_AVATAR} 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                alt={member.name}
                crossOrigin="anonymous"
                />
                {member.isManager && (
                    <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                        <i className="fas fa-crown text-xs"></i>
                    </div>
                )}
            </div>
            <div className="flex-1">
                <h2 className="text-3xl font-black text-slate-900 mb-1">{member.name}</h2>
                <p className="text-base text-slate-500 font-mono font-medium flex items-center gap-2">
                    <i className="fas fa-phone-alt text-xs"></i> {member.phone || 'N/A'}
                </p>
            </div>
            <div className="text-right">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Status</div>
                {member.isManager ? (
                     <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-md uppercase border border-amber-200">Manager</span>
                ) : (
                     <span className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-md uppercase">Member</span>
                )}
            </div>
        </div>

        {/* Financial Table */}
        <div className="mb-8 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                        <th className="py-3 px-4 text-left font-bold">Description</th>
                        <th className="py-3 px-4 text-right font-bold">Details / Rate</th>
                        <th className="py-3 px-4 text-right font-bold">Amount (Tk)</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    <tr className="border-b border-gray-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-700">Meal Cost Calculation</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-500">{member.meal} meals × {stats.mealRate.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">{Math.round(member.mealCost)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-700">Fixed Cost Share</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-500">Per Person Share</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">{Math.round(member.fixedCostShare)}</td>
                    </tr>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        <td className="py-4 px-4 font-black text-slate-900 uppercase text-xs tracking-wide">Total Expenses (খরচ)</td>
                        <td className="py-4 px-4 text-right text-xs font-mono text-slate-400">{Math.round(member.mealCost)} + {Math.round(member.fixedCostShare)}</td>
                        <td className="py-4 px-4 text-right font-black text-lg text-slate-900">{Math.round(member.totalCost)}</td>
                    </tr>
                    <tr>
                        <td className="py-4 px-4 font-bold text-emerald-600 border-b border-gray-100">Less: Deposit (জমা)</td>
                        <td className="py-4 px-4 text-right border-b border-gray-100"></td>
                        <td className="py-4 px-4 text-right font-bold text-emerald-600 text-lg border-b border-gray-100">(-) {member.deposit}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {/* Calculation Logic Box */}
        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-center mb-8">
            <span className="block text-[10px] uppercase font-bold text-blue-400 tracking-[0.2em] mb-2">Cost Calculation Formula</span>
            <div className="font-mono text-sm font-bold text-blue-900 bg-white inline-block px-4 py-2 rounded-lg shadow-sm border border-blue-100">
                {calculationFormula}
            </div>
        </div>

        {/* Fixed Cost Breakdown Grid */}
        <div className="mb-8">
             <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] mb-3 pl-1">Fixed Cost Breakdown (Total: {Math.round(stats.totalFixedCost)})</span>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-3 gap-y-3 gap-x-2">
                    {fixedDetails.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-200 pb-1 last:border-0 last:pb-0">
                            <span className="text-slate-500 font-semibold">{item.label}</span>
                            <span className="font-mono font-bold text-slate-700">{item.value}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-300 text-center">
                    <span className="text-xs font-bold text-slate-600">জনপ্রতি ফিক্সড: {Math.round(stats.fixedPerMember)} টাকা</span>
                </div>
             </div>
        </div>

        {/* Final Status */}
        <div className={`text-center p-5 rounded-xl shadow-lg border-t-4 ${status.colorClass} mb-12`}>
             <div className="text-2xl font-black uppercase tracking-tight">{status.text}</div>
        </div>

        {/* Footer / Signature */}
        <div className="flex justify-between items-end pt-6 border-t-2 border-slate-100">
             <div className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
                Verified By<br/>
                Admin Ornov Bin Tusher Jewel
             </div>
             
             <div className="text-center relative">
                {signature && (
                    <img 
                        src={signature} 
                        className="h-16 absolute bottom-8 left-1/2 transform -translate-x-1/2 mix-blend-multiply opacity-90 pointer-events-none" 
                        alt="Sig" 
                    />
                )}
                <div className="w-56 border-t-2 border-slate-900 mb-2 relative z-10"></div>
                <div className="font-black text-sm text-slate-900 uppercase tracking-wide">{stats.managerName}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Manager Signature</div>
             </div>
        </div>
      </div>
    );
  }
);