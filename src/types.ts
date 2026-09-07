export type PerfilUsuario = 'CANDIDATO' | 'FUNCIONARIO' | 'RH_ADMIN';

export type StatusAdmissao = 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO';

export type StatusAtestado = 'PENDENTE' | 'APROVADO' | 'RECUSADO';

export type ModeloDescontoSaude = 'VALOR_FIXO' | 'PERCENTUAL' | 'COPARTICIPACAO';

export type TipoCalculoSindicato = 'PERCENTUAL' | 'VALOR_FIXO';

export interface BeneficioCustomizado {
  id: string;
  nome: string;
  valorBeneficio: number;
  descontoColaborador: number;
  descricao?: string;
}

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  cnaePrincipal?: string;
  
  // Responsável Legal / Admin
  responsavelNome: string;
  responsavelCpf: string;
  responsavelEmail: string;
  responsavelCargo?: string;
  responsavelCelular?: string;

  // Endereço da Sede
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;

  // Branding
  logoUrl?: string;
  corPrimaria: string;
  corSecundaria: string;

  criadoEm: string;
  atualizadoEm: string;
}

export interface ParametrosEmpresa {
  id: string;
  empresaId: string;

  // Vale Transporte (VT)
  vtDescontoPercentual: number;
  vtTetoMaximo?: number;

  // Vale Refeição / Alimentação (VR / VA)
  vrVaValorDiario: number;
  vrVaCoparticipacaoPercentual: number;
  vrVaCoparticipacaoFixa: number;

  // Plano de Saúde
  planoSaudeModelo: ModeloDescontoSaude;
  planoSaudeValorTitular: number;
  planoSaudeValorDependente: number;

  // Benefícios Customizados
  beneficiosCustomizados: BeneficioCustomizado[];

  // Sindicato
  descontoSindicalAtivo: boolean;
  sindicatoTipoCalculo: TipoCalculoSindicato;
  sindicatoValorOuPercentual: number;
  sindicatoMesAplicacao?: number;

  // Ponto e Jornada
  toleranciaPontoMinutos: number;
  horaExtraPercentualSemana: number;
  horaExtraPercentualDomFeriado: number;
  bancoHorasAtivo: boolean;

  atualizadoPor?: string;
  atualizadoEm: string;
}

export interface Usuario {
  id: string;
  empresaId: string;
  nome: string;
  email: string;
  senhaHash?: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  cargo?: string;
  departamento?: string;
  salarioBase?: number;
  dataAdmissao?: string;
  fotoUrl?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface DadosCadastrais {
  id: string;
  empresaId: string;
  usuarioId: string;
  cpf: string;
  pisPasep?: string;
  dataNascimento: string;
  estadoCivil: string;
  nomeMae: string;
  telefone: string;
  
  // Endereço
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;

  // Dados Bancários
  banco: string;
  tipoConta: string;
  agencia: string;
  conta: string;
  chavePix?: string;

  // LGPD & Status
  lgpdAceito: boolean;
  lgpdAceitoEm?: string;
  lgpdIpHash?: string;
  statusAdmissao: StatusAdmissao;
  observacaoRh?: string;

  criadoEm: string;
  atualizadoEm: string;
}

export interface DocumentoAdmissao {
  id: string;
  empresaId: string;
  usuarioId: string;
  tipoDocumento: 'RG_CNH' | 'COMPROVANTE_RESIDENCIA' | 'CTPS' | 'FOTO_3X4' | 'CERTIDAO_DEPENDENTE' | 'OUTROS';
  urlArquivo: string;
  nomeArquivo: string;
  tamanhoKb?: number;
  status: 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO';
  observacaoRh?: string;
  criadoEm: string;
}

export interface ItemHolerite {
  codigo: string;
  descricao: string;
  referencia: string;
  provento: number;
  desconto: number;
}

export interface Holerite {
  id: string;
  empresaId: string;
  usuarioId: string;
  mes: number;
  ano: number;
  salarioBase: number;
  totalVencimentos: number;
  totalDescontos: number;
  salarioLiquido: number;
  itens: ItemHolerite[];
  baseInss: number;
  baseFgts: number;
  fgtsDoMes: number;
  baseIrrf: number;
  urlArquivo?: string;
  nomeArquivo: string;
  enviadoPor?: string;
  criadoEm: string;
}

export interface RegistroPontoDia {
  data: string;
  diaSemana: string;
  entrada1: string;
  saida1: string;
  entrada2: string;
  saida2: string;
  totalHoras: string;
  horasExtras: string;
  atrasos: string;
  status: 'NORMAL' | 'FALTA' | 'ATESTADO' | 'DSR' | 'FERIADO';
}

export interface FolhaPonto {
  id: string;
  empresaId: string;
  usuarioId: string;
  mes: number;
  ano: number;
  totalHorasTrabalhadas: string;
  totalHorasExtras: string;
  totalAtrasos: string;
  saldoBancoHoras: string;
  registros: RegistroPontoDia[];
  urlArquivo?: string;
  nomeArquivo: string;
  enviadoPor?: string;
  criadoEm: string;
}

export interface Falta {
  id: string;
  empresaId: string;
  usuarioId: string;
  dataFalta: string;
  justificada: boolean;
  motivo?: string;
  lancadoPor?: string;
  criadoEm: string;
}

export interface Atestado {
  id: string;
  empresaId: string;
  usuarioId: string;
  dataInicio: string;
  diasAfastamento: number;
  cid?: string;
  urlArquivo: string;
  nomeArquivo: string;
  status: StatusAtestado;
  motivoRecusa?: string;
  avaliadoPor?: string;
  avaliadoEm?: string;
  criadoEm: string;
}

export interface AuditLog {
  id: string;
  empresaId: string;
  usuarioId: string;
  usuarioNome: string;
  acao: string;
  entidade: string;
  entidadeId?: string;
  detalhes: string;
  ipOrigem?: string;
  criadoEm: string;
}
