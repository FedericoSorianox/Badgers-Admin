// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import SociosPage from './pages/SociosPage';
import PagosPage from './pages/PagosPage';
import InventarioPage from './pages/InventarioPage';
import FinanzasPage from './pages/FinanzasPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('access');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {/* Contenedor principal de la aplicación */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column', // <--- ¡ESTE ES EL CAMBIO CLAVE!
          minHeight: '100vh',
          backgroundColor: 'background.default'
        }}>
          {/* La barra de navegación superior */}
          <Navbar /> 
          
          {/* Contenedor para el contenido principal de cada página */}
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1, // Hace que esta caja ocupe el espacio vertical restante
              p: 3,        // Padding para que el contenido no se pegue a los bordes
              width: '100%'
            }}
          >
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              <Route path="/socios" element={<PrivateRoute><SociosPage /></PrivateRoute>} />
              <Route path="/pagos" element={<PrivateRoute><PagosPage /></PrivateRoute>} />
              <Route path="/inventario" element={<PrivateRoute><InventarioPage /></PrivateRoute>} />
              <Route path="/finanzas" element={<PrivateRoute><FinanzasPage /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;