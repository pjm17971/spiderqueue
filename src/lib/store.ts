import { nanoid } from 'nanoid';
import type { Project, User as AppUser, Workspace } from '../types';

export type WorkspaceMember = {
  email: string;
  role: 'owner' | 'admin' | 'member';
};

export type StoredWorkspace = Omit<Workspace, 'projects' | 'users' | 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  projects: Project[];
  members: WorkspaceMember[];
};

export type Invite = {
  id: string;
  code: string; // user needs this plus email to join
  email: string;
  workspaceId: string;
  createdAt: string;
};

const LS_KEY = 'spiderqueue_store_v1';

export type StoreShape = {
  workspaces: StoredWorkspace[];
  invites: Invite[];
};

function readStore(): StoreShape {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return { workspaces: [], invites: [] };
  try {
    return JSON.parse(raw) as StoreShape;
  } catch {
    return { workspaces: [], invites: [] };
  }
}

function writeStore(store: StoreShape) {
  localStorage.setItem(LS_KEY, JSON.stringify(store));
}

export function getUserWorkspaces(email: string): StoredWorkspace[] {
  const s = readStore();
  return s.workspaces.filter(w => w.members.some(m => m.email.toLowerCase() === email.toLowerCase()));
}

export function createWorkspace(name: string, ownerEmail: string): StoredWorkspace {
  const s = readStore();
  const now = new Date().toISOString();
  const ws: StoredWorkspace = {
    id: nanoid(10),
    name,
    description: '',
    createdAt: now,
    updatedAt: now,
    projects: [],
    members: [{ email: ownerEmail, role: 'owner' }],
  };
  s.workspaces.push(ws);
  writeStore(s);
  return ws;
}

export function renameWorkspace(wsId: string, name: string) {
  const s = readStore();
  const ws = s.workspaces.find(w => w.id === wsId);
  if (!ws) return;
  ws.name = name;
  ws.updatedAt = new Date().toISOString();
  writeStore(s);
}

export function listMembers(wsId: string): WorkspaceMember[] {
  const s = readStore();
  return s.workspaces.find(w => w.id === wsId)?.members ?? [];
}

export function inviteUser(wsId: string, email: string): Invite {
  const s = readStore();
  const inv: Invite = {
    id: nanoid(8),
    code: nanoid(6).toUpperCase(),
    email,
    workspaceId: wsId,
    createdAt: new Date().toISOString(),
  };
  s.invites.push(inv);
  writeStore(s);
  return inv;
}

export function acceptInvite(email: string, code: string): { success: boolean; workspace?: StoredWorkspace; message?: string } {
  const s = readStore();
  const inv = s.invites.find(i => i.code === code.toUpperCase() && i.email.toLowerCase() === email.toLowerCase());
  if (!inv) return { success: false, message: 'Invalid invite code or email' };

  const ws = s.workspaces.find(w => w.id === inv.workspaceId);
  if (!ws) return { success: false, message: 'Workspace not found' };

  if (!ws.members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
    ws.members.push({ email, role: 'member' });
  }

  // remove invite
  s.invites = s.invites.filter(i => i.id !== inv.id);
  ws.updatedAt = new Date().toISOString();
  writeStore(s);
  return { success: true, workspace: ws };
}

export function addProject(wsId: string, name: string, description = ''): Project | null {
  const s = readStore();
  const ws = s.workspaces.find(w => w.id === wsId);
  if (!ws) return null;
  const p: Project = {
    id: nanoid(10),
    name,
    description,
    workspaceId: wsId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  ws.projects.push(p);
  ws.updatedAt = new Date().toISOString();
  writeStore(s);
  return p;
}
