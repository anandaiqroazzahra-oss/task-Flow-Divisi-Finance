import React, { useState } from 'react';
import { Calendar, CheckSquare, Plus, PlusCircle, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import { Task, TaskType, TeamMember, TaskRecurrence } from '../types';

interface TaskFormProps {
  tasks: Task[];
  members: TeamMember[];
  onAddTask: (task: Task) => void;
  selectedDate: string; // The current clicked calendar date to prefill!
}

const INDONESIAN_WEEK_DAYS = [
  { label: 'Min', value: 0 },
  { label: 'Sen', value: 1 },
  { label: 'Sel', value: 2 },
  { label: 'Rab', value: 3 },
  { label: 'Kam', value: 4 },
  { label: 'Jum', value: 5 },
  { label: 'Sab', value: 6 }
];

export default function TaskForm({
  tasks,
  members,
  onAddTask,
  selectedDate
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('Harian');
  const [priority, setPriority] = useState<'Rendah' | 'Sedang' | 'Tinggi'>('Sedang');
  const [assignedToId, setAssignedToId] = useState('all');
  const [targetDate, setTargetDate] = useState(selectedDate);
  const [dueTime, setDueTime] = useState('17:00');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // States of weekly recurrence: array of selected days
  const [recurDays, setRecurDays] = useState<number[]>([]);

  // Update targetDate if parent selectedDate changes
  React.useEffect(() => {
    setTargetDate(selectedDate);
    setErrorMsg(null);
  }, [selectedDate]);

  const toggleDay = (dayVal: number) => {
    setRecurDays(prev => 
      prev.includes(dayVal)
        ? prev.filter(d => d !== dayVal)
        : [...prev, dayVal].sort()
    );
  };

  const applyPreset = (preset: 'all' | 'weekday' | 'weekend') => {
    if (preset === 'all') {
      setRecurDays([0, 1, 2, 3, 4, 5, 6]);
    } else if (preset === 'weekday') {
      setRecurDays([1, 2, 3, 4, 5]);
    } else {
      setRecurDays([0, 6]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (startTime >= endTime) {
      setErrorMsg(`Gagal! Jam Mulai (${startTime}) harus lebih awal dari Jam Selesai (${endTime}).`);
      return;
    }

    // Validate duplicate task on same day with same start and end hours
    const duplicate = tasks.find(t => t.dueDate === targetDate && t.startTime === startTime && t.endTime === endTime);
    if (duplicate) {
      setErrorMsg(`Gagal memasukkan tugas! Jadwal jam kerja (${startTime} - ${endTime}) sudah terisi oleh kegiatan: "${duplicate.title}" di hari tersebut.`);
      return;
    }
    setErrorMsg(null);

    const selectedMember = assignedToId === 'all' 
      ? { name: 'Semua Anggota' }
      : members.find(m => m.id === assignedToId);

    // Formulate recurrence values if type is Berulang
    let recurrenceData: TaskRecurrence | undefined;
    if (taskType === 'Berulang' && recurDays.length > 0) {
      const daysLabels = recurDays.map(val => {
        const d = INDONESIAN_WEEK_DAYS.find(item => item.value === val);
        return d ? d.label : '';
      }).filter(Boolean);

      recurrenceData = {
        days: recurDays,
        intervalText: `Setiap ${daysLabels.join(', ')}`
      };
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      assignedToId,
      assignedToName: selectedMember ? selectedMember.name : 'Unknown',
      dueDate: targetDate,
      dueTime: endTime,
      startTime: startTime,
      endTime: endTime,
      type: taskType,
      priority,
      status: 'Pending',
      recurrence: recurrenceData
    };

    onAddTask(newTask);

    // Reset Form
    setTitle('');
    setDescription('');
    setStartTime('08:00');
    setEndTime('17:00');
    setDueTime('17:00');
    setRecurDays([]);
  };

  return (
    <div id="add-task-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <PlusCircle className="w-4.5 h-4.5 flex-shrink-0" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Assign Tugas & Kegiatan Baru</h3>
          <p className="text-[10px] text-slate-400 font-mono">Tambahkan target harian, kegiatan rutin, atau jadwal berulang</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Title */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
            Nama Kegiatan / Tugas
          </label>
          <input
            type="text"
            required
            id="task-title-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Contoh: Mengirim revisi desain, Backup data..."
            className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none py-1.5 px-3 rounded-lg transition duration-150 text-slate-800"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
            Deskripsi Instruksi
          </label>
          <textarea
            id="task-desc-input"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Jelasakan rincian target kerja atau petunjuk pengerjaan..."
            rows={2}
            className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none py-1.5 px-3 rounded-lg transition duration-150 text-slate-800"
          />
        </div>

        {/* Task Type Switcher */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
            Pola Kejadian (Frekuensi)
          </label>
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(['Harian', 'Berulang'] as TaskType[]).map(type => (
              <button
                type="button"
                key={type}
                id={`type-btn-${type}`}
                onClick={() => setTaskType(type)}
                className={`py-1.5 text-[10px] font-bold rounded transition duration-150 cursor-pointer text-center
                  ${taskType === type 
                    ? 'bg-white text-indigo-600 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                  }
                `}
              >
                {type === 'Harian' && 'Harian'}
                {type === 'Berulang' && 'Berulang'}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Recurrence Days selector */}
        {taskType === 'Berulang' && (
          <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-755 flex items-center gap-1 font-mono uppercase">
                <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                Pilih Hari Berulang:
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => applyPreset('weekday')}
                  className="px-1.5 py-0.5 text-[8px] font-bold bg-white text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-100 transition"
                >
                  Workdays
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('weekend')}
                  className="px-1.5 py-0.5 text-[8px] font-bold bg-white text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-100 transition"
                >
                  Weekends
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-1 py-0.5">
              {INDONESIAN_WEEK_DAYS.map(day => {
                const isChecked = recurDays.includes(day.value);
                return (
                  <button
                    type="button"
                    key={day.value}
                    id={`day-checkbox-${day.value}`}
                    onClick={() => toggleDay(day.value)}
                    className={`flex-1 py-1 flex items-center justify-center text-[10px] font-bold rounded-md border transition duration-150 cursor-pointer
                      ${isChecked
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                      }
                    `}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>

            {recurDays.length === 0 && (
              <p className="text-[9px] text-amber-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                Harap pilih minimal 1 hari berulang agar tugas terjadwal otomatis.
              </p>
            )}
          </div>
        )}

        {/* Date, Priority and Assignment group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-lg border border-slate-200 mt-2">
          {/* Target date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
              Tanggal Mulai / Target
            </label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="date"
                required
                id="task-date-input"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none pl-8 pr-2 py-1.5 rounded-lg transition duration-150 text-slate-800"
              />
            </div>
          </div>

          {/* Jam Mulai */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
              Jam Mulai (Format 24 Jam)
            </label>
            <div className="relative font-mono">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] select-none font-bold">Mulai</span>
              <input
                type="time"
                required
                id="task-start-time-input"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none pl-12 pr-2 py-1.5 rounded-lg transition duration-150 text-slate-800"
              />
            </div>
          </div>

          {/* Jam Selesai */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
              Jam Selesai (Format 24 Jam)
            </label>
            <div className="relative font-mono">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] select-none font-bold">Selesai</span>
              <input
                type="time"
                required
                id="task-end-time-input"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none pl-14 pr-2 py-1.5 rounded-lg transition duration-150 text-slate-800"
              />
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
              Ditugaskan Ke
            </label>
            <div className="relative">
              <UserCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                id="task-assign-input"
                value={assignedToId}
                onChange={e => setAssignedToId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none pl-8 pr-2 py-1.5 rounded-lg transition duration-150 text-slate-800"
              >
                <option value="all">Semua Anggota Tim</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">
              Tingkat Prioritas
            </label>
            <select
              id="task-priority-input"
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="w-full text-xs bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none p-1.5 rounded-lg transition duration-150 text-slate-800"
            >
              <option value="Rendah">Rendah (Low)</option>
              <option value="Sedang">Sedang (Medium)</option>
              <option value="Tinggi">Tinggi (High)</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-250 text-rose-650 rounded-lg p-2.5 text-[10.5px] font-bold flex items-start gap-1.5 antialiased">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          id="task-submit-btn"
          disabled={taskType === 'Berulang' && recurDays.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white select-none font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <span>Post & Jadwalkan Tugas</span>
        </button>
      </form>
    </div>
  );
}
