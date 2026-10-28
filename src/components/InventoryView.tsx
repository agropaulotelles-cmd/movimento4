import React, { useState, useEffect, useMemo } from 'react';
import {
  Warehouse,
  Search,
  RefreshCw,
  Box,
  Layers,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  Filter,
  BarChart3,
  TrendingDown,
  TrendingUp,
  X,
  Tag,
  RotateCcw,
} from 'lucide-react';
import { SaldoProdutoLote } from '../types/inventory';

interface InventoryViewProps {
  onRefreshGlobal?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = () => {
  const [items, setItems] = useState<SaldoProdutoLote[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('todos');
  const [selectedLote, setSelectedLote] = useState<string>('todos');
  const [loteQuickInput, setLoteQuickInput] = useState<string>('');
  const [selectedAno, setSelectedAno] = useState<string>('todos');
  const [onlyPositive, setOnlyPositive] = useState(false);
  const [allProductsList, setAllProductsList] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof SaldoProdutoLote>('produto');
  const [sortAsc, setSortAsc] = useState(true);
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory?limit=2500');
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
        if (Array.isArray(json.allProducts) && json.allProducts.length > 0) {
          setAllProductsList(json.allProducts);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch view_saldo_produto_loteatualizado:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Distinct products (all 28 products loaded across whole database)
  const uniqueProducts = useMemo(() => {
    const fromItems = items.map((i) => i.produto?.trim()).filter(Boolean);
    const combined = Array.from(new Set([...allProductsList, ...fromItems]));
    return combined.sort((a, b) => a.localeCompare(b));
  }, [items, allProductsList]);

  // Distinct years
  const uniqueAnos = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.ano))).filter(Boolean).sort().reverse();
  }, [items]);

  // Available lotes (context-aware: depends on selected product)
  const availableLotes = useMemo(() => {
    const list = items
      .filter((i) => selectedProduct === 'todos' || i.produto === selectedProduct || i.produto?.trim() === selectedProduct.trim())
      .map((i) => i.lote)
      .filter(Boolean);
    const unique = Array.from(new Set(list));
    return unique.sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a).localeCompare(String(b));
    });
  }, [items, selectedProduct]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Filter by Product
        if (selectedProduct !== 'todos') {
          const match = item.produto === selectedProduct || item.produto?.trim() === selectedProduct.trim();
          if (!match) return false;
        }

        // Filter by Lote (selected from chips/select)
        if (selectedLote !== 'todos' && item.lote.toString() !== selectedLote) return false;

        // Filter by Lote text input
        if (loteQuickInput.trim()) {
          const qLote = loteQuickInput.trim().toLowerCase();
          if (!item.lote.toString().toLowerCase().includes(qLote)) return false;
        }

        // Filter by Year
        if (selectedAno !== 'todos' && item.ano !== selectedAno) return false;

        // Filter by Positive balance
        if (onlyPositive && (Number(item.saldo) || 0) <= 0) return false;

        // General search query
        if (search) {
          const q = search.toLowerCase();
          const matchProd = item.produto?.toLowerCase().includes(q);
          const matchLote = item.lote?.toString().toLowerCase().includes(q);
          const matchAno = item.ano?.toString().includes(q);
          if (!matchProd && !matchLote && !matchAno) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        valA = String(valA || '');
        valB = String(valB || '');
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
  }, [
    items,
    selectedProduct,
    selectedLote,
    loteQuickInput,
    selectedAno,
    onlyPositive,
    search,
    sortField,
    sortAsc,
  ]);

  // Global aggregate stats
  const stats = useMemo(() => {
    return filteredItems.reduce(
      (acc, item) => {
        acc.totalPlt += Number(item.total_qtd_plt) || 0;
        acc.totalPct += Number(item.total_qtd_pct) || 0;
        acc.totalProduzido += Number(item.total_produzido) || 0;
        acc.totalSaida += Number(item.total_saida) || 0;
        acc.totalSaldo += Number(item.saldo) || 0;
        return acc;
      },
      { totalPlt: 0, totalPct: 0, totalProduzido: 0, totalSaida: 0, totalSaldo: 0 }
    );
  }, [filteredItems]);

  const handleSort = (field: keyof SaldoProdutoLote) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleClearFilters = () => {
    setSelectedProduct('todos');
    setSelectedLote('todos');
    setLoteQuickInput('');
    setSelectedAno('todos');
    setOnlyPositive(false);
    setSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedProduct !== 'todos' ||
    selectedLote !== 'todos' ||
    Boolean(loteQuickInput.trim()) ||
    selectedAno !== 'todos' ||
    onlyPositive ||
    Boolean(search.trim());

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleExportCSV = () => {
    if (filteredItems.length === 0) return;
    const headers = [
      'Produto',
      'Lote',
      'Ano',
      'Paletes (PLT)',
      'Pacotes (PCT)',
      'Total Produzido',
      'Total Saida',
      'Saldo',
    ];
    const rows = filteredItems.map((i) => [
      `"${i.produto}"`,
      `"${i.lote}"`,
      `"${i.ano}"`,
      i.total_qtd_plt,
      i.total_qtd_pct,
      i.total_produzido,
      i.total_saida,
      i.saldo,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `view_saldo_produto_loteatualizado_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">


      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Saldo Disponível */}
        <div className="p-4 rounded-xl bg-[#090f1d] border border-emerald-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-400 mb-1 font-medium">
            <span>Saldo Disponível</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-emerald-400">
            {stats.totalSaldo.toLocaleString('pt-BR')}{' '}
            <span className="text-xs font-sans text-emerald-600 font-normal">un</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Estoque líquido em armazém</div>
        </div>

        {/* Total Produzido */}
        <div className="p-4 rounded-xl bg-[#090f1d] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
            <span>Total Produzido</span>
            <Box className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-slate-100">
            {stats.totalProduzido.toLocaleString('pt-BR')}{' '}
            <span className="text-xs font-sans text-slate-500 font-normal">un</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Entrada total de produção</div>
        </div>

        {/* Total Saídas */}
        <div className="p-4 rounded-xl bg-[#090f1d] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-purple-400 mb-1 font-medium">
            <span>Total Saídas</span>
            <TrendingDown className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-purple-400">
            {stats.totalSaida.toLocaleString('pt-BR')}{' '}
            <span className="text-xs font-sans text-slate-500 font-normal">un</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Expedido em carregamentos</div>
        </div>

        {/* Paletes */}
        <div className="p-4 rounded-xl bg-[#090f1d] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-cyan-400 mb-1 font-medium">
            <span>Total Paletes</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-cyan-400">
            {stats.totalPlt.toLocaleString('pt-BR')}{' '}
            <span className="text-xs font-sans text-slate-500 font-normal">PLT</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Paletização consolidada</div>
        </div>

        {/* Lotes */}
        <div className="p-4 rounded-xl bg-[#090f1d] border border-slate-800 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-amber-400 mb-1 font-medium">
            <span>Lotes Filtrados</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-amber-400">
            {filteredItems.length}{' '}
            <span className="text-xs font-sans text-slate-500 font-normal">
              de {items.length}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Lotes cadastrados na view</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="p-3.5 rounded-xl bg-[#090f1d] border border-slate-800 space-y-3 text-xs">
        {/* Row 1: Filtro por PRODUTO (Chips com scroll suave oculto) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium shrink-0 pr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-300">Produto:</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedProduct('todos');
              setSelectedLote('todos');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap transition-all duration-150 ${
              selectedProduct === 'todos'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'bg-[#0f172a] text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            Todos os Produtos ({items.length})
          </button>

          {uniqueProducts.map((p) => {
            const isSelected = selectedProduct === p;
            const count = items.filter((i) => i.produto === p).length;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setSelectedProduct(isSelected ? 'todos' : p);
                  setSelectedLote('todos');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-600 text-white font-bold shadow-xs'
                    : 'bg-[#0f172a] text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <span>{p}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Filtro por LOTE (Chips dos lotes disponíveis) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-800/80 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium shrink-0 pr-1">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">Lote:</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedLote('todos');
              setLoteQuickInput('');
              setCurrentPage(1);
            }}
            className={`px-2.5 py-0.5 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap transition-all duration-150 ${
              selectedLote === 'todos' && !loteQuickInput
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'bg-[#0f172a] text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            Todos os Lotes ({availableLotes.length})
          </button>

          {/* Quick interactive lotes chips */}
          {availableLotes.slice(0, 25).map((lote) => {
            const isSelected = selectedLote === lote && !loteQuickInput;
            return (
              <button
                key={lote}
                type="button"
                onClick={() => {
                  setSelectedLote(isSelected ? 'todos' : lote);
                  setLoteQuickInput('');
                  setCurrentPage(1);
                }}
                className={`font-mono px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'bg-[#0e1627] text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                Lote {lote}
              </button>
            );
          })}

          {availableLotes.length > 25 && (
            <span className="text-[11px] text-slate-500 whitespace-nowrap shrink-0 pl-1 font-mono">
              +{availableLotes.length - 25} outros no seletor abaixo
            </span>
          )}
        </div>

        {/* Row 3: Toolbar Controls (Search, Dropdown Produto, Dropdown Lote, Ano, Status, Rows) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por produto, lote ou ano..."
                className="w-full bg-[#070b13] border border-slate-700/80 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Dropdown Filtro por Produto */}
            <div className="flex items-center gap-1 bg-[#070b13] border border-slate-700/80 rounded-lg px-2 py-1">
              <span className="text-[11px] text-slate-400">Prod:</span>
              <select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value);
                  setSelectedLote('todos');
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer max-w-[130px]"
              >
                <option value="todos" className="bg-[#0c1424]">Todos Produtos</option>
                {uniqueProducts.map((p) => (
                  <option key={p} value={p} className="bg-[#0c1424]">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown Filtro por Lote */}
            <div className="flex items-center gap-1 bg-[#070b13] border border-slate-700/80 rounded-lg px-2 py-1">
              <span className="text-[11px] text-amber-400">Lote:</span>
              <select
                value={selectedLote}
                onChange={(e) => {
                  setSelectedLote(e.target.value);
                  setLoteQuickInput('');
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer max-w-[110px] font-mono"
              >
                <option value="todos" className="bg-[#0c1424]">Todos Lotes ({availableLotes.length})</option>
                {availableLotes.map((l) => (
                  <option key={l} value={l} className="bg-[#0c1424]">
                    Lote {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct Lote typing input */}
            <div className="relative w-24">
              <input
                type="text"
                value={loteQuickInput}
                onChange={(e) => {
                  setLoteQuickInput(e.target.value);
                  if (e.target.value) setSelectedLote('todos');
                  setCurrentPage(1);
                }}
                placeholder="Nº Lote..."
                className="w-full bg-[#070b13] border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-amber-300 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
              />
              {loteQuickInput && (
                <button
                  type="button"
                  onClick={() => setLoteQuickInput('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Year selector */}
            <select
              value={selectedAno}
              onChange={(e) => {
                setSelectedAno(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#070b13] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="todos">Todos os Anos</option>
              {uniqueAnos.map((a) => (
                <option key={a} value={a}>
                  Ano {a}
                </option>
              ))}
            </select>

            {/* Only positive toggle */}
            <button
              type="button"
              onClick={() => {
                setOnlyPositive(!onlyPositive);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                onlyPositive
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-semibold shadow-xs'
                  : 'bg-[#070b13] border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Saldo &gt; 0
            </button>

            {/* Rows per page */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#070b13] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value={25}>25 linhas</option>
              <option value={50}>50 linhas</option>
              <option value={100}>100 linhas</option>
              <option value={200}>200 linhas</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-300 hover:text-white rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 cursor-pointer transition-colors shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Limpar</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 hover:text-white rounded-lg bg-[#070b13] hover:bg-slate-800 border border-slate-700/80 cursor-pointer transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Exportar</span>
            </button>

            <button
              type="button"
              onClick={fetchInventory}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white rounded-lg bg-cyan-600 hover:bg-cyan-500 cursor-pointer transition-colors shadow-sm shadow-cyan-900/50 font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-800 bg-[#090f1d] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] tracking-wider text-slate-400 uppercase bg-[#080d19] font-semibold">
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('produto')}
                >
                  <div className="flex items-center gap-1">
                    <span>PRODUTO</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => handleSort('lote')}
                >
                  <div className="flex items-center gap-1">
                    <span>LOTE</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => handleSort('ano')}
                >
                  <div className="flex items-center gap-1">
                    <span>ANO</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort('total_qtd_plt')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>PALETES (PLT)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort('total_qtd_pct')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>PACOTES (PCT)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort('total_produzido')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>TOTAL PRODUZIDO</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort('total_saida')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>TOTAL SAÍDA</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort('saldo')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>SALDO DISPONÍVEL</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                      <span>Carregando dados da view public.view_saldo_produto_loteatualizado...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    Nenhum registro de estoque encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const saldo = Number(item.saldo) || 0;
                  const produzido = Number(item.total_produzido) || 0;
                  const saida = Number(item.total_saida) || 0;
                  const isEsgotado = saldo <= 0;
                  const percentRestante =
                    produzido > 0 ? Math.max(0, Math.min(100, (saldo / produzido) * 100)) : 0;

                  return (
                    <tr
                      key={`${item.produto}-${item.lote}-${item.ano}-${idx}`}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-sans text-slate-100 font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                          <span>{item.produto}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLote(item.lote.toString());
                            setLoteQuickInput('');
                            setCurrentPage(1);
                          }}
                          title={`Filtrar apenas Lote ${item.lote}`}
                          className="px-2.5 py-0.5 rounded-md border border-slate-700 bg-[#070b13] text-amber-300 font-bold hover:border-amber-500 cursor-pointer transition-colors"
                        >
                          Lote {item.lote}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[11px]">
                          {item.ano}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right text-cyan-400 font-bold">
                        {item.total_qtd_plt.toLocaleString('pt-BR')} PLT
                      </td>

                      <td className="py-3 px-3 text-right text-amber-400 font-bold">
                        {item.total_qtd_pct.toLocaleString('pt-BR')} PCT
                      </td>

                      <td className="py-3 px-3 text-right text-slate-300 font-medium">
                        {produzido.toLocaleString('pt-BR')}
                      </td>

                      <td className="py-3 px-3 text-right text-purple-400 font-semibold">
                        {saida > 0 ? `-${saida.toLocaleString('pt-BR')}` : '0'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`font-bold text-sm px-2.5 py-0.5 rounded ${
                              isEsgotado
                                ? 'bg-red-950/60 text-red-400 border border-red-900/60'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/70'
                            }`}
                          >
                            {saldo.toLocaleString('pt-BR')} un
                          </span>
                          {produzido > 0 && !isEsgotado && (
                            <div className="w-20 bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-400 h-full rounded-full"
                                style={{ width: `${percentRestante}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-sans">
                        {isEsgotado ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/50 text-red-400 border border-red-900/40">
                            <AlertCircle className="w-3 h-3" />
                            <span>Esgotado</span>
                          </span>
                        ) : saldo < 500 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/50 text-amber-300 border border-amber-900/40">
                            <span>Baixo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-900/40">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Disponível</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-800 bg-[#080d19] text-xs">
          <div className="text-slate-400">
            Exibindo <span className="text-white font-semibold">{paginatedItems.length}</span> de{' '}
            <span className="text-white font-semibold">{filteredItems.length}</span> lotes filtrados (Total de{' '}
            <span className="text-cyan-400 font-mono font-semibold">{items.length}</span> na view)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded bg-[#0f172a] border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer text-xs"
            >
              Anterior
            </button>
            <span className="text-slate-400 px-2 font-mono">
              Página <span className="text-white font-semibold">{currentPage}</span> de{' '}
              <span className="text-white font-semibold">{totalPages}</span>
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded bg-[#0f172a] border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer text-xs"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
