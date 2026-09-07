import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  FileText,
  Clock,
  Settings,
  ShieldCheck,
  Award,
  CalendarDays,
  FileCheck2,
  Building,
  Database,
  Briefcase,
  Info,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenTour?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenTour }) => {
  const { currentUser, currentEmpresa, dadosCadastrais, atestados } = useApp();

  const perfil = currentUser?.perfil || 'RH_ADMIN';

  // Badges
  const pendingAdmissionsCount = dadosCadastrais.filter(
    (d) => d.statusAdmissao === 'PENDENTE' || d.statusAdmissao === 'EM_ANALISE'
  ).length;

  const pendingAtestadosCount = atestados.filter((a) => a.status === 'PENDENTE').length;

  return (
    <aside className="w-64 bg-[#0A5B7A] text-white flex flex-col flex-shrink-0 shadow-lg select-none min-h-[calc(100vh-4rem)]">
      {/* Company Branding Pill inside sidebar */}
      <div className="p-4 border-b border-teal-800/60 bg-teal-950/20">
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-900 shadow-inner"
            style={{ backgroundColor: currentEmpresa.corSecundaria || '#F5B800' }}
          >
            {currentEmpresa.logoUrl ? (
              <img
                src={currentEmpresa.logoUrl}
                alt="Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <Building className="w-4 h-4 text-slate-900" />
            )}
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">
              {currentEmpresa.nomeFantasia}
            </div>
            <div className="text-[10px] text-teal-200/80 font-mono truncate">
              {currentEmpresa.cnpj}
            </div>
          </div>
        </div>
      </div>

      {/* Role Title */}
      <div className="px-4 pt-4 pb-2 text-[11px] font-bold text-teal-200/60 uppercase tracking-wider">
        {perfil === 'RH_ADMIN'
          ? 'Módulo de Gestão RH'
          : perfil === 'FUNCIONARIO'
          ? 'Portal do Colaborador'
          : 'Portal do Candidato'}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        {perfil === 'RH_ADMIN' && (
          <>
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-4 h-4 text-[#F5B800]" />
                <span>Visão Geral & Painel</span>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('admissoes')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'admissoes'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <UserPlus className="w-4 h-4 text-[#F5B800]" />
                <span>Admissões & eSocial</span>
              </div>
              {pendingAdmissionsCount > 0 && (
                <span className="bg-[#F5B800] text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                  {pendingAdmissionsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('colaboradores')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'colaboradores'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-[#F5B800]" />
                <span>Colaboradores & DP</span>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('documentos_dist')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'documentos_dist'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-[#F5B800]" />
                <span>Holerites & Folha Ponto</span>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('atestados_faltas')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'atestados_faltas'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <CalendarDays className="w-4 h-4 text-[#F5B800]" />
                <span>Atestados & Faltas</span>
              </div>
              {pendingAtestadosCount > 0 && (
                <span className="bg-[#F5B800] text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  {pendingAtestadosCount}
                </span>
              )}
            </button>

            <div className="pt-3 pb-1 px-2 text-[10px] uppercase font-bold text-teal-300/60">
              Parametrização & SaaS
            </div>

            <button
              onClick={() => onSelectTab('parametrizacao')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'parametrizacao'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Award className="w-4 h-4 text-[#F5B800]" />
                <span>Benefícios & Regras CLT</span>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('empresa_branding')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'empresa_branding'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-4 h-4 text-[#F5B800]" />
                <span>Dados da Empresa & Logo</span>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('database_audit')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'database_audit'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Database className="w-4 h-4 text-[#F5B800]" />
                <span>Banco de Dados & Logs</span>
              </div>
            </button>
          </>
        )}

        {perfil === 'FUNCIONARIO' && (
          <>
            <button
              onClick={() => onSelectTab('func_portal')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'func_portal'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Briefcase className="w-4 h-4 text-[#F5B800]" />
                <span>Meu Painel do Colaborador</span>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('meus_holerites')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'meus_holerites'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-[#F5B800]" />
                <span>Meus Holerites (Recibos)</span>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('meu_ponto')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'meu_ponto'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-[#F5B800]" />
                <span>Espelho de Ponto & Horas</span>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('meus_atestados')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'meus_atestados'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <CalendarDays className="w-4 h-4 text-[#F5B800]" />
                <span>Atestados Médicos</span>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('minhas_faltas')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'minhas_faltas'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileCheck2 className="w-4 h-4 text-[#F5B800]" />
                <span>Extrato de Faltas</span>
              </div>
            </button>
          </>
        )}

        {perfil === 'CANDIDATO' && (
          <>
            <button
              onClick={() => onSelectTab('candidato_admissao')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'candidato_admissao'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <UserPlus className="w-4 h-4 text-[#F5B800]" />
                <span>Admissão Digital (eSocial)</span>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('candidato_lgpd')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'candidato_lgpd'
                  ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4 text-[#F5B800]" />
                <span>Termo de Privacidade LGPD</span>
              </div>
            </button>
          </>
        )}
        {/* Institucional & Governança LGPD */}
        <div className="pt-3 pb-1 px-2 text-[10px] uppercase font-bold text-teal-300/60 border-t border-teal-800/40 mt-3">
          Institucional & Compliance
        </div>
        <button
          onClick={() => onSelectTab('cadastro_inicial')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            currentTab === 'cadastro_inicial' || currentTab === 'cadastro'
              ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
              : 'text-teal-100 hover:bg-white/10 hover:text-white'
          }`}
          title="Abrir Tela de Cadastro Inicial (Empresa, Candidato, Funcionário)"
        >
          <div className="flex items-center space-x-3">
            <UserPlus className="w-4 h-4 text-[#F5B800]" />
            <span>Cadastro Inicial</span>
          </div>
          <span className="bg-teal-400/20 text-teal-200 font-bold px-1.5 py-0.5 rounded text-[10px]">
            3 Perfis
          </span>
        </button>
        <button
          onClick={() => onSelectTab('sobre')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            currentTab === 'sobre' || currentTab === 'versao'
              ? 'bg-white/15 text-white shadow-xs border-l-4 border-[#F5B800]'
              : 'text-teal-100 hover:bg-white/10 hover:text-white'
          }`}
          title="Sobre a desenvolvedora Portal Gestão Integrada, versão v1.0.0 e LGPD"
        >
          <div className="flex items-center space-x-3">
            <Info className="w-4 h-4 text-[#F5B800]" />
            <span>Sobre / Versão & LGPD</span>
          </div>
          <span className="bg-emerald-400/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded text-[10px]">
            v1.0.0
          </span>
        </button>
        {onOpenTour && (
          <button
            onClick={onOpenTour}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-amber-200 hover:bg-white/10 hover:text-white transition-all mt-1"
            title="Abrir Tour de Boas-vindas e Guia dos Menus"
          >
            <div className="flex items-center space-x-3">
              <Sparkles className="w-4 h-4 text-[#F5B800]" />
              <span>Tour de Boas-vindas</span>
            </div>
            <span className="bg-[#F5B800]/20 text-[#F5B800] font-bold px-1.5 py-0.5 rounded text-[10px]">
              Guia
            </span>
          </button>
        )}
      </nav>

      {/* Sidebar Footer with system integrity status */}
      <div className="p-3 border-t border-teal-800/60 text-[11px] text-teal-200/70">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white">SaaS Multi-Tenant</span>
          <span className="bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded text-[10px]">
            ONLINE
          </span>
        </div>
        <p className="text-[10px] text-teal-200/50 mt-1">
          Compliance eSocial & LGPD 13.709
        </p>
      </div>
    </aside>
  );
};
