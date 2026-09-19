import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateTimeBR } from '../lib/formatters';
import {
  Database,
  ShieldAlert,
  Search,
  Code2,
  Copy,
  Check,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export const DatabaseAuditView: React.FC = () => {
  const { currentEmpresa, auditLogs } = useApp();

  const [activeTab, setActiveTab] = useState<'AUDIT' | 'SQL_SCHEMA' | 'PRISMA'>('AUDIT');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('TODOS');
  const [copied, setCopied] = useState(false);

  // Filter logs for this empresa (or global)
  const filteredLogs = auditLogs.filter((log) => {
    const matchEmpresa = !log.empresaId || log.empresaId === currentEmpresa.id;
    if (!matchEmpresa) return false;

    if (actionFilter !== 'TODOS' && log.acao !== actionFilter) {
      return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchAcao = log.acao.toLowerCase().includes(term);
      const matchDetalhes = log.detalhes?.toLowerCase().includes(term);
      const matchUsuario = log.usuarioNome?.toLowerCase().includes(term);
      return matchAcao || matchDetalhes || matchUsuario;
    }

    return true;
  });

  const sqlSchemaText = `-- =========================================================================
-- PLATAFORMA GESTÃO INTEGRADA RH - ESQUEMA RELACIONAL MULTI-TENANT (POSTGRESQL)
-- =========================================================================

-- 1. TABELA DE EMPRESAS (TENANTS)
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(50),
    inscricao_municipal VARCHAR(50),
    cnae_principal VARCHAR(20),
    responsavel_nome VARCHAR(255) NOT NULL,
    responsavel_cpf VARCHAR(14) NOT NULL,
    responsavel_email VARCHAR(255) NOT NULL,
    responsavel_cargo VARCHAR(100),
    responsavel_celular VARCHAR(20),
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    logo_url TEXT,
    cor_primaria VARCHAR(7) DEFAULT '#0A5B7A',
    cor_secundaria VARCHAR(7) DEFAULT '#F5B800',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE PARAMETRIZAÇÃO DE BENEFÍCIOS E REGRAS CLT (1:1 com empresas)
CREATE TABLE parametros_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    vt_desconto_percentual DECIMAL(5,2) DEFAULT 6.00,
    vt_teto_maximo DECIMAL(10,2),
    vr_va_valor_diario DECIMAL(10,2) DEFAULT 35.00,
    vr_va_coparticipacao_percentual DECIMAL(5,2) DEFAULT 15.00,
    vr_va_coparticipacao_fixa DECIMAL(10,2) DEFAULT 0.00,
    plano_saude_modelo VARCHAR(30) DEFAULT 'VALOR_FIXO', -- VALOR_FIXO, PERCENTUAL, COPARTICIPACAO
    plano_saude_valor_titular DECIMAL(10,2) DEFAULT 120.00,
    plano_saude_valor_dependente DECIMAL(10,2) DEFAULT 160.00,
    beneficios_customizados JSONB DEFAULT '[]'::jsonb,
    desconto_sindical_ativo BOOLEAN DEFAULT FALSE,
    sindicato_tipo_calculo VARCHAR(20) DEFAULT 'PERCENTUAL',
    sindicato_valor_ou_percentual DECIMAL(10,2) DEFAULT 1.00,
    sindicato_mes_aplicacao INT DEFAULT 3,
    tolerancia_ponto_minutos INT DEFAULT 10,
    hora_extra_percentual_semana DECIMAL(5,2) DEFAULT 50.00,
    hora_extra_percentual_dom_feriado DECIMAL(5,2) DEFAULT 100.00,
    banco_horas_ativo BOOLEAN DEFAULT FALSE,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_parametros_empresa UNIQUE (empresa_id)
);

-- 3. TABELA DE USUÁRIOS E RBAC
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('RH_ADMIN', 'FUNCIONARIO', 'CANDIDATO')),
    cargo VARCHAR(100),
    departamento VARCHAR(100),
    salario_base DECIMAL(10,2) DEFAULT 0.00,
    data_admissao DATE,
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_usuario_empresa_email UNIQUE (empresa_id, email)
);

-- 4. TABELA DE DADOS CADASTRAIS (eSocial + LGPD)
CREATE TABLE dados_cadastrais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    cpf VARCHAR(14) NOT NULL,
    pis_pasep VARCHAR(20),
    data_nascimento DATE,
    estado_civil VARCHAR(50),
    nome_mae VARCHAR(255),
    telefone VARCHAR(20),
    cep VARCHAR(9),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf CHAR(2),
    banco VARCHAR(100),
    tipo_conta VARCHAR(30),
    agencia VARCHAR(20),
    conta VARCHAR(30),
    chave_pix VARCHAR(100),
    lgpd_aceito BOOLEAN DEFAULT FALSE,
    lgpd_aceito_em TIMESTAMP WITH TIME ZONE,
    lgpd_ip_hash VARCHAR(255),
    status_admissao VARCHAR(30) DEFAULT 'PENDENTE',
    observacao_rh TEXT,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_dados_usuario UNIQUE (usuario_id)
);

-- 5. ÍNDICES DE DESEMPENHO E ISOLAMENTO MULTI-TENANT
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_dados_cadastrais_empresa ON dados_cadastrais(empresa_id);
CREATE INDEX idx_holerites_empresa_mes_ano ON holerites(empresa_id, ano, mes);
CREATE INDEX idx_audit_empresa_data ON audit_logs(empresa_id, criado_em DESC);`;

  const prismaSchemaText = `// =========================================================================
// PRISMA SCHEMA - GESTÃO INTEGRADA RH MULTI-TENANT
// =========================================================================

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum PerfilUsuario {
  RH_ADMIN
  FUNCIONARIO
  CANDIDATO
}

enum StatusAdmissao {
  PENDENTE
  EM_ANALISE
  APROVADO
  REJEITADO
}

model Empresa {
  id                  String             @id @default(uuid())
  razaoSocial         String
  nomeFantasia        String
  cnpj                String             @unique
  inscricaoEstadual   String?
  inscricaoMunicipal  String?
  cnaePrincipal       String?
  responsavelNome     String
  responsavelCpf      String
  responsavelEmail    String
  responsavelCargo    String?
  responsavelCelular  String?
  cep                 String
  logradouro          String
  numero              String
  complemento         String?
  bairro              String
  cidade              String
  uf                  String             @db.Char(2)
  logoUrl             String?
  corPrimaria         String?            @default("#0A5B7A")
  corSecundaria       String?            @default("#F5B800")
  criadoEm            DateTime           @default(now())
  atualizadoEm        DateTime           @updatedAt

  parametros          ParametrosEmpresa?
  usuarios            Usuario[]
  holerites           Holerite[]
  folhasPonto         FolhaPonto[]
  atestados           Atestado[]
  faltas              Falta[]
  auditLogs           AuditLog[]

  @@map("empresas")
}

model ParametrosEmpresa {
  id                             String   @id @default(uuid())
  empresaId                      String   @unique
  empresa                        Empresa  @relation(fields: [empresaId], references: [id], onDelete: Cascade)
  vtDescontoPercentual           Decimal  @default(6.00) @db.Decimal(5, 2)
  vtTetoMaximo                   Decimal? @db.Decimal(10, 2)
  vrVaValorDiario                Decimal  @default(35.00) @db.Decimal(10, 2)
  vrVaCoparticipacaoPercentual   Decimal  @default(15.00) @db.Decimal(5, 2)
  vrVaCoparticipacaoFixa         Decimal  @default(0.00) @db.Decimal(10, 2)
  planoSaudeModelo               String   @default("VALOR_FIXO")
  planoSaudeValorTitular         Decimal  @default(120.00) @db.Decimal(10, 2)
  planoSaudeValorDependente      Decimal  @default(160.00) @db.Decimal(10, 2)
  beneficiosCustomizados         Json     @default("[]")
  descontoSindicalAtivo          Boolean  @default(false)
  sindicatoTipoCalculo           String   @default("PERCENTUAL")
  sindicatoValorOuPercentual     Decimal  @default(1.00) @db.Decimal(10, 2)
  sindicatoMesAplicacao          Int      @default(3)
  toleranciaPontoMinutos         Int      @default(10)
  horaExtraPercentualSemana      Decimal  @default(50.00) @db.Decimal(5, 2)
  horaExtraPercentualDomFeriado  Decimal  @default(100.00) @db.Decimal(5, 2)
  bancoHorasAtivo                Boolean  @default(false)
  atualizadoEm                   DateTime @updatedAt

  @@map("parametros_empresa")
}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Database className="w-6 h-6 text-[#0A5B7A]" />
            <span>Banco de Dados & Logs de Auditoria</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Arquitetura de dados relacional com isolamento multi-tenant por{' '}
            <code className="text-[#0A5B7A] font-bold">empresa_id</code> e rastreabilidade total.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'AUDIT'
              ? 'border-[#0A5B7A] text-[#0A5B7A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Logs de Auditoria ({filteredLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SQL_SCHEMA')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'SQL_SCHEMA'
              ? 'border-[#0A5B7A] text-[#0A5B7A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Esquema SQL PostgreSQL</span>
        </button>

        <button
          onClick={() => setActiveTab('PRISMA')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'PRISMA'
              ? 'border-[#0A5B7A] text-[#0A5B7A]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Schema Prisma ORM</span>
        </button>
      </div>

      {/* Tab: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por ação, usuário ou detalhes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A5B7A]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                'TODOS',
                'LOGIN',
                'UPDATE_PARAMETROS',
                'APROVAR_ADMISSAO',
                'GERAR_HOLERITE',
                'ACEITAR_LGPD',
              ].map((act) => (
                <button
                  key={act}
                  onClick={() => setActionFilter(act)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    actionFilter === act
                      ? 'bg-[#0A5B7A] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Nenhum registro de auditoria encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-3 px-4">Data e Hora</th>
                      <th className="py-3 px-3">Ação</th>
                      <th className="py-3 px-4">Usuário</th>
                      <th className="py-3 px-4">Detalhes da Ocorrência</th>
                      <th className="py-3 px-3 font-mono">IP / Origem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {formatDateTimeBR(log.criadoEm)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="bg-[#0A5B7A]/10 text-[#0A5B7A] font-extrabold text-[10px] px-2 py-0.5 rounded font-mono">
                            {log.acao}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {log.usuarioNome || 'Sistema'}
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-md">{log.detalhes}</td>
                        <td className="py-3 px-3 font-mono text-slate-400 text-[10px]">
                          {log.ip || '127.0.0.1'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: SQL SCHEMA */}
      {activeTab === 'SQL_SCHEMA' && (
        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 text-slate-200 relative font-mono text-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <span className="text-slate-400">schema_postgresql.sql (Multi-Tenant Relational)</span>
            <button
              onClick={() => handleCopy(sqlSchemaText)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar SQL'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto p-2 leading-relaxed text-emerald-400 max-h-[500px]">
            {sqlSchemaText}
          </pre>
        </div>
      )}

      {/* Tab: PRISMA SCHEMA */}
      {activeTab === 'PRISMA' && (
        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 text-slate-200 relative font-mono text-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <span className="text-slate-400">schema.prisma</span>
            <button
              onClick={() => handleCopy(prismaSchemaText)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Prisma'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto p-2 leading-relaxed text-amber-300 max-h-[500px]">
            {prismaSchemaText}
          </pre>
        </div>
      )}
    </div>
  );
};
