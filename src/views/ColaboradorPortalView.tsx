import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, MESES } from '../lib/formatters';
import {
  FileText,
  Clock,
  CalendarDays,
  Upload,
  Printer,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  Building,
  Plus,
} from 'lucide-react';

interface ColaboradorPortalViewProps {
  initialSubTab?: string;
  onViewHolerite: (holeriteId: string) => void;
  onViewPonto: (folhaPontoId: string) => void;
}

export const ColaboradorPortalView: React.FC<ColaboradorPortalViewProps> = ({
  initialSubTab = 'overview',
  onViewHolerite,
  onViewPonto,
}) => {
  const {
    currentUser,
    currentEmpresa,
    holerites,
    folhasPonto,
    atestados,
    faltas,
    enviarAtestado,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>(initialSubTab);

  // New Atestado Form
  const [isAtestadoModalOpen, setIsAtestadoModalOpen] = useState(false);
  const [atestadoInicio, setAtestadoInicio] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [atestadoDias, setAtestadoDias] = useState<number>(1);
  const [atestadoCid, setAtestadoCid] = useState('');
  const [atestadoFileUrl, setAtestadoFileUrl] = useState('');

  // Filter data for this user
  const userHolerites = holerites.filter((h) => h.usuarioId === currentUser?.id);
  const userPontos = folhasPonto.filter((p) => p.usuarioId === currentUser?.id);
  const userAtestados = atestados.filter((a) => a.usuarioId === currentUser?.id);
  const userFaltas = faltas.filter((f) => f.usuarioId === currentUser?.id);

  const latestHolerite = userHolerites[userHolerites.length - 1];
  const latestPonto = userPontos[userPontos.length - 1];

  const handleAtestadoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAtestadoFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitAtestado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    enviarAtestado({
      usuarioId: currentUser.id,
      dataInicio: atestadoInicio,
      quantidadeDias: atestadoDias,
      cid: atestadoCid || undefined,
      arquivoUrl: atestadoFileUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600',
    });

    setIsAtestadoModalOpen(false);
    setAtestadoCid('');
    setAtestadoFileUrl('');
    alert('Atestado médico enviado com sucesso para validação do RH!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0A5B7A] font-black text-xl flex items-center justify-center border border-teal-200">
            {currentUser?.nome.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900">
                Olá, {currentUser?.nome}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                COLABORADOR CLT
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser?.cargo || 'Desenvolvedor'} • {currentEmpresa.nomeFantasia} • Admissão:{' '}
              {currentUser?.dataAdmissao
                ? new Date(currentUser.dataAdmissao).toLocaleDateString('pt-BR')
                : '15/08/2024'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAtestadoModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4 text-[#F5B800]" />
            <span>Enviar Atestado Médico</span>
          </button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Meu Painel', icon: Briefcase },
          { id: 'holerites', label: `Meus Holerites (${userHolerites.length})`, icon: FileText },
          { id: 'ponto', label: `Espelho de Ponto (${userPontos.length})`, icon: Clock },
          { id: 'atestados', label: `Meus Atestados (${userAtestados.length})`, icon: CalendarDays },
          { id: 'faltas', label: `Minhas Faltas (${userFaltas.length})`, icon: AlertCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#0A5B7A] text-[#0A5B7A]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Último Salário Líquido
              </span>
              <div className="text-2xl font-black text-[#0A5B7A] font-mono mt-1">
                {latestHolerite ? formatCurrency(latestHolerite.salarioLiquido) : 'R$ 0,00'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Competência:{' '}
                {latestHolerite
                  ? `${MESES[latestHolerite.mes - 1]}/${latestHolerite.ano}`
                  : 'Sem registro'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Saldo Banco de Horas
              </span>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                {latestPonto ? latestPonto.saldoBancoHoras : '+00:00'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Acumulado apurado neste mês</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Status de Frequência
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {userFaltas.filter((f) => f.tipo === 'INJUSTIFICADA').length} falta(s)
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                {userAtestados.length} atestado(s) homologado(s)
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Payslip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Latest Payslip card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#0A5B7A]" />
                  <span>Último Contracheque Publicado</span>
                </h3>
                {latestHolerite && (
                  <button
                    onClick={() => onViewHolerite(latestHolerite.id)}
                    className="text-xs font-bold text-[#0A5B7A] hover:underline"
                  >
                    Abrir Completo
                  </button>
                )}
              </div>

              {latestHolerite ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-600">Competência:</span>
                    <span className="font-bold text-slate-900">
                      {MESES[latestHolerite.mes - 1]} / {latestHolerite.ano}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-600">Total Proventos:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(latestHolerite.totalVencimentos)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-600">Total Descontos (INSS/IRRF/VT):</span>
                    <span className="font-mono font-bold text-rose-700">
                      -{formatCurrency(latestHolerite.totalDescontos)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                    <span className="font-extrabold text-[#0A5B7A]">Líquido a Receber:</span>
                    <span className="font-mono font-black text-[#0A5B7A] text-base">
                      {formatCurrency(latestHolerite.salarioLiquido)}
                    </span>
                  </div>

                  <button
                    onClick={() => onViewHolerite(latestHolerite.id)}
                    className="w-full mt-2 py-2 bg-[#0A5B7A] hover:bg-[#084962] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#F5B800]" />
                    <span>Visualizar & Imprimir PDF Oficial</span>
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum holerite emitido até o momento.
                </div>
              )}
            </div>

            {/* Timesheet Summary */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#0A5B7A]" />
                  <span>Meu Espelho de Ponto Atual</span>
                </h3>
                {latestPonto && (
                  <button
                    onClick={() => onViewPonto(latestPonto.id)}
                    className="text-xs font-bold text-[#0A5B7A] hover:underline"
                  >
                    Ver Marcações
                  </button>
                )}
              </div>

              {latestPonto ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-600">Competência:</span>
                    <span className="font-bold text-slate-900">
                      {MESES[latestPonto.mes - 1]} / {latestPonto.ano}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-600">Horas Trabalhadas:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {latestPonto.totalHorasTrabalhadas}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-600">Horas Extras (+50%):</span>
                    <span className="font-mono font-bold text-emerald-700">
                      +{latestPonto.totalHorasExtras}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                    <span className="font-extrabold text-slate-800">Saldo Banco:</span>
                    <span className="font-mono font-black text-emerald-700">
                      {latestPonto.saldoBancoHoras}
                    </span>
                  </div>

                  <button
                    onClick={() => onViewPonto(latestPonto.id)}
                    className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 border border-slate-200"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#0A5B7A]" />
                    <span>Conferir Marcações Diárias</span>
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum registro de ponto encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: HOLERITES */}
      {activeTab === 'holerites' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">
              Histórico de Recibos de Pagamento de Salário (Holerites)
            </span>
            <span className="text-slate-500">Formato oficial CLT com detalhamento de proventos e descontos</span>
          </div>

          {userHolerites.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Nenhum holerite publicado até o momento.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {userHolerites.map((h) => (
                <div
                  key={h.id}
                  className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Holerite de {MESES[h.mes - 1]} de {h.ano}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Proventos: {formatCurrency(h.totalVencimentos)} • Descontos:{' '}
                      {formatCurrency(h.totalDescontos)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Valor Líquido
                      </span>
                      <span className="text-base font-black text-[#0A5B7A] font-mono">
                        {formatCurrency(h.salarioLiquido)}
                      </span>
                    </div>

                    <button
                      onClick={() => onViewHolerite(h.id)}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#F5B800]" />
                      <span>Visualizar / PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: PONTO */}
      {activeTab === 'ponto' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Espelhos de Ponto Eletrônico Mensais</span>
            <span className="text-slate-500">Portaria MTP nº 671/2021</span>
          </div>

          {userPontos.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Nenhuma folha de ponto disponível no momento.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {userPontos.map((p) => (
                <div
                  key={p.id}
                  className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Folha de Ponto - {MESES[p.mes - 1]} de {p.ano}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Horas Trabalhadas: {p.totalHorasTrabalhadas} • Extras: {p.totalHorasExtras} • Saldo:{' '}
                      <strong className="text-emerald-700">{p.saldoBancoHoras}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => onViewPonto(p.id)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-end sm:self-center"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#F5B800]" />
                    <span>Ver Espelho Completo</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: ATESTADOS */}
      {activeTab === 'atestados' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Atestados Médicos Enviados</span>
            <button
              onClick={() => setIsAtestadoModalOpen(true)}
              className="px-3 py-1.5 bg-[#0A5B7A] text-white rounded-lg font-bold hover:bg-[#084962]"
            >
              + Novo Atestado
            </button>
          </div>

          {userAtestados.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Nenhum atestado médico cadastrado.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {userAtestados.map((a) => (
                <div
                  key={a.id}
                  className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900">
                        Atestado de {a.quantidadeDias} dia(s)
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          a.status === 'APROVADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.status === 'REJEITADO'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Início em: {new Date(a.dataInicio).toLocaleDateString('pt-BR')} • CID: {a.cid || 'Não informado'}
                    </div>
                    {a.observacaoRh && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg mt-2 border border-amber-200">
                        Parecer do RH: {a.observacaoRh}
                      </div>
                    )}
                  </div>

                  <a
                    href={a.arquivoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold self-end sm:self-center"
                  >
                    Visualizar Anexo
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: FALTAS */}
      {activeTab === 'faltas' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Meu Extrato de Faltas e Ocorrências</span>
            <span className="text-slate-500">Transparência em conformidade com o Art. 473 da CLT</span>
          </div>

          {userFaltas.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Parabéns! Você não possui faltas ou ausências registradas.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {userFaltas.map((f) => (
                <div
                  key={f.id}
                  className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Ausência em {new Date(f.data).toLocaleDateString('pt-BR')}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          f.tipo === 'JUSTIFICADA'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {f.tipo}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">Motivo: {f.motivo}</p>
                  </div>

                  <div>
                    {f.descontarDsr ? (
                      <span className="text-rose-700 font-bold bg-rose-50 px-2 py-1 rounded text-[11px] border border-rose-200">
                        Com Desconto de Salário e DSR
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded text-[11px] border border-emerald-200">
                        Abonada / Sem Desconto
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Envio de Atestado */}
      {isAtestadoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Envio de Atestado Médico
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Envie fotos ou PDF legível contendo CRM do médico, data e quantidade de dias.
            </p>

            <form onSubmit={handleSubmitAtestado} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Data de Início do Afastamento:</label>
                <input
                  type="date"
                  required
                  value={atestadoInicio}
                  onChange={(e) => setAtestadoInicio(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quantidade de Dias:</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={atestadoDias}
                  onChange={(e) => setAtestadoDias(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Código CID-10 (Opcional):</label>
                <input
                  type="text"
                  value={atestadoCid}
                  onChange={(e) => setAtestadoCid(e.target.value.toUpperCase())}
                  placeholder="Ex: J06.9"
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Arquivo do Atestado (Foto/PDF):</label>
                <label className="cursor-pointer flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-slate-300 hover:border-[#0A5B7A] rounded-xl bg-slate-50 text-slate-600 font-semibold">
                  <Upload className="w-4 h-4 text-[#0A5B7A]" />
                  <span>{atestadoFileUrl ? 'Arquivo Carregado ✓' : 'Escolher Arquivo...'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleAtestadoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAtestadoModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0A5B7A] text-white font-bold hover:bg-[#084962]"
                >
                  Enviar ao RH
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
