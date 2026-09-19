import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebaseApp';

// Traduz os códigos de erro mais comuns do Firebase Auth para mensagens
// em português, compreensíveis para quem está usando o sistema.
export function traduzErroAuth(erro: unknown): string {
  const codigo = (erro as { code?: string })?.code || '';
  switch (codigo) {
    case 'auth/email-already-in-use':
      return 'Já existe uma conta cadastrada com este e-mail. Tente entrar em vez de cadastrar novamente.';
    case 'auth/invalid-email':
      return 'O e-mail informado não é válido.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Use pelo menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas seguidas. Aguarde um pouco antes de tentar de novo.';
    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet e tente novamente.';
    default:
      return 'Não foi possível concluir a operação. Tente novamente em instantes.';
  }
}

/**
 * Cria uma conta real de autenticação (e-mail/senha) no Firebase.
 * Retorna o UID gerado, que deve ser usado como ID do documento
 * do usuário na coleção do Firestore (empresas/{empresaId}/usuarios/{uid}).
 */
export async function criarContaAuth(email: string, senha: string): Promise<string> {
  const credencial = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
  return credencial.user.uid;
}

/**
 * Autentica um usuário já cadastrado com e-mail e senha.
 */
export async function entrarComEmailSenha(email: string, senha: string): Promise<string> {
  const credencial = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
  return credencial.user.uid;
}

export async function sairDaConta(): Promise<void> {
  await signOut(auth);
}

/**
 * Observa mudanças no estado de autenticação (login/logout em qualquer aba,
 * ou sessão restaurada automaticamente ao reabrir o navegador).
 */
export function observarAuth(callback: (usuarioFirebase: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
