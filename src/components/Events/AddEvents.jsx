import React, { useState } from "react";
import axios from "axios";
import useSwalTheme from "../../utils/useSwalTheme";
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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { API_URL, headername, keypoint } from "../../utils/config";

const CreateEvent = () => {
  const [event, setEvent] = useState({
    event_name: "",
    event_host: "",
    event_venue: "",
    event_description: "",
    event_start_date: null,
    event_end_date: null,
    activate_event: false,
    required_receipt: false, // Default value is false
    certificateFile: null, // For file handling
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const SwalInstance = useSwalTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;

  
      setEvent((prevEvent) => ({
        ...prevEvent,
        [name]: value,
      }));
    
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEvent((prevEvent) => ({ ...prevEvent, certificateFile: file }));
  };

  const handleDateChange = (field) => (newValue) => {
    setEvent((prevEvent) => ({
      ...prevEvent,
      [field]: newValue ? newValue.format("YYYY-MM-DD") : null,
    }));
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
      text: "Do you want to create this event?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, create it!",
      cancelButtonText: "No, cancel!",
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("name", event.event_name);
    formData.append("host", event.event_host);
    formData.append("description", event.event_description);
    formData.append("start_date", event.event_start_date);
    formData.append("end_date", event.event_end_date);
    formData.append("active", event.activate_event);
    formData.append("required_receipt", event.required_receipt); // Ensure it's boolean
    formData.append("venue", event.event_venue);

    if (event.certificateFile) {
      formData.append("certificateFile", event.certificateFile);
    }

    // Debugging: log the formData contents
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios.post(`${API_URL}/api/events/create_event`, formData, {
        headers: {
          [headername]: keypoint,
          "Content-Type": "multipart/form-data", // Set content type to handle file upload
        },
      });

      SwalInstance.fire("Success", response.data.message, "success");
    } catch (error) {
      SwalInstance.fire("Error", "Failed to add event.", "error");
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Event
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Name"
                name="event_name"
                value={event.event_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Host"
                name="event_host"
                value={event.event_host}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Description"
                name="event_description"
                value={event.event_description}
                onChange={handleChange}
                multiline
                minRows={2}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={event.event_start_date ? dayjs(event.event_start_date) : null}
                  onChange={handleDateChange("event_start_date")}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date"
                  value={event.event_end_date ? dayjs(event.event_end_date) : null}
                  minDate={event.event_start_date ? dayjs(event.event_start_date) : undefined}
                  onChange={handleDateChange("event_end_date")}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Activate Event</InputLabel>
                <Select
                  name="activate_event"
                  value={event.activate_event}
                  onChange={handleChange}
                  label="Activate Event"
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Required Receipt</InputLabel>
                <Select
                  name="required_receipt"
                  value={event.required_receipt === null ? false : event.required_receipt} // Force boolean value
                  onChange={handleChange}
                  label="Required Receipt"
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Venue"
                name="event_venue"
                value={event.event_venue}
                onChange={handleChange}
                multiline
                minRows={2}
                required
              />
            </Grid>

          

           <Grid item xs={12}>
  <Button
    component="label"
    fullWidth
    variant="outlined"
    startIcon={<CloudUploadIcon />}
  >
    {event.certificateFile ? "Change Certificate" : "Upload Certificate (Optional)"}
    <input
      type="file"
      accept=".docx"
      hidden
      onChange={handleFileChange}
    />
  </Button>

  {event.certificateFile && (
    <Typography variant="body2" sx={{ mt: 1, wordBreak: "break-all" }}>
      Selected File: <strong>{event.certificateFile.name}</strong>
    </Typography>
  )}
</Grid>


            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Create Event"}
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

export default CreateEvent;
