import React, { useState } from 'react';
import { X, Plus, Trash2, Truck, Package, Check } from 'lucide-react';
import { DispatchMovement, CargoItem } from '../types/dispatch';
import { MOTORISTAS_LIST, PLACAS_RECENTES } from '../data/mockDispatches';

interface NewDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDispatch: (newDispatch: DispatchMovement) => void;
  nextId: number;
}

export const NewDispatchModal: React.FC<NewDispatchModalProps> = ({
  isOpen,
  onClose,
  onAddDispatch,
  nextId,
}) => {
  if (!isOpen) return null;

  const [motorista, setMotorista] = useState('MARQUES');
  const [placa, setPlaca] = useState('DVT1H89');
  const [doca, setDoca] = useState('Doca 01 - Setor Principal');
  const [conferente, setConferente] = useState('Alexandre Vieira');
  const [transportadora, setTransportadora] = useState('TransMarques Logística Express');

  // Items in cargo
  const [itens, setItens] = useState<CargoItem[]>([
    {
      id: `item-${Date.now()}-1`,
      sku: 'SKU-BEB-8831',
      descricao: 'Pack Cerveja Puro Malte Lata 350ml c/ 12',
      categoria: 'Bebidas',
      paletes: 28,
      pacotes: 0,
      unidades: 1344,
      pesoKg: 14200,
      notaFiscal: 'NF-e 004.892.111',
      destinatario: 'Centro de Distribuição São Paulo',
      cidadeUf: 'São Paulo / SP',
    },
  ]);

  const handleAddItem = () => {
    setItens([
      ...itens,
      {
        id: `item-${Date.now()}-${itens.length + 1}`,
        sku: 'SKU-ALIM-4091',
        descricao: 'Alimento Processado Caixa c/ 24',
        categoria: 'Alimentos',
        paletes: 14,
        pacotes: 50,
        unidades: 1200,
        pesoKg: 7800,
        notaFiscal: `NF-e 004.892.11${itens.length + 2}`,
        destinatario: 'Atacadista Parceiro Regional',
        cidadeUf: 'Campinas / SP',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (itens.length <= 1) return;
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof CargoItem, value: any) => {
    const updated = [...itens];
    updated[index] = { ...updated[index], [field]: value };
    setItens(updated);
  };

  // Live totals
  const totalPaletes = itens.reduce((sum, item) => sum + (Number(item.paletes) || 0), 0);
  const totalPacotes = itens.reduce((sum, item) => sum + (Number(item.pacotes) || 0), 0);
  const totalUnidades = itens.reduce((sum, item) => sum + (Number(item.unidades) || 0), 0);
  const pesoTotalKg = itens.reduce((sum, item) => sum + (Number(item.pesoKg) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formattedId = nextId.toLocaleString('pt-BR');

    const newDispatch: DispatchMovement = {
      id: nextId,
      formattedId: formattedId,
      motorista: motorista.trim() || 'Motorista Autônomo',
      placa: placa.trim().toUpperCase() || 'BRA2E19',
      dataHora: now.toISOString(),
      dataHoraFormatada: `${day}/${month}/${year} · ${hours}:${minutes}`,
      totalPaletes,
      totalPacotes,
      totalUnidades,
      pesoTotalKg,
      status: 'concluido',
      doca,
      conferente,
      transportadora,
      itens,
    };

    onAddDispatch(newDispatch);
    onClose();
  };

  const availableDrivers = MOTORISTAS_LIST.filter((d) => d !== 'Todos os Motoristas');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0c1424] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090e1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Registrar Novo Carregamento / Expedição</h2>
              <p className="text-xs text-slate-400">
                Atribuição de ID automático: <span className="font-mono text-cyan-400 font-bold">PK {nextId.toLocaleString('pt-BR')}</span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-5 flex-1">
            {/* General transport info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Motorista Responsável</label>
                <div className="relative">
                  <input
                    type="text"
                    value={motorista}
                    onChange={(e) => setMotorista(e.target.value)}
                    list="drivers-list"
                    required
                    className="w-full bg-[#070b13] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="Nome do Motorista"
                  />
                  <datalist id="drivers-list">
                    {availableDrivers.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Placa do Veículo</label>
                <div className="relative">
                  <input
                    type="text"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    list="plates-list"
                    required
                    className="w-full bg-[#070b13] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono uppercase focus:outline-none focus:border-cyan-500"
                    placeholder="Ex: DVT1H89"
                  />
                  <datalist id="plates-list">
                    {PLACAS_RECENTES.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Doca de Embarque</label>
                <select
                  value={doca}
                  onChange={(e) => setDoca(e.target.value)}
                  className="w-full bg-[#070b13] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="Doca 01 - Setor Principal">Doca 01 - Setor Principal</option>
                  <option value="Doca 02 - Setor Leste">Doca 02 - Setor Leste</option>
                  <option value="Doca 03 - Setor Norte">Doca 03 - Setor Norte</option>
                  <option value="Doca 04 - Setor Sul">Doca 04 - Setor Sul</option>
                  <option value="Doca 05 - Crossdocking">Doca 05 - Crossdocking</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Conferente</label>
                <input
                  type="text"
                  value={conferente}
                  onChange={(e) => setConferente(e.target.value)}
                  className="w-full bg-[#070b13] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1 font-medium">Transportadora</label>
                <input
                  type="text"
                  value={transportadora}
                  onChange={(e) => setTransportadora(e.target.value)}
                  className="w-full bg-[#070b13] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Cargo Items Section */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Itens da Carga ({itens.length})</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0e1627] border border-slate-700 text-cyan-300 hover:bg-slate-800 text-xs cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar Produto</span>
                </button>
              </div>

              <div className="space-y-3">
                {itens.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#080d17] border border-slate-800 rounded-xl space-y-2.5 relative"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                      <span className="text-slate-400 font-semibold text-[11px]">Item #{index + 1}</span>
                      {itens.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">SKU</label>
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => handleUpdateItem(index, 'sku', e.target.value)}
                          className="w-full bg-[#0c1424] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Descrição do Produto</label>
                        <input
                          type="text"
                          value={item.descricao}
                          onChange={(e) => handleUpdateItem(index, 'descricao', e.target.value)}
                          className="w-full bg-[#0c1424] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Categoria</label>
                        <input
                          type="text"
                          value={item.categoria}
                          onChange={(e) => handleUpdateItem(index, 'categoria', e.target.value)}
                          className="w-full bg-[#0c1424] border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-cyan-400 block mb-0.5 font-medium">Paletes (PLT)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.paletes}
                          onChange={(e) => handleUpdateItem(index, 'paletes', Number(e.target.value))}
                          className="w-full bg-[#0c1424] border border-cyan-800/80 rounded px-2 py-1 text-cyan-300 text-xs font-mono font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-amber-400 block mb-0.5 font-medium">Pacotes (PCT)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.pacotes}
                          onChange={(e) => handleUpdateItem(index, 'pacotes', Number(e.target.value))}
                          className="w-full bg-[#0c1424] border border-amber-800/80 rounded px-2 py-1 text-amber-300 text-xs font-mono font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-emerald-400 block mb-0.5 font-medium">Unidades (un)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.unidades}
                          onChange={(e) => handleUpdateItem(index, 'unidades', Number(e.target.value))}
                          className="w-full bg-[#0c1424] border border-emerald-800/80 rounded px-2 py-1 text-emerald-300 text-xs font-mono font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Peso (Kg)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.pesoKg}
                          onChange={(e) => handleUpdateItem(index, 'pesoKg', Number(e.target.value))}
                          className="w-full bg-[#0c1424] border border-slate-700 rounded px-2 py-1 text-slate-300 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Nota Fiscal (NF-e)</label>
                        <input
                          type="text"
                          value={item.notaFiscal}
                          onChange={(e) => handleUpdateItem(index, 'notaFiscal', e.target.value)}
                          className="w-full bg-[#0c1424] border border-slate-700 rounded px-2 py-1 text-slate-300 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Destinatário & Destino</label>
                        <input
                          type="text"
                          value={item.destinatario}
                          onChange={(e) => handleUpdateItem(index, 'destinatario', e.target.value)}
                          className="w-full bg-[#0c1424] border border-slate-700 rounded px-2 py-1 text-slate-300 text-xs"
                          placeholder="Ex: Atacadão S/A (Campinas/SP)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculated summary strip */}
            <div className="p-3 bg-[#080d17] border border-slate-800 rounded-xl grid grid-cols-4 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Paletes</span>
                <span className="text-base font-bold text-cyan-400 font-mono">{totalPaletes} PLT</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total Pacotes</span>
                <span className="text-base font-bold text-amber-400 font-mono">{totalPacotes} PCT</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total Unidades</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {totalUnidades.toLocaleString('pt-BR')} un
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Peso Total</span>
                <span className="text-base font-bold text-purple-400 font-mono">
                  {(pesoTotalKg / 1000).toFixed(1)} ton
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-800 bg-[#090e1a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Salvar Carregamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
