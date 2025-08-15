import { Workspace, Project, User, Ticket } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 'user2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: 'user3',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    avatar: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: 'user4',
    name: 'Emily Wilson',
    email: 'emily.wilson@company.com',
    avatar: 'https://i.pravatar.cc/150?img=4'
  },
  {
    id: 'user5',
    name: 'David Brown',
    email: 'david.brown@company.com',
    avatar: 'https://i.pravatar.cc/150?img=5'
  }
];

export const mockProjects: Project[] = [
  {
    id: 'project1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website',
    workspaceId: 'workspace1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'project2',
    name: 'Mobile App Development',
    description: 'iOS and Android app for customer engagement',
    workspaceId: 'workspace1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'project3',
    name: 'Database Migration',
    description: 'Migrate legacy database to new cloud infrastructure',
    workspaceId: 'workspace1',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'project4',
    name: 'Marketing Campaign',
    description: 'Q1 marketing campaign for new product launch',
    workspaceId: 'workspace1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-12')
  }
];

export const mockWorkspaces: Workspace[] = [
  {
    id: 'workspace1',
    name: 'SpiderRock Development',
    description: 'Main development workspace for all projects',
    projects: mockProjects,
    users: mockUsers,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20')
  }
];

export const mockTickets: Ticket[] = [
  {
    id: 'ticket1',
    title: 'Fix navigation menu bug',
    description: 'The navigation menu is not displaying correctly on mobile devices. Need to investigate and fix the responsive design issues.',
    tags: ['bug', 'frontend', 'mobile'],
    status: 'in-progress',
    type: 'assigned',
    projectId: 'project1',
    assignedTo: 'user1',
    createdBy: 'user2',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
    priority: 'high',
    history: [
      {
        id: 'hist1',
        action: 'created',
        timestamp: new Date('2024-01-18'),
        userId: 'user2'
      },
      {
        id: 'hist2',
        action: 'assigned',
        toUser: mockUsers[0],
        toStatus: 'in-progress',
        timestamp: new Date('2024-01-19'),
        userId: 'user2',
        comment: 'Please prioritize this mobile bug fix'
      }
    ]
  },
  {
    id: 'ticket2',
    title: 'Design new landing page',
    description: 'Create a modern, engaging landing page design for the new product launch. Include hero section, features, and call-to-action.',
    tags: ['design', 'frontend', 'landing-page'],
    status: 'on-deck',
    type: 'assigned',
    projectId: 'project1',
    assignedTo: 'user3',
    createdBy: 'user2',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-18'),
    priority: 'medium',
    history: [
      {
        id: 'hist3',
        action: 'created',
        timestamp: new Date('2024-01-17'),
        userId: 'user2'
      },
      {
        id: 'hist4',
        action: 'assigned',
        toUser: mockUsers[2],
        toStatus: 'on-deck',
        timestamp: new Date('2024-01-18'),
        userId: 'user2'
      }
    ]
  },
  {
    id: 'ticket3',
    title: 'Implement user authentication',
    description: 'Set up secure user authentication system with JWT tokens, password hashing, and session management.',
    tags: ['backend', 'security', 'authentication'],
    status: 'inbox',
    type: 'assigned',
    projectId: 'project2',
    createdBy: 'user1',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    priority: 'high',
    history: [
      {
        id: 'hist5',
        action: 'created',
        timestamp: new Date('2024-01-16'),
        userId: 'user1'
      }
    ]
  },
  {
    id: 'ticket4',
    title: 'Optimize database queries',
    description: 'Review and optimize slow database queries in the user management module. Focus on reducing query time and improving performance.',
    tags: ['backend', 'database', 'performance'],
    status: 'hold',
    type: 'assigned',
    projectId: 'project3',
    assignedTo: 'user4',
    createdBy: 'user1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-17'),
    priority: 'medium',
    history: [
      {
        id: 'hist6',
        action: 'created',
        timestamp: new Date('2024-01-15'),
        userId: 'user1'
      },
      {
        id: 'hist7',
        action: 'assigned',
        toUser: mockUsers[3],
        toStatus: 'hold',
        timestamp: new Date('2024-01-17'),
        userId: 'user1',
        comment: 'Waiting for database access credentials'
      }
    ]
  },
  {
    id: 'ticket5',
    title: 'Create social media graphics',
    description: 'Design graphics for social media campaign including Facebook, Twitter, and Instagram posts.',
    tags: ['design', 'marketing', 'social-media'],
    status: 'done',
    type: 'assigned',
    projectId: 'project4',
    assignedTo: 'user5',
    createdBy: 'user2',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-19'),
    priority: 'low',
    history: [
      {
        id: 'hist8',
        action: 'created',
        timestamp: new Date('2024-01-14'),
        userId: 'user2'
      },
      {
        id: 'hist9',
        action: 'assigned',
        toUser: mockUsers[4],
        toStatus: 'in-progress',
        timestamp: new Date('2024-01-15'),
        userId: 'user2'
      },
      {
        id: 'hist10',
        action: 'moved',
        fromStatus: 'in-progress',
        toStatus: 'done',
        timestamp: new Date('2024-01-19'),
        userId: 'user5'
      }
    ]
  },
  {
    id: 'ticket6',
    title: 'Review API documentation',
    description: 'Lent from Website Redesign project - need help reviewing the API documentation for accuracy and completeness.',
    tags: ['documentation', 'api', 'review'],
    status: 'inbox',
    type: 'lent',
    projectId: 'project2',
    assignedTo: 'user1',
    createdBy: 'user3',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    priority: 'medium',
    lentFrom: {
      projectId: 'project1',
      comment: 'Need your expertise in API documentation review'
    },
    history: [
      {
        id: 'hist11',
        action: 'created',
        timestamp: new Date('2024-01-18'),
        userId: 'user3'
      },
      {
        id: 'hist12',
        action: 'lent',
        fromProject: mockProjects[0],
        toProject: mockProjects[1],
        timestamp: new Date('2024-01-18'),
        userId: 'user3',
        comment: 'Need your expertise in API documentation review'
      }
    ]
  }
];

