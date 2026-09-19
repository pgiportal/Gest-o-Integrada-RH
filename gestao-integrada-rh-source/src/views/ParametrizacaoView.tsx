import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../lib/formatters';
import { BeneficioCustomizado, ModeloDescontoSaude, TipoCalculoSindicato } from '../types';
import {
  Award,
  Save,
  Plus,
  Trash2,
  Clock,
  HeartPulse,
  Bus,
  Utensils,
  Landmark,
  CheckCircle2,
} from 'lucide-react';

export const ParametrizacaoView: React.FC = () => {
  const { currentEmpresa, currentParametros, updateParametros } = useApp();

  // Local form state
  const [vtPercentual, setVtPercentual] = useState<number>(currentParametros.vtDescontoPercentual || 6.0);
  const [vtTeto, setVtTeto] = useState<number>(currentParametros.vtTetoMaximo || 0);

  const [vrValorDiario, setVrValorDiario] = useState<number>(currentParametros.vrVaValorDiario || 35.0);
  const [vrCopartPercentual, setVrCopartPercentual] = useState<number>(currentParametros.vrVaCoparticipacaoPercentual || 15.0);
  const [vrCopartFixa, setVrCopartFixa] = useState<number>(currentParametros.vrVaCoparticipacaoFixa || 0);

  const [planoSaudeModelo, setPlanoSaudeModelo] = useState<ModeloDescontoSaude>(currentParametros.planoSaudeModelo || 'VALOR_FIXO');
  const [planoSaudeTitular, setPlanoSaudeTitular] = useState<number>(currentParametros.planoSaudeValorTitular || 120.0);
  const [planoSaudeDependente, setPlanoSaudeDependente] = useState<number>(currentParametros.planoSaudeValorDependente || 160.0);

  const [descontoSindicalAtivo, setDescontoSindicalAtivo] = useState<boolean>(currentParametros.descontoSindicalAtivo || false);
  const [sindicatoTipo, setSindicatoTipo] = useState<TipoCalculoSindicato>(currentParametros.sindicatoTipoCalculo || 'PERCENTUAL');
  const [sindicatoValor, setSindicatoValor] = useState<number>(currentParametros.sindicatoValorOuPercentual || 1.0);
  const [sindicatoMes, setSindicatoMes] = useState<number>(currentParametros.sindicatoMesAplicacao || 3);

  const [toleranciaMinutos, setToleranciaMinutos] = useState<number>(currentParametros.toleranciaPontoMinutos || 10);
  const [horaExtraSemana, setHoraExtraSemana] = useState<number>(currentParametros.horaExtraPercentualSemana || 50.0);
  const [horaExtraFeriado, setHoraExtraFeriado] = useState<number>(currentParametros.horaExtraPercentualDomFeriado || 100.0);
  const [bancoHorasAtivo, setBancoHorasAtivo] = useState<boolean>(currentParametros.bancoHorasAtivo || false);

  // Custom benefits list
  const [beneficiosCustom, setBeneficiosCustom] = useState<BeneficioCustomizado[]>(
    currentParametros.beneficiosCustomizados || []
  );

  const [novoBenNome, setNovoBenNome] = useState('');
  const [novoBenValor, setNovoBenValor] = useState<number>(100);
  const [novoBenDesc, setNovoBenDesc] = useState<number>(20);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddBeneficio = () => {
    if (!novoBenNome.trim()) return;
    const novo: BeneficioCustomizado = {
      id: `ben-${Date.now()}`,
      nome: novoBenNome.trim(),
      valorBeneficio: novoBenValor,
      descontoColaborador: novoBenDesc,
    };
    setBeneficiosCustom([...beneficiosCustom, novo]);
    setNovoBenNome('');
    setNovoBenValor(100);
    setNovoBenDesc(20);
  };

  const handleRemoveBeneficio = (id: string) => {
    setBeneficiosCustom(beneficiosCustom.filter((b) => b.id !== id));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    updateParametros({
      vtDescontoPercentual: vtPercentual,
      vtTetoMaximo: vtTeto > 0 ? vtTeto : undefined,
      vrVaValorDiario: vrValorDiario,
      vrVaCoparticipacaoPercentual: vrCopartPercentual,
      vrVaCoparticipacaoFixa: vrCopartFixa,
      planoSaudeModelo,
      planoSaudeValorTitular: planoSaudeTitular,
      planoSaudeValorDependente: planoSaudeDependente,
      beneficiosCustomizados: beneficiosCustom,
      descontoSindicalAtivo,
      sindicatoTipoCalculo: sindicatoTipo,
      sindicatoValorOuPercentual: sindicatoValor,
      sindicatoMesAplicacao: sindicatoMes,
      toleranciaPontoMinutos: toleranciaMinutos,
      horaExtraPercentualSemana: horaExtraSemana,
      horaExtraPercentualDomFeriado: horaExtraFeriado,
      bancoHorasAtivo,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Award className="w-6 h-6 text-[#0A5B7A]" />
            <span>Parametrização de Benefícios & Regras CLT</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure as regras de cálculo automáticas da folha e jornada para a empresa{' '}
            <strong className="text-slate-800">{currentEmpresa.nomeFantasia}</strong>.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center space-x-2 px-5 py-2.5 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4 text-[#F5B800]" />
          <span>Salvar Parâmetros da Empresa</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Parâmetros empresariais atualizados com sucesso e aplicados à folha de pagamento!</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Section 1: Vale Transporte (VT) & Vale Refeição (VR/VA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card VT */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 text-[#0A5B7A] font-bold text-sm border-b border-slate-100 pb-3">
              <Bus className="w-5 h-5" />
              <span>Vale Transporte (VT)</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  % de Desconto Padrão CLT sobre Salário Base:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={vtPercentual}
                    onChange={(e) => setVtPercentual(parseFloat(e.target.value) || 0)}
                    className="w-24 p-2 rounded-lg border border-slate-300 font-mono font-bold text-center"
                  />
                  <span className="font-bold text-slate-600">% (Padrão legal CLT: 6.00%)</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Teto Máximo de Desconto (Opcional - R$):
                </label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={vtTeto}
                  onChange={(e) => setVtTeto(parseFloat(e.target.value) || 0)}
                  placeholder="0,00 para sem teto"
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Se preenchido, o desconto do colaborador nunca ultrapassará este teto mensal.
                </p>
              </div>
            </div>
          </div>

          {/* Card VR / VA */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 text-[#0A5B7A] font-bold text-sm border-b border-slate-100 pb-3">
              <Utensils className="w-5 h-5" />
              <span>Vale Refeição & Alimentação (VR / VA)</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Valor Diário Fornecido (R$):
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={vrValorDiario}
                    onChange={(e) => setVrValorDiario(parseFloat(e.target.value) || 0)}
                    className="w-28 p-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                  <span className="text-slate-400">/dia útil (base 22 dias = {formatCurrency(vrValorDiario * 22)})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Coparticipação (%):
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={vrCopartPercentual}
                    onChange={(e) => setVrCopartPercentual(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Coparticipação Fixa (R$):
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    value={vrCopartFixa}
                    onChange={(e) => setVrCopartFixa(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Plano de Saúde e Odontológico */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 text-[#0A5B7A] font-bold text-sm border-b border-slate-100 pb-3">
            <HeartPulse className="w-5 h-5" />
            <span>Assistência Médica & Plano Odontológico</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Modelo de Desconto:</label>
              <select
                value={planoSaudeModelo}
                onChange={(e) => setPlanoSaudeModelo(e.target.value as ModeloDescontoSaude)}
                className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800"
              >
                <option value="VALOR_FIXO">Valor Fixo Mensal</option>
                <option value="PERCENTUAL">Percentual sobre Salário</option>
                <option value="COPARTICIPACAO">Coparticipação por Uso</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Desconto Titular ({planoSaudeModelo === 'PERCENTUAL' ? '%' : 'R$'}):
              </label>
              <input
                type="number"
                step="5"
                min="0"
                value={planoSaudeTitular}
                onChange={(e) => setPlanoSaudeTitular(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Desconto por Dependente ({planoSaudeModelo === 'PERCENTUAL' ? '%' : 'R$'}):
              </label>
              <input
                type="number"
                step="5"
                min="0"
                value={planoSaudeDependente}
                onChange={(e) => setPlanoSaudeDependente(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Benefícios Customizados (JSON flexible) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5 text-[#0A5B7A] font-bold text-sm">
              <Award className="w-5 h-5 text-[#F5B800]" />
              <span>Benefícios Customizados & Auxílios Flexíveis</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Auxílio Creche, Seguro de Vida, Gympass, Home Office, etc.
            </span>
          </div>

          {/* New Custom Benefit Creator */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end text-xs">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Nome do Benefício</label>
              <input
                type="text"
                value={novoBenNome}
                onChange={(e) => setNovoBenNome(e.target.value)}
                placeholder="Ex: TotalPass / Academia"
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Valor Fornecido (R$)</label>
              <input
                type="number"
                value={novoBenValor}
                onChange={(e) => setNovoBenValor(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Desconto Colaborador (R$)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={novoBenDesc}
                  onChange={(e) => setNovoBenDesc(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddBeneficio}
                  className="p-2 bg-[#0A5B7A] hover:bg-[#084962] text-white rounded-lg flex-shrink-0 font-bold"
                  title="Adicionar Benefício"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Benefit Items List */}
          <div className="space-y-2">
            {beneficiosCustom.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-xs">
                Nenhum benefício customizado cadastrado.
              </div>
            ) : (
              beneficiosCustom.map((ben) => (
                <div
                  key={ben.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{ben.nome}</div>
                    <div className="text-[11px] text-slate-500">
                      Valor integral: <strong className="text-slate-800">{formatCurrency(ben.valorBeneficio)}</strong> • Desconto em folha:{' '}
                      <strong className="text-rose-700">{formatCurrency(ben.descontoColaborador)}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBeneficio(ben.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 4: Sindicato & Jornada de Ponto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sindicato */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 text-[#0A5B7A] font-bold text-sm border-b border-slate-100 pb-3">
              <Landmark className="w-5 h-5" />
              <span>Contribuição Sindical & Assistencial</span>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={descontoSindicalAtivo}
                  onChange={(e) => setDescontoSindicalAtivo(e.target.checked)}
                  className="w-4 h-4 text-[#0A5B7A] rounded"
                />
                <span>Habilitar Desconto Assistencial Sindical</span>
              </label>

              {descontoSindicalAtivo && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Tipo de Cálculo:</label>
                      <select
                        value={sindicatoTipo}
                        onChange={(e) => setSindicatoTipo(e.target.value as TipoCalculoSindicato)}
                        className="w-full p-2 rounded-lg border border-slate-300"
                      >
                        <option value="PERCENTUAL">Percentual (%)</option>
                        <option value="VALOR_FIXO">Valor Fixo (R$)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Valor ou Percentual:
                      </label>
                      <input
                        type="number"
                        value={sindicatoValor}
                        onChange={(e) => setSindicatoValor(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Mês de Aplicação / Cobrança:
                    </label>
                    <select
                      value={sindicatoMes}
                      onChange={(e) => setSindicatoMes(parseInt(e.target.value, 10))}
                      className="w-full p-2 rounded-lg border border-slate-300"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <option key={m} value={m}>
                          Mês {m} (Ex: Março)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ponto e Jornada */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 text-[#0A5B7A] font-bold text-sm border-b border-slate-100 pb-3">
              <Clock className="w-5 h-5" />
              <span>Ponto Eletrônico & Regras de Jornada</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tolerância Diária de Batida (Art. 58 § 1º CLT):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={toleranciaMinutos}
                    onChange={(e) => setToleranciaMinutos(parseInt(e.target.value, 10) || 0)}
                    className="w-20 p-2 rounded-lg border border-slate-300 font-mono font-bold text-center"
                  />
                  <span className="text-slate-600 font-medium">minutos (CLT padrão: 10 min)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    HE Dias Úteis (%):
                  </label>
                  <input
                    type="number"
                    value={horaExtraSemana}
                    onChange={(e) => setHoraExtraSemana(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    HE Domingos/Feriados (%):
                  </label>
                  <input
                    type="number"
                    value={horaExtraFeriado}
                    onChange={(e) => setHoraExtraFeriado(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800 pt-1">
                <input
                  type="checkbox"
                  checked={bancoHorasAtivo}
                  onChange={(e) => setBancoHorasAtivo(e.target.checked)}
                  className="w-4 h-4 text-[#0A5B7A] rounded"
                />
                <span>Habilitar Compensação por Banco de Horas</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer save */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <Save className="w-4 h-4 text-[#F5B800]" />
            <span>Salvar Todos os Parâmetros</span>
          </button>
        </div>
      </form>
    </div>
  );
};
