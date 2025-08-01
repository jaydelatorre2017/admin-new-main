import React, { useState, useEffect } from "react";
import axios from "axios";
import useSwalTheme from "../../../utils/useSwalTheme";
import {
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Grid,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { API_URL, headername, keypoint } from "../../../utils/config";

dayjs.extend(customParseFormat);

const EditActivity = ({ activity, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [events, setEvents] = useState([]);
  const SwalInstance = useSwalTheme();

  const [form, setForm] = useState({
    title: "",
    description: "",
    activity_time: null,
    activity_date: "",
    event_id: "",
    evaluation_link: "",
    active_status: true, // Use boolean
  });

  useEffect(() => {
    if (activity) {
      setForm({
        title: activity.title || "",
        description: activity.description || "",
        activity_time: activity.activity_time ? dayjs(activity.activity_time, "hh:mm A") : null,
        activity_date: activity.activity_date || "",
        event_id: activity.event_id || "",
        evaluation_link: activity.evaluation_link || "",
        active_status: activity.active_status === true, // Ensure boolean
      });
    }
  }, [activity]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/events/get_event`, {
        headers: { [headername]: keypoint },
      });
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      SwalInstance.fire("Error", "Failed to fetch events.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "active_status") {
      setForm({ ...form, active_status: value === "true" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleTimeChange = (value) => {
    setForm({ ...form, activity_time: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        activity_time: form.activity_time ? dayjs(form.activity_time).format("HH:mm") : "",
      };
      await axios.put(`${API_URL}/api/activities/${activity.id}`, payload, {
        headers: { [headername]: keypoint },
      });
      setSnackbar({ open: true, message: "Activity updated!", severity: "success" });

      // SweetAlert Success
      SwalInstance.fire("Success!", "Activity has been updated successfully.", "success");

      if (onClose) onClose(true);
    } catch (err) {
      // SweetAlert Error
      SwalInstance.fire("Error", err.message || "Failed to update activity.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Edit Activity
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Title" name="title" value={form.title} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Description" name="description" value={form.description} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Activity Time"
                  value={form.activity_time}
                  onChange={handleTimeChange}
                  ampm={true}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Activity Date"
                name="activity_date"
                type="date"
                value={form.activity_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Evaluation Link"
                name="evaluation_link"
                value={form.evaluation_link}
                onChange={handleChange}
                placeholder="https://your-link.com/form"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Event</InputLabel>
                <Select name="event_id" value={form.event_id} onChange={handleChange} label="Event">
                  {events.map((event) => (
                    <MenuItem key={event.id} value={event.id}>
                      {event.name || event.event_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="active_status"
                  value={form.active_status.toString()}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Update Activity"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditActivity;
