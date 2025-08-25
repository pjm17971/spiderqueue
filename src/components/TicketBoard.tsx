import React, { useMemo, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  SwapHoriz as LentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Project, Ticket, User, TicketStatus } from '../types';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

interface TicketBoardProps {
  project: Project;
  tickets: Ticket[];
  selectedUser: User | null;
  filterView: 'home' | 'person' | 'list';
  selectedPeople: string[];
  searchText: string;
  selectedTags: string[];
  onTicketSelect: (ticket: Ticket) => void;
  onMoveTicket: (ticketId: string, toStatus: TicketStatus) => void;
  users: User[];
  personMode?: 'overview' | 'assign';
  onAssignToUser?: (ticketId: string, userId: string | undefined) => void;
}

const TicketBoard: React.FC<TicketBoardProps> = ({
  project,
  tickets,
  selectedUser,
  filterView,
  selectedPeople,
  searchText,
  selectedTags,
  onTicketSelect,
  onMoveTicket,
  users,
  personMode = 'overview',
  onAssignToUser
}) => {
  const columns: { id: TicketStatus; title: string; color: string }[] = [
    { id: 'inbox', title: 'Inbox', color: '#e3f2fd' },
    { id: 'hold', title: 'Hold', color: '#fff3e0' },
    { id: 'on-deck', title: 'On Deck', color: '#f3e5f5' },
    { id: 'in-progress', title: 'In Progress', color: '#e8f5e8' },
    { id: 'done', title: 'Done', color: '#f1f8e9' }
  ];

  const userMap = useMemo(() => {
    const map = new Map<string, User>(); users.forEach(u => map.set(u.id, u)); return map;
  }, [users]);

  const filteredTickets = useMemo(() => {
    let filtered = tickets.filter(ticket => ticket.projectId === project.id);
    if (filterView === 'person' && selectedUser) filtered = filtered.filter(ticket => ticket.assignedTo === selectedUser.id);
    if (filterView === 'list' && selectedPeople.length > 0) filtered = filtered.filter(ticket => ticket.assignedTo && selectedPeople.includes(ticket.assignedTo));
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(ticket => ticket.title.toLowerCase().includes(searchLower) || ticket.description.toLowerCase().includes(searchLower) || ticket.tags.some(tag => tag.toLowerCase().includes(searchLower)));
    }
    if (selectedTags.length > 0) filtered = filtered.filter(ticket => selectedTags.every(tag => ticket.tags.includes(tag)));
    return filtered;
  }, [tickets, project.id, filterView, selectedUser, selectedPeople, searchText, selectedTags]);

  const getPriorityColor = (priority: string) => ({ urgent: '#f44336', high: '#ff9800', medium: '#2196f3', low: '#4caf50' }[priority] || '#9e9e9e');
  const getStatusCount = (status: TicketStatus) => filteredTickets.filter(t => t.status === status).length;

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result; if (!destination) return;
    const dest = destination.droppableId;
    if (filterView === 'home' && personMode === 'assign') {
      // Assign mode: allow dropping into user columns or hold/inbox
      if (dest.startsWith('user:')) {
        const userId = dest.slice('user:'.length);
        if (onAssignToUser) onAssignToUser(draggableId, userId);
        return;
      }
      if (dest === 'inbox' || dest === 'hold') { onMoveTicket(draggableId, dest as TicketStatus); }
      return;
    }
    if (dest === source.droppableId) return;
    if (filterView === 'home' && personMode === 'overview') {
      // Overview: only allow inbox<->hold for unassigned
      if ((dest === 'inbox' || dest === 'hold') && (source.droppableId === 'inbox' || source.droppableId === 'hold')) {
        onMoveTicket(draggableId, dest as TicketStatus);
      }
      return;
    }
    // Home/List: normal move
    onMoveTicket(draggableId, dest as TicketStatus);
  };

  const TicketCard: React.FC<{ ticket: Ticket; index: number }> = ({ ticket, index }) => {
    const assigned = ticket.assignedTo ? userMap.get(ticket.assignedTo) : undefined;
    const displayName = assigned?.name || ticket.assignedTo || undefined;
    const downPos = useRef<{ x: number; y: number } | null>(null);
    return (
      <Draggable draggableId={ticket.id} index={index}>
        {(provided) => (
          <Card sx={{ mb: 2, cursor: 'grab', '&:active': { cursor: 'grabbing' }, '&:hover': { boxShadow: 3, transform: 'translateY(-2px)', transition: 'all 0.2s ease-in-out' }, border: ticket.type === 'lent' ? '2px solid #ff9800' : '1px solid #e0e0e0', backgroundColor: ticket.type === 'lent' ? '#fff3e0' : 'background.paper' }} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
            onMouseDown={(e) => { downPos.current = { x: e.clientX, y: e.clientY }; }}
            onMouseUp={(e) => { const start = downPos.current; downPos.current = null; if (!start) { onTicketSelect(ticket); return; } const dx = Math.abs(e.clientX - start.x); const dy = Math.abs(e.clientY - start.y); if (dx < 3 && dy < 3) onTicketSelect(ticket); }}>
            <CardContent sx={{ p: 2 }}>
              {ticket.type === 'lent' && (<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><LentIcon fontSize="small" sx={{ color: '#ff9800', mr: 0.5 }} /><Typography variant="caption" color="warning.main">Lent</Typography></Box>)}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1 }}>{ticket.title}</Typography>
                <Chip label={ticket.priority} size="small" sx={{ backgroundColor: getPriorityColor(ticket.priority), color: 'white', fontSize: '0.7rem', height: 20 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.4 }}>{ticket.description.length > 100 ? `${ticket.description.substring(0, 100)}...` : ticket.description}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {displayName ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{displayName.charAt(0).toUpperCase()}</Avatar>
                    <Typography variant="caption" color="text.secondary">{displayName}</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">Unassigned</Typography>
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary">{format(ticket.createdAt, 'MMM d')}</Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Draggable>
    );
  };

  // Render helpers
  const renderColumn = (colId: TicketStatus, title: string, bg: string, canDrop: boolean) => {
    const columnTickets = filteredTickets.filter(t => t.status === colId);
    const headerColor = canDrop ? 'inherit' : 'text.secondary';
    return (
      <Grid item xs key={colId} sx={{ height: '100%' }}>
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: canDrop ? bg : '#f5f5f5', border: '1px solid #e0e0e0' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: headerColor }}>{title}</Typography>
              <Chip label={getStatusCount(colId)} size="small" sx={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />
            </Box>
          </Box>
          <Droppable droppableId={colId}>
            {(provided) => (
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, minHeight: 100 }} ref={provided.innerRef} {...provided.droppableProps}>
                {columnTickets.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: 'text.secondary' }}><Typography variant="body2">No tickets</Typography></Box>
                ) : (
                  columnTickets.map((ticket, index) => (<TicketCard key={ticket.id} ticket={ticket} index={index} />))
                )}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </Paper>
      </Grid>
    );
  };

  const renderAssignBoard = () => {
    const inbox = filteredTickets.filter(t => t.status === 'inbox');
    const hold = filteredTickets.filter(t => t.status === 'hold');
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={2} sx={{ height: '100%', p: 2, flexWrap: 'nowrap' }}>
          {renderColumn('inbox', 'Inbox', '#e3f2fd', true)}
          {renderColumn('hold', 'Hold', '#fff3e0', true)}
          {/* User columns scroll horizontally */}
          <Grid item xs sx={{ height: '100%', minWidth: 0 }}>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', height: '100%' }}>
              {users.map(u => (
                <Paper key={u.id} sx={{ minWidth: 260, height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>{u.name.charAt(0).toUpperCase()}</Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{u.name}</Typography>
                  </Box>
                  <Droppable droppableId={`user:${u.id}`}>
                    {(provided) => (
                      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, minHeight: 100 }} ref={provided.innerRef} {...provided.droppableProps}>
                        {filteredTickets.filter(t => t.assignedTo === u.id).map((ticket, index) => (
                          <TicketCard key={ticket.id} ticket={ticket} index={index} />
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  if (filterView === 'home' && personMode === 'assign') {
    return (
      <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <DragDropContext onDragEnd={onDragEnd}>{renderAssignBoard()}</DragDropContext>
      </Box>
    );
  }

  // Home and Person Overview/List behave similar to original columns (with restrictions handled in onDragEnd)
  return (
    <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2} sx={{ height: '100%', p: 2 }}>
          {columns.map((c) => renderColumn(c.id, c.title, c.color, filterView !== 'home' || personMode !== 'overview' || c.id === 'inbox' || c.id === 'hold'))}
        </Grid>
      </DragDropContext>
    </Box>
  );
};

export default TicketBoard;

