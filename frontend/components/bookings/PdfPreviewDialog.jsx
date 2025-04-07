import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { generateBookingPdf } from '@/utils/pdfGenerator';


const PdfPreviewDialog = ({ open, onClose, booking }) => {
  const pdfPreviewRef = useRef(null);

  if (!booking) return null;

  const pdfDataUri = generateBookingPdf(booking, true);

  const handlePrint = () => {
    if (pdfPreviewRef.current) {
      pdfPreviewRef.current.contentWindow.print();
    }
  };

  const handleDownload = () => {
    generateBookingPdf(booking, false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ style: { height: '90vh' } }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #eee', px: 3, py: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">PDF Preview</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <div style={{ height: '80vh', width: '100%', overflow: 'auto' }}>
          <iframe
            ref={pdfPreviewRef}
            src={pdfDataUri}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="PDF Preview"
          />
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #eee' }}>
        <Button onClick={onClose}>Back</Button>
        <Tooltip title="Print PDF">
          <Button 
            onClick={handlePrint}
            startIcon={<PrintIcon />}
          >
            Print
          </Button>
        </Tooltip>
        <Button 
          variant="contained" 
          startIcon={<FileDownloadIcon />}
          onClick={handleDownload}
        >
          Download Invoice
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PdfPreviewDialog;