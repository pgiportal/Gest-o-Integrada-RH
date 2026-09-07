import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  formatCNPJ,
  formatCPF,
  formatCEP,
  formatPhone,
  fetchAddressByCep,
} from '../lib/formatters';
import {
  Building2,
  Save,
  Upload,
  Palette,
  MapPin,
  UserCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const EmpresaBrandingView: React.FC = () => {
  const { currentEmpresa, updateEmpresa } = useApp();

  const [razaoSocial, setRazaoSocial] = useState(currentEmpresa.razaoSocial);
  const [nomeFantasia, setNomeFantasia] = useState(currentEmpresa.nomeFantasia);
  const [cnpj, setCnpj] = useState(currentEmpresa.cnpj);
  const [inscricaoEstadual, setInscricaoEstadual] = useState(currentEmpresa.inscricaoEstadual || '');
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState(currentEmpresa.inscricaoMunicipal || '');
  const [cnaePrincipal, setCnaePrincipal] = useState(currentEmpresa.cnaePrincipal || '');

  // Legal Representative
  const [respNome, setRespNome] = useState(currentEmpresa.responsavelNome);
  const [respCpf, setRespCpf] = useState(currentEmpresa.responsavelCpf);
  const [respEmail, setRespEmail] = useState(currentEmpresa.responsavelEmail);
  const [respCargo, setRespCargo] = useState(currentEmpresa.responsavelCargo || '');
  const [respCelular, setRespCelular] = useState(currentEmpresa.responsavelCelular || '');

  // Address
  const [cep, setCep] = useState(currentEmpresa.cep);
  const [logradouro, setLogradouro] = useState(currentEmpresa.logradouro);
  const [numero, setNumero] = useState(currentEmpresa.numero);
  const [complemento, setComplemento] = useState(currentEmpresa.complemento || '');
  const [bairro, setBairro] = useState(currentEmpresa.bairro);
  const [cidade, setCidade] = useState(currentEmpresa.cidade);
  const [uf, setUf] = useState(currentEmpresa.uf);

  // Branding
  const [logoUrl, setLogoUrl] = useState(currentEmpresa.logoUrl || '');
  const [corPrimaria, setCorPrimaria] = useState(currentEmpresa.corPrimaria || '#0A5B7A');
  const [corSecundaria, setCorSecundaria] = useState(currentEmpresa.corSecundaria || '#F5B800');

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmpresa({
      razaoSocial,
      nomeFantasia,
      cnpj,
      inscricaoEstadual,
      inscricaoMunicipal,
      cnaePrincipal,
      responsavelNome: respNome,
      responsavelCpf: respCpf,
      responsavelEmail: respEmail,
      responsavelCargo: respCargo,
      responsavelCelular: respCelular,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      logoUrl,
      corPrimaria,
      corSecundaria,
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
            <Building2 className="w-6 h-6 text-[#0A5B7A]" />
            <span>Cadastro Empresarial & Branding por Tenant</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personalize a identidade corporativa, logotipo para holerites e dados fiscais eSocial.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center space-x-2 px-5 py-2.5 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4 text-[#F5B800]" />
          <span>Salvar Alterações da Empresa</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Dados empresariais e identidade visual atualizados com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branding Preview & Upload Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-[#0A5B7A] font-bold text-sm border-b border-slate-100 pb-3 mb-4">
            <Palette className="w-5 h-5" />
            <span>Identidade Visual & Branding do Tenant</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Logo Upload Box */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">Logotipo da Empresa:</label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors border border-slate-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo (PNG/JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Exibido nos contracheques, relatórios de ponto e no topo da navegação.
                  </p>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Cor Primária (Teal):</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    className="w-24 p-2 text-xs font-mono rounded-lg border border-slate-300 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cor Secundária (Dourado):</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={corSecundaria}
                    onChange={(e) => setCorSecundaria(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={corSecundaria}
                    onChange={(e) => setCorSecundaria(e.target.value)}
                    className="w-24 p-2 text-xs font-mono rounded-lg border border-slate-300 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Prévia da Barra do Sistema:
              </span>
              <div
                className="p-3 rounded-lg text-white flex items-center justify-between shadow-xs"
                style={{ backgroundColor: corPrimaria }}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] text-slate-900"
                    style={{ backgroundColor: corSecundaria }}
                  >
                    G
                  </div>
                  <span className="text-xs font-bold truncate">{nomeFantasia || 'Sua Empresa'}</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-950"
                  style={{ backgroundColor: corSecundaria }}
                >
                  SaaS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Fiscal Info (eSocial) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-[#0A5B7A] font-bold text-sm border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5" />
            <span>Dados Cadastrais da Empresa (eSocial)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Razão Social:</label>
              <input
                type="text"
                required
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nome Fantasia:</label>
              <input
                type="text"
                required
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                CNPJ (com máscara 00.000.000/0000-00):
              </label>
              <input
                type="text"
                required
                value={cnpj}
                onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                maxLength={18}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-[#0A5B7A]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Inscrição Estadual:</label>
              <input
                type="text"
                value={inscricaoEstadual}
                onChange={(e) => setInscricaoEstadual(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Inscrição Municipal:</label>
              <input
                type="text"
                value={inscricaoMunicipal}
                onChange={(e) => setInscricaoMunicipal(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">CNAE Principal:</label>
              <input
                type="text"
                value={cnaePrincipal}
                onChange={(e) => setCnaePrincipal(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Legal Representative */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-[#0A5B7A] font-bold text-sm border-b border-slate-100 pb-3">
            <UserCheck className="w-5 h-5" />
            <span>Responsável Legal da Contratante</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nome do Responsável:</label>
              <input
                type="text"
                required
                value={respNome}
                onChange={(e) => setRespNome(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">CPF do Responsável:</label>
              <input
                type="text"
                required
                value={respCpf}
                onChange={(e) => setRespCpf(formatCPF(e.target.value))}
                maxLength={14}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">E-mail Corporativo:</label>
              <input
                type="email"
                required
                value={respEmail}
                onChange={(e) => setRespEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Cargo / Função:</label>
              <input
                type="text"
                value={respCargo}
                onChange={(e) => setRespCargo(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Celular / WhatsApp:</label>
              <input
                type="text"
                value={respCelular}
                onChange={(e) => setRespCelular(formatPhone(e.target.value))}
                maxLength={15}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Address with CEP search */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-[#0A5B7A] font-bold text-sm border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5" />
            <span>Endereço da Sede</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">CEP (Busca ViaCEP):</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={cep}
                  onChange={(e) => setCep(formatCEP(e.target.value))}
                  onBlur={handleCepBlur}
                  maxLength={9}
                  placeholder="00000-000"
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-[#0A5B7A]"
                />
                {isLoadingCep && (
                  <RefreshCw className="w-4 h-4 text-slate-400 absolute right-3 top-3 animate-spin" />
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Logradouro / Rua / Avenida:</label>
              <input
                type="text"
                required
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Número:</label>
              <input
                type="text"
                required
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Complemento:</label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Sala, Andar, Bloco"
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Bairro:</label>
              <input
                type="text"
                required
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Cidade:</label>
              <input
                type="text"
                required
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">UF (Estado):</label>
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
        </div>

        {/* Footer save */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <Save className="w-4 h-4 text-[#F5B800]" />
            <span>Salvar Informações da Empresa</span>
          </button>
        </div>
      </form>
    </div>
  );
};
