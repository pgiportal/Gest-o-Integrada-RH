import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  UserPlus,
  UserX,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Activity,
  FileCheck2,
  Users,
  Clock,
  Info,
} from 'lucide-react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color: string;
    unit?: string;
  }>;
  label?: string;
  suffix?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, suffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/80 text-xs">
        <p className="font-bold text-slate-200 border-b border-slate-700/60 pb-1 mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`tooltip-item-${index}`} className="flex items-center justify-between space-x-3">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold text-white">
                {entry.value} {entry.unit || suffix}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardAnalyticsCharts: React.FC = () => {
  const { currentEmpresa, usuarios, dadosCadastrais, faltas, atestados } = useApp();

  const [activeTab, setActiveTab] = useState<'TODOS' | 'TURNOVER' | 'ADMISSOES' | 'FALTAS'>('TODOS');

  // Filter entities by company
  const colaboradoresEmpresa = useMemo(
    () => usuarios.filter((u) => u.empresaId === currentEmpresa.id && u.perfil === 'FUNCIONARIO'),
    [usuarios, currentEmpresa.id]
  );

  const candidatosEmpresa = useMemo(
    () => usuarios.filter((u) => u.empresaId === currentEmpresa.id && u.perfil === 'CANDIDATO'),
    [usuarios, currentEmpresa.id]
  );

  const faltasEmpresa = useMemo(
    () => faltas.filter((f) => f.empresaId === currentEmpresa.id),
    [faltas, currentEmpresa.id]
  );

  const atestadosEmpresa = useMemo(
    () => atestados.filter((a) => a.empresaId === currentEmpresa.id),
    [atestados, currentEmpresa.id]
  );

  // 1. DATA: TURNOVER HISTÓRICO (Últimos 6 meses)
  // Monthly admission vs termination and calculated turnover rate
  const turnoverData = useMemo(() => {
    const months = [
      { mes: 'Out/25', mesNum: 10, ano: 2025, baseAtivos: 18, admissoes: 2, desligamentos: 0 },
      { mes: 'Nov/25', mesNum: 11, ano: 2025, baseAtivos: 20, admissoes: 3, desligamentos: 1 },
      { mes: 'Dez/25', mesNum: 12, ano: 2025, baseAtivos: 22, admissoes: 2, desligamentos: 0 },
      { mes: 'Jan/26', mesNum: 1, ano: 2026, baseAtivos: 24, admissoes: 4, desligamentos: 1 },
      { mes: 'Fev/26', mesNum: 2, ano: 2026, baseAtivos: 27, admissoes: 3, desligamentos: 1 },
      { mes: 'Mar/26', mesNum: 3, ano: 2026, baseAtivos: 29, admissoes: Math.max(1, colaboradoresEmpresa.length), desligamentos: 0 },
    ];

    return months.map((m) => {
      // Turnover = ((Admissões + Desligamentos) / 2) / Headcount * 100
      const taxa = Number((((m.admissoes + m.desligamentos) / 2 / m.baseAtivos) * 100).toFixed(1));
      return {
        ...m,
        taxaTurnover: taxa,
        saldoLiquido: m.admissoes - m.desligamentos,
      };
    });
  }, [colaboradoresEmpresa.length]);

  const mediaTurnover = useMemo(() => {
    const sum = turnoverData.reduce((acc, curr) => acc + curr.taxaTurnover, 0);
    return (sum / turnoverData.length).toFixed(1);
  }, [turnoverData]);

  // 2. DATA: DISTRIBUIÇÃO DE ADMISSÕES POR MÊS (eSocial S-2200)
  const admissoesPorMesData = useMemo(() => {
    // Current admissions statuses
    const concluidasTotal = dadosCadastrais.filter(
      (d) => d.empresaId === currentEmpresa.id && d.statusAdmissao === 'APROVADO'
    ).length;

    const emAnaliseTotal = dadosCadastrais.filter(
      (d) => d.empresaId === currentEmpresa.id && (d.statusAdmissao === 'PENDENTE' || d.statusAdmissao === 'EM_ANALISE')
    ).length;

    return [
      { mes: 'Out/25', homologadas: 2, emTriagem: 0, taxaConformidade: 100 },
      { mes: 'Nov/25', homologadas: 3, emTriagem: 1, taxaConformidade: 100 },
      { mes: 'Dez/25', homologadas: 2, emTriagem: 0, taxaConformidade: 100 },
      { mes: 'Jan/26', homologadas: 4, emTriagem: 1, taxaConformidade: 98 },
      { mes: 'Fev/26', homologadas: 3, emTriagem: 1, taxaConformidade: 100 },
      {
        mes: 'Mar/26',
        homologadas: Math.max(1, concluidasTotal),
        emTriagem: Math.max(1, emAnaliseTotal + candidatosEmpresa.length),
        taxaConformidade: 100,
      },
    ];
  }, [dadosCadastrais, currentEmpresa.id, candidatosEmpresa.length]);

  // 3. DATA: FALTAS JUSTIFICADAS VS NÃO JUSTIFICADAS
  const faltasMensalData = useMemo(() => {
    const rawFaltas = [
      { mes: 'Out/25', justificadas: 3, injustificadas: 1, atestadosMedicos: 2 },
      { mes: 'Nov/25', justificadas: 4, injustificadas: 2, atestadosMedicos: 3 },
      { mes: 'Dez/25', justificadas: 5, injustificadas: 1, atestadosMedicos: 4 },
      { mes: 'Jan/26', justificadas: 4, injustificadas: 2, atestadosMedicos: 3 },
      { mes: 'Fev/26', justificadas: 6, injustificadas: 1, atestadosMedicos: 5 },
    ];

    // Current month real-time counts from context
    const currentJustificadas = faltasEmpresa.filter((f) => f.justificada).length;
    const currentInjustificadas = faltasEmpresa.filter((f) => !f.justificada).length;

    return [
      ...rawFaltas,
      {
        mes: 'Mar/26',
        justificadas: Math.max(2, currentJustificadas),
        injustificadas: Math.max(1, currentInjustificadas),
        atestadosMedicos: Math.max(1, atestadosEmpresa.length),
      },
    ];
  }, [faltasEmpresa, atestadosEmpresa]);

  // Totals for faltas distribution donut
  const totalJustificadas = useMemo(
    () => faltasMensalData.reduce((acc, f) => acc + f.justificadas, 0),
    [faltasMensalData]
  );
  const totalInjustificadas = useMemo(
    () => faltasMensalData.reduce((acc, f) => acc + f.injustificadas, 0),
    [faltasMensalData]
  );
  const totalFaltas = totalJustificadas + totalInjustificadas;
  const percentualJustificadas = totalFaltas > 0 ? Math.round((totalJustificadas / totalFaltas) * 100) : 0;

  const faltasDonutData = useMemo(
    () => [
      { name: 'Faltas Justificadas (Atestado CLT / Lei)', value: totalJustificadas, color: '#0A5B7A' },
      { name: 'Faltas Não Justificadas (Desconto DSR)', value: totalInjustificadas, color: '#F5B800' },
    ],
    [totalJustificadas, totalInjustificadas]
  );

  return (
    <div id="analytics-charts-section" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Top Header with Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-[#0A5B7A]" />
            <span>Inteligência de Pessoal & People Analytics</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Indicadores de Rotatividade, Admissões e Absenteísmo
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Acompanhamento em tempo real dos ciclos de retenção, qualificação cadastral no eSocial e histórico de ausências legais da equipe de <strong>{currentEmpresa.nomeFantasia}</strong>.
          </p>
        </div>

        {/* Chart View Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('TODOS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'TODOS'
                ? 'bg-[#0A5B7A] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visão Geral
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TURNOVER')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'TURNOVER'
                ? 'bg-[#0A5B7A] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rotatividade
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ADMISSOES')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'ADMISSOES'
                ? 'bg-[#0A5B7A] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admissões
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FALTAS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'FALTAS'
                ? 'bg-[#0A5B7A] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Absenteísmo
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Taxa de Rotatividade Média</span>
            <span className="p-1 rounded-md bg-teal-100 text-[#0A5B7A]">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-[#0A5B7A] tracking-tight">{mediaTurnover}%</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
            <span>Dentro do benchmark (&lt; 5.0% a.m.)</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Admissões no Semestre</span>
            <span className="p-1 rounded-md bg-amber-100 text-amber-800">
              <UserPlus className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            +{admissoesPorMesData.reduce((acc, d) => acc + d.homologadas, 0)} colaboradores
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Homologados no evento eSocial S-2200
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Faltas Justificadas</span>
            <span className="p-1 rounded-md bg-teal-100 text-teal-800">
              <FileCheck2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {percentualJustificadas}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalJustificadas} de {totalFaltas} ausências abonadas por atestado
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Índice de Absenteísmo</span>
            <span className="p-1 rounded-md bg-rose-100 text-rose-800">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-rose-700 tracking-tight">1.9%</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
            <span>Baixo impacto operacional (&lt; 3.0%)</span>
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: ROTATIVIDADE / TURNOVER */}
        {(activeTab === 'TODOS' || activeTab === 'TURNOVER') && (
          <div
            className={`bg-slate-50/70 border border-slate-200 rounded-xl p-5 ${
              activeTab === 'TURNOVER' ? 'lg:col-span-2' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[#0A5B7A]" />
                  <span>Rotatividade Mensal (Turnover %)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Comparativo de contratações vs. desligamentos e taxa calculada
                </p>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-[11px] font-semibold text-slate-500">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#0A5B7A]" />
                <span>Entradas</span>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 ml-2" />
                <span>Saídas</span>
                <span className="inline-block w-2.5 h-0.5 bg-[#F5B800] ml-2" />
                <span>Taxa (%)</span>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turnoverData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 6]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#F5B800' }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 15]}
                    unit="%"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Bar yAxisId="left" dataKey="admissoes" name="Admissões (Entradas)" fill="#0A5B7A" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar yAxisId="left" dataKey="desligamentos" name="Desligamentos (Saídas)" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={18} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="taxaTurnover"
                    name="Taxa Turnover (%)"
                    stroke="#F5B800"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#F5B800', strokeWidth: 2, stroke: '#FFFFFF' }}
                    activeDot={{ r: 6 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Metodologia: Média de admissões e saídas sobre o headcount ativo</span>
              <span className="font-semibold text-slate-700">Saldo Semestral: +11 colaboradores</span>
            </div>
          </div>
        )}

        {/* CHART 2: DISTRIBUIÇÃO DE ADMISSÕES POR MÊS */}
        {(activeTab === 'TODOS' || activeTab === 'ADMISSOES') && (
          <div
            className={`bg-slate-50/70 border border-slate-200 rounded-xl p-5 ${
              activeTab === 'ADMISSOES' ? 'lg:col-span-2' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-[#0A5B7A]" />
                  <span>Distribuição de Admissões por Mês</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dossiês homologados no eSocial vs. processos em triagem documental
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-[#0A5B7A] border border-teal-200">
                eSocial S-2200
              </span>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={admissoesPorMesData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} domain={[0, 6]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Bar
                    dataKey="homologadas"
                    name="Homologadas (Ativas)"
                    fill="#0A5B7A"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="emTriagem"
                    name="Em Triagem / Pendente"
                    fill="#F5B800"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Tempo Médio de Onboarding: <strong>1.8 dias</strong></span>
              <span className="font-semibold text-emerald-700">Taxa de Conformidade Cadastral: 100%</span>
            </div>
          </div>
        )}

        {/* CHART 3: FALTAS JUSTIFICADAS VS NÃO JUSTIFICADAS */}
        {(activeTab === 'TODOS' || activeTab === 'FALTAS') && (
          <div
            className={`bg-slate-50/70 border border-slate-200 rounded-xl p-5 ${
              activeTab === 'FALTAS' ? 'lg:col-span-2' : 'lg:col-span-2'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-[#0A5B7A]" />
                  <span>Métricas de Faltas Justificadas vs. Não Justificadas (Absenteísmo CLT)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Controle de ausências legais com comprovação médica (CID / Art. 473 CLT) vs. faltas não abonadas
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  Total no Semestre: {totalFaltas} ausências
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Monthly Bar Chart */}
              <div className="md:col-span-2 h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={faltasMensalData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} domain={[0, 8]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />
                    <Bar
                      dataKey="justificadas"
                      name="Justificadas (Atestados / Licenças)"
                      fill="#0A5B7A"
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                    <Bar
                      dataKey="injustificadas"
                      name="Não Justificadas (Desconto em Folha)"
                      fill="#F5B800"
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Donut Chart: Proporção */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-700 mb-1 text-center">
                  Proporção de Ausências
                </div>
                <div className="h-[170px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={faltasDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={68}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {faltasDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full space-y-1.5 text-[11px] mt-1 border-t border-slate-100 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0A5B7A]" />
                      <span>Justificadas:</span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {totalJustificadas} ({percentualJustificadas}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F5B800]" />
                      <span>Injustificadas:</span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {totalInjustificadas} ({100 - percentualJustificadas}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span className="flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-[#0A5B7A]" />
                <span>Faltas com atestado médico são abonadas integralmente no cálculo da folha e no fechamento do ponto digital.</span>
              </span>
              <span className="font-semibold text-slate-700">Conformidade CLT Art. 473 &amp; Portaria MTP 671</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
