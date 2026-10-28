import React, { useState } from 'react';
import { X, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';
import { FilterState } from '../types/dispatch';
import { MOTORISTAS_LIST, PLACAS_RECENTES } from '../data/mockDispatches';

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

export const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  if (!isOpen) return null;

  const [minPaletes, setMinPaletes] = useState(filters.minPaletes?.toString() || '');
  const [maxPaletes, setMaxPaletes] = useState(filters.maxPaletes?.toString() || '');
  const [minPacotes, setMinPacotes] = useState(filters.minPacotes?.toString() || '');
  const [maxPacotes, setMaxPacotes] = useState(filters.maxPacotes?.toString() || '');
  const [minUnidades, setMinUnidades] = useState(filters.minUnidades?.toString() || '');
  const [maxUnidades, setMaxUnidades] = useState(filters.maxUnidades?.toString() || '');
  const [motorista, setMotorista] = useState(filters.motorista || 'Todos os Motoristas');
  const [placa, setPlaca] = useState(filters.placa || '');
  const [produto, setProduto] = useState(filters.produto || '');
  const [lote, setLote] = useState(filters.lote || '');

  const handleApply = () => {
    onApplyFilters({
      minPaletes: minPaletes ? Number(minPaletes) : undefined,
      maxPaletes: maxPaletes ? Number(maxPaletes) : undefined,
      minPacotes: minPacotes ? Number(minPacotes) : undefined,
      maxPacotes: maxPacotes ? Number(maxPacotes) : undefined,
      minUnidades: minUnidades ? Number(minUnidades) : undefined,
      maxUnidades: maxUnidades ? Number(maxUnidades) : undefined,
      motorista,
      placa,
      produto: produto || undefined,
      lote: lote || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setMinPaletes('');
    setMaxPaletes('');
    setMinPacotes('');
    setMaxPacotes('');
    setMinUnidades('');
    setMaxUnidades('');
    setMotorista('Todos os Motoristas');
    setPlaca('');
    setProduto('');
    setLote('');
    onResetFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#0c1424] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090e1a]">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Filtros Avançados de Expedição</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Motorista & Placa */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">Motorista</label>
              <select
                value={motorista}
                onChange={(e) => setMotorista(e.target.value)}
                className="w-full bg-[#070b13] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                {MOTORISTAS_LIST.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">Placa do Veículo</label>
              <select
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                className="w-full bg-[#070b13] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="">Todas as Placas</option>
                {PLACAS_RECENTES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Produto & Lote */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">Produto</label>
              <input
                type="text"
                placeholder="Ex: 315 ml, 10 lt, 1,5 Gota..."
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                className="w-full bg-[#070b13] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">Lote</label>
              <input
                type="text"
                placeholder="Ex: 127, 103, 1..."
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                className="w-full bg-[#070b13] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Faixa de Paletes (PLT) */}
          <div className="space-y-1.5 p-3 rounded-lg bg-[#070b13] border border-slate-800">
            <span className="text-[11px] text-cyan-400 font-semibold block">Faixa de Paletes (PLT)</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Mínimo (ex: 20)"
                value={minPaletes}
                onChange={(e) => setMinPaletes(e.target.value)}
                className="w-full bg-[#0c1424] border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono"
              />
              <input
                type="number"
                placeholder="Máximo (ex: 45)"
                value={maxPaletes}
                onChange={(e) => setMaxPaletes(e.target.value)}
                className="w-full bg-[#0c1424] border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          {/* Faixa de Pacotes (PCT) */}
          <div className="space-y-1.5 p-3 rounded-lg bg-[#070b13] border border-slate-800">
            <span className="text-[11px] text-amber-400 font-semibold block">Faixa de Pacotes (PCT)</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Mínimo (ex: 0)"
                value={minPacotes}
                onChange={(e) => setMinPacotes(e.target.value)}
                className="w-full bg-[#0c1424] border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono"
              />
              <input
                type="number"
                placeholder="Máximo (ex: 150)"
                value={maxPacotes}
                onChange={(e) => setMaxPacotes(e.target.value)}
                className="w-full bg-[#0c1424] border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          {/* Faixa de Unidades Expedidas */}
          <div className="space-y-1.5 p-3 rounded-lg bg-[#070b13] border border-slate-800">
            <span className="text-[11px] text-emerald-400 font-semibold block">Faixa de Unidades Expedidas</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Mínimo (ex: 1000)"
                value={minUnidades}
                onChange={(e) => setMinUnidades(e.target.value)}
                className="w-full bg-[#0c1424] border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono"
              />
              <input
                type="number"
                placeholder="Máximo (ex: 4000)"
                value={maxUnidades}
                onChange={(e) => setMaxUnidades(e.target.value)}
                className="w-full bg-[#0c1424] border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-[#090e1a]">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetar</span>
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
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aplicar Filtros</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
