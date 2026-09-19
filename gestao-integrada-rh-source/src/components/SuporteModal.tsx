import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Headphones,
  X,
  Mail,
  Clock,
  Send,
  Building2,
  CheckCircle2,
  Phone,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';

interface SuporteModalProps {
  onClose: () => void;
}

export const SuporteModal: React.FC<SuporteModalProps> = ({ onClose }) => {
  const { currentUser, currentEmpresa, logAction } = useApp();
  const [assunto, setAssunto] = useState('Dúvida Operacional');
  const [mensagem, setMensagem] = useState('');
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagem.trim()) return;

    setEnviando(true);
    setTimeout(() => {
      const generatedProtocolo = `TKT-${Date.now().toString().slice(-6)}`;
      setProtocolo(generatedProtocolo);
      setEnviando(false);
      logAction(
        'SUPORTE_CHAMADO_ABERTO',
        'suporte',
        `Chamado ${generatedProtocolo} aberto pelo usuário ${currentUser?.nome}: [${assunto}]`
      );
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#0A5B7A] text-white p-5 flex items-center justify-between border-b border-teal-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5B800] text-slate-900 flex items-center justify-center font-bold">
              <Headphones className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Central de Suporte Técnico & Atendimento
              </h2>
              <p className="text-xs text-teal-100/80">
                Desenvolvido e mantido por Portal Gestão Integrada (CNPJ: 52.769.818/0001-77)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-teal-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          {/* Institutional Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Provedor Oficial do SaaS</div>
              <div className="font-bold text-sm text-slate-900">Portal Gestão Integrada</div>
              <div className="font-mono text-slate-500 text-xs">CNPJ: 52.769.818/0001-77</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                SLA 99.8% Online
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-[#0A5B7A] border border-teal-200">
                v1.0.0
              </span>
            </div>
          </div>

          {/* Official Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-2 text-[#0A5B7A] font-bold mb-1">
                <Mail className="w-4 h-4" />
                <span>E-mail de Suporte Técnico</span>
              </div>
              <div className="font-mono text-xs font-semibold text-slate-800 select-all">
                suporte@portalgestaointegrada.com.br
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Tempo de resposta: até 2 horas para incidentes críticos de folha/admissão.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-2 text-[#0A5B7A] font-bold mb-1">
                <Clock className="w-4 h-4" />
                <span>Horário de Atendimento</span>
              </div>
              <div className="text-xs font-semibold text-slate-800">
                Segunda a Sexta: 08h às 18h (Brasília)
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Plantão 24/7 para infraestrutura de nuvem e monitoramento eSocial.
              </p>
            </div>
          </div>

          {/* Ticket Submission Form */}
          {protocolo ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-sm text-emerald-900">Chamado Registrado com Sucesso!</h3>
              <p className="text-xs text-emerald-700">
                Seu ticket foi encaminhado para a equipe técnica da <strong>Portal Gestão Integrada</strong>.
              </p>
              <div className="p-2.5 bg-white rounded-xl border border-emerald-200 inline-block font-mono text-sm font-extrabold text-[#0A5B7A]">
                Protocolo: {protocolo}
              </div>
              <p className="text-[11px] text-slate-500 pt-2">
                Uma notificação com a resposta será enviada para o seu e-mail cadastrado.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <FileQuestion className="w-4 h-4 text-[#0A5B7A]" />
                <span>Abrir Chamado Técnico Rápido</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Empresa Contratante</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentEmpresa.nomeFantasia} (${currentEmpresa.cnpj})`}
                    className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-xs font-medium cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Assunto / Categoria</label>
                  <select
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-semibold"
                  >
                    <option value="Dúvida Operacional">Dúvida Operacional (Uso Geral)</option>
                    <option value="Admissão & eSocial">Admissão & Qualificação eSocial</option>
                    <option value="Holerites & Folha">Geração de Holerites & Cálculos</option>
                    <option value="Ponto & Atestados">Controle de Ponto ou Atestados</option>
                    <option value="LGPD & Privacidade">Exercício de Direitos LGPD</option>
                    <option value="Problema Técnico">Incidente ou Erro de Sistema</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Descrição do Problema ou Dúvida</label>
                <textarea
                  rows={3}
                  required
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Descreva detalhadamente o ocorrido, telas envolvidas ou mensagem de erro..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={enviando || !mensagem.trim()}
                  className="px-4 py-2 bg-[#0A5B7A] hover:bg-[#084962] disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{enviando ? 'Enviando chamado...' : 'Enviar Chamado para Suporte'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-500 font-mono">
            Portal Gestão Integrada | CNPJ 52.769.818/0001-77
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
