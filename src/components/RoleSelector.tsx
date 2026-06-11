import React from 'react';
import { Shield, User, Users, ChevronDown } from 'lucide-react';
import { TeamMember } from '../types';

interface RoleSelectorProps {
  members: TeamMember[];
  activeMember: TeamMember;
  onSelectMember: (member: TeamMember) => void;
}

export default function RoleSelector({
  members,
  activeMember,
  onSelectMember
}: RoleSelectorProps) {
  const isLeader = activeMember.role === 'Leader';

  return (
    <div id="role-selector" className="bg-slate-900 text-slate-100 px-5 py-3 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-md border border-slate-800">
      {/* Brand & Concept Context */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center border border-indigo-400/20 text-indigo-400">
          <Shield className="w-4.5 h-4.5" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-slate-100 tracking-tight leading-none">Simulation Sandbox Role</h2>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Ganti pengguna di bawah untuk mensimulasikan alur kerja tim</p>
        </div>
      </div>

      {/* Selector pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono mr-1">Bertindak Sebagai:</span>
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {members.map(member => {
            const isActive = member.id === activeMember.id;
            const isUserLeader = member.role === 'Leader';

            return (
              <button
                key={member.id}
                id={`role-btn-${member.id}`}
                onClick={() => onSelectMember(member)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold transition duration-150 cursor-pointer
                  ${isActive 
                    ? isUserLeader 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
                  }
                `}
              >
                {isUserLeader ? (
                  <Shield className="w-3 h-3 text-white" />
                ) : (
                  <User className="w-3 h-3" />
                )}
                <span>{member.name} {isUserLeader ? '(Leader)' : ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Warning Alert about Offline Sim */}
      <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-indigo-500/10">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
        <p className="text-[9px] text-slate-300 font-mono">
          Aktif: <span className="text-indigo-300 font-bold">{isLeader ? 'Pemantauan Berjalan' : 'Papan Tugas Individu'}</span>
        </p>
      </div>
    </div>
  );
}
