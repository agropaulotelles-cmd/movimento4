import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
  RotateCcw,
  Check,
} from 'lucide-react';

interface CalendarDatePickerProps {
  startDate?: string; // format YYYY-MM-DD
  endDate?: string;   // format YYYY-MM-DD
  onApply: (startDate?: string, endDate?: string) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateYMD(str?: string): Date | null {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return isNaN(date.getTime()) ? null : date;
}

export const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  startDate,
  endDate,
  onApply,
  onClose,
}) => {
  const initialDate = parseDateYMD(startDate) || parseDateYMD(endDate) || new Date();
  const [viewDate, setViewDate] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const [tempStart, setTempStart] = useState<string | undefined>(startDate);
  const [tempEnd, setTempEnd] = useState<string | undefined>(endDate);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Days in current month
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  // Handle day click for range selection
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const dateStr = formatDateYMD(clickedDate);

    if (!tempStart || (tempStart && tempEnd)) {
      // First click: start new range
      setTempStart(dateStr);
      setTempEnd(undefined);
    } else if (tempStart && !tempEnd) {
      // Second click
      if (dateStr < tempStart) {
        setTempEnd(tempStart);
        setTempStart(dateStr);
      } else {
        setTempEnd(dateStr);
      }
    }
  };

  // Quick preset shortcuts
  const applyPreset = (preset: 'hoje' | 'ontem' | '7dias' | '30dias' | 'esteMes' | 'mesAnterior') => {
    const refDate = new Date(); // dynamic today
    let start: Date;
    let end: Date = new Date(refDate);

    if (preset === 'hoje') {
      start = new Date(refDate);
    } else if (preset === 'ontem') {
      start = new Date(refDate);
      start.setDate(refDate.getDate() - 1);
      end = new Date(start);
    } else if (preset === '7dias') {
      start = new Date(refDate);
      start.setDate(refDate.getDate() - 6);
    } else if (preset === '30dias') {
      start = new Date(refDate);
      start.setDate(refDate.getDate() - 29);
    } else if (preset === 'esteMes') {
      start = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
      end = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
    } else {
      // mesAnterior
      start = new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1);
      end = new Date(refDate.getFullYear(), refDate.getMonth(), 0);
    }

    const sStr = formatDateYMD(start);
    const eStr = formatDateYMD(end);
    setTempStart(sStr);
    setTempEnd(eStr);
    setViewDate(new Date(start.getFullYear(), start.getMonth(), 1));
  };

  const handleClear = () => {
    setTempStart(undefined);
    setTempEnd(undefined);
    onApply(undefined, undefined);
    onClose();
  };

  const handleConfirm = () => {
    onApply(tempStart, tempEnd || tempStart);
    onClose();
  };

  // Format date for display in PT-BR
  const formatDisplayBR = (str?: string) => {
    if (!str) return '---';
    const parts = str.split('-');
    if (parts.length !== 3) return str;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="w-[340px] sm:w-[500px] bg-[#0c1424] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-xs flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#090e1a]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white">Filtrar Intervalo de Data</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
        {/* Left Side: Quick Presets */}
        <div className="p-3 bg-[#080d18] w-full sm:w-36 flex sm:flex-col gap-1.5 flex-wrap shrink-0">
          <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider px-1 hidden sm:block mb-1">
            Atalhos
          </span>
          <button
            type="button"
            onClick={() => applyPreset('hoje')}
            className="px-2.5 py-1.5 text-left rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => applyPreset('ontem')}
            className="px-2.5 py-1.5 text-left rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs"
          >
            Ontem
          </button>
          <button
            type="button"
            onClick={() => applyPreset('7dias')}
            className="px-2.5 py-1.5 text-left rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs"
          >
            Últimos 7 Dias
          </button>
          <button
            type="button"
            onClick={() => applyPreset('30dias')}
            className="px-2.5 py-1.5 text-left rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs"
          >
            Últimos 30 Dias
          </button>
          <button
            type="button"
            onClick={() => applyPreset('esteMes')}
            className="px-2.5 py-1.5 text-left rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs"
          >
            Este Mês
          </button>
          <button
            type="button"
            onClick={() => applyPreset('mesAnterior')}
            className="px-2.5 py-1.5 text-left rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs"
          >
            Mês Anterior
          </button>
        </div>

        {/* Right Side: Interactive Calendar Month Grid */}
        <div className="p-4 flex-1 space-y-3">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 text-sm">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Mês anterior"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                title="Próximo mês"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center font-medium text-slate-500 text-[11px]">
            {WEEKDAY_NAMES.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-8" />;
              }

              const dDate = new Date(currentYear, currentMonth, day);
              const dateStr = formatDateYMD(dDate);

              const isStart = tempStart === dateStr;
              const isEnd = tempEnd === dateStr;
              const isSingleSelected = isStart && (!tempEnd || tempEnd === tempStart);

              let inRange = false;
              if (tempStart && tempEnd) {
                inRange = dateStr >= tempStart && dateStr <= tempEnd;
              } else if (tempStart && hoveredDate && !tempEnd) {
                const s = tempStart < hoveredDate ? tempStart : hoveredDate;
                const e = tempStart < hoveredDate ? hoveredDate : tempStart;
                inRange = dateStr >= s && dateStr <= e;
              }

              const isToday = dateStr === formatDateYMD(new Date());

              return (
                <div
                  key={`day-${day}`}
                  className={`h-8 flex items-center justify-center relative ${
                    inRange && !isStart && !isEnd ? 'bg-cyan-950/40 text-cyan-200' : ''
                  } ${isStart && tempEnd ? 'rounded-l-lg bg-cyan-950/60' : ''} ${
                    isEnd && tempStart ? 'rounded-r-lg bg-cyan-950/60' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleDateClick(day)}
                    onMouseEnter={() => setHoveredDate(dateStr)}
                    onMouseLeave={() => setHoveredDate(null)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono flex items-center justify-center transition-all cursor-pointer ${
                      isStart || isEnd || isSingleSelected
                        ? 'bg-cyan-600 text-white font-bold shadow-sm shadow-cyan-900/60'
                        : inRange
                        ? 'text-cyan-300 font-semibold'
                        : isToday
                        ? 'border border-cyan-500/80 text-cyan-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Selected Range Summary Bar */}
          <div className="p-2.5 rounded-lg bg-[#080d17] border border-slate-800 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Período:</span>
              <span className="font-mono text-cyan-300 font-semibold">
                {tempStart ? formatDisplayBR(tempStart) : 'Selecione início'}
              </span>
              <span>até</span>
              <span className="font-mono text-cyan-300 font-semibold">
                {tempEnd ? formatDisplayBR(tempEnd) : tempStart ? formatDisplayBR(tempStart) : 'Selecione fim'}
              </span>
            </div>

            {tempStart && (
              <span className="text-[10px] text-slate-500">
                {tempEnd && tempEnd !== tempStart ? 'Intervalo' : 'Dia único'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-[#090e1a]">
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1 text-slate-400 hover:text-white text-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpar</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm shadow-cyan-900/40"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Aplicar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
