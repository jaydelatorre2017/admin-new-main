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
import { API_URL, headername, keypoint } from '../../../utils/config';

const CreateActivity = () => {
  const [Event, setEvent] = useState({
    event_name: "",
    event_host: "",
    event_venue: "",
    event_description: "",
    event_start_date: "",
    event_end_date: "",
    activate_event: false,
    required_receipt: false,
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [events, setEvents] = useState([]); // Store fetched events

  const SwalInstance = useSwalTheme();

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/events/get_event`, {
        headers: { [headername]: keypoint }
      });
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response from server");
      }
      setEvents(response.data); // Store events in state
    } catch (error) {
      SwalInstance.fire({
        icon: "error",
        title: "Oops...",
        text: error.message || "Something went wrong while fetching the events!",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add activity state
  const [activity, setActivity] = useState({
    title: "",
    description: "",
    activity_time: null, // Use null for Dayjs object
    activity_date: "",
    event_id: "",
    evaluation_link: "",
    active_status: false,
  });

  const handleChange = (e) => {
    setEvent({ ...Event, [e.target.name]: e.target.value });
  };

  // Handle activity form changes
  const handleActivityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setActivity({
      ...activity,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleTimeChange = (newValue) => {
    setActivity({ ...activity, activity_time: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      SwalInstance.fire({
        icon: "error",
        title: "No Internet",
        text: "You are currently offline. Please check your connection.",
        toast: true,
        timer: 3000,
        position: "top-end",
        showConfirmButton: false,
      });
      return;
    }

    const result = await SwalInstance.fire({
      title: "Are you sure?",
      text: "Do you want to create this Event?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, create it!",
      cancelButtonText: "No, cancel!",
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const payload = {
        name: Event.event_name,
        host: Event.event_host,
        description: Event.event_description,
        start_date: Event.event_start_date,
        end_date: Event.event_end_date,
        active: Event.activate_event,
        required_reciept: Event.required_receipt,
        venue: Event.event_venue,
      };

      const response = await axios.post(`${API_URL}/api/activities`, payload,{
        headers: { [headername]: keypoint }
      });

      SwalInstance.fire("Success", response.data.message, "success");
    } catch (error) {
      SwalInstance.fire("Error", "Failed to add Event.", "error");
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

const handleActivitySubmit = async (e) => {
  e.preventDefault();

  if (!activity.title || !activity.description || !activity.activity_time || !activity.activity_date || !activity.event_id) {
    SwalInstance.fire("Error", "Please fill in all required fields.", "error");
    return;
  }

  setLoading(true);
  try {
    const payload = {
      title: activity.title,
      description: activity.description,
      activity_time: dayjs(activity.activity_time).format("HH:mm"),
      activity_date: activity.activity_date,
      event_id: activity.event_id,
      evaluation_link: activity.evaluation_link,
      active_status: activity.active_status,
    };

    const response = await axios.post(`${API_URL}/api/activities`, payload, {
      headers: { [headername]: keypoint }
    });

    SwalInstance.fire("Success", "Activity created!", "success");

    // Reset form after success
    setActivity({
      title: "",
      description: "",
      activity_time: null,
      activity_date: "",
      event_id: "",
      evaluation_link: "",
      active_status: false,
    });

  } catch (error) {
    SwalInstance.fire("Error", error.response?.data?.error || error.message || "Failed to add activity.", "error");
  } finally {
    setLoading(false);
  }
};

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Create Activity</Typography>
        <form onSubmit={handleActivitySubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={activity.title}
                onChange={handleActivityChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={activity.description}
                onChange={handleActivityChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Activity Time"
                  value={activity.activity_time}
                  onChange={handleTimeChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Activity Date"
                name="activity_date"
                type="date"
                value={activity.activity_date}
                onChange={handleActivityChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Evaluation Link"
                name="evaluation_link"
                value={activity.evaluation_link}
                onChange={handleActivityChange}
              />
            </Grid>
              <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Event</InputLabel>
                <Select
                  name="event_id"
                  value={activity.event_id}
                  onChange={handleActivityChange}
                  label="Event"
                >
                  {events.map((event) => (
                    <MenuItem key={event.id} value={event.id}>
                      {event.name || event.event_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel shrink>Active Status</InputLabel>
                <Select
                  name="active_status"
                  value={activity.active_status}
                  onChange={handleActivityChange}
                  label="Active Status"
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Create Activity"}
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

export default CreateActivity;
