import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:3000/api/users/register", { email });
      setMessage("Registration successful. You can now log in.");
      navigate("/dashboard");
    } catch (error) {
      setMessage("Registration failed. Please try again.");
    }
  };

  const handleLogin = async () => {
    setMessage("Logged in successfully!");
    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          width: 300,
          bgcolor: "background.paper",
          boxShadow: 3,
          borderRadius: 3,
          p: 4,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Login / Register
        </Typography>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleRegister}
          sx={{ mr: 2 }}
        >
          Register
        </Button>
        <Button variant="contained" color="secondary" onClick={handleLogin}>
          Login
        </Button>
        <Typography color="textSecondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
