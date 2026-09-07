import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, MESES } from '../lib/formatters';
import {
  FileText,
  Clock,
  Printer,
  Calendar,
  DollarSign,
  CheckCircle2,
  Download,
  Users,
} from 'lucide-react';

interface DocumentosDistViewProps {
  onViewHolerite: (holeriteId: string) => void;
  onViewPonto: (folhaPontoId: string) => void;
}

export const DocumentosDistView: React.FC<DocumentosDistViewProps> = ({
  onViewHolerite,
  onViewPonto,
}) => {
  const {
    currentEmpresa,
    usuarios,
    holerites,
    folhasPonto,
    gerarHoleritesEmLote,
  } = useApp();

  const [currentTab, setCurrentTab] = useState<'HOLERITES' | 'PONTO'>('HOLERITES');
  const [selectedMes, setSelectedMes] = useState<number>(new Date().getMonth() + 1);
  const [selectedAno, setSelectedAno] = useState<number>(new Date().getFullYear());

  const colaboradores = usuarios.filter(
    (u) => u.empresaId === currentEmpresa.id && u.perfil === 'FUNCIONARIO'
  );

  const empresaHolerites = holerites.filter((h) => h.empresaId === currentEmpresa.id);
  const empresaPontos = folhasPonto.filter((p) => p.empresaId === currentEmpresa.id);

  const handleGerarLote = () => {
    const count = gerarHoleritesEmLote(selectedMes, selectedAno);
    alert(`${count} holerite(s) gerados e calculados com sucesso para ${MESES[selectedMes - 1]}/${selectedAno}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <FileText className="w-6 h-6 text-[#0A5B7A]" />
            <span>Distribuição de Holerites & Folha de Ponto</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Geração em lote, cálculo automático com base nos parâmetros CLT e disponibilização para os colaboradores.
          </p>
        </div>

        {/* Batch Generator Controller */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3 text-xs self-start sm:self-auto">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-[#0A5B7A]" />
            <select
              value={selectedMes}
              onChange={(e) => setSelectedMes(parseInt(e.target.value, 10))}
              className="p-1.5 rounded-lg border border-slate-300 font-bold"
            >
              {MESES.map((m, idx) => (
                <option key={idx} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedAno}
              onChange={(e) => setSelectedAno(parseInt(e.target.value, 10))}
              className="p-1.5 rounded-lg border border-slate-300 font-bold"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          <button
            onClick={handleGerarLote}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#0A5B7A] hover:bg-[#084962] text-white font-bold rounded-xl shadow-xs transition-colors"
          >
            <DollarSign className="w-4 h-4 text-[#F5B800]" />
            <span>Processar Folha em Lote</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setCurrentTab('HOLERITES')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            currentTab === 'HOLERITES'
              ? 'border-[#0A5B7A] text-[#0A5B7A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Holerites e Contracheques ({empresaHolerites.length})</span>
        </button>

        <button
          onClick={() => setCurrentTab('PONTO')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            currentTab === 'PONTO'
              ? 'border-[#0A5B7A] text-[#0A5B7A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Espelhos de Ponto Portaria 671 ({empresaPontos.length})</span>
        </button>
      </div>

      {/* Tab 1: Holerites Table */}
      {currentTab === 'HOLERITES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">
              Contracheques Disponíveis para os Colaboradores
            </span>
            <span className="text-slate-500 text-[11px]">
              Os colaboradores podem consultar e baixar seus PDFs no Portal do Colaborador.
            </span>
          </div>

          {empresaHolerites.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Nenhum holerite emitido nesta empresa ainda. Utilize o botão "Processar Folha em Lote" acima.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-4">Colaborador</th>
                    <th className="py-3 px-3">Competência</th>
                    <th className="py-3 px-3 text-right">Total Vencimentos</th>
                    <th className="py-3 px-3 text-right">Total Descontos</th>
                    <th className="py-3 px-3 text-right">Líquido a Receber</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {empresaHolerites.map((h) => {
                    const colab = usuarios.find((u) => u.id === h.usuarioId);
                    return (
                      <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{colab?.nome || 'Colaborador'}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {colab?.cargo || 'Geral'}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {MESES[h.mes - 1]} / {h.ano}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-700 font-bold">
                          {formatCurrency(h.totalVencimentos)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-rose-700 font-bold">
                          {formatCurrency(h.totalDescontos)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#0A5B7A] font-extrabold text-sm">
                          {formatCurrency(h.salarioLiquido)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                            PUBLICADO
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => onViewHolerite(h.id)}
                            className="px-3 py-1.5 bg-[#0A5B7A] hover:bg-[#084962] text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1 mx-auto"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#F5B800]" />
                            <span>Ver Contracheque</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Folha de Ponto Table */}
      {currentTab === 'PONTO' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">
              Espelhos de Ponto Mensais Validados
            </span>
            <span className="text-slate-500 text-[11px]">
              Em conformidade com a Portaria 671 / MTP do Ministério do Trabalho.
            </span>
          </div>

          {empresaPontos.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Nenhum espelho de ponto gerado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-4">Colaborador</th>
                    <th className="py-3 px-3">Competência</th>
                    <th className="py-3 px-3 text-center">Horas Trabalhadas</th>
                    <th className="py-3 px-3 text-center">Horas Extras (+50%)</th>
                    <th className="py-3 px-3 text-center">Atrasos</th>
                    <th className="py-3 px-3 text-center">Saldo Banco de Horas</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {empresaPontos.map((p) => {
                    const colab = usuarios.find((u) => u.id === p.usuarioId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">
                          <div>{colab?.nome || 'Colaborador'}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {colab?.cargo || 'Geral'}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-slate-700">
                          {MESES[p.mes - 1]} / {p.ano}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">
                          {p.totalHorasTrabalhadas}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-700">
                          {p.totalHorasExtras}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-amber-700">
                          {p.totalAtrasos}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-[#0A5B7A]">
                          {p.saldoBancoHoras}
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <button
                            onClick={() => onViewPonto(p.id)}
                            className="px-3 py-1.5 bg-[#0A5B7A] hover:bg-[#084962] text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1 mx-auto"
                          >
                            <Clock className="w-3.5 h-3.5 text-[#F5B800]" />
                            <span>Ver Espelho</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
