import React, { useEffect, useState } from "react";
import axios from "axios";
import useSwalTheme from '../../utils/useSwalTheme';
import { DataGrid } from '@mui/x-data-grid';
import {
  Typography,
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Paper,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import EditEventModal from './EditEventModal'; // 1. Import the modal
import { API_URL,headername,keypoint } from '../../utils/config';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false); // 2. Modal state
  const [selectedEvent, setSelectedEvent] = useState(null);  // 2. Selected event
  const SwalInstance = useSwalTheme();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const fetchEvents = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/events/get_event`,{
        headers: { [headername]: keypoint }
      });
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response from server");
      }
      setLoading(false);
      setEvents(response.data);
    } catch (error) {
      SwalInstance.fire({
        icon: "error",
        title: "Oops...",
        text: error.message || "Something went wrong while fetching the events!",
      });
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line 
  }, []);

  const deleteEvent = async (id) => {
    SwalInstance.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/api/events/delete_event/${id}`,{
            headers: { [headername]: keypoint }
          });
          fetchEvents();
          SwalInstance.fire("Deleted!", "The event has been removed.", "success");
        } catch (error) {
          SwalInstance.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong while deleting the event!",
          });
        }
      }
    });
  };

  const handleEdit = (event) => { // 3. Handle edit
    setSelectedEvent(event);
    setEditModalOpen(true);
  };

  const filteredEvents = events.filter(event =>
    Object.values(event)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

const columns = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: 'Name', width: 100, headerAlign: 'center' },
  { field: 'host', headerName: 'Host', width: 150, headerAlign: 'center' },
  { field: 'description', headerName: 'Description', width: 200, headerAlign: 'center' },
  { field: 'start_date', headerName: 'Start Date', width: 130, align: 'center', headerAlign: 'center' },
  { field: 'end_date', headerName: 'End Date', width: 130, align: 'center', headerAlign: 'center' },
  { field: 'venue', headerName: 'Venue', width: 120, align: 'center', headerAlign: 'center' },
  { field: 'required_reciept', headerName: 'Receipt Required', width: 140, align: 'center', headerAlign: 'center' },
  { field: 'active', headerName: 'Active', width: 100, align: 'center', headerAlign: 'center' },
{
  field: 'certificates_url',
  headerName: 'Certificate URL',
  width: 250,
  align: 'center',
  headerAlign: 'center',
  renderCell: (params) => {
    const url = params.value && params.value.trim() !== "" ? params.value : null;
    return url ? (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: isDark ? '#90caf9' : '#1976d2', textDecoration: 'underline' }}
      >
        Download
      </a>
    ) : (
      "No File"
    );
  }
}
,
  {
    field: 'actions',
    headerName: 'Actions',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => deleteEvent(params.row.id)} size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton color="primary" onClick={() => handleEdit(params.row)} size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
];


  const CustomNoRowsOverlay = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <EventIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
      <Typography color="text.secondary">No Data Available</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, bgcolor: isDark ? 'background.default' : '#f4f6f8', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{
        maxWidth: 1200,
        mx: 'auto',
        p: { xs: 2, sm: 4 },
        borderRadius: 3,
        bgcolor: isDark ? 'background.paper' : 'background.default'
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} mb={3}>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Events List
          </Typography>
          <TextField
            label="Search events"
            variant="outlined"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{
              style: {
                color: isDark ? '#fff' : undefined,
              }
            }}
            InputLabelProps={{
              style: {
                color: isDark ? '#aaa' : undefined,
              }
            }}
          />
        </Stack>
        <Box sx={{
          height: 480,
          width: '100%',
          '& .MuiDataGrid-root': {
            bgcolor: isDark ? 'background.paper' : 'background.paper',
            borderRadius: 2,
            color: isDark ? '#fff' : undefined,
          },
        
          '& .MuiDataGrid-row:hover': {
            bgcolor: isDark ? 'action.selected' : 'action.hover',
          },
        }}>
           {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
            <CircularProgress />
            <Typography mt={2} color="text.secondary">Loading Events...</Typography>
          </Box>
        ) :(
          <DataGrid
            rows={filteredEvents}
            columns={columns}
            pageSize={7}
            rowsPerPageOptions={[7]}
            columnVisibilityModel={{ id: false }}
            getRowId={(row) => row.id}
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
            }}
            sx={{
              border: 0,
              fontSize: 15,
              color: isDark ? '#fff' : undefined,
              bgcolor: isDark ? 'background.paper' : undefined,
            }}
          />)}
        </Box>
      </Paper>
      {/* 5. Render the modal */}
      <EditEventModal
        open={editModalOpen}
        handleClose={() => setEditModalOpen(false)}
        event={selectedEvent}
        fetchEvents={fetchEvents}
      />
    </Box>
  );
};

export default EventList;
