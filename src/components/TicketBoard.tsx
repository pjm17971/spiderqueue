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
  users
}) => {
  const columns: { id: TicketStatus; title: string; color: string }[] = [
    { id: 'inbox', title: 'Inbox', color: '#e3f2fd' },
    { id: 'hold', title: 'Hold', color: '#fff3e0' },
    { id: 'on-deck', title: 'On Deck', color: '#f3e5f5' },
    { id: 'in-progress', title: 'In Progress', color: '#e8f5e8' },
    { id: 'done', title: 'Done', color: '#f1f8e9' }
  ];

  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  const filteredTickets = useMemo(() => {
    let filtered = tickets.filter(ticket => ticket.projectId === project.id);

    if (filterView === 'person' && selectedUser) {
      filtered = filtered.filter(ticket => ticket.assignedTo === selectedUser.id);
    }

    if (filterView === 'list' && selectedPeople.length > 0) {
      filtered = filtered.filter(ticket => 
        ticket.assignedTo && selectedPeople.includes(ticket.assignedTo)
      );
    }

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower) ||
        ticket.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(ticket =>
        selectedTags.every(tag => ticket.tags.includes(tag))
      );
    }

    return filtered;
  }, [tickets, project.id, filterView, selectedUser, selectedPeople, searchText, selectedTags]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getStatusCount = (status: TicketStatus) => filteredTickets.filter(t => t.status === status).length;

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    const toStatus = destination.droppableId as TicketStatus;
    onMoveTicket(draggableId, toStatus);
  };

  const TicketCard: React.FC<{ ticket: Ticket; index: number }> = ({ ticket, index }) => {
    const assigned = ticket.assignedTo ? userMap.get(ticket.assignedTo) : undefined;
    const displayName = assigned?.name || ticket.assignedTo || undefined;
    const downPos = useRef<{ x: number; y: number } | null>(null);

    return (
      <Draggable draggableId={ticket.id} index={index}>
        {(provided) => (
          <Card
            sx={{
              mb: 2,
              cursor: 'grab',
              '&:active': { cursor: 'grabbing' },
              '&:hover': { boxShadow: 3, transform: 'translateY(-2px)', transition: 'all 0.2s ease-in-out' },
              border: ticket.type === 'lent' ? '2px solid #ff9800' : '1px solid #e0e0e0',
              backgroundColor: ticket.type === 'lent' ? '#fff3e0' : 'background.paper'
            }}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onMouseDown={(e) => { downPos.current = { x: e.clientX, y: e.clientY }; }}
            onMouseUp={(e) => {
              const start = downPos.current;
              downPos.current = null;
              if (!start) { onTicketSelect(ticket); return; }
              const dx = Math.abs(e.clientX - start.x);
              const dy = Math.abs(e.clientY - start.y);
              if (dx < 3 && dy < 3) {
                onTicketSelect(ticket);
              }
            }}
          >
            <CardContent sx={{ p: 2 }}>
              {ticket.type === 'lent' && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LentIcon fontSize="small" sx={{ color: '#ff9800', mr: 0.5 }} />
                  <Typography variant="caption" color="warning.main">Lent</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1 }}>{ticket.title}</Typography>
                <Chip label={ticket.priority} size="small" sx={{ backgroundColor: getPriorityColor(ticket.priority), color: 'white', fontSize: '0.7rem', height: 20 }} />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.4 }}>
                {ticket.description.length > 100 ? `${ticket.description.substring(0, 100)}...` : ticket.description}
              </Typography>

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

  return (
    <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2} sx={{ height: '100%', p: 2 }}>
          {columns.map((column) => {
            const columnTickets = filteredTickets.filter(ticket => ticket.status === column.id);
            return (
              <Grid item xs key={column.id} sx={{ height: '100%' }}>
                <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: column.color, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{column.title}</Typography>
                      <Chip label={getStatusCount(column.id)} size="small" sx={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />
                    </Box>
                  </Box>

                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, minHeight: 100 }} ref={provided.innerRef} {...provided.droppableProps}>
                        {columnTickets.length === 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: 'text.secondary' }}>
                            <Typography variant="body2">No tickets</Typography>
                          </Box>
                        ) : (
                          columnTickets.map((ticket, index) => (
                            <TicketCard key={ticket.id} ticket={ticket} index={index} />
                          ))
                        )}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </DragDropContext>
    </Box>
  );
};

export default TicketBoard;

