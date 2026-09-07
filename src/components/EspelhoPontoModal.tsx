import React from 'react';
import { FolhaPonto, Empresa, Usuario } from '../types';
import { formatCNPJ, MESES } from '../lib/formatters';
import { Printer, X, Download, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface EspelhoPontoModalProps {
  folhaPonto: FolhaPonto | null;
  empresa: Empresa;
  colaborador?: Usuario;
  onClose: () => void;
}

export const EspelhoPontoModal: React.FC<EspelhoPontoModalProps> = ({
  folhaPonto,
  empresa,
  colaborador,
  onClose,
}) => {
  if (!folhaPonto) return null;

  const handlePrint = () => {
    window.print();
  };

  const mesNome = MESES[folhaPonto.mes - 1] || `Mês ${folhaPonto.mes}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Controls */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#0A5B7A]" />
            <span className="font-bold text-slate-800 text-sm">
              Espelho de Ponto Eletrônico (Portaria 671 / MTP)
            </span>
            <span className="bg-[#0A5B7A] text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {mesNome} / {folhaPonto.ano}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Relatório</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE TIMESHEET */}
        <div className="p-8 text-slate-900 bg-white" id="printable-ponto">
          {/* Header */}
          <div className="border border-slate-300 rounded-t-lg p-4 bg-slate-50 flex justify-between items-center">
            <div>
              <h2 className="text-base font-extrabold uppercase text-[#0A5B7A]">
                {empresa.razaoSocial}
              </h2>
              <p className="text-xs text-slate-600 font-mono">
                CNPJ: {formatCNPJ(empresa.cnpj)} | Registrador Eletrônico de Ponto
              </p>
              <p className="text-xs text-slate-500">
                Colaborador: <strong className="text-slate-900">{colaborador?.nome || 'Colaborador'}</strong> ({colaborador?.cargo || 'Desenvolvedor'})
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold uppercase text-slate-400">Competência</div>
              <div className="text-xl font-extrabold text-slate-800">{mesNome} / {folhaPonto.ano}</div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end space-x-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marcações Validadas</span>
              </div>
            </div>
          </div>

          {/* Timesheet Summary KPIs */}
          <div className="border-x border-b border-slate-300 bg-white p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Horas Trabalhadas</span>
              <span className="text-base font-extrabold text-slate-800 font-mono">{folhaPonto.totalHorasTrabalhadas}</span>
            </div>
            <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Horas Extras (+50%)</span>
              <span className="text-base font-extrabold text-emerald-800 font-mono">{folhaPonto.totalHorasExtras}</span>
            </div>
            <div className="bg-amber-50 p-2 rounded border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Atrasos / Saídas</span>
              <span className="text-base font-extrabold text-amber-800 font-mono">{folhaPonto.totalAtrasos}</span>
            </div>
            <div className="bg-[#0A5B7A]/10 p-2 rounded border border-[#0A5B7A]/20">
              <span className="text-[10px] uppercase font-bold text-[#0A5B7A] block">Saldo Banco de Horas</span>
              <span className="text-base font-extrabold text-[#0A5B7A] font-mono">{folhaPonto.saldoBancoHoras}</span>
            </div>
          </div>

          {/* Daily Table */}
          <div className="border-x border-b border-slate-300">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold text-[11px] text-slate-700">
                <tr>
                  <th className="py-2 px-3">Data</th>
                  <th className="py-2 px-3">Dia</th>
                  <th className="py-2 px-2 text-center">Entrada 1</th>
                  <th className="py-2 px-2 text-center">Saída 1</th>
                  <th className="py-2 px-2 text-center">Entrada 2</th>
                  <th className="py-2 px-2 text-center">Saída 2</th>
                  <th className="py-2 px-2 text-center">Total</th>
                  <th className="py-2 px-2 text-center">Extras</th>
                  <th className="py-2 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {folhaPonto.registros.map((reg, idx) => (
                  <tr key={idx} className={reg.status === 'DSR' ? 'bg-slate-50 text-slate-400' : 'hover:bg-slate-50'}>
                    <td className="py-2 px-3 font-semibold text-slate-700">
                      {new Date(reg.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-600">{reg.diaSemana}</td>
                    <td className="py-2 px-2 text-center">{reg.entrada1}</td>
                    <td className="py-2 px-2 text-center">{reg.saida1}</td>
                    <td className="py-2 px-2 text-center">{reg.entrada2}</td>
                    <td className="py-2 px-2 text-center">{reg.saida2}</td>
                    <td className="py-2 px-2 text-center font-bold text-slate-800">{reg.totalHoras}</td>
                    <td className="py-2 px-2 text-center text-emerald-700 font-semibold">
                      {reg.horasExtras !== '00:00' ? `+${reg.horasExtras}` : '-'}
                    </td>
                    <td className="py-2 px-2 text-center font-sans">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          reg.status === 'NORMAL'
                            ? 'bg-emerald-100 text-emerald-800'
                            : reg.status === 'DSR'
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="border-x border-b border-slate-300 rounded-b-lg p-4 bg-slate-50 text-xs text-slate-600">
            <p className="mb-6 text-[11px]">
              Reconheço a exatidão das marcações constantes deste relatório mensal de ponto eletrônico, atendendo às exigências legais da CLT e Portaria MTP 671.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="border-t border-slate-400 text-center pt-1 font-semibold text-slate-700">
                Assinatura do Colaborador
              </div>
              <div className="border-t border-slate-400 text-center pt-1 font-semibold text-slate-700">
                {empresa.razaoSocial} (Responsável RH)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
