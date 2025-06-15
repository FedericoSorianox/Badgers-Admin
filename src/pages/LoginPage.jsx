import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api'; // Ajusta la ruta si tu archivo api.js está en otro lugar

function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const username = 'admin'; // Usuario fijo

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Usamos apiClient, que ya tiene la baseURL correcta
      const response = await apiClient.post('token/', { username, password });
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      navigate('/');
    } catch (err) {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Usuario: <b>{username}</b></label>
        </div>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  );
}

export default LoginPage; 