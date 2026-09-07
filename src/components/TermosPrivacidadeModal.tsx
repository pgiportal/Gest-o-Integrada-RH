import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  X,
  Lock,
  Database,
  FileText,
  UserCheck,
  Server,
  Building2,
  Printer,
  CheckCircle2,
} from 'lucide-react';

interface TermosPrivacidadeModalProps {
  onClose: () => void;
}

export const TermosPrivacidadeModal: React.FC<TermosPrivacidadeModalProps> = ({ onClose }) => {
  const { currentEmpresa } = useApp();
  const [activeSection, setActiveSection] = useState<'geral' | 'seguranca' | 'retencao' | 'direitos'>('geral');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#0A5B7A] text-white p-5 flex items-center justify-between border-b border-teal-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5B800] text-slate-900 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Termos de Uso, Privacidade e Segurança da Informação
              </h2>
              <p className="text-xs text-teal-100/80">
                Governança em Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-teal-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-[#0A5B7A]" />
              <span>Controlador dos Dados Pessoais</span>
            </div>
            <div className="font-bold text-slate-900">{currentEmpresa.razaoSocial}</div>
            <div className="text-[11px] text-slate-500 font-mono">CNPJ: {currentEmpresa.cnpj}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Responsável legal pelas decisões de tratamento de dados de seus candidatos e empregados.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Server className="w-3.5 h-3.5 text-[#F5B800]" />
              <span>Operador da Plataforma Tecnológica</span>
            </div>
            <div className="font-bold text-slate-900">Portal Gestão Integrada</div>
            <div className="text-[11px] text-slate-500 font-mono">CNPJ: 52.769.818/0001-77</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Desenvolvedora e provedora do software SaaS, atuando sob estritas ordens do Controlador.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-4 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveSection('geral')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeSection === 'geral'
                ? 'border-[#0A5B7A] text-[#0A5B7A]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Finalidades e Bases Legais</span>
          </button>
          <button
            onClick={() => setActiveSection('seguranca')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeSection === 'seguranca'
                ? 'border-[#0A5B7A] text-[#0A5B7A]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>2. Criptografia & Segurança</span>
          </button>
          <button
            onClick={() => setActiveSection('retencao')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeSection === 'retencao'
                ? 'border-[#0A5B7A] text-[#0A5B7A]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>3. Retenção & Descarte</span>
          </button>
          <button
            onClick={() => setActiveSection('direitos')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeSection === 'direitos'
                ? 'border-[#0A5B7A] text-[#0A5B7A]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>4. Direitos do Titular & DPO</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed flex-1">
          {activeSection === 'geral' && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#0A5B7A]" />
                <span>Finalidades Específicas do Tratamento e Bases Legais</span>
              </h3>
              <p>
                A plataforma <strong>Gestão Integrada RH</strong> foi desenvolvida por{' '}
                <strong>Portal Gestão Integrada (CNPJ: 52.769.818/0001-77)</strong> para suportar a rotina de
                Recursos Humanos e Departamento Pessoal com os seguintes fins e bases legais:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Admissão Digital e Qualificação Cadastral:</strong> Coleta de documentos pessoais (RG, CPF,
                  CTPS, comprovante de residência e dados bancários) sob a base legal de{' '}
                  <em>execução de contrato de trabalho (Art. 7º, V, LGPD)</em> e{' '}
                  <em>cumprimento de obrigação legal perante o eSocial (Art. 7º, II, LGPD)</em>.
                </li>
                <li>
                  <strong>Distribuição de Holerites e Comprovantes Salariais:</strong> Disponibilização segura de recibos
                  de pagamento com detalhamento de proventos, descontos de VT/VR/Plano e recolhimentos de INSS e FGTS
                  (Art. 464 da CLT).
                </li>
                <li>
                  <strong>Espelho de Ponto Eletrônico:</strong> Registro e exibição de marcações de jornada, banco de
                  horas e horas extras em conformidade com a <em>Portaria MTP nº 671/2021</em>.
                </li>
                <li>
                  <strong>Recepção e Gestão de Atestados Médicos:</strong> Tratamento de dados de saúde e códigos CID
                  estritamente para justificativa legal de ausências remuneradas e abono de faltas, mantidos sob
                  estrito sigilo médico conforme a Resolução CFM nº 1.658/2002 e Art. 11, II, "a" da LGPD.
                </li>
              </ul>
            </div>
          )}

          {activeSection === 'seguranca' && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#0A5B7A]" />
                <span>Arquitetura de Segurança, Criptografia e Isolamento Multi-Tenant</span>
              </h3>
              <p>
                A desenvolvedora <strong>Portal Gestão Integrada</strong> implementa mecanismos de segurança de nível
                bancário para garantir a integridade, confidencialidade e disponibilidade dos dados:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">Criptografia Forte em Trânsito e Repouso</div>
                  <p className="text-[11px] text-slate-500">
                    Comunicações protegidas via protocolo TLS 1.3 / HTTPS com chave RSA de 2048 bits. Dados sensíveis e
                    senhas criptografados em repouso com algoritmo padrão AES-256 e hashing Bcrypt.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">Isolamento Lógico Multi-Tenant</div>
                  <p className="text-[11px] text-slate-500">
                    Garantia estrutural de que nenhuma empresa cliente consiga acessar, visualizar ou manipular dados de
                    outras empresas, com filtragem mandatória de <code>empresa_id</code> na camada de persistência.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">Rastreabilidade e Trilha de Auditoria</div>
                  <p className="text-[11px] text-slate-500">
                    Registro imutável de todas as ações de leitura, escrita, download de holerites e aceite de termos com
                    gravação de endereço IP, hash de autenticação e carimbo temporal.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">Backup e Resiliência Contínua</div>
                  <p className="text-[11px] text-slate-500">
                    Rotinas de backup automatizadas diariamente com retenção e redundância geográfica para recuperação
                    de desastres (RPO &lt; 1 hora, RTO &lt; 4 horas).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'retencao' && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Database className="w-4 h-4 text-[#0A5B7A]" />
                <span>Política de Retenção e Descarte Seguro de Dados</span>
              </h3>
              <p>
                Os prazos de guarda dos dados na plataforma são determinados estritamente pela legislação trabalhista,
                previdenciária e tributária brasileira:
              </p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-left">Tipo de Documento / Dado</th>
                      <th className="p-2.5 text-left">Prazo Legal de Retenção</th>
                      <th className="p-2.5 text-left">Fundamento Legal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-semibold">Folhas de Pagamento e Holerites</td>
                      <td className="p-2.5 font-mono text-[#0A5B7A]">5 anos (trabalhista) / 10 anos (fiscal)</td>
                      <td className="p-2.5 text-slate-500">Art. 7º, XXIX, CF/88 e Art. 11 da CLT</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Espelho de Ponto Eletrônico</td>
                      <td className="p-2.5 font-mono text-[#0A5B7A]">5 anos</td>
                      <td className="p-2.5 text-slate-500">Portaria MTP nº 671/2021</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Documentos de FGTS e Previdência</td>
                      <td className="p-2.5 font-mono text-[#0A5B7A]">30 anos / Histórico vitalício</td>
                      <td className="p-2.5 text-slate-500">Lei nº 8.036/1990 e Decreto 3.048/1999</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Atestados Médicos e Prontuários</td>
                      <td className="p-2.5 font-mono text-[#0A5B7A]">20 anos após desligamento</td>
                      <td className="p-2.5 text-slate-500">NR-07 e Resolução CFM 1.821/2007</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Candidatos não admitidos</td>
                      <td className="p-2.5 font-mono text-[#0A5B7A]">6 a 12 meses ou descarte imediato</td>
                      <td className="p-2.5 text-slate-500">Prazo prescricional de ações pré-contratuais</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'direitos' && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-[#0A5B7A]" />
                <span>Exercício de Direitos dos Titulares e Contato com o DPO</span>
              </h3>
              <p>
                Nos termos do <strong>Artigo 18 da LGPD</strong>, todo colaborador, candidato ou prestador possui o
                direito de solicitar:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Confirmação da existência de tratamento dos seus dados.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Acesso integral e exportação dos dados cadastrais armazenados.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Correção de dados incompletos, inexatos ou desatualizados.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Revogação de consentimento nos casos aplicáveis por lei.</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 mt-3 text-xs">
                <div className="font-bold text-[#0A5B7A] mb-1">
                  Encarregado de Proteção de Dados (DPO / Data Protection Officer):
                </div>
                <p className="text-slate-600">
                  Para exercer seus direitos ou esclarecer dúvidas de privacidade relativas à plataforma tecnológica,
                  entre em contato com o comitê de privacidade da <strong>Portal Gestão Integrada</strong> pelo canal oficial:
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="font-mono font-bold text-[#0A5B7A] bg-white px-3 py-1 rounded-md border border-teal-300">
                    dpo@portalgestaointegrada.com.br
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Prazo de resposta em até 15 dias úteis (conforme preconizado pela ANPD).
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="text-[11px] text-slate-500">
            Documento registrado: <strong>PGIRH-DOC-LGPD-2026-V1</strong> | Portal Gestão Integrada (CNPJ: 52.769.818/0001-77)
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#0A5B7A] hover:bg-[#084962] text-white font-bold rounded-lg transition-colors"
            >
              Entendido e Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
