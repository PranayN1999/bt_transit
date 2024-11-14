// RoutesContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const RoutesContext = createContext();

export const RoutesProvider = ({ children }) => {
  const [allRoutes, setAllRoutes] = useState([]);
  const [selectedRoutes, setSelectedRoutes] = useState([]);

  useEffect(() => {
    const fetchAllRoutes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/all-routes/details`);
        // console.log("API Response:", response.data);
        setAllRoutes(response.data.routes);
      } catch (error) {
        console.error("Error fetching all routes:", error);
      }
    };
    fetchAllRoutes();
  }, []);

  return (
    <RoutesContext.Provider value={{ allRoutes, selectedRoutes, setSelectedRoutes }}>
      {children}
    </RoutesContext.Provider>
  );
};

export const useRoutes = () => {
  return useContext(RoutesContext);
};
