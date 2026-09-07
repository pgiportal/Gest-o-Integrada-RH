import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatCPF } from '../lib/formatters';
import { Usuario } from '../types';
import {
  Users,
  Search,
  FileText,
  Clock,
  AlertCircle,
  Plus,
  Building,
  CheckCircle2,
} from 'lucide-react';

interface ColaboradoresViewProps {
  onViewHolerite: (holeriteId: string) => void;
  onViewPonto: (folhaPontoId: string) => void;
}

export const ColaboradoresView: React.FC<ColaboradoresViewProps> = ({
  onViewHolerite,
  onViewPonto,
}) => {
  const {
    currentEmpresa,
    usuarios,
    dadosCadastrais,
    holerites,
    folhasPonto,
    lancarFalta,
    gerarHoleritesEmLote,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColabForFalta, setSelectedColabForFalta] = useState<Usuario | null>(null);
  const [faltaData, setFaltaData] = useState(new Date().toISOString().split('T')[0]);
  const [faltaTipo, setFaltaTipo] = useState<'JUSTIFICADA' | 'INJUSTIFICADA'>('INJUSTIFICADA');
  const [faltaMotivo, setFaltaMotivo] = useState('');

  const colaboradores = usuarios.filter(
    (u) => u.empresaId === currentEmpresa.id && u.perfil === 'FUNCIONARIO'
  );

  const filtered = colaboradores.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchName = c.nome.toLowerCase().includes(term);
    const matchCargo = c.cargo?.toLowerCase().includes(term);
    const matchDepto = c.departamento?.toLowerCase().includes(term);
    return matchName || matchCargo || matchDepto;
  });

  const handleLancarFalta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColabForFalta) return;

    lancarFalta({
      usuarioId: selectedColabForFalta.id,
      data: faltaData,
      tipo: faltaTipo,
      motivo: faltaMotivo || (faltaTipo === 'JUSTIFICADA' ? 'Justificada pelo gestor' : 'Ausência não comunicada'),
      descontarDsr: faltaTipo === 'INJUSTIFICADA',
    });

    alert(`Falta registrada com sucesso para ${selectedColabForFalta.nome}!`);
    setSelectedColabForFalta(null);
    setFaltaMotivo('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-[#0A5B7A]" />
            <span>Gestão de Colaboradores & Quadro de Pessoal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualização dos colaboradores ativos da empresa{' '}
            <strong className="text-slate-800">{currentEmpresa.nomeFantasia}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const now = new Date();
              gerarHoleritesEmLote(now.getMonth() + 1, now.getFullYear());
              alert('Folha de pagamento calculada e gerada com sucesso para todos os colaboradores ativos!');
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <FileText className="w-4 h-4 text-[#F5B800]" />
            <span>Recalcular Folha Geral</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por colaborador, cargo ou departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A5B7A]"
          />
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Nenhum colaborador encontrado.
          </div>
        ) : (
          filtered.map((colab) => {
            const dc = dadosCadastrais.find((d) => d.usuarioId === colab.id);
            const userHolerites = holerites.filter((h) => h.usuarioId === colab.id);
            const latestHolerite = userHolerites[userHolerites.length - 1];

            const userPontos = folhasPonto.filter((p) => p.usuarioId === colab.id);
            const latestPonto = userPontos[userPontos.length - 1];

            return (
              <div
                key={colab.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-[#0A5B7A] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0A5B7A] font-black text-sm flex items-center justify-center border border-teal-200">
                        {colab.nome.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {colab.nome}
                        </h3>
                        <span className="text-[11px] text-slate-500 block">
                          {colab.cargo || 'Desenvolvedor'}
                        </span>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                      ATIVO
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Departamento:</span>
                      <span className="font-semibold text-slate-800">{colab.departamento || 'Geral'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Salário Base CLT:</span>
                      <span className="font-bold text-[#0A5B7A] font-mono">
                        {formatCurrency(colab.salarioBase || 5000)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Data de Admissão:</span>
                      <span className="font-medium text-slate-700">
                        {colab.dataAdmissao
                          ? new Date(colab.dataAdmissao).toLocaleDateString('pt-BR')
                          : '15/08/2024'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CPF:</span>
                      <span className="font-mono text-slate-700">
                        {dc?.cpf ? formatCPF(dc.cpf) : 'Cadastrado'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                  {latestHolerite ? (
                    <button
                      onClick={() => onViewHolerite(latestHolerite.id)}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-[#0A5B7A] hover:text-white text-slate-700 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center space-x-1"
                      title="Abrir Contracheque Atual"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Holerite</span>
                    </button>
                  ) : (
                    <div className="text-[10px] text-slate-400 flex items-center justify-center">
                      Sem holerite
                    </div>
                  )}

                  {latestPonto ? (
                    <button
                      onClick={() => onViewPonto(latestPonto.id)}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-[#0A5B7A] hover:text-white text-slate-700 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center space-x-1"
                      title="Abrir Espelho de Ponto"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Ponto</span>
                    </button>
                  ) : (
                    <div className="text-[10px] text-slate-400 flex items-center justify-center">
                      Sem ponto
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedColabForFalta(colab)}
                    className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center space-x-1 border border-rose-200"
                    title="Lançar Falta na Folha"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Lançar Falta</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Lançar Falta */}
      {selectedColabForFalta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Registrar Falta / Ausência
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Colaborador: <strong className="text-slate-800">{selectedColabForFalta.nome}</strong>
            </p>

            <form onSubmit={handleLancarFalta} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Data da Ausência</label>
                <input
                  type="date"
                  required
                  value={faltaData}
                  onChange={(e) => setFaltaData(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo da Falta</label>
                <select
                  value={faltaTipo}
                  onChange={(e) => setFaltaTipo(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-bold"
                >
                  <option value="INJUSTIFICADA">Injustificada (Com desconto em folha e DSR)</option>
                  <option value="JUSTIFICADA">Justificada (Abono / Sem desconto)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo / Descrição</label>
                <textarea
                  rows={2}
                  value={faltaMotivo}
                  onChange={(e) => setFaltaMotivo(e.target.value)}
                  placeholder="Ex: Não compareceu ao plantão; sem aviso prévio."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedColabForFalta(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
                >
                  Salvar Falta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
