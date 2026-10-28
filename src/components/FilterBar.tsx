import React, { useState, useRef, useEffect } from 'react';
import { User, Calendar, CreditCard, X } from 'lucide-react';
import { MOTORISTAS_LIST, PLACAS_RECENTES } from '../data/mockDispatches';
import { FilterState } from '../types/dispatch';
import { CalendarDatePicker } from './CalendarDatePicker';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters?: () => void;
  availableDrivers?: string[];
  availablePlates?: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  availableDrivers = MOTORISTAS_LIST,
  availablePlates = PLACAS_RECENTES,
}) => {
  const currentMotorista = filters.motorista || 'Todos os Motoristas';

  const periodos: Array<{ id: FilterState['periodo']; label: string }> = [
    { id: 'tudo', label: 'Tudo' },
    { id: 'hoje', label: 'Hoje' },
    { id: '7dias', label: '7 Dias' },
    { id: '30dias', label: '30 Dias' },
  ];

  const [showCalendarPopover, setShowCalendarPopover] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendarPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasCustomDate = Boolean(filters.dataInicio || filters.dataFim);

  return (
    <div className="bg-[#0b1220]/70 border border-slate-800/80 rounded-xl p-3 space-y-2.5 text-xs">
      {/* Row 1: Motoristas & Período */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Motorista selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium whitespace-nowrap shrink-0 pr-1">
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span>Motorista:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {availableDrivers.map((driver) => {
              const isSelected =
                (driver === 'Todos os Motoristas' && (currentMotorista === 'Todos os Motoristas' || currentMotorista === 'todos')) ||
                currentMotorista.toLowerCase() === driver.toLowerCase();

              return (
                <button
                  key={driver}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      motorista: driver === 'Todos os Motoristas' ? 'Todos os Motoristas' : driver,
                    })
                  }
                  className={`px-3 py-1 rounded-md transition-all duration-150 whitespace-nowrap cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-[#a855f7] text-white font-semibold shadow-sm shadow-purple-900/40'
                      : 'bg-[#0f172a] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {driver}
                </button>
              );
            })}
          </div>
        </div>

        {/* Período */}
        <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Período:</span>
          </div>

          <div className="flex items-center gap-1 bg-[#0f172a] p-0.5 rounded-lg border border-slate-800">
            {periodos.map((p) => {
              const isActive = filters.periodo === p.id && !hasCustomDate;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onFilterChange({
                      periodo: p.id,
                      dataInicio: undefined,
                      dataFim: undefined,
                    });
                  }}
                  className={`px-2.5 py-0.5 rounded text-xs transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1e293b] text-white font-medium shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}

            {/* Calendário Popover Trigger */}
            <div className="relative flex items-center" ref={calendarRef}>
              <button
                type="button"
                onClick={() => setShowCalendarPopover(!showCalendarPopover)}
                title="Abrir Calendário Interativo"
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs transition-all cursor-pointer whitespace-nowrap ${
                  hasCustomDate
                    ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3 h-3 text-cyan-300" />
                <span>
                  {hasCustomDate && filters.dataInicio
                    ? filters.dataFim && filters.dataFim !== filters.dataInicio
                      ? `${filters.dataInicio.slice(8, 10)}/${filters.dataInicio.slice(5, 7)} - ${filters.dataFim.slice(8, 10)}/${filters.dataFim.slice(5, 7)}`
                      : `${filters.dataInicio.slice(8, 10)}/${filters.dataInicio.slice(5, 7)}/${filters.dataInicio.slice(0, 4)}`
                    : 'Calendário'}
                </span>
              </button>

              {hasCustomDate && (
                <button
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      dataInicio: undefined,
                      dataFim: undefined,
                      periodo: 'tudo',
                    })
                  }
                  title="Limpar filtro de data"
                  className="ml-0.5 p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {showCalendarPopover && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <CalendarDatePicker
                    startDate={filters.dataInicio}
                    endDate={filters.dataFim}
                    onApply={(start, end) => {
                      onFilterChange({
                        dataInicio: start,
                        dataFim: end,
                        periodo: start ? 'custom' : 'tudo',
                      });
                    }}
                    onClose={() => setShowCalendarPopover(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Placas Recentes */}
      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium whitespace-nowrap shrink-0 pr-1">
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          <span>Placas Recentes:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {availablePlates.map((placa) => {
            const isSelected = filters.placa.toUpperCase() === placa.toUpperCase();
            return (
              <button
                key={placa}
                type="button"
                onClick={() =>
                  onFilterChange({
                    placa: isSelected ? '' : placa,
                  })
                }
                title={isSelected ? 'Clique para desmarcar' : `Filtrar por placa ${placa}`}
                className={`font-mono text-xs px-2.5 py-0.5 rounded border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 font-bold shadow-xs'
                    : 'bg-[#0e1627] border-slate-700/80 text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
              >
                <span>{placa}</span>
                {isSelected && <X className="w-3 h-3 text-cyan-400" />}
              </button>
            );
          })}

          {filters.placa && (
            <button
              type="button"
              onClick={() => onFilterChange({ placa: '' })}
              className="text-[11px] text-slate-500 hover:text-slate-300 underline underline-offset-2 ml-1"
            >
              Limpar placa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
