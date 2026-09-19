import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  GoogleSignInButton,
} from '../components/GoogleSignInButton';
import {
  initGoogleAuth,
  signInWithGoogleDrive,
  getGoogleAccessToken,
  logoutGoogleDrive,
} from '../lib/googleDriveAuth';
import {
  listGoogleDriveFiles,
  createGoogleDriveFolder,
  uploadToGoogleDrive,
  deleteFromGoogleDrive,
  initializeHRFoldersInDrive,
  formatDriveFileSize,
  getDriveMimeLabel,
} from '../lib/googleDriveService';
import { GoogleDriveFile, GoogleDriveAuthState } from '../types';
import { formatDateTimeBR } from '../lib/formatters';
import {
  Folder,
  FileText,
  Upload,
  FolderPlus,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  HardDrive,
  ShieldCheck,
  ChevronRight,
  Home,
  LogOut,
  FileSpreadsheet,
  FileUp,
  Download,
  X,
  Plus,
} from 'lucide-react';

interface BreadcrumbItem {
  id?: string;
  name: string;
}

export const GoogleDriveView: React.FC = () => {
  const { currentEmpresa, currentUser, auditLogs, addAuditLog } = useApp();

  // Auth state
  const [authState, setAuthState] = useState<GoogleDriveAuthState>({
    isAuthenticated: false,
    user: null,
    hasToken: false,
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Files and navigation
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { name: 'Meu Google Drive' },
  ]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & User Confirmations (MANDATORY per Workspace Integration Skill)
  const [fileToDelete, setFileToDelete] = useState<GoogleDriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Creation & Upload modals
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup HR Folder structure
  const [isProvisioningFolders, setIsProvisioningFolders] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setAuthState({
          isAuthenticated: true,
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          hasToken: !!token,
        });
      },
      () => {
        setAuthState({
          isAuthenticated: false,
          user: null,
          hasToken: false,
        });
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch files whenever folder or token changes
  const loadFiles = async (folderId?: string, query?: string) => {
    try {
      const token = await getGoogleAccessToken();
      if (!token) return;

      setIsLoadingFiles(true);
      setUploadFeedback(null);

      const response = await listGoogleDriveFiles(token, {
        folderId,
        searchQuery: query,
      });

      setFiles(response.files);
    } catch (err: any) {
      console.error('Erro ao carregar arquivos do Drive:', err);
      setUploadFeedback({
        type: 'error',
        message: err.message || 'Falha ao sincronizar arquivos com o Google Drive.',
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (authState.hasToken) {
      loadFiles(currentFolderId, searchQuery);
    }
  }, [authState.hasToken, currentFolderId]);

  // Login handler
  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogleDrive();
      if (res) {
        setAuthState({
          isAuthenticated: true,
          user: {
            uid: res.user.uid,
            email: res.user.email,
            displayName: res.user.displayName,
            photoURL: res.user.photoURL,
          },
          hasToken: true,
        });

        // Log audit trail
        addAuditLog(
          'CONEXAO_GOOGLE_DRIVE',
          'IntegracaoGoogle',
          `Usuário ${res.user.email} autenticou e autorizou o acesso ao Google Drive.`
        );

        loadFiles(undefined);
      }
    } catch (err: any) {
      console.error('Erro ao conectar Google Drive:', err);
      setAuthError(err.message || 'Erro ao realizar login com o Google.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout handler
  const handleGoogleLogout = async () => {
    try {
      await logoutGoogleDrive();
      setAuthState({
        isAuthenticated: false,
        user: null,
        hasToken: false,
      });
      setFiles([]);
      setBreadcrumbs([{ name: 'Meu Google Drive' }]);
      setCurrentFolderId(undefined);

      addAuditLog(
        'DESCONEXAO_GOOGLE_DRIVE',
        'IntegracaoGoogle',
        'Sessão com o Google Drive encerrada.'
      );
    } catch (err: any) {
      console.error('Erro ao desconectar Google Drive:', err);
    }
  };

  // Navigate folder
  const handleOpenFolder = (folder: GoogleDriveFile) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const target = breadcrumbs[index];
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setCurrentFolderId(target.id);
  };

  // Folder creation
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const token = await getGoogleAccessToken();
      if (!token) throw new Error('Não autenticado no Google Drive');

      setIsCreatingFolder(true);
      const created = await createGoogleDriveFolder(
        token,
        newFolderName.trim(),
        currentFolderId
      );

      addAuditLog(
        'CRIAR_PASTA_DRIVE',
        'GoogleDriveFolder',
        `Criada pasta "${newFolderName.trim()}" (ID: ${created.id}) no Google Drive.`
      );

      setUploadFeedback({
        type: 'success',
        message: `Pasta "${newFolderName.trim()}" criada com sucesso no Google Drive.`,
      });

      setNewFolderName('');
      setIsNewFolderOpen(false);
      loadFiles(currentFolderId, searchQuery);
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: err.message || 'Erro ao criar pasta no Google Drive.',
      });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Setup Standard DP folders
  const handleProvisionHRPackage = async () => {
    try {
      const token = await getGoogleAccessToken();
      if (!token) throw new Error('Não autenticado no Google Drive');

      setIsProvisioningFolders(true);
      const res = await initializeHRFoldersInDrive(token, currentEmpresa.nomeFantasia);

      addAuditLog(
        'CRIAR_ESTRUTURA_DP_DRIVE',
        'GoogleDriveFolder',
        `Provisionada estrutura oficial de pastas do DP no Google Drive da empresa ${currentEmpresa.nomeFantasia}.`
      );

      setUploadFeedback({
        type: 'success',
        message: `Estrutura de pastas do DP para "${currentEmpresa.nomeFantasia}" gerada no Google Drive com sucesso!`,
      });

      loadFiles(currentFolderId);
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: err.message || 'Erro ao provisionar pastas do DP no Google Drive.',
      });
    } finally {
      setIsProvisioningFolders(false);
    }
  };

  // Upload file from computer
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const token = await getGoogleAccessToken();
      if (!token) throw new Error('Não autenticado no Google Drive');

      setIsUploading(true);
      setUploadFeedback(null);

      const uploaded = await uploadToGoogleDrive(
        token,
        file,
        file.name,
        file.type || 'application/octet-stream',
        currentFolderId
      );

      addAuditLog(
        'UPLOAD_ARQUIVO_DRIVE',
        'GoogleDriveFile',
        `Arquivo "${file.name}" (${formatDriveFileSize(file.size)}) enviado para o Google Drive.`
      );

      setUploadFeedback({
        type: 'success',
        message: `Arquivo "${file.name}" enviado com sucesso para o Google Drive!`,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      loadFiles(currentFolderId);
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: err.message || 'Erro ao enviar arquivo para o Google Drive.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Export current Audit Log CSV directly to Drive
  const handleSaveAuditLogsToDrive = async () => {
    try {
      const token = await getGoogleAccessToken();
      if (!token) throw new Error('Não autenticado no Google Drive');

      setIsUploading(true);
      setUploadFeedback(null);

      // Build CSV with BOM
      const headers = [
        'ID_EVENTO',
        'DATA_HORA_UTC_BR',
        'EMPRESA_ID',
        'OPERADOR_NOME',
        'OPERADOR_ID',
        'ACAO_EXECUTADA',
        'ENTIDADE_AFETADA',
        'IDENTIFICADOR_REGISTRO',
        'DETALHAMENTO_TECNICO',
        'IP_ORIGEM',
      ];

      const rows = auditLogs.map((log) => [
        `"${log.id}"`,
        `"${formatDateTimeBR(log.criadoEm)}"`,
        `"${log.empresaId}"`,
        `"${log.usuarioNome.replace(/"/g, '""')}"`,
        `"${log.usuarioId}"`,
        `"${log.acao}"`,
        `"${log.entidade}"`,
        `"${log.entidadeId || 'N/A'}"`,
        `"${log.detalhes.replace(/"/g, '""')}"`,
        `"${log.ipOrigem || '127.0.0.1'}"`,
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
      const filename = `backup_auditoria_esocial_lgpd_${new Date().toISOString().slice(0, 10)}.csv`;

      await uploadToGoogleDrive(
        token,
        csvContent,
        filename,
        'text/csv;charset=utf-8',
        currentFolderId
      );

      addAuditLog(
        'BACKUP_AUDITORIA_DRIVE',
        'AuditLog',
        `Relatório de auditoria e governança gravado no Google Drive (${filename}).`
      );

      setUploadFeedback({
        type: 'success',
        message: `Relatório de auditoria "${filename}" salvo no Google Drive com sucesso!`,
      });

      loadFiles(currentFolderId);
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: err.message || 'Erro ao salvar relatório de auditoria no Google Drive.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Explicit confirmation delete handler (MANDATORY per Workspace skill)
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      const token = await getGoogleAccessToken();
      if (!token) throw new Error('Não autenticado no Google Drive');

      setIsDeleting(true);
      await deleteFromGoogleDrive(token, fileToDelete.id);

      addAuditLog(
        'EXCLUSAO_ARQUIVO_DRIVE',
        fileToDelete.isFolder ? 'GoogleDriveFolder' : 'GoogleDriveFile',
        `Item "${fileToDelete.name}" (ID: ${fileToDelete.id}) foi excluído do Google Drive sob autorização do usuário.`
      );

      setUploadFeedback({
        type: 'success',
        message: `"${fileToDelete.name}" foi excluído do Google Drive.`,
      });

      setFileToDelete(null);
      loadFiles(currentFolderId, searchQuery);
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: err.message || 'Erro ao excluir item do Google Drive.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Google Drive & Documentos em Nuvem</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center space-x-1">
              <Cloud className="w-3 h-3" />
              <span>Workspace Conectado</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Armazenamento seguro, backup de auditoria eSocial/LGPD e repositório de dossiês de colaboradores.
          </p>
        </div>

        {/* Auth Status / Action */}
        <div className="flex items-center space-x-3">
          {authState.hasToken && authState.user ? (
            <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              {authState.user.photoURL ? (
                <img
                  src={authState.user.photoURL}
                  alt={authState.user.displayName || 'Google'}
                  className="w-7 h-7 rounded-full border border-slate-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {authState.user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {authState.user.displayName || 'Conta Google'}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {authState.user.email}
                </div>
              </div>
              <button
                onClick={handleGoogleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Desconectar Google Drive"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <GoogleSignInButton
              onClick={handleGoogleLogin}
              disabled={isAuthenticating}
              label={isAuthenticating ? 'Conectando...' : 'Conectar com Google Drive'}
            />
          )}
        </div>
      </div>

      {/* Authentication Notice & Feedback Banners */}
      {authError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between text-rose-900 shadow-2xs text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{authError}</span>
          </div>
          <button
            onClick={() => setAuthError(null)}
            className="text-rose-700 hover:text-rose-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {uploadFeedback && (
        <div
          className={`rounded-xl p-4 flex items-center justify-between shadow-2xs text-xs border ${
            uploadFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            {uploadFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{uploadFeedback.message}</span>
          </div>
          <button
            onClick={() => setUploadFeedback(null)}
            className="p-1 opacity-70 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* When NOT Authenticated State */}
      {!authState.hasToken ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
            <Cloud className="w-8 h-8 text-[#0A5B7A]" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Conecte sua conta do Google Drive ao Portal RH
          </h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
            Com a permissão do usuário, o sistema sincronizará os dossiês admissionais, holerites
            gerados e backups de auditoria eSocial diretamente em pastas organizadas no seu Google Drive.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6 max-w-md mx-auto">
            <div className="text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conformidade & Segurança</span>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Acesso seguro gerenciado com OAuth 2.0 e token em memória.</li>
              <li>Estruturação automática de pastas do Departamento Pessoal.</li>
              <li>Exclusões de arquivos sempre exigem confirmação explícita.</li>
              <li>Rastreabilidade de todas as ações no log de auditoria LGPD.</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <GoogleSignInButton
              onClick={handleGoogleLogin}
              disabled={isAuthenticating}
              label={isAuthenticating ? 'Conectando...' : 'Conectar com Google Drive'}
            />
          </div>
        </div>
      ) : (
        /* Authenticated Google Drive Explorer */
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Left: Quick Management Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                id="drive-file-input"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-1.5 px-3 py-2 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Fazer upload de um arquivo para a pasta atual"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Enviando...' : 'Fazer Upload'}</span>
              </button>

              <button
                onClick={() => setIsNewFolderOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                title="Criar uma nova pasta no Google Drive"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
                <span>Nova Pasta</span>
              </button>

              <button
                onClick={handleProvisionHRPackage}
                disabled={isProvisioningFolders}
                className="flex items-center space-x-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 transition-colors cursor-pointer disabled:opacity-50"
                title="Cria automaticamente a árvore padrão de pastas do DP (Admissões, Holerites, Atestados, Auditoria)"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                <span>{isProvisioningFolders ? 'Criando pastas...' : 'Estrutura Padrão DP'}</span>
              </button>

              <button
                onClick={handleSaveAuditLogsToDrive}
                disabled={isUploading}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
                title="Grava o relatório completo de auditoria e governança (CSV) na pasta atual do Google Drive"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backup de Auditoria</span>
              </button>
            </div>

            {/* Right: Search & Refresh */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar arquivos no Drive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      loadFiles(currentFolderId, searchQuery);
                    }
                  }}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A5B7A]/20 focus:border-[#0A5B7A]"
                />
              </div>
              <button
                onClick={() => loadFiles(currentFolderId, searchQuery)}
                disabled={isLoadingFiles}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                title="Atualizar lista de arquivos"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Breadcrumb Navigator */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 px-1 overflow-x-auto py-1">
            <button
              onClick={() => handleNavigateBreadcrumb(0)}
              className="flex items-center space-x-1 hover:text-[#0A5B7A] font-semibold transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Meu Drive</span>
            </button>
            {breadcrumbs.slice(1).map((crumb, idx) => (
              <React.Fragment key={crumb.id || idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <button
                  onClick={() => handleNavigateBreadcrumb(idx + 1)}
                  className={`hover:text-[#0A5B7A] transition-colors truncate max-w-[160px] ${
                    idx === breadcrumbs.length - 2
                      ? 'font-bold text-slate-900'
                      : 'text-slate-600'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Files List / Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {isLoadingFiles ? (
              <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#0A5B7A]" />
                <span>Consultando Google Drive...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-3">
                <Folder className="w-10 h-10 text-slate-300" />
                <div>Nenhum arquivo ou pasta encontrado neste local.</div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#0A5B7A] font-bold hover:underline flex items-center space-x-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Enviar o primeiro arquivo</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-6 sm:col-span-6">Nome</div>
                  <div className="col-span-3 sm:col-span-2">Tipo</div>
                  <div className="hidden sm:block sm:col-span-2">Tamanho</div>
                  <div className="col-span-3 sm:col-span-2 text-right">Ações</div>
                </div>

                {files.map((file) => {
                  const badge = getDriveMimeLabel(file.mimeType);

                  return (
                    <div
                      key={file.id}
                      className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-slate-50/60 transition-colors text-xs"
                    >
                      {/* Name & Icon */}
                      <div className="col-span-6 sm:col-span-6 flex items-center space-x-3 min-w-0">
                        {file.isFolder ? (
                          <div
                            onClick={() => handleOpenFolder(file)}
                            className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-amber-100 transition-colors"
                          >
                            <Folder className="w-4 h-4 fill-amber-500" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          {file.isFolder ? (
                            <button
                              onClick={() => handleOpenFolder(file)}
                              className="font-bold text-slate-900 hover:text-[#0A5B7A] transition-colors truncate block text-left w-full cursor-pointer"
                            >
                              {file.name}
                            </button>
                          ) : (
                            <span className="font-semibold text-slate-800 truncate block">
                              {file.name}
                            </span>
                          )}
                          {file.modifiedTime && (
                            <span className="text-[10px] text-slate-400 block">
                              Modificado: {formatDateTimeBR(file.modifiedTime)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div className="col-span-3 sm:col-span-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Size */}
                      <div className="hidden sm:block sm:col-span-2 text-slate-500 text-[11px] font-mono">
                        {file.isFolder ? '—' : formatDriveFileSize(file.size)}
                      </div>

                      {/* Actions */}
                      <div className="col-span-3 sm:col-span-2 flex items-center justify-end space-x-1">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-[#0A5B7A] hover:bg-blue-50 rounded-lg transition-colors"
                            title="Abrir no Google Drive (Nova Aba)"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        {file.webContentLink && (
                          <a
                            href={file.webContentLink}
                            download
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Baixar Arquivo"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}

                        {/* Delete button (triggers MANDATORY confirmation modal) */}
                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir do Google Drive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Nova Pasta */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Nova Pasta no Google Drive</h3>
              </div>
              <button
                onClick={() => setIsNewFolderOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Pasta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 01_Contratos_Admissao"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A5B7A]/20 focus:border-[#0A5B7A]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFolder || !newFolderName.trim()}
                  className="px-4 py-2 bg-[#0A5B7A] hover:bg-[#084962] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isCreatingFolder ? 'Criando...' : 'Criar Pasta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMAÇÃO OBRIGATÓRIA PARA EXCLUSÃO (Workspace Skill Requirement) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-rose-200">
            <div className="flex items-center space-x-3 mb-4 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {fileToDelete.isFolder ? 'Excluir Pasta?' : 'Excluir Arquivo do Google Drive?'}
                </h3>
                <p className="text-xs text-slate-500">
                  Esta ação modificará seus dados diretamente na sua conta do Google Drive.
                </p>
              </div>
            </div>

            <div className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-3.5 mb-5 text-xs text-slate-700">
              <div className="font-semibold text-rose-950 mb-1 truncate">
                Item: {fileToDelete.name}
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Você tem certeza de que deseja remover permanentemente este item do Google Drive?
                Esta operação não poderá ser revertida pelo sistema.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
