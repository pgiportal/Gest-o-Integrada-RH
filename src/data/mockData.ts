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
} from '../types';

export const INITIAL_EMPRESAS: Empresa[] = [
  {
    id: 'emp-techinova-01',
    razaoSocial: 'TechInova Soluções Digitais Ltda',
    nomeFantasia: 'TechInova Softwares',
    cnpj: '12.345.678/0001-90',
    inscricaoEstadual: '123.456.789.110',
    inscricaoMunicipal: '9876543-2',
    cnaePrincipal: '6201-5/01 - Desenvolvimento de softwares',
    responsavelNome: 'Ana Carolina Mendes',
    responsavelCpf: '123.456.789-00',
    responsavelEmail: 'ana.rh@techinova.com.br',
    responsavelCargo: 'Gerente de Recursos Humanos & DP',
    responsavelCelular: '(11) 98765-4321',
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    numero: '1578',
    complemento: '14º Andar - Sala 1402',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    logoUrl: '',
    corPrimaria: '#0A5B7A',
    corSecundaria: '#F5B800',
    criadoEm: '2026-01-10T08:00:00.000Z',
    atualizadoEm: '2026-01-10T08:00:00.000Z',
  },
];

export const INITIAL_PARAMETROS: ParametrosEmpresa[] = [
  {
    id: 'param-techinova-01',
    empresaId: 'emp-techinova-01',
    vtDescontoPercentual: 6.0,
    vrVaValorDiario: 35.0,
    vrVaCoparticipacaoPercentual: 0.0,
    vrVaCoparticipacaoFixa: 0.0,
    planoSaudeModelo: 'VALOR_FIXO',
    planoSaudeValorTitular: 0.0,
    planoSaudeValorDependente: 0.0,
    beneficiosCustomizados: [],
    descontoSindicalAtivo: false,
    sindicatoTipoCalculo: 'PERCENTUAL',
    sindicatoValorOuPercentual: 0.0,
    toleranciaPontoMinutos: 10,
    horaExtraPercentualSemana: 50.0,
    horaExtraPercentualDomFeriado: 100.0,
    bancoHorasAtivo: false,
    atualizadoPor: 'usr-admin-01',
    atualizadoEm: '2026-01-10T08:00:00.000Z',
  },
];

export const INITIAL_USUARIOS: Usuario[] = [
  {
    id: 'usr-admin-01',
    empresaId: 'emp-techinova-01',
    nome: 'Ana Carolina Mendes',
    email: 'ana.rh@techinova.com.br',
    senhaHash: '',
    perfil: 'RH_ADMIN',
    ativo: true,
    cargo: 'Gerente de Gente & Gestão (RH)',
    departamento: 'Recursos Humanos',
    salarioBase: 0.0,
    dataAdmissao: '2026-01-10',
    fotoUrl: '',
    criadoEm: '2026-01-10T08:00:00.000Z',
    atualizadoEm: '2026-01-10T08:00:00.000Z',
  },
];

export const INITIAL_DADOS_CADASTRAIS: DadosCadastrais[] = [];

export const INITIAL_DOCUMENTOS: DocumentoAdmissao[] = [];

export const INITIAL_HOLERITES: Holerite[] = [];

export const INITIAL_FOLHAS_PONTO: FolhaPonto[] = [];

export const INITIAL_ATESTADOS: Atestado[] = [];

export const INITIAL_FALTAS: Falta[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
