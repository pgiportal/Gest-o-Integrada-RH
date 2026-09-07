import React from 'react';
import { X } from 'lucide-react';
import { CadastroInicialView } from '../views/CadastroInicialView';

interface CadastroInicialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'empresa' | 'candidato' | 'funcionario';
  onNavigate?: (tab: string) => void;
  onOpenTermosModal?: () => void;
  onOpenSuporteModal?: () => void;
}

export const CadastroInicialModal: React.FC<CadastroInicialModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'empresa',
  onNavigate,
  onOpenTermosModal,
  onOpenSuporteModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl my-8">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-50 w-9 h-9 rounded-full bg-slate-800 text-white hover:bg-slate-950 flex items-center justify-center shadow-xl border-2 border-white transition-all cursor-pointer"
          title="Fechar formulário de cadastro"
        >
          <X className="w-5 h-5" />
        </button>

        <CadastroInicialView
          initialTab={initialTab}
          onNavigate={(tab) => {
            if (onNavigate) onNavigate(tab);
            onClose();
          }}
          onOpenTermosModal={onOpenTermosModal}
          onOpenSuporteModal={onOpenSuporteModal}
        />
      </div>
    </div>
  );
};
