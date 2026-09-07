import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HoleriteModal } from './components/HoleriteModal';
import { EspelhoPontoModal } from './components/EspelhoPontoModal';
import { TriagemAdmissaoModal } from './components/TriagemAdmissaoModal';
import { TermosPrivacidadeModal } from './components/TermosPrivacidadeModal';
import { SuporteModal } from './components/SuporteModal';
import { WelcomeTourModal } from './components/WelcomeTourModal';
import { CadastroInicialModal } from './components/CadastroInicialModal';
import { Footer } from './components/Footer';

// Views
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdmissoesView } from './views/AdmissoesView';
import { ColaboradoresView } from './views/ColaboradoresView';
import { DocumentosDistView } from './views/DocumentosDistView';
import { AtestadosFaltasView } from './views/AtestadosFaltasView';
import { ParametrizacaoView } from './views/ParametrizacaoView';
import { EmpresaBrandingView } from './views/EmpresaBrandingView';
import { DatabaseAuditView } from './views/DatabaseAuditView';
import { CandidatoAdmissaoView } from './views/CandidatoAdmissaoView';
import { ColaboradorPortalView } from './views/ColaboradorPortalView';
import { SobreVersaoView } from './views/SobreVersaoView';
import { CadastroInicialView } from './views/CadastroInicialView';

function MainAppContent() {
  const {
    currentUser,
    currentEmpresa,
    usuarios,
    dadosCadastrais,
    documentos,
    holerites,
    folhasPonto,
    aprovarAdmissao,
    solicitarCorrecaoAdmissao,
  } = useApp();

  const perfil = currentUser?.perfil || 'RH_ADMIN';

  // Default tab based on role
  const [currentTab, setCurrentTab] = useState<string>(
    perfil === 'RH_ADMIN'
      ? 'dashboard'
      : perfil === 'FUNCIONARIO'
      ? 'func_portal'
      : 'candidato_admissao'
  );

  // Update tab when role switches
  useEffect(() => {
    if (perfil === 'RH_ADMIN') {
      setCurrentTab('dashboard');
    } else if (perfil === 'FUNCIONARIO') {
      setCurrentTab('func_portal');
    } else {
      setCurrentTab('candidato_admissao');
    }
  }, [perfil]);

  // Modals state
  const [selectedHoleriteId, setSelectedHoleriteId] = useState<string | null>(null);
  const [selectedPontoId, setSelectedPontoId] = useState<string | null>(null);
  const [selectedAdmissaoCandId, setSelectedAdmissaoCandId] = useState<string | null>(null);
  const [isTermosModalOpen, setIsTermosModalOpen] = useState(false);
  const [isSuporteModalOpen, setIsSuporteModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false);
  const [cadastroModalTab, setCadastroModalTab] = useState<'empresa' | 'candidato' | 'funcionario'>('empresa');

  const handleOpenCadastro = (tab?: 'empresa' | 'candidato' | 'funcionario') => {
    setCadastroModalTab(tab || 'empresa');
    setIsCadastroModalOpen(true);
  };

  // Automatically trigger Welcome Tour for user on their first login
  useEffect(() => {
    if (currentUser?.id) {
      try {
        const hasCompleted = localStorage.getItem(`girh_welcome_tour_completed_${currentUser.id}`);
        if (hasCompleted !== 'true') {
          setIsTourOpen(true);
        }
      } catch (err) {
        console.error('Error checking tour status', err);
      }
    }
  }, [currentUser?.id]);

  // Active modal entities
  const activeHolerite = holerites.find((h) => h.id === selectedHoleriteId) || null;
  const holeriteUser = activeHolerite
    ? usuarios.find((u) => u.id === activeHolerite.usuarioId)
    : undefined;
  const holeriteDados = activeHolerite
    ? dadosCadastrais.find((d) => d.usuarioId === activeHolerite.usuarioId)
    : undefined;

  const activePonto = folhasPonto.find((p) => p.id === selectedPontoId) || null;
  const pontoUser = activePonto
    ? usuarios.find((u) => u.id === activePonto.usuarioId)
    : undefined;

  const activeCand = usuarios.find((u) => u.id === selectedAdmissaoCandId) || null;
  const candDados = activeCand
    ? dadosCadastrais.find((d) => d.usuarioId === activeCand.id)
    : undefined;
  const candDocs = activeCand
    ? documentos.filter((d) => d.usuarioId === activeCand.id)
    : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800 font-sans antialiased selection:bg-[#0A5B7A] selection:text-white">
      {/* Top Navigation Bar with Multi-tenant switcher, Role simulator, Sobre link & Tour */}
      <Navbar
        onNavigateToSobre={() => setCurrentTab('sobre')}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenCadastroInicial={handleOpenCadastro}
        onOpenNewEmpresa={() => handleOpenCadastro('empresa')}
      />

      {/* Main Content Area: Sidebar + Screen */}
      <div className="flex flex-1 overflow-hidden">
        {/* Responsive Role-Based Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(t) => setCurrentTab(t)}
          onOpenTour={() => setIsTourOpen(true)}
        />

        {/* Dynamic Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto w-full mb-8">
            {/* GLOBAL VIEW: CADASTRO INICIAL (3 ABAS: EMPRESA, CANDIDATO, FUNCIONÁRIO) */}
            {currentTab === 'cadastro_inicial' || currentTab === 'cadastro' ? (
              <CadastroInicialView
                initialTab={cadastroModalTab}
                onNavigate={(t) => setCurrentTab(t)}
                onOpenTermosModal={() => setIsTermosModalOpen(true)}
                onOpenSuporteModal={() => setIsSuporteModalOpen(true)}
              />
            ) : currentTab === 'sobre' || currentTab === 'versao' ? (
              <SobreVersaoView
                onOpenTermosModal={() => setIsTermosModalOpen(true)}
                onOpenSuporteModal={() => setIsSuporteModalOpen(true)}
              />
            ) : (
              <>
                {/* RH_ADMIN VIEWS */}
                {perfil === 'RH_ADMIN' && (
                  <>
                    {currentTab === 'dashboard' && (
                      <AdminDashboardView
                        onNavigate={(t) => setCurrentTab(t)}
                        onOpenAdmissaoModal={(candId) => setSelectedAdmissaoCandId(candId)}
                      />
                    )}
                    {currentTab === 'admissoes' && (
                      <AdmissoesView
                        onOpenAdmissaoModal={(candId) => setSelectedAdmissaoCandId(candId)}
                      />
                    )}
                    {currentTab === 'colaboradores' && (
                      <ColaboradoresView
                        onViewHolerite={(id) => setSelectedHoleriteId(id)}
                        onViewPonto={(id) => setSelectedPontoId(id)}
                      />
                    )}
                    {currentTab === 'documentos_dist' && (
                      <DocumentosDistView
                        onViewHolerite={(id) => setSelectedHoleriteId(id)}
                        onViewPonto={(id) => setSelectedPontoId(id)}
                      />
                    )}
                    {currentTab === 'atestados_faltas' && <AtestadosFaltasView />}
                    {currentTab === 'parametrizacao' && <ParametrizacaoView />}
                    {currentTab === 'empresa_branding' && <EmpresaBrandingView />}
                    {currentTab === 'database_audit' && <DatabaseAuditView />}
                  </>
                )}

                {/* FUNCIONARIO VIEWS */}
                {perfil === 'FUNCIONARIO' && (
                  <>
                    {currentTab === 'func_portal' && (
                      <ColaboradorPortalView
                        initialSubTab="overview"
                        onViewHolerite={(id) => setSelectedHoleriteId(id)}
                        onViewPonto={(id) => setSelectedPontoId(id)}
                      />
                    )}
                    {currentTab === 'meus_holerites' && (
                      <ColaboradorPortalView
                        initialSubTab="holerites"
                        onViewHolerite={(id) => setSelectedHoleriteId(id)}
                        onViewPonto={(id) => setSelectedPontoId(id)}
                      />
                    )}
                    {currentTab === 'meu_ponto' && (
                      <ColaboradorPortalView
                        initialSubTab="ponto"
                        onViewHolerite={(id) => setSelectedHoleriteId(id)}
                        onViewPonto={(id) => setSelectedPontoId(id)}
                      />
                    )}
                    {currentTab === 'meus_atestados' && (
                      <ColaboradorPortalView
                        initialSubTab="atestados"
                        onViewHolerite={(id) => setSelectedHoleriteId(id)}
                        onViewPonto={(id) => setSelectedPontoId(id)}
                      />
                    )}
                    {currentTab === 'minhas_faltas' && (
                      <ColaboradorPortalView
                        initialSubTab="faltas"
                        onViewHolerite={(id) => setSelectedHoleriteId(id)}
                        onViewPonto={(id) => setSelectedPontoId(id)}
                      />
                    )}
                  </>
                )}

                {/* CANDIDATO VIEWS */}
                {perfil === 'CANDIDATO' && (
                  <>
                    {(currentTab === 'candidato_admissao' || currentTab === 'candidato_lgpd') && (
                      <CandidatoAdmissaoView />
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* STANDARDIZED INSTITUTIONAL FOOTER */}
          <Footer
            onNavigateToSobre={() => setCurrentTab('sobre')}
            onOpenTermos={() => setIsTermosModalOpen(true)}
            onOpenSuporte={() => setIsSuporteModalOpen(true)}
            onOpenTour={() => setIsTourOpen(true)}
          />
        </main>
      </div>

      {/* MODAL 1: HOLERITE OFICIAL BRASILEIRO (CLT) COM IMPRESSÃO/PDF */}
      {activeHolerite && (
        <HoleriteModal
          holerite={activeHolerite}
          empresa={currentEmpresa}
          colaborador={holeriteUser}
          dadosCadastrais={holeriteDados}
          onClose={() => setSelectedHoleriteId(null)}
        />
      )}

      {/* MODAL 2: ESPELHO DE PONTO ELETRÔNICO PORTARIA 671 MTP */}
      {activePonto && (
        <EspelhoPontoModal
          folhaPonto={activePonto}
          empresa={currentEmpresa}
          colaborador={pontoUser}
          onClose={() => setSelectedPontoId(null)}
        />
      )}

      {/* MODAL 3: TRIAGEM E HOMOLOGAÇÃO DE ADMISSÃO (RH ADMIN) */}
      {activeCand && (
        <TriagemAdmissaoModal
          candidato={activeCand}
          dados={candDados}
          documentos={candDocs}
          onAprovar={(userId, obs) => aprovarAdmissao(userId, obs)}
          onSolicitarCorrecao={(userId, obs) => solicitarCorrecaoAdmissao(userId, obs)}
          onClose={() => setSelectedAdmissaoCandId(null)}
        />
      )}

      {/* MODAL 4: TERMOS DE PRIVACIDADE E SEGURANÇA LGPD */}
      {isTermosModalOpen && (
        <TermosPrivacidadeModal onClose={() => setIsTermosModalOpen(false)} />
      )}

      {/* MODAL 5: CENTRAL DE SUPORTE TÉCNICO DESENVOLVEDORA */}
      {isSuporteModalOpen && (
        <SuporteModal onClose={() => setIsSuporteModalOpen(false)} />
      )}

      {/* MODAL 6: TOUR DE BOAS-VINDAS / GUIA DE INTRODUÇÃO AOS MENUS */}
      <WelcomeTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
          setIsTourOpen(false);
        }}
      />

      {/* MODAL 7: CADASTRO INICIAL (3 ABAS: EMPRESA, CANDIDATO, FUNCIONÁRIO) */}
      <CadastroInicialModal
        isOpen={isCadastroModalOpen}
        onClose={() => setIsCadastroModalOpen(false)}
        initialTab={cadastroModalTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          setIsCadastroModalOpen(false);
        }}
        onOpenTermosModal={() => setIsTermosModalOpen(true)}
        onOpenSuporteModal={() => setIsSuporteModalOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
