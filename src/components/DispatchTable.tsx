import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Box,
  ChevronsDownUp,
  Sparkles,
} from 'lucide-react';
import { DispatchMovement, SortField, SortOrder } from '../types/dispatch';
import { ExpandedRowDetail } from './ExpandedRowDetail';

interface DispatchTableProps {
  dispatches: DispatchMovement[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onOpenDetailsModal: (dispatch: DispatchMovement) => void;
  columnVisibility: Record<string, boolean>;
  onResetFilters: () => void;
}

export const DispatchTable: React.FC<DispatchTableProps> = ({
  dispatches,
  sortField,
  sortOrder,
  onSort,
  onOpenDetailsModal,
  columnVisibility,
  onResetFilters,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllRows = () => {
    if (expandedRows.size === dispatches.length) {
      setExpandedRows(new Set());
    } else {
      setExpandedRows(new Set(dispatches.map((d) => d.id)));
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-cyan-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-cyan-400" />
    );
  };

  return (
    <div className="bg-[#0b1220]/90 border border-slate-800/90 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 bg-[#0c1424] select-none font-medium text-[11px]">
              {/* Expand all button */}
              <th className="py-2.5 px-3 w-10 text-center">
                <button
                  type="button"
                  onClick={toggleAllRows}
                  title="Expandir / Recolher Todos"
                  className="text-slate-400 hover:text-white cursor-pointer p-0.5 rounded hover:bg-slate-800"
                >
                  <ChevronsDownUp className="w-3.5 h-3.5" />
                </button>
              </th>

              {/* # Index */}
              <th className="py-2.5 px-3 w-12 text-slate-500 text-center font-mono">#</th>

              {/* ID Movimentação */}
              {columnVisibility.id !== false && (
                <th
                  onClick={() => onSort('id')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200 group transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold px-1 py-0.2 rounded font-mono">
                      PK
                    </span>
                    <span>ID Movimentação</span>
                    {renderSortIndicator('id')}
                  </div>
                </th>
              )}

              {/* Motorista */}
              {columnVisibility.motorista !== false && (
                <th
                  onClick={() => onSort('motorista')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200 group transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Motorista</span>
                    {renderSortIndicator('motorista')}
                  </div>
                </th>
              )}

              {/* Placa do Veículo */}
              {columnVisibility.placa !== false && (
                <th
                  onClick={() => onSort('placa')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200 group transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Placa do Veículo</span>
                    {renderSortIndicator('placa')}
                  </div>
                </th>
              )}

              {/* Data / Hora do Carregamento */}
              {columnVisibility.dataHora !== false && (
                <th
                  onClick={() => onSort('dataHora')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200 group transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Data / Hora do Carregamento</span>
                    {renderSortIndicator('dataHora')}
                  </div>
                </th>
              )}

              {/* Total Paletes (PLT) */}
              {columnVisibility.totalPaletes !== false && (
                <th
                  onClick={() => onSort('totalPaletes')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200 group transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total Paletes (PLT)</span>
                    {renderSortIndicator('totalPaletes')}
                  </div>
                </th>
              )}

              {/* Total Pacotes (PCT) */}
              {columnVisibility.totalPacotes !== false && (
                <th
                  onClick={() => onSort('totalPacotes')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200 group transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total Pacotes (PCT)</span>
                    {renderSortIndicator('totalPacotes')}
                  </div>
                </th>
              )}

              {/* Total Unidades Expedidas */}
              {columnVisibility.totalUnidades !== false && (
                <th
                  onClick={() => onSort('totalUnidades')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-200 group transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total Unidades Expedidas</span>
                    {renderSortIndicator('totalUnidades')}
                  </div>
                </th>
              )}

              {/* Detalhes */}
              {columnVisibility.detalhes !== false && (
                <th className="py-2.5 px-3 text-center w-20">Detalhes</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-sans">
            {dispatches.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Sparkles className="w-8 h-8 text-slate-600 mb-1" />
                    <p className="text-sm font-medium text-slate-300">Nenhum carregamento encontrado</p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Nenhum registro corresponde aos filtros atuais aplicados. Tente ajustar os critérios de busca.
                    </p>
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs cursor-pointer"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              dispatches.map((dispatch, index) => {
                const isExpanded = expandedRows.has(dispatch.id);
                const itemCount = dispatch.itens.length;

                return (
                  <React.Fragment key={dispatch.id}>
                    <tr
                      onClick={() => toggleRow(dispatch.id)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded
                          ? 'bg-slate-800/40 hover:bg-slate-800/50'
                          : 'hover:bg-slate-800/30'
                      }`}
                    >
                      {/* Chevron expand button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(dispatch.id);
                          }}
                          className="text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Row index */}
                      <td className="py-3 px-3 text-center font-mono text-slate-500 text-xs">
                        {index + 1}
                      </td>

                      {/* ID Movimentação */}
                      {columnVisibility.id !== false && (
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-white text-xs tracking-tight">
                            {dispatch.formattedId}
                          </span>
                        </td>
                      )}

                      {/* Motorista */}
                      {columnVisibility.motorista !== false && (
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-200 text-xs">
                            {dispatch.motorista}
                          </span>
                        </td>
                      )}

                      {/* Placa do Veículo + item badge */}
                      {columnVisibility.placa !== false && (
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs px-2 py-0.5 rounded border border-slate-700 bg-[#0e1627] text-slate-200 font-medium">
                              {dispatch.placa}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-950/70 border border-purple-800/80 text-purple-300">
                              <Box className="w-3 h-3 text-purple-400" />
                              <span>{itemCount} {itemCount === 1 ? 'item' : 'itens'}</span>
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Data / Hora do Carregamento */}
                      {columnVisibility.dataHora !== false && (
                        <td className="py-3 px-3 text-slate-300 font-mono text-xs">
                          {dispatch.dataHoraFormatada}
                        </td>
                      )}

                      {/* Total Paletes (PLT) */}
                      {columnVisibility.totalPaletes !== false && (
                        <td className="py-3 px-3 text-right">
                          <span className="text-cyan-400 font-mono font-bold text-xs tabular-nums">
                            {dispatch.totalPaletes}
                          </span>{' '}
                          <span className="text-slate-400 text-[11px]">PLT</span>
                        </td>
                      )}

                      {/* Total Pacotes (PCT) */}
                      {columnVisibility.totalPacotes !== false && (
                        <td className="py-3 px-3 text-right">
                          <span className="text-amber-400 font-mono font-bold text-xs tabular-nums">
                            {dispatch.totalPacotes}
                          </span>{' '}
                          <span className="text-slate-400 text-[11px]">PCT</span>
                        </td>
                      )}

                      {/* Total Unidades Expedidas */}
                      {columnVisibility.totalUnidades !== false && (
                        <td className="py-3 px-3 text-right">
                          <span className="text-emerald-400 font-mono font-bold text-xs tabular-nums">
                            {dispatch.totalUnidades.toLocaleString('pt-BR')}
                          </span>{' '}
                          <span className="text-slate-400 text-[11px]">un</span>
                        </td>
                      )}

                      {/* Detalhes eye button */}
                      {columnVisibility.detalhes !== false && (
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDetailsModal(dispatch);
                            }}
                            title="Ver Detalhes do Carregamento"
                            className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 p-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>

                    {/* Expandable row content */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={10} className="p-0">
                          <ExpandedRowDetail
                            dispatch={dispatch}
                            onOpenDetailsModal={onOpenDetailsModal}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table bottom pagination indicator */}
      <div className="py-2.5 px-4 bg-[#0c1424] border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Mostrando</span>
          <span className="font-semibold text-slate-200 font-mono">{dispatches.length}</span>
          <span>de</span>
          <span className="font-semibold text-slate-200 font-mono">{dispatches.length}</span>
          <span>registros listados</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Clique em qualquer linha ou no ícone <ChevronRight className="w-3 h-3 inline text-slate-400" /> para expandir o romaneio de carga
        </div>
      </div>
    </div>
  );
};
