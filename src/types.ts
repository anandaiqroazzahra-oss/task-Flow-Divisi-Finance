export type TaskType = 'Rutin' | 'Harian' | 'Berulang';

export interface TaskRecurrence {
  days: number[]; // 0 = Minggu, 1 = Senin, ... 6 = Sabtu
  intervalText?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToId: string; // TeamMember.id
  assignedToName: string; // TeamMember.name
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  type: TaskType;
  recurrence?: TaskRecurrence;
  status: 'Pending' | 'Selesai';
  completedAt?: string; // YYYY-MM-DD HH:mm
  completedNotes?: string;
  priority: 'Rendah' | 'Sedang' | 'Tinggi';
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Leader' | 'Anggota';
  position: string;
  email: string;
  avatarColor: string; // Tailwind class
  photoUrl?: string; // Base64 or Image URL
}

export interface holiday {
  date: string; // YYYY-MM-DD
  name: string;
  description?: string;
}
