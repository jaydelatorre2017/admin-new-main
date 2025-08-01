import { useEffect, useState } from "react";
import {
  Typography, TextField, CircularProgress,Paper, Button, MenuItem, useTheme, Box,IconButton, Tooltip 
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { API_URL, headername, keypoint } from "../utils/config";
import LockOpenIcon from "@mui/icons-material/LockOpen"; // for grant access
import LockIcon from "@mui/icons-material/Lock"; // for revoke access

const CustomNoRowsOverlay = () => (
  <Box className="flex flex-col items-center justify-center h-full">
    <SearchIcon color="disabled" sx={{ fontSize: 48, marginBottom: 1 }} />
    <Typography color="text.secondary">No Data Available</Typography>
  </Box>
);

const RegistrationTable = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [registrations, setRegistrations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [school, setSchool] = useState("");
  const [event, setEvent] = useState("");

  useEffect(() => {
 const fetchData = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${API_URL}/api/registration/get`, {
      headers: {
        "Content-Type": "application/json",
        [headername]: keypoint,
      },
    });

    const data = await res.json();
    console.log("Fetched registration data:", data);

    if (Array.isArray(data)) {
      setRegistrations(data);
      setFiltered(data);
    } else if (Array.isArray(data.data)) {
      setRegistrations(data.data);
      setFiltered(data.data);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (err) {
    console.error("Error fetching registrations:", err);
    setRegistrations([]);
    setFiltered([]);
  }
  setLoading(false);
};

    fetchData();
  }, []);

  useEffect(() => {
    let data = registrations;

    if (division) data = data.filter(r => r.division_name === division);
    if (district) data = data.filter(r => r.district_name === district);
    if (school) data = data.filter(r => r.school === school);
    if (event) data = data.filter(r => r.event_name === event);
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(r =>
        r.name?.toLowerCase().includes(s) ||
        r.email_address?.toLowerCase().includes(s) ||
        r.school?.toLowerCase().includes(s) ||
        r.or_number?.toString().includes(s) ||
        r.phone_number?.toString().includes(s) ||
        r.position?.toLowerCase().includes(s)
      );
    }

    setFiltered(data);
  }, [search, division, district, school, event, registrations]);

  useEffect(() => {
    setDistrict("");
    setSchool("");
  }, [division]);

  useEffect(() => {
    setSchool("");
  }, [district]);

  const handleExportCSV = () => {
    if (!filtered.length) return;

    const fields = ['full_name','email_address','division_name','district_name','school','or_number','payment_date','food_restriction','position','registration_date'];
    const csv = [
      fields.join(','),
      ...filtered.map(row => fields.map(field => JSON.stringify(row[field] ?? "")).join(','))
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registered_participants.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSelected = async () => {
    if (!selectedRows.length) return;

    const res = await Swal.fire({
      title: `Delete ${selectedRows.length} selected?`,
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete",
    });

    if (!res.isConfirmed) return;

    setLoading(true);
    try {
      const delRes = await fetch(`${API_URL}/api/registration/delete_bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [headername]: keypoint,
        },
        body: JSON.stringify({ ids: selectedRows }),
      });

      if (delRes.ok) {
        const updated = registrations.filter(r => !selectedRows.includes(r.id));
        setRegistrations(updated);
        setFiltered(updated);
        setSelectedRows([]);
        Swal.fire("Deleted!", "Selected participants removed.", "success");
      } else throw new Error();
    } catch {
      Swal.fire("Error", "Failed to delete selected.", "error");
    }
    setLoading(false);
  };
const handleUpdateCertificateAccess = async (access) => {
  if (!selectedRows.length) return;

  const confirm = await Swal.fire({
    title: `Set certificate access to "${access ? 'Yes' : 'No'}" for ${selectedRows.length} selected?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
  });

  if (!confirm.isConfirmed) return;

  setLoading(true);
  try {
    const res = await fetch(`${API_URL}/api/registration/update-certificate-access`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        [headername]: keypoint,
      },
      body: JSON.stringify({ ids: selectedRows, access }),
    });

    if (res.ok) {
      const updated = registrations.map((r) =>
        selectedRows.includes(r.id) ? { ...r, certificate_access: access } : r
      );
      setRegistrations(updated);
      setFiltered(updated);
      setSelectedRows([]);
      Swal.fire("Success", "Certificate access updated.", "success");
    } else {
      throw new Error();
    }
  } catch {
    Swal.fire("Error", "Failed to update certificate access.", "error");
  }
  setLoading(false);
};

  const columns = [
    { field: 'full_name', headerName: 'Name', width: 200 },
    { field: 'email_address', headerName: 'Email', width: 220 },
    { field: 'event_name', headerName: 'Event', width: 160 },
    { field: 'division_name', headerName: 'Division', width: 150 },
    { field: 'district_name', headerName: 'District', width: 200 },
    { field: 'school', headerName: 'School', width: 200 },
    {
      field: 't_shirt_size',
      headerName: 'T-Shirt Size',
      width: 120,
      renderCell: ({ value }) => value ?? 'None',
    },
    {
      field: 'payment_date',
      headerName: 'Payment Date',
      width: 120,
      renderCell: ({ value }) => value || 'None',
    },
    { field: 'phone_number', headerName: 'Phone Number', width: 150 },
    {
      field: 'or_receipt_url',
      headerName: 'Receipt',
      width: 130,
     renderCell: ({ value }) => (
  <span
    onClick={() => {
      if (!value) return Swal.fire("No Receipt Available", "", "info");

      Swal.fire({
        title: 'Loading receipt...',
        html: '<div class="swal2-loader"></div>',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const img = new Image();
      img.crossOrigin = "anonymous"; // required for canvas access
      img.src = value;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

    

        const anonymizedDataUrl = canvas.toDataURL();

        Swal.fire({
          title: 'Receipt',
          imageUrl: anonymizedDataUrl,
          imageAlt: 'Anonymized Receipt',
          confirmButtonText: 'Close',
          width: 600,
        });
      };

      img.onerror = () => Swal.fire('Error', 'Failed to load receipt.', 'error');
    }}
    className="text-blue-600 underline cursor-pointer"
  >
    View Receipt
  </span>
)

    },
    {
      field: 'participant_image_url',
      headerName: 'Profile',
      width: 100,
      renderCell: ({ value }) => (
        <Box className="flex justify-center items-center w-full">
          {value ? (
            <img
            
              src={value}
               crossOrigin="anonymous"
              alt="participant"
              className="w-10 h-10 rounded-full border"
              style={{ borderColor: isDark ? '#555' : '#ccc' }}
            />
          ) : (
            <Typography variant="caption">N/A</Typography>
          )}
        </Box>
      )
    },
    { field: 'position', headerName: 'Position', width: 180 },
    { field: 'food_restriction', headerName: 'Food Restriction', width: 200 },
    { field: 'registration_date', headerName: 'Date Registered', width: 180 },
    {field:'certificate_access', headerName: 'Certificate Access', width: 180, renderCell: ({ value }) => value ? 'Yes' : 'No' },
  ];

  return (
    <Box className="p-2 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between gap-2 mb-4">
        <Typography variant="h4" fontWeight={600}>Registered Participants</Typography>
        <Typography color="text.secondary">
          Showing: <b>{filtered.length}</b> participant{filtered.length !== 1 ? 's' : ''}
        </Typography>
      </div>

      <Paper elevation={1} className="p-4 mb-4 rounded-2xl">
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center">
  <TextField label="Search" size="small" value={search} onChange={e => setSearch(e.target.value)} sx={{ minWidth: 180 }} />
  <TextField select label="Event" size="small" value={event} onChange={e => setEvent(e.target.value)} sx={{ minWidth: 160 }}>
    <MenuItem value="">All Events</MenuItem>
    {[...new Set(registrations.map(r => r.event_name).filter(Boolean))].map(opt => (
      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
    ))}
  </TextField>
  <TextField select label="Division" size="small" value={division} onChange={e => setDivision(e.target.value)} sx={{ minWidth: 160 }}>
    <MenuItem value="">All Divisions</MenuItem>
    {[...new Set(registrations.map(r => r.division_name).filter(Boolean))].map(opt => (
      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
    ))}
  </TextField>
  <TextField select label="District" size="small" value={district} onChange={e => setDistrict(e.target.value)} sx={{ minWidth: 160 }} disabled={!division}>
    <MenuItem value="">All</MenuItem>
    {[...new Set(registrations.filter(r => !division || r.division_name === division).map(r => r.district_name).filter(Boolean))].map(opt => (
      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
    ))}
  </TextField>
  <TextField select label="School" size="small" value={school} onChange={e => setSchool(e.target.value)} sx={{ minWidth: 160 }} disabled={!division && !district}>
    <MenuItem value="">All</MenuItem>
    {[...new Set(registrations.filter(r =>
      (!division || r.division_name === division) &&
      (!district || r.district_name === district)
    ).map(r => r.school).filter(Boolean))].map(opt => (
      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
    ))}
  </TextField>

  <Tooltip title="Export CSV">
    <span>
      <IconButton onClick={handleExportCSV} disabled={!filtered.length}>
        <DownloadIcon />
      </IconButton>
    </span>
  </Tooltip>

  <Tooltip title="Delete Selected">
    <span>
      <IconButton color="error" onClick={handleDeleteSelected} disabled={!selectedRows.length}>
        <DeleteIcon />
      </IconButton>
    </span>
  </Tooltip>

  <Tooltip title="Grant Certificate Access">
    <span>
      <IconButton color="success" onClick={() => handleUpdateCertificateAccess(true)} disabled={!selectedRows.length}>
        <LockOpenIcon />
      </IconButton>
    </span>
  </Tooltip>

  <Tooltip title="Revoke Certificate Access">
    <span>
      <IconButton color="warning" onClick={() => handleUpdateCertificateAccess(false)} disabled={!selectedRows.length}>
        <LockIcon />
      </IconButton>
    </span>
  </Tooltip>
</div>
      </Paper>

      <div className="h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <CircularProgress />
            <Typography mt={2} color="text.secondary">Loading participants...</Typography>
          </div>
        ) : (
          <DataGrid
            rows={filtered}
            columns={columns}
            getRowId={(row) => row.id}
            checkboxSelection
            onRowSelectionModelChange={setSelectedRows}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            slots={{ noRowsOverlay: CustomNoRowsOverlay }}
            sx={{
              fontSize: 14,
              '& .MuiDataGrid-columnHeaders': { backgroundColor: isDark ? '#1e1e1e' : '#f3f4f6', fontWeight: 'bold' },
              '& .MuiDataGrid-row:hover': { backgroundColor: isDark ? '#2a2d30' : '#f9f9f9' },
              '& .MuiDataGrid-footerContainer': { backgroundColor: isDark ? '#1e1e1e' : '#f3f4f6' },
            }}
          />
        )}
      </div>
    </Box>
  );
};

export default RegistrationTable;
