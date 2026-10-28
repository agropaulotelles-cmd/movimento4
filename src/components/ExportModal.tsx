import React from 'react';
import { X, FileSpreadsheet, FileText, Printer, CheckCircle } from 'lucide-react';
import { DispatchMovement } from '../types/dispatch';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatches: DispatchMovement[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, dispatches }) => {
  if (!isOpen) return null;

  const exportCSV = () => {
    const headers = [
      'ID Movimentação',
      'Motorista',
      'Placa',
      'Data/Hora',
      'Total Paletes (PLT)',
      'Total Pacotes (PCT)',
      'Total Unidades',
      'Peso Total (Kg)',
      'Doca',
      'Conferente',
      'Transportadora',
    ];

    const rows = dispatches.map((d) => [
      d.formattedId,
      `"${d.motorista}"`,
      `"${d.placa}"`,
      `"${d.dataHoraFormatada}"`,
      d.totalPaletes,
      d.totalPacotes,
      d.totalUnidades,
      d.pesoTotalKg,
      `"${d.doca}"`,
      `"${d.conferente}"`,
      `"${d.transportadora}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `carregamentos_expedicao_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const exportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(dispatches, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `carregamentos_expedicao_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#0c1424] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090e1a]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar Dados de Expedição</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-400">
            Exportar <span className="text-cyan-400 font-bold font-mono">{dispatches.length}</span> registros
            atualmente filtrados com todos os campos de conferência e romaneio.
          </p>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={exportCSV}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#070b13] border border-slate-800 hover:border-emerald-500/80 hover:bg-emerald-950/20 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-emerald-300">
                    Planilha CSV (Excel / Google Sheets)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Compatível com Excel, separador padrão pt-BR (ponto e vírgula)
                  </div>
                </div>
              </div>
              <CheckCircle className="w-4 h-4 text-slate-600 group-hover:text-emerald-400" />
            </button>

            <button
              type="button"
              onClick={exportJSON}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#070b13] border border-slate-800 hover:border-cyan-500/80 hover:bg-cyan-950/20 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-cyan-300">
                    Arquivo JSON Estruturado
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Para integração com sistemas WMS / ERP / TMS
                  </div>
                </div>
              </div>
              <CheckCircle className="w-4 h-4 text-slate-600 group-hover:text-cyan-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                window.print();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#070b13] border border-slate-800 hover:border-purple-500/80 hover:bg-purple-950/20 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-purple-300">
                    Imprimir Romaneio Geral da Frota
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Layout otimizado para conferência física no pátio
                  </div>
                </div>
              </div>
              <CheckCircle className="w-4 h-4 text-slate-600 group-hover:text-purple-400" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-[#090e1a]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
