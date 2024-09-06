// src/context/UserContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";

// Define the User interface with the necessary properties
export interface User {
  userId: string;
  email: string;
  token: string;
  isAdmin: boolean;
}

// Define the context type with updated login function to accept an object with email and password
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

// Create the UserContext with an undefined default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// UserProvider component to wrap around components that need access to UserContext
export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  // Function to handle user login
  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      // Make the login request to the backend
      const response = await axios.post(
        "http://localhost:3000/api/users/login",
        {
          email,
          password,
        }
      );

      // Set the user data with token and admin status from the response
      const loggedInUser = {
        userId: response.data.userId,
        email: email,
        token: response.data.token,
        isAdmin: response.data.isAdmin,
      };

      setUser(loggedInUser);

      // Store user data in localStorage to persist login state
      localStorage.setItem("user", JSON.stringify(loggedInUser));
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials and try again.");
    }
  };

  // Function to handle user logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Clear user data from localStorage
  };

  // Check localStorage for existing user data on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use UserContext in other components
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
