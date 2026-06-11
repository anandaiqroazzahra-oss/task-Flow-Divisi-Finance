import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Layers } from 'lucide-react';
import { Task, holiday } from '../types';
import { getHolidayForDate, INDONESIAN_HOLIDAYS_2026 } from '../data/holidays';

interface CalendarViewProps {
  tasks: Task[];
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  isTaskActiveOnDate: (task: Task, dateStr: string) => boolean;
}

export default function CalendarView({
  tasks,
  selectedDate,
  onSelectDate,
  isTaskActiveOnDate
}: CalendarViewProps) {
  // Let's default to June 2026 as the mock starts in June 2026
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(5); // 0-indexed, 5 = Juni

  const monthsList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Calculate days in the month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get index of first day of the month (0 = Sun, 1 = Mon ... 6 = Sat)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Navigate months
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const jumpToToday = () => {
    // Current time is 2026-06-06 based on system metadata
    setCurrentYear(2026);
    setCurrentMonth(5); // Juni
    onSelectDate('2026-06-06');
  };

  // Helper to format date numbers to YY-MM-DD
  const formatDateString = (dayNum: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    return `${currentYear}-${monthStr}-${dayStr}`;
  };

  // Collect holidays in current displayed month
  const currentMonthHolidays = INDONESIAN_HOLIDAYS_2026.filter(h => {
    const holidayDate = new Date(h.date);
    return holidayDate.getFullYear() === currentYear && holidayDate.getMonth() === currentMonth;
  });

  return (
    <div id="calendar-widget" className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <CalendarIcon className="w-4 h-4" id="calendar-icon" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Kalender Kerja Interaktif</h3>
            <p className="text-[10px] text-slate-400 font-mono">Pilih tanggal untuk memonitor & tambah tugas</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button 
            id="today-btn"
            onClick={jumpToToday}
            className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md hover:bg-indigo-100 transition duration-150 mr-1 cursor-pointer"
          >
            Hari Ini
          </button>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button 
              id="prev-month-btn"
              onClick={prevMonth}
              className="p-1 hover:bg-white rounded-md text-slate-600 hover:text-slate-900 transition cursor-pointer"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-bold text-slate-700 min-w-24 text-center">
              {monthsList[currentMonth]} {currentYear}
            </span>
            <button 
              id="next-month-btn"
              onClick={nextMonth}
              className="p-1 hover:bg-white rounded-md text-slate-600 hover:text-slate-900 transition cursor-pointer"
              aria-label="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekdays Labels */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 py-3 font-mono uppercase tracking-wider">
        {daysOfWeek.map((day, idx) => (
          <div 
            key={day} 
            className={`${idx === 0 ? 'text-red-500' : 'text-slate-400'}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid cells */}
      <div className="grid grid-cols-7 gap-1 mt-0.5">
        {/* Fill empty boxes before month start */}
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div 
            key={`empty-${idx}`} 
            className="aspect-square bg-slate-50/30 rounded-lg opacity-30 border border-transparent"
          />
        ))}

        {/* Render month day cells */}
        {Array.from({ length: totalDays }).map((_, idx) => {
          const dayNum = idx + 1;
          const dateStr = formatDateString(dayNum);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === '2026-06-06';
          
          // Check if Sunday (day index 0)
          const cellDate = new Date(currentYear, currentMonth, dayNum);
          const isSunday = cellDate.getDay() === 0;

          // Check for Indonesian National Holiday
          const holidayInfo = getHolidayForDate(dateStr);
          const isRedDay = holidayInfo !== undefined;
          
          // Get tasks resolved active on this specific date
          const dateTasks = tasks.filter(task => isTaskActiveOnDate(task, dateStr));
          const completedCount = dateTasks.filter(t => t.status === 'Selesai').length;
          const pendingCount = dateTasks.filter(t => t.status === 'Pending').length;

          return (
            <button
              key={`day-${dayNum}`}
              id={`calendar-cell-${dateStr}`}
              onClick={() => onSelectDate(dateStr)}
              className={`group relative aspect-square p-1.5 text-left rounded-lg border transition duration-150 flex flex-col justify-between overflow-hidden cursor-pointer
                ${isSelected 
                  ? 'bg-indigo-600 border-indigo-700 text-white min-h-[56px]' 
                  : isToday
                    ? 'bg-indigo-50/70 border-indigo-200 text-slate-800 font-bold'
                    : isRedDay
                      ? 'bg-red-100/70 border-red-200 hover:border-red-300 text-red-700 font-medium'
                      : isSunday
                        ? 'bg-red-50/60 border-red-100 hover:border-red-200 text-red-650'
                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }
              `}
            >
              {/* Day Number and Holiday Indicator */}
              <div className="flex items-start justify-between w-full">
                <span className={`text-xs font-bold font-mono leading-none
                  ${isSelected 
                    ? 'text-white' 
                    : isToday
                      ? 'text-indigo-600 ring-1 ring-indigo-400 ring-offset-1 rounded-md w-4.5 h-4.5 flex items-center justify-center bg-indigo-100'
                      : isRedDay || isSunday
                        ? 'text-red-600 font-bold'
                        : 'text-slate-700'
                  }
                `}>
                  {dayNum}
                </span>

                {isRedDay && (
                  <span className={`w-1 h-1 rounded-full ring-1 ${isSelected ? 'bg-white ring-indigo-600' : 'bg-red-500 ring-white'}`} />
                )}
              </div>

              {/* Tasks bullet list / dynamic count */}
              <div className="w-full mt-1">
                {dateTasks.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {/* Compact layout on small cells: progress indicators */}
                    <div className="flex flex-wrap gap-1 max-h-[18px] overflow-hidden">
                      {dateTasks.map(t => (
                        <span 
                          key={t.id}
                          title={`${t.title} (${t.assignedToName})`}
                          className={`w-2 h-2 rounded-full 
                            ${isSelected 
                              ? 'bg-white/90' 
                              : t.status === 'Selesai'
                                ? 'bg-emerald-500 font-bold'
                                : t.priority === 'Tinggi'
                                  ? 'bg-rose-500 font-bold'
                                  : t.priority === 'Sedang'
                                    ? 'bg-amber-500 font-bold'
                                    : 'bg-slate-400 font-bold'
                            }
                          `}
                        />
                      ))}
                    </div>
                    {/* Text status for visual density */}
                    <span className={`text-[8.5px] font-bold leading-none font-mono block truncate
                      ${isSelected ? 'text-indigo-150' : 'text-slate-500'}
                    `}>
                      {completedCount}/{dateTasks.length} Selesai
                    </span>
                  </div>
                ) : (
                  // Empty state minimal label for holiday
                  isRedDay && !isSelected && (
                    <span className="text-[8px] text-red-500 font-bold leading-none truncate block w-full max-w-full">
                      Libur
                    </span>
                  )
                )}
              </div>

              {/* Hover Details overlay for Holiday */}
              {isRedDay && !isSelected && (
                <div className="absolute inset-0 bg-red-600/90 hidden group-hover:flex flex-col justify-center p-1 text-center text-white z-10 transition duration-150">
                  <span className="text-[8px] font-bold truncate leading-none">{holidayInfo?.name}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Footer Legends */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-500">
        <div className="flex flex-wrap gap-2.5 items-center">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 block" /> Selesai
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 block" /> Tinggi
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 block" /> Sedang
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400 block" /> Libur
          </span>
        </div>
        
        {/* Dynamic holiday panel message */}
        {getHolidayForDate(selectedDate) && (
          <div className="flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-100 font-medium">
            <Info className="w-3 h-3 text-red-500" />
            <span>{getHolidayForDate(selectedDate)?.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
