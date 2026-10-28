import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Calendar,
  SlidersHorizontal,
  Columns3,
  Download,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';
import { FilterState } from '../types/dispatch';
import { CalendarDatePicker } from './CalendarDatePicker';

interface TableToolbarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onOpenNewDispatchModal?: () => void;
  onOpenAdvancedFilters: () => void;
  onOpenExportModal: () => void;
  columnVisibility: Record<string, boolean>;
  onToggleColumn: (colKey: string) => void;
  activeFilterCount: number;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  filters,
  onFilterChange,
  pageSize,
  onPageSizeChange,
  onOpenNewDispatchModal,
  onOpenAdvancedFilters,
  onOpenExportModal,
  columnVisibility,
  onToggleColumn,
  activeFilterCount,
}) => {
  const [showColumnsPopover, setShowColumnsPopover] = useState(false);
  const [showDatePopover, setShowDatePopover] = useState(false);
  const columnsRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) {
        setShowColumnsPopover(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setShowDatePopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const columnLabels: Record<string, string> = {
    id: 'ID Movimentação (PK)',
    motorista: 'Motorista',
    placa: 'Placa do Veículo',
    dataHora: 'Data / Hora do Carregamento',
    totalPaletes: 'Total Paletes (PLT)',
    totalPacotes: 'Total Pacotes (PCT)',
    totalUnidades: 'Total Unidades Expedidas',
    detalhes: 'Ações / Detalhes',
  };

  const formatDisplayBR = (str?: string) => {
    if (!str) return '';
    const parts = str.slice(0, 10).split('-');
    if (parts.length !== 3) return str;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const hasDateFilter = Boolean(filters.dataInicio || filters.dataFim);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
      {/* Left side: Search & Date Filter */}
      <div className="flex items-center gap-2 flex-1 max-w-xl">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Buscar motorista, placa ou ID..."
            className="w-full bg-[#0b1220] border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtrar por Data button & Popover */}
        <div className="relative" ref={dateRef}>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setShowDatePopover(!showDatePopover)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer whitespace-nowrap ${
                hasDateFilter
                  ? 'bg-cyan-950/70 border-cyan-500/80 text-cyan-300 font-medium'
                  : 'bg-[#0b1220] border-slate-800 text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {hasDateFilter
                  ? filters.dataFim && filters.dataFim !== filters.dataInicio
                    ? `${formatDisplayBR(filters.dataInicio)} - ${formatDisplayBR(filters.dataFim)}`
                    : `${formatDisplayBR(filters.dataInicio)}`
                  : 'Filtrar por Data...'}
              </span>
            </button>
            {hasDateFilter && (
              <button
                type="button"
                onClick={() => onFilterChange({ dataInicio: undefined, dataFim: undefined })}
                title="Limpar filtro de data"
                className="ml-1 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {showDatePopover && (
            <div className="absolute left-0 mt-1.5 z-40">
              <CalendarDatePicker
                startDate={filters.dataInicio}
                endDate={filters.dataFim}
                onApply={(start, end) => {
                  onFilterChange({ dataInicio: start, dataFim: end });
                }}
                onClose={() => setShowDatePopover(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {/* Mais Filtros button */}
        <button
          type="button"
          onClick={onOpenAdvancedFilters}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer whitespace-nowrap ${
            activeFilterCount > 0
              ? 'bg-purple-950/60 border-purple-500 text-purple-300 font-medium'
              : 'bg-[#0b1220] border-slate-800 text-slate-300 hover:bg-slate-800/80'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>Mais Filtros</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Colunas popover */}
        <div className="relative" ref={columnsRef}>
          <button
            type="button"
            onClick={() => setShowColumnsPopover(!showColumnsPopover)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-800 bg-[#0b1220] text-slate-300 hover:bg-slate-800/80 text-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Columns3 className="w-3.5 h-3.5 text-slate-400" />
            <span>Colunas</span>
          </button>

          {showColumnsPopover && (
            <div className="absolute right-0 mt-1.5 w-60 bg-[#0d1627] border border-slate-800 rounded-xl shadow-xl z-30 p-2.5 text-xs space-y-1.5">
              <div className="font-semibold text-slate-200 px-1 py-1 border-b border-slate-800 mb-1">
                Colunas Visíveis
              </div>
              {Object.entries(columnLabels).map(([colKey, label]) => {
                const isChecked = columnVisibility[colKey] !== false;
                return (
                  <button
                    key={colKey}
                    type="button"
                    onClick={() => onToggleColumn(colKey)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 text-left cursor-pointer"
                  >
                    <span>{label}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked
                          ? 'bg-cyan-600 border-cyan-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Exportar button */}
        <button
          type="button"
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-800 bg-[#0b1220] text-slate-300 hover:bg-slate-800/80 text-xs transition-colors cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Exportar</span>
        </button>

        {/* Linhas selector */}
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="appearance-none bg-[#0b1220] border border-slate-800 text-slate-300 hover:bg-slate-800/80 rounded-lg pl-3 pr-7 py-2 text-xs cursor-pointer focus:outline-none focus:border-slate-700"
          >
            <option value={10}>10 Linhas</option>
            <option value={25}>25 Linhas</option>
            <option value={50}>50 Linhas</option>
            <option value={100}>100 Linhas</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
