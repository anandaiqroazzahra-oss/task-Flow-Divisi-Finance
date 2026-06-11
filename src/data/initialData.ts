import { TeamMember, Task } from '../types';

export const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'leader-1',
    name: 'Rosita Djamaluddin',
    role: 'Leader',
    position: 'Finance Manager & CFO',
    email: 'rositadjamaluddin7@gmail.com',
    avatarColor: 'bg-indigo-600 text-white',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150'
  },
  {
    id: 'member-1',
    name: 'Alex Iskandar',
    role: 'Anggota',
    position: 'Financial Analyst',
    email: 'alex.i@finance-workspace.com',
    avatarColor: 'bg-emerald-500 text-white',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150'
  },
  {
    id: 'member-2',
    name: 'Sarah Utami',
    role: 'Anggota',
    position: 'Account Payable Specialised',
    email: 'sarah.u@finance-workspace.com',
    avatarColor: 'bg-cyan-500 text-white',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150'
  },
  {
    id: 'member-3',
    name: 'Budi Saputra',
    role: 'Anggota',
    position: 'Tax Corporate Specialist',
    email: 'budi.s@finance-workspace.com',
    avatarColor: 'bg-amber-500 text-white',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150'
  },
  {
    id: 'member-4',
    name: 'Siti Rahma',
    role: 'Anggota',
    position: 'Internal Finance Auditor',
    email: 'siti.r@finance-workspace.com',
    avatarColor: 'bg-rose-500 text-white',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150'
  }
];

export const INITIAL_TASKS: Task[] = [
  // Routine tasks (Rutin)
  {
    id: 'task-1',
    title: 'Daily Standup Meeting',
    description: 'Sinkronisasi harian progres tim, blocker, dan prioritas hari ini.',
    assignedToId: 'all',
    assignedToName: 'Semua Anggota',
    dueDate: '2026-06-06',
    dueTime: '09:30',
    startTime: '09:00',
    endTime: '09:30',
    type: 'Rutin',
    status: 'Selesai',
    priority: 'Tinggi',
    completedAt: '2026-06-06 09:30',
    completedNotes: 'Berjalan lancar, semua update sudah terekam'
  },
  {
    id: 'task-2',
    title: 'Review Desain High-Fidelity',
    description: 'Review iterasi desain dashboard pemantauan tugas dari Sarah sebelum coding.',
    assignedToId: 'member-2',
    assignedToName: 'Sarah Utami',
    dueDate: '2026-06-06',
    dueTime: '15:00',
    startTime: '13:00',
    endTime: '15:00',
    type: 'Harian',
    status: 'Pending',
    priority: 'Sedang'
  },
  {
    id: 'task-3',
    title: 'Optimasi Endpoint API Database',
    description: 'Perbaikan kelemahan kueri berulang pada endpoint monitor tugas.',
    assignedToId: 'member-3',
    assignedToName: 'Budi Saputra',
    dueDate: '2026-06-07',
    dueTime: '12:00',
    startTime: '10:00',
    endTime: '12:00',
    type: 'Harian',
    status: 'Pending',
    priority: 'Tinggi'
  },
  // Recurring tasks (Berulang)
  {
    id: 'task-4',
    title: 'Laporan Mingguan Progres Tim',
    description: 'Penyusunan laporan ringkasan penyelesaian tugas untuk dikirim ke management.',
    assignedToId: 'leader-1',
    assignedToName: 'Rosita Djamaluddin',
    dueDate: '2026-06-08',
    dueTime: '17:00',
    startTime: '14:00',
    endTime: '17:00',
    type: 'Berulang',
    recurrence: {
      days: [1], // Senin
      intervalText: 'Setiap Senin'
    },
    status: 'Pending',
    priority: 'Tinggi'
  },
  {
    id: 'task-5',
    title: 'Sesi Evaluasi Sprint & Refinement',
    description: 'Evaluasi dua mingguan pencapaian tim dan penyusunan backlog tugas baru.',
    assignedToId: 'all',
    assignedToName: 'Semua Anggota',
    dueDate: '2026-06-10',
    dueTime: '11:00',
    startTime: '09:00',
    endTime: '11:00',
    type: 'Berulang',
    recurrence: {
      days: [3], // Rabu
      intervalText: 'Setiap Rabu'
    },
    status: 'Pending',
    priority: 'Sedang'
  },
  {
    id: 'task-6',
    title: 'Pengujian QA Menyeluruh (Sanity Test)',
    description: 'Sanity testing sistem berkala sebelum peluncuran fitur berulang.',
    assignedToId: 'member-4',
    assignedToName: 'Siti Rahma',
    dueDate: '2026-06-05',
    dueTime: '16:00',
    startTime: '13:00',
    endTime: '16:00',
    type: 'Berulang',
    recurrence: {
      days: [5], // Jumat
      intervalText: 'Setiap Jumat'
    },
    status: 'Selesai',
    priority: 'Sedang',
    completedAt: '2026-06-05 16:00',
    completedNotes: 'Selesai tanpa isu kritis baru'
  },
  {
    id: 'task-7',
    title: 'Backup Database Utama',
    description: 'Pemeliharaan server database otomatis mingguan malam hari.',
    assignedToId: 'member-3',
    assignedToName: 'Budi Saputra',
    dueDate: '2026-06-07',
    dueTime: '23:00',
    startTime: '22:00',
    endTime: '23:00',
    type: 'Berulang',
    recurrence: {
      days: [0], // Minggu
      intervalText: 'Setiap Minggu'
    },
    status: 'Pending',
    priority: 'Tinggi'
  }
];
