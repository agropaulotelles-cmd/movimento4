import React from 'react';
import {
  X,
  Truck,
  User,
  Calendar,
  Layers,
  Box,
  TrendingUp,
  Weight,
  Warehouse,
  CheckCircle2,
  FileCheck2,
  Printer,
  Download,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { DispatchMovement } from '../types/dispatch';

interface MovementDetailModalProps {
  dispatch: DispatchMovement | null;
  onClose: () => void;
}

export const MovementDetailModal: React.FC<MovementDetailModalProps> = ({ dispatch, onClose }) => {
  if (!dispatch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c1424] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090e1a]">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-950/90 text-emerald-400 border border-emerald-800 font-bold px-1.5 py-0.5 rounded text-xs font-mono">
              PK {dispatch.formattedId}
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Ficha Operacional de Expedição</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                  Carregamento Concluído
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Registro operacional emitido pelo Centro de Distribuição & Logística
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body scrollable */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* 4 Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-[#070b13] border border-slate-800/80 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Total Paletes</span>
              </div>
              <div className="text-xl font-bold text-cyan-400 font-mono">
                {dispatch.totalPaletes} <span className="text-xs font-normal text-slate-400">PLT</span>
              </div>
            </div>

            <div className="p-3 bg-[#070b13] border border-slate-800/80 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Box className="w-3.5 h-3.5 text-amber-400" />
                <span>Total Pacotes</span>
              </div>
              <div className="text-xl font-bold text-amber-400 font-mono">
                {dispatch.totalPacotes} <span className="text-xs font-normal text-slate-400">PCT</span>
              </div>
            </div>

            <div className="p-3 bg-[#070b13] border border-slate-800/80 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unidades Físicas</span>
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {dispatch.totalUnidades.toLocaleString('pt-BR')}{' '}
                <span className="text-xs font-normal text-slate-400">un</span>
              </div>
            </div>

            <div className="p-3 bg-[#070b13] border border-slate-800/80 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Weight className="w-3.5 h-3.5 text-purple-400" />
                <span>Peso Bruto Carga</span>
              </div>
              <div className="text-xl font-bold text-purple-400 font-mono">
                {(dispatch.pesoTotalKg / 1000).toFixed(1).replace('.', ',')}{' '}
                <span className="text-xs font-normal text-slate-400">ton</span>
              </div>
            </div>
          </div>

          {/* Operational Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left box: Transporte e Veículo */}
            <div className="p-4 bg-[#080d17] border border-slate-800 rounded-xl space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Dados de Transporte & Frota</span>
              </h3>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Motorista Responsável:</span>
                  <span className="text-slate-100 font-semibold">{dispatch.motorista}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Placa do Cavalo / Veículo:</span>
                  <span className="font-mono text-cyan-300 font-bold bg-[#0d1627] px-2 py-0.5 rounded border border-slate-700 inline-block">
                    {dispatch.placa}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Transportadora Contratada:</span>
                  <span className="text-slate-200">{dispatch.transportadora}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tipo de Veículo:</span>
                  <span className="text-slate-200">Carreta Sider / Baú Frigorífico</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Lacre de Segurança:</span>
                  <span className="font-mono text-emerald-400 font-semibold">#BR-8849-LACRE</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Status do Lacre:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Intacto e Verificado
                  </span>
                </div>
              </div>
            </div>

            {/* Right box: Operação de Pátio */}
            <div className="p-4 bg-[#080d17] border border-slate-800 rounded-xl space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                <Warehouse className="w-4 h-4 text-emerald-400" />
                <span>Controle de Pátio & Conferência</span>
              </h3>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Doca Operacional:</span>
                  <span className="text-slate-100 font-semibold">{dispatch.doca}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Conferente Responsável:</span>
                  <span className="text-slate-200 font-medium">{dispatch.conferente}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Data / Hora de Liberação:</span>
                  <span className="font-mono text-slate-200">{dispatch.dataHoraFormatada}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tempo de Carregamento:</span>
                  <span className="text-slate-200 font-mono">48 minutos (Dentro da meta)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Checklist Pré-Viagem:</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Conforme (Pneus, Freios, Amarrações)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Comprovante de Embarque:</span>
                  <span className="text-cyan-400 underline cursor-pointer">Assinado Digitalmente</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cargo items breakdown */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-purple-400" />
              <span>Detalhamento dos Itens & Documentos Fiscais</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#070b13]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 bg-[#0a0f1d]">
                    <th className="py-2.5 px-3 font-medium">Item</th>
                    <th className="py-2.5 px-3 font-medium">SKU</th>
                    <th className="py-2.5 px-3 font-medium">Descrição</th>
                    <th className="py-2.5 px-3 font-medium">Categoria</th>
                    <th className="py-2.5 px-3 font-medium text-right">Paletes</th>
                    <th className="py-2.5 px-3 font-medium text-right">Pacotes</th>
                    <th className="py-2.5 px-3 font-medium text-right">Unidades</th>
                    <th className="py-2.5 px-3 font-medium text-right">Peso (Kg)</th>
                    <th className="py-2.5 px-3 font-medium">Documento Fiscal</th>
                    <th className="py-2.5 px-3 font-medium">Destinatário & Cidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {dispatch.itens.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-cyan-300 font-semibold">{item.sku}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-200">{item.descricao}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-400">{item.categoria}</td>
                      <td className="py-2.5 px-3 text-right text-cyan-400 font-bold">{item.paletes} PLT</td>
                      <td className="py-2.5 px-3 text-right text-amber-400 font-bold">{item.pacotes} PCT</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                        {item.unidades.toLocaleString('pt-BR')} un
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {item.pesoKg.toLocaleString('pt-BR')} kg
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{item.notaFiscal}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>
                            {item.destinatario} - {item.cidadeUf}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="p-4 bg-[#080d17] border border-slate-800 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Histórico Operacional (Timeline)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 rounded bg-[#0d1627] border border-slate-800">
                <div className="text-cyan-400 font-semibold">1. Entrada na Portaria</div>
                <div className="text-slate-400">Veículo liberado para Doca</div>
                <div className="text-slate-500 font-mono">16:15</div>
              </div>
              <div className="p-2 rounded bg-[#0d1627] border border-slate-800">
                <div className="text-cyan-400 font-semibold">2. Início do Carregamento</div>
                <div className="text-slate-400">Paletes estivados na carreta</div>
                <div className="text-slate-500 font-mono">16:25</div>
              </div>
              <div className="p-2 rounded bg-[#0d1627] border border-slate-800">
                <div className="text-cyan-400 font-semibold">3. Conferência & Lacre</div>
                <div className="text-slate-400">Contagem física validada</div>
                <div className="text-slate-500 font-mono">17:00</div>
              </div>
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-900/60">
                <div className="text-emerald-400 font-semibold">4. Expedição Concluída</div>
                <div className="text-slate-300">CT-e / MDF-e emitidos</div>
                <div className="text-emerald-400 font-mono">{dispatch.dataHoraFormatada.split('·')[1]}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-[#090e1a]">
          <div className="text-[11px] text-slate-400">
            ID de Rastreabilidade Logística: <span className="font-mono text-slate-200">EXP-2026-{dispatch.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Imprimir Romaneio</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
