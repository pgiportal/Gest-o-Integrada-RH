import React from 'react';
import { ShieldCheck, Info, Headphones, ExternalLink, Lock, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigateToSobre?: () => void;
  onOpenTermos?: () => void;
  onOpenSuporte?: () => void;
  onOpenTour?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateToSobre,
  onOpenTermos,
  onOpenSuporte,
  onOpenTour,
}) => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-600 mt-auto select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        {/* Main Copyright & Developer Identity */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 leading-relaxed">
          <span className="font-bold text-[#0A5B7A]">Gestão Integrada RH</span>
          <span className="text-slate-400">© 2026</span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span>
            Desenvolvido por{' '}
            <strong className="text-slate-800 font-semibold">Portal Gestão Integrada</strong>{' '}
            <span className="text-slate-500 font-mono text-[11px]">(CNPJ: 52.769.818/0001-77)</span>
          </span>
          <span className="text-slate-400">— Todos os direitos reservados.</span>
        </div>

        {/* Quick Links & Version Badge */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
          {onOpenTour && (
            <>
              <button
                onClick={onOpenTour}
                className="inline-flex items-center space-x-1 font-semibold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer transition-colors"
                title="Abrir Tour de Boas-vindas e Guia dos Menus"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5B800]" />
                <span>Tour do Sistema</span>
              </button>
              <span className="text-slate-300">|</span>
            </>
          )}

          <button
            onClick={onNavigateToSobre}
            className="inline-flex items-center space-x-1 font-semibold text-[#0A5B7A] hover:text-[#084962] hover:underline cursor-pointer transition-colors"
            title="Ver informações da versão v1.0.0 e governança LGPD"
          >
            <Info className="w-3.5 h-3.5 text-[#0A5B7A]" />
            <span>Versão & LGPD</span>
          </button>

          <span className="text-slate-300">|</span>

          <button
            onClick={onOpenTermos}
            className="inline-flex items-center space-x-1 font-semibold text-slate-700 hover:text-[#0A5B7A] hover:underline cursor-pointer transition-colors"
            title="Consultar Termos de Privacidade, Segurança e Retenção de Dados"
          >
            <Lock className="w-3.5 h-3.5 text-[#F5B800]" />
            <span>Termos de Privacidade</span>
          </button>

          <span className="text-slate-300">|</span>

          <button
            onClick={onOpenSuporte}
            className="inline-flex items-center space-x-1 font-semibold text-slate-700 hover:text-[#0A5B7A] hover:underline cursor-pointer transition-colors"
            title="Canais de suporte da desenvolvedora Portal Gestão Integrada"
          >
            <Headphones className="w-3.5 h-3.5 text-[#0A5B7A]" />
            <span>Suporte Técnico</span>
          </button>

          <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
};
