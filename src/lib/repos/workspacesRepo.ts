import type { Project, Ticket, TicketStatus } from '../../types';
import type { StoredWorkspace, WorkspaceMember } from '../store';
import * as local from '../store';
import { isFirestoreEnabled } from '../config';
import { initFirebase } from '../firebase';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, Firestore, getDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import type { CreateTicketData } from '../../types';

function toDateSafe(value: any): Date {
  // Firestore Timestamp
  if (value && typeof value.toDate === 'function') return value.toDate();
  // Number (ms) or string
  if (typeof value === 'number' || typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  // Date
  if (value instanceof Date) return value;
  // Fallback
  return new Date();
}

export interface WorkspacesRepo {
  getUserWorkspaces(email: string): Promise<StoredWorkspace[]>;
  createWorkspace(name: string, ownerEmail: string): Promise<StoredWorkspace>;
  renameWorkspace(workspaceId: string, name: string): Promise<void>;
  listMembers(workspaceId: string): Promise<WorkspaceMember[]>;
  inviteUser(workspaceId: string, email: string): Promise<{ code: string }>;
  acceptInvite(email: string, code: string): Promise<{ success: boolean; workspaceId?: string; message?: string }>;
  addProject(workspaceId: string, name: string, description?: string): Promise<Project | null>;
  listTickets(workspaceId: string, projectId: string): Promise<Ticket[]>;
  createTicket(workspaceId: string, projectId: string, data: CreateTicketData): Promise<Ticket>;
  updateTicketStatus(workspaceId: string, projectId: string, ticketId: string, toStatus: TicketStatus): Promise<void>;
}

class LocalWorkspacesRepo implements WorkspacesRepo {
  async getUserWorkspaces(email: string) { return local.getUserWorkspaces(email); }
  async createWorkspace(name: string, ownerEmail: string) { return local.createWorkspace(name, ownerEmail); }
  async renameWorkspace(workspaceId: string, name: string) { return local.renameWorkspace(workspaceId, name); }
  async listMembers(workspaceId: string) { return local.listMembers(workspaceId); }
  async inviteUser(workspaceId: string, email: string) { const inv = local.inviteUser(workspaceId, email); return { code: inv.code }; }
  async acceptInvite(email: string, code: string) { const res = local.acceptInvite(email, code); return { success: res.success, workspaceId: res.workspace?.id, message: res.message }; }
  async addProject(workspaceId: string, name: string, description?: string) { return local.addProject(workspaceId, name, description); }
  async listTickets(_workspaceId: string, _projectId: string) { return []; }
  async createTicket(_workspaceId: string, projectId: string, data: CreateTicketData) {
    const now = new Date();
    return {
      id: nanoid(10),
      title: data.title,
      description: data.description,
      tags: data.tags,
      status: 'inbox',
      type: 'assigned',
      projectId,
      assignedTo: data.assignedTo,
      createdBy: 'local',
      createdAt: now,
      updatedAt: now,
      history: [],
      priority: data.priority,
    };
  }
  async updateTicketStatus(_workspaceId: string, _projectId: string, _ticketId: string, _toStatus: TicketStatus) {
    return; // local no-op; UI state is the source of truth in local mode
  }
}

class FirestoreWorkspacesRepo implements WorkspacesRepo {
  private db: Firestore;

  constructor() {
    initFirebase();
    this.db = getFirestore();
  }

  private async toStoredWorkspace(wsDoc: any): Promise<StoredWorkspace> {
    const ws = wsDoc.data();
    const membersQ = query(collection(this.db, 'memberships'), where('workspaceId', '==', wsDoc.id));
    const membersSnap = await getDocs(membersQ);
    const members: WorkspaceMember[] = membersSnap.docs.map(d => ({ email: d.data().email, role: d.data().role || 'member' }));

    const projectsSnap = await getDocs(collection(this.db, 'workspaces', wsDoc.id, 'projects'));
    const projects: Project[] = projectsSnap.docs.map(d => ({
      id: d.id,
      name: d.data().name,
      description: d.data().description || '',
      workspaceId: wsDoc.id,
      createdAt: toDateSafe(d.data().createdAt),
      updatedAt: toDateSafe(d.data().updatedAt),
    }));

    const stored: StoredWorkspace = {
      id: wsDoc.id,
      name: ws.name,
      description: ws.description || '',
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt,
      projects,
      members,
    };
    return stored;
  }

  async getUserWorkspaces(email: string): Promise<StoredWorkspace[]> {
    const qMembers = query(collection(this.db, 'memberships'), where('email', '==', email.toLowerCase()));
    const memSnap = await getDocs(qMembers);
    const wsIds = memSnap.docs.map(d => d.data().workspaceId);
    if (wsIds.length === 0) return [];

    const results: StoredWorkspace[] = [];
    const wsQ = query(collection(this.db, 'workspaces'), where('__name__', 'in', wsIds.slice(0, 10)));
    const wsSnap = await getDocs(wsQ);
    for (const d of wsSnap.docs) {
      results.push(await this.toStoredWorkspace(d));
    }
    return results;
  }

  async createWorkspace(name: string, ownerEmail: string): Promise<StoredWorkspace> {
    const now = new Date().toISOString();
    const wsRef = await addDoc(collection(this.db, 'workspaces'), {
      name,
      description: '',
      createdAt: now,
      updatedAt: now,
    });
    await addDoc(collection(this.db, 'memberships'), {
      workspaceId: wsRef.id,
      email: ownerEmail.toLowerCase(),
      role: 'owner',
    });
    const wsSnap = await getDocs(query(collection(this.db, 'workspaces'), where('__name__', '==', wsRef.id)));
    return this.toStoredWorkspace(wsSnap.docs[0]);
  }

  async renameWorkspace(workspaceId: string, name: string): Promise<void> {
    await updateDoc(doc(this.db, 'workspaces', workspaceId), { name, updatedAt: new Date().toISOString() });
  }

  async listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const qMembers = query(collection(this.db, 'memberships'), where('workspaceId', '==', workspaceId));
    const memSnap = await getDocs(qMembers);
    return memSnap.docs.map(d => ({ email: d.data().email, role: d.data().role || 'member' }));
  }

  async inviteUser(workspaceId: string, email: string): Promise<{ code: string }> {
    const code = nanoid(6).toUpperCase();
    await addDoc(collection(this.db, 'invites'), {
      code,
      email: email.toLowerCase(),
      workspaceId,
      createdAt: new Date().toISOString(),
    });
    return { code };
  }

  async acceptInvite(email: string, code: string): Promise<{ success: boolean; workspaceId?: string; message?: string }> {
    const qInv = query(collection(this.db, 'invites'), where('code', '==', code.toUpperCase()), where('email', '==', email.toLowerCase()));
    const invSnap = await getDocs(qInv);
    if (invSnap.empty) return { success: false, message: 'Invalid invite code or email' };
    const invDoc = invSnap.docs[0];
    const workspaceId = invDoc.data().workspaceId as string;

    const qMem = query(collection(this.db, 'memberships'), where('workspaceId', '==', workspaceId), where('email', '==', email.toLowerCase()));
    const memSnap = await getDocs(qMem);
    if (memSnap.empty) {
      await addDoc(collection(this.db, 'memberships'), { workspaceId, email: email.toLowerCase(), role: 'member' });
    }
    await deleteDoc(doc(this.db, 'invites', invDoc.id));
    return { success: true, workspaceId };
  }

  async addProject(workspaceId: string, name: string, description?: string): Promise<Project | null> {
    const now = new Date();
    const pRef = await addDoc(collection(this.db, 'workspaces', workspaceId, 'projects'), {
      name,
      description: description || '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    return {
      id: pRef.id,
      name,
      description: description || '',
      workspaceId,
      createdAt: now,
      updatedAt: now,
    };
  }

  async listTickets(workspaceId: string, projectId: string): Promise<Ticket[]> {
    const snap = await getDocs(collection(this.db, 'workspaces', workspaceId, 'projects', projectId, 'tickets'));
    return snap.docs.map(d => {
      const data = d.data();
      const hist = Array.isArray(data.history) ? data.history : [];
      const history = hist.map((h: any) => ({
        ...h,
        timestamp: toDateSafe(h?.timestamp),
      }));
      return {
        id: d.id,
        title: data.title,
        description: data.description,
        tags: data.tags || [],
        status: data.status || 'inbox',
        type: data.type || 'assigned',
        projectId,
        assignedTo: data.assignedTo || undefined,
        createdBy: data.createdBy || 'unknown',
        createdAt: toDateSafe(data.createdAt),
        updatedAt: toDateSafe(data.updatedAt),
        history,
        priority: data.priority || 'medium',
        lentFrom: data.lentFrom,
        dueDate: data.dueDate ? toDateSafe(data.dueDate) : undefined,
      } as Ticket;
    });
  }

  async createTicket(workspaceId: string, projectId: string, data: CreateTicketData): Promise<Ticket> {
    const now = new Date();
    const history = data.comment?.trim()
      ? [{ id: nanoid(8), action: 'created', timestamp: now.toISOString(), userId: data.assignedTo || 'unknown', comment: data.comment }]
      : [{ id: nanoid(8), action: 'created', timestamp: now.toISOString(), userId: data.assignedTo || 'unknown' }];

    const docRef = await addDoc(collection(this.db, 'workspaces', workspaceId, 'projects', projectId, 'tickets'), {
      title: data.title,
      description: data.description,
      tags: data.tags,
      status: 'inbox',
      type: 'assigned',
      assignedTo: data.assignedTo || null,
      createdBy: 'web',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      history,
      priority: data.priority,
    });

    return {
      id: docRef.id,
      title: data.title,
      description: data.description,
      tags: data.tags,
      status: 'inbox',
      type: 'assigned',
      projectId,
      assignedTo: data.assignedTo,
      createdBy: 'web',
      createdAt: now,
      updatedAt: now,
      history: history.map(h => ({ ...h, timestamp: now })) as any,
      priority: data.priority,
    } as Ticket;
  }

  async updateTicketStatus(workspaceId: string, projectId: string, ticketId: string, toStatus: TicketStatus): Promise<void> {
    const tRef = doc(this.db, 'workspaces', workspaceId, 'projects', projectId, 'tickets', ticketId);
    const snap = await getDoc(tRef);
    const data = snap.data() || {} as any;
    const hist = Array.isArray(data.history) ? data.history : [];
    const nowIso = new Date().toISOString();
    const fromStatus = data?.status || 'inbox';
    hist.push({ id: nanoid(8), action: 'moved', fromStatus, toStatus, timestamp: nowIso, userId: 'web' });
    await updateDoc(tRef, { status: toStatus, updatedAt: nowIso, history: hist });
  }
}

let repo: WorkspacesRepo | null = null;
export function getWorkspacesRepo(): WorkspacesRepo {
  if (!repo) {
    repo = isFirestoreEnabled() ? new FirestoreWorkspacesRepo() : new LocalWorkspacesRepo();
  }
  return repo;
}
