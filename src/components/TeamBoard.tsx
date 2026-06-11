import React, { useState } from 'react';
import { 
  CheckCircle, Clock, Calendar, CheckSquare, 
  HelpCircle, ClipboardList, AlertTriangle, Send, RefreshCw, MessageCircle, Check, Pencil, Lock
} from 'lucide-react';
import { Task, TeamMember } from '../types';

const isTaskExpired = (task: Task): boolean => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');
  const currentDateStr = `${currentYear}-${currentMonth}-${currentDay}`;
  const currentHours = now.getHours();

  const isPastDay = currentDateStr > task.dueDate;
  const isTodayPast9PM = currentDateStr === task.dueDate && currentHours >= 21;
  return isPastDay || isTodayPast9PM;
};

interface TeamBoardProps {
  activeMember: TeamMember;
  tasks: Task[];
  onToggleStatus: (taskId: string, notes?: string) => void;
  selectedDate: string; // YYYY-MM-DD
  isTaskActiveOnDate: (task: Task, dateStr: string) => boolean;
  onEditTask?: (task: Task) => void;
  onReallocateTime?: (task: Task) => void;
}

export default function TeamBoard({
  activeMember,
  tasks,
  onToggleStatus,
  selectedDate,
  isTaskActiveOnDate,
  onEditTask,
  onReallocateTime
}: TeamBoardProps) {
  const [activeTab, setActiveTab] = useState<'hari-ini' | 'semua'>('hari-ini');
  
  // Handlers for the complete validation modal
  const [validatingTaskId, setValidatingTaskId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Get tasks assigned explicitly to this member OR assigned to 'all'
  const myTotalTasks = tasks.filter(t => t.assignedToId === activeMember.id || t.assignedToId === 'all');
  
  // Filter for 'Hari Ini' (tasks targeting the calendar's active day, or repeating on this day)
  const myTasksToday = myTotalTasks.filter(t => isTaskActiveOnDate(t, selectedDate));

  const displayedTasks = activeTab === 'hari-ini' ? myTasksToday : myTotalTasks;

  // Personal statistics
  const completedCount = myTotalTasks.filter(t => t.status === 'Selesai').length;
  const totalCount = myTotalTasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Handle starting completion
  const handleTickCheck = (task: Task) => {
    if (isTaskExpired(task)) {
      alert(`Gagal! Batas waktu checklist harian tugas ini telah melewati pukul 21:00 WIB pada hari target (${task.dueDate}).`);
      return;
    }
    if (task.status === 'Selesai') {
      // If already done, toggle back to pending without notes modal
      onToggleStatus(task.id);
    } else {
      // Trigger notes proof dialog
      setValidatingTaskId(task.id);
      setCompletionNotes('');
    }
  };

  const submitCompletionProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatingTaskId) return;

    onToggleStatus(validatingTaskId, completionNotes.trim() || 'Tugas telah diselesaikan oleh anggota.');
    setValidatingTaskId(null);
    setCompletionNotes('');
  };

  const pendingTasks = displayedTasks.filter(t => t.status !== 'Selesai');
  const completedTasks = displayedTasks.filter(t => t.status === 'Selesai');

  const renderTaskCard = (task: Task) => {
    const isDone = task.status === 'Selesai';
    const isShared = task.assignedToId === 'all';
    const expired = isTaskExpired(task);

    return (
      <div 
        key={task.id} 
        id={`task-card-member-${task.id}`}
        className={`group bg-white rounded-xl border p-3.5 relative shadow-sm transition duration-150 flex flex-col justify-between gap-3
          ${expired
            ? 'border-red-200 bg-red-50/5 opacity-85'
            : isDone 
              ? 'border-emerald-250 bg-emerald-50/15' 
              : 'border-slate-200 hover:border-indigo-300'
          }
        `}
      >
        <div>
          {/* Card top flags */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-1 font-mono text-[8px] uppercase font-bold text-slate-500 tracking-wider">
              {/* Priority pill */}
              <span className={`px-1.5 py-0.5 rounded
                ${task.priority === 'Tinggi' 
                  ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                  : task.priority === 'Sedang'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : 'bg-slate-100 text-slate-500 border border-slate-150'
                }
              `}>
                {task.priority} Priority
              </span>

              {/* Type of tasks */}
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-620 border border-indigo-100">
                {task.type}
              </span>

              {isShared && (
                <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                  TIM
                </span>
              )}
            </div>

            {/* Completion status bar text */}
            <div className="flex items-center gap-1.5">
              {onReallocateTime && !isDone && !expired && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReallocateTime(task);
                  }}
                  className="px-1.5 py-0.5 rounded text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 transition duration-150 text-[9.5px] font-bold flex items-center gap-1 cursor-pointer animate-pulse"
                  title="Alihkan Jam Tugas Belum Selesai"
                >
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Alihkan Jam</span>
                </button>
              )}
              {onEditTask && !expired && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTask(task);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
                  title="Edit Nama Tugas"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
              <span className={`text-[9px] font-bold font-mono uppercase tracking-wider flex items-center gap-1
                ${expired ? 'text-red-500' : isDone ? 'text-emerald-600' : 'text-slate-400'}
              `}>
                {expired && <Lock className="w-2.5 h-2.5 text-red-500" />}
                {expired ? 'EXPIRED' : isDone ? 'Selesai' : 'Pending'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            {/* Interactive Checkbox */}
            <button
              type="button"
              onClick={() => handleTickCheck(task)}
              className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer mt-0.5
                ${expired
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                  : isDone 
                    ? 'bg-emerald-500 border-emerald-600 text-white' 
                    : 'bg-slate-50 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }
              `}
              title={expired ? "Terkunci: Batas waktu habis pukul 21:00 WIB" : isDone ? "Tandai Belum Selesai (Lapor Ulang)" : "Tandai Selesai (Lapor Selesai)"}
            >
              {expired ? (
                <Lock className="w-3 h-3 text-red-500 stroke-[2.5]" />
              ) : isDone && (
                <Check className="w-3.5 h-3.5 font-black stroke-[3.5]" />
              )}
            </button>

            <div className="flex-1">
              <h4 className={`text-xs font-bold text-slate-900 tracking-tight leading-snug ${isDone ? 'line-through opacity-50 text-slate-400' : expired ? 'text-slate-500' : ''}`}>
                {task.title}
              </h4>
              {task.description && (
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {task.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Card footer details and status checklist */}
        <div className="border-t border-slate-200 pt-2.5 mt-1 flex items-center justify-between gap-2 text-xs">
          <div className="flex flex-col font-mono text-[9px] text-slate-400 leading-tight">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Target: {task.dueDate} {task.startTime && task.endTime ? `| WIB: ${task.startTime} - ${task.endTime}` : task.dueTime ? `| WIB: ${task.dueTime}` : ''}
            </span>
            {isDone && task.completedAt && (
              <span className="text-emerald-600 font-bold">
                Selesai: {task.completedAt}
              </span>
            )}
          </div>

          {/* Dynamic Action checklist button */}
          <button
            type="button"
            onClick={() => handleTickCheck(task)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition duration-150 cursor-pointer
              ${expired
                ? 'bg-red-50 border border-red-150 text-red-600 cursor-not-allowed opacity-75'
                : isDone
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-150'
              }
            `}
            title={expired ? "Batas waktu checklist sudah lewat 21:00 WIB" : undefined}
          >
            {expired ? (
              <Lock className="w-3.5 h-3.5 flex-shrink-0 text-red-500 stroke-[2.5]" />
            ) : (
              <CheckSquare className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span>{expired ? 'Habis Waktu' : isDone ? 'Lapor Ulang' : 'Lapor Selesai'}</span>
          </button>
        </div>

        {/* Show completed notes bubble on card if present */}
        {isDone && task.completedNotes && (
          <div className="mt-2 bg-emerald-50/70 p-2 rounded border border-emerald-100/50 text-[10px] text-slate-650 italic">
            <strong className="not-italic text-[9px] text-emerald-800 font-bold block mb-0.5 uppercase font-mono">Laporan Bukti:</strong>
            "{task.completedNotes}"
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Employee Greeting & Individual Progression Meter */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {activeMember.photoUrl ? (
            <img src={activeMember.photoUrl} className="aspect-[3/4] w-14 rounded-xl object-cover shadow border border-slate-200/80 flex-shrink-0 animate-fade-in" alt={activeMember.name} />
          ) : (
            <div className={`aspect-[3/4] w-14 rounded-xl ${activeMember.avatarColor} text-xs font-black flex flex-col items-center justify-center shadow border border-slate-200/80 flex-shrink-0`}>
              <span className="text-sm font-extrabold tracking-wider">{activeMember.name.split(' ').map(n=>n[0]).join('')}</span>
              <span className="text-[6.5px] font-mono opacity-85 mt-0.5 tracking-tight uppercase">TIM</span>
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Selamat Bekerja, {activeMember.name}!</h3>
            <p className="text-[10px] text-slate-400 font-mono">Posisi: <span className="text-indigo-600 font-bold">{activeMember.position}</span></p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-64 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            <span>PROGRES TUGAS</span>
            <span className="font-mono text-indigo-600 font-extrabold">{completedCount}/{totalCount} Done ({progressPct}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-md overflow-hidden relative border border-slate-200/50">
            <div 
              className="bg-emerald-500 h-full rounded transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs list to filter scope */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            id="tab-hari-ini"
            onClick={() => setActiveTab('hari-ini')}
            className={`px-3 py-1 text-[10px] font-bold rounded transition-all cursor-pointer
              ${activeTab === 'hari-ini'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
              }
            `}
          >
            Tugas Tanggal: {selectedDate} ({myTasksToday.length})
          </button>
          
          <button
            type="button"
            id="tab-semua"
            onClick={() => setActiveTab('semua')}
            className={`px-3 py-1 text-[10px] font-bold rounded transition-all cursor-pointer
              ${activeTab === 'semua'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
              }
            `}
          >
            Semua Penugasan Saya ({myTotalTasks.length})
          </button>
        </div>

        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
          Hari Terpilih: <strong className="text-slate-700">{selectedDate}</strong>
        </span>
      </div>

      {/* Roster of Tasks cards split into Belum & Sudah */}
      <div className="space-y-6">
        {/* SECTION 1: BELUM DIKERJAKAN */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-rose-100 dark:border-rose-950/60 font-mono">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse inline-block" />
              Tuntaskan Tugas Belum Dikerjakan ({pendingTasks.length})
            </span>
          </div>
          {pendingTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingTasks.map(task => renderTaskCard(task))}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <ClipboardList className="w-5.5 h-5.5 text-emerald-500 mx-auto mb-1 opacity-80" />
              <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider font-mono">Luar Biasa! Semua Tugas Sudah Selesai ✔</p>
            </div>
          )}
        </div>

        {/* SECTION 2: SUDAH DIKERJAKAN */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-emerald-100 dark:border-emerald-950/60 font-mono">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Review Tugas Sudah Dikerjakan ({completedTasks.length})
            </span>
          </div>
          {completedTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {completedTasks.map(task => renderTaskCard(task))}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-dashed border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Belum ada tugas diselesaikan ☕</p>
            </div>
          )}
        </div>
      </div>

      {/* Completion Notes Proof Dialog Pop-Up Modal */}
      {validatingTaskId && (
        <div id="notes-dialog-overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-950 uppercase tracking-tight">Kirim Laporan Kerja</h4>
                <p className="text-[10px] text-slate-400">Tulis link Drive atau rincian pekerjaan anda</p>
              </div>
            </div>

            <form onSubmit={submitCompletionProof} className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-1 font-mono uppercase tracking-wider">
                  Bukti Kegiatan / Catatan Penyelesaian
                </label>
                <textarea
                  id="completion-notes-input"
                  value={completionNotes}
                  onChange={e => setCompletionNotes(e.target.value)}
                  placeholder="Contoh: Lampiran revisi rancangan poster.pdf sudah diserahkan di Shared Drive... siap dipreview."
                  rows={3}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none p-2 rounded-lg transition duration-150 text-slate-800"
                />
              </div>

              <div className="flex gap-2 justify-end pt-1.5">
                <button
                  type="button"
                  onClick={() => setValidatingTaskId(null)}
                  className="px-2.5 py-1 hover:bg-slate-100 rounded text-[10px] font-bold text-slate-500 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Kirim</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
