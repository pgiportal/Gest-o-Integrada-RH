import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Building2,
  LayoutDashboard,
  UserPlus,
  Users,
  FileText,
  Clock,
  HeartPulse,
  Settings,
  ShieldCheck,
  Lock,
  UploadCloud,
  FileQuestion,
  Headphones,
  Check,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { PerfilUsuario } from '../types';

interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  targetTab?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  highlights: string[];
  tips?: string;
}

interface WelcomeTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { currentUser, currentEmpresa } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!isOpen || !currentUser) return null;

  const perfil: PerfilUsuario = currentUser.perfil || 'RH_ADMIN';

  // Tour steps customized for each profile
  const getStepsForProfile = (role: PerfilUsuario): TourStep[] => {
    switch (role) {
      case 'RH_ADMIN':
        return [
          {
            id: 'rh-welcome',
            title: 'Bem-vindo ao Gestão Integrada RH',
            subtitle: 'Painel de Controle e Gestão de Departamento Pessoal',
            description: `Olá, ${currentUser.nome}! Você está conectado como Gestor de RH da empresa ${currentEmpresa.nomeFantasia}. Preparamos este guia rápido para apresentar as principais ferramentas disponíveis no seu painel operacional.`,
            icon: Sparkles,
            badge: 'Visão Geral RH',
            highlights: [
              'Arquitetura Multi-Tenant isolada e segura por empresa contratante',
              'Conformidade integral com eSocial v.S-1.2, Portaria MTP 671 e LGPD',
              'Desenvolvido por Portal Gestão Integrada (CNPJ: 52.769.818/0001-77)',
            ],
            tips: 'Você pode trocar de empresa cliente no topo da página a qualquer instante.',
          },
          {
            id: 'rh-dashboard',
            title: 'Dashboard & Métricas em Tempo Real',
            subtitle: 'Indicadores operacionais de admissões, atestados e documentos',
            description: 'Acompanhe no dashboard principal o volume de admissões pendentes de validação, documentos distribuídos, alertas de atestados e o status geral do quadro de funcionários.',
            targetTab: 'dashboard',
            icon: LayoutDashboard,
            badge: 'Menu Principal',
            highlights: [
              'Cards de métricas operacionais com contagem de pendências',
              'Acesso rápido à triagem de novos candidatos em processo admissional',
              'Atalhos para geração em lote de holerites e espelhos de ponto',
            ],
            tips: 'Clique no card de pendências no dashboard para ir direto à ação necessária.',
          },
          {
            id: 'rh-admissoes',
            title: 'Triagem de Admissão Digital',
            subtitle: 'Qualificação cadastral eSocial e validação documental',
            description: 'Analise os dados enviados pelos candidatos antes de integrá-los ao quadro oficial. Verifique CPF, PIS, dados bancários e visualize os arquivos anexados com suporte à aprovação ou reprovação com justificativa.',
            targetTab: 'admissoes',
            icon: UserPlus,
            badge: 'Módulo Admissional',
            highlights: [
              'Validação documental (RG, CPF, Comprovante de Residência, CTPS)',
              'Registro formal de aceite LGPD pelo candidato com data e hora',
              'Fluxo de solicitação de correção quando faltar algum documento legível',
            ],
            tips: 'Ao aprovar uma admissão, o candidato é automaticamente habilitado como Colaborador ativo.',
          },
          {
            id: 'rh-colaboradores',
            title: 'Colaboradores & Distribuição de Documentos',
            subtitle: 'Gestão cadastral, holerites em lote e espelhos de ponto',
            description: 'Centralize a relação de empregados ativos. Gere e distribua holerites mensais e espelhos de ponto com cálculo de horas extras (50% e 100%) em conformidade com as regras da empresa.',
            targetTab: 'colaboradores',
            icon: Users,
            badge: 'Gestão de Pessoas',
            highlights: [
              'Geração de holerites em lote com discriminação de proventos e descontos legais',
              'Visualização e impressão do recibo oficial com código de autenticação',
              'Importação e espelho de ponto eletrônico mensal com banco de horas',
            ],
            tips: 'Use o botão "Gerar Holerites do Mês" para emitir folhas em lote em 1 clique.',
          },
          {
            id: 'rh-atestados',
            title: 'Atestados Médicos & Controle de Faltas',
            subtitle: 'Recepção com código CID e cálculo automático de afastamentos',
            description: 'Receba os atestados enviados pelos colaboradores pelo portal móvel ou desktop. Avalie o atestado, registre o CID, calcule os dias de abono e alimente o histórico de absenteísmo.',
            targetTab: 'atestados_faltas',
            icon: HeartPulse,
            badge: 'Saúde & Frequência',
            highlights: [
              'Visualização rápida da foto/PDF do atestado médico enviado',
              'Aprovação com abono automático de faltas do período',
              'Lançamento manual de faltas justificadas e não justificadas com cálculo de reflexos',
            ],
            tips: 'Os dados médicos são tratados com sigilo médico sob a base legal da CLT e LGPD.',
          },
          {
            id: 'rh-parametrizacao',
            title: 'Parametrização & Regras de Negócio',
            subtitle: 'Configurações de VT, VR/VA, planos de saúde e tolerâncias',
            description: 'Defina os parâmetros de cálculo da sua empresa: teto de desconto de Vale Transporte (6%), valores de Vale Refeição/Alimentação com coparticipação, modelo de plano de saúde e percentuais de horas extras.',
            targetTab: 'parametrizacao',
            icon: Settings,
            badge: 'Configuração Empresarial',
            highlights: [
              'Regras de desconto de Vale Transporte (6% com base no salário contratual)',
              'Coparticipação em percentual ou fixa para alimentação e planos de saúde',
              'Configurações de tolerância de ponto (Portaria 671) e contribuição sindical',
            ],
            tips: 'Todas as alterações nos parâmetros são salvas na trilha de auditoria para fins de compliance.',
          },
          {
            id: 'rh-lgpd',
            title: 'Governança LGPD & Suporte Desenvolvedora',
            subtitle: 'Página Sobre, termos de uso e canal do DPO',
            description: 'Acesse as informações institucionais da desenvolvedora Portal Gestão Integrada (CNPJ: 52.769.818/0001-77), a página Sobre/Versão v1.0.0, termos de privacidade e canal para formalização de requerimentos de titulares.',
            targetTab: 'sobre',
            icon: ShieldCheck,
            badge: 'Compliance & Suporte',
            highlights: [
              'Distinção formal entre Controlador (Sua Empresa) e Operador (Portal Gestão Integrada)',
              'Canal direto com o DPO: dpo@portalgestaointegrada.com.br',
              'Central de suporte técnico com abertura de chamados e número de protocolo',
            ],
            tips: 'Você pode reabrir este tour a qualquer momento pelo menu "Ajuda / Tour" na barra superior.',
          },
        ];

      case 'CANDIDATO':
        return [
          {
            id: 'cand-welcome',
            title: 'Bem-vindo ao Portal de Admissão Digital',
            subtitle: 'Envio rápido, 100% online e seguro dos seus documentos',
            description: `Olá, ${currentUser.nome}! Você foi convidado(a) para participar do processo de admissão na empresa ${currentEmpresa.nomeFantasia}. Este ambiente foi desenvolvido para que você envie seus dados e documentos sem precisar se deslocar.`,
            icon: Sparkles,
            badge: 'Admissão Digital',
            highlights: [
              'Processo simples em 5 etapas intuitivas',
              'Criptografia de ponta e proteção dos seus dados sob a LGPD',
              'Sistema desenvolvido por Portal Gestão Integrada (CNPJ: 52.769.818/0001-77)',
            ],
            tips: 'Seus dados serão utilizados estritamente para registro no eSocial e contrato de trabalho.',
          },
          {
            id: 'cand-etapas',
            title: 'As 5 Etapas do seu Cadastro',
            subtitle: 'Dados Pessoais, Endereço, Banco, Documentos e LGPD',
            description: 'Você preencherá seu formulário de admissão em passos organizados: identificação pessoal (CPF, RG, Filiação), endereço residencial com busca automática por CEP, conta bancária para salário, upload de arquivos e leitura do termo LGPD.',
            targetTab: 'candidato_admissao',
            icon: FileText,
            badge: 'Passo a Passo',
            highlights: [
              'Etapa 1: Dados Pessoais e identificação civil completa',
              'Etapa 2: Endereço com autopreenchimento rápido via CEP',
              'Etapa 3: Dados bancários (chave PIX, agência e conta corrente para recebimento)',
              'Etapa 4: Anexo de fotos ou PDFs de RG, CPF, CTPS e Comprovante',
              'Etapa 5: Ciência e aceite formal do Termo LGPD',
            ],
            tips: 'Você pode salvar suas respostas e continuar em outro momento se necessário.',
          },
          {
            id: 'cand-docs',
            title: 'Dicas para Envio dos Documentos',
            subtitle: 'Evite recusas e acelere sua contratação',
            description: 'Para que o time de Recursos Humanos aprove sua admissão rapidamente, certifique-se de que as fotos dos documentos estejam legíveis, sem reflexos de luz e com todas as 4 pontas visíveis.',
            targetTab: 'candidato_admissao',
            icon: UploadCloud,
            badge: 'Envio de Arquivos',
            highlights: [
              'Arquivos aceitos: fotos em JPG/PNG ou documentos em PDF',
              'Documentos essenciais: RG/CNH, CPF, Comprovante de Residência recente e Carteira de Trabalho',
              'Se houver necessidade de retificação, o RH enviará instruções claras no sistema',
            ],
            tips: 'Você pode fotografar os documentos direto pelo celular ou anexar do computador.',
          },
          {
            id: 'cand-lgpd',
            title: 'Seus Direitos e Proteção LGPD',
            subtitle: 'Transparência total no tratamento de suas informações',
            description: 'A empresa contratante é a Controladora dos seus dados e a Portal Gestão Integrada atua como Operadora técnica da infraestrutura. Seus dados estão resguardados pela Lei nº 13.709/2018.',
            targetTab: 'sobre',
            icon: ShieldCheck,
            badge: 'Transparência LGPD',
            highlights: [
              'Finalidade exclusiva: cumprimento de obrigações legais (eSocial) e contratuais (CLT)',
              'Direito de acesso, confirmação e retificação garantidos pelo Artigo 18 da lei',
              'Canal do Encarregado de Dados (DPO): dpo@portalgestaointegrada.com.br',
            ],
            tips: 'Leia o termo completo na Etapa 5 antes de assinar digitalmente.',
          },
        ];

      case 'FUNCIONARIO':
        return [
          {
            id: 'func-welcome',
            title: 'Bem-vindo ao Portal do Colaborador',
            subtitle: 'Seu espaço de autoatendimento ágil e 24 horas por dia',
            description: `Olá, ${currentUser.nome}! Este é o seu portal pessoal de colaborador na ${currentEmpresa.nomeFantasia}. Aqui você tem acesso instantâneo a holerites, espelho de ponto eletrônico e envio de atestados médicos.`,
            icon: Sparkles,
            badge: 'Autoatendimento',
            highlights: [
              'Acesse recibos de pagamento de qualquer lugar (celular ou computador)',
              'Monitore suas marcações de ponto diárias e saldo de banco de horas',
              'Ambiente criptografado e seguro provido por Portal Gestão Integrada',
            ],
            tips: 'Guarde seus recibos salvando o PDF com assinatura digital e código de autenticação.',
          },
          {
            id: 'func-holerites',
            title: 'Meus Holerites & Recibos de Pagamento',
            subtitle: 'Detalhamento de proventos, descontos e encargos legais',
            description: 'Consulte mensalmente seus holerites com discriminação transparente do salário base, horas extras, descontos de VT/VR, plano de saúde e recolhimentos de FGTS e INSS.',
            targetTab: 'meus_holerites',
            icon: FileText,
            badge: 'Recibos Salariais',
            highlights: [
              'Visualização detalhada com cálculo de proventos e descontos',
              'Opção de impressão e download em formato padrão homologado para empréstimos e comprovações',
              'Histórico de todos os meses trabalhados e recibos de 13º salário',
            ],
            tips: 'Clique em "Visualizar Holerite" para abrir o recibo detalhado pronto para impressão.',
          },
          {
            id: 'func-ponto',
            title: 'Meu Espelho de Ponto Eletrônico',
            subtitle: 'Acompanhamento de jornada, entradas, saídas e banco de horas',
            description: 'Verifique suas marcações de ponto diárias (entrada, almoço e saída) em conformidade com a Portaria MTP nº 671/2021. Visualize suas horas extras e saldo acumulado.',
            targetTab: 'meu_ponto',
            icon: Clock,
            badge: 'Jornada de Trabalho',
            highlights: [
              'Visualização clara de horários normais, tolerâncias e faltas',
              'Cálculo automático de adicional de horas extras 50% e 100% (domingos/feriados)',
              'Extrato consolidado pronto para conferência e assinatura',
            ],
            tips: 'Divergências de marcação podem ser alinhadas diretamente com seu gestor de RH.',
          },
          {
            id: 'func-atestados',
            title: 'Envio de Atestados Médicos',
            subtitle: 'Envie atestados em segundos com cálculo de abono',
            description: 'Precisou se afastar por motivo de saúde? Fotografe o atestado médico, informe a data inicial, os dias de repouso e envie diretamente para homologação da equipe de Recursos Humanos.',
            targetTab: 'meus_atestados',
            icon: HeartPulse,
            badge: 'Saúde & Frequência',
            highlights: [
              'Upload rápido de fotos ou PDF direto pelo navegador',
              'Acompanhamento do status de avaliação (Em Análise, Aprovado ou Recusado)',
              'Abono automático das horas/dias no fechamento do espelho de ponto',
            ],
            tips: 'Certifique-se de que a foto mostre o carimbo do médico e o CRM legíveis.',
          },
          {
            id: 'func-lgpd',
            title: 'Privacidade & Canal com o DPO',
            subtitle: 'Transparência no tratamento dos seus dados trabalhistas',
            description: 'Seus dados funcionais, bancários e de saúde são guardados sob estrita conformidade com a LGPD e as normas trabalhistas pela Portal Gestão Integrada (CNPJ: 52.769.818/0001-77).',
            targetTab: 'sobre',
            icon: ShieldCheck,
            badge: 'Seus Direitos',
            highlights: [
              'Canal direto com o DPO para dúvidas de privacidade: dpo@portalgestaointegrada.com.br',
              'Página Sobre/Versão com informações da empresa desenvolvedora e termos de segurança',
              'Atendimento técnico disponível pelo link no rodapé da página',
            ],
            tips: 'Você pode rever este tour sempre que quiser pelo menu da sua foto no topo da tela.',
          },
        ];
    }
  };

  const steps = getStepsForProfile(perfil);
  const currentStep = steps[currentStepIndex] || steps[0];
  const StepIcon = currentStep.icon;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    if (dontShowAgain && currentUser) {
      try {
        localStorage.setItem(`girh_welcome_tour_completed_${currentUser.id}`, 'true');
        localStorage.setItem(`girh_welcome_tour_completed_${currentUser.perfil}`, 'true');
      } catch (e) {
        console.error('Failed to save tour state in localStorage', e);
      }
    }
    onClose();
  };

  const handleGoToSection = (tabName?: string) => {
    if (tabName && onNavigateTab) {
      onNavigateTab(tabName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 transition-all">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#0A5B7A] via-[#084e68] to-[#0A5B7A] text-white p-6 relative overflow-hidden">
          {/* Decorative Pattern Background */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-6 w-24 h-24 bg-[#F5B800]/10 rounded-full blur-lg pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#F5B800] text-slate-950 flex items-center justify-center shadow-md font-black">
                <StepIcon className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider">
                    {currentStep.badge}
                  </span>
                  <span className="text-teal-200 text-xs font-semibold">
                    Passo {currentStepIndex + 1} de {steps.length}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 leading-tight tracking-tight">
                  {currentStep.title}
                </h2>
                <p className="text-xs text-teal-100/90 font-medium mt-0.5">
                  {currentStep.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="p-1.5 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
              title="Fechar Guia"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="relative z-10 mt-5 flex items-center gap-1.5">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all flex-1 cursor-pointer ${
                  idx === currentStepIndex
                    ? 'bg-[#F5B800] shadow-2xs'
                    : idx < currentStepIndex
                    ? 'bg-teal-300/80 hover:bg-teal-200'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
                title={`Ir para passo ${idx + 1}: ${step.title}`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5 text-slate-700 leading-relaxed text-xs">
          {/* Main Description */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {currentStep.description}
          </div>

          {/* Highlight Points */}
          <div className="space-y-2">
            <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-[#0A5B7A]" />
              <span>Destaques & O que você pode fazer:</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {currentStep.highlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-2.5 p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0A5B7A]/40 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-200">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs text-slate-800 font-medium leading-normal">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Tab Shortcut if available */}
          {currentStep.targetTab && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/70">
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-[#0A5B7A]">Menu correspondente no sistema:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-teal-200 text-[#0A5B7A] font-semibold text-[11px]">
                  {currentStep.targetTab}
                </span>
              </div>
              <button
                onClick={() => handleGoToSection(currentStep.targetTab)}
                className="inline-flex items-center space-x-1 text-xs font-bold text-[#0A5B7A] hover:text-[#084962] hover:underline"
              >
                <span>Visualizar tela agora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Pro Tip Box */}
          {currentStep.tips && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-[#F5B800] flex-shrink-0" />
              <span className="font-medium">{currentStep.tips}</span>
            </div>
          )}
        </div>

        {/* Footer & Navigation Controls */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Checkbox "Don't show again" */}
          <label className="flex items-center space-x-2 text-slate-600 select-none cursor-pointer hover:text-slate-900">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#0A5B7A] focus:ring-[#0A5B7A]"
            />
            <span className="text-[11px] font-medium">Não exibir este guia automaticamente no próximo login</span>
          </label>

          {/* Stepper Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-bold text-slate-700 transition-colors flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={handleFinish}
              className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold transition-colors"
            >
              Pular Guia
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-[#0A5B7A] hover:bg-[#084962] text-white font-extrabold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <span>{isLastStep ? 'Concluir e Começar' : 'Próximo'}</span>
              {isLastStep ? (
                <CheckCircle2 className="w-4 h-4 text-[#F5B800]" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
