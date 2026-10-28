import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Warehouse,
  Search,
  RefreshCw,
  Box,
  Layers,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';
import { SaldoProdutoLote } from '../types/inventory';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<SaldoProdutoLote[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('todos');
  const [selectedLote, setSelectedLote] = useState('todos');
  const [selectedAno, setSelectedAno] = useState('todos');
  const [onlyPositive, setOnlyPositive] = useState(false);
  const [sortField, setSortField] = useState<keyof SaldoProdutoLote>('produto');
  const [allProductsList, setAllProductsList] = useState<string[]>([]);
  const [sortAsc, setSortAsc] = useState(true);

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
    if (isOpen) {
      fetchInventory();
    }
  }, [isOpen]);

  // Unique products & years for filter selects (all 28 products loaded across entire database)
  const uniqueProducts = useMemo(() => {
    const fromItems = items.map((i) => i.produto?.trim()).filter(Boolean);
    const combined = Array.from(new Set([...allProductsList, ...fromItems]));
    return combined.sort((a, b) => a.localeCompare(b));
  }, [items, allProductsList]);

  const uniqueAnos = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.ano))).filter(Boolean).sort().reverse();
  }, [items]);

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

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedProduct !== 'todos' && item.produto !== selectedProduct) return false;
        if (selectedLote !== 'todos' && item.lote.toString() !== selectedLote) return false;
        if (selectedAno !== 'todos' && item.ano !== selectedAno) return false;
        if (onlyPositive && (Number(item.saldo) || 0) <= 0) return false;
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
  }, [items, selectedProduct, selectedAno, onlyPositive, search, sortField, sortAsc]);

  // KPI calculations on filtered items
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

  const handleExportCSV = () => {
    if (filteredItems.length === 0) return;
    const headers = ['Produto', 'Lote', 'Ano', 'Paletes (PLT)', 'Pacotes (PCT)', 'Total Produzido', 'Total Saida', 'Saldo'];
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
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `saldo_estoque_lote_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xs">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-[#0c1424] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-[#090e1a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Warehouse className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Saldo de Estoque por Lote</h2>
              <p className="text-[11px] text-slate-400">
                Dados consolidados de produção, expedições e saldo disponível em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              title="Exportar CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button
              type="button"
              onClick={fetchInventory}
              title="Recarregar dados da View"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-[#080d17] border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-[#0c1424] border border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium block">Total Produzido</span>
            <span className="text-base font-bold font-mono text-slate-100">
              {stats.totalProduzido.toLocaleString('pt-BR')} <span className="text-xs text-slate-500 font-sans font-normal">un</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0c1424] border border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium block">Total Saídas</span>
            <span className="text-base font-bold font-mono text-purple-400">
              {stats.totalSaida.toLocaleString('pt-BR')} <span className="text-xs text-slate-500 font-sans font-normal">un</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0c1424] border border-emerald-900/60 bg-emerald-950/20">
            <span className="text-[10px] text-emerald-400 font-medium block">Saldo Disponível</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {stats.totalSaldo.toLocaleString('pt-BR')} <span className="text-xs text-emerald-600 font-sans font-normal">un</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0c1424] border border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium block">Total Paletes</span>
            <span className="text-base font-bold font-mono text-cyan-400">
              {stats.totalPlt.toLocaleString('pt-BR')} <span className="text-xs text-slate-500 font-sans font-normal">PLT</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0c1424] border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-medium block">Lotes Filtrados</span>
            <span className="text-base font-bold font-mono text-amber-400">
              {filteredItems.length} <span className="text-xs text-slate-500 font-sans font-normal">de {items.length}</span>
            </span>
          </div>
        </div>

        {/* Toolbar with Filters */}
        <div className="px-6 py-3 bg-[#090e1a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por produto, lote ou ano..."
              className="w-full bg-[#0c1424] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Selects */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Produto */}
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setSelectedLote('todos');
              }}
              className="bg-[#0c1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="todos">Todos os Produtos ({uniqueProducts.length})</option>
              {uniqueProducts.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Lote */}
            <select
              value={selectedLote}
              onChange={(e) => setSelectedLote(e.target.value)}
              className="bg-[#0c1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
            >
              <option value="todos">Todos os Lotes ({availableLotes.length})</option>
              {availableLotes.map((l) => (
                <option key={l} value={l}>
                  Lote {l}
                </option>
              ))}
            </select>

            {/* Ano */}
            <select
              value={selectedAno}
              onChange={(e) => setSelectedAno(e.target.value)}
              className="bg-[#0c1424] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="todos">Todos os Anos</option>
              {uniqueAnos.map((a) => (
                <option key={a} value={a}>
                  Ano {a}
                </option>
              ))}
            </select>

            {/* Apenas com Saldo */}
            <button
              type="button"
              onClick={() => setOnlyPositive(!onlyPositive)}
              className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                onlyPositive
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-semibold'
                  : 'bg-[#0c1424] border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Saldo &gt; 0
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070b13]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] tracking-wider text-slate-400 uppercase bg-[#0a0f1d] font-semibold">
                  <th
                    className="py-2.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort('produto')}
                  >
                    <div className="flex items-center gap-1">
                      <span>PRODUTO</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-white"
                    onClick={() => handleSort('lote')}
                  >
                    <div className="flex items-center gap-1">
                      <span>LOTE</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 cursor-pointer hover:text-white"
                    onClick={() => handleSort('ano')}
                  >
                    <div className="flex items-center gap-1">
                      <span>ANO</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('total_qtd_plt')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>PALETES (PLT)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('total_qtd_pct')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>PACOTES (PCT)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('total_produzido')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>TOTAL PRODUZIDO</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('total_saida')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>TOTAL SAÍDA</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-2.5 px-4 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('saldo')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>SALDO</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                        <span>Carregando dados da view public.view_saldo_produto_loteatualizado...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      Nenhum registro de saldo encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => {
                    const saldo = Number(item.saldo) || 0;
                    const produzido = Number(item.total_produzido) || 0;
                    const saida = Number(item.total_saida) || 0;
                    const isEsgotado = saldo <= 0;

                    return (
                      <tr
                        key={`${item.produto}-${item.lote}-${item.ano}-${idx}`}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-4 font-sans text-slate-100 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>{item.produto}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded border border-slate-700 bg-[#0d1627] text-slate-200 font-semibold">
                            Lote {item.lote}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[11px]">
                            {item.ano}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-cyan-400 font-bold">
                          {item.total_qtd_plt.toLocaleString('pt-BR')} PLT
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-400 font-bold">
                          {item.total_qtd_pct.toLocaleString('pt-BR')} PCT
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {produzido.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-purple-400 font-semibold">
                          {saida > 0 ? `-${saida.toLocaleString('pt-BR')}` : '0'}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span
                            className={`font-bold text-xs sm:text-sm px-2 py-0.5 rounded ${
                              isEsgotado
                                ? 'bg-red-950/50 text-red-400 border border-red-900/40'
                                : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                            }`}
                          >
                            {saldo.toLocaleString('pt-BR')} un
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-[#090e1a]">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Exibindo <span className="font-semibold text-white">{filteredItems.length}</span> lotes consolidados em estoque
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs cursor-pointer font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
