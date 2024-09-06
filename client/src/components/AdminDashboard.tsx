// src/components/AdminDashboard.tsx

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
} from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useUser } from "../context/UserContext";

const localizer = momentLocalizer(moment);

interface Availability {
  _id: string;
  user: {
    _id: string;
    email: string;
  };
  start: Date;
  end: Date;
  duration: number;
}

interface User {
  _id: string;
  email: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useUser(); // Ensure that user includes isAdmin property
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all users for admin to select
  const fetchUsers = useCallback(async () => {
    try {
      if (user?.isAdmin) {
        const response = await axios.get<User[]>(
          "http://localhost:3000/api/users",
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, [user]);

  // Fetch all availabilities for the selected user
  const fetchUserAvailabilities = useCallback(
    async (userId: string) => {
      try {
        const response = await axios.get<Availability[]>(
          `http://localhost:3000/api/availability/${userId}`,
          { headers: { Authorization: `Bearer ${user?.token}` } }
        );
        const formattedAvailabilities = response.data.map((item) => ({
          ...item,
          start: new Date(item.start),
          end: new Date(item.end),
        }));
        setAvailabilities(formattedAvailabilities);
      } catch (error) {
        console.error("Failed to fetch availabilities:", error);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserSelection = (user: User) => {
    setSelectedUser(user);
    fetchUserAvailabilities(user._id);
  };

  const handleScheduleSession = () => {
    console.log("Scheduling session...");
    setIsDialogOpen(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {user?.isAdmin ? (
        <>
          <Typography variant="h6" gutterBottom>
            Select User:
          </Typography>
          <Box sx={{ mb: 2 }}>
            {users.map((user) => (
              <Button
                key={user._id}
                variant="outlined"
                onClick={() => handleUserSelection(user)}
                sx={{ mr: 2, mb: 1 }}
              >
                {user.email}
              </Button>
            ))}
          </Box>

          {selectedUser && (
            <>
              <Typography variant="h6" gutterBottom>
                Viewing Availability for: {selectedUser.email}
              </Typography>

              <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Calendar
                  localizer={localizer}
                  events={availabilities.map((item) => ({
                    title: "Available Slot",
                    start: item.start,
                    end: item.end,
                  }))}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 500 }}
                  selectable
                  onSelectEvent={() => setIsDialogOpen(true)}
                  defaultView="week"
                />
              </Paper>

              <Dialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
              >
                <DialogTitle>Schedule a Session</DialogTitle>
                <DialogContent>
                  <Typography>
                    Select a time slot to schedule a session.
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleScheduleSession} color="primary">
                    Schedule
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}
        </>
      ) : (
        <Typography variant="h6" color="error">
          Access Denied. Admins only.
        </Typography>
      )}
    </Box>
  );
};

export default AdminDashboard;
