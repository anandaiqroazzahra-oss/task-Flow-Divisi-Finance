import React from 'react';
import { 
  ShieldCheck, TrendingUp, Coins, Lock, 
  Calendar, Users, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { TeamMember } from '../types';

interface WelcomePortalProps {
  members: TeamMember[];
  activeMember: TeamMember;
  onSelectMember: (member: TeamMember) => void;
  onEnterApp: () => void;
  theme: 'light' | 'dark';
}

export default function WelcomePortal({
  members,
  activeMember,
  onSelectMember,
  onEnterApp,
  theme
}: WelcomePortalProps) {
  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans selection:bg-indigo-100 antialiased py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300
      ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}
    `}>
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Coins className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">DIVISI FINANCE</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">PT Global Sinergi Utama</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs font-mono font-bold bg-slate-200/50 dark:bg-slate-800/80 border border-slate-200/20 px-3 py-1.5 rounded-lg text-indigo-650 dark:text-indigo-350">
            Sabtu, 06 Juni 23:23:00 WIB
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full my-auto py-4 space-y-12">
        {/* Slogan and Heading */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            Portal Absensi & Monitoring Tugas Terintegrasi
          </span>
          <h2 className="text-3.5xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Task Flow <span className="text-indigo-650 dark:text-indigo-400 bg-linear-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent">Divisi Finance</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
            Atur efisiensi arus kerja harian keuangan, pelaporan pajak, rekonsiliasi transfer, audit internal, serta asuransi likuiditas kas divisi harian secara tepat waktu.
          </p>
        </div>

        {/* Feature Bento Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/10 text-amber-500">
              <Lock className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Checklist Berbatas 21:00 WIB
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-405 mt-1 leading-relaxed">
                Untuk menjaga kedisiplinan pelaporan, tugas harian hanya dapat dichecklist maksimal pukul <strong>21:00 WIB</strong> di hari yang sama. Setelah itu, status terkunci.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Pemantauan Real-time & Sinergis
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-405 mt-1 leading-relaxed">
                Manajer (Leader) memegang kendali pengawasan visual dari dashboard grafik progres, sementara masing-masing staff memperbarui progress secara instan.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-550/10 flex items-center justify-center border border-indigo-500/10 text-indigo-500">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Alokasi Jam Kerja & Kalender
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-405 mt-1 leading-relaxed">
                Rencanakan jam mulai dan jam selesai untuk setiap tugas tim, menghindari duplikasi jadwal harian, serta melacak kegiatan rutin divisi keuangan.
              </p>
            </div>
          </div>
        </div>

        {/* PROFILE SELECTION PORTAL SECTION */}
        <div className="bg-slate-900 dark:bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-3xl mt-6 shadow-xl text-center space-y-6">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase font-mono">SIMULATION PORTAL SELECTOR</span>
            <h3 className="text-lg sm:text-2xl font-black text-slate-100 mt-1">Pilih Profil untuk Melanjutkan</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xl mx-auto">
              Simulasikan navigasi aplikasi baik sebagai Manajer (Leader) Keuangan untuk delegasi tugas, atau sebagai Staf Keuangan pelapor kerja harian.
            </p>
          </div>

          {/* Profile Card List */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 max-w-4xl mx-auto pt-3">
            {members.map((member) => {
              const isSelected = member.id === activeMember.id;
              const isLead = member.role === 'Leader';
              return (
                <button
                  key={member.id}
                  onClick={() => onSelectMember(member)}
                  className={`group relative p-3 sm:p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-2.5
                    ${isSelected 
                      ? isLead
                        ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40 text-white' 
                        : 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 text-white'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    }
                  `}
                >
                  {/* Photo or Avatar (Mempunyai Ratio 3:4 & Diperbesar) */}
                  <div className="relative">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className={`aspect-[3/4] w-16 sm:w-20 rounded-xl object-cover border-2 shadow-sm transition group-hover:scale-105 duration-200
                          ${isSelected
                            ? isLead ? 'border-indigo-400 ring-2 ring-indigo-550/30' : 'border-emerald-400 ring-2 ring-emerald-555/30'
                            : 'border-slate-700 group-hover:border-slate-500'
                          }
                        `}
                      />
                    ) : (
                      <div className={`aspect-[3/4] w-16 sm:w-20 rounded-xl ${member.avatarColor} text-sm font-black flex flex-col items-center justify-center border-2 shadow-sm transition group-hover:scale-105 duration-200
                        ${isSelected
                          ? isLead ? 'border-indigo-400' : 'border-emerald-400'
                          : 'border-slate-700 group-hover:border-slate-500'
                        }
                      `}>
                        <span className="text-sm font-extrabold tracking-wider">{member.name.split(' ').map(n=>n[0]).join('')}</span>
                        <span className="text-[7.5px] opacity-75 font-mono tracking-tight uppercase mt-1">FINANCE</span>
                      </div>
                    )}
                    {isLead && (
                      <span className="absolute -top-1 -right-1 bg-indigo-600 text-white px-1 py-0.5 rounded text-[8px] font-bold font-mono tracking-wide shadow-xs">
                        CEO
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-[11px] sm:text-xs font-bold leading-tight line-clamp-1">{member.name}</h4>
                    <p className="text-[9px] text-slate-400 font-mono tracking-tight leading-none">{member.position}</p>
                  </div>

                  {isSelected && (
                    <div className={`mt-auto px-2 py-0.5 rounded-full text-[8.5px] font-extrabold tracking-wide font-mono uppercase bg-opacity-15
                      ${isLead 
                        ? 'bg-indigo-400/20 text-indigo-300' 
                        : 'bg-emerald-400/20 text-emerald-300'
                      }
                    `}>
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA Action button to proceed */}
          <div className="pt-2">
            <button
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-98 transition text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/35 cursor-pointer"
            >
              <span>Masuk Beranda Dashboard ({activeMember.name})</span>
              <ArrowRight className="w-4 h-4 text-white/95 animate-pulse" />
            </button>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full border-t border-slate-200/10 dark:border-slate-800/40 pt-6 text-center space-y-1 mt-12">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          Task Flow Divisi Finance v2.0 &bull; Secure Enterprise Ecosystem &bull; Waktu server: 23:23 WIB
        </p>
        <p className="text-[9px] text-slate-400/70 dark:text-slate-500/70">
          Dirancang khusus untuk monitoring tugas, kepatuhan batas kuncian laporan 21:00, serta simplifikasi pembagian tugas harian departemen keuangan.
        </p>
      </footer>
    </div>
  );
}
