import React from 'react';
import { Holerite, Empresa, Usuario, DadosCadastrais } from '../types';
import { formatCurrency, formatCNPJ, formatCPF, MESES } from '../lib/formatters';
import { Printer, X, Download, Building } from 'lucide-react';

interface HoleriteModalProps {
  holerite: Holerite | null;
  empresa: Empresa;
  colaborador?: Usuario;
  dadosCadastrais?: DadosCadastrais;
  onClose: () => void;
}

export const HoleriteModal: React.FC<HoleriteModalProps> = ({
  holerite,
  empresa,
  colaborador,
  dadosCadastrais,
  onClose,
}) => {
  if (!holerite) return null;

  const handlePrint = () => {
    window.print();
  };

  const mesNome = MESES[holerite.mes - 1] || `Mês ${holerite.mes}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 text-sm">
              Visualização de Contracheque Oficial
            </span>
            <span className="bg-[#0A5B7A] text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {mesNome} / {holerite.ano}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Gerar PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              title="Download em PDF através do diálogo de impressão do navegador"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL BRAZILIAN PAYSLIP (HOLERITE) */}
        <div className="p-8 text-slate-900 bg-white" id="printable-holerite">
          {/* Header 1: Company Info */}
          <div className="border-2 border-slate-800 rounded-t-lg p-4 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                {empresa.logoUrl ? (
                  <img
                    src={empresa.logoUrl}
                    alt={empresa.nomeFantasia}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building className="w-6 h-6 text-[#0A5B7A]" />
                )}
              </div>
              <div>
                <h2 className="text-base font-extrabold uppercase text-slate-900 tracking-tight">
                  {empresa.razaoSocial}
                </h2>
                <div className="text-xs text-slate-600 font-mono">
                  CNPJ: {formatCNPJ(empresa.cnpj)} | Inscr. Estadual: {empresa.inscricaoEstadual || 'Isento'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {empresa.logradouro}, {empresa.numero} {empresa.complemento} - {empresa.bairro} - {empresa.cidade}/{empresa.uf}
                </div>
              </div>
            </div>

            <div className="text-right border-l-0 md:border-l-2 md:border-slate-800 md:pl-4">
              <div className="text-xs font-bold uppercase text-slate-500">
                Recibo de Pagamento de Salário
              </div>
              <div className="text-xl font-extrabold text-[#0A5B7A] tracking-tight">
                {mesNome.toUpperCase()} / {holerite.ano}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Emitido via Gestão Integrada RH
              </div>
            </div>
          </div>

          {/* Header 2: Employee Info */}
          <div className="border-x-2 border-b-2 border-slate-800 p-3 bg-white text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="font-bold text-slate-500 block text-[10px] uppercase">Nome do Colaborador</span>
              <span className="font-bold text-slate-900 text-sm">{colaborador?.nome || 'Colaborador Cadastrado'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[10px] uppercase">CPF / PIS</span>
              <span className="font-mono text-slate-800">
                {dadosCadastrais?.cpf ? formatCPF(dadosCadastrais.cpf) : '456.789.123-44'} / {dadosCadastrais?.pisPasep || '123.45678.90-1'}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[10px] uppercase">Cargo / Função</span>
              <span className="text-slate-800 font-semibold">{colaborador?.cargo || 'Desenvolvedor Full-Stack'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block text-[10px] uppercase">Admissão / Depto</span>
              <span className="text-slate-800">
                {colaborador?.dataAdmissao ? new Date(colaborador.dataAdmissao).toLocaleDateString('pt-BR') : '15/08/2024'} - {colaborador?.departamento || 'Tecnologia'}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-x-2 border-b-2 border-slate-800 min-h-[320px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-200 border-b-2 border-slate-800 font-extrabold text-[11px] text-slate-800">
                <tr>
                  <th className="py-1.5 px-3 w-16">Cód.</th>
                  <th className="py-1.5 px-3">Descrição do Evento / Provento / Desconto</th>
                  <th className="py-1.5 px-3 text-center w-20">Referência</th>
                  <th className="py-1.5 px-3 text-right w-28">Vencimentos (R$)</th>
                  <th className="py-1.5 px-3 text-right w-28">Descontos (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {holerite.itens.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-1.5 px-3 text-slate-500 font-semibold">{item.codigo}</td>
                    <td className="py-1.5 px-3 font-sans font-medium text-slate-800">{item.descricao}</td>
                    <td className="py-1.5 px-3 text-center text-slate-600">{item.referencia}</td>
                    <td className="py-1.5 px-3 text-right text-emerald-800 font-semibold">
                      {item.provento > 0 ? formatCurrency(item.provento) : '-'}
                    </td>
                    <td className="py-1.5 px-3 text-right text-rose-800 font-semibold">
                      {item.desconto > 0 ? formatCurrency(item.desconto) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="border-x-2 border-b-2 border-slate-800 bg-slate-100 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Total de Vencimentos</span>
                <span className="text-base font-extrabold text-emerald-700 font-mono">
                  {formatCurrency(holerite.totalVencimentos)}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Total de Descontos</span>
                <span className="text-base font-extrabold text-rose-700 font-mono">
                  {formatCurrency(holerite.totalDescontos)}
                </span>
              </div>
              <div className="bg-[#0A5B7A] text-white p-2.5 rounded border-2 border-[#0A5B7A] shadow-xs">
                <span className="text-[10px] font-bold text-teal-100 uppercase block">Valor Líquido a Receber</span>
                <span className="text-xl font-extrabold text-[#F5B800] font-mono">
                  {formatCurrency(holerite.salarioLiquido)}
                </span>
              </div>
            </div>
          </div>

          {/* Calculation Bases & Taxes (CLT Compliance) */}
          <div className="border-x-2 border-b-2 border-slate-800 p-3 bg-white text-[10px] font-mono grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
            <div className="border border-slate-200 p-1.5 rounded">
              <span className="text-slate-500 block font-bold font-sans">Salário Base</span>
              <span className="font-semibold text-slate-900">{formatCurrency(holerite.salarioBase)}</span>
            </div>
            <div className="border border-slate-200 p-1.5 rounded">
              <span className="text-slate-500 block font-bold font-sans">Sal. Contr. INSS</span>
              <span className="font-semibold text-slate-900">{formatCurrency(holerite.baseInss)}</span>
            </div>
            <div className="border border-slate-200 p-1.5 rounded">
              <span className="text-slate-500 block font-bold font-sans">Base Cálc. FGTS</span>
              <span className="font-semibold text-slate-900">{formatCurrency(holerite.baseFgts)}</span>
            </div>
            <div className="border border-slate-200 p-1.5 rounded">
              <span className="text-slate-500 block font-bold font-sans">FGTS do Mês (8%)</span>
              <span className="font-semibold text-emerald-800">{formatCurrency(holerite.fgtsDoMes)}</span>
            </div>
            <div className="border border-slate-200 p-1.5 rounded">
              <span className="text-slate-500 block font-bold font-sans">Base Cálc. IRRF</span>
              <span className="font-semibold text-slate-900">{formatCurrency(holerite.baseIrrf)}</span>
            </div>
            <div className="border border-slate-200 p-1.5 rounded">
              <span className="text-slate-500 block font-bold font-sans">Faixa IRRF</span>
              <span className="font-semibold text-slate-900">27,5%</span>
            </div>
          </div>

          {/* Legal Acknowledgement and Signature */}
          <div className="border-x-2 border-b-2 border-slate-800 rounded-b-lg p-4 bg-slate-50 text-[11px] text-slate-600">
            <p className="mb-6 leading-relaxed">
              DECLARO TER RECEBIDO A IMPORTÂNCIA LÍQUIDA DISCRIMINADA NESTE RECIBO, CORRESPONDENTE AO MEU SALÁRIO E PROVENTOS NO PERÍODO ACIMA INDICADO, NADA MAIS TENDO A RECLAMAR A QUALQUER TÍTULO.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end pt-4">
              <div>
                <div className="border-b border-slate-400 pb-1 text-slate-700 font-medium">
                  Data: _____ / _____ / {holerite.ano}
                </div>
              </div>
              <div>
                <div className="border-b border-slate-800 pb-1 text-center font-bold text-slate-800">
                  {colaborador?.nome || 'Assinatura do Colaborador'}
                </div>
                <div className="text-[10px] text-center text-slate-500 mt-0.5">
                  Assinatura do Empregado ou Autenticação Digital eSocial
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
