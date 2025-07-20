import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const PersonelList = () => {
  const [personel, setPersonel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPersonel, setEditingPersonel] = useState(null);
  const [formData, setFormData] = useState({
    tc_no: '',
    ad: '',
    soyad: '',
    departman: '',
    pozisyon: '',
    email: '',
    telefon: '',
    ise_baslama_tarihi: ''
  });

  useEffect(() => {
    fetchPersonel();
  }, []);

  const fetchPersonel = async () => {
    try {
      const response = await axios.get('/api/personel');
      setPersonel(response.data);
    } catch (err) {
      setError('Personel listesi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (person = null) => {
    if (person) {
      setEditingPersonel(person);
      setFormData({
        tc_no: person.tc_no,
        ad: person.ad,
        soyad: person.soyad,
        departman: person.departman,
        pozisyon: person.pozisyon,
        email: person.email || '',
        telefon: person.telefon || '',
        ise_baslama_tarihi: person.ise_baslama_tarihi
      });
    } else {
      setEditingPersonel(null);
      setFormData({
        tc_no: '',
        ad: '',
        soyad: '',
        departman: '',
        pozisyon: '',
        email: '',
        telefon: '',
        ise_baslama_tarihi: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPersonel(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingPersonel) {
        await axios.put(`/api/personel/${editingPersonel.id}`, formData);
      } else {
        await axios.post('/api/personel', formData);
      }
      fetchPersonel();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem başarısız');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`/api/personel/${id}`);
        fetchPersonel();
      } catch (err) {
        setError('Silme işlemi başarısız');
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Personel Listesi</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Personel
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>TC No</TableCell>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>Departman</TableCell>
              <TableCell>Pozisyon</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>İşe Başlama</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {personel.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.tc_no}</TableCell>
                <TableCell>{`${row.ad} ${row.soyad}`}</TableCell>
                <TableCell>{row.departman}</TableCell>
                <TableCell>{row.pozisyon}</TableCell>
                <TableCell>{row.email || '-'}</TableCell>
                <TableCell>{row.telefon || '-'}</TableCell>
                <TableCell>{row.ise_baslama_tarihi}</TableCell>
                <TableCell>
                  <Chip
                    label={row.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                    color={row.durum === 'aktif' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(row)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPersonel ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              name="tc_no"
              label="TC Kimlik No"
              value={formData.tc_no}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="ad"
              label="Ad"
              value={formData.ad}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="soyad"
              label="Soyad"
              value={formData.soyad}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="departman"
              label="Departman"
              value={formData.departman}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="pozisyon"
              label="Pozisyon"
              value={formData.pozisyon}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="telefon"
              label="Telefon"
              value={formData.telefon}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="ise_baslama_tarihi"
              label="İşe Başlama Tarihi"
              type="date"
              value={formData.ise_baslama_tarihi}
              onChange={handleInputChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPersonel ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PersonelList; 