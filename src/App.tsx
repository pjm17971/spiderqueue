import React, { useEffect, useMemo, useState } from 'react';
import { 
  Box, 
  CssBaseline, 
  ThemeProvider, 
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import { Settings as SettingsIcon, Add as AddIcon, Mail as MailIcon, AccountCircle, AddCircleOutline } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';

// Components
import WorkspaceSelector from './components/WorkspaceSelector';
import ProjectSidebar from './components/ProjectSidebar';
import FilterBar from './components/FilterBar';
import TicketBoard from './components/TicketBoard';
import TicketDetail from './components/TicketDetail';
import CreateTicketDialog from './components/CreateTicketDialog';
import AuthGate from './components/AuthGate';
import WorkspaceSettingsDialog from './components/WorkspaceSettingsDialog';
import AcceptInviteDialog from './components/AcceptInviteDialog';
import WorkspaceCreateDialog from './components/WorkspaceCreateDialog';

// Types
import type { Project, Ticket, User, CreateTicketData } from './types';
import type { StoredWorkspace, WorkspaceMember } from './lib/store';

// Repo
import { getWorkspacesRepo } from './lib/repos/workspacesRepo';
import { signOutFirebase, isFirebaseEnabled } from './lib/firebase';
import { getProfilesRepo } from './lib/repos/profilesRepo';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

const drawerWidth = 280;

function App() {
  const repo = getWorkspacesRepo();
  const profiles = getProfilesRepo();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<StoredWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterView, setFilterView] = useState<'home' | 'person' | 'list'>('home');
  const [personMode, setPersonMode] = useState<'overview' | 'assign'>('overview');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Menus
  const [plusAnchor, setPlusAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const plusOpen = Boolean(plusAnchor);
  const profileOpen = Boolean(profileAnchor);

  useEffect(() => {
    (async () => {
      if (userEmail) {
        const list = await repo.getUserWorkspaces(userEmail);
        setWorkspaces(list);
        if (!selectedWorkspaceId && list.length > 0) setSelectedWorkspaceId(list[0].id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, refreshKey]);

  // Load members and resolve names
  useEffect(() => {
    (async () => {
      if (selectedWorkspaceId) {
        try {
          const m = await repo.listMembers(selectedWorkspaceId);
          const withNames = await Promise.all(m.map(async mem => ({ ...mem, name: (await profiles.getName(mem.email)) || mem.email })));
          setMembers(withNames as any);
        } catch { setMembers([]); }
      } else setMembers([]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkspaceId, refreshKey]);

  useEffect(() => {
    (async () => {
      if (selectedWorkspace && selectedProject) {
        const list = await repo.listTickets(selectedWorkspace.id, selectedProject.id);
        setTickets(list);
      } else setTickets([]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkspaceId, selectedProject?.id, refreshKey]);

  const selectedWorkspace = useMemo(
    () => workspaces.find(w => w.id === selectedWorkspaceId) || null,
    [workspaces, selectedWorkspaceId]
  );

  const workspaceUsers: User[] = useMemo(() => members.map((m: any) => ({ id: m.email, name: m.name || m.email, email: m.email } as User)), [members]);

  const handleSelectWorkspaceById = (id: string) => { setSelectedWorkspaceId(id); setSelectedProject(null); setSelectedUser(null); };

  const handleCreateWorkspace = async () => {
    if (!userEmail) return;
    const name = window.prompt('Workspace name');
    if (!name) return;
    await repo.createWorkspace(name, userEmail);
    setRefreshKey(k => k + 1);
  };

  const handleCreateWorkspaceViaDialog = async (name: string) => {
    if (!userEmail) return;
    const ws = await repo.createWorkspace(name, userEmail);
    setRefreshKey(k => k + 1);
    setSelectedWorkspaceId(ws.id);
  };

  const handleProjectSelect = (project: Project) => { setSelectedProject(project); setSelectedUser(null); };

  const handleCreateProject = async (name: string, description?: string) => {
    if (!selectedWorkspace) return;
    const created = await repo.addProject(selectedWorkspace.id, name, description);
    if (created) { setRefreshKey(k => k + 1); setSelectedProject(created); }
  };

  const handleFilterViewChange = (view: 'home' | 'person' | 'list') => {
    setFilterView(view);
    if (view !== 'list') { setSelectedPeople([]); setSearchText(''); setSelectedTags([]); }
  };

  const handlePeopleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as unknown as string[] | string;
    setSelectedPeople(typeof value === 'string' ? value.split(',') : value);
  };

  const handleCreateTicket = () => setIsCreateTicketOpen(true);
  const handleTicketSelect = (ticket: Ticket) => setSelectedTicket(ticket);
  const handleCloseTicketDetail = () => setSelectedTicket(null);
  const handleCloseCreateTicket = () => setIsCreateTicketOpen(false);

  const submitCreateTicket = async (data: CreateTicketData) => {
    if (!selectedWorkspace || !selectedProject) return;
    const created = await repo.createTicket(selectedWorkspace.id, selectedProject.id, data);
    setTickets(prev => [created, ...prev]);
  };

  const handleMoveTicket = async (ticketId: string, toStatus: 'inbox' | 'hold' | 'on-deck' | 'in-progress' | 'done') => {
    if (!selectedWorkspace || !selectedProject) return;
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: toStatus, updatedAt: new Date() } : t));
    try { await repo.updateTicketStatus(selectedWorkspace.id, selectedProject.id, ticketId, toStatus); }
    catch { const list = await repo.listTickets(selectedWorkspace.id, selectedProject.id); setTickets(list); }
  };

  const handleAssignTicket = async (ticketId: string, assigneeId: string | undefined, comment?: string) => {
    if (!selectedWorkspace || !selectedProject) return;
    const hist = { id: Math.random().toString(36).slice(2,10), action: 'assigned', toUser: assigneeId ? { id: assigneeId } as any : undefined, timestamp: new Date(), userId: 'web', comment } as any;
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignedTo: assigneeId, updatedAt: new Date(), history: [...t.history, hist] } : t));
    if (selectedTicket && selectedTicket.id === ticketId) setSelectedTicket({ ...selectedTicket, assignedTo: assigneeId, updatedAt: new Date(), history: [...selectedTicket.history, hist] });
    try { await repo.updateTicketAssignee(selectedWorkspace.id, selectedProject.id, ticketId, assigneeId, comment); }
    catch { const list = await repo.listTickets(selectedWorkspace.id, selectedProject.id); setTickets(list); const found = list.find(t => t.id === ticketId); if (found) setSelectedTicket(found); }
  };

  async function handleLogout() {
    try { if (isFirebaseEnabled()) await signOutFirebase(); } catch {}
    setUserEmail(null); setWorkspaces([]); setSelectedWorkspaceId(''); setSelectedProject(null); setTickets([]);
  }

  if (!userEmail) { return <AuthGate onAuthed={setUserEmail} />; }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <CssBaseline />
        
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">SPIDERQUEUE</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <WorkspaceSelector workspaces={workspaces.map(w => ({ id: w.id, name: w.name }))} selectedWorkspaceId={selectedWorkspaceId} onSelectById={handleSelectWorkspaceById} />
            <IconButton color="inherit" onClick={(e) => setPlusAnchor(e.currentTarget)} sx={{ ml: 1 }} aria-label="create-or-join"><AddCircleOutline /></IconButton>
            <Menu anchorEl={plusAnchor} open={plusOpen} onClose={() => setPlusAnchor(null)}>
              <MenuItem onClick={() => { setPlusAnchor(null); setIsCreateWsOpen(true); }}><ListItemIcon><AddIcon fontSize="small" /></ListItemIcon><ListItemText>Create new…</ListItemText></MenuItem>
              <MenuItem onClick={() => { setPlusAnchor(null); setIsInviteOpen(true); }}><ListItemIcon><MailIcon fontSize="small" /></ListItemIcon><ListItemText>Join existing…</ListItemText></MenuItem>
            </Menu>
            <IconButton color="inherit" onClick={() => setIsSettingsOpen(true)} disabled={!selectedWorkspace} sx={{ ml: 1 }} aria-label="workspace-settings"><SettingsIcon /></IconButton>
            <IconButton color="inherit" onClick={(e) => setProfileAnchor(e.currentTarget)} sx={{ ml: 1 }} aria-label="profile-menu"><AccountCircle /></IconButton>
            <Menu anchorEl={profileAnchor} open={profileOpen} onClose={() => setProfileAnchor(null)}>
              <MenuItem onClick={() => { setProfileAnchor(null); handleLogout(); }}><ListItemText>Log out</ListItemText></MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}>
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <ProjectSidebar projects={selectedWorkspace?.projects || []} selectedProject={selectedProject} onProjectSelect={handleProjectSelect} onCreateProject={handleCreateProject} />
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Toolbar />
          {selectedProject && (
            <>
              <FilterBar
                filterView={filterView}
                onFilterViewChange={setFilterView}
                selectedPeople={selectedPeople}
                onPeopleChange={handlePeopleChange}
                searchText={searchText}
                onSearchTextChange={setSearchText}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                onCreateTicket={handleCreateTicket}
                users={workspaceUsers}
                showListControls={filterView === 'list'}
                projectName={selectedProject.name}
                personMode={personMode}
                onPersonModeChange={setPersonMode}
              />

              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <TicketBoard
                  project={selectedProject}
                  tickets={tickets}
                  selectedUser={selectedUser}
                  filterView={filterView}
                  selectedPeople={selectedPeople}
                  searchText={searchText}
                  selectedTags={selectedTags}
                  onTicketSelect={handleTicketSelect}
                  onMoveTicket={handleMoveTicket}
                  users={workspaceUsers}
                  personMode={personMode}
                  onAssignToUser={handleAssignTicket}
                />
              </Box>
            </>
          )}
          {!selectedProject && (<Box sx={{ p: 3, textAlign: 'center' }}><Typography variant="h5" color="text.secondary">{selectedWorkspace ? 'Select or create a project to get started' : 'Create or select a workspace to get started'}</Typography></Box>)}
        </Box>

        {selectedTicket && (
          <TicketDetail
            ticket={selectedTicket}
            onClose={handleCloseTicketDetail}
            users={workspaceUsers}
            projects={selectedWorkspace ? selectedWorkspace.projects : [] as any}
            onAssign={async (ticketId, assigneeId, comment) => { await handleAssignTicket(ticketId, assigneeId, comment); }}
          />
        )}

        <CreateTicketDialog
          open={isCreateTicketOpen}
          onClose={handleCloseCreateTicket}
          project={selectedProject}
          users={workspaceUsers}
          onCreate={submitCreateTicket}
        />

        {selectedWorkspace && (
          <WorkspaceSettingsDialog
            open={isSettingsOpen}
            onClose={() => { setIsSettingsOpen(false); setRefreshKey(k => k + 1); }}
            workspace={selectedWorkspace}
          />
        )}

        <WorkspaceCreateDialog
          open={isCreateWsOpen}
          onClose={() => setIsCreateWsOpen(false)}
          onCreate={async (name) => { await handleCreateWorkspaceViaDialog(name); }}
        />

        <AcceptInviteDialog
          open={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          onAccepted={(wsId) => { setIsInviteOpen(false); setSelectedWorkspaceId(wsId); setRefreshKey(k => k + 1); }}
          currentEmail={userEmail!}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
