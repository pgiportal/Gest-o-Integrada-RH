import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  User,
  LogOut,
  RefreshCw,
  Database,
  Plus,
  Info,
  Sparkles,
  UserPlus,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewEmpresa?: () => void;
  onOpenCadastroInicial?: (tab?: 'empresa' | 'candidato' | 'funcionario') => void;
  onNavigateToSchema?: () => void;
  onNavigateToSobre?: () => void;
  onOpenTour?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewEmpresa,
  onOpenCadastroInicial,
  onNavigateToSchema,
  onNavigateToSobre,
  onOpenTour,
}) => {
  const {
    currentEmpresa,
    empresas,
    selectedEmpresaId,
    setSelectedEmpresaId,
    currentUser,
    usuarios,
    switchUser,
    logout,
    resetToDefaults,
  } = useApp();

  const [isTenantOpen, setIsTenantOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Group demo accounts for quick testing
  const adminUser = usuarios.find((u) => u.perfil === 'RH_ADMIN');
  const funcUser = usuarios.find((u) => u.perfil === 'FUNCIONARIO');
  const candUser = usuarios.find((u) => u.perfil === 'CANDIDATO' && u.id === 'usr-cand-01');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0A5B7A] text-white shadow-sm font-bold text-lg tracking-wider">
              <span className="text-[#F5B800]">G</span>IRH
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-[#0A5B7A] tracking-tight">
                  Gestão Integrada
                </span>
                <span className="bg-[#F5B800] text-slate-900 font-bold text-xs px-2 py-0.5 rounded-md">
                  RH SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Departamento Pessoal, Admissão & Colaborador
              </p>
            </div>
          </div>

          {/* Center: Tenant Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsTenantOpen(!isTenantOpen);
                setIsUserMenuOpen(false);
              }}
              className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              title="Trocar Empresa (Multi-Tenant)"
            >
              <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                {currentEmpresa.logoUrl ? (
                  <img
                    src={currentEmpresa.logoUrl}
                    alt={currentEmpresa.nomeFantasia}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-4 h-4 text-[#0A5B7A]" />
                )}
              </div>
              <div className="max-w-[130px] sm:max-w-[200px] truncate">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {currentEmpresa.nomeFantasia || currentEmpresa.razaoSocial}
                </div>
                <div className="text-[10px] text-slate-500 truncate font-mono">
                  {currentEmpresa.cnpj}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Tenant Dropdown */}
            {isTenantOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Empresas Contratantes (Multi-Tenant)
                </div>
                {empresas.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => {
                      setSelectedEmpresaId(emp.id);
                      setIsTenantOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors ${
                      emp.id === selectedEmpresaId ? 'bg-slate-50 font-semibold text-[#0A5B7A]' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: emp.corPrimaria || '#0A5B7A' }}
                      />
                      <div className="truncate">
                        <div className="truncate">{emp.nomeFantasia}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.cnpj}</div>
                      </div>
                    </div>
                    {emp.id === selectedEmpresaId && (
                      <span className="text-xs text-[#0A5B7A] font-bold">Ativa</span>
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-2 pt-2 px-2">
                  <button
                    onClick={() => {
                      setIsTenantOpen(false);
                      if (onOpenCadastroInicial) {
                        onOpenCadastroInicial('empresa');
                      } else if (onOpenNewEmpresa) {
                        onOpenNewEmpresa();
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-[#0A5B7A] hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cadastrar Nova Empresa</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Quick Role Simulator & User Account */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick RBAC Simulator Pills (Mandatory for easy multi-role testing) */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Simular Perfil:</span>
              <button
                onClick={() => adminUser && switchUser(adminUser.id)}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all flex items-center space-x-1 ${
                  currentUser?.perfil === 'RH_ADMIN'
                    ? 'bg-[#0A5B7A] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title="Acessar como Administrador do RH"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>RH Admin</span>
              </button>
              <button
                onClick={() => funcUser && switchUser(funcUser.id)}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all flex items-center space-x-1 ${
                  currentUser?.perfil === 'FUNCIONARIO'
                    ? 'bg-[#0A5B7A] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title="Acessar como Colaborador da Empresa"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Colaborador</span>
              </button>
              <button
                onClick={() => candUser && switchUser(candUser.id)}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all flex items-center space-x-1 ${
                  currentUser?.perfil === 'CANDIDATO'
                    ? 'bg-[#F5B800] text-slate-950 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title="Acessar como Candidato em Admissão"
              >
                <User className="w-3.5 h-3.5" />
                <span>Candidato (LGPD)</span>
              </button>
            </div>

            {/* Quick Link to Schema & DDL */}
            {onNavigateToSchema && (
              <button
                onClick={onNavigateToSchema}
                className="p-2 text-slate-600 hover:text-[#0A5B7A] hover:bg-slate-100 rounded-lg transition-colors"
                title="Estrutura SQL, Prisma Schema e Auditoria"
              >
                <Database className="w-5 h-5" />
              </button>
            )}

            {/* Quick Link to Sobre & Versão LGPD */}
            {onNavigateToSobre && (
              <button
                onClick={onNavigateToSobre}
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#0A5B7A] bg-slate-50 hover:bg-white text-slate-700 hover:text-[#0A5B7A] transition-colors text-xs font-semibold"
                title="Sobre a desenvolvedora Portal Gestão Integrada, versão v1.0.0 e LGPD"
              >
                <Info className="w-3.5 h-3.5 text-[#0A5B7A]" />
                <span>Sobre / LGPD</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  v1.0.0
                </span>
              </button>
            )}

            {/* Quick Link to Tour de Boas-vindas */}
            {onOpenTour && (
              <button
                onClick={onOpenTour}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-[#F5B800]/50 bg-[#F5B800]/10 hover:bg-[#F5B800]/20 text-slate-800 hover:text-slate-900 transition-colors text-xs font-semibold shadow-2xs"
                title="Abrir Tour de Boas-vindas e Guia dos Menus"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0A5B7A]" />
                <span className="hidden md:inline">Tour Guiado</span>
              </button>
            )}

            {/* Quick Link to Cadastro Inicial */}
            {onOpenCadastroInicial && (
              <button
                onClick={() => onOpenCadastroInicial()}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-[#0A5B7A]/30 bg-[#0A5B7A] hover:bg-[#084962] text-white transition-all text-xs font-bold shadow-xs cursor-pointer"
                title="Abrir Tela de Cadastro Inicial (Empresa, Candidato, Funcionário)"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#F5B800]" />
                <span className="hidden sm:inline">Criar Conta</span>
              </button>
            )}

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsTenantOpen(false);
                }}
                className="flex items-center space-x-2 p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300">
                  {currentUser?.fotoUrl ? (
                    <img
                      src={currentUser.fotoUrl}
                      alt={currentUser.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-xs text-[#0A5B7A]">
                      {currentUser?.nome?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-left pr-1">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser?.nome || 'Convidado'}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 flex items-center space-x-1">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        currentUser?.perfil === 'RH_ADMIN'
                          ? 'bg-[#0A5B7A]'
                          : currentUser?.perfil === 'FUNCIONARIO'
                          ? 'bg-emerald-500'
                          : 'bg-[#F5B800]'
                      }`}
                    />
                    <span>
                      {currentUser?.perfil === 'RH_ADMIN'
                        ? 'Gestor RH'
                        : currentUser?.perfil === 'FUNCIONARIO'
                        ? 'Colaborador'
                        : 'Candidato'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{currentUser?.nome}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                    <div className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      Nível: {currentUser?.perfil}
                    </div>
                  </div>

                  <div className="px-2 py-1.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                      Alternar Conta Demo
                    </div>
                    {usuarios.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left transition-colors ${
                          u.id === currentUser?.id
                            ? 'bg-[#0A5B7A]/10 text-[#0A5B7A] font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="truncate">
                          <div>{u.nome}</div>
                          <div className="text-[10px] text-slate-400">{u.perfil}</div>
                        </div>
                        {u.id === currentUser?.id && <span className="text-[10px]">●</span>}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 px-2 pt-1.5">
                    {onOpenCadastroInicial && (
                      <button
                        onClick={() => {
                          onOpenCadastroInicial();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-slate-700 hover:bg-slate-100 transition-colors mb-0.5"
                      >
                        <div className="flex items-center space-x-2">
                          <UserPlus className="w-3.5 h-3.5 text-[#0A5B7A]" />
                          <span>Cadastro Inicial (3 Perfis)</span>
                        </div>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                          Novo
                        </span>
                      </button>
                    )}
                    {onOpenTour && (
                      <button
                        onClick={() => {
                          onOpenTour();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-slate-700 hover:bg-slate-100 transition-colors mb-0.5"
                      >
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-3.5 h-3.5 text-[#0A5B7A]" />
                          <span>Tour de Boas-vindas</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          Guia
                        </span>
                      </button>
                    )}
                    {onNavigateToSobre && (
                      <button
                        onClick={() => {
                          onNavigateToSobre();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Info className="w-3.5 h-3.5 text-[#0A5B7A]" />
                          <span>Sobre / Governança LGPD</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          v1.0.0
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        resetToDefaults();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-xs text-slate-600 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Restaurar Dados Padrão</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Encerrar Sessão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
