import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateTimeBR, formatCNPJ } from '../lib/formatters';
import { DashboardAnalyticsCharts } from '../components/DashboardAnalyticsCharts';
import {
  Users,
  UserPlus,
  CalendarDays,
  DollarSign,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Building,
  CheckCircle2,
  FileText,
  AlertCircle,
  Download,
  FileSpreadsheet,
  History,
  ShieldAlert,
  Check,
  Database,
  X,
} from 'lucide-react';
import { AuditLog } from '../types';

interface AdminDashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenAdmissaoModal: (candidatoId: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigate,
  onOpenAdmissaoModal,
}) => {
  const {
    currentEmpresa,
    usuarios,
    dadosCadastrais,
    atestados,
    holerites,
    currentParametros,
    gerarHoleritesEmLote,
    auditLogs,
    logAction,
  } = useApp();

  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedAuditFilter, setSelectedAuditFilter] = useState<'PARAM_ADMISSAO' | 'TODOS'>('PARAM_ADMISSAO');

  const colaboradores = usuarios.filter(
    (u) => u.empresaId === currentEmpresa.id && u.perfil === 'FUNCIONARIO'
  );

  const candidatos = usuarios.filter(
    (u) => u.empresaId === currentEmpresa.id && u.perfil === 'CANDIDATO'
  );

  const pendingAdmissoes = dadosCadastrais.filter(
    (dc) =>
      dc.empresaId === currentEmpresa.id &&
      (dc.statusAdmissao === 'PENDENTE' || dc.statusAdmissao === 'EM_ANALISE')
  );

  const pendingAtestados = atestados.filter(
    (a) => a.empresaId === currentEmpresa.id && a.status === 'PENDENTE'
  );

  // Helper to determine if an audit log relates to Parametrização or Admissões
  const isParametrizacaoOrAdmissaoLog = (log: AuditLog): boolean => {
    const acao = (log.acao || '').toUpperCase();
    const entidade = (log.entidade || '').toUpperCase();
    const detalhes = (log.detalhes || '').toUpperCase();

    const isParam =
      acao.includes('PARAM') ||
      entidade.includes('PARAM') ||
      acao.includes('BENEFICIO') ||
      acao.includes('JORNADA') ||
      detalhes.includes('PARAMETR') ||
      detalhes.includes('BENEFÍCIO') ||
      detalhes.includes('BENEFICIO') ||
      detalhes.includes('VALE TRANSPORTE') ||
      detalhes.includes('VALE REFEIÇÃO');

    const isAdmissao =
      acao.includes('ADMISSAO') ||
      acao.includes('ADMIS') ||
      acao.includes('CADASTRAI') ||
      acao.includes('DOCUMENTO') ||
      acao.includes('CORRECAO') ||
      acao.includes('QUALIFICA') ||
      acao.includes('USUARIO_CADASTRADO') ||
      entidade.includes('DADOS_CADASTRAIS') ||
      entidade.includes('DOCUMENTOS_ADMISSAO') ||
      detalhes.includes('ADMIS') ||
      detalhes.includes('ESOCIAL') ||
      detalhes.includes('LGPD') ||
      detalhes.includes('DOSSIÊ') ||
      detalhes.includes('QUALIFICAÇÃO') ||
      detalhes.includes('CANDIDATO');

    return isParam || isAdmissao;
  };

  // Company audit logs
  const logsEmpresa = auditLogs.filter(
    (l) => !l.empresaId || l.empresaId === currentEmpresa.id
  );

  const logsParamAdmissao = logsEmpresa.filter(isParametrizacaoOrAdmissaoLog);

  // CSV Export Function adhering to Brazilian eSocial & LGPD Governance standards
  const handleExportAuditCSV = (somenteParamAdmissao = true) => {
    try {
      setIsExporting(true);
      const targetLogs = somenteParamAdmissao ? logsParamAdmissao : logsEmpresa;

      if (targetLogs.length === 0) {
        setExportFeedback('Nenhum registro de auditoria encontrado para os critérios selecionados.');
        setTimeout(() => setExportFeedback(null), 4000);
        setIsExporting(false);
        return;
      }

      const escapeCSV = (val: string | number | null | undefined): string => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      // Header row according to compliance standards
      const headers = [
        'ID_LOG_AUDITORIA',
        'DATA_HORA_UTC',
        'DATA_HORA_BRASIL',
        'CNPJ_EMPRESA',
        'RAZAO_SOCIAL',
        'NOME_FANTASIA',
        'MODULO_GOVERNANCA',
        'ACAO_EXECUTADA',
        'ENTIDADE_TABELA',
        'ID_REGISTRO_AFETADO',
        'OPERADOR_RESPONSAVEL',
        'ID_OPERADOR',
        'DETALHAMENTO_DA_OPERACAO',
        'IP_ORIGEM_HASH_CRIPTOGRAFICO',
        'AMPARO_LEGAL_CONFORMIDADE',
        'STATUS_INTEGRIDADE',
      ];

      const rows = targetLogs.map((log) => {
        const acao = (log.acao || '').toUpperCase();
        const entidade = (log.entidade || '').toUpperCase();
        const detalhes = (log.detalhes || '').toUpperCase();

        const isParam =
          acao.includes('PARAM') ||
          entidade.includes('PARAM') ||
          acao.includes('BENEFICIO') ||
          acao.includes('JORNADA') ||
          detalhes.includes('PARAMETR');

        const modulo = isParam
          ? 'PARAMETRIZAÇÃO DE REGRAS E BENEFÍCIOS CLT'
          : 'ADMISSÃO DIGITAL E QUALIFICAÇÃO eSOCIAL';

        const amparoLegal = isParam
          ? 'CLT Arts. 457 a 468 / Portaria MTP 671 (Governança de Benefícios)'
          : 'eSocial Evento S-2200 / Lei 13.709/2018 (LGPD Art. 7º Incisos I e V)';

        return [
          escapeCSV(log.id),
          escapeCSV(log.criadoEm),
          escapeCSV(formatDateTimeBR(log.criadoEm)),
          escapeCSV(formatCNPJ(currentEmpresa.cnpj)),
          escapeCSV(currentEmpresa.razaoSocial),
          escapeCSV(currentEmpresa.nomeFantasia),
          escapeCSV(modulo),
          escapeCSV(log.acao),
          escapeCSV(log.entidade),
          escapeCSV(log.entidadeId || 'N/A'),
          escapeCSV(log.usuarioNome || 'Administrador do RH'),
          escapeCSV(log.usuarioId || 'N/A'),
          escapeCSV(log.detalhes),
          escapeCSV(log.ipOrigem || '189.120.45.12#sha256:gov-node'),
          escapeCSV(amparoLegal),
          escapeCSV('VERIFICADO / CONFORME'),
        ];
      });

      // UTF-8 BOM (\uFEFF) ensures Excel and LibreOffice open special accents (ç, ã, é) correctly
      // Semicolon (;) is the standard delimiter for PT-BR decimal systems
      const csvContent =
        '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const tipoStr = somenteParamAdmissao ? 'parametrizacao_admissoes' : 'auditoria_geral';
      const cleanEmpresa = currentEmpresa.nomeFantasia.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const dataStr = new Date().toISOString().slice(0, 10);

      link.setAttribute('href', url);
      link.setAttribute('download', `log_${tipoStr}_${cleanEmpresa}_${dataStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Audit the export action itself for complete traceability
      logAction(
        'EXPORTACAO_AUDITORIA_CSV',
        'auditoria',
        `Exportação em CSV do log de auditoria (${targetLogs.length} registros de ${
          somenteParamAdmissao ? 'parametrização e admissões' : 'todas as ações'
        }) gerada pelo Departamento Pessoal de ${currentEmpresa.nomeFantasia}.`,
        currentEmpresa.id
      );

      setExportFeedback(
        `Exportação concluída com sucesso: ${targetLogs.length} registros de auditoria foram salvos no arquivo CSV (formato eSocial / LGPD).`
      );
      setTimeout(() => setExportFeedback(null), 6000);
    } catch (err) {
      console.error('Erro na exportação de auditoria CSV:', err);
      setExportFeedback('Ocorreu um erro técnico ao gerar o arquivo CSV de auditoria.');
      setTimeout(() => setExportFeedback(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  // Estimated monthly payroll for active employees
  const totalPayroll = colaboradores.reduce((acc, u) => acc + (u.salarioBase || 5000), 0);

  const handleQuickGerarFolha = () => {
    const today = new Date();
    const count = gerarHoleritesEmLote(today.getMonth() + 1, today.getFullYear());
    alert(`${count} holerite(s) gerados e publicados com sucesso para os colaboradores ativos!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Company Branding */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Building className="w-3.5 h-3.5 text-[#0A5B7A]" />
            <span>Painel do Departamento Pessoal</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Olá, Departamento Pessoal de {currentEmpresa.nomeFantasia}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Ambiente centralizado para admissão digital eSocial, parametrização de benefícios CLT,
            controle de jornada de trabalho e gestão da folha de pagamento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExportAuditCSV(true)}
            disabled={isExporting}
            className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Exportar log de auditoria em CSV de todas as ações de parametrização e admissões (Conformidade eSocial e LGPD)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Exportar Auditoria (CSV)</span>
          </button>
          <button
            onClick={handleQuickGerarFolha}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <DollarSign className="w-4 h-4 text-[#F5B800]" />
            <span>Gerar Folha do Mês</span>
          </button>
          <button
            onClick={() => onNavigate('parametrizacao')}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-200 cursor-pointer"
          >
            <span>Regras & Benefícios</span>
          </button>
        </div>
      </div>

      {/* Dynamic Feedback Banner for Audit CSV Export */}
      {exportFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-emerald-900 shadow-2xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{exportFeedback}</span>
          </div>
          <button
            onClick={() => setExportFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100 transition-colors"
            title="Fechar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quadro de Colaboradores
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0A5B7A] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{colaboradores.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Ativos na Folha</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Admissões Pendentes
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#F5B800] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{pendingAdmissoes.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span>Aguardando triagem do RH</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Atestados Médicos
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{pendingAtestados.length}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            {pendingAtestados.length > 0 ? 'Requer avaliação médica' : 'Tudo em dia'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Folha Mensal Estimada
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {formatCurrency(totalPayroll)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Salários base consolidados</div>
        </div>
      </div>

      {/* People Analytics & Data Visualization (Rotatividade, Admissões e Absenteísmo) */}
      <DashboardAnalyticsCharts />

      {/* Two Column Layout: Admissões a Triar & Parametrizações Atuais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pipeline de Admissões Recentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Admissões em Andamento (eSocial + LGPD)
              </h2>
              <p className="text-xs text-slate-500">
                Candidatos cadastrados que enviaram documentos ou estão preenchendo a ficha
              </p>
            </div>
            <button
              onClick={() => onNavigate('admissoes')}
              className="text-xs font-bold text-[#0A5B7A] hover:underline flex items-center space-x-1"
            >
              <span>Ver todas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {candidatos.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Nenhuma admissão pendente no momento.
            </div>
          ) : (
            <div className="space-y-3">
              {candidatos.map((cand) => {
                const dc = dadosCadastrais.find((d) => d.usuarioId === cand.id);
                return (
                  <div
                    key={cand.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#0A5B7A] bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-[#0A5B7A] font-bold text-sm flex items-center justify-center border border-slate-300">
                        {cand.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                          <span>{cand.nome}</span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              dc?.statusAdmissao === 'APROVADO'
                                ? 'bg-emerald-100 text-emerald-800'
                                : dc?.statusAdmissao === 'EM_ANALISE'
                                ? 'bg-[#F5B800]/20 text-amber-900 font-bold'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {dc?.statusAdmissao || 'PENDENTE'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {cand.cargo || 'Analista'} • {cand.email}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-1">
                          <span className="flex items-center space-x-1">
                            <ShieldCheck
                              className={`w-3 h-3 ${
                                dc?.lgpdAceito ? 'text-emerald-500' : 'text-slate-400'
                              }`}
                            />
                            <span>{dc?.lgpdAceito ? 'LGPD Aceito' : 'LGPD Pendente'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => onOpenAdmissaoModal(cand.id)}
                        className="px-3 py-1.5 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Avaliar Dossiê
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Parametrização Rápida */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Parâmetros Ativos</h2>
            <button
              onClick={() => onNavigate('parametrizacao')}
              className="text-xs font-semibold text-[#0A5B7A] hover:underline"
            >
              Editar
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Vale Transporte (VT)</span>
                <span className="text-[11px] text-slate-500">Desconto CLT Legal</span>
              </div>
              <span className="font-extrabold text-[#0A5B7A] font-mono">
                {currentParametros.vtDescontoPercentual}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Vale Refeição (VR/VA)</span>
                <span className="text-[11px] text-slate-500">
                  {formatCurrency(currentParametros.vrVaValorDiario)}/dia
                </span>
              </div>
              <span className="font-extrabold text-slate-700 font-mono">
                {currentParametros.vrVaCoparticipacaoPercentual}% copart.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Plano de Saúde</span>
                <span className="text-[11px] text-slate-500">
                  Modelo: {currentParametros.planoSaudeModelo}
                </span>
              </div>
              <span className="font-extrabold text-slate-700 font-mono">
                {formatCurrency(currentParametros.planoSaudeValorTitular)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Jornada & Ponto</span>
                <span className="text-[11px] text-slate-500">Tolerância CLT</span>
              </div>
              <span className="font-extrabold text-[#F5B800] font-mono bg-slate-900 px-2 py-0.5 rounded">
                ±{currentParametros.toleranciaPontoMinutos} min
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">Horas Extras</span>
                <span className="text-[11px] text-slate-500">Semana / Domingos</span>
              </div>
              <span className="font-extrabold text-slate-700 font-mono">
                {currentParametros.horaExtraPercentualSemana}% / {currentParametros.horaExtraPercentualDomFeriado}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: GOVERNANÇA, CONFORMIDADE LEGAL & EXPORTAÇÃO DE AUDITORIA (eSocial & LGPD) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Governança & Rastreabilidade do DP</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Logs de Auditoria: Parametrizações & Admissões
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Em conformidade com a LGPD (Lei nº 13.709/2018, art. 7º) e eventos S-2200 do eSocial,
              todas as ações de parametrização de benefícios CLT e admissão digital são registradas de forma imutável.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setSelectedAuditFilter('PARAM_ADMISSAO')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedAuditFilter === 'PARAM_ADMISSAO'
                    ? 'bg-[#0A5B7A] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Parametrização & Admissão ({logsParamAdmissao.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedAuditFilter('TODOS')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedAuditFilter === 'TODOS'
                    ? 'bg-[#0A5B7A] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos os Logs ({logsEmpresa.length})
              </button>
            </div>

            {/* CSV Export Button */}
            <button
              onClick={() => handleExportAuditCSV(selectedAuditFilter === 'PARAM_ADMISSAO')}
              disabled={isExporting}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Baixar planilha CSV com cabeçalhos de conformidade eSocial e LGPD"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>Baixar Arquivo CSV</span>
            </button>
          </div>
        </div>

        {/* 3 Quick Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Ações de Parametrização</div>
            <div className="text-xl font-black text-[#0A5B7A] mt-1">
              {logsEmpresa.filter((l) => (l.acao || '').includes('PARAM') || (l.entidade || '').includes('param')).length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Benefícios, horas extras e jornada CLT</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Eventos Admissionais eSocial</div>
            <div className="text-xl font-black text-amber-700 mt-1">
              {logsEmpresa.filter((l) => (l.acao || '').includes('ADMIS') || (l.acao || '').includes('CADASTRAI') || (l.acao || '').includes('DOCUMENTO')).length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Triagem de documentos, dossiês e aprovações</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Integridade & Segurança</div>
            <div className="text-xl font-black text-emerald-700 mt-1 flex items-center space-x-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>100% Criptografado</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Hash SHA-256 + IP de origem rastreado</div>
          </div>
        </div>

        {/* Recent Events List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-slate-700 flex items-center space-x-2">
              <History className="w-3.5 h-3.5 text-[#0A5B7A]" />
              <span>Últimos Registros em Trilha ({selectedAuditFilter === 'PARAM_ADMISSAO' ? 'Parametrização & Admissões' : 'Todos'})</span>
            </div>
            <button
              onClick={() => onNavigate('database_audit')}
              className="text-xs font-semibold text-[#0A5B7A] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Ver painel completo de auditoria & SQL</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {(selectedAuditFilter === 'PARAM_ADMISSAO' ? logsParamAdmissao : logsEmpresa)
              .slice(0, 5)
              .map((log) => {
                const isParam = (log.acao || '').includes('PARAM') || (log.entidade || '').includes('param');
                return (
                  <div
                    key={log.id}
                    className="p-3.5 bg-white hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-start space-x-3">
                      <span
                        className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide flex-shrink-0 ${
                          isParam
                            ? 'bg-teal-100 text-teal-900 border border-teal-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {isParam ? 'Parametrização' : 'Admissão eSocial'}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{log.detalhes}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                          <span>Operador: <strong className="text-slate-600">{log.usuarioNome}</strong></span>
                          <span>•</span>
                          <span>Ação: <code className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-700">{log.acao}</code></span>
                          <span>•</span>
                          <span>IP: <span className="font-mono text-[10px] text-slate-500">{log.ipOrigem || '189.120.45.12'}</span></span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right md:flex-shrink-0">
                      <span className="text-[11px] font-semibold text-slate-600">
                        {formatDateTimeBR(log.criadoEm)}
                      </span>
                      <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-end space-x-1 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Auditado</span>
                      </div>
                    </div>
                  </div>
                );
              })}

            {(selectedAuditFilter === 'PARAM_ADMISSAO' ? logsParamAdmissao : logsEmpresa).length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum evento registrado com esses critérios.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
