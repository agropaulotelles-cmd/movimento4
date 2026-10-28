import React from 'react';
import { Truck, Layers, Box, TrendingUp, Users } from 'lucide-react';
import { DispatchMovement } from '../types/dispatch';

interface KPISummaryProps {
  dispatches: DispatchMovement[];
  allDispatches: DispatchMovement[];
}

export const KPISummary: React.FC<KPISummaryProps> = ({ dispatches }) => {
  // Calculate live statistics
  const totalExpedicoes = dispatches.length;
  const totalPaletes = dispatches.reduce((acc, curr) => acc + curr.totalPaletes, 0);
  const totalPacotes = dispatches.reduce((acc, curr) => acc + curr.totalPacotes, 0);
  const totalUnidades = dispatches.reduce((acc, curr) => acc + curr.totalUnidades, 0);

  // Unique active vehicles
  const activeVehicles = new Set(dispatches.map((d) => d.placa.trim().toUpperCase()));
  const totalActiveVehicles = activeVehicles.size;

  // Drivers and top driver
  const driverCounts: Record<string, number> = {};
  dispatches.forEach((d) => {
    const name = d.motorista.trim();
    const normalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    driverCounts[normalizedName] = (driverCounts[normalizedName] || 0) + 1;
  });

  const totalDrivers = Object.keys(driverCounts).length;
  let topDriver = 'Paixão';
  let topDriverCount = 0;
  Object.entries(driverCounts).forEach(([driver, count]) => {
    if (count > topDriverCount) {
      topDriver = driver;
      topDriverCount = count;
    }
  });

  // Averages per trip
  const avgPaletes = totalExpedicoes > 0 ? (totalPaletes / totalExpedicoes).toFixed(1).replace('.', ',') : '0,0';
  const avgPacotes = totalExpedicoes > 0 ? Math.round(totalPacotes / totalExpedicoes) : 0;
  const avgUnidades = totalExpedicoes > 0 ? Math.round(totalUnidades / totalExpedicoes).toLocaleString('pt-BR') : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Carregamentos (Viagens) */}
      <div className="bg-[#0b1220]/90 border border-slate-800/90 rounded-xl p-4 transition-all duration-150 hover:border-slate-700 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-normal text-slate-400">Carregamentos (Viagens)</span>
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-emerald-400 bg-emerald-950/40 border border-emerald-900/40">
            <Truck className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1.5">
          <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            {totalExpedicoes}
          </span>
          <span className="text-xs text-slate-400">expedições</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Frota</span>
          <span className="text-slate-600">·</span>
          <span>{totalActiveVehicles} veículos ativos</span>
        </div>
      </div>

      {/* 2. Total Paletes (PLT) */}
      <div className="bg-[#0b1220]/90 border border-slate-800/90 rounded-xl p-4 transition-all duration-150 hover:border-slate-700 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-normal text-slate-400">Total Paletes (PLT)</span>
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-cyan-400 bg-cyan-950/40 border border-cyan-900/40">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1.5">
          <span className="text-2xl font-bold tracking-tight text-cyan-400 font-mono tabular-nums">
            {totalPaletes.toLocaleString('pt-BR')}
          </span>
          <span className="text-xs text-slate-400">paletes</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Média</span>
          <span className="text-slate-600">·</span>
          <span>{avgPaletes} PLT / viagem</span>
        </div>
      </div>

      {/* 3. Total Pacotes (PCT) */}
      <div className="bg-[#0b1220]/90 border border-slate-800/90 rounded-xl p-4 transition-all duration-150 hover:border-slate-700 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-normal text-slate-400">Total Pacotes (PCT)</span>
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-amber-400 bg-amber-950/40 border border-amber-900/40">
            <Box className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1.5">
          <span className="text-2xl font-bold tracking-tight text-amber-400 font-mono tabular-nums">
            {totalPacotes.toLocaleString('pt-BR')}
          </span>
          <span className="text-xs text-slate-400">pacotes</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Média</span>
          <span className="text-slate-600">·</span>
          <span>{avgPacotes} PCT / viagem</span>
        </div>
      </div>

      {/* 4. Unidades Expedidas */}
      <div className="bg-[#0b1220]/90 border border-slate-800/90 rounded-xl p-4 transition-all duration-150 hover:border-slate-700 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-normal text-slate-400">Unidades Expedidas</span>
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-emerald-400 bg-emerald-950/40 border border-emerald-900/40">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1.5">
          <span className="text-2xl font-bold tracking-tight text-emerald-400 font-mono tabular-nums">
            {totalUnidades.toLocaleString('pt-BR')}
          </span>
          <span className="text-xs text-slate-400">itens</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Média</span>
          <span className="text-slate-600">·</span>
          <span>{avgUnidades} unidades / viagem</span>
        </div>
      </div>

      {/* 5. Motoristas Operando */}
      <div className="bg-[#0b1220]/90 border border-slate-800/90 rounded-xl p-4 transition-all duration-150 hover:border-slate-700 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-normal text-slate-400">Motoristas Operando</span>
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-purple-400 bg-purple-950/40 border border-purple-900/40">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1.5">
          <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            {totalDrivers}
          </span>
          <span className="text-xs text-slate-400">motoristas</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Top</span>
          <span className="text-slate-600">·</span>
          <span>{topDriver} ({topDriverCount})</span>
        </div>
      </div>
    </div>
  );
};
