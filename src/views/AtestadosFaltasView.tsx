import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateTimeBR } from '../lib/formatters';
import { Atestado, Falta } from '../types';
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Clock,
  Plus,
  ExternalLink,
} from 'lucide-react';

export const AtestadosFaltasView: React.FC = () => {
  const {
    currentEmpresa,
    usuarios,
    atestados,
    faltas,
    aprovarAtestado,
    rejeitarAtestado,
    lancarFalta,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ATESTADOS' | 'FALTAS'>('ATESTADOS');

  // New Falta Modal
  const [isNewFaltaOpen, setIsNewFaltaOpen] = useState(false);
  const [colabIdFalta, setColabIdFalta] = useState('');
  const [faltaData, setFaltaData] = useState(new Date().toISOString().split('T')[0]);
  const [faltaTipo, setFaltaTipo] = useState<'JUSTIFICADA' | 'INJUSTIFICADA'>('INJUSTIFICADA');
  const [faltaMotivo, setFaltaMotivo] = useState('');

  // Rejection modal
  const [rejectingAtestado, setRejectingAtestado] = useState<Atestado | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState('');

  const colaboradores = usuarios.filter(
    (u) => u.empresaId === currentEmpresa.id && u.perfil === 'FUNCIONARIO'
  );

  const empresaAtestados = atestados.filter((a) => a.empresaId === currentEmpresa.id);
  const empresaFaltas = faltas.filter((f) => f.empresaId === currentEmpresa.id);

  const handleConfirmRejeitar = () => {
    if (!rejectingAtestado || !motivoRecusa.trim()) {
      alert('Informe o motivo da recusa do atestado.');
      return;
    }
    rejeitarAtestado(rejectingAtestado.id, motivoRecusa);
    setRejectingAtestado(null);
    setMotivoRecusa('');
  };

  const handleCreateFalta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colabIdFalta) {
      alert('Selecione um colaborador.');
      return;
    }

    lancarFalta({
      usuarioId: colabIdFalta,
      data: faltaData,
      tipo: faltaTipo,
      motivo: faltaMotivo || (faltaTipo === 'JUSTIFICADA' ? 'Justificada pelo gestor' : 'Ausência injustificada'),
      descontarDsr: faltaTipo === 'INJUSTIFICADA',
    });

    setIsNewFaltaOpen(false);
    setFaltaMotivo('');
    alert('Falta registrada com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <CalendarDays className="w-6 h-6 text-[#0A5B7A]" />
            <span>Atestados Médicos & Gestão de Faltas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Avaliação de licenças médicas com abono automático e auditoria de faltas injustificadas.
          </p>
        </div>

        <button
          onClick={() => setIsNewFaltaOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#F5B800]" />
          <span>Lançar Falta Manual</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ATESTADOS')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'ATESTADOS'
              ? 'border-[#0A5B7A] text-[#0A5B7A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Atestados Médicos Recebidos ({empresaAtestados.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('FALTAS')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'FALTAS'
              ? 'border-[#0A5B7A] text-[#0A5B7A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Extrato Geral de Faltas ({empresaFaltas.length})</span>
        </button>
      </div>

      {/* Tab 1: Atestados Table */}
      {activeTab === 'ATESTADOS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {empresaAtestados.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Nenhum atestado médico registrado nesta empresa.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-4">Colaborador</th>
                    <th className="py-3 px-3">Início</th>
                    <th className="py-3 px-3 text-center">Dias de Afastamento</th>
                    <th className="py-3 px-3">CID-10</th>
                    <th className="py-3 px-3">Documento Anexo</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {empresaAtestados.map((atest) => {
                    const colab = usuarios.find((u) => u.id === atest.usuarioId);
                    return (
                      <tr key={atest.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{colab?.nome || 'Colaborador'}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {colab?.cargo || 'Geral'}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {new Date(atest.dataInicio).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800 font-mono">
                          {atest.quantidadeDias} dia(s)
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#0A5B7A]">
                          {atest.cid || 'Não informado'}
                        </td>
                        <td className="py-3 px-3">
                          <a
                            href={atest.arquivoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-[#0A5B7A] hover:underline font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Ver Atestado</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              atest.status === 'APROVADO'
                                ? 'bg-emerald-100 text-emerald-800'
                                : atest.status === 'REJEITADO'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {atest.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {atest.status === 'PENDENTE' ? (
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => {
                                  aprovarAtestado(atest.id);
                                  alert('Atestado homologado com sucesso! Dias abonados.');
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center space-x-1 shadow-xs"
                                title="Aprovar e Abonar Faltas"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Aprovar</span>
                              </button>
                              <button
                                onClick={() => setRejectingAtestado(atest)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px] flex items-center space-x-1 border border-rose-200"
                                title="Recusar Atestado"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Recusar</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Avaliado</span>
                          )}
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

      {/* Tab 2: Faltas Table */}
      {activeTab === 'FALTAS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {empresaFaltas.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Nenhuma falta registrada até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-4">Colaborador</th>
                    <th className="py-3 px-3">Data da Ausência</th>
                    <th className="py-3 px-3">Tipo</th>
                    <th className="py-3 px-4">Motivo / Justificativa</th>
                    <th className="py-3 px-3 text-center">Desconto DSR</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {empresaFaltas.map((f) => {
                    const colab = usuarios.find((u) => u.id === f.usuarioId);
                    return (
                      <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{colab?.nome || 'Colaborador'}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {colab?.cargo || 'Geral'}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {new Date(f.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              f.tipo === 'JUSTIFICADA'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {f.tipo}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{f.motivo}</td>
                        <td className="py-3 px-3 text-center">
                          {f.descontarDsr ? (
                            <span className="text-rose-700 font-bold">Sim (-DSR)</span>
                          ) : (
                            <span className="text-slate-400">Não</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                            {f.status}
                          </span>
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

      {/* Modal Rejeição Atestado */}
      {rejectingAtestado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Recusar Homologação de Atestado
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Informe a justificativa médica ou legal para a recusa deste documento.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo da Recusa:</label>
                <textarea
                  rows={3}
                  value={motivoRecusa}
                  onChange={(e) => setMotivoRecusa(e.target.value)}
                  placeholder="Ex: Documento sem carimbo/CRM legível ou prazo de 48h expirado."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingAtestado(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRejeitar}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
                >
                  Confirmar Recusa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Falta Manual */}
      {isNewFaltaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Lançamento Manual de Falta
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Registre a ocorrência para inclusão no cálculo da folha de pagamento.
            </p>

            <form onSubmit={handleCreateFalta} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Colaborador:</label>
                <select
                  required
                  value={colabIdFalta}
                  onChange={(e) => setColabIdFalta(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
                >
                  <option value="">Selecione o colaborador...</option>
                  {colaboradores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} - {c.cargo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Data da Falta:</label>
                <input
                  type="date"
                  required
                  value={faltaData}
                  onChange={(e) => setFaltaData(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo da Falta:</label>
                <select
                  value={faltaTipo}
                  onChange={(e) => setFaltaTipo(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-bold"
                >
                  <option value="INJUSTIFICADA">Injustificada (Desconto de salário + DSR)</option>
                  <option value="JUSTIFICADA">Justificada (Sem desconto financeiro)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo / Detalhes:</label>
                <textarea
                  rows={2}
                  value={faltaMotivo}
                  onChange={(e) => setFaltaMotivo(e.target.value)}
                  placeholder="Ex: Ausência integral sem justificativa documental."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewFaltaOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0A5B7A] text-white font-bold hover:bg-[#084962]"
                >
                  Registrar Falta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
