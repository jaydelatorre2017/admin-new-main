import React, { useEffect, useState } from 'react';
import axios from 'axios';
import IDCard from './IDCard';
import { API_URL, headername, keypoint } from '../../utils/config';
import {
  CircularProgress,
  IconButton,
  Box,
  Typography,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import './PrintIDCardsPage.css';

const PrintIDCardsPage = () => {
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [searchName, setSearchName] = useState('');

  const [schools, setSchools] = useState([]);
  const [offices, setOffices] = useState([]);
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/registration/get_all_id`, {
          headers: { [headername]: keypoint },
        });
        const data = response.data;
        setParticipants(data);
        setFilteredParticipants(data);

        setSchools([...new Set(data.map(p => p.school).filter(Boolean))]);
        setOffices([...new Set(data.map(p => p.office).filter(Boolean))]);
        setDivisions([...new Set(data.map(p => p.division_name).filter(Boolean))]);
      } catch (error) {
        console.error('Failed to fetch participants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = participants;

    if (selectedSchool) {
      filtered = filtered.filter(p => p.school === selectedSchool);
    }
    if (selectedOffice) {
      filtered = filtered.filter(p => p.office === selectedOffice);
    }
    if (selectedDivision) {
      filtered = filtered.filter(p => p.division_name === selectedDivision);
    }
    if (searchName.trim()) {
      const search = searchName.toLowerCase();
      filtered = filtered.filter(p => p.full_name?.toLowerCase().includes(search));
    }

    setFilteredParticipants(filtered);
  }, [selectedSchool, selectedOffice, selectedDivision, searchName, participants]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom className="no-print">
        Participant ID Cards
      </Typography>

      {/* Filters */}
      <Box className="no-print" sx={{ mb: 3 }}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          flexWrap="wrap"
          alignItems="center"
          gap={2}
        >
          <TextField
            size="small"
            label="Search Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            sx={{ minWidth: 180 }}
          />

          <TextField
            size="small"
            select
            label="School"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Schools</MenuItem>
            {schools.map((school) => (
              <MenuItem key={school} value={school}>
                {school}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            select
            label="Office"
            value={selectedOffice}
            onChange={(e) => setSelectedOffice(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Offices</MenuItem>
            {offices.map((office) => (
              <MenuItem key={office} value={office}>
                {office}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            select
            label="Division"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Divisions</MenuItem>
            {divisions.map((division) => (
              <MenuItem key={division} value={division}>
                {division}
              </MenuItem>
            ))}
          </TextField>

          <Tooltip >
            <span>
              <IconButton
                color="primary"
                onClick={handlePrint}
                disabled={!filteredParticipants.length}
              >
                <PrintIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Cards */}
    {loading ? (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <CircularProgress />
  </Box>
) : filteredParticipants.length > 0 ? (
  <>
    {Array.from({ length: Math.ceil(filteredParticipants.length / 4) }).map((_, pageIndex) => (
      <Box className="id-grid" key={pageIndex}>
        {filteredParticipants
          .slice(pageIndex * 4, pageIndex * 4 + 4)
          .map((participant) => (
            <div key={participant.id} className="id-item">
              <IDCard participant={participant} />
            </div>
          ))}
      </Box>
    ))}
  </>
) : (
  <Typography align="center" color="textSecondary" sx={{ mt: 5 }}>
    No participants found.
  </Typography>
)}

    </Box>
  );
};

export default PrintIDCardsPage;
