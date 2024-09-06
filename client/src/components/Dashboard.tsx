import React, { useState, useEffect, useCallback } from "react";
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
import { useUser } from "../context/UserContext";

const localizer = momentLocalizer(moment);

interface Availability {
  _id: string;
  start: Date; // Use JavaScript Date for react-big-calendar compatibility
  end: Date;
  duration: number;
}

const Dashboard: React.FC = () => {
  const { user } = useUser();
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

  const fetchUserAvailability = useCallback(async () => {
    if (user) {
      try {
        const response = await axios.get<Availability[]>(
          `http://localhost:3000/api/availability/${user.userId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        // Convert start and end times to JavaScript Date objects
        const formattedAvailability = response.data.map((item) => ({
          ...item,
          start: new Date(item.start), // Ensure dates are in JavaScript Date format
          end: new Date(item.end),
        }));
        setAvailability(formattedAvailability);
      } catch (error) {
        console.error("Failed to fetch user availability:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchUserAvailability();
  }, [fetchUserAvailability]);

  const handleAddAvailability = async () => {
    if (user) {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/availability",
          {
            start: newAvailability.start.toISOString(),
            end: newAvailability.end.toISOString(),
            duration: newAvailability.end.diff(newAvailability.start, "minute"),
            user: user.userId,
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        // Add new availability with proper date conversion
        setAvailability([
          ...availability,
          {
            ...response.data,
            start: new Date(response.data.start),
            end: new Date(response.data.end),
          },
        ]);
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Failed to add availability:", error);
      }
    }
  };

  const handleUpdateAvailability = async () => {
    if (user && editAvailabilityId) {
      try {
        const response = await axios.patch(
          `http://localhost:3000/api/availability/${editAvailabilityId}`,
          {
            start: newAvailability.start.toISOString(),
            end: newAvailability.end.toISOString(),
            duration: newAvailability.end.diff(newAvailability.start, "minute"),
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setAvailability(
          availability.map((a) =>
            a._id === editAvailabilityId
              ? {
                  ...response.data,
                  start: new Date(response.data.start),
                  end: new Date(response.data.end),
                }
              : a
          )
        );
        setIsDialogOpen(false);
        setIsEditMode(false);
        setEditAvailabilityId(null);
      } catch (error) {
        console.error("Failed to update availability:", error);
      }
    }
  };

  const handleDeleteAvailability = async (availabilityId: string) => {
    if (user) {
      try {
        await axios.delete(
          `http://localhost:3000/api/availability/${availabilityId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setAvailability(availability.filter((a) => a._id !== availabilityId));
      } catch (error) {
        console.error("Failed to delete availability:", error);
      }
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setNewAvailability({
      start: dayjs(start), // Use dayjs for internal manipulation
      end: dayjs(end),
    });
    setIsDialogOpen(true);
    setIsEditMode(false);
  };

  const handleEditAvailability = (availability: Availability) => {
    setNewAvailability({
      start: dayjs(availability.start), // Convert Date to dayjs for editing
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
          events={availability.map((item) => ({
            title: "Available Slot",
            start: item.start, // Ensure these are JavaScript Date objects
            end: item.end,
          }))}
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
