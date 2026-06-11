import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Sparkles, Clock, CalendarDays, CheckCircle, 
  HelpCircle, User, MessageCircle, Info, ChevronRight, ListOrdered, Sun, Moon, LogOut
} from 'lucide-react';
import { Task, TeamMember } from './types';
import { INITIAL_MEMBERS, INITIAL_TASKS } from './data/initialData';
import CalendarView from './components/CalendarView';
import TaskForm from './components/TaskForm';
import LeaderDashboard from './components/LeaderDashboard';
import TeamBoard from './components/TeamBoard';
import RoleSelector from './components/RoleSelector';
import WelcomePortal from './components/WelcomePortal';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // State members with local storage loader
  const [members, setMembers] = useState<TeamMember[]>(() => {
    const cached = localStorage.getItem('monitoring_members_list');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_MEMBERS;
  });

  const [activeMember, setActiveMember] = useState<TeamMember>(() => {
    const cachedActiveId = localStorage.getItem('monitoring_active_member_id');
    if (cachedActiveId) {
      const found = members.find(m => m.id === cachedActiveId);
      if (found) return found;
    }
    return members[0] || INITIAL_MEMBERS[0];
  });

  const [selectedDate, setSelectedDate] = useState<string>('2026-06-06'); // Initial target mock day
  const [systemNotification, setSystemNotification] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [reallocateTask, setReallocateTask] = useState<Task | null>(null);
  const [reallocateDate, setReallocateDate] = useState<string>('');
  const [reallocateTime, setReallocateTime] = useState<string>('09:00');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  useEffect(() => {
    if (reallocateTask) {
      setReallocateDate(reallocateTask.dueDate);
      setReallocateTime(reallocateTask.dueTime || '09:00');
      setRescheduleError(null);
    }
  }, [reallocateTask]);

  useEffect(() => {
    localStorage.setItem('monitoring_members_list', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    if (activeMember) {
      localStorage.setItem('monitoring_active_member_id', activeMember.id);
    }
  }, [activeMember]);

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme_mode') as 'light' | 'dark') || 'light';
  });

  const [isEntered, setIsEntered] = useState<boolean>(() => {
    return localStorage.getItem('monitoring_app_entered') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('monitoring_app_entered', String(isEntered));
  }, [isEntered]);

  useEffect(() => {
    localStorage.setItem('theme_mode', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Load from local storage on mount
  useEffect(() => {
    const cachedTasks = localStorage.getItem('monitoring_tasks_list');
    if (cachedTasks) {
      try {
        setTasks(JSON.parse(cachedTasks));
      } catch (e) {
        setTasks(INITIAL_TASKS);
      }
    } else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem('monitoring_tasks_list', JSON.stringify(INITIAL_TASKS));
    }
  }, []);

  // Save to local storage whenever tasks updates
  const updateTasksStateAndCache = (newTasksList: Task[]) => {
    setTasks(newTasksList);
    localStorage.setItem('monitoring_tasks_list', JSON.stringify(newTasksList));
  };

  // Helper trigger to parse day of the week safely avoiding UTC timezone drifts
  const isTaskActiveOnDate = (task: Task, dateStr: string): boolean => {
    if (task.type === 'Harian' || task.type === 'Rutin') {
      return task.dueDate === dateStr;
    }
    if (task.type === 'Berulang' && task.recurrence) {
      if (task.dueDate && dateStr < task.dueDate) {
        return false;
      }
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const targetDate = new Date(year, month, day);
        const targetDayOfWeek = targetDate.getDay(); // 0 = Minggu, 1 = Senin, ... 6 = Sabtu
        return task.recurrence.days.includes(targetDayOfWeek);
      }
    }
    return false;
  };

  // Add a new task (by Leader & Tim)
  const handleAddTask = (newTask: Task) => {
    const duplicate = tasks.find(t => t.dueDate === newTask.dueDate && t.startTime === newTask.startTime && t.endTime === newTask.endTime);
    if (duplicate) {
      triggerNotification(`Gagal! Jam kerja ${newTask.startTime} - ${newTask.endTime} sudah terisi.`);
      return false;
    }
    const updated = [newTask, ...tasks];
    updateTasksStateAndCache(updated);
    
    // Trigger success flash
    triggerNotification(`Sukses menjadwalkan tugas: "${newTask.title}" untuk ${newTask.assignedToName}`);
    return true;
  };

  // Edit an existing task
  const handleEditTask = (updatedTask: Task) => {
    const duplicate = tasks.find(t => t.id !== updatedTask.id && t.dueDate === updatedTask.dueDate && t.startTime === updatedTask.startTime && t.endTime === updatedTask.endTime);
    if (duplicate) {
      alert(`Gagal menyimpan! Sudah ada tugas lain ("${duplicate.title}") pada Hari (${updatedTask.dueDate}) dan Jam Kerja (${updatedTask.startTime} - ${updatedTask.endTime}) yang sama.`);
      return false;
    }
    const updated = tasks.map(t => t.id === updatedTask.id ? { ...updatedTask, dueTime: updatedTask.endTime } : t);
    updateTasksStateAndCache(updated);
    triggerNotification(`Tugas "${updatedTask.title}" berhasil diperbarui.`);
    return true;
  };

  // Reallocate or reschedule time for a pending task
  const handleReallocateTime = (taskId: string, targetDateStr: string, targetTimeStr: string) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return false;

    const duplicate = tasks.find(t => 
      t.id !== taskId && 
      t.dueDate === targetDateStr && 
      t.dueTime === targetTimeStr
    );

    if (duplicate) {
      setRescheduleError(`Gagal mengalihkan! Jadwal jam ${targetTimeStr} pada tanggal ${targetDateStr} sudah terisi oleh kegiatan: "${duplicate.title}".`);
      return false;
    }

    const updated = tasks.map(t => t.id === taskId ? { 
      ...t, 
      dueDate: targetDateStr, 
      dueTime: targetTimeStr 
    } : t);
    
    updateTasksStateAndCache(updated);
    triggerNotification(`Jam tugas "${taskToUpdate.title}" dialihkan ke pukul ${targetTimeStr} WIB pada tanggal ${targetDateStr}.`);
    return true;
  };

  // Delete a task (by Leader)
  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    const updated = tasks.filter(t => t.id !== taskId);
    updateTasksStateAndCache(updated);

    if (taskToDelete) {
      triggerNotification(`Tugas "${taskToDelete.title}" telah dihapus.`);
    }
  };

  // Toggle status (from Pending to Selesai with optional completion notes)
  const handleToggleStatus = (taskId: string, notes?: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentDay = String(now.getDate()).padStart(2, '0');
      const currentDateStr = `${currentYear}-${currentMonth}-${currentDay}`;
      const currentHours = now.getHours();

      const isPastDay = currentDateStr > targetTask.dueDate;
      const isTodayPast9PM = currentDateStr === targetTask.dueDate && currentHours >= 21;

      if (isPastDay || isTodayPast9PM) {
        triggerNotification(`Gagal! Batas waktu checklist harian tugas ini telah melewati pukul 21:00 WIB pada hari target (${targetTask.dueDate}).`);
        return;
      }
    }

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const isDone = t.status === 'Selesai';
        const now = new Date();
        const formattedTimestamp = `2026-06-06 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        return {
          ...t,
          status: isDone ? 'Pending' as const : 'Selesai' as const,
          completedAt: isDone ? undefined : formattedTimestamp,
          completedNotes: isDone ? undefined : (notes || 'Tugas selesai diverifikasi oleh tim.')
        };
      }
      return t;
    });

    updateTasksStateAndCache(updated);
    triggerNotification('Status tugas berhasil diperbarui!');
  };

  // Add a new team member
  const handleAddMember = (newMember: TeamMember) => {
    setMembers(prev => [...prev, newMember]);
    triggerNotification(`Anggota tim "${newMember.name}" berhasil ditambahkan!`);
  };

  // Delete a team member
  const handleDeleteMember = (memberId: string) => {
    const toDelete = members.find(m => m.id === memberId);
    if (!toDelete) return;
    setMembers(prev => prev.filter(m => m.id !== memberId));
    
    // Fallback if deleting active member
    if (activeMember.id === memberId) {
      const remaining = members.filter(m => m.id !== memberId);
      if (remaining.length > 0) {
        setActiveMember(remaining[0]);
      }
    }
    triggerNotification(`Anggota "${toDelete.name}" berhasil dihilangkan dari tim.`);
  };

  // Edit an existing team member
  const handleEditMember = (updatedMember: TeamMember) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    if (activeMember.id === updatedMember.id) {
      setActiveMember(updatedMember);
    }
    triggerNotification(`Profil "${updatedMember.name}" berhasil diperbarui.`);
  };

  const triggerNotification = (msg: string) => {
    setSystemNotification(msg);
    setTimeout(() => {
      setSystemNotification(null);
    }, 4000);
  };

  const isLeader = activeMember.role === 'Leader';

  // Tasks falling on currently selected calendar day
  const tasksForSelectedDate = tasks.filter(task => isTaskActiveOnDate(task, selectedDate));
  
  // Specific tasks for active team member on clicked date
  const myTasksForSelectedDate = tasksForSelectedDate.filter(
    task => task.assignedToId === activeMember.id || task.assignedToId === 'all'
  );

  if (!isEntered) {
    return (
      <WelcomePortal
        members={members}
        activeMember={activeMember}
        onSelectMember={(mb) => {
          setActiveMember(mb);
          triggerNotification(`Simulasi diaktifkan: Bertindak sebagai ${mb.name}`);
        }}
        onEnterApp={() => {
          setIsEntered(true);
          triggerNotification(`Selamat datang di TaskFlow Divisi Finance, ${activeMember.name}!`);
        }}
        theme={theme}
      />
    );
  }

  return (
    <div className={`min-h-screen pb-12 font-sans selection:bg-indigo-100 antialiased transition-colors duration-200
      ${theme === 'dark' ? 'dark bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}
    `}>
      {/* Premium Navigation Top Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5 leading-none">
                TaskFlow Divisi Finance
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">Sistem Kolaborasi & Pemantauan Tugas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle Button */}
            <button
              onClick={() => {
                const nextTheme = theme === 'light' ? 'dark' : 'light';
                setTheme(nextTheme);
                triggerNotification(`Tema diubah ke Mode ${nextTheme === 'light' ? 'Terang' : 'Gelap'}`);
              }}
              title={theme === 'light' ? 'Aktifkan Mode Gelap' : 'Aktifkan Mode Terang'}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-indigo-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
              )}
            </button>

            {/* Keluar / Ubah Akun Button */}
            <button
              onClick={() => {
                setIsEntered(false);
                triggerNotification("Kembali ke portal awal.");
              }}
              title="Keluar / Ubah Akun"
              className="p-2 text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 gap-1.5 text-xs font-bold px-3"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">Ubah Akun</span>
            </button>

            {/* Clock Widget for Indonesia context */}
            <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-750 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-mono text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Sabtu, 06 Juni 2026</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Role sandbox notice for tester/user */}
        <RoleSelector 
          members={members} 
          activeMember={activeMember} 
          onSelectMember={(mb) => {
            setActiveMember(mb);
            triggerNotification(`Simulasi diaktifkan: Bertindak sebagai ${mb.name}`);
          }} 
        />

        {/* Global Floating Action Notification banner */}
        {systemNotification && (
          <div id="system-notification" className="fixed bottom-6 right-6 bg-slate-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700/55 z-50 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-semibold">{systemNotification}</p>
          </div>
        )}

        {/* Dynamic Dual Panel split: Main Control & Quick Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Calendar Panel (Takes 7 Cols on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            <CalendarView 
              tasks={tasks}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
              }}
              isTaskActiveOnDate={isTaskActiveOnDate}
            />
          </div>

          {/* RIGHT COLUMN: Interactive scheduler or Agenda info (Takes 5 Cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Always provide scheduling capabilities to everyone! (tim selain leader juga bisa memasukkan tugas) */}
            <TaskForm 
              tasks={tasks}
              members={members}
              onAddTask={handleAddTask}
              selectedDate={selectedDate}
            />

            {!isLeader ? (
              // IF Team Member: show quick checklist preview for the target calendar date
              <div id="quick-agenda" className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Tugas Anda Tanggal {selectedDate}</h3>
                    <p className="text-[10px] text-slate-400">Total terhitung {myTasksForSelectedDate.length} tugas personal hari ini</p>
                  </div>
                </div>

                {myTasksForSelectedDate.length > 0 ? (
                  <div className="space-y-2">
                    {myTasksForSelectedDate.map(task => {
                      const isCompleted = task.status === 'Selesai';
                      return (
                        <div 
                          key={task.id} 
                          className="flex items-start justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs gap-3"
                        >
                          <div className="space-y-1 pr-2">
                            <span className="font-bold text-slate-800 block">{task.title}</span>
                            <span className="text-[9px] text-slate-400 font-bold font-mono tracking-tight uppercase">Prioritas: {task.priority} | {task.type}</span>
                            {task.startTime && task.endTime ? (
                              <span className="block text-[9.5px] text-indigo-655 font-bold font-mono">Pukul: {task.startTime} - {task.endTime} WIB</span>
                            ) : task.dueTime ? (
                              <span className="block text-[9.5px] text-indigo-600 font-bold font-mono">Pukul: {task.dueTime} WIB</span>
                            ) : null}
                            {isCompleted && task.completedAt && (
                              <span className="block text-[8px] text-emerald-650 font-bold font-mono uppercase tracking-wider">Selesai: {task.completedAt}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {!isCompleted && (
                              <button
                                type="button"
                                onClick={() => setReallocateTask(task)}
                                className="px-1.5 py-1 text-[8.5px] font-bold rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition cursor-pointer"
                                title="Alihkan Jam Kerja"
                              >
                                Alihkan Jam
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setEditingTask(task)}
                              className="px-2 py-1 text-[9px] font-bold rounded bg-slate-100 text-slate-650 hover:bg-slate-200 transition cursor-pointer"
                              title="Edit Tugas"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (isCompleted) {
                                  handleToggleStatus(task.id);
                                } else {
                                  handleToggleStatus(task.id, 'Penyelesaian cepat via agenda sampingan');
                                }
                              }}
                              className={`px-2 py-1 text-[9px] select-none font-bold rounded transition-all cursor-pointer
                                ${isCompleted
                                  ? 'bg-emerald-550 text-white'
                                  : 'bg-white border border-slate-200 text-slate-650 hover:border-indigo-400 hover:bg-slate-50'
                                }
                              `}
                            >
                              {isCompleted ? 'Done' : 'Check'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-[10px] font-bold bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    Tidak ada agenda tugas Anda di tanggal {selectedDate}.
                  </div>
                )}
                
                <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-indigo-800 leading-normal font-sans">
                    Klik tanggal lain di kalender kiri untuk melihat agenda tanggal tersebut atau mengganti target pengerjaan.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Quick Overview on clicked date for Leader as well */}
            {isLeader && (
              <div id="quick-agenda-leader" className="bg-gradient-to-br from-indigo-950 to-slate-900 text-slate-100 rounded-xl p-4 shadow-sm border border-slate-850 space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-indigo-900">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider font-mono text-indigo-300">
                    Agenda Tim pada Tanggal: {selectedDate}
                  </h4>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/10">
                    {tasksForSelectedDate.length} Tugas
                  </span>
                </div>

                {tasksForSelectedDate.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {tasksForSelectedDate.map(tk => (
                      <div key={tk.id} className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 text-xs text-left">
                        <div>
                          <strong className="block text-slate-100 leading-tight">{tk.title}</strong>
                          <span className="text-[9px] text-slate-400 font-mono">Penerima: {tk.assignedToName} ({tk.type}) {tk.startTime && tk.endTime ? `| WIB: ${tk.startTime} - ${tk.endTime}` : tk.dueTime ? `| WIB: ${tk.dueTime}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {tk.status !== 'Selesai' && (
                            <button
                              type="button"
                              onClick={() => setReallocateTask(tk)}
                              className="bg-amber-550/20 text-amber-300 border border-amber-500/30 font-bold text-[8px] py-0.5 px-1.5 rounded hover:bg-amber-550/40"
                              title="Alihkan Jam Tugas Belum Selesai"
                            >
                              Alihkan Jam
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingTask(tk)}
                            className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-[8px] py-0.5 px-1.5 rounded hover:bg-indigo-500/40"
                          >
                            Edit
                          </button>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold font-mono uppercase tracking-wider
                            ${tk.status === 'Selesai' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'}
                          `}>
                            {tk.status === 'Selesai' ? 'Ready' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic font-mono uppercase font-bold tracking-wider py-2">Belum ada tugas terjadwal khusus untuk hari ini.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM COLUMN: Full Boards containing master analytics & detailed logs */}
        <section id="workflow-boards">
          {isLeader ? (
            <LeaderDashboard 
              tasks={tasks}
              members={members}
              onToggleStatus={handleToggleStatus}
              onDeleteTask={handleDeleteTask}
              selectedDate={selectedDate}
              isTaskActiveOnDate={isTaskActiveOnDate}
              onAddMember={handleAddMember}
              onDeleteMember={handleDeleteMember}
              onEditMember={handleEditMember}
              onEditTask={(task) => setEditingTask(task)}
              onReallocateTime={(task) => setReallocateTask(task)}
            />
          ) : (
            <TeamBoard 
              activeMember={activeMember}
              tasks={tasks}
              onToggleStatus={handleToggleStatus}
              selectedDate={selectedDate}
              isTaskActiveOnDate={isTaskActiveOnDate}
              onEditTask={(task) => setEditingTask(task)}
              onReallocateTime={(task) => setReallocateTask(task)}
            />
          )}
        </section>
      </main>

      {/* Global Task Editing Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                Edit Nama & Detail Tugas
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 rounded-md hover:bg-slate-150 cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editingTask.title.trim()) return;
              const success = handleEditTask(editingTask);
              if (success !== false) {
                setEditingTask(null);
              }
            }} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                  Nama Kegiatan / Tugas
                </label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                  Deskripsi Instruksi
                </label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  rows={2}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                    Tanggal Target
                  </label>
                  <input
                    type="date"
                    required
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 animate-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={editingTask.startTime || '08:00'}
                    onChange={(e) => setEditingTask({ ...editingTask, startTime: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={editingTask.endTime || '17:00'}
                    onChange={(e) => setEditingTask({ ...editingTask, endTime: e.target.value, dueTime: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                    Ditugaskan Ke
                  </label>
                  <select
                    value={editingTask.assignedToId}
                    onChange={(e) => {
                      const mId = e.target.value;
                      const m = mId === 'all' ? { name: 'Semua Anggota' } : members.find(item => item.id === mId);
                      setEditingTask({
                        ...editingTask,
                        assignedToId: mId,
                        assignedToName: m ? m.name : 'Unknown'
                      });
                    }}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">Semua Anggota Tim</option>
                    {members.map(mb => (
                      <option key={mb.id} value={mb.id}>{mb.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                    Tingkat Prioritas
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Rendah">Rendah</option>
                    <option value="Sedang font-bold">Sedang</option>
                    <option value="Tinggi text-indigo-650">Tinggi</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Shift/Reallocate Time Modal for Pending Tasks */}
      {reallocateTask && (
        <div id="reallocate-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-950 dark:text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping inline-block" />
                Pengalihan Jam Tugas
              </h3>
              <button
                type="button"
                onClick={() => setReallocateTask(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 rounded hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-lg text-[11px] leading-relaxed text-slate-700 dark:text-slate-350 dark:bg-slate-800/40 dark:border-slate-700">
              <span className="block font-bold text-slate-900 dark:text-amber-400 mb-0.5">Tugas yang dialihkan:</span>
              <strong className="block text-indigo-650 dark:text-indigo-400 font-mono text-[11.5px] uppercase font-semibold leading-tight">{reallocateTask.title}</strong>
              <span className="block text-[9px] text-slate-400 font-mono mt-1">PJ: {reallocateTask.assignedToName} | Saat ini: {reallocateTask.dueDate} {reallocateTask.dueTime ? `Pukul ${reallocateTask.dueTime}` : ''} WIB</span>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const ok = handleReallocateTime(reallocateTask.id, reallocateDate, reallocateTime);
              if (ok) {
                setReallocateTask(null);
              }
            }} className="space-y-3 text-left">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                    Pilih Tanggal Baru
                  </label>
                  <input
                    type="date"
                    required
                    value={reallocateDate}
                    onChange={(e) => {
                      setReallocateDate(e.target.value);
                      setRescheduleError(null);
                    }}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                    Pilih Jam Pengalihan Baru (WIB)
                  </label>
                  <input
                    type="time"
                    required
                    value={reallocateTime}
                    onChange={(e) => {
                      setReallocateTime(e.target.value);
                      setRescheduleError(null);
                    }}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {rescheduleError && (
                <div className="bg-rose-50 border border-rose-250 text-rose-700 rounded-lg p-2.5 text-[10px] font-bold flex items-start gap-1.5 animate-pulse">
                  <span>{rescheduleError}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setReallocateTask(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  Simpan Pengalihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Humble Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
        <p>&copy; 2026 TaskFlow Collaboration Suite &bull; Dirancang Khusus Secara Profesional untuk Rosita Djamaluddin & Tim</p>
      </footer>
    </div>
  );
}
