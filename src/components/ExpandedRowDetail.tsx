import React from 'react';
import { Box, ExternalLink } from 'lucide-react';
import { DispatchMovement } from '../types/dispatch';

interface ExpandedRowDetailProps {
  dispatch: DispatchMovement;
  onOpenDetailsModal: (dispatch: DispatchMovement) => void;
}

export const ExpandedRowDetail: React.FC<ExpandedRowDetailProps> = ({
  dispatch,
  onOpenDetailsModal,
}) => {
  return (
    <div className="px-5 py-3.5 bg-[#060a13] border-t border-b border-slate-800/80 text-xs space-y-2.5">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        {/* Left side: Itens Carregados na Carreta: [PLACA] · Motorista: [NOME] */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-5 h-5 rounded flex items-center justify-center text-emerald-400">
            <Box className="w-4 h-4 stroke-[2]" />
          </div>

          <span className="text-slate-300 font-normal">
            Itens Carregados na Carreta:
          </span>

          <span className="font-mono text-xs px-2 py-0.5 rounded border border-slate-700 bg-[#0d1628] text-slate-200 font-medium">
            {dispatch.placa}
          </span>

          <span className="text-slate-500">·</span>

          <span className="text-slate-400">
            Motorista:{' '}
            <span className="text-white font-bold">{dispatch.motorista}</span>
          </span>
        </div>

        {/* Right side: Origem: public.produtos (id_item: ID)  Abrir Manifesto Completo */}
        <div className="flex items-center gap-3 text-xs self-end sm:self-center">
          <div className="text-slate-400 font-mono text-[11px]">
            <span className="text-slate-500 font-sans">Origem: </span>
            <span className="text-emerald-400">public.produtos</span>{' '}
            <span className="text-slate-400">(id_item: {dispatch.id})</span>
          </div>

          <button
            type="button"
            onClick={() => onOpenDetailsModal(dispatch)}
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 font-medium cursor-pointer transition-colors inline-flex items-center gap-1"
          >
            <span>Abrir Manifesto Completo</span>
          </button>
        </div>
      </div>

      {/* Inner Data Table */}
      <div className="overflow-x-auto rounded-lg border border-[#162238] bg-[#070d19]/90 shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#162238] text-[10px] tracking-wider font-semibold text-slate-400 uppercase bg-[#091122]">
              <th className="py-2.5 px-4 font-semibold text-left">PRODUTO CARREGADO</th>
              <th className="py-2.5 px-4 font-semibold text-left w-36">LOTE</th>
              <th className="py-2.5 px-4 font-semibold text-right w-44">PALETES (QTD_PLT)</th>
              <th className="py-2.5 px-4 font-semibold text-right w-44">PACOTES (QTD_PCT)</th>
              <th className="py-2.5 px-4 font-semibold text-right w-44">TOTAL UNIDADES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#131d30] font-sans">
            {dispatch.itens.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 px-4 text-center text-slate-500 italic">
                  Nenhum item registrado para esta movimentação.
                </td>
              </tr>
            ) : (
              dispatch.itens.map((item, idx) => {
                // Extract clean lote number
                const loteRaw = item.sku?.replace('LOTE-', '') || String(idx + 1);
                const loteDisplay = loteRaw.toLowerCase().startsWith('lote')
                  ? loteRaw
                  : `Lote ${loteRaw}`;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    {/* PRODUTO CARREGADO */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded border border-emerald-900/60 bg-emerald-950/40 flex items-center justify-center text-emerald-400 shrink-0">
                          <Box className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                        <span className="text-white font-medium text-xs">
                          {item.descricao}
                        </span>
                      </div>
                    </td>

                    {/* LOTE */}
                    <td className="py-2.5 px-4">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded border border-slate-700/80 bg-[#0d1628] text-slate-300 font-medium inline-block">
                        {loteDisplay}
                      </span>
                    </td>

                    {/* PALETES (QTD_PLT) */}
                    <td className="py-2.5 px-4 text-right">
                      <span className="text-cyan-400 font-mono font-bold text-xs tabular-nums">
                        {item.paletes}
                      </span>{' '}
                      <span className="text-slate-400 text-[11px]">PLT</span>
                    </td>

                    {/* PACOTES (QTD_PCT) */}
                    <td className="py-2.5 px-4 text-right">
                      <span className="text-amber-400 font-mono font-bold text-xs tabular-nums">
                        {item.pacotes}
                      </span>{' '}
                      <span className="text-slate-400 text-[11px]">PCT</span>
                    </td>

                    {/* TOTAL UNIDADES */}
                    <td className="py-2.5 px-4 text-right">
                      <span className="text-emerald-400 font-mono font-bold text-xs tabular-nums">
                        {item.unidades.toLocaleString('pt-BR')}
                      </span>{' '}
                      <span className="text-slate-400 text-[11px]">un</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
