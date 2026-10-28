import React, { useMemo } from 'react';
import {
  TrendingUp,
  Truck,
  Layers,
  Box,
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  Warehouse,
  BarChart3,
  PieChart as PieIcon,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { DispatchMovement, FilterState } from '../types/dispatch';

interface DashboardViewProps {
  dispatches: DispatchMovement[];
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onSelectDispatch: (dispatch: DispatchMovement) => void;
  onSwitchToTable: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  dispatches,
  filters,
  onFilterChange,
  onSelectDispatch,
  onSwitchToTable,
}) => {
  // 1. Overall Aggregations
  const totalExpedicoes = dispatches.length;
  const totalPaletes = dispatches.reduce((acc, curr) => acc + curr.totalPaletes, 0);
  const totalPacotes = dispatches.reduce((acc, curr) => acc + curr.totalPacotes, 0);
  const totalUnidades = dispatches.reduce((acc, curr) => acc + curr.totalUnidades, 0);
  const totalPesoTon = (dispatches.reduce((acc, curr) => acc + (curr.pesoTotalKg || 0), 0) / 1000).toFixed(1);

  // 2. Volume por Motorista (Top Drivers)
  const driverStats = useMemo(() => {
    const map: Record<string, { motorista: string; viagens: number; paletes: number; unidades: number }> = {};
    dispatches.forEach((d) => {
      const name = d.motorista.trim();
      if (!map[name]) {
        map[name] = { motorista: name, viagens: 0, paletes: 0, unidades: 0 };
      }
      map[name].viagens += 1;
      map[name].paletes += d.totalPaletes;
      map[name].unidades += d.totalUnidades;
    });
    return Object.values(map).sort((a, b) => b.paletes - a.paletes);
  }, [dispatches]);

  const maxDriverPaletes = Math.max(...driverStats.map((d) => d.paletes), 1);

  // 3. Distribuição por Veículo / Placa
  const vehicleStats = useMemo(() => {
    const map: Record<string, { placa: string; viagens: number; paletes: number; unidades: number }> = {};
    dispatches.forEach((d) => {
      const placa = d.placa.trim().toUpperCase();
      if (!map[placa]) {
        map[placa] = { placa, viagens: 0, paletes: 0, unidades: 0 };
      }
      map[placa].viagens += 1;
      map[placa].paletes += d.totalPaletes;
      map[placa].unidades += d.totalUnidades;
    });
    return Object.values(map).sort((a, b) => b.viagens - a.viagens);
  }, [dispatches]);

  // 4. Mix de Produtos Carregados
  const productMix = useMemo(() => {
    const map: Record<string, { produto: string; paletes: number; unidades: number; ocorrencias: number }> = {};
    dispatches.forEach((d) => {
      d.itens.forEach((item) => {
        const prod = item.descricao.trim();
        if (!map[prod]) {
          map[prod] = { produto: prod, paletes: 0, unidades: 0, ocorrencias: 0 };
        }
        map[prod].paletes += item.paletes;
        map[prod].unidades += item.unidades;
        map[prod].ocorrencias += 1;
      });
    });
    return Object.values(map).sort((a, b) => b.unidades - a.unidades).slice(0, 6);
  }, [dispatches]);

  const maxProductUnidades = Math.max(...productMix.map((p) => p.unidades), 1);

  // 5. Horários de Carregamento (Distribuição por faixa de hora)
  const hourlyDistribution = useMemo(() => {
    const hours: Record<string, number> = {
      '07:00 - 09:00': 0,
      '09:00 - 11:00': 0,
      '11:00 - 13:00': 0,
      '13:00 - 15:00': 0,
      '15:00 - 17:00': 0,
      '17:00 - 19:00': 0,
    };

    dispatches.forEach((d) => {
      let h = 12;
      if (d.dataHoraFormatada && d.dataHoraFormatada.includes('·')) {
        const timePart = d.dataHoraFormatada.split('·')[1].trim();
        h = parseInt(timePart.split(':')[0], 10);
      } else if (d.dataHora) {
        h = new Date(d.dataHora).getHours();
      }

      if (h >= 7 && h < 9) hours['07:00 - 09:00']++;
      else if (h >= 9 && h < 11) hours['09:00 - 11:00']++;
      else if (h >= 11 && h < 13) hours['11:00 - 13:00']++;
      else if (h >= 13 && h < 15) hours['13:00 - 15:00']++;
      else if (h >= 15 && h < 17) hours['15:00 - 17:00']++;
      else hours['17:00 - 19:00']++;
    });

    return Object.entries(hours).map(([slot, count]) => ({ slot, count }));
  }, [dispatches]);

  const maxHourCount = Math.max(...hourlyDistribution.map((h) => h.count), 1);

  // 6. Docas de Carga
  const docas = [
    { nome: 'Doca 01', status: 'Carregando', placa: 'HUJ6824', motorista: 'RENATO', ocupacao: '85%' },
    { nome: 'Doca 02', status: 'Conferindo', placa: 'HYR3I63', motorista: 'LOURISVAN', ocupacao: '100%' },
    { nome: 'Doca 03', status: 'Livre', placa: '---', motorista: 'Disponível', ocupacao: '0%' },
    { nome: 'Doca 04', status: 'Carregando', placa: 'DVT1H89', motorista: 'MARQUES', ocupacao: '92%' },
    { nome: 'Doca 05', status: 'Em trânsito', placa: 'OSB6734', motorista: 'Josué', ocupacao: '100%' },
  ];

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#0b1220]/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">Viagens Expedidas</span>
            <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-900/60 flex items-center justify-center text-emerald-400">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1 tabular-nums">
            {totalExpedicoes} <span className="text-xs font-normal text-slate-400">cargas</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>100% no prazo operacional</span>
          </div>
        </div>

        <div className="bg-[#0b1220]/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">Paletes Carregados</span>
            <div className="w-6 h-6 rounded-md bg-cyan-950/40 border border-cyan-900/60 flex items-center justify-center text-cyan-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mb-1 tabular-nums">
            {totalPaletes.toLocaleString('pt-BR')}{' '}
            <span className="text-xs font-normal text-slate-400">PLT</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Média: {(totalPaletes / (totalExpedicoes || 1)).toFixed(1).replace('.', ',')} PLT / viagem
          </div>
        </div>

        <div className="bg-[#0b1220]/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">Pacotes Avulsos</span>
            <div className="w-6 h-6 rounded-md bg-amber-950/40 border border-amber-900/60 flex items-center justify-center text-amber-400">
              <Box className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mb-1 tabular-nums">
            {totalPacotes.toLocaleString('pt-BR')}{' '}
            <span className="text-xs font-normal text-slate-400">PCT</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Média: {Math.round(totalPacotes / (totalExpedicoes || 1))} PCT / viagem
          </div>
        </div>

        <div className="bg-[#0b1220]/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">Unidades Físicas</span>
            <div className="w-6 h-6 rounded-md bg-emerald-950/40 border border-emerald-900/60 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mb-1 tabular-nums">
            {totalUnidades.toLocaleString('pt-BR')}{' '}
            <span className="text-xs font-normal text-slate-400">un</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Peso Total: {totalPesoTon} ton expedidas
          </div>
        </div>

        <div className="bg-[#0b1220]/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-medium">Motoristas Ativos</span>
            <div className="w-6 h-6 rounded-md bg-purple-950/40 border border-purple-900/60 flex items-center justify-center text-purple-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1 tabular-nums">
            {driverStats.length} <span className="text-xs font-normal text-slate-400">em rota</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Líder: {driverStats[0]?.motorista || 'Paixão'} ({driverStats[0]?.viagens || 4} viagens)
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 spans): Horários de Pico + Ranking de Motoristas */}
        <div className="lg:col-span-2 space-y-4">
          {/* 1. Gráfico de Carregamentos por Horário */}
          <div className="p-4 bg-[#0b1220]/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-white text-xs">
                  Distribuição de Saídas por Horário do Dia
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Picos de Expedição</span>
            </div>

            <div className="grid grid-cols-6 gap-2 pt-2">
              {hourlyDistribution.map((slot) => {
                const heightPercent = maxHourCount > 0 ? (slot.count / maxHourCount) * 100 : 0;
                return (
                  <div key={slot.slot} className="flex flex-col items-center gap-2">
                    <div className="w-full h-32 bg-[#070b13] border border-slate-800/80 rounded-lg p-1.5 flex flex-col justify-end items-center relative group">
                      <div
                        style={{ height: `${Math.max(heightPercent, 12)}%` }}
                        className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded transition-all duration-300 relative group-hover:from-cyan-500 group-hover:to-cyan-300"
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[10px] text-slate-300 font-bold">
                          {slot.count}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 text-center leading-tight">
                      {slot.slot.split(' - ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Ranking de Motoristas por Volume de Paletes */}
          <div className="p-4 bg-[#0b1220]/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-white text-xs">
                  Ranking de Operação por Motorista
                </h3>
              </div>
              <button
                type="button"
                onClick={onSwitchToTable}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                Ver na Tabela
              </button>
            </div>

            <div className="space-y-2.5">
              {driverStats.slice(0, 5).map((d, index) => {
                const percent = (d.paletes / maxDriverPaletes) * 100;
                return (
                  <div key={d.motorista} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center font-mono text-slate-500 font-bold">
                          #{index + 1}
                        </span>
                        <span className="text-white font-medium">{d.motorista}</span>
                        <span className="text-[11px] text-slate-400">({d.viagens} viagens)</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-cyan-400 font-bold">{d.paletes} PLT</span>
                        <span className="text-emerald-400 font-medium">
                          {d.unidades.toLocaleString('pt-BR')} un
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-[#070b13] rounded-full overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Mix de Produtos & Status das Docas */}
        <div className="space-y-4">
          {/* 3. Mix de Produtos Mais Expedidos */}
          <div className="p-4 bg-[#0b1220]/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-white text-xs">Mix de Produtos Carregados</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Top Itens</span>
            </div>

            <div className="space-y-2.5">
              {productMix.map((p) => {
                const percent = (p.unidades / maxProductUnidades) * 100;
                return (
                  <div key={p.produto} className="p-2 rounded-lg bg-[#080d17] border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-200 font-medium truncate max-w-[170px]" title={p.produto}>
                        {p.produto}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {p.unidades.toLocaleString('pt-BR')} un
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{p.paletes} PLT carregados</span>
                      <span>{p.ocorrencias} carregamentos</span>
                    </div>

                    <div className="w-full h-1.5 bg-[#0c1424] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Monitor de Docas de Embarque */}
          <div className="p-4 bg-[#0b1220]/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-white text-xs">Status do Pátio & Docas</h3>
              </div>
              <span className="text-[10px] text-slate-400">Em tempo real</span>
            </div>

            <div className="space-y-2">
              {docas.map((doca) => {
                const isLivre = doca.status === 'Livre';
                return (
                  <div
                    key={doca.nome}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#080d17] border border-slate-800"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{doca.nome}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {doca.placa} · {doca.motorista}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isLivre
                            ? 'bg-slate-800 text-slate-400'
                            : doca.status === 'Carregando'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {doca.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Veículos da Frota em Operação Strip */}
      <div className="p-4 bg-[#0b1220]/90 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-white text-xs">Frota de Veículos Operando</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">{vehicleStats.length} veículos ativos</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {vehicleStats.map((v) => (
            <div
              key={v.placa}
              onClick={() => {
                onFilterChange({ placa: v.placa });
                onSwitchToTable();
              }}
              className="p-2.5 rounded-lg bg-[#080d17] border border-slate-800 hover:border-cyan-500/80 transition-all cursor-pointer group"
            >
              <div className="font-mono text-xs font-bold text-slate-200 group-hover:text-cyan-300 mb-1">
                {v.placa}
              </div>
              <div className="text-[11px] text-slate-400">
                <span className="text-white font-semibold font-mono">{v.viagens}</span> viagens
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">
                {v.paletes} PLT · {v.unidades.toLocaleString('pt-BR')} un
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
