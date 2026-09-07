import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCNPJ, formatCPF } from '../lib/formatters';
import {
  Building2,
  UserPlus,
  Briefcase,
  ShieldCheck,
  Lock,
  Mail,
  User,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Info,
  Check,
  X,
  FileText,
  Building,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { PerfilUsuario, Empresa } from '../types';

interface CadastroInicialViewProps {
  initialTab?: 'empresa' | 'candidato' | 'funcionario';
  onNavigate?: (tab: string) => void;
  onOpenTermosModal?: () => void;
  onOpenSuporteModal?: () => void;
}

export const CadastroInicialView: React.FC<CadastroInicialViewProps> = ({
  initialTab = 'empresa',
  onNavigate,
  onOpenTermosModal,
  onOpenSuporteModal,
}) => {
  const {
    empresas,
    currentEmpresa,
    selectedEmpresaId,
    setSelectedEmpresaId,
    createEmpresa,
    cadastrarUsuario,
    setCurrentUser,
    usuarios,
    logAction,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'empresa' | 'candidato' | 'funcionario'>(initialTab);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ----------------------------------------------------
  // ABA 1: EMPRESA (RH_ADMIN) STATE
  // ----------------------------------------------------
  const [empNomeResponsavel, setEmpNomeResponsavel] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empCnpj, setEmpCnpj] = useState('');
  const [empRazaoSocial, setEmpRazaoSocial] = useState('');
  const [empNomeFantasia, setEmpNomeFantasia] = useState('');
  const [empSenha, setEmpSenha] = useState('');
  const [empConfirmSenha, setEmpConfirmSenha] = useState('');
  const [empShowSenha, setEmpShowSenha] = useState(false);
  const [empLgpdAceito, setEmpLgpdAceito] = useState(false);
  const [empErrors, setEmpErrors] = useState<{ [key: string]: string }>({});
  const [empIsSubmitting, setEmpIsSubmitting] = useState(false);

  // ----------------------------------------------------
  // ABA 2: CANDIDATO (GOOGLE SSO) STATE
  // ----------------------------------------------------
  const [candEmpresaId, setCandEmpresaId] = useState(selectedEmpresaId || (empresas[0]?.id || ''));
  const [candNome, setCandNome] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candLgpdAceito, setCandLgpdAceito] = useState(true);
  const [candIsLoadingGoogle, setCandIsLoadingGoogle] = useState(false);
  const [candError, setCandError] = useState<string | null>(null);

  // ----------------------------------------------------
  // ABA 3: FUNCIONÁRIO STATE
  // ----------------------------------------------------
  const [funcCodigoConvite, setFuncCodigoConvite] = useState('');
  const [funcEmpresaId, setFuncEmpresaId] = useState(selectedEmpresaId || (empresas[0]?.id || ''));
  const [funcCpf, setFuncCpf] = useState('');
  const [funcEmail, setFuncEmail] = useState('');
  const [funcSenha, setFuncSenha] = useState('');
  const [funcConfirmSenha, setFuncConfirmSenha] = useState('');
  const [funcShowSenha, setFuncShowSenha] = useState(false);
  const [funcLgpdAceito, setFuncLgpdAceito] = useState(false);
  const [funcErrors, setFuncErrors] = useState<{ [key: string]: string }>({});
  const [funcIsSubmitting, setFuncIsSubmitting] = useState(false);

  // Password strength helper
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { label: 'Fraca', color: 'bg-red-500', width: 'w-1/4', textColor: 'text-red-600' };
    if (score <= 2) return { label: 'Média', color: 'bg-amber-500', width: 'w-2/4', textColor: 'text-amber-600' };
    if (score === 3) return { label: 'Boa', color: 'bg-teal-500', width: 'w-3/4', textColor: 'text-teal-600' };
    return { label: 'Forte', color: 'bg-emerald-600', width: 'w-full', textColor: 'text-emerald-700' };
  };

  // ----------------------------------------------------
  // SUBMIT: FLUXO EMPRESA
  // ----------------------------------------------------
  const handleSubmitEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!empNomeResponsavel.trim()) errors.nome = 'Informe o nome do responsável legal.';
    if (!empEmail.trim() || !empEmail.includes('@')) errors.email = 'Informe um e-mail corporativo válido.';
    const cnpjClean = empCnpj.replace(/\D/g, '');
    if (cnpjClean.length !== 14) errors.cnpj = 'CNPJ inválido. Digite os 14 dígitos.';
    if (!empRazaoSocial.trim()) errors.razaoSocial = 'Informe a Razão Social da empresa.';
    if (!empNomeFantasia.trim()) errors.nomeFantasia = 'Informe o Nome Fantasia.';
    if (empSenha.length < 6) errors.senha = 'A senha deve ter no mínimo 6 caracteres.';
    if (empSenha !== empConfirmSenha) errors.confirmSenha = 'As senhas digitadas não coincidem.';
    if (!empLgpdAceito) errors.lgpd = 'Você deve aceitar os Termos e a Governança LGPD.';

    // Check if CNPJ is already in use
    const cnpjExists = empresas.some((emp) => emp.cnpj.replace(/\D/g, '') === cnpjClean);
    if (cnpjExists) {
      errors.cnpj = 'Este CNPJ já está cadastrado em nossa base multi-tenant.';
    }

    setEmpErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setEmpIsSubmitting(true);

    setTimeout(() => {
      // 1. Create company
      const novaEmpresa: Omit<Empresa, 'id' | 'criadoEm' | 'atualizadoEm'> = {
        razaoSocial: empRazaoSocial.trim(),
        nomeFantasia: empNomeFantasia.trim(),
        cnpj: formatCNPJ(empCnpj),
        responsavelNome: empNomeResponsavel.trim(),
        responsavelCpf: '000.000.000-00',
        responsavelEmail: empEmail.trim().toLowerCase(),
        responsavelCargo: 'Administrador de RH',
        responsavelCelular: '(11) 98765-4321',
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        numero: '1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
        corPrimaria: '#0A5B7A',
        corSecundaria: '#F5B800',
      };

      const createdEmp = createEmpresa(novaEmpresa);

      // 2. Create RH_ADMIN user
      const adminUser = cadastrarUsuario({
        nome: empNomeResponsavel.trim(),
        email: empEmail.trim().toLowerCase(),
        perfil: 'RH_ADMIN',
        empresaId: createdEmp.id,
      });

      setSelectedEmpresaId(createdEmp.id);
      setCurrentUser(adminUser);

      setSuccessMessage(`Empresa ${createdEmp.nomeFantasia} cadastrada com sucesso! Bem-vindo(a) ao painel de RH.`);
      setShowSuccessToast(true);
      setEmpIsSubmitting(false);

      logAction('EMPRESA_AUTOCADASTRADA', 'empresas', `Nova empresa ${createdEmp.razaoSocial} registrada pelo onboarding.`, createdEmp.id);

      setTimeout(() => {
        if (onNavigate) {
          onNavigate('dashboard');
        }
      }, 1500);
    }, 600);
  };

  // ----------------------------------------------------
  // SUBMIT: FLUXO CANDIDATO (GOOGLE SSO)
  // ----------------------------------------------------
  const handleGoogleSsoCandidato = () => {
    setCandError(null);

    if (!candLgpdAceito) {
      setCandError('É necessário manifestar seu consentimento com os termos da LGPD para prosseguir.');
      return;
    }

    setCandIsLoadingGoogle(true);

    // Simulate authentic Google OAuth response
    setTimeout(() => {
      const targetEmp = empresas.find((e) => e.id === candEmpresaId) || empresas[0];
      const candidatoNome = candNome.trim() || 'Candidato Google Conectado';
      const candidatoEmail = candEmail.trim().toLowerCase() || 'candidato.google@gmail.com';

      // Check if user already exists
      let user = usuarios.find((u) => u.email.toLowerCase() === candidatoEmail);

      if (!user) {
        user = cadastrarUsuario({
          nome: candidatoNome,
          email: candidatoEmail,
          perfil: 'CANDIDATO',
          empresaId: targetEmp.id,
        });
      } else {
        setCurrentUser(user);
        setSelectedEmpresaId(targetEmp.id);
      }

      setCandIsLoadingGoogle(false);
      setSuccessMessage(`Autenticação com o Google realizada com sucesso! Redirecionando para a sua Admissão Digital na ${targetEmp.nomeFantasia}...`);
      setShowSuccessToast(true);

      logAction('LOGIN_GOOGLE_CANDIDATO', 'usuarios', `Candidato ${user.nome} autenticado via Google SSO.`, user.id);

      setTimeout(() => {
        if (onNavigate) {
          onNavigate('candidato_admissao');
        }
      }, 1400);
    }, 900);
  };

  // ----------------------------------------------------
  // SUBMIT: FLUXO FUNCIONÁRIO (ATIVAÇÃO DE CONTA)
  // ----------------------------------------------------
  const handleSubmitFuncionario = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    const cleanCodigo = funcCodigoConvite.trim().toUpperCase();
    if (!cleanCodigo) {
      errors.codigo = 'Informe o código de convite ou chave empresarial fornecido pelo RH.';
    } else if (cleanCodigo.length < 4) {
      errors.codigo = 'Código de convite inválido ou expirado. Verifique com seu gestor de RH.';
    }

    const cleanCpf = funcCpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      errors.cpf = 'CPF inválido. Digite os 11 dígitos.';
    }

    if (!funcEmail.trim() || !funcEmail.includes('@')) {
      errors.email = 'Informe um e-mail válido.';
    }

    if (funcSenha.length < 6) {
      errors.senha = 'A senha deve ter no mínimo 6 caracteres.';
    }

    if (funcSenha !== funcConfirmSenha) {
      errors.confirmSenha = 'As senhas digitadas não coincidem.';
    }

    if (!funcLgpdAceito) {
      errors.lgpd = 'Você deve aceitar os Termos e a Governança LGPD.';
    }

    setFuncErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setFuncIsSubmitting(true);

    setTimeout(() => {
      const targetEmp = empresas.find((e) => e.id === funcEmpresaId) || empresas[0];

      // Register or activate user
      const funcUser = cadastrarUsuario({
        nome: funcEmail.split('@')[0].replace('.', ' ').toUpperCase(),
        email: funcEmail.trim().toLowerCase(),
        perfil: 'FUNCIONARIO',
        empresaId: targetEmp.id,
      });

      setSelectedEmpresaId(targetEmp.id);
      setCurrentUser(funcUser);

      setSuccessMessage(`Conta de colaborador ativada com sucesso na ${targetEmp.nomeFantasia}! Acessando o Portal do Colaborador...`);
      setShowSuccessToast(true);
      setFuncIsSubmitting(false);

      logAction('COLABORADOR_CONTA_ATIVADA', 'usuarios', `Colaborador ${funcUser.nome} ativou conta com chave ${cleanCodigo}.`, funcUser.id);

      setTimeout(() => {
        if (onNavigate) {
          onNavigate('func_portal');
        }
      }, 1400);
    }, 700);
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-xs sm:text-sm font-semibold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0A5B7A] via-[#084f6a] to-[#0A5B7A] text-white p-6 sm:p-8 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-teal-100 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F5B800]" />
              <span>Cadastro Inicial Multi-Tenant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Crie sua conta no Gestão Integrada RH
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 font-medium mt-1 max-w-xl">
              Plataforma em conformidade com o eSocial v.S-1.2, Portaria MTP nº 671/2021 e Governança LGPD.
            </p>
          </div>

          <div className="relative z-10 flex-shrink-0 text-center sm:text-right">
            <span className="inline-block px-3 py-1 rounded-xl bg-[#F5B800] text-slate-950 font-black text-xs shadow-xs">
              Versão v1.0.0
            </span>
            <div className="text-[10px] text-teal-200 mt-1 font-mono">
              CNPJ: 52.769.818/0001-77
            </div>
          </div>
        </div>

        {/* 3 Tabs Selection: Empresa | Candidato | Funcionário */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="text-center sm:text-left mb-4">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              1. Selecione o seu Perfil de Acesso:
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Escolha a modalidade de cadastro de acordo com o seu objetivo no sistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* TAB 1: EMPRESA */}
            <button
              type="button"
              onClick={() => setActiveTab('empresa')}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                activeTab === 'empresa'
                  ? 'bg-white border-[#0A5B7A] shadow-md ring-2 ring-[#0A5B7A]/20'
                  : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      activeTab === 'empresa'
                        ? 'bg-[#0A5B7A] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-teal-50 text-[#0A5B7A] border border-teal-200">
                    Empresa / RH
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                  Empresa Contratante
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  "Quero contratar, admitir candidatos e gerenciar o departamento pessoal."
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0A5B7A]">
                <span>Perfil RH_ADMIN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* TAB 2: CANDIDATO */}
            <button
              type="button"
              onClick={() => setActiveTab('candidato')}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                activeTab === 'candidato'
                  ? 'bg-white border-[#0A5B7A] shadow-md ring-2 ring-[#0A5B7A]/20'
                  : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      activeTab === 'candidato'
                        ? 'bg-[#0A5B7A] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Google SSO
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                  Candidato em Admissão
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  "Fui convidado para um processo seletivo ou admissão digital."
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0A5B7A]">
                <span>Acesso 100% via Google</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* TAB 3: FUNCIONÁRIO */}
            <button
              type="button"
              onClick={() => setActiveTab('funcionario')}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                activeTab === 'funcionario'
                  ? 'bg-white border-[#0A5B7A] shadow-md ring-2 ring-[#0A5B7A]/20'
                  : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      activeTab === 'funcionario'
                        ? 'bg-[#0A5B7A] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Colaborador
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                  Funcionário da Empresa
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  "Já sou colaborador e quero acessar holerites, ponto e atestados."
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0A5B7A]">
                <span>Chave Empresarial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Form Content Body */}
        <div className="p-6 sm:p-8">
          {/* ============================================================== */}
          {/* ABA 1: FORMULÁRIO EMPRESA (RH_ADMIN) */}
          {/* ============================================================== */}
          {activeTab === 'empresa' && (
            <form onSubmit={handleSubmitEmpresa} className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-[#0A5B7A]" />
                  <span>Onboarding da Empresa Contratante (RH_ADMIN)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Preencha os dados oficiais para provisionar a instância da sua empresa no sistema.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome do Responsável Legal */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome Completo do Responsável Legal *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={empNomeResponsavel}
                      onChange={(e) => setEmpNomeResponsavel(e.target.value)}
                      placeholder="Ex: Mariana Silveira Albuquerque"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden transition-all ${
                        empErrors.nome ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {empErrors.nome && <p className="text-red-600 text-[11px] mt-1 font-medium">{empErrors.nome}</p>}
                </div>

                {/* E-mail Corporativo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    E-mail Corporativo do Administrador *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      placeholder="mariana@suaempresa.com.br"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden transition-all ${
                        empErrors.email ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {empErrors.email && <p className="text-red-600 text-[11px] mt-1 font-medium">{empErrors.email}</p>}
                </div>

                {/* CNPJ */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    CNPJ da Empresa *
                  </label>
                  <input
                    type="text"
                    value={empCnpj}
                    onChange={(e) => setEmpCnpj(formatCNPJ(e.target.value))}
                    maxLength={18}
                    placeholder="00.000.000/0000-00"
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden transition-all ${
                      empErrors.cnpj ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                    }`}
                  />
                  {empErrors.cnpj && <p className="text-red-600 text-[11px] mt-1 font-medium">{empErrors.cnpj}</p>}
                </div>

                {/* Razão Social */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Razão Social Oficial *
                  </label>
                  <input
                    type="text"
                    value={empRazaoSocial}
                    onChange={(e) => setEmpRazaoSocial(e.target.value)}
                    placeholder="Ex: Nova Trilha Logística e Distribuição LTDA"
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden transition-all ${
                      empErrors.razaoSocial ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                    }`}
                  />
                  {empErrors.razaoSocial && <p className="text-red-600 text-[11px] mt-1 font-medium">{empErrors.razaoSocial}</p>}
                </div>

                {/* Nome Fantasia */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome Fantasia / Marca *
                  </label>
                  <input
                    type="text"
                    value={empNomeFantasia}
                    onChange={(e) => setEmpNomeFantasia(e.target.value)}
                    placeholder="Ex: Nova Trilha Log"
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden transition-all ${
                      empErrors.nomeFantasia ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                    }`}
                  />
                  {empErrors.nomeFantasia && <p className="text-red-600 text-[11px] mt-1 font-medium">{empErrors.nomeFantasia}</p>}
                </div>

                {/* Senha */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Criar Senha de Acesso *
                    </label>
                    {empSenha && (
                      <span className={`text-[10px] font-bold ${calculatePasswordStrength(empSenha).textColor}`}>
                        Força: {calculatePasswordStrength(empSenha).label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={empShowSenha ? 'text' : 'password'}
                      value={empSenha}
                      onChange={(e) => setEmpSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden transition-all ${
                        empErrors.senha ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setEmpShowSenha(!empShowSenha)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {empShowSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {empSenha && (
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div className={`h-full ${calculatePasswordStrength(empSenha).color} ${calculatePasswordStrength(empSenha).width} transition-all`} />
                    </div>
                  )}
                  {empErrors.senha && <p className="text-red-600 text-[11px] mt-1 font-medium">{empErrors.senha}</p>}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={empShowSenha ? 'text' : 'password'}
                      value={empConfirmSenha}
                      onChange={(e) => setEmpConfirmSenha(e.target.value)}
                      placeholder="Repita a senha digitada"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden transition-all ${
                        empErrors.confirmSenha ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {empErrors.confirmSenha && (
                    <p className="text-red-600 text-[11px] mt-1 font-medium">{empErrors.confirmSenha}</p>
                  )}
                </div>
              </div>

              {/* Checkbox Termos LGPD */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={empLgpdAceito}
                    onChange={(e) => setEmpLgpdAceito(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#0A5B7A] focus:ring-[#0A5B7A]"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    Declaro que li e concordo com os{' '}
                    <button
                      type="button"
                      onClick={onOpenTermosModal}
                      className="text-[#0A5B7A] font-bold underline hover:text-[#084962]"
                    >
                      Termos de Uso
                    </button>{' '}
                    e com a{' '}
                    <button
                      type="button"
                      onClick={onOpenTermosModal}
                      className="text-[#0A5B7A] font-bold underline hover:text-[#084962]"
                    >
                      Política de Governança LGPD
                    </button>{' '}
                    da operadora tecnológica <strong>Portal Gestão Integrada (CNPJ: 52.769.818/0001-77)</strong>.
                  </span>
                </label>
                {empErrors.lgpd && <p className="text-red-600 text-[11px] mt-2 font-medium">{empErrors.lgpd}</p>}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Isolamento Multi-Tenant e Criptografia TLS 1.3 / AES-256.</span>
                </div>

                <button
                  type="submit"
                  disabled={empIsSubmitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#0A5B7A] hover:bg-[#084962] text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {empIsSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#F5B800]" />
                      <span>Provisionando Empresa...</span>
                    </>
                  ) : (
                    <>
                      <span>Criar Conta Empresa & Acessar</span>
                      <ArrowRight className="w-4 h-4 text-[#F5B800]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* ABA 2: CANDIDATO (EXCLUSIVO GOOGLE SSO) */}
          {/* ============================================================== */}
          {activeTab === 'candidato' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                    <UserPlus className="w-5 h-5 text-[#0A5B7A]" />
                    <span>Acesso do Candidato — Admissão Digital</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    Google Identity SSO
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Acesso rápido, unificado e sem necessidade de memorizar senhas para o envio de dados e documentos.
                </p>
              </div>

              {/* Informative Banner on Google SSO Requirement */}
              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 text-teal-950 flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#0A5B7A] text-white flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
                  <Lock className="w-4 h-4 text-[#F5B800]" />
                </div>
                <div className="text-xs space-y-1">
                  <h4 className="font-extrabold text-[#0A5B7A] uppercase text-[11px]">
                    Autenticação Segura sem Senha Manual
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    Em conformidade com os requisitos de segurança do sistema, o acesso de candidatos em admissão ocorre
                    <strong> exclusivamente via Google SSO</strong>. Isso garante a validação imediata da sua identidade civil e elimina riscos de perda ou vazamento de senhas.
                  </p>
                </div>
              </div>

              {/* Candidato Settings Form */}
              <div className="space-y-4">
                {/* Seleção da Empresa Contratante */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Empresa para a qual você está sendo admitido *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={candEmpresaId}
                      onChange={(e) => setCandEmpresaId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden bg-white"
                    >
                      {empresas.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nomeFantasia} ({emp.razaoSocial}) — CNPJ: {emp.cnpj}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Selecione a empresa que lhe enviou o convite ou link de admissão digital.
                  </p>
                </div>

                {/* Optional Identification Details for Google SSO Simulation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Seu Nome Completo (Identificação)
                    </label>
                    <input
                      type="text"
                      value={candNome}
                      onChange={(e) => setCandNome(e.target.value)}
                      placeholder="Ex: Carlos Eduardo Silva"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      E-mail Google (Gmail ou Corporativo)
                    </label>
                    <input
                      type="email"
                      value={candEmail}
                      onChange={(e) => setCandEmail(e.target.value)}
                      placeholder="carlos.eduardo@gmail.com"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* LGPD Consent Checkbox */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={candLgpdAceito}
                      onChange={(e) => setCandLgpdAceito(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#0A5B7A] focus:ring-[#0A5B7A]"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      Manifesto meu consentimento livre e inequívoco para o tratamento dos meus dados pessoais para fins
                      exclusivos de qualificação cadastral e admissão (eSocial e Lei Geral de Proteção de Dados nº 13.709/2018).
                    </span>
                  </label>
                  {candError && <p className="text-red-600 text-[11px] mt-2 font-medium">{candError}</p>}
                </div>
              </div>

              {/* Prominent Google SSO Button */}
              <div className="pt-2 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={handleGoogleSsoCandidato}
                  disabled={candIsLoadingGoogle}
                  className="w-full sm:w-auto min-w-[320px] px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-400 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50"
                >
                  {candIsLoadingGoogle ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-[#0A5B7A]" />
                      <span>Autenticando com o Google...</span>
                    </>
                  ) : (
                    <>
                      {/* Google Official SVG Multi-Color Icon */}
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continuar com o Google</span>
                    </>
                  )}
                </button>

                <div className="text-[11px] text-slate-500 mt-3 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Acesso direto ao formulário em 5 etapas de Admissão Digital.</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 3: FORMULÁRIO FUNCIONÁRIO (ATIVAÇÃO DE CONTA) */}
          {/* ============================================================== */}
          {activeTab === 'funcionario' && (
            <form onSubmit={handleSubmitFuncionario} className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-[#0A5B7A]" />
                  <span>Ativação de Conta do Colaborador (FUNCIONARIO)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ative seu acesso ao Portal do Colaborador utilizando o código de convite ou chave empresarial fornecido pelo seu RH.
                </p>
              </div>

              {/* Informative box on Invite Code */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 flex items-start space-x-3 text-xs">
                <Info className="w-4 h-4 text-[#F5B800] mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block font-extrabold text-amber-900">
                    Onde encontrar o seu Código de Convite?
                  </strong>
                  <span>
                    A chave empresarial é emitida pelo Recursos Humanos no ato da homologação da sua contratação
                    (ex: <strong>TECH-2026</strong>, <strong>LOG-2026</strong> ou chave individual enviada por e-mail).
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Código de Convite */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Código de Convite / Chave Empresarial *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={funcCodigoConvite}
                      onChange={(e) => setFuncCodigoConvite(e.target.value.toUpperCase())}
                      placeholder="Ex: TECH-2026"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden transition-all ${
                        funcErrors.codigo ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {funcErrors.codigo && <p className="text-red-600 text-[11px] mt-1 font-medium">{funcErrors.codigo}</p>}
                </div>

                {/* Empresa Empregadora */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Empresa Empregadora *
                  </label>
                  <select
                    value={funcEmpresaId}
                    onChange={(e) => setFuncEmpresaId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden bg-white"
                  >
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nomeFantasia} — {emp.cnpj}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CPF do Colaborador */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Seu CPF *
                  </label>
                  <input
                    type="text"
                    value={funcCpf}
                    onChange={(e) => setFuncCpf(formatCPF(e.target.value))}
                    maxLength={14}
                    placeholder="000.000.000-00"
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden transition-all ${
                      funcErrors.cpf ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                    }`}
                  />
                  {funcErrors.cpf && <p className="text-red-600 text-[11px] mt-1 font-medium">{funcErrors.cpf}</p>}
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Seu E-mail Corporativo ou Pessoal *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={funcEmail}
                      onChange={(e) => setFuncEmail(e.target.value)}
                      placeholder="colaborador@empresa.com.br"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden transition-all ${
                        funcErrors.email ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {funcErrors.email && <p className="text-red-600 text-[11px] mt-1 font-medium">{funcErrors.email}</p>}
                </div>

                {/* Criar Senha */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Criar Senha de Acesso *
                    </label>
                    {funcSenha && (
                      <span className={`text-[10px] font-bold ${calculatePasswordStrength(funcSenha).textColor}`}>
                        Força: {calculatePasswordStrength(funcSenha).label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={funcShowSenha ? 'text' : 'password'}
                      value={funcSenha}
                      onChange={(e) => setFuncSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden transition-all ${
                        funcErrors.senha ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setFuncShowSenha(!funcShowSenha)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {funcShowSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {funcErrors.senha && <p className="text-red-600 text-[11px] mt-1 font-medium">{funcErrors.senha}</p>}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={funcShowSenha ? 'text' : 'password'}
                      value={funcConfirmSenha}
                      onChange={(e) => setFuncConfirmSenha(e.target.value)}
                      placeholder="Repita a senha digitada"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0A5B7A] focus:outline-hidden transition-all ${
                        funcErrors.confirmSenha ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {funcErrors.confirmSenha && (
                    <p className="text-red-600 text-[11px] mt-1 font-medium">{funcErrors.confirmSenha}</p>
                  )}
                </div>
              </div>

              {/* Checkbox Termos LGPD */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={funcLgpdAceito}
                    onChange={(e) => setFuncLgpdAceito(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#0A5B7A] focus:ring-[#0A5B7A]"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    Concordo com os{' '}
                    <button
                      type="button"
                      onClick={onOpenTermosModal}
                      className="text-[#0A5B7A] font-bold underline hover:text-[#084962]"
                    >
                      Termos de Uso
                    </button>{' '}
                    e com o tratamento seguro dos meus dados funcionais, holerites e espelhos de ponto conforme as normas da LGPD.
                  </span>
                </label>
                {funcErrors.lgpd && <p className="text-red-600 text-[11px] mt-2 font-medium">{funcErrors.lgpd}</p>}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Acesso direto ao espelho de ponto eletrônico e holerites mensais.</span>
                </div>

                <button
                  type="submit"
                  disabled={funcIsSubmitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#0A5B7A] hover:bg-[#084962] text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {funcIsSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#F5B800]" />
                      <span>Validando Chave...</span>
                    </>
                  ) : (
                    <>
                      <span>Ativar Conta de Colaborador</span>
                      <ArrowRight className="w-4 h-4 text-[#F5B800]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info & Login Alternative */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>Já possui uma conta ativa?</span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="font-bold text-[#0A5B7A] hover:underline"
            >
              Acessar Painel Principal
            </button>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <button
              type="button"
              onClick={onOpenTermosModal}
              className="hover:text-slate-800 underline"
            >
              Termos & LGPD
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={onOpenSuporteModal}
              className="hover:text-slate-800 underline"
            >
              Suporte Técnico
            </button>
            <span>•</span>
            <span className="font-mono text-slate-400">Portal Gestão Integrada</span>
          </div>
        </div>
      </div>
    </div>
  );
};
