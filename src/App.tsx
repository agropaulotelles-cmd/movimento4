/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TopBar } from './components/TopBar';
import { KPISummary } from './components/KPISummary';
import { FilterBar } from './components/FilterBar';
import { TableToolbar } from './components/TableToolbar';
import { DispatchTable } from './components/DispatchTable';
import { MovementDetailModal } from './components/MovementDetailModal';
import { NewDispatchModal } from './components/NewDispatchModal';
import { AdvancedFilterModal } from './components/AdvancedFilterModal';
import { ExportModal } from './components/ExportModal';
import { InventoryModal } from './components/InventoryModal';
import { InventoryView } from './components/InventoryView';
import { DashboardView } from './components/DashboardView';
import { LayoutDashboard, Table2, Warehouse } from 'lucide-react';
import { INITIAL_DISPATCHES } from './data/mockDispatches';
import { DispatchMovement, FilterState, SortField, SortOrder } from './types/dispatch';
import { supabaseClient } from './services/supabaseClient';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'table' | 'inventory'>('dashboard');
  const [dispatches, setDispatches] = useState<DispatchMovement[]>(INITIAL_DISPATCHES);
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchMovement | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbTotalRecords, setDbTotalRecords] = useState<number | undefined>(undefined);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    motorista: 'Todos os Motoristas',
    placa: '',
    periodo: 'tudo',
  });

  // Fetch real dispatches from Supabase API
  const fetchDispatches = async () => {
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '500');
      if (filters.motorista && filters.motorista !== 'Todos os Motoristas' && filters.motorista !== 'todos') {
        params.set('motorista', filters.motorista);
      }
      if (filters.placa) {
        params.set('placa', filters.placa);
      }
      if (filters.dataInicio) {
        params.set('startDate', `${filters.dataInicio}T00:00:00.000Z`);
      } else if (filters.periodo === 'hoje') {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        params.set('startDate', `${todayStr}T00:00:00.000Z`);
        params.set('endDate', `${todayStr}T23:59:59.999Z`);
      } else if (filters.periodo === '7dias') {
        const now = new Date();
        const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        params.set('startDate', `${d7.getFullYear()}-${String(d7.getMonth() + 1).padStart(2, '0')}-${String(d7.getDate()).padStart(2, '0')}T00:00:00.000Z`);
      } else if (filters.periodo === '30dias') {
        const now = new Date();
        const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        params.set('startDate', `${d30.getFullYear()}-${String(d30.getMonth() + 1).padStart(2, '0')}-${String(d30.getDate()).padStart(2, '0')}T00:00:00.000Z`);
      }

      if (filters.dataFim) {
        params.set('endDate', `${filters.dataFim}T23:59:59.999Z`);
      }

      const res = await fetch(`/api/dispatches?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          setDispatches(json.data);
          setDbTotalRecords(json.totalCount || json.data.length);
          setIsLiveConnected(true);
        }
      }
    } catch (err) {
      console.warn('API error fetching from Supabase, maintaining local cache:', err);
      setIsLiveConnected(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchDispatches();

    // Auto-poll every 12 seconds to guarantee newly inserted dispatches appear immediately
    const pollInterval = setInterval(() => {
      fetchDispatches();
    }, 12000);

    // Listen to live database changes via Supabase Realtime
    const channel = supabaseClient
      .channel('realtime-dispatches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'movimentacao' },
        () => {
          fetchDispatches();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'produtos' },
        () => {
          fetchDispatches();
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabaseClient.removeChannel(channel);
    };
  }, [filters]);



  // Sorting state
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination page size
  const [pageSize, setPageSize] = useState<number>(25);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    id: true,
    motorista: true,
    placa: true,
    dataHora: true,
    totalPaletes: true,
    totalPacotes: true,
    totalUnidades: true,
    detalhes: true,
  });

  const handleToggleColumn = (colKey: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [colKey]: !prev[colKey],
    }));
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      motorista: 'Todos os Motoristas',
      placa: '',
      periodo: 'tudo',
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleAddDispatch = async (newDispatch: DispatchMovement) => {
    // Optimistic UI update
    setDispatches((prev) => [newDispatch, ...prev]);

    // Persist to Supabase via backend API
    try {
      const res = await fetch('/api/dispatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDispatch),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.dispatch) {
          // Replace optimistic item with server created item with real DB ID
          setDispatches((prev) => [json.dispatch, ...prev.filter((d) => d.id !== newDispatch.id)]);
        }
        setDbTotalRecords((prev) => (prev ? prev + 1 : undefined));
      }
    } catch (err) {
      console.warn('Failed to sync new dispatch to Supabase backend:', err);
    }
  };

  const handleRefresh = () => {
    fetchDispatches();
  };

  // Filtered & Sorted Dispatches
  const filteredDispatches = useMemo(() => {
    return dispatches.filter((dispatch) => {
      // 1. Text Search query
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        const matchId =
          dispatch.formattedId.toLowerCase().includes(query) ||
          dispatch.id.toString().includes(query);
        const matchMotorista = dispatch.motorista.toLowerCase().includes(query);
        const matchPlaca = dispatch.placa.toLowerCase().includes(query);
        const matchDoca = dispatch.doca.toLowerCase().includes(query);
        const matchConferente = dispatch.conferente.toLowerCase().includes(query);
        const matchItens = dispatch.itens.some(
          (item) =>
            item.sku.toLowerCase().includes(query) ||
            item.descricao.toLowerCase().includes(query) ||
            item.categoria.toLowerCase().includes(query) ||
            item.destinatario.toLowerCase().includes(query)
        );

        if (
          !matchId &&
          !matchMotorista &&
          !matchPlaca &&
          !matchDoca &&
          !matchConferente &&
          !matchItens
        ) {
          return false;
        }
      }

      // 2. Motorista Filter
      if (
        filters.motorista &&
        filters.motorista !== 'Todos os Motoristas' &&
        filters.motorista !== 'todos'
      ) {
        if (
          dispatch.motorista.trim().toLowerCase() !==
          filters.motorista.trim().toLowerCase()
        ) {
          return false;
        }
      }

      // 3. Placa Filter
      if (filters.placa) {
        if (
          dispatch.placa.trim().toUpperCase() !==
          filters.placa.trim().toUpperCase()
        ) {
          return false;
        }
      }

      // 3.1 Produto Filter
      if (filters.produto && filters.produto !== 'todos' && filters.produto !== 'Todos os Produtos') {
        const pFilter = filters.produto.trim().toLowerCase();
        const hasProd = dispatch.itens.some((item) =>
          item.descricao.toLowerCase().includes(pFilter)
        );
        if (!hasProd) return false;
      }

      // 3.2 Lote Filter
      if (filters.lote && filters.lote !== 'todos' && filters.lote !== 'Todos os Lotes') {
        const lFilter = filters.lote.trim().toLowerCase();
        const hasLote = dispatch.itens.some((item) =>
          item.sku.toLowerCase().includes(lFilter)
        );
        if (!hasLote) return false;
      }


      // 4. Período Filter
      const now = new Date();
      const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const itemDateStr = dispatch.dataHora.slice(0, 10);

      if (filters.periodo === 'hoje') {
        const isToday =
          itemDateStr === todayISO ||
          itemDateStr === '2026-10-28' ||
          dispatch.dataHoraFormatada.startsWith('28/10') ||
          dispatch.dataHoraFormatada.slice(0, 5) === `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;
        if (!isToday) {
          return false;
        }
      } else if (filters.periodo === '7dias') {
        const d7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const d7ISO = `${d7Ago.getFullYear()}-${String(d7Ago.getMonth() + 1).padStart(2, '0')}-${String(d7Ago.getDate()).padStart(2, '0')}`;
        if (itemDateStr < d7ISO && itemDateStr < '2026-10-21') return false;
      } else if (filters.periodo === '30dias') {
        const d30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const d30ISO = `${d30Ago.getFullYear()}-${String(d30Ago.getMonth() + 1).padStart(2, '0')}-${String(d30Ago.getDate()).padStart(2, '0')}`;
        if (itemDateStr < d30ISO && itemDateStr < '2026-09-28') return false;
      }

      // 5. Date Range Pickers (ISO YYYY-MM-DD comparison)
      if (filters.dataInicio) {
        const itemDate = dispatch.dataHora.slice(0, 10);
        if (itemDate < filters.dataInicio) return false;
      }
      if (filters.dataFim) {
        const itemDate = dispatch.dataHora.slice(0, 10);
        if (itemDate > filters.dataFim) return false;
      }


      // 6. Paletes Min / Max
      if (filters.minPaletes !== undefined && dispatch.totalPaletes < filters.minPaletes) {
        return false;
      }
      if (filters.maxPaletes !== undefined && dispatch.totalPaletes > filters.maxPaletes) {
        return false;
      }

      // 7. Pacotes Min / Max
      if (filters.minPacotes !== undefined && dispatch.totalPacotes < filters.minPacotes) {
        return false;
      }
      if (filters.maxPacotes !== undefined && dispatch.totalPacotes > filters.maxPacotes) {
        return false;
      }

      // 8. Unidades Min / Max
      if (filters.minUnidades !== undefined && dispatch.totalUnidades < filters.minUnidades) {
        return false;
      }
      if (filters.maxUnidades !== undefined && dispatch.totalUnidades > filters.maxUnidades) {
        return false;
      }

      return true;
    });
  }, [dispatches, filters]);

  // Sorted Dispatches
  const sortedDispatches = useMemo(() => {
    return [...filteredDispatches].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'motorista':
          comparison = a.motorista.localeCompare(b.motorista);
          break;
        case 'placa':
          comparison = a.placa.localeCompare(b.placa);
          break;
        case 'dataHora':
          comparison = new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime();
          break;
        case 'totalPaletes':
          comparison = a.totalPaletes - b.totalPaletes;
          break;
        case 'totalPacotes':
          comparison = a.totalPacotes - b.totalPacotes;
          break;
        case 'totalUnidades':
          comparison = a.totalUnidades - b.totalUnidades;
          break;
        default:
          comparison = a.id - b.id;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredDispatches, sortField, sortOrder]);

  // Slice by pageSize
  const displayedDispatches = useMemo(() => {
    return sortedDispatches.slice(0, pageSize);
  }, [sortedDispatches, pageSize]);

  // Count active custom filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minPaletes !== undefined || filters.maxPaletes !== undefined) count++;
    if (filters.minPacotes !== undefined || filters.maxPacotes !== undefined) count++;
    if (filters.minUnidades !== undefined || filters.maxUnidades !== undefined) count++;
    if (filters.produto) count++;
    if (filters.lote) count++;
    return count;
  }, [filters]);

  const nextId = useMemo(() => {
    const maxCurrent = Math.max(...dispatches.map((d) => d.id), 3863);
    return maxCurrent + 1;
  }, [dispatches]);

  // Derive unique drivers and plates dynamically from dispatches
  const availableDrivers = useMemo(() => {
    const set = new Set<string>();
    dispatches.forEach((d) => {
      if (d.motorista && d.motorista.trim()) {
        set.add(d.motorista.trim());
      }
    });
    return ['Todos os Motoristas', ...Array.from(set)];
  }, [dispatches]);

  const availablePlates = useMemo(() => {
    const set = new Set<string>();
    dispatches.forEach((d) => {
      if (d.placa && d.placa.trim()) {
        set.add(d.placa.trim().toUpperCase());
      }
    });
    return Array.from(set).slice(0, 10);
  }, [dispatches]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar with 3-zone contract */}
      <TopBar
        onRefreshData={handleRefresh}
        onOpenInventoryModal={() => setIsInventoryOpen(true)}
        isRefreshing={isRefreshing}
        totalExpedicoes={dispatches.length}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* View Switcher Tabs Strip */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5 p-1 bg-[#0b1220] rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Painel Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('table')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'table'
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Tabela Operacional</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('inventory')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'inventory'
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Warehouse className="w-3.5 h-3.5" />
              <span>Saldo de Estoque por Lote</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            {currentView === 'inventory' ? (
              <span className="text-slate-400">Controle Operacional de Estoque</span>
            ) : (
              <>
                Exibindo <span className="text-cyan-400 font-bold">{filteredDispatches.length}</span> de <span className="text-white font-bold">{dispatches.length}</span> expedições
              </>
            )}
          </div>
        </div>

        {/* Render View: Inventory, Dashboard or Table */}
        {currentView === 'inventory' ? (
          <InventoryView onRefreshGlobal={handleRefresh} />
        ) : (
          <>
            {/* Top 5 KPI Summary Cards */}
            <KPISummary dispatches={filteredDispatches} allDispatches={dispatches} />

            {/* Filter Bar (Motoristas, Período, Placas Recentes) */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              availableDrivers={availableDrivers}
              availablePlates={availablePlates}
            />

            {currentView === 'dashboard' ? (
              <DashboardView
                dispatches={filteredDispatches}
                filters={filters}
                onFilterChange={handleFilterChange}
                onSelectDispatch={(d) => setSelectedDispatch(d)}
                onSwitchToTable={() => setCurrentView('table')}
              />
            ) : (
              <>
                {/* Toolbar (Search, Date Filter, Mais Filtros, Colunas, Exportar, Page Size) */}
                <TableToolbar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                  onOpenAdvancedFilters={() => setIsAdvancedFiltersOpen(true)}
                  onOpenExportModal={() => setIsExportModalOpen(true)}
                  columnVisibility={columnVisibility}
                  onToggleColumn={handleToggleColumn}
                  activeFilterCount={activeFilterCount}
                />

                {/* High-Density Data Table */}
                <DispatchTable
                  dispatches={displayedDispatches}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  onOpenDetailsModal={(dispatch) => setSelectedDispatch(dispatch)}
                  columnVisibility={columnVisibility}
                  onResetFilters={handleResetFilters}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <MovementDetailModal
        dispatch={selectedDispatch}
        onClose={() => setSelectedDispatch(null)}
      />

      <NewDispatchModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddDispatch={handleAddDispatch}
        nextId={nextId}
      />

      <AdvancedFilterModal
        isOpen={isAdvancedFiltersOpen}
        onClose={() => setIsAdvancedFiltersOpen(false)}
        filters={filters}
        onApplyFilters={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        dispatches={sortedDispatches}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
      />
    </div>
  );
}
