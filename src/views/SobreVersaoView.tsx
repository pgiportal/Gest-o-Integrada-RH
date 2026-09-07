import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Building2,
  Server,
  Lock,
  FileText,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Mail,
  Layers,
  Database,
  KeyRound,
  FileCheck2,
  Send,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface SobreVersaoViewProps {
  onOpenTermosModal: () => void;
  onOpenSuporteModal: () => void;
}

export const SobreVersaoView: React.FC<SobreVersaoViewProps> = ({
  onOpenTermosModal,
  onOpenSuporteModal,
}) => {
  const { currentEmpresa, currentUser, logAction } = useApp();

  // DPO Request Form State
  const [dpoTipoRequisicao, setDpoTipoRequisicao] = useState('ACESSO_DADOS');
  const [dpoObservacao, setDpoObservacao] = useState('');
  const [dpoProtocolo, setDpoProtocolo] = useState<string | null>(null);
  const [dpoSubmitting, setDpoSubmitting] = useState(false);

  const handleDpoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDpoSubmitting(true);
    setTimeout(() => {
      const protocoloId = `LGPD-${Date.now().toString().slice(-6)}`;
      setDpoProtocolo(protocoloId);
      setDpoSubmitting(false);
      logAction(
        'REQUISICAO_LGPD_TITULAR',
        'lgpd_dpo',
        `Requerimento LGPD [${dpoTipoRequisicao}] registrado sob protocolo ${protocoloId} por ${currentUser?.nome || 'Titular'}`
      );
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0A5B7A]">
              Institucional & Governança
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500">Versão & LGPD</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2 mt-1">
            <span>Sobre o Sistema & Governança LGPD</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Informações institucionais, conformidade com a Lei nº 13.709/2018 e especificações técnicas da plataforma.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenTermosModal}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:border-[#0A5B7A] bg-white text-slate-700 hover:text-[#0A5B7A] text-xs font-bold transition-all shadow-2xs flex items-center space-x-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-[#F5B800]" />
            <span>Termos de Privacidade</span>
          </button>
          <button
            onClick={onOpenSuporteModal}
            className="px-4 py-2 rounded-xl bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Falar com o Suporte</span>
          </button>
        </div>
      </div>

      {/* 1. CARD INSTITUCIONAL DA DESENVOLVEDORA E IDENTIFICAÇÃO DO SISTEMA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Brand Banner with Gradient using primary color #0A5B7A */}
        <div className="bg-gradient-to-r from-[#0A5B7A] via-[#094d68] to-[#0A5B7A] text-white p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              {/* Logo / Badge */}
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center p-2.5 flex-shrink-0 border-2 border-[#F5B800]">
                <div className="w-full h-full rounded-xl bg-[#0A5B7A] flex items-center justify-center text-white font-extrabold text-xl tracking-wider shadow-inner">
                  <span className="text-[#F5B800]">G</span>IRH
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Gestão Integrada RH
                  </h2>
                  <span className="bg-[#F5B800] text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-2xs">
                    SaaS v1.0.0
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-2xl leading-relaxed">
                  Plataforma completa de Departamento Pessoal, Admissão Digital com eSocial, parametrização de benefícios,
                  gestão de holerites, espelho de ponto eletrônico e controle de atestados médicos.
                </p>
              </div>
            </div>

            {/* Version Status Badge */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-3.5 rounded-xl text-left md:text-right flex-shrink-0">
              <div className="flex items-center md:justify-end space-x-2 mb-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                  Sistema Atualizado e Seguro
                </span>
              </div>
              <div className="text-[11px] text-teal-100 font-mono">Build de Produção 2026.09</div>
              <div className="text-[10px] text-teal-200/80">Homologado para eSocial v.S-1.2</div>
            </div>
          </div>
        </div>

        {/* Developer Fiscal & Identity Details Grid */}
        <div className="p-6 sm:p-8 bg-slate-50/70 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Empresa Desenvolvedora
            </span>
            <div className="font-extrabold text-sm text-slate-900">Portal Gestão Integrada</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Software House e Provedora de Soluções SaaS</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              CNPJ da Desenvolvedora
            </span>
            <div className="font-mono font-bold text-sm text-[#0A5B7A]">52.769.818/0001-77</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Regular perante a Receita Federal do Brasil</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Versão e Release
            </span>
            <div className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
              <span>v1.0.0</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                Stable Release
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Compatível com Portaria MTP 671 e LGPD</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Design System & Identidade
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="w-5 h-5 rounded-md bg-[#0A5B7A] border border-slate-300 shadow-2xs" title="#0A5B7A (Teal Primário)" />
              <span className="w-5 h-5 rounded-md bg-[#F5B800] border border-slate-300 shadow-2xs" title="#F5B800 (Âmbar Secundário)" />
              <span className="w-5 h-5 rounded-md bg-[#1E293B] border border-slate-300 shadow-2xs" title="#1E293B (Grafite)" />
              <span className="w-5 h-5 rounded-md bg-[#F8FAFC] border border-slate-300 shadow-2xs" title="#F8FAFC (Off-White)" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">#0A5B7A | #F5B800</p>
          </div>
        </div>
      </div>

      {/* 2. SEÇÃO DE TRANSPARÊNCIA E GOVERNANÇA LGPD (LEI Nº 13.709/2018) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2 text-[#0A5B7A] font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#F5B800]" />
            <span>Marco Regulatório e Governança de Dados</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Transparência LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018)
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Em conformidade com os princípios da finalidade, adequação, necessidade, livre acesso, qualidade dos dados,
            transparência, segurança, prevenção e não discriminação.
          </p>
        </div>

        {/* The 4 Core LGPD Pillars Defined by Law */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1: Controlador */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#0A5B7A] uppercase tracking-wider flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-[#0A5B7A]" />
                <span>Controlador dos Dados Pessoais</span>
              </span>
              <span className="bg-teal-100 text-[#0A5B7A] font-bold text-[10px] px-2 py-0.5 rounded-md">
                Empresa Contratante
              </span>
            </div>
            <div className="font-extrabold text-base text-slate-900">
              {currentEmpresa.razaoSocial}
            </div>
            <div className="text-xs text-slate-600 font-mono">
              CNPJ: {currentEmpresa.cnpj}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              A empresa contratante figura como a <strong>Controladora</strong> nos termos do Art. 5º, VI da LGPD,
              sendo titular das decisões e determinando a coleta de dados de seus colaboradores e candidatos para
              admissão, folha e obrigações trabalhistas.
            </p>
          </div>

          {/* Pillar 2: Operador */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Server className="w-4 h-4 text-[#F5B800]" />
                <span>Operador da Plataforma Tecnológica</span>
              </span>
              <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-md">
                SaaS Desenvolvedor
              </span>
            </div>
            <div className="font-extrabold text-base text-slate-900">
              Portal Gestão Integrada
            </div>
            <div className="text-xs text-slate-600 font-mono">
              CNPJ: 52.769.818/0001-77
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              A <strong>Portal Gestão Integrada</strong> atua estritamente como <strong>Operadora</strong> (Art. 5º, VII da LGPD),
              executando o tratamento técnico de dados em nome do Controlador, provendo a infraestrutura de nuvem,
              criptografia, segurança e armazenamento seguro.
            </p>
          </div>

          {/* Pillar 3: Finalidade */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Finalidade do Tratamento</span>
              </span>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-md">
                Bases Legais CLT / eSocial
              </span>
            </div>
            <div className="font-bold text-sm text-slate-900">
              Gestão Trabalhista, Admissional e Previdenciária
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 pt-1">
              <li>Gestão de processos admissionais digitais e qualificação eSocial.</li>
              <li>Armazenamento e custódia segura de documentos admissionais comprobatórios.</li>
              <li>Distribuição de holerites e espelhos de ponto eletrônico (Portaria 671 MTP).</li>
              <li>Recepção de atestados médicos para justificativa de faltas e abonos legais.</li>
            </ul>
          </div>

          {/* Pillar 4: DPO / Encarregado */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Encarregado de Proteção de Dados (DPO)</span>
              </span>
              <span className="bg-indigo-100 text-indigo-900 font-bold text-[10px] px-2 py-0.5 rounded-md">
                Canal Oficial
              </span>
            </div>
            <div className="font-bold text-sm text-slate-900">
              Comitê de Privacidade & DPO
            </div>
            <div className="text-xs font-mono font-bold text-[#0A5B7A] select-all bg-white p-1.5 rounded-md border border-slate-200 inline-block">
              dpo@portalgestaointegrada.com.br
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              Canal direto para que titulares (candidatos e colaboradores) possam solicitar a confirmação de tratamento,
              acesso a dados, correções, portabilidade ou revogação de consentimento.
            </p>
          </div>
        </div>

        {/* Interactive Subject Rights Exercise Form (Art. 18 LGPD) */}
        <div className="p-6 rounded-2xl border-2 border-teal-100 bg-teal-50/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-[#0A5B7A]" />
                <span>Canal de Atendimento a Direitos do Titular (Art. 18 da LGPD)</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Utilize este canal para formalizar requerimentos sobre seus dados pessoais armazenados na plataforma.
              </p>
            </div>
            <div className="text-[11px] text-[#0A5B7A] font-semibold flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Resposta legal em até 15 dias úteis</span>
            </div>
          </div>

          {dpoProtocolo ? (
            <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-sm text-emerald-950">Requerimento LGPD Registrado com Sucesso!</div>
              <p className="text-xs text-slate-600">
                Sua solicitação foi encaminhada para o DPO da <strong>Portal Gestão Integrada</strong> e para o gestor
                de RH da <strong>{currentEmpresa.nomeFantasia}</strong>.
              </p>
              <div className="inline-block px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 font-mono text-xs font-bold text-emerald-800">
                Protocolo: {dpoProtocolo}
              </div>
            </div>
          ) : (
            <form onSubmit={handleDpoSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Requisição do Titular</label>
                <select
                  value={dpoTipoRequisicao}
                  onChange={(e) => setDpoTipoRequisicao(e.target.value)}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-medium text-slate-800"
                >
                  <option value="ACESSO_DADOS">Acesso aos meus Dados Pessoais</option>
                  <option value="CORRECAO_DADOS">Correção de Dados Incompletos ou Inexatos</option>
                  <option value="CONFIRMACAO">Confirmação da Existência de Tratamento</option>
                  <option value="PORTABILIDADE">Portabilidade dos Dados Pessoais</option>
                  <option value="ELIMINACAO">Eliminação de Dados Desnecessários / Excessivos</option>
                  <option value="REVOGACAO">Revogação de Consentimento Pré-Admissional</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Detalhes da Solicitação</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={dpoObservacao}
                    onChange={(e) => setDpoObservacao(e.target.value)}
                    placeholder="Especifique quais informações deseja consultar ou corrigir..."
                    className="flex-1 p-2.5 bg-white rounded-xl border border-slate-300 text-slate-800 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={dpoSubmitting || !dpoObservacao.trim()}
                    className="px-4 py-2.5 bg-[#0A5B7A] hover:bg-[#084962] disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center space-x-1.5 shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{dpoSubmitting ? 'Registrando...' : 'Protocolar'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 3. ESPECIFICAÇÕES TÉCNICAS E ARQUITETURA DE SEGURANÇA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Database className="w-5 h-5 text-[#0A5B7A]" />
            <span>Arquitetura Tecnológica e Salvaguardas de Segurança</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mecanismos criptográficos e de infraestrutura implementados pela Portal Gestão Integrada.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
            <div className="flex items-center space-x-2 text-[#0A5B7A] font-bold">
              <Lock className="w-4 h-4 text-[#F5B800]" />
              <span>Criptografia de Ponta</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Tráfego integralmente encriptado com TLS 1.3. Dados em repouso cifrados via algoritmo AES-256 e senhas
              armazenadas com derivação Bcrypt e salt criptográfico.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
            <div className="flex items-center space-x-2 text-[#0A5B7A] font-bold">
              <Layers className="w-4 h-4 text-[#F5B800]" />
              <span>Segregação Lógica Multi-Tenant</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Isolamento hermético de dados por <code>empresa_id</code>. Nenhum dado transita entre empresas distintas,
              com proteção garantida em todas as queries e rotas de API.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
            <div className="flex items-center space-x-2 text-[#0A5B7A] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#F5B800]" />
              <span>Trilha de Auditoria Imutável</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Auditoria ativa em conformidade com o Art. 16 da LGPD, registrando usuário, IP, dispositivo, operação e
              timestamp para cada evento crítico no sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
