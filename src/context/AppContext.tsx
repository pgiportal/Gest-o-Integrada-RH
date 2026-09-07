import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Empresa,
  ParametrosEmpresa,
  Usuario,
  DadosCadastrais,
  DocumentoAdmissao,
  Holerite,
  FolhaPonto,
  Falta,
  Atestado,
  AuditLog,
  PerfilUsuario,
  ItemHolerite,
} from '../types';
import {
  INITIAL_EMPRESAS,
  INITIAL_PARAMETROS,
  INITIAL_USUARIOS,
  INITIAL_DADOS_CADASTRAIS,
  INITIAL_DOCUMENTOS,
  INITIAL_HOLERITES,
  INITIAL_FOLHAS_PONTO,
  INITIAL_ATESTADOS,
  INITIAL_FALTAS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

interface AppContextType {
  // Multi-Tenant
  empresas: Empresa[];
  selectedEmpresaId: string;
  currentEmpresa: Empresa;
  setSelectedEmpresaId: (id: string) => void;
  updateEmpresa: (dados: Partial<Empresa>) => void;
  createEmpresa: (dados: Omit<Empresa, 'id' | 'criadoEm' | 'atualizadoEm'>) => Empresa;

  // Parametrização
  parametros: ParametrosEmpresa[];
  currentParametros: ParametrosEmpresa;
  updateParametros: (novosParametros: Partial<ParametrosEmpresa>) => void;

  // Auth & RBAC
  usuarios: Usuario[];
  currentUser: Usuario | null;
  setCurrentUser: (user: Usuario | null) => void;
  switchUser: (usuarioId: string) => void;
  login: (email: string, senha?: string) => boolean;
  logout: () => void;
  cadastrarUsuario: (dados: { nome: string; email: string; perfil?: PerfilUsuario; empresaId?: string }) => Usuario;

  // Admissão & LGPD
  dadosCadastrais: DadosCadastrais[];
  documentos: DocumentoAdmissao[];
  saveDadosCadastrais: (dados: Partial<DadosCadastrais>, aceitarLgpd?: boolean) => void;
  uploadDocumento: (tipo: DocumentoAdmissao['tipoDocumento'], nome: string, url: string, tamanhoKb?: number) => void;
  removerDocumento: (documentoId: string) => void;
  aprovarAdmissao: (usuarioId: string, observacao?: string) => void;
  solicitarCorrecaoAdmissao: (usuarioId: string, observacao: string) => void;

  // Colaborador & RH
  holerites: Holerite[];
  folhasPonto: FolhaPonto[];
  atestados: Atestado[];
  faltas: Falta[];
  adicionarHolerite: (holerite: Omit<Holerite, 'id' | 'criadoEm'>) => void;
  gerarHoleritesEmLote: (mes: number, ano: number) => number;
  gerarFolhasPontoEmLote: (mes: number, ano: number) => number;
  enviarAtestado: (dados: { dataInicio: string; diasAfastamento: number; cid?: string; urlArquivo: string; nomeArquivo: string }) => void;
  avaliarAtestado: (atestadoId: string, status: 'APROVADO' | 'RECUSADO', motivoRecusa?: string) => void;
  lancarFalta: (usuarioId: string, dataFalta: string, justificada: boolean, motivo: string) => void;

  // Auditoria
  auditLogs: AuditLog[];
  logAction: (acao: string, entidade: string, detalhes: string, entidadeId?: string) => void;

  // System
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EMPRESAS: 'gestao_rh_empresas_v1',
  SELECTED_EMPRESA: 'gestao_rh_selected_empresa_v1',
  PARAMETROS: 'gestao_rh_parametros_v1',
  USUARIOS: 'gestao_rh_usuarios_v1',
  CURRENT_USER: 'gestao_rh_current_user_v1',
  DADOS_CADASTRAIS: 'gestao_rh_dados_cadastrais_v1',
  DOCUMENTOS: 'gestao_rh_documentos_v1',
  HOLERITES: 'gestao_rh_holerites_v1',
  FOLHAS_PONTO: 'gestao_rh_folhas_ponto_v1',
  ATESTADOS: 'gestao_rh_atestados_v1',
  FALTAS: 'gestao_rh_faltas_v1',
  AUDIT_LOGS: 'gestao_rh_audit_logs_v1',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [empresas, setEmpresas] = useState<Empresa[]>(() =>
    loadFromStorage(STORAGE_KEYS.EMPRESAS, INITIAL_EMPRESAS)
  );

  const [selectedEmpresaId, setSelectedEmpresaIdState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.SELECTED_EMPRESA, INITIAL_EMPRESAS[0]?.id || '')
  );

  const [parametros, setParametros] = useState<ParametrosEmpresa[]>(() =>
    loadFromStorage(STORAGE_KEYS.PARAMETROS, INITIAL_PARAMETROS)
  );

  const [usuarios, setUsuarios] = useState<Usuario[]>(() =>
    loadFromStorage(STORAGE_KEYS.USUARIOS, INITIAL_USUARIOS)
  );

  const [currentUser, setCurrentUserState] = useState<Usuario | null>(() => {
    const saved = loadFromStorage<Usuario | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (saved) return saved;
    // Default to RH Admin for rich initial experience
    return INITIAL_USUARIOS[0] || null;
  });

  const [dadosCadastrais, setDadosCadastrais] = useState<DadosCadastrais[]>(() =>
    loadFromStorage(STORAGE_KEYS.DADOS_CADASTRAIS, INITIAL_DADOS_CADASTRAIS)
  );

  const [documentos, setDocumentos] = useState<DocumentoAdmissao[]>(() =>
    loadFromStorage(STORAGE_KEYS.DOCUMENTOS, INITIAL_DOCUMENTOS)
  );

  const [holerites, setHolerites] = useState<Holerite[]>(() =>
    loadFromStorage(STORAGE_KEYS.HOLERITES, INITIAL_HOLERITES)
  );

  const [folhasPonto, setFolhasPonto] = useState<FolhaPonto[]>(() =>
    loadFromStorage(STORAGE_KEYS.FOLHAS_PONTO, INITIAL_FOLHAS_PONTO)
  );

  const [atestados, setAtestados] = useState<Atestado[]>(() =>
    loadFromStorage(STORAGE_KEYS.ATESTADOS, INITIAL_ATESTADOS)
  );

  const [faltas, setFaltas] = useState<Falta[]>(() =>
    loadFromStorage(STORAGE_KEYS.FALTAS, INITIAL_FALTAS)
  );

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS)
  );

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPRESAS, JSON.stringify(empresas));
  }, [empresas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_EMPRESA, JSON.stringify(selectedEmpresaId));
  }, [selectedEmpresaId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARAMETROS, JSON.stringify(parametros));
  }, [parametros]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DADOS_CADASTRAIS, JSON.stringify(dadosCadastrais));
  }, [dadosCadastrais]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTOS, JSON.stringify(documentos));
  }, [documentos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOLERITES, JSON.stringify(holerites));
  }, [holerites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLHAS_PONTO, JSON.stringify(folhasPonto));
  }, [folhasPonto]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATESTADOS, JSON.stringify(atestados));
  }, [atestados]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FALTAS, JSON.stringify(faltas));
  }, [faltas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Current Empresa object
  const currentEmpresa = useMemo(() => {
    const found = empresas.find((e) => e.id === selectedEmpresaId);
    return found || empresas[0] || INITIAL_EMPRESAS[0];
  }, [empresas, selectedEmpresaId]);

  // Current Parametros object
  const currentParametros = useMemo(() => {
    const found = parametros.find((p) => p.empresaId === currentEmpresa.id);
    if (found) return found;
    // Create fallback default
    return {
      id: `param-${currentEmpresa.id}`,
      empresaId: currentEmpresa.id,
      vtDescontoPercentual: 6.0,
      vrVaValorDiario: 35.0,
      vrVaCoparticipacaoPercentual: 15.0,
      vrVaCoparticipacaoFixa: 0.0,
      planoSaudeModelo: 'VALOR_FIXO' as const,
      planoSaudeValorTitular: 120.0,
      planoSaudeValorDependente: 160.0,
      beneficiosCustomizados: [],
      descontoSindicalAtivo: false,
      sindicatoTipoCalculo: 'PERCENTUAL' as const,
      sindicatoValorOuPercentual: 1.0,
      toleranciaPontoMinutos: 10,
      horaExtraPercentualSemana: 50.0,
      horaExtraPercentualDomFeriado: 100.0,
      bancoHorasAtivo: true,
      atualizadoEm: new Date().toISOString(),
    };
  }, [parametros, currentEmpresa.id]);

  const setSelectedEmpresaId = (id: string) => {
    setSelectedEmpresaIdState(id);
    // If current user is not in this empresa, switch or keep RH_ADMIN
    if (currentUser && currentUser.empresaId !== id && currentUser.perfil !== 'RH_ADMIN') {
      const firstUserOfEmpresa = usuarios.find((u) => u.empresaId === id);
      if (firstUserOfEmpresa) {
        setCurrentUserState(firstUserOfEmpresa);
      }
    }
  };

  const setCurrentUser = (user: Usuario | null) => {
    setCurrentUserState(user);
    if (user && user.empresaId && user.empresaId !== selectedEmpresaId) {
      setSelectedEmpresaIdState(user.empresaId);
    }
  };

  const logAction = (acao: string, entidade: string, detalhes: string, entidadeId?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      empresaId: selectedEmpresaId,
      usuarioId: currentUser?.id || 'sistema',
      usuarioNome: currentUser?.nome || 'Sistema / Convidado',
      acao,
      entidade,
      entidadeId,
      detalhes,
      ipOrigem: '189.120.45.12',
      criadoEm: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const updateEmpresa = (dados: Partial<Empresa>) => {
    setEmpresas((prev) =>
      prev.map((emp) => {
        if (emp.id === currentEmpresa.id) {
          const updated = {
            ...emp,
            ...dados,
            atualizadoEm: new Date().toISOString(),
          };
          return updated;
        }
        return emp;
      })
    );
    logAction(
      'EMPRESA_ATUALIZADA',
      'empresas',
      `Dados cadastrais e branding da empresa ${currentEmpresa.nomeFantasia} atualizados.`,
      currentEmpresa.id
    );
  };

  const createEmpresa = (dados: Omit<Empresa, 'id' | 'criadoEm' | 'atualizadoEm'>): Empresa => {
    const newId = `emp-${Date.now()}`;
    const newEmpresa: Empresa = {
      ...dados,
      id: newId,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    const newParam: ParametrosEmpresa = {
      id: `param-${newId}`,
      empresaId: newId,
      vtDescontoPercentual: 6.0,
      vrVaValorDiario: 35.0,
      vrVaCoparticipacaoPercentual: 15.0,
      vrVaCoparticipacaoFixa: 0.0,
      planoSaudeModelo: 'VALOR_FIXO',
      planoSaudeValorTitular: 100.0,
      planoSaudeValorDependente: 140.0,
      beneficiosCustomizados: [],
      descontoSindicalAtivo: false,
      sindicatoTipoCalculo: 'PERCENTUAL',
      sindicatoValorOuPercentual: 1.0,
      toleranciaPontoMinutos: 10,
      horaExtraPercentualSemana: 50.0,
      horaExtraPercentualDomFeriado: 100.0,
      bancoHorasAtivo: true,
      atualizadoEm: new Date().toISOString(),
    };

    setEmpresas((prev) => [...prev, newEmpresa]);
    setParametros((prev) => [...prev, newParam]);
    setSelectedEmpresaIdState(newId);

    logAction('NOVA_EMPRESA_CRIADA', 'empresas', `Empresa ${newEmpresa.razaoSocial} cadastrada no SaaS.`, newId);
    return newEmpresa;
  };

  const updateParametros = (novosParametros: Partial<ParametrosEmpresa>) => {
    setParametros((prev) => {
      const exists = prev.some((p) => p.empresaId === currentEmpresa.id);
      if (exists) {
        return prev.map((p) =>
          p.empresaId === currentEmpresa.id
            ? { ...p, ...novosParametros, atualizadoEm: new Date().toISOString(), atualizadoPor: currentUser?.id }
            : p
        );
      } else {
        const created: ParametrosEmpresa = {
          ...currentParametros,
          ...novosParametros,
          empresaId: currentEmpresa.id,
          atualizadoEm: new Date().toISOString(),
        };
        return [...prev, created];
      }
    });

    logAction(
      'PARAMETROS_ATUALIZADOS',
      'parametros_empresa',
      `Regras de benefícios, sindicato e jornada atualizadas para ${currentEmpresa.nomeFantasia}.`,
      currentParametros.id
    );
  };

  const switchUser = (usuarioId: string) => {
    const user = usuarios.find((u) => u.id === usuarioId);
    if (user) {
      setCurrentUserState(user);
      if (user.empresaId) {
        setSelectedEmpresaIdState(user.empresaId);
      }
    }
  };

  const login = (email: string, _senha?: string): boolean => {
    const user = usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (user) {
      setCurrentUserState(user);
      if (user.empresaId) {
        setSelectedEmpresaIdState(user.empresaId);
      }
      logAction('LOGIN_EFETUADO', 'usuarios', `Sessão iniciada pelo usuário ${user.nome} (${user.perfil}).`, user.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      logAction('LOGOUT_EFETUADO', 'usuarios', `Sessão encerrada pelo usuário ${currentUser.nome}.`, currentUser.id);
    }
    setCurrentUserState(null);
  };

  const cadastrarUsuario = (dados: {
    nome: string;
    email: string;
    perfil?: PerfilUsuario;
    empresaId?: string;
  }): Usuario => {
    const newId = `usr-${Date.now()}`;
    const newUser: Usuario = {
      id: newId,
      empresaId: dados.empresaId || selectedEmpresaId,
      nome: dados.nome,
      email: dados.email,
      perfil: dados.perfil || 'CANDIDATO',
      ativo: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    setUsuarios((prev) => [...prev, newUser]);
    setCurrentUserState(newUser);

    // Initial empty registration data
    const newDc: DadosCadastrais = {
      id: `dc-${newId}`,
      empresaId: newUser.empresaId,
      usuarioId: newId,
      cpf: '',
      dataNascimento: '',
      estadoCivil: 'Solteiro(a)',
      nomeMae: '',
      telefone: '',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: '',
      banco: '',
      tipoConta: 'Conta Corrente',
      agencia: '',
      conta: '',
      chavePix: '',
      lgpdAceito: false,
      statusAdmissao: 'PENDENTE',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    setDadosCadastrais((prev) => [...prev, newDc]);

    logAction('USUARIO_CADASTRADO', 'usuarios', `Novo usuário cadastrado: ${newUser.nome} (${newUser.perfil}).`, newId);
    return newUser;
  };

  const saveDadosCadastrais = (novosDados: Partial<DadosCadastrais>, aceitarLgpd?: boolean) => {
    if (!currentUser) return;

    setDadosCadastrais((prev) => {
      const existing = prev.find((dc) => dc.usuarioId === currentUser.id);
      const now = new Date().toISOString();
      const ipHash = `${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}.45#sha256:term-${Date.now()}`;

      if (existing) {
        const updated: DadosCadastrais = {
          ...existing,
          ...novosDados,
          lgpdAceito: aceitarLgpd !== undefined ? aceitarLgpd : existing.lgpdAceito,
          lgpdAceitoEm: aceitarLgpd ? now : existing.lgpdAceitoEm,
          lgpdIpHash: aceitarLgpd ? ipHash : existing.lgpdIpHash,
          statusAdmissao:
            existing.statusAdmissao === 'PENDENTE' && aceitarLgpd ? 'EM_ANALISE' : existing.statusAdmissao,
          atualizadoEm: now,
        };
        return prev.map((dc) => (dc.usuarioId === currentUser.id ? updated : dc));
      } else {
        const created: DadosCadastrais = {
          id: `dc-${currentUser.id}`,
          empresaId: currentUser.empresaId,
          usuarioId: currentUser.id,
          cpf: novosDados.cpf || '',
          pisPasep: novosDados.pisPasep || '',
          dataNascimento: novosDados.dataNascimento || '1995-01-01',
          estadoCivil: novosDados.estadoCivil || 'Solteiro(a)',
          nomeMae: novosDados.nomeMae || '',
          telefone: novosDados.telefone || '',
          cep: novosDados.cep || '',
          logradouro: novosDados.logradouro || '',
          numero: novosDados.numero || '',
          complemento: novosDados.complemento || '',
          bairro: novosDados.bairro || '',
          cidade: novosDados.cidade || '',
          uf: novosDados.uf || '',
          banco: novosDados.banco || '',
          tipoConta: novosDados.tipoConta || 'Conta Corrente',
          agencia: novosDados.agencia || '',
          conta: novosDados.conta || '',
          chavePix: novosDados.chavePix || '',
          lgpdAceito: Boolean(aceitarLgpd),
          lgpdAceitoEm: aceitarLgpd ? now : undefined,
          lgpdIpHash: aceitarLgpd ? ipHash : undefined,
          statusAdmissao: aceitarLgpd ? 'EM_ANALISE' : 'PENDENTE',
          criadoEm: now,
          atualizadoEm: now,
        };
        return [...prev, created];
      }
    });

    logAction(
      'DADOS_CADASTRAIS_SALVOS',
      'dados_cadastrais',
      `Dados admissionais eSocial atualizados por ${currentUser.nome}.${
        aceitarLgpd ? ' Termo de Consentimento LGPD aceito digitalmente.' : ''
      }`,
      currentUser.id
    );
  };

  const uploadDocumento = (
    tipo: DocumentoAdmissao['tipoDocumento'],
    nome: string,
    url: string,
    tamanhoKb: number = 500
  ) => {
    if (!currentUser) return;
    const newDoc: DocumentoAdmissao = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      empresaId: currentUser.empresaId,
      usuarioId: currentUser.id,
      tipoDocumento: tipo,
      urlArquivo: url,
      nomeArquivo: nome,
      tamanhoKb,
      status: 'EM_ANALISE',
      criadoEm: new Date().toISOString(),
    };
    setDocumentos((prev) => [...prev, newDoc]);
    logAction('DOCUMENTO_ENVIADO', 'documentos_admissao', `Documento ${nome} (${tipo}) anexado por ${currentUser.nome}.`, newDoc.id);
  };

  const removerDocumento = (documentoId: string) => {
    setDocumentos((prev) => prev.filter((d) => d.id !== documentoId));
    logAction('DOCUMENTO_REMOVIDO', 'documentos_admissao', `Documento ${documentoId} removido.`, documentoId);
  };

  const aprovarAdmissao = (usuarioId: string, observacao?: string) => {
    // 1. Update statusAdmissao in DadosCadastrais to 'APROVADO'
    setDadosCadastrais((prev) =>
      prev.map((dc) =>
        dc.usuarioId === usuarioId
          ? {
              ...dc,
              statusAdmissao: 'APROVADO',
              observacaoRh: observacao || 'Admissão aprovada pelo Departamento Pessoal.',
              atualizadoEm: new Date().toISOString(),
            }
          : dc
      )
    );

    // 2. Promote Usuario perfil to 'FUNCIONARIO'
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === usuarioId
          ? {
              ...u,
              perfil: 'FUNCIONARIO',
              dataAdmissao: u.dataAdmissao || new Date().toISOString().split('T')[0],
              atualizadoEm: new Date().toISOString(),
            }
          : u
      )
    );

    // 3. Mark all documents of this user as APROVADO
    setDocumentos((prev) =>
      prev.map((d) => (d.usuarioId === usuarioId ? { ...d, status: 'APROVADO' } : d))
    );

    const targetUser = usuarios.find((u) => u.id === usuarioId);
    logAction(
      'ADMISSAO_APROVADA',
      'usuarios',
      `Admissão de ${targetUser?.nome || usuarioId} aprovada com sucesso. Usuário promovido para FUNCIONÁRIO.`,
      usuarioId
    );
  };

  const solicitarCorrecaoAdmissao = (usuarioId: string, observacao: string) => {
    setDadosCadastrais((prev) =>
      prev.map((dc) =>
        dc.usuarioId === usuarioId
          ? {
              ...dc,
              statusAdmissao: 'REJEITADO',
              observacaoRh: observacao,
              atualizadoEm: new Date().toISOString(),
            }
          : dc
      )
    );

    const targetUser = usuarios.find((u) => u.id === usuarioId);
    logAction(
      'CORRECAO_SOLICITADA',
      'dados_cadastrais',
      `Solicitação de correção na admissão de ${targetUser?.nome || usuarioId}: "${observacao}".`,
      usuarioId
    );
  };

  const adicionarHolerite = (holerite: Omit<Holerite, 'id' | 'criadoEm'>) => {
    const newHol: Holerite = {
      ...holerite,
      id: `hol-${Date.now()}`,
      criadoEm: new Date().toISOString(),
    };
    setHolerites((prev) => [newHol, ...prev]);
    logAction('HOLERITE_PUBLICADO', 'holerites', `Holerite publicado para o usuário ${holerite.usuarioId}.`, newHol.id);
  };

  const gerarHoleritesEmLote = (mes: number, ano: number): number => {
    // Generates payslips for all FUNCIONARIO in this empresa who do not already have one for mes/ano
    const funcionarios = usuarios.filter(
      (u) => u.empresaId === currentEmpresa.id && u.perfil === 'FUNCIONARIO' && u.ativo
    );

    let count = 0;
    const novos: Holerite[] = [];

    funcionarios.forEach((func) => {
      const alreadyHas = holerites.some(
        (h) => h.usuarioId === func.id && h.mes === mes && h.ano === ano
      );
      if (!alreadyHas) {
        const base = func.salarioBase || 5000;
        // Calculation based on company parameters
        const vtDesc = (base * (currentParametros.vtDescontoPercentual || 6)) / 100;
        const vrDesc = (currentParametros.vrVaValorDiario * 22 * (currentParametros.vrVaCoparticipacaoPercentual || 15)) / 100;
        const saudeDesc = currentParametros.planoSaudeValorTitular || 120;
        const inssDesc = base * 0.12; // simplified standard deduction
        const irrfDesc = (base - inssDesc) * 0.15; // simplified standard deduction
        const sindicatoDesc = currentParametros.descontoSindicalAtivo && currentParametros.sindicatoMesAplicacao === mes
          ? (currentParametros.sindicatoValorOuPercentual || 50)
          : 0;

        const itens: ItemHolerite[] = [
          { codigo: '001', descricao: 'SALÁRIO BASE CONTRATUAL', referencia: '30D', provento: base, desconto: 0 },
          { codigo: '101', descricao: 'INSS EMPREGADO', referencia: '12.0%', provento: 0, desconto: Math.round(inssDesc * 100) / 100 },
          { codigo: '102', descricao: 'IRRF RETIDO NA FONTE', referencia: '15.0%', provento: 0, desconto: Math.round(irrfDesc * 100) / 100 },
          { codigo: '201', descricao: `VALE TRANSPORTE (VT ${currentParametros.vtDescontoPercentual}%)`, referencia: `${currentParametros.vtDescontoPercentual}%`, provento: 0, desconto: Math.round(vtDesc * 100) / 100 },
          { codigo: '202', descricao: 'VALE REFEIÇÃO / ALIMENTAÇÃO', referencia: 'COPART', provento: 0, desconto: Math.round(vrDesc * 100) / 100 },
          { codigo: '205', descricao: 'PLANO DE SAÚDE TITULAR', referencia: 'MENSAL', provento: 0, desconto: saudeDesc },
        ];

        if (sindicatoDesc > 0) {
          itens.push({
            codigo: '301',
            descricao: 'CONTRIBUIÇÃO SINDICAL ASSISTENCIAL',
            referencia: 'CONVENÇÃO',
            provento: 0,
            desconto: sindicatoDesc,
          });
        }

        const totalVencimentos = base;
        const totalDescontos = itens.reduce((acc, curr) => acc + curr.desconto, 0);
        const salarioLiquido = Math.round((totalVencimentos - totalDescontos) * 100) / 100;

        novos.push({
          id: `hol-${func.id}-${ano}-${mes}`,
          empresaId: currentEmpresa.id,
          usuarioId: func.id,
          mes,
          ano,
          salarioBase: base,
          totalVencimentos,
          totalDescontos: Math.round(totalDescontos * 100) / 100,
          salarioLiquido,
          itens,
          baseInss: base,
          baseFgts: base,
          fgtsDoMes: Math.round(base * 0.08 * 100) / 100,
          baseIrrf: Math.round((base - inssDesc) * 100) / 100,
          nomeArquivo: `holerite_${mes.toString().padStart(2, '0')}_${ano}_${func.nome.toLowerCase().replace(/\s+/g, '_')}.pdf`,
          enviadoPor: currentUser?.id,
          criadoEm: new Date().toISOString(),
        });
        count++;
      }
    });

    if (novos.length > 0) {
      setHolerites((prev) => [...novos, ...prev]);
      logAction(
        'HOLERITES_GERADOS_EM_LOTE',
        'holerites',
        `Geração em lote de holerites para ${count} funcionários referente a ${mes}/${ano}.`
      );
    }
    return count;
  };

  const gerarFolhasPontoEmLote = (mes: number, ano: number): number => {
    const funcionarios = usuarios.filter(
      (u) => u.empresaId === currentEmpresa.id && u.perfil === 'FUNCIONARIO' && u.ativo
    );

    let count = 0;
    const novas: FolhaPonto[] = [];

    funcionarios.forEach((func) => {
      const alreadyHas = folhasPonto.some(
        (fp) => fp.usuarioId === func.id && fp.mes === mes && fp.ano === ano
      );
      if (!alreadyHas) {
        novas.push({
          id: `fp-${func.id}-${ano}-${mes}`,
          empresaId: currentEmpresa.id,
          usuarioId: func.id,
          mes,
          ano,
          totalHorasTrabalhadas: '176:00',
          totalHorasExtras: '06:30',
          totalAtrasos: '00:10',
          saldoBancoHoras: '+18:20',
          nomeArquivo: `espelho_ponto_${mes.toString().padStart(2, '0')}_${ano}_${func.nome.toLowerCase().replace(/\s+/g, '_')}.pdf`,
          enviadoPor: currentUser?.id,
          criadoEm: new Date().toISOString(),
          registros: [
            { data: `${ano}-${mes.toString().padStart(2, '0')}-02`, diaSemana: 'Segunda-feira', entrada1: '09:00', saida1: '12:00', entrada2: '13:00', saida2: '18:00', totalHoras: '08:00', horasExtras: '00:00', atrasos: '00:00', status: 'NORMAL' },
            { data: `${ano}-${mes.toString().padStart(2, '0')}-03`, diaSemana: 'Terça-feira', entrada1: '08:58', saida1: '12:00', entrada2: '13:00', saida2: '18:45', totalHoras: '08:47', horasExtras: '00:45', atrasos: '00:00', status: 'NORMAL' },
            { data: `${ano}-${mes.toString().padStart(2, '0')}-04`, diaSemana: 'Quarta-feira', entrada1: '09:02', saida1: '12:00', entrada2: '13:00', saida2: '18:00', totalHoras: '07:58', horasExtras: '00:00', atrasos: '00:02 (Tolerância)', status: 'NORMAL' },
            { data: `${ano}-${mes.toString().padStart(2, '0')}-05`, diaSemana: 'Quinta-feira', entrada1: '09:00', saida1: '12:00', entrada2: '13:00', saida2: '19:00', totalHoras: '09:00', horasExtras: '01:00', atrasos: '00:00', status: 'NORMAL' },
            { data: `${ano}-${mes.toString().padStart(2, '0')}-06`, diaSemana: 'Sexta-feira', entrada1: '09:00', saida1: '12:00', entrada2: '13:00', saida2: '18:00', totalHoras: '08:00', horasExtras: '00:00', atrasos: '00:00', status: 'NORMAL' },
          ],
        });
        count++;
      }
    });

    if (novas.length > 0) {
      setFolhasPonto((prev) => [...novas, ...prev]);
      logAction(
        'FOLHAS_PONTO_GERADAS_EM_LOTE',
        'folha_ponto',
        `Espelhos de ponto gerados para ${count} colaboradores para o período ${mes}/${ano}.`
      );
    }
    return count;
  };

  const enviarAtestado = (dados: {
    dataInicio: string;
    diasAfastamento: number;
    cid?: string;
    urlArquivo: string;
    nomeArquivo: string;
  }) => {
    if (!currentUser) return;
    const newAtestado: Atestado = {
      id: `atest-${Date.now()}`,
      empresaId: currentUser.empresaId,
      usuarioId: currentUser.id,
      dataInicio: dados.dataInicio,
      diasAfastamento: dados.diasAfastamento,
      cid: dados.cid,
      urlArquivo: dados.urlArquivo,
      nomeArquivo: dados.nomeArquivo,
      status: 'PENDENTE',
      criadoEm: new Date().toISOString(),
    };
    setAtestados((prev) => [newAtestado, ...prev]);
    logAction('ATESTADO_ENVIADO', 'atestados', `Atestado médico enviado por ${currentUser.nome} (${dados.diasAfastamento} dias).`, newAtestado.id);
  };

  const avaliarAtestado = (atestadoId: string, status: 'APROVADO' | 'RECUSADO', motivoRecusa?: string) => {
    setAtestados((prev) =>
      prev.map((a) => {
        if (a.id === atestadoId) {
          return {
            ...a,
            status,
            motivoRecusa: status === 'RECUSADO' ? motivoRecusa : undefined,
            avaliadoPor: currentUser?.id,
            avaliadoEm: new Date().toISOString(),
          };
        }
        return a;
      })
    );

    // If approved, automatically create a Falta justificada
    const targetAtestado = atestados.find((a) => a.id === atestadoId);
    if (status === 'APROVADO' && targetAtestado) {
      const novaFalta: Falta = {
        id: `flt-${Date.now()}`,
        empresaId: targetAtestado.empresaId,
        usuarioId: targetAtestado.usuarioId,
        dataFalta: targetAtestado.dataInicio,
        justificada: true,
        motivo: `Afastamento médico abonado pelo DP (CID: ${targetAtestado.cid || 'N/I'}, ${targetAtestado.diasAfastamento} dias)`,
        lancadoPor: currentUser?.id,
        criadoEm: new Date().toISOString(),
      };
      setFaltas((prev) => [novaFalta, ...prev]);
    }

    logAction(
      'ATESTADO_AVALIADO',
      'atestados',
      `Atestado ${atestadoId} foi ${status === 'APROVADO' ? 'APROVADO' : 'RECUSADO'}${
        motivoRecusa ? `: ${motivoRecusa}` : ''
      }.`,
      atestadoId
    );
  };

  const lancarFalta = (usuarioId: string, dataFalta: string, justificada: boolean, motivo: string) => {
    const novaFalta: Falta = {
      id: `flt-${Date.now()}`,
      empresaId: selectedEmpresaId,
      usuarioId,
      dataFalta,
      justificada,
      motivo,
      lancadoPor: currentUser?.id,
      criadoEm: new Date().toISOString(),
    };
    setFaltas((prev) => [novaFalta, ...prev]);
    const targetUser = usuarios.find((u) => u.id === usuarioId);
    logAction(
      'FALTA_LANCADA',
      'faltas',
      `Falta ${justificada ? 'justificada' : 'injustificada'} lançada para ${targetUser?.nome || usuarioId} na data ${dataFalta}.`,
      novaFalta.id
    );
  };

  const resetToDefaults = () => {
    setEmpresas(INITIAL_EMPRESAS);
    setSelectedEmpresaIdState(INITIAL_EMPRESAS[0].id);
    setParametros(INITIAL_PARAMETROS);
    setUsuarios(INITIAL_USUARIOS);
    setCurrentUserState(INITIAL_USUARIOS[0]);
    setDadosCadastrais(INITIAL_DADOS_CADASTRAIS);
    setDocumentos(INITIAL_DOCUMENTOS);
    setHolerites(INITIAL_HOLERITES);
    setFolhasPonto(INITIAL_FOLHAS_PONTO);
    setAtestados(INITIAL_ATESTADOS);
    setFaltas(INITIAL_FALTAS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        empresas,
        selectedEmpresaId,
        currentEmpresa,
        setSelectedEmpresaId,
        updateEmpresa,
        createEmpresa,

        parametros,
        currentParametros,
        updateParametros,

        usuarios,
        currentUser,
        setCurrentUser,
        switchUser,
        login,
        logout,
        cadastrarUsuario,

        dadosCadastrais,
        documentos,
        saveDadosCadastrais,
        uploadDocumento,
        removerDocumento,
        aprovarAdmissao,
        solicitarCorrecaoAdmissao,

        holerites,
        folhasPonto,
        atestados,
        faltas,
        adicionarHolerite,
        gerarHoleritesEmLote,
        gerarFolhasPontoEmLote,
        enviarAtestado,
        avaliarAtestado,
        lancarFalta,

        auditLogs,
        logAction,

        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};
