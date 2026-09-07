import React, { useState } from 'react';
import { Usuario, DadosCadastrais, DocumentoAdmissao } from '../types';
import { formatCPF, formatCEP, formatPhone, formatDateTimeBR } from '../lib/formatters';
import {
  X,
  CheckCircle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  UserCheck,
  Building,
  CreditCard,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface TriagemAdmissaoModalProps {
  candidato: Usuario;
  dados: DadosCadastrais | undefined;
  documentos: DocumentoAdmissao[];
  onAprovar: (usuarioId: string, observacao?: string) => void;
  onSolicitarCorrecao: (usuarioId: string, observacao: string) => void;
  onClose: () => void;
}

export const TriagemAdmissaoModal: React.FC<TriagemAdmissaoModalProps> = ({
  candidato,
  dados,
  documentos,
  onAprovar,
  onSolicitarCorrecao,
  onClose,
}) => {
  const [observacao, setObservacao] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  const handleAprovar = () => {
    onAprovar(candidato.id, observacao || 'Admissão e documentação homologadas com sucesso.');
    onClose();
  };

  const handleSolicitarCorrecao = () => {
    if (!observacao.trim()) {
      alert('Por favor, informe a justificativa ou orientações para correção.');
      return;
    }
    onSolicitarCorrecao(candidato.id, observacao);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0A5B7A] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F5B800]">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold">Triagem de Admissão Digital (eSocial)</h2>
              <p className="text-xs text-teal-100">
                Candidato: <strong className="text-white">{candidato.nome}</strong> • {candidato.cargo || 'Novo Colaborador'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-teal-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {/* LGPD Compliance Audit Card */}
          <div className={`p-4 rounded-xl border ${dados?.lgpdAceito ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            <div className="flex items-start space-x-3">
              <ShieldCheck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${dados?.lgpdAceito ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div className="text-xs">
                <div className="font-bold text-sm">
                  {dados?.lgpdAceito ? 'Conformidade LGPD (Lei 13.709/2018) Registrada' : 'Termo LGPD Pendente'}
                </div>
                <p className="mt-1 text-slate-600">
                  {dados?.lgpdAceito
                    ? `Consentimento digital aceito em ${formatDateTimeBR(dados.lgpdAceitoEm)}.`
                    : 'O candidato ainda não formalizou o aceite do termo de tratamento de dados.'}
                </p>
                {dados?.lgpdIpHash && (
                  <div className="mt-1 font-mono text-[10px] text-slate-500 bg-white/70 p-1.5 rounded border border-slate-200">
                    Hash de Autenticidade: {dados.lgpdIpHash}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Dados Pessoais */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-[#0A5B7A]" />
              <span>Dados Pessoais & eSocial</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Nome Completo</span>
                <span className="font-bold text-slate-800">{candidato.nome}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">CPF</span>
                <span className="font-bold font-mono text-slate-800">{dados?.cpf ? formatCPF(dados.cpf) : 'Não informado'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">PIS / PASEP</span>
                <span className="font-mono text-slate-800">{dados?.pisPasep || 'Primeiro emprego / A gerar'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Data de Nascimento</span>
                <span className="font-semibold text-slate-800">{dados?.dataNascimento || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Estado Civil</span>
                <span className="text-slate-800">{dados?.estadoCivil || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Nome da Mãe</span>
                <span className="text-slate-800">{dados?.nomeMae || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Telefone / WhatsApp</span>
                <span className="text-slate-800">{dados?.telefone ? formatPhone(dados.telefone) : '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">E-mail Cadastrado</span>
                <span className="text-slate-800 truncate">{candidato.email}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Endereço Residencial */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#0A5B7A]" />
              <span>Endereço Residencial</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">Logradouro e Número</span>
                <span className="font-semibold text-slate-800">
                  {dados?.logradouro ? `${dados.logradouro}, nº ${dados.numero}` : 'Não informado'}
                  {dados?.complemento ? ` (${dados.complemento})` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Bairro</span>
                <span className="text-slate-800">{dados?.bairro || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">CEP / Cidade</span>
                <span className="text-slate-800">
                  {dados?.cep ? formatCEP(dados.cep) : '-'} - {dados?.cidade}/{dados?.uf}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Dados Bancários */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[#0A5B7A]" />
              <span>Dados Bancários para Folha de Pagamento</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Instituição Bancária</span>
                <span className="font-semibold text-slate-800">{dados?.banco || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Tipo de Conta</span>
                <span className="text-slate-800">{dados?.tipoConta || 'Conta Corrente'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Agência e Conta</span>
                <span className="font-mono font-bold text-slate-800">
                  Ag: {dados?.agencia || '-'} / CC: {dados?.conta || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Chave PIX</span>
                <span className="font-mono text-slate-800">{dados?.chavePix || '-'}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Documentos Anexados */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#0A5B7A]" />
                <span>Documentos Comprobatórios ({documentos.length})</span>
              </span>
              <span className="text-[11px] font-normal text-slate-500">
                Clique para visualizar o arquivo
              </span>
            </h3>

            {documentos.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Nenhum documento anexado ainda por este candidato.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documentos.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-[#0A5B7A] bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <FileText className="w-5 h-5 text-[#0A5B7A] flex-shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-800 truncate">
                          {doc.nomeArquivo}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {doc.tipoDocumento} • {doc.tamanhoKb || 300} KB
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <button
                        onClick={() => setPreviewDocUrl(doc.urlArquivo)}
                        className="px-2 py-1 text-[11px] font-semibold text-[#0A5B7A] hover:bg-slate-200 rounded flex items-center space-x-1"
                      >
                        <span>Ver</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          doc.status === 'APROVADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Preview Drawer/Modal if active */}
          {previewDocUrl && (
            <div className="p-4 rounded-xl border border-slate-300 bg-slate-900/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Prévia do Arquivo</span>
                <button
                  onClick={() => setPreviewDocUrl(null)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Fechar Prévia ✕
                </button>
              </div>
              <div className="h-64 rounded-lg bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300">
                <img
                  src={previewDocUrl}
                  alt="Prévia de Documento"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Observations / Correction Input */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Parecer do Departamento Pessoal / Observações para o Candidato:
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Documentação conferida e apta para registro eSocial. Bem-vindo(a) à equipe!"
              rows={2}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A5B7A]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Fechar
          </button>

          <div className="flex items-center space-x-3">
            {!isRejecting ? (
              <button
                onClick={() => setIsRejecting(true)}
                className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
              >
                Solicitar Correção...
              </button>
            ) : (
              <button
                onClick={handleSolicitarCorrecao}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Confirmar Solicitação de Correção
              </button>
            )}

            <button
              onClick={handleAprovar}
              className="flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-[#0A5B7A] hover:bg-[#084962] rounded-lg shadow-sm transition-all"
            >
              <CheckCircle className="w-4 h-4 text-[#F5B800]" />
              <span>Aprovar Admissão & Promover a Colaborador</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
