import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  formatCPF,
  formatCEP,
  formatPhone,
  fetchAddressByCep,
  formatDateTimeBR,
} from '../lib/formatters';
import {
  UserPlus,
  Save,
  CheckCircle2,
  MapPin,
  CreditCard,
  FileText,
  ShieldCheck,
  Upload,
  RefreshCw,
  AlertCircle,
  Clock,
  Building,
  Check,
} from 'lucide-react';

export const CandidatoAdmissaoView: React.FC = () => {
  const {
    currentUser,
    currentEmpresa,
    dadosCadastrais,
    documentos,
    salvarDadosCadastrais,
    aceitarTermoLGPD,
    uploadDocumento,
  } = useApp();

  const userDados = dadosCadastrais.find((d) => d.usuarioId === currentUser?.id);
  const userDocs = documentos.filter((d) => d.usuarioId === currentUser?.id);

  // Stepper: 1: Pessoais, 2: Endereço, 3: Bancários, 4: Documentos, 5: LGPD & Conclusão
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Pessoais
  const [cpf, setCpf] = useState(userDados?.cpf || '');
  const [pisPasep, setPisPasep] = useState(userDados?.pisPasep || '');
  const [dataNascimento, setDataNascimento] = useState(userDados?.dataNascimento || '');
  const [estadoCivil, setEstadoCivil] = useState(userDados?.estadoCivil || 'SOLTEIRO(A)');
  const [nomeMae, setNomeMae] = useState(userDados?.nomeMae || '');
  const [telefone, setTelefone] = useState(userDados?.telefone || '');

  // Step 2: Endereço
  const [cep, setCep] = useState(userDados?.cep || '');
  const [logradouro, setLogradouro] = useState(userDados?.logradouro || '');
  const [numero, setNumero] = useState(userDados?.numero || '');
  const [complemento, setComplemento] = useState(userDados?.complemento || '');
  const [bairro, setBairro] = useState(userDados?.bairro || '');
  const [cidade, setCidade] = useState(userDados?.cidade || '');
  const [uf, setUf] = useState(userDados?.uf || '');
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Step 3: Bancários
  const [banco, setBanco] = useState(userDados?.banco || 'Banco do Brasil');
  const [tipoConta, setTipoConta] = useState(userDados?.tipoConta || 'CORRENTE');
  const [agencia, setAgencia] = useState(userDados?.agencia || '');
  const [conta, setConta] = useState(userDados?.conta || '');
  const [chavePix, setChavePix] = useState(userDados?.chavePix || '');

  // Step 5: LGPD
  const [lgpdChecked, setLgpdChecked] = useState(userDados?.lgpdAceito || false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Sync state if userDados changes
  useEffect(() => {
    if (userDados) {
      if (userDados.cpf) setCpf(userDados.cpf);
      if (userDados.pisPasep) setPisPasep(userDados.pisPasep);
      if (userDados.dataNascimento) setDataNascimento(userDados.dataNascimento);
      if (userDados.estadoCivil) setEstadoCivil(userDados.estadoCivil);
      if (userDados.nomeMae) setNomeMae(userDados.nomeMae);
      if (userDados.telefone) setTelefone(userDados.telefone);
      if (userDados.cep) setCep(userDados.cep);
      if (userDados.logradouro) setLogradouro(userDados.logradouro);
      if (userDados.numero) setNumero(userDados.numero);
      if (userDados.complemento) setComplemento(userDados.complemento);
      if (userDados.bairro) setBairro(userDados.bairro);
      if (userDados.cidade) setCidade(userDados.cidade);
      if (userDados.uf) setUf(userDados.uf);
      if (userDados.banco) setBanco(userDados.banco);
      if (userDados.tipoConta) setTipoConta(userDados.tipoConta);
      if (userDados.agencia) setAgencia(userDados.agencia);
      if (userDados.conta) setConta(userDados.conta);
      if (userDados.chavePix) setChavePix(userDados.chavePix);
      setLgpdChecked(userDados.lgpdAceito);
    }
  }, [userDados]);

  const handleCepBlur = async () => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsLoadingCep(true);
      const res = await fetchAddressByCep(clean);
      setIsLoadingCep(false);
      if (res && !res.erro) {
        if (res.logradouro) setLogradouro(res.logradouro);
        if (res.bairro) setBairro(res.bairro);
        if (res.cidade) setCidade(res.cidade);
        if (res.uf) setUf(res.uf);
      }
    }
  };

  const handleSaveProgress = (novoStatus?: any) => {
    if (!currentUser) return;
    salvarDadosCadastrais({
      usuarioId: currentUser.id,
      cpf,
      pisPasep,
      dataNascimento,
      estadoCivil,
      nomeMae,
      telefone,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      banco,
      tipoConta,
      agencia,
      conta,
      chavePix,
      statusAdmissao: novoStatus || userDados?.statusAdmissao || 'EM_ANALISE',
    });

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleFileUpload = (
    tipoDocumento: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = () => {
      uploadDocumento({
        usuarioId: currentUser.id,
        tipoDocumento: tipoDocumento as any,
        nomeArquivo: file.name,
        urlArquivo: reader.result as string,
        tamanhoKb: Math.round(file.size / 1024),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFinalSubmit = () => {
    if (!lgpdChecked) {
      alert('É obrigatório ler e aceitar os Termos de Privacidade e Proteção de Dados (LGPD) para prosseguir.');
      return;
    }

    if (currentUser) {
      aceitarTermoLGPD(currentUser.id);
      handleSaveProgress('EM_ANALISE');
      alert('Parabéns! Dossiê de admissão digital e comprovantes enviados com sucesso ao Departamento Pessoal!');
    }
  };

  const status = userDados?.statusAdmissao || 'PENDENTE';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Welcome & Status Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0A5B7A] flex items-center justify-center border border-teal-200 font-black text-lg">
              {currentUser?.nome.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-slate-900">
                  Olá, {currentUser?.nome}!
                </h1>
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
                  {status === 'APROVADO'
                    ? 'ADMISSÃO APROVADA'
                    : status === 'EM_ANALISE'
                    ? 'EM ANÁLISE PELO RH'
                    : status === 'REJEITADO'
                    ? 'CORREÇÃO SOLICITADA'
                    : 'AGUARDANDO ENVIO'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Processo de Admissão Digital eSocial • {currentEmpresa.nomeFantasia}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleSaveProgress()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-200 self-start md:self-auto"
          >
            <Save className="w-4 h-4 text-[#0A5B7A]" />
            <span>Salvar Rascunho</span>
          </button>
        </div>

        {userDados?.observacaoRh && (
          <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block">Mensagem do Departamento Pessoal:</strong>
              <p className="mt-0.5">{userDados.observacaoRh}</p>
            </div>
          </div>
        )}
      </div>

      {showSavedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Informações salvas com sucesso! Você pode continuar a qualquer momento.</span>
        </div>
      )}

      {/* Stepper Navigation */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs">
        {[
          { step: 1, label: '1. Pessoais' },
          { step: 2, label: '2. Endereço' },
          { step: 3, label: '3. Bancários' },
          { step: 4, label: '4. Documentos' },
          { step: 5, label: '5. LGPD & Envio' },
        ].map((item) => (
          <button
            key={item.step}
            onClick={() => {
              handleSaveProgress();
              setCurrentStep(item.step);
            }}
            className={`p-3 rounded-xl font-bold transition-all border ${
              currentStep === item.step
                ? 'bg-[#0A5B7A] text-white border-[#0A5B7A] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="truncate">{item.label}</div>
          </button>
        ))}
      </div>

      {/* STEP 1: DADOS PESSOAIS */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Etapa 1: Dados Pessoais e Qualificação eSocial</h2>
            <p className="text-xs text-slate-500">
              Campos exigidos para registro no Ministério do Trabalho e Previdência Social.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nome Completo</label>
              <input
                type="text"
                disabled
                value={currentUser?.nome || ''}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">E-mail Cadastrado</label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">CPF (com máscara 000.000.000-00) *</label>
              <input
                type="text"
                required
                maxLength={14}
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-[#0A5B7A]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Número PIS / PASEP (se houver)</label>
              <input
                type="text"
                value={pisPasep}
                onChange={(e) => setPisPasep(e.target.value)}
                placeholder="000.00000.00-0"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Data de Nascimento *</label>
              <input
                type="date"
                required
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Estado Civil</label>
              <select
                value={estadoCivil}
                onChange={(e) => setEstadoCivil(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
              >
                <option value="SOLTEIRO(A)">Solteiro(a)</option>
                <option value="CASADO(A)">Casado(a)</option>
                <option value="UNIAO_ESTAVEL">União Estável</option>
                <option value="DIVORCIADO(A)">Divorciado(a)</option>
                <option value="VIUVO(A)">Viúvo(a)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nome Completo da Mãe *</label>
              <input
                type="text"
                required
                value={nomeMae}
                onChange={(e) => setNomeMae(e.target.value)}
                placeholder="Conforme certidão de nascimento ou RG"
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Telefone Celular / WhatsApp *</label>
              <input
                type="text"
                required
                maxLength={15}
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                handleSaveProgress();
                setCurrentStep(2);
              }}
              className="px-6 py-2.5 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              Avançar para Endereço →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ENDEREÇO */}
      {currentStep === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Etapa 2: Endereço Residencial</h2>
            <p className="text-xs text-slate-500">
              Digite o CEP para preenchimento automático das ruas e bairros brasileiros via ViaCEP.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">CEP (00000-000) *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={9}
                  value={cep}
                  onChange={(e) => setCep(formatCEP(e.target.value))}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-[#0A5B7A]"
                />
                {isLoadingCep && (
                  <RefreshCw className="w-4 h-4 text-slate-400 absolute right-3 top-3 animate-spin" />
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Logradouro / Rua *</label>
              <input
                type="text"
                required
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Número *</label>
              <input
                type="text"
                required
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Complemento</label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Apto, Bloco"
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Bairro *</label>
              <input
                type="text"
                required
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Cidade *</label>
              <input
                type="text"
                required
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Estado (UF) *</label>
              <input
                type="text"
                required
                maxLength={2}
                value={uf}
                onChange={(e) => setUf(e.target.value.toUpperCase())}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono uppercase text-center font-bold"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ← Voltar
            </button>
            <button
              onClick={() => {
                handleSaveProgress();
                setCurrentStep(3);
              }}
              className="px-6 py-2.5 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              Avançar para Bancários →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DADOS BANCÁRIOS */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Etapa 3: Dados Bancários para Pagamento</h2>
            <p className="text-xs text-slate-500">
              Conta de sua titularidade para crédito dos salários e benefícios mensais.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Instituição Bancária *</label>
              <input
                type="text"
                required
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                placeholder="Ex: Itaú, Bradesco, Santander, Nubank"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tipo de Conta</label>
              <select
                value={tipoConta}
                onChange={(e) => setTipoConta(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
              >
                <option value="CORRENTE">Conta Corrente</option>
                <option value="SALARIO">Conta Salário</option>
                <option value="POUPANCA">Conta Poupança</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Agência (com dígito) *</label>
              <input
                type="text"
                required
                value={agencia}
                onChange={(e) => setAgencia(e.target.value)}
                placeholder="Ex: 1234-5"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Número da Conta (com dígito) *</label>
              <input
                type="text"
                required
                value={conta}
                onChange={(e) => setConta(e.target.value)}
                placeholder="Ex: 98765-4"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Chave PIX (Opcional)</label>
              <input
                type="text"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ← Voltar
            </button>
            <button
              onClick={() => {
                handleSaveProgress();
                setCurrentStep(4);
              }}
              className="px-6 py-2.5 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              Avançar para Documentos →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: UPLOAD DE DOCUMENTOS */}
      {currentStep === 4 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Etapa 4: Documentos Comprobatórios</h2>
            <p className="text-xs text-slate-500">
              Faça upload legível em PDF ou Imagem dos itens abaixo para validação no eSocial.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              { type: 'RG_CNH', label: 'Documento de Identidade (RG ou CNH)', desc: 'Frente e verso legíveis' },
              { type: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de Residência', desc: 'Emitido nos últimos 90 dias' },
              { type: 'CTPS', label: 'Carteira de Trabalho (CTPS)', desc: 'Página da foto e qualificação ou PDF digital' },
              { type: 'FOTO_3X4', label: 'Foto 3x4 de Rosto', desc: 'Fundo neutro, sem óculos escuros' },
            ].map((docItem) => {
              const uploaded = userDocs.find((d) => d.tipoDocumento === docItem.type);

              return (
                <div
                  key={docItem.type}
                  className={`p-4 rounded-xl border-2 ${
                    uploaded
                      ? 'bg-teal-50/40 border-teal-300'
                      : 'border-dashed border-slate-300 hover:border-[#0A5B7A] bg-slate-50/50'
                  } transition-all`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{docItem.label}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{docItem.desc}</p>
                    </div>
                    {uploaded && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Enviado</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    {uploaded ? (
                      <div className="text-[11px] text-slate-600 font-mono truncate max-w-[200px]">
                        {uploaded.nomeArquivo}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Pendente de anexo</span>
                    )}

                    <label className="cursor-pointer px-3 py-1.5 bg-[#0A5B7A] hover:bg-[#084962] text-white font-bold text-[11px] rounded-lg transition-colors flex items-center space-x-1 shadow-xs">
                      <Upload className="w-3 h-3 text-[#F5B800]" />
                      <span>{uploaded ? 'Substituir' : 'Anexar Arquivo'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(docItem.type, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ← Voltar
            </button>
            <button
              onClick={() => {
                handleSaveProgress();
                setCurrentStep(5);
              }}
              className="px-6 py-2.5 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              Avançar para Termo LGPD →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: TERMO LGPD E CONCLUSÃO */}
      {currentStep === 5 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#0A5B7A]" />
              <span>Etapa 5: Termo de Consentimento e Privacidade (LGPD)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Conformidade rigorosa com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).
            </p>
          </div>

          {/* Legal Scrollbox */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-h-64 overflow-y-auto text-xs text-slate-600 space-y-3 leading-relaxed">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] flex items-center justify-between">
              <span>Termo de Tratamento e Governança de Dados para Admissão (LGPD)</span>
              <span className="text-[#0A5B7A] font-mono text-[10px]">Lei nº 13.709/2018</span>
            </h4>
            <p>
              Em cumprimento ao disposto na <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)</strong>,
              o(a) titular dos dados manifesta de forma livre, informada e inequívoca o seu consentimento para o tratamento
              de seus dados pessoais, bancários e documentos probatórios necessários para a formalização da contratação.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-white border border-slate-200 font-medium text-[11px]">
              <div>
                <strong className="text-slate-900 block text-[10px] uppercase text-slate-400">Controlador dos Dados:</strong>
                <span className="text-slate-800">{currentEmpresa.razaoSocial}</span>
                <span className="text-slate-500 block font-mono text-[10px]">CNPJ: {currentEmpresa.cnpj}</span>
              </div>
              <div>
                <strong className="text-slate-900 block text-[10px] uppercase text-slate-400">Operador da Plataforma Tecnológica:</strong>
                <span className="text-slate-800">Portal Gestão Integrada</span>
                <span className="text-slate-500 block font-mono text-[10px]">CNPJ: 52.769.818/0001-77</span>
              </div>
            </div>
            <p>
              <strong>1. Finalidade do Sistema e Base Legal:</strong> Os dados e documentos fornecidos (RG, CPF, CTPS,
              dados bancários, endereço e informações sindicais) destinam-se exclusivamente à qualificação e validação
              cadastral no sistema eSocial do Governo Federal, formalização do contrato de trabalho e operacionalização
              da folha de pagamento, com esteio no <em>Art. 7º, incisos II (obrigação legal) e V (execução de contrato) da LGPD</em>.
            </p>
            <p>
              <strong>2. Armazenamento, Segurança e Criptografia:</strong> Os dados são armazenados pela operadora{' '}
              <strong>Portal Gestão Integrada (CNPJ: 52.769.818/0001-77)</strong> em nuvem segura com criptografia TLS 1.3
              em trânsito e AES-256 em repouso, sob rigoroso isolamento multi-tenant por empresa contratante.
            </p>
            <p>
              <strong>3. Direitos do Titular e Canal DPO:</strong> O titular pode exercer a qualquer momento seus direitos
              do Art. 18 da LGPD (confirmação, acesso, correção ou portabilidade) contatando o Encarregado de Proteção de
              Dados pelo canal oficial:{' '}
              <strong className="font-mono text-[#0A5B7A]">dpo@portalgestaointegrada.com.br</strong>.
            </p>
          </div>

          {/* Digital Acceptance Checkbox */}
          <div className="p-4 rounded-xl border-2 border-teal-200 bg-teal-50/40 space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={lgpdChecked}
                onChange={(e) => setLgpdChecked(e.target.checked)}
                className="w-5 h-5 text-[#0A5B7A] rounded mt-0.5"
              />
              <div className="text-xs">
                <strong className="text-slate-900 font-bold block">
                  Declaro que li e concordo com o Termo de Tratamento de Dados Pessoais (LGPD).
                </strong>
                <span className="text-slate-500">
                  Ao marcar esta caixa, você autoriza digitalmente o envio das informações para admissão no eSocial.
                </span>
              </div>
            </label>

            {userDados?.lgpdAceito && (
              <div className="pt-2 border-t border-teal-200/80 text-[10px] text-teal-900 font-mono flex items-center justify-between">
                <span>Aceite registrado em: {formatDateTimeBR(userDados.lgpdAceitoEm)}</span>
                <span className="truncate max-w-xs text-slate-500">Hash: {userDados.lgpdIpHash}</span>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="flex justify-between pt-3">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ← Voltar para Documentos
            </button>

            <button
              onClick={handleFinalSubmit}
              className="flex items-center space-x-2 px-8 py-3 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-[#F5B800]" />
              <span>Concluir e Enviar Dossiê ao RH</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
