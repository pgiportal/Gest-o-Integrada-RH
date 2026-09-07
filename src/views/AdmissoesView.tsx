import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCPF, formatDateTimeBR } from '../lib/formatters';
import {
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  Plus,
} from 'lucide-react';

interface AdmissoesViewProps {
  onOpenAdmissaoModal: (candidatoId: string) => void;
}

export const AdmissoesView: React.FC<AdmissoesViewProps> = ({ onOpenAdmissaoModal }) => {
  const {
    currentEmpresa,
    usuarios,
    dadosCadastrais,
    documentos,
    cadastrarUsuario,
    aprovarAdmissao,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isNovoCandidatoOpen, setIsNovoCandidatoOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoCargo, setNovoCargo] = useState('');

  // Candidates in this empresa
  const candidatos = usuarios.filter(
    (u) => u.empresaId === currentEmpresa.id && (u.perfil === 'CANDIDATO' || u.perfil === 'FUNCIONARIO')
  );

  const filtered = candidatos.filter((c) => {
    const dc = dadosCadastrais.find((d) => d.usuarioId === c.id);
    const status = dc?.statusAdmissao || 'PENDENTE';

    if (filterStatus !== 'TODOS' && status !== filterStatus) {
      return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = c.nome.toLowerCase().includes(term);
      const matchEmail = c.email.toLowerCase().includes(term);
      const matchCpf = dc?.cpf?.includes(term);
      return matchName || matchEmail || matchCpf;
    }

    return true;
  });

  const handleCreateCandidato = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoEmail) return;

    cadastrarUsuario({
      nome: novoNome,
      email: novoEmail,
      perfil: 'CANDIDATO',
      empresaId: currentEmpresa.id,
    });

    setNovoNome('');
    setNovoEmail('');
    setNovoCargo('');
    setIsNovoCandidatoOpen(false);
    alert('Convite de admissão digital gerado! O candidato já pode acessar o formulário.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <UserPlus className="w-6 h-6 text-[#0A5B7A]" />
            <span>Triagem e Admissão Digital (eSocial + LGPD)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Conferência cadastral e documental de novos contratados antes da homologação na folha.
          </p>
        </div>

        <button
          onClick={() => setIsNovoCandidatoOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#F5B800]" />
          <span>Novo Processo Admissional</span>
        </button>
      </div>

      {/* New Candidate Modal */}
      {isNovoCandidatoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Iniciar Processo Admissional Digital
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cadastre os dados iniciais para liberar o link do Portal do Candidato.
            </p>

            <form onSubmit={handleCreateCandidato} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome Completo do Candidato</label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Gabriela Medeiros Castro"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0A5B7A]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">E-mail para Acesso</label>
                <input
                  type="email"
                  required
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="gabriela.castro@exemplo.com"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0A5B7A]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cargo a Ocupar</label>
                <input
                  type="text"
                  value={novoCargo}
                  onChange={(e) => setNovoCargo(e.target.value)}
                  placeholder="Ex: Coordenadora de Logística"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0A5B7A]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNovoCandidatoOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0A5B7A] text-white font-bold hover:bg-[#084962]"
                >
                  Criar e Gerar Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A5B7A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['TODOS', 'PENDENTE', 'EM_ANALISE', 'APROVADO', 'REJEITADO'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === st
                  ? 'bg-[#0A5B7A] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'TODOS'
                ? 'Todos'
                : st === 'PENDENTE'
                ? 'Pendentes'
                : st === 'EM_ANALISE'
                ? 'Em Análise'
                : st === 'APROVADO'
                ? 'Aprovados'
                : 'Rejeitados'}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Pipeline Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Nenhum candidato localizado com os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filtered.map((cand) => {
              const dc = dadosCadastrais.find((d) => d.usuarioId === cand.id);
              const candDocs = documentos.filter((d) => d.usuarioId === cand.id);
              const status = dc?.statusAdmissao || 'PENDENTE';

              return (
                <div
                  key={cand.id}
                  className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0A5B7A] font-black text-base flex items-center justify-center border border-teal-200 flex-shrink-0">
                      {cand.nome.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-900">{cand.nome}</h3>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            status === 'APROVADO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status === 'EM_ANALISE'
                              ? 'bg-amber-100 text-amber-900'
                              : status === 'REJEITADO'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {cand.cargo || 'Analista'} • {cand.email} • CPF: {dc?.cpf ? formatCPF(dc.cpf) : 'Não informado'}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center space-x-1">
                          <FileText className="w-3.5 h-3.5 text-[#0A5B7A]" />
                          <span>{candDocs.length} documento(s) anexado(s)</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <ShieldCheck
                            className={`w-3.5 h-3.5 ${
                              dc?.lgpdAceito ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          />
                          <span className={dc?.lgpdAceito ? 'text-emerald-700 font-semibold' : ''}>
                            {dc?.lgpdAceito ? 'Termo LGPD Aceito' : 'LGPD Pendente'}
                          </span>
                        </span>
                        {dc?.atualizadoEm && (
                          <span>Atualizado em: {formatDateTimeBR(dc.atualizadoEm)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end md:self-center">
                    <button
                      onClick={() => onOpenAdmissaoModal(cand.id)}
                      className="px-4 py-2 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#F5B800]" />
                      <span>Analisar Dossiê</span>
                    </button>
                    {status !== 'APROVADO' && (
                      <button
                        onClick={() => {
                          aprovarAdmissao(cand.id, 'Aprovado diretamente na triagem de RH.');
                          alert(`Admissão de ${cand.nome} aprovada com sucesso!`);
                        }}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl transition-colors border border-emerald-200"
                        title="Aprovar e promover diretamente a Colaborador"
                      >
                        Aprovar Direto
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
