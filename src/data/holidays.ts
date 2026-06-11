import { holiday } from '../types';

export const INDONESIAN_HOLIDAYS_2026: holiday[] = [
  // Januari 2026
  { date: '2026-01-01', name: 'Tahun Baru 2026 Masehi', description: 'Libur Nasional' },
  { date: '2026-01-15', name: 'Isra Mi\'raj Nabi Muhammad SAW', description: 'Libur Nasional' },

  // Februari 2026
  { date: '2026-02-16', name: 'Cuti Bersama Tahun Baru Imlek 2577 Kongzili', description: 'Cuti Bersama' },
  { date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili', description: 'Libur Nasional' },

  // Maret 2026
  { date: '2026-03-18', name: 'Cuti Bersama Hari Suci Nyepi (Saka 1948)', description: 'Cuti Bersama' },
  { date: '2026-03-19', name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)', description: 'Libur Nasional' },
  { date: '2026-03-20', name: 'Hari Raya Idul Fitri 1447 H', description: 'Libur Nasional' },
  { date: '2026-03-21', name: 'Hari Raya Idul Fitri Hari Ke-2', description: 'Libur Nasional' },
  { date: '2026-03-23', name: 'Cuti Bersama Hari Raya Idul Fitri 1447 H', description: 'Cuti Bersama' },
  { date: '2026-03-24', name: 'Cuti Bersama Hari Raya Idul Fitri 1447 H', description: 'Cuti Bersama' },
  { date: '2026-03-25', name: 'Cuti Bersama Hari Raya Idul Fitri 1447 H', description: 'Cuti Bersama' },
  { date: '2026-03-26', name: 'Cuti Bersama Hari Raya Idul Fitri 1447 H', description: 'Cuti Bersama' },

  // April 2026
  { date: '2026-04-03', name: 'Wafat Yesus Kristus', description: 'Libur Nasional' },
  { date: '2026-04-05', name: 'Hari Paskah', description: 'Keagamaan' },

  // Mei 2026
  { date: '2026-05-01', name: 'Hari Buruh Internasional', description: 'Libur Nasional' },
  { date: '2026-05-14', name: 'Kenaikan Yesus Kristus', description: 'Libur Nasional' },
  { date: '2026-05-15', name: 'Cuti Bersama Kenaikan Yesus Kristus', description: 'Cuti Bersama' },
  { date: '2026-05-26', name: 'Cuti Bersama Hari Raya Waisak 2570 BE', description: 'Cuti Bersama' },
  { date: '2026-05-27', name: 'Hari Raya Waisak 2570 BE', description: 'Libur Nasional' },
  { date: '2026-05-28', name: 'Hari Raya Idul Adha 1447 H', description: 'Libur Nasional' },
  { date: '2026-05-29', name: 'Cuti Bersama Hari Raya Idul Adha 1447 H', description: 'Cuti Bersama' },

  // Juni 2026
  { date: '2026-06-01', name: 'Hari Lahir Pancasila', description: 'Libur Nasional' },
  { date: '2026-06-16', name: 'Tahun Baru Islam 1448 H', description: 'Libur Nasional' },

  // Agustus 2026
  { date: '2026-08-17', name: 'Hari Kemerdekaan RI Ke-81', description: 'Libur Nasional' },
  { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW', description: 'Libur Nasional' },

  // November 2026
  { date: '2026-11-25', name: 'Hari Guru Nasional', description: 'Hari Apresiasi Guru (Bukan Libur Resmi)' },

  // Desember 2026
  { date: '2026-12-24', name: 'Cuti Bersama Hari Raya Natal', description: 'Cuti Bersama' },
  { date: '2026-12-25', name: 'Hari Raya Natal', description: 'Libur Nasional' },
  { date: '2026-12-28', name: 'Cuti Bersama Hari Raya Natal', description: 'Cuti Bersama' }
];

export function getHolidayForDate(dateStr: string): holiday | undefined {
  return INDONESIAN_HOLIDAYS_2026.find(h => h.date === dateStr);
}
