import React from 'react';
import { Member } from '../types';
import { PLACEHOLDER_AVATAR } from '../constants';

interface MemberRowProps {
  member: Member;
  index: number;
  isReadOnly: boolean;
  isAdmin: boolean;
  onUpdate: (id: string, field: keyof Member, value: any) => void;
  onRemove: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
}

export const MemberRow: React.FC<MemberRowProps> = ({ member, index, isReadOnly, isAdmin, onUpdate, onRemove, onImageUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isReadOnly && e.target.files && e.target.files[0]) {
      onImageUpload(member.id, e.target.files[0]);
    }
  };

  return (
    <div className={`grid grid-cols-[25px_35px_1.5fr_1fr_0.8fr_0.8fr_25px_30px] gap-2 items-center p-2 rounded-lg mb-1.5 border shadow-sm transition-all group ${member.isManager ? 'bg-slate-900 border-amber-500/50 shadow-amber-500/10' : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md'}`}>
      <span className={`text-center font-bold text-xs ${member.isManager ? 'text-amber-500' : 'text-gray-500'}`}>{index + 1}</span>
      
      <label className={`w-8 h-8 rounded-full border-2 overflow-hidden relative transition-all ${isReadOnly ? '' : 'cursor-pointer hover:opacity-90'} ${member.photo ? (member.isManager ? 'border-amber-500 ring-2 ring-amber-500/20' : 'ring-2 ring-blue-100 border-gray-100') : 'bg-slate-100'}`}>
        <img 
          src={member.photo || PLACEHOLDER_AVATAR} 
          alt="User" 
          className="w-full h-full object-cover"
        />
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isReadOnly} />
      </label>

      {/* Name Input with Special Effects for Manager */}
      <div className="relative w-full">
        <input 
          type="text" 
          value={member.name}
          onChange={(e) => onUpdate(member.id, 'name', e.target.value)}
          placeholder="নাম"
          readOnly={isReadOnly}
          className={`w-full p-1.5 border rounded-md transition-all shadow-sm ${
            member.isManager 
              ? 'bg-slate-800 border-amber-600/50 text-amber-400 font-black text-sm placeholder-amber-700/50 focus:border-amber-400 focus:ring-amber-500' 
              : 'bg-white border-gray-300 text-gray-900 font-semibold text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400'
          } ${isReadOnly ? 'bg-opacity-50 cursor-not-allowed focus:ring-0' : 'focus:outline-none'}`}
        />
        {member.isManager && (
           <div className="absolute top-0 right-0 -mt-2 -mr-1 animate-bounce">
              <i className="fas fa-crown text-amber-400 drop-shadow-md text-[10px]"></i>
           </div>
        )}
      </div>

      <input 
        type="text" 
        value={member.phone}
        onChange={(e) => onUpdate(member.id, 'phone', e.target.value)}
        placeholder="মোবাইল"
        readOnly={isReadOnly}
        className={`w-full p-1.5 border rounded-md text-[11px] transition-all shadow-sm ${
           member.isManager ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-300 text-gray-800'
        } ${isReadOnly ? 'opacity-70 cursor-not-allowed' : 'focus:border-blue-500 focus:outline-none'}`}
      />

      <input 
        type="number" 
        value={member.meal}
        onChange={(e) => onUpdate(member.id, 'meal', parseFloat(e.target.value) || 0)}
        step="0.5"
        placeholder="0"
        readOnly={isReadOnly}
        className={`w-full p-1.5 border font-bold text-center rounded-md text-xs transition-all shadow-sm ${
           member.isManager ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'
        } ${isReadOnly ? 'opacity-70 cursor-not-allowed' : 'focus:border-blue-500 focus:outline-none'}`}
        onFocus={(e) => !isReadOnly && e.target.select()}
      />

      <input 
        type="number" 
        value={member.deposit}
        onChange={(e) => onUpdate(member.id, 'deposit', parseFloat(e.target.value) || 0)}
        placeholder="0"
        readOnly={isReadOnly}
        className={`w-full p-1.5 border font-bold text-center rounded-md text-xs transition-all shadow-sm ${
           member.isManager ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-white border-gray-300 text-gray-900'
        } ${isReadOnly ? 'opacity-70 cursor-not-allowed' : 'focus:border-blue-500 focus:outline-none'}`}
        onFocus={(e) => !isReadOnly && e.target.select()}
      />

      {/* Only Admin can toggle manager status directly, but mainly via modal now */}
      <div 
        className={`text-center transition-all transform ${
          isAdmin 
            ? 'cursor-pointer hover:scale-110' 
            : 'cursor-default opacity-50'
        } ${
          member.isManager 
            ? 'text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)] text-sm' 
            : 'text-gray-300 hover:text-amber-400 text-xs'
        }`}
        onClick={() => isAdmin && onUpdate(member.id, 'isManager', !member.isManager)}
        title={isAdmin ? "Toggle Manager" : "Manager Status"}
      >
        <i className="fas fa-crown"></i>
      </div>

      <button 
        className={`p-1 rounded-full transition-colors text-xs ${
          isReadOnly 
             ? 'text-gray-300 cursor-not-allowed' 
             : 'text-red-300 hover:text-red-500 hover:bg-red-50'
        }`}
        onClick={() => !isReadOnly && onRemove(member.id)}
        disabled={isReadOnly}
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};