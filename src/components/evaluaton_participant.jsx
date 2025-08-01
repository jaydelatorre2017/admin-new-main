import React, { useEffect, useState } from 'react';
import {
  Typography, Grid, Box, TextField, Tooltip, CircularProgress,
  IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import useSwalTheme from '../utils/useSwalTheme';
import SearchIcon from '@mui/icons-material/Search';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import CancelIcon from '@mui/icons-material/Delete';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import StatCard from './Statistics';
import * as XLSX from 'xlsx';
import { API_URL, headername, keypoint } from '../utils/config';

const EvaluationParticipant = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const SwalInstance = useSwalTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/evaluation_participant`, {
          headers: { [headername]: keypoint }
        });

        const json = await response.json();
        const withId = json.map((item, index) => ({ ...item, id: index + 1 }));
        setData(withId);
        setFiltered(withId);
        setLoading(false);
      } catch (error) {
        SwalInstance.close();
        SwalInstance.fire({ icon: 'error', title: 'Error', text: 'Failed to load evaluation data.' });
      }
    };

    fetchData();
  }, [SwalInstance]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(q)
      )
    );
    setFiltered(filtered);
  }, [searchQuery, data]);

  const handleDeleteAll = async () => {
    const result = await SwalInstance.fire({
      title: 'Are you sure?',
      text: "This will delete all evaluation records permanently!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete all!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/evaluation_participant`, {
          method: 'DELETE',
          headers: { [headername]: keypoint }
        });

        if (response.ok) {
          SwalInstance.fire('Deleted!', 'All evaluation records have been deleted.', 'success');
          setData([]);
          setFiltered([]);
        } else {
          SwalInstance.fire('Error', 'Failed to delete records.', 'error');
        }
      } catch (error) {
        console.error(error);
        SwalInstance.fire('Error', 'Something went wrong.', 'error');
      }
    }
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'EvaluationParticipant');
    XLSX.writeFile(workbook, 'evaluation_participants.xlsx');
  };

  const columns = [
    { field: 'evaluation_id', headerName: 'ID', width: 100 },
    { field: 'participant_email', headerName: 'Participant Email', flex: 1.5 },
    { field: 'evaluation_date', headerName: 'Date', flex: 1 },
    { field: 'activity_name', headerName: 'Activity Name', flex: 1.5 },
    { field: 'event_name', headerName: 'Event Name', flex: 1.5 },
  ];

  const CustomNoRowsOverlay = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <SentimentDissatisfiedIcon sx={{ fontSize: 40, color: '#3D4751' }} />
      <Box sx={{ mt: 2 }}>No Evaluation Data</Box>
    </Box>
  );

  return (
    <Box sx={{ padding: '20px', width: '100%' }}>
      <Typography variant="h4" gutterBottom>Evaluation Participants</Typography>

      <Grid container spacing={2} alignItems="center" justifyContent="space-between" sx={{ marginBottom: "20px" }}>
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" gap={1}>
            <ManageHistoryIcon fontSize="medium" color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">Dashboard / Evaluation Participants</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
            <SearchIcon color="primary" />
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: '200px' }}
            />
            <Tooltip title="Export as Excel">
              <IconButton color="primary" onClick={handleExport}>
                <DownloadForOfflineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete All Records">
              <IconButton color="error" onClick={handleDeleteAll}>
                <CancelIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Evaluations"
            value={data.length}
            percentage="All participants"
            icon={<AllInboxIcon sx={{ color: "#fff" }} />}
          />
        </Grid>
      </Grid>

      <div style={{ height: 500, width: '100%' }}>
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
            <CircularProgress color="primary" />
            <Typography variant="body2" mt={2} color="text.secondary">Loading Evaluations...</Typography>
          </Box>
        ) : (
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            slots={{ noRowsOverlay: CustomNoRowsOverlay }}
          />
        )}
      </div>
    </Box>
  );
};

export default EvaluationParticipant;
