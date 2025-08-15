export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  projects: Project[];
  users: User[];
  createdAt: Date;
  updatedAt: Date;
}

export type TicketStatus = 'inbox' | 'hold' | 'on-deck' | 'in-progress' | 'done';

export type TicketType = 'assigned' | 'lent';

export interface TicketHistory {
  id: string;
  action: 'created' | 'assigned' | 'lent' | 'returned' | 'moved' | 'commented';
  fromStatus?: TicketStatus;
  toStatus?: TicketStatus;
  fromUser?: User;
  toUser?: User;
  fromProject?: Project;
  toProject?: Project;
  comment?: string;
  timestamp: Date;
  userId: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: TicketStatus;
  type: TicketType;
  projectId: string;
  assignedTo?: string; // User ID
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  history: TicketHistory[];
  lentFrom?: {
    projectId?: string;
    userId?: string;
    comment: string;
  };
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface CreateTicketData {
  title: string;
  description: string;
  tags: string[];
  projectId: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  comment?: string;
}

export interface FilterOptions {
  view: 'home' | 'person' | 'list';
  people: string[];
  searchText: string;
  tags: string[];
}

