import React, { useState } from 'react';
import { 
  BarChart, Trash2, Calendar, Target, 
  CheckCircle, Clock, AlertTriangle, Users, Award, 
  Send, Search, Filter, RefreshCw, MessageSquareDashed, Check, Pencil, Lock
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

interface LeaderDashboardProps {
  tasks: Task[];
  members: TeamMember[];
  onToggleStatus: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  selectedDate: string; // YYYY-MM-DD
  isTaskActiveOnDate: (task: Task, dateStr: string) => boolean;
  onAddMember?: (newMember: TeamMember) => void;
  onDeleteMember?: (memberId: string) => void;
  onEditMember?: (updatedMember: TeamMember) => void;
  onEditTask?: (task: Task) => void;
  onReallocateTime?: (task: Task) => void;
}

export default function LeaderDashboard({
  tasks,
  members,
  onToggleStatus,
  onDeleteTask,
  selectedDate,
  isTaskActiveOnDate,
  onAddMember,
  onDeleteMember,
  onEditMember,
  onEditTask,
  onReallocateTime
}: LeaderDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Rutin' | 'Harian' | 'Berulang'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Tinggi' | 'Sedang' | 'Rendah'>('All');
  
  // States of Active Tab and Sub forms
  const [activeTab, setActiveTab] = useState<'progress' | 'manage'>('progress');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // New Member Fields
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPosition, setNewMemberPosition] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberColor, setNewMemberColor] = useState('bg-teal-500 text-white');
  const [newMemberPhoto, setNewMemberPhoto] = useState('');

  // Edit Member Fields
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberPosition, setEditMemberPosition] = useState('');
  const [editMemberEmail, setEditMemberEmail] = useState('');
  const [editMemberColor, setEditMemberColor] = useState('');
  const [editMemberPhoto, setEditMemberPhoto] = useState('');

  // Colors preset options in Tailwind
  const COLOR_OPTIONS = [
    { color: 'bg-emerald-500 text-white', label: 'Emerald' },
    { color: 'bg-cyan-500 text-white', label: 'Cyan' },
    { color: 'bg-amber-500 text-white', label: 'Amber' },
    { color: 'bg-rose-500 text-white', label: 'Rose' },
    { color: 'bg-violet-500 text-white', label: 'Violet' },
    { color: 'bg-pink-500 text-white', label: 'Pink' },
    { color: 'bg-teal-500 text-white', label: 'Teal' },
    { color: 'bg-blue-500 text-white', label: 'Blue' }
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            // Perfect 3:4 aspect ratio bounding box optimized for lightweight local storage impact
            const targetWidth = 240;
            const targetHeight = 320;
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const imgWidth = img.width;
              const imgHeight = img.height;
              const targetAspect = 3 / 4;
              const imgAspect = imgWidth / imgHeight;

              let sourceX = 0;
              let sourceY = 0;
              let sourceWidth = imgWidth;
              let sourceHeight = imgHeight;

              if (imgAspect > targetAspect) {
                // Image is wider than 3:4, crop side margins
                sourceWidth = imgHeight * targetAspect;
                sourceX = (imgWidth - sourceWidth) / 2;
              } else {
                // Image is taller than 3:4, crop top and bottom margins
                sourceHeight = imgWidth / targetAspect;
                sourceY = (imgHeight - sourceHeight) / 2;
              }

              ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, targetWidth, targetHeight
              );

              // Standard compress to 0.8 jpeg to fit comfortably under browser storage limit (reducing ~2MB down to ~20KB!)
              const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
              if (type === 'new') {
                setNewMemberPhoto(optimizedDataUrl);
              } else {
                setEditMemberPhoto(optimizedDataUrl);
              }
            } else {
              // Canvas fallback
              if (type === 'new') {
                setNewMemberPhoto(event.target?.result as string);
              } else {
                setEditMemberPhoto(event.target?.result as string);
              }
            }
          };
          img.src = event.target?.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAddMember = () => {
    setNewMemberName('');
    setNewMemberPosition('');
    setNewMemberEmail('');
    setNewMemberColor('bg-teal-500 text-white');
    setNewMemberPhoto('');
    setIsAddingMember(true);
    setEditingMember(null);
  };

  const handleStartEditMember = (mb: TeamMember) => {
    setEditingMember(mb);
    setEditMemberName(mb.name);
    setEditMemberPosition(mb.position);
    setEditMemberEmail(mb.email);
    setEditMemberColor(mb.avatarColor);
    setEditMemberPhoto(mb.photoUrl || '');
    setIsAddingMember(false);
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPosition.trim() || !newMemberEmail.trim()) return;
    
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMemberName.trim(),
      role: 'Anggota',
      position: newMemberPosition.trim(),
      email: newMemberEmail.trim(),
      avatarColor: newMemberColor,
      photoUrl: newMemberPhoto || undefined
    };

    if (onAddMember) {
      onAddMember(newMember);
    }
    setIsAddingMember(false);
  };

  const handleEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editMemberName.trim() || !editMemberPosition.trim() || !editMemberEmail.trim()) return;

    const updated: TeamMember = {
      ...editingMember,
      name: editMemberName.trim(),
      position: editMemberPosition.trim(),
      email: editMemberEmail.trim(),
      avatarColor: editMemberColor,
      photoUrl: editMemberPhoto || undefined
    };

    if (onEditMember) {
      onEditMember(updated);
    }
    setEditingMember(null);
  };

  // Custom simulation feedback broadcast message
  const [motivationMsg, setMotivationMsg] = useState('');
  const [broadcastedMsg, setBroadcastedMsg] = useState(
    'Tetap jaga produktivitas hari ini! Prioritaskan tugas penting yang belum selesai.'
  );
  const [showBroadcastConfirm, setShowBroadcastConfirm] = useState(false);

  // Statistics calculation
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'Selesai').length;
  const pendingTasksCount = totalTasksCount - completedTasksCount;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 105) / 1.05 : 0; // standard round
  const finalRate = Math.min(100, Math.round(completionRate));

  // Category counts
  const routineCount = tasks.filter(t => t.type === 'Rutin').length;
  const dailyCount = tasks.filter(t => t.type === 'Harian').length;
  const recurringCount = tasks.filter(t => t.type === 'Berulang').length;

  // Filter tasks list for display
  const filteredTasksForTable = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.assignedToName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || t.type === typeFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesSearch && matchesType && matchesPriority;
  });

  // Calculate stats for each team member to render custom SVG charts!
  const memberProgressData = members.filter(m => m.role !== 'Leader').map(m => {
    // Get all tasks assigned to this member or assigned to all
    const memberTasks = tasks.filter(t => t.assignedToId === m.id || t.assignedToId === 'all');
    const total = memberTasks.length;
    const completed = memberTasks.filter(t => t.status === 'Selesai').length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...m,
      total,
      completed,
      percentage: pct
    };
  });

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivationMsg.trim()) return;
    setBroadcastedMsg(motivationMsg.trim());
    setMotivationMsg('');
    setShowBroadcastConfirm(true);
    setTimeout(() => {
      setShowBroadcastConfirm(false);
    }, 3000);
  };

  const pendingTasksTable = filteredTasksForTable.filter(t => t.status !== 'Selesai');
  const completedTasksTable = filteredTasksForTable.filter(t => t.status === 'Selesai');

  const renderRow = (task: Task) => {
    const isDone = task.status === 'Selesai';
    const expired = isTaskExpired(task);
    return (
      <tr 
        key={task.id} 
        id={`leader-task-row-${task.id}`}
        className="hover:bg-slate-50/65 dark:hover:bg-slate-900/40 transition duration-100"
      >
        <td className="py-2.5 px-3 align-middle w-8">
          {/* Interactive Checkbox Checklist for Leader */}
          <button
            type="button"
            onClick={() => {
              if (expired) {
                alert(`Gagal! Batas waktu checklist harian tugas ini telah melewati pukul 21:00 WIB pada hari target (${task.dueDate}).`);
                return;
              }
              onToggleStatus(task.id);
            }}
            className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition flex-shrink-0
              ${expired
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60 cursor-not-allowed'
                : isDone
                  ? 'bg-emerald-500 border-emerald-600 text-white'
                  : 'bg-slate-50 border-slate-300 dark:border-slate-600 hover:bg-slate-100 hover:border-indigo-500'
              }
            `}
            title={expired ? `Terkunci: Batas waktu check habis pukul 21:00 WIB (${task.dueDate})` : isDone ? "Tandai Belum Selesai" : "Tandai Selesai"}
          >
            {expired ? (
              <Lock className="w-3.5 h-3.5 text-amber-500 stroke-[3]" />
            ) : isDone ? (
              <Check className="w-3.5 h-3.5 font-black stroke-[3.5]" />
            ) : null}
          </button>
        </td>

        <td className="py-2.5 px-3 max-w-[200px]">
          <span className={`block font-bold text-slate-805 ${isDone ? 'line-through opacity-50 text-slate-400' : ''}`}>
            {task.title}
          </span>
          {task.description && (
            <span className="block text-[9px] text-slate-400 truncate">
              {task.description}
            </span>
          )}
          <span className="inline-block mt-0.5 px-1 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 text-[8px] font-extrabold uppercase font-mono rounded">
            PJ: {task.assignedToName}
          </span>
        </td>

        <td className="py-2.5 px-3">
          {task.type === 'Rutin' && (
            <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold">Rutin</span>
          )}
          {task.type === 'Harian' && (
            <span className="text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold">Harian</span>
          )}
          {task.type === 'Berulang' && (
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold">Berulang</span>
          )}
        </td>

        <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">
          {task.type === 'Berulang' ? (
            <span className="font-semibold text-emerald-800 block">
              {task.recurrence?.intervalText}
            </span>
          ) : (
            <span className="block font-semibold text-slate-700 dark:text-slate-300">{task.dueDate}</span>
          )}
          {task.startTime && task.endTime ? (
            <span className="block text-[10px] text-indigo-650 dark:text-indigo-400 font-bold font-mono">WIB: {task.startTime} s/d {task.endTime}</span>
          ) : task.dueTime ? (
            <span className="block text-[10px] text-indigo-650 dark:text-indigo-400 font-bold font-mono">Pukul {task.dueTime} WIB</span>
          ) : null}
        </td>

        <td className="py-2.5 px-3">
          <span className={`inline-block font-mono text-[9px] font-bold px-1.5 py-0.5 rounded
            ${task.priority === 'Tinggi' 
              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
              : task.priority === 'Sedang'
                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                : 'bg-slate-50 text-slate-500 border border-slate-150'
            }
          `}>
            {task.priority}
          </span>
        </td>

        <td className="py-2.5 px-3">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                if (expired) {
                  alert(`Gagal! Batas waktu checklist harian tugas ini telah melewati pukul 21:00 WIB pada hari target (${task.dueDate}).`);
                  return;
                }
                onToggleStatus(task.id);
              }}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer text-left
                ${expired
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 cursor-not-allowed opacity-75'
                  : isDone
                    ? 'bg-emerald-50 text-emerald-750 border border-emerald-250'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }
              `}
              title={expired ? "Terkunci: Sudah melewati pukul 21:00 WIB hari target" : undefined}
            >
              {expired ? (
                <Lock className="w-2.5 h-2.5 text-rose-500 stroke-[2.5]" />
              ) : (
                <span className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              )}
              <span>{expired ? "Habis Waktu" : task.status}</span>
            </button>
            
            {isDone && task.completedAt && (
              <div className="space-y-0.5 max-w-[150px]">
                <span className="block text-[8px] font-mono text-slate-400 font-semibold">
                  Selesai: {task.completedAt}
                </span>
                {task.completedNotes && (
                  <span className="block text-[9px] italic text-slate-500 bg-slate-50 p-1 rounded border border-slate-100 break-all">
                    "{task.completedNotes}"
                  </span>
                )}
              </div>
            )}
          </div>
        </td>

        <td className="py-2.5 px-3 text-right">
          <div className="flex items-center justify-end gap-1.5">
            {onReallocateTime && !isDone && (
              <button
                type="button"
                onClick={() => onReallocateTime(task)}
                className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded transition cursor-pointer flex items-center justify-center animate-pulse"
                title="Alihkan Jam Tugas Belum Selesai"
              >
                <Clock className="w-3.5 h-3.5 stroke-[2.25]" />
              </button>
            )}
            {onEditTask && (
              <button
                type="button"
                onClick={() => onEditTask(task)}
                className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Edit Tugas"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              id={`delete-btn-${task.id}`}
              onClick={() => onDeleteTask(task.id)}
              className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-150 transition cursor-pointer"
              title="Hapus Tugas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      {/* Overview Bento Stats Grid */}
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
        Rangkuman Progres Tim Seluruh Periode
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Status completion card with visual radial meter */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight font-mono block">Persen Selesai</span>
            <span className="text-2xl font-extrabold text-slate-900 block font-mono">{finalRate}%</span>
            <span className="text-[9px] font-bold text-emerald-600 font-mono bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
              {completedTasksCount}/{totalTasksCount} Selesai
            </span>
          </div>
          {/* Circular SVG Progress Ring */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                strokeWidth="45"
                stroke="#f1f5f9"
                fill="transparent"
                style={{ strokeWidth: 4 }}
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                strokeWidth="4"
                stroke="url(#indigoGrad)"
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={2 * Math.PI * 20 * (1 - finalRate / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-[10px] font-extrabold text-indigo-650 font-mono">{finalRate}%</span>
          </div>
        </div>

        {/* Card Routine Tasks */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight font-mono block">Kegiatan Rutin</span>
            <span className="text-xl font-bold text-indigo-600 block font-mono">{routineCount}</span>
            <p className="text-[9px] text-slate-400">Pola berulang harian harian</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Card One-off/Daily Tasks */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight font-mono block">Tugas Harian</span>
            <span className="text-xl font-bold text-amber-600 block font-mono">{dailyCount}</span>
            <p className="text-[9px] text-slate-400">Target jangka pendek</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>

        {/* Card Recurring Tasks */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight font-mono block">Jadwal Berulang</span>
            <span className="text-xl font-bold text-emerald-600 block font-mono">{recurringCount}</span>
            <p className="text-[9px] text-slate-400">Hari khusus terjadwal</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <RefreshCw className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Grid: Member Leaderboard & Motivation broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Dynamic Multi-tab: Team Progress Chart OR Team Management */}
        <div className="bg-white rounded-xl p-8 border-2 border-slate-250 shadow-md lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600 stroke-[2.5]" />
              <h4 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">Manajemen & Pemantauan Tim</h4>
            </div>
            
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-205 text-sm font-bold shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('progress');
                  setEditingMember(null);
                  setIsAddingMember(false);
                }}
                className={`px-4 py-2 text-[11px] font-black rounded-lg transition duration-150 cursor-pointer
                  ${activeTab === 'progress' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-750'
                  }
                `}
              >
                📊 Progres Tim
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                className={`px-4 py-2 text-[11px] font-black rounded-lg transition duration-150 cursor-pointer
                  ${activeTab === 'manage' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-750'
                  }
                `}
              >
                👥 Kelola Anggota
              </button>
            </div>
          </div>

          {/* Galeri Foto Anggota Tim (Ratio 3:4 & Diperbesar) */}
          <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 rounded-2xl border-2 border-slate-200/60 dark:border-slate-800">
            <span className="block text-xs font-black text-slate-500 uppercase tracking-wider font-mono mb-3">Papan Foto Anggota Tim ({members.length})</span>
            <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-thin">
              {members.map(mb => {
                const isLeader = mb.role === 'Leader';
                return (
                  <div key={mb.id} className="flex flex-col items-center justify-center text-center space-y-2.5 min-w-[105px] max-w-[105px] flex-shrink-0 group">
                    <div className="relative w-full">
                      {mb.photoUrl ? (
                        <img 
                          src={mb.photoUrl} 
                          className="aspect-[3/4] w-24 mx-auto rounded-xl object-cover border border-slate-200 dark:border-slate-700/60 shadow-md group-hover:scale-105 transition-all duration-150" 
                          alt={mb.name} 
                        />
                      ) : (
                        <div className={`aspect-[3/4] w-24 mx-auto rounded-xl ${mb.avatarColor} text-sm font-black flex flex-col items-center justify-center border border-slate-200 dark:border-slate-705/60 shadow-md group-hover:scale-105 transition-all duration-150`}>
                          <span className="text-sm font-extrabold tracking-wider">{mb.name.split(' ').map(n=>n[0]).join('')}</span>
                          <span className="text-[7px] opacity-80 font-mono uppercase mt-1">STAFF</span>
                        </div>
                      )}
                      
                      {isLeader && (
                        <span className="absolute -bottom-1 right-2 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow leading-none uppercase tracking-wider font-mono">
                          MGR
                        </span>
                      )}
                    </div>
                    <div className="w-full px-1">
                      <span className="block font-black text-slate-800 dark:text-slate-200 text-[11px] truncate leading-tight" title={mb.name}>
                        {mb.name}
                      </span>
                      <span className="block text-slate-400 dark:text-slate-500 text-[8.5px] font-bold font-mono tracking-tight truncate leading-none mt-0.5">
                        {mb.position}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {activeTab === 'progress' ? (
            <div className="space-y-4 pt-1">
              {memberProgressData.map(mb => {
                // Custom styled progress visual matching employee colored avatars
                return (
                  <div key={mb.id} className="space-y-2 p-3 bg-slate-50/40 dark:bg-slate-850/30 rounded-lg border border-slate-100" id={`member-progress-${mb.id}`}>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2.5">
                        {mb.photoUrl ? (
                          <img src={mb.photoUrl} className="aspect-[3/4] w-10 sm:w-11 rounded-lg object-cover flex-shrink-0 border border-slate-200" alt={mb.name} />
                        ) : (
                          <div className={`aspect-[3/4] w-10 sm:w-11 rounded-lg ${mb.avatarColor} text-[10px] font-black flex flex-col items-center justify-center flex-shrink-0`}>
                            <span>{mb.name.split(' ').map(n=>n[0]).join('')}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-855 font-black text-sm block">{mb.name}</span>
                          <span className="text-slate-400 text-[10px] font-bold font-mono">({mb.position})</span>
                        </div>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
                        {mb.completed}/{mb.total} Selesai ({mb.percentage}%)
                      </span>
                    </div>

                    {/* Horizontal Bar */}
                    <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden relative border border-slate-200/50">
                      <div 
                        className="bg-indigo-600 h-full rounded-r transition-all duration-500 ease-out"
                        style={{ width: `${mb.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // activeTab === 'manage'
            <div className="pt-0.5 min-h-[140px]">
              {isAddingMember ? (
                /* ADD MEMBER SCREEN */
                <form onSubmit={handleAddMemberSubmit} className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-xs text-indigo-650 uppercase font-mono tracking-wider">Tambah Anggota Tim</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingMember(false)}
                      className="text-[9px] px-2 py-0.5 font-bold text-slate-500 hover:text-slate-750 bg-white border border-slate-200 rounded cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5 font-mono">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={newMemberName}
                        onChange={e => setNewMemberName(e.target.value)}
                        placeholder="Contoh: Farhan Syah"
                        className="w-full text-[11px] bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-indigo-505 text-slate-805"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5 font-mono">Posisi / Jabatan</label>
                      <input
                        type="text"
                        required
                        value={newMemberPosition}
                        onChange={e => setNewMemberPosition(e.target.value)}
                        placeholder="Contoh: Mobile Developer"
                        className="w-full text-[11px] bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-indigo-505 text-slate-805"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5 font-mono">Alamat Email</label>
                      <input
                        type="email"
                        required
                        value={newMemberEmail}
                        onChange={e => setNewMemberEmail(e.target.value)}
                        placeholder="farhan@workspace.com"
                        className="w-full text-[11px] bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-indigo-505 text-slate-805"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5 font-mono">Warna Avatar</label>
                      <div className="flex flex-wrap items-center gap-1.5 py-1">
                        {COLOR_OPTIONS.map(opt => (
                          <button
                            type="button"
                            key={opt.color}
                            onClick={() => setNewMemberColor(opt.color)}
                            className={`w-5.5 h-5.5 rounded-full ${opt.color} border flex items-center justify-center transition cursor-pointer relative`}
                            title={opt.label}
                          >
                            {newMemberColor === opt.color && (
                              <span className="absolute w-2 h-2 rounded-full bg-white ring-2 ring-indigo-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload segment (Ratio 3:4) */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-tight font-mono">Foto Profil (Rasio 3:4)</label>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="aspect-[3/4] w-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
                        {newMemberPhoto ? (
                          <img src={newMemberPhoto} className="aspect-[3/4] w-12 object-cover" alt="Preview Foto" />
                        ) : (
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">3:4</span>
                        )}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <label 
                          htmlFor="new-photo-upload" 
                          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950 transition rounded text-[10px] font-bold cursor-pointer font-mono"
                        >
                          Pilih Foto
                        </label>
                        <input
                          type="file"
                          id="new-photo-upload"
                          accept="image/*"
                          onChange={e => handlePhotoUpload(e, 'new')}
                          className="hidden"
                        />
                        {newMemberPhoto && (
                          <button
                            type="button"
                            onClick={() => setNewMemberPhoto('')}
                            className="text-[9px] text-rose-500 font-bold hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                        <p className="text-[8px] text-slate-400 leading-tight">Foto diunggah otomatis dicrop 3:4 & dikompres</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer font-mono"
                  >
                    <span>SIMPAN ANGGOTA TIM</span>
                  </button>
                </form>
              ) : editingMember ? (
                /* EDIT MEMBER SCREEN */
                <form onSubmit={handleEditMemberSubmit} className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-xs text-amber-655 uppercase font-mono tracking-wider">Edit Anggota Tim</span>
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="text-[9px] px-2 py-0.5 font-bold text-slate-500 hover:text-slate-755 bg-white border border-slate-200 rounded cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5 font-mono">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={editMemberName}
                        onChange={e => setEditMemberName(e.target.value)}
                        className="w-full text-[11px] bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-indigo-505 text-slate-805"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5 font-mono">Posisi / Jabatan</label>
                      <input
                        type="text"
                        required
                        value={editMemberPosition}
                        onChange={e => setEditMemberPosition(e.target.value)}
                        className="w-full text-[11px] bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-indigo-505 text-slate-805"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5 font-mono">Alamat Email</label>
                      <input
                        type="email"
                        required
                        value={editMemberEmail}
                        onChange={e => setEditMemberEmail(e.target.value)}
                        className="w-full text-[11px] bg-white border border-slate-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-indigo-505 text-slate-805"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-0.5 font-mono">Warna Avatar</label>
                      <div className="flex flex-wrap items-center gap-1.5 py-1">
                        {COLOR_OPTIONS.map(opt => (
                          <button
                            type="button"
                            key={opt.color}
                            onClick={() => setEditMemberColor(opt.color)}
                            className={`w-5.5 h-5.5 rounded-full ${opt.color} border flex items-center justify-center transition cursor-pointer relative`}
                            title={opt.label}
                          >
                            {editMemberColor === opt.color && (
                              <span className="absolute w-2 h-2 rounded-full bg-white ring-2 ring-indigo-550" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Edit Photo Upload segment (Ratio 3:4) */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-tight font-mono">Foto Profil (Rasio 3:4)</label>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="aspect-[3/4] w-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
                        {editMemberPhoto ? (
                          <img src={editMemberPhoto} className="aspect-[3/4] w-12 object-cover" alt="Preview Foto" />
                        ) : (
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">3:4</span>
                        )}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <label 
                          htmlFor="edit-photo-upload" 
                          className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-655 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-955 transition rounded text-[10px] font-bold cursor-pointer font-mono"
                        >
                          Pilih Foto
                        </label>
                        <input
                          type="file"
                          id="edit-photo-upload"
                          accept="image/*"
                          onChange={e => handlePhotoUpload(e, 'edit')}
                          className="hidden"
                        />
                        {editMemberPhoto && (
                          <button
                            type="button; "
                            onClick={() => setEditMemberPhoto('')}
                            className="text-[9px] text-rose-500 font-bold hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                        <p className="text-[8px] text-slate-400 leading-tight">Foto diunggah otomatis dicrop 3:4 & dikompres</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] py-1.5 px-3 rounded flex items-center justify-center gap-1 transition cursor-pointer font-mono"
                  >
                    <span>PERBARUI ANGGOTA TIM</span>
                  </button>
                </form>
              ) : (
                /* MAIN LIST SCREEN */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="text-xs text-slate-500 font-mono font-bold">Total {members.length} anggota saat ini</span>
                    <button
                      type="button"
                      onClick={() => handleStartAddMember()}
                      className="px-4 py-2 text-xs font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-650 border border-indigo-150 rounded-xl cursor-pointer transition uppercase tracking-wider shadow-sm"
                    >
                      + Tambah Anggota
                    </button>
                  </div>

                  <div className="divide-y divide-slate-150 max-h-[350px] overflow-y-auto pr-1 space-y-1">
                    {members.map(mb => {
                      const isLeader = mb.role === 'Leader';
                      return (
                        <div key={mb.id} className="flex items-center justify-between py-3 text-sm">
                          <div className="flex items-center gap-3">
                            {mb.photoUrl ? (
                              <img src={mb.photoUrl} className="aspect-[3/4] w-14 rounded-xl object-cover shadow border border-slate-200 flex-shrink-0" alt={mb.name} />
                            ) : (
                              <div className={`aspect-[3/4] w-14 rounded-xl ${mb.avatarColor} text-[11px] font-black flex flex-col items-center justify-center shadow border border-slate-200/50 flex-shrink-0`}>
                                <span>{mb.name.split(' ').map(n=>n[0]).join('')}</span>
                                <span className="text-[6.5px] font-mono opacity-80 uppercase mt-0.5">FIN</span>
                              </div>
                            )}
                            <div>
                              <div className="font-extrabold text-slate-850 flex items-center gap-1.5">
                                <span className="text-sm font-black">{mb.name}</span>
                                {isLeader && (
                                  <span className="px-1.5 py-0.5 text-[8px] bg-indigo-100 text-indigo-755 border border-indigo-200 font-bold rounded">LEADER</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-450 leading-relaxed mt-0.5">{mb.position} &bull; <span className="font-mono text-slate-400">{mb.email}</span></p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditMember(mb)}
                              className="text-xs font-black px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 rounded-lg cursor-pointer transition uppercase"
                            >
                              Edit
                            </button>
                            {!isLeader && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (onDeleteMember) {
                                    onDeleteMember(mb.id);
                                  }
                                }}
                                className="text-xs font-black px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-650 rounded-lg cursor-pointer transition uppercase"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pesan Motivasi Broadcast Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 mb-2.5">
              <MessageSquareDashed className="w-4 h-4 text-indigo-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Pengumuman Leader</h4>
                <p className="text-[9px] text-slate-400 font-mono">Tampil langsung di papan tim</p>
              </div>
            </div>

            {/* Simulated Live Announcement Box */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg relative mt-2">
              <span className="absolute -top-2 left-2.5 px-1.5 py-0.5 text-[8px] bg-indigo-600 text-white font-mono font-bold rounded uppercase">
                Pengumuman
              </span>
              <p className="text-[11px] text-slate-755 italic font-medium leading-relaxed pt-1">
                "{broadcastedMsg}"
              </p>
              <div className="mt-2 flex items-center justify-between text-[8px] text-slate-400 border-t border-slate-200/50 pt-1.5 font-mono">
                <span>Leader</span>
                <span>Baru saja</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-2">
            <div>
              <input
                type="text"
                required
                value={motivationMsg}
                onChange={e => setMotivationMsg(e.target.value)}
                placeholder="Tulis instruksi baru..."
                className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none py-1.5 px-2 rounded-lg transition font-medium text-slate-800"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Siarkan Pengumuman</span>
            </button>
            {showBroadcastConfirm && (
              <p className="text-center text-[8px] font-bold text-emerald-600 animate-fade-in font-mono">
                ✔ Berhasil disiarkan
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Task Monitor Table Board Logs (Full View) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Master Board Pemantauan Tugas</h4>
            <p className="text-[10px] text-slate-400 font-mono">Total {filteredTasksForTable.length} target terhitung</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Search Input bar */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari tugas..."
                className="pl-8 pr-2 py-1 text-[10px] bg-slate-50 border border-slate-200 rounded-md focus:bg-white text-slate-800"
              />
            </div>

            {/* Type dropdown */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="p-1 px-1.5 text-[10px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 font-bold"
            >
              <option value="All">Semua Jenis</option>
              <option value="Rutin">Rutin Only</option>
              <option value="Harian">Harian Only</option>
              <option value="Berulang">Berulang Only</option>
            </select>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="p-1 px-1.5 text-[10px] bg-slate-50 border border-slate-200 rounded-md text-slate-600 font-bold"
            >
              <option value="All">Semua Prioritas</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Sedang">Sedang</option>
              <option value="Rendah">Rendah</option>
            </select>
          </div>
        </div>
                {/* Table representation split into pending and completed checklists */}
        {filteredTasksForTable.length > 0 ? (
          <div className="space-y-6">
            
            {/* 1. KELOMPOK BELUM DIKERJAKAN */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-rose-100 dark:border-rose-950 font-mono text-[10.5px] font-bold text-rose-600 dark:text-rose-450 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block" />
                Target Kegiatan Belum Selesai ({pendingTasksTable.length})
              </div>
              {pendingTasksTable.length > 0 ? (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        <th className="py-2 px-3 w-8">Check</th>
                        <th className="py-2 px-3">Nama Tugas & Penerima</th>
                        <th className="py-2 px-3">Jenis</th>
                        <th className="py-2 px-3">Target Tanggal</th>
                        <th className="py-2 px-3">Prioritas</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
                      {pendingTasksTable.map(task => renderRow(task))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider font-mono">✔ Hebat! Seluruh target terjadwal sudah diselesaikan.</p>
                </div>
              )}
            </div>

            {/* 2. KELOMPOK SUDAH DIKERJAKAN */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-emerald-100 dark:border-emerald-950 font-mono text-[10.5px] font-bold text-emerald-700 dark:text-emerald-450 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Target Kegiatan Sudah Selesai ({completedTasksTable.length})
              </div>
              {completedTasksTable.length > 0 ? (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        <th className="py-2 px-3 w-8">Check</th>
                        <th className="py-2 px-3">Nama Tugas & Penerima</th>
                        <th className="py-2 px-3">Jenis</th>
                        <th className="py-2 px-3">Target Tanggal</th>
                        <th className="py-2 px-3">Prioritas</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
                      {completedTasksTable.map(task => renderRow(task))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-shadow border-slate-150 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Belum ada target yang tuntas hari ini.</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Users className="w-6 h-6 text-slate-350 mx-auto mb-1.5" />
            <p className="text-xs text-slate-500 font-bold">Tidak ada daftar tugas yang sesuai filter</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Ubah pola filter Anda di atas untuk melihat tugas lain</p>
          </div>
        )}
      </div>
    </div>
  );
}
