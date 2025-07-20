import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper
} from '@mui/material';
import {
  QrCodeScanner as QrCodeScannerIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

const QRCodeScanner = ({ onClose, open, onSuccess }) => {
  const [scanner, setScanner] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && !scanner) {
      const newScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      newScanner.render(onScanSuccess, onScanFailure);
      setScanner(newScanner);
      setScanning(true);
    }

    return () => {
      if (scanner) {
        scanner.clear();
        setScanner(null);
      }
    };
  }, [open, onScanSuccess, scanner]);

  const onScanSuccess = async (decodedText) => {
    if (scanning) {
      setScanning(false);
      scanner.clear();
      
      try {
        const response = await axios.post('/api/qr/tarama', {
          oturum_id: decodedText
        });
        
        setResult({
          success: true,
          message: response.data.message,
          islem: response.data.islem,
          data: response.data
        });
        
        if (onSuccess) {
          onSuccess(response.data);
        }
      } catch (err) {
        setResult({
          success: false,
          message: err.response?.data?.error || 'QR kod işlenemedi'
        });
      }
    }
  };

  const onScanFailure = (error) => {
    // Hata durumunda sessizce devam et
  };

  const handleClose = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setResult(null);
    setError('');
    setScanning(false);
    onClose();
  };

  const handleNewScan = () => {
    setResult(null);
    setError('');
    setScanning(true);
    
    const newScanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    newScanner.render(onScanSuccess, onScanFailure);
    setScanner(newScanner);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">QR Kod Tarayıcı</Typography>
          <Button onClick={handleClose} startIcon={<CloseIcon />}>
            Kapat
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result ? (
          <Box textAlign="center">
            <Box sx={{ mb: 2 }}>
              {result.success ? (
                <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main' }} />
              ) : (
                <ErrorIcon sx={{ fontSize: 60, color: 'error.main' }} />
              )}
            </Box>
            <Typography variant="h6" gutterBottom>
              {result.success ? 'İşlem Başarılı!' : 'Hata!'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {result.message}
            </Typography>
            {result.success && result.islem && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2">
                  İşlem: {result.islem === 'giris' ? 'Giriş' : 'Çıkış'}
                </Typography>
                {result.data.giris_zamani && (
                  <Typography variant="body2">
                    Giriş Zamanı: {result.data.giris_zamani}
                  </Typography>
                )}
                {result.data.toplam_saat && (
                  <Typography variant="body2">
                    Toplam Çalışma: {result.data.toplam_saat.toFixed(1)} saat
                  </Typography>
                )}
              </Paper>
            )}
            <Button
              variant="contained"
              onClick={handleNewScan}
              startIcon={<QrCodeScannerIcon />}
            >
              Yeni Tarama
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              QR kodu kameraya gösterin
            </Typography>
            <div id="qr-reader" style={{ width: '100%' }}></div>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeScanner; 