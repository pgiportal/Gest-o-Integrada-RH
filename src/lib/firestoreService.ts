import {
  collection,
  collectionGroup,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebaseApp';
import { Empresa, Usuario } from '../types';

// ---------------------------------------------------------------------------
// EMPRESAS
// ---------------------------------------------------------------------------

/**
 * Escuta em tempo real a lista de todas as empresas cadastradas no sistema.
 * Chama o callback sempre que uma empresa é criada/alterada por qualquer
 * pessoa, em qualquer dispositivo. Retorna a função para cancelar a escuta.
 */
export function escutarEmpresas(callback: (empresas: Empresa[]) => void): () => void {
  return onSnapshot(collection(db, 'empresas'), (snapshot) => {
    const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Empresa));
    callback(lista);
  });
}

export async function criarEmpresaFirestore(
  dados: Omit<Empresa, 'id' | 'criadoEm' | 'atualizadoEm'>
): Promise<Empresa> {
  const novoId = doc(collection(db, 'empresas')).id;
  const agora = new Date().toISOString();
  const novaEmpresa: Empresa = {
    ...dados,
    id: novoId,
    criadoEm: agora,
    atualizadoEm: agora,
  };
  await setDoc(doc(db, 'empresas', novoId), novaEmpresa);
  return novaEmpresa;
}

export async function atualizarEmpresaFirestore(empresaId: string, dados: Partial<Empresa>): Promise<void> {
  await updateDoc(doc(db, 'empresas', empresaId), {
    ...dados,
    atualizadoEm: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// USUÁRIOS (por empresa)
// ---------------------------------------------------------------------------

/**
 * Escuta em tempo real todos os usuários de uma empresa específica
 * (RH Admins, Colaboradores e Candidatos).
 */
export function escutarUsuariosDaEmpresa(
  empresaId: string,
  callback: (usuarios: Usuario[]) => void
): () => void {
  if (!empresaId) {
    callback([]);
    return () => {};
  }
  const ref = collection(db, 'empresas', empresaId, 'usuarios');
  return onSnapshot(ref, (snapshot) => {
    const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Usuario));
    callback(lista);
  });
}

/**
 * Escuta em tempo real os usuários de TODAS as empresas ao mesmo tempo,
 * combinando os resultados. Usado para manter o estado do app atualizado
 * conforme empresas são adicionadas/removidas dinamicamente.
 */
export function escutarTodosOsUsuarios(
  empresaIds: string[],
  callback: (usuarios: Usuario[]) => void
): () => void {
  if (empresaIds.length === 0) {
    callback([]);
    return () => {};
  }

  const acumulado = new Map<string, Usuario[]>();

  const unsubs = empresaIds.map((empresaId) =>
    escutarUsuariosDaEmpresa(empresaId, (usuariosDaEmpresa) => {
      acumulado.set(empresaId, usuariosDaEmpresa);
      const todos = Array.from(acumulado.values()).flat();
      callback(todos);
    })
  );

  return () => unsubs.forEach((fn) => fn());
}

/**
 * Cria (ou sobrescreve) o documento de um usuário dentro de uma empresa.
 * Quando o usuário tem login real (RH Admin / Colaborador), o `usuarioId`
 * deve ser o UID retornado pelo Firebase Authentication. Para perfis sem
 * login próprio ainda (ex.: candidato convidado manualmente), pode ser
 * um ID gerado localmente.
 */
export async function criarUsuarioFirestore(
  empresaId: string,
  usuarioId: string,
  dados: Omit<Usuario, 'id' | 'empresaId' | 'criadoEm' | 'atualizadoEm'>
): Promise<Usuario> {
  const agora = new Date().toISOString();
  const novoUsuario: Usuario = {
    ...dados,
    id: usuarioId,
    empresaId,
    criadoEm: agora,
    atualizadoEm: agora,
  };
  await setDoc(doc(db, 'empresas', empresaId, 'usuarios', usuarioId), novoUsuario);
  return novoUsuario;
}

export async function atualizarUsuarioFirestore(
  empresaId: string,
  usuarioId: string,
  dados: Partial<Usuario>
): Promise<void> {
  await updateDoc(doc(db, 'empresas', empresaId, 'usuarios', usuarioId), {
    ...dados,
    atualizadoEm: new Date().toISOString(),
  });
}

/**
 * Popula o Firestore com os dados de demonstração (empresa + usuários de
 * exemplo) na primeira vez que o sistema roda com um banco de dados vazio.
 * Usa os MESMOS IDs fixos dos dados de exemplo, então rodar mais de uma vez
 * (por duas pessoas abrindo o sistema ao mesmo tempo, por exemplo) apenas
 * sobrescreve os mesmos documentos, sem criar duplicados.
 */
export async function semearDadosIniciaisSeVazio(
  empresasIniciais: Empresa[],
  usuariosIniciais: Usuario[]
): Promise<void> {
  const snapshot = await getDocs(collection(db, 'empresas'));
  if (!snapshot.empty) return; // já existem dados reais, não mexe em nada

  await Promise.all(empresasIniciais.map((empresa) => setDoc(doc(db, 'empresas', empresa.id), empresa)));

  await Promise.all(
    usuariosIniciais.map((usuario) =>
      setDoc(doc(db, 'empresas', usuario.empresaId, 'usuarios', usuario.id), usuario)
    )
  );
}

export async function buscarUsuarioPorUid(uid: string): Promise<Usuario | null> {
  // Consulta pelo campo "id" salvo dentro do próprio documento (e não pelo
  // caminho do documento), pois comparar o ID do documento diretamente em
  // consultas "collection group" exigiria o caminho completo, que não
  // conhecemos ainda nesta etapa (é justamente o que estamos descobrindo).
  const q = query(collectionGroup(db, 'usuarios'), where('id', '==', uid));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Usuario;
}
