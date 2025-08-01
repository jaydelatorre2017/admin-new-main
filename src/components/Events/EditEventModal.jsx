import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import useSwalTheme from "../../utils/useSwalTheme";
import dayjs from "dayjs";
import { API_URL, headername, keypoint } from "../../utils/config";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const EditEventModal = ({ open, handleClose, event, fetchEvents }) => {
  const [formValues, setFormValues] = useState({
    id: null,
    event_name: "",
    event_host: "",
    event_description: "",
    event_start_date: "",
    event_end_date: "",
    event_venue: "",
    activate_event: false,
    required_receipt: false,
  });

  const [certificateFile, setCertificateFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const SwalInstance = useSwalTheme();

  useEffect(() => {
    if (event) {
      setFormValues({
        id: event.id || null,
        event_name: event.name || "",
        event_host: event.host || "",
        event_description: event.description || "",
        event_start_date: event.start_date || "",
        event_end_date: event.end_date || "",
        event_venue: event.venue || "",
        activate_event: event.active ?? false,
        required_receipt: event.required_reciept ?? false,
      });
      setCertificateFile(null);
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue =
      name === "activate_event" || name === "required_receipt"
        ? value === "true" || value === true
        : value;

    setFormValues((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleDateChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value ? dayjs(value).format("YYYY-MM-DD") : "",
    }));
  };

  const handleFileChange = (e) => {
    setCertificateFile(e.target.files[0]);
  };

  const checkInternet = () => {
    if (!navigator.onLine) {
      SwalInstance.fire({
        icon: "error",
        title: "No Internet",
        text: "You are currently offline.",
        toast: true,
        timer: 3000,
        position: "top-end",
        showConfirmButton: false,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
        handleClose();
    if (!checkInternet()) return;

    const result = await SwalInstance.fire({
      title: "Are you sure?",
      text: "Do you want to update this event?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setLoading(true);


    try {
      const formData = new FormData();
      formData.append("name", formValues.event_name);
      formData.append("host", formValues.event_host);
      formData.append("description", formValues.event_description);
      formData.append("start_date", formValues.event_start_date);
      formData.append("end_date", formValues.event_end_date);
      formData.append("venue", formValues.event_venue);
      formData.append("active", formValues.activate_event);
      formData.append("required_reciept", formValues.required_receipt);

      if (certificateFile) {
        formData.append("certificateFile", certificateFile);
      }

      await axios.put(
        `${API_URL}/api/events/update_event/${formValues.id}`,
        formData,
        {
          headers: {
            [headername]: keypoint,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchEvents();
      handleClose();

      SwalInstance.fire({
        icon: "success",
        title: "Updated!",
        text: "Event updated successfully.",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Update error:", error);
      SwalInstance.fire("Error!", "Failed to update event.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Event</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Event Name"
              name="event_name"
              value={formValues.event_name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Event Host"
              name="event_host"
              value={formValues.event_host}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Event Description"
              name="event_description"
              multiline
              minRows={3}
              value={formValues.event_description}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={
                  formValues.event_start_date
                    ? dayjs(formValues.event_start_date)
                    : null
                }
                onChange={(newValue) =>
                  handleDateChange("event_start_date", newValue)
                }
                format="YYYY-MM-DD"
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="End Date"
                value={
                  formValues.event_end_date
                    ? dayjs(formValues.event_end_date)
                    : null
                }
                onChange={(newValue) =>
                  handleDateChange("event_end_date", newValue)
                }
                minDate={
                  formValues.event_start_date
                    ? dayjs(formValues.event_start_date)
                    : undefined
                }
                format="YYYY-MM-DD"
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Event Venue"
              name="event_venue"
              multiline
              minRows={2}
              value={formValues.event_venue}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Activate Event</InputLabel>
              <Select
                name="activate_event"
                value={formValues.activate_event}
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
                value={formValues.required_receipt}
                onChange={handleChange}
                label="Required Receipt"
              >
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              component="label"
              fullWidth
              variant="outlined"
              startIcon={<CloudUploadIcon />}
            >
              Upload Certificate (Optional)
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {certificateFile && (
              <small style={{ marginTop: 8, display: "block" }}>
                Selected: {certificateFile.name}
              </small>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          variant="contained"
          color="secondary"
          type="button"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          type="button"
        >
          {loading ? <CircularProgress size={24} /> : "Update Event"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEventModal;
