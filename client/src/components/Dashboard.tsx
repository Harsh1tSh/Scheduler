import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

interface Availability {
  _id: string;
  start: Date;
  end: Date;
  duration: number;
}

const Dashboard: React.FC = () => {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [newAvailability, setNewAvailability] = useState({
    start: dayjs(),
    end: dayjs().add(1, "hour"),
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editAvailabilityId, setEditAvailabilityId] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchUserAvailability();
  }, []);

  const fetchUserAvailability = async () => {
    try {
      const response = await axios.get<Availability[]>(
        "http://localhost:3000/api/availability/userId" // Replace 'userId' with actual user ID
      );
      setAvailability(response.data);
    } catch (error) {
      console.error("Failed to fetch user availability:", error);
    }
  };

  const handleAddAvailability = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/availability",
        {
          start: newAvailability.start.toISOString(),
          end: newAvailability.end.toISOString(),
          duration: newAvailability.end.diff(newAvailability.start, "minute"),
          user: "userId", // Replace with actual user ID
        }
      );
      setAvailability([...availability, response.data]);
      setIsDialogOpen(false);
    } catch (error) {
      alert("Failed to add availability. Please try again.");
    }
  };

  const handleUpdateAvailability = async () => {
    if (!editAvailabilityId) return;

    try {
      const response = await axios.patch(
        `http://localhost:3000/api/availability/${editAvailabilityId}`,
        {
          start: newAvailability.start.toISOString(),
          end: newAvailability.end.toISOString(),
          duration: newAvailability.end.diff(newAvailability.start, "minute"),
        }
      );
      setAvailability(
        availability.map((a) =>
          a._id === editAvailabilityId ? response.data : a
        )
      );
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditAvailabilityId(null);
    } catch (error) {
      alert("Failed to update availability. Please try again.");
    }
  };

  const handleDeleteAvailability = async (availabilityId: string) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/availability/${availabilityId}`
      );
      setAvailability(availability.filter((a) => a._id !== availabilityId));
    } catch (error) {
      alert("Failed to delete availability. Please try again.");
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setNewAvailability({
      start: dayjs(start),
      end: dayjs(end),
    });
    setIsDialogOpen(true);
    setIsEditMode(false);
  };

  const handleEditAvailability = (availability: Availability) => {
    setNewAvailability({
      start: dayjs(availability.start),
      end: dayjs(availability.end),
    });
    setIsDialogOpen(true);
    setIsEditMode(true);
    setEditAvailabilityId(availability._id);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Availability Management
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Calendar
          localizer={localizer}
          events={availability}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          selectable
          onSelectSlot={handleSelectSlot}
          defaultView="week"
        />
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Your Availability
        </Typography>
        {availability.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availability.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      {dayjs(item.start).format("YYYY-MM-DD HH:mm")}
                    </TableCell>
                    <TableCell>
                      {dayjs(item.end).format("YYYY-MM-DD HH:mm")}
                    </TableCell>
                    <TableCell>{item.duration} minutes</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditAvailability(item)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDeleteAvailability(item._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No availability added yet.</Typography>
        )}
      </Paper>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>
          {isEditMode ? "Edit Availability" : "Add Availability"}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Start Time"
              value={newAvailability.start}
              onChange={(newValue: Dayjs | null) =>
                setNewAvailability({
                  ...newAvailability,
                  start: newValue || dayjs(),
                })
              }
              slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
            />
            <DateTimePicker
              label="End Time"
              value={newAvailability.end}
              onChange={(newValue: Dayjs | null) =>
                setNewAvailability({
                  ...newAvailability,
                  end: newValue || dayjs(),
                })
              }
              slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={
              isEditMode ? handleUpdateAvailability : handleAddAvailability
            }
            variant="contained"
            color="primary"
          >
            {isEditMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
