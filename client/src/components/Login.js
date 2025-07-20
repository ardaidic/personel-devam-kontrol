import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [kullanici_adi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(kullanici_adi, sifre);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Personel Devam Kontrol
          </Typography>
          <Typography component="h2" variant="h6" color="textSecondary" gutterBottom>
            Giriş Yapın
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="kullanici_adi"
              label="Kullanıcı Adı"
              name="kullanici_adi"
              autoComplete="username"
              autoFocus
              value={kullanici_adi}
              onChange={(e) => setKullaniciAdi(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="sifre"
              label="Şifre"
              type="password"
              id="sifre"
              autoComplete="current-password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </Box>
          
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Varsayılan giriş: admin / admin123
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 