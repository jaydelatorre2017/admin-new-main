import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Link
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditActivity from "./EditActivity";
import { API_URL, headername, keypoint } from "../../../utils/config";
import useSwalTheme from "../../../utils/useSwalTheme";

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const SwalInstance = useSwalTheme();

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/activities`, {
        headers: { [headername]: keypoint },
      });
      setActivities(res.data || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line
  }, []);

  const handleEditClick = (activity) => {
    setSelectedActivity(activity);
    setEditOpen(true);
  };

  const handleEditClose = (refresh = false) => {
    setEditOpen(false);
    setSelectedActivity(null);
    if (refresh) fetchActivities();
  };

  const handleDelete = async (id) => {
    const result = await SwalInstance.fire({
      title: "Are you sure?",
      text: "This will permanently delete the activity.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/api/activities/${id}`, {
        headers: { [headername]: keypoint },
      });
      await SwalInstance.fire("Deleted!", "Activity deleted.", "success");
      fetchActivities();
    } catch (err) {
      SwalInstance.fire("Error", err.message || "Failed to delete.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter((activity) =>
    Object.values(activity)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "title", headerName: "Title", width: 160 },
    { field: "description", headerName: "Description", width: 200 },
    { field: "activity_time", headerName: "Time", width: 100 },
    { field: "activity_date", headerName: "Date", width: 120 },
    { field: "event_name", headerName: "Event", width: 180 },
    {
      field: "evaluation_link",
      headerName: "Evaluation",
      width: 160,
      renderCell: (params) =>
        params.value ? (
          <Link href={params.value} target="_blank" rel="noopener">
            Open Link
          </Link>
        ) : (
          "N/A"
        ),
    },
   {
  field: "active_status",
  headerName: "Status",
  width: 100,
  renderCell: (params) => {
    console.log("Active Status:", params.value); // Check the value here
    return (
      <Chip
        label={params.value ? "Active" : "Inactive"}
        color={params.value ? "success" : "default"}
        size="small"
      />
    );
  },
}
,
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <>
          <Tooltip title="Edit">
            <IconButton
              color="primary"
              onClick={() => handleEditClick(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 1200, mx: "auto" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Activities List
          </Typography>
          <TextField
            label="Search"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
        </Stack>
        <Box sx={{ height: 500 }}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              flexDirection="column"
            >
              <CircularProgress />
              <Typography mt={2}>Loading activities...</Typography>
            </Box>
          ) : (
            <DataGrid
              rows={filteredActivities}
              columns={columns}
              pageSize={7}
              rowsPerPageOptions={[7]}
              getRowId={(row) => row.id}
              sx={{ border: 0, fontSize: 14 }}
            />
          )}
        </Box>
      </Paper>

      <Dialog open={editOpen} onClose={() => handleEditClose(false)} >
        <DialogContent>
          {selectedActivity && (
            <EditActivity activity={selectedActivity} onClose={handleEditClose} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ActivityList;



