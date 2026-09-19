import { GoogleDriveFile } from '../types';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

export interface DriveListResponse {
  files: GoogleDriveFile[];
  nextPageToken?: string;
}

/**
 * List files and folders from Google Drive
 */
export async function listGoogleDriveFiles(
  accessToken: string,
  options?: {
    folderId?: string;
    searchQuery?: string;
    mimeTypeFilter?: string;
    pageSize?: number;
    pageToken?: string;
  }
): Promise<DriveListResponse> {
  const queryParts: string[] = ['trashed = false'];

  if (options?.folderId) {
    queryParts.push(`'${options.folderId}' in parents`);
  }

  if (options?.searchQuery && options.searchQuery.trim().length > 0) {
    const cleanSearch = options.searchQuery.replace(/'/g, "\\'");
    queryParts.push(`name contains '${cleanSearch}'`);
  }

  if (options?.mimeTypeFilter) {
    queryParts.push(`mimeType = '${options.mimeTypeFilter}'`);
  }

  const q = encodeURIComponent(queryParts.join(' and '));
  const pageSize = options?.pageSize || 40;
  const pageTokenParam = options?.pageToken ? `&pageToken=${options.pageToken}` : '';

  const fields = encodeURIComponent(
    'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, iconLink, thumbnailLink, parents)'
  );

  const url = `${DRIVE_API_URL}/files?q=${q}&pageSize=${pageSize}&fields=${fields}&orderBy=folder,modifiedTime desc${pageTokenParam}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro ao consultar Google Drive (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const files: GoogleDriveFile[] = (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size,
    modifiedTime: f.modifiedTime,
    webViewLink: f.webViewLink,
    webContentLink: f.webContentLink,
    iconLink: f.iconLink,
    thumbnailLink: f.thumbnailLink,
    parents: f.parents,
    isFolder: f.mimeType === 'application/vnd.google-apps.folder',
  }));

  return {
    files,
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Create a new folder in Google Drive
 */
export async function createGoogleDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<GoogleDriveFile> {
  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const response = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro ao criar pasta no Google Drive (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    mimeType: data.mimeType,
    isFolder: true,
  };
}

/**
 * Upload a file (File, Blob, or text) to Google Drive via multipart/related
 */
export async function uploadToGoogleDrive(
  accessToken: string,
  fileContent: Blob | File | string,
  name: string,
  mimeType: string,
  parentFolderId?: string
): Promise<GoogleDriveFile> {
  const metadata: any = {
    name,
    mimeType,
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = 'foo_bar_baz_boundary_' + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let contentBlob: Blob;
  if (typeof fileContent === 'string') {
    contentBlob = new Blob([fileContent], { type: mimeType });
  } else {
    contentBlob = fileContent;
  }

  const metadataString = JSON.stringify(metadata);

  // Construct multipart request body using Blob parts
  const multipartBody = new Blob(
    [
      delimiter,
      'Content-Type: application/json; charset=UTF-8\r\n\r\n',
      metadataString,
      delimiter,
      `Content-Type: ${mimeType}\r\n\r\n`,
      contentBlob,
      closeDelimiter,
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const response = await fetch(`${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,size,modifiedTime`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro ao enviar arquivo para o Google Drive (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    mimeType: data.mimeType,
    webViewLink: data.webViewLink,
    webContentLink: data.webContentLink,
    size: data.size,
    modifiedTime: data.modifiedTime,
    isFolder: false,
  };
}

/**
 * Delete a file or folder in Google Drive (Destructive operation - requires user confirmation)
 */
export async function deleteFromGoogleDrive(
  accessToken: string,
  fileId: string
): Promise<void> {
  const response = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorBody = await response.text();
    throw new Error(`Erro ao excluir arquivo no Google Drive (${response.status}): ${errorBody}`);
  }
}

/**
 * Automatically creates standardized RH folders for an employer
 */
export async function initializeHRFoldersInDrive(
  accessToken: string,
  empresaNome: string
): Promise<{
  rootFolder: GoogleDriveFile;
  subfolders: { [key: string]: GoogleDriveFile };
}> {
  // 1. Create Root Folder
  const rootFolderName = `[Portal DP] ${empresaNome} - Repositório Oficial`;
  const rootFolder = await createGoogleDriveFolder(accessToken, rootFolderName);

  // 2. Create subfolders
  const subfolderNames = [
    '01_Dossies_Admissionais_eSocial',
    '02_Holerites_e_Recibos_Pagamento',
    '03_Atestados_Medicos_e_Faltas',
    '04_Auditoria_LGPD_e_Parametrizacao',
    '05_Documentos_Institucionais',
  ];

  const subfolders: { [key: string]: GoogleDriveFile } = {};

  for (const name of subfolderNames) {
    const sub = await createGoogleDriveFolder(accessToken, name, rootFolder.id);
    subfolders[name] = sub;
  }

  return { rootFolder, subfolders };
}

/**
 * Utility to format byte size nicely
 */
export function formatDriveFileSize(bytes?: string | number): string {
  if (!bytes) return '—';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num <= 0) return '—';
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1024 * 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  return `${(num / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Utility to translate MIME types to friendly labels
 */
export function getDriveMimeLabel(mimeType: string): { label: string; color: string } {
  if (mimeType === 'application/vnd.google-apps.folder') {
    return { label: 'Pasta', color: 'bg-amber-100 text-amber-800' };
  }
  if (mimeType.includes('pdf')) {
    return { label: 'PDF', color: 'bg-rose-100 text-rose-800' };
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel')) {
    return { label: 'Planilha/CSV', color: 'bg-emerald-100 text-emerald-800' };
  }
  if (mimeType.includes('document') || mimeType.includes('word')) {
    return { label: 'Documento', color: 'bg-blue-100 text-blue-800' };
  }
  if (mimeType.includes('image')) {
    return { label: 'Imagem', color: 'bg-purple-100 text-purple-800' };
  }
  return { label: 'Arquivo', color: 'bg-slate-100 text-slate-700' };
}
