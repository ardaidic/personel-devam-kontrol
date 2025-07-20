import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    kullanici_adi: '',
    sifre: '',
    sifre_tekrar: '',
    rol: 'personel',
    ad: '',
    soyad: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasyon
    if (formData.sifre !== formData.sifre_tekrar) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.sifre.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/register', {
        kullanici_adi: formData.kullanici_adi,
        sifre: formData.sifre,
        rol: formData.rol,
        ad: formData.ad,
        soyad: formData.soyad,
        email: formData.email
      });

      setSuccess('Kullanıcı başarıyla oluşturuldu! Giriş yapabilirsiniz.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Kayıt işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
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
            Kullanıcı Kayıt
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {success}
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
              value={formData.kullanici_adi}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="ad"
              label="Ad"
              id="ad"
              value={formData.ad}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="soyad"
              label="Soyad"
              id="soyad"
              value={formData.soyad}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              fullWidth
              name="email"
              label="E-posta"
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="rol-label">Rol</InputLabel>
              <Select
                labelId="rol-label"
                id="rol"
                name="rol"
                value={formData.rol}
                label="Rol"
                onChange={handleChange}
              >
                <MenuItem value="personel">Personel</MenuItem>
                <MenuItem value="admin">Yönetici</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              name="sifre"
              label="Şifre"
              type="password"
              id="sifre"
              value={formData.sifre}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="sifre_tekrar"
              label="Şifre Tekrar"
              type="password"
              id="sifre_tekrar"
              value={formData.sifre_tekrar}
              onChange={handleChange}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Kayıt Oluşturuluyor...' : 'Kayıt Ol'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
            >
              Zaten hesabın var mı? Giriş yap
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 