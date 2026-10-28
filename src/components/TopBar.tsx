import React from 'react';
import { RefreshCw, Warehouse } from 'lucide-react';

interface TopBarProps {
  onOpenNewDispatchModal?: () => void;
  onRefreshData: () => void;
  onOpenInventoryModal?: () => void;
  isRefreshing: boolean;
  totalExpedicoes: number;
  currentView: 'table' | 'dashboard' | 'inventory';
  onViewChange: (view: 'table' | 'dashboard' | 'inventory') => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onRefreshData,
  onOpenInventoryModal,
  isRefreshing,
  totalExpedicoes,
  currentView,
  onViewChange,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-[#090f1d] sticky top-0 z-40">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="/"
          className="text-base font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-sm">
            E
          </div>
          <span>Expedição & Carregamentos</span>
        </a>
      </div>

      {/* Zone 2: Navigation views */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          type="button"
          onClick={() => onViewChange('dashboard')}
          className={`transition-colors whitespace-nowrap shrink-0 font-semibold cursor-pointer pb-0.5 ${
            currentView === 'dashboard'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Painel Dashboard
        </button>

        <button
          type="button"
          onClick={() => onViewChange('table')}
          className={`transition-colors whitespace-nowrap shrink-0 font-semibold cursor-pointer pb-0.5 ${
            currentView === 'table'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Tabela Operacional
        </button>

        <button
          type="button"
          onClick={() => onViewChange('inventory')}
          className={`transition-colors whitespace-nowrap shrink-0 font-semibold cursor-pointer pb-0.5 flex items-center gap-1.5 ${
            currentView === 'inventory'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Warehouse className="w-3.5 h-3.5" />
          <span>Saldo de Estoque por Lote</span>
        </button>
      </nav>

      {/* Zone 3: Sync & Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onRefreshData}
          title="Sincronizar com Supabase"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 cursor-pointer transition-colors font-medium shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
          <span>Sincronizar</span>
        </button>
      </div>
    </header>
  );
};
