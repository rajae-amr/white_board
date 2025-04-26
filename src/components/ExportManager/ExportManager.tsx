import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Typography,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

interface ExportManagerProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: string, filename: string) => Promise<string | null>;
  whiteboardRef: React.RefObject<any>;
}

type ExportFormat = 'png' | 'jpg' | 'pdf';

const ExportManager: React.FC<ExportManagerProps> = ({ open, onClose, whiteboardRef }) => {
  const [filename, setFilename] = useState('سبورتي_الذكية');
  const [format, setFormat] = useState<ExportFormat>('png');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // إعادة تعيين الحالة عند فتح المربع الحواري
  React.useEffect(() => {
    if (open) {
      setFilename('سبورتي_الذكية');
      setFormat('png');
      setError(null);
      setExporting(false);
    }
  }, [open]);

  // تغيير اسم الملف
  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(e.target.value);
    setError(null);
  };

  // تغيير صيغة التصدير
  const handleFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(e.target.value as ExportFormat);
    setError(null);
  };

  // التحقق من اسم الملف
  const validateFilename = () => {
    if (!filename.trim()) {
      setError('الرجاء إدخال اسم للملف');
      return false;
    }
    return true;
  };

  // تصدير السبورة
  const handleExport = async () => {
    if (!validateFilename()) return;
    
    setExporting(true);
    setError(null);
    
    try {
      if (!whiteboardRef.current) {
        throw new Error('لا يمكن الوصول إلى السبورة');
      }
      
      // الحصول على داتا URL من السبورة
      const dataURL = whiteboardRef.current.toDataURL();
      
      if (format === 'png' || format === 'jpg') {
        // تحويل Data URL إلى Blob
        const response = await fetch(dataURL);
        const blob = await response.blob();
        
        // حفظ الملف
        saveAs(blob, `${filename}.${format}`);
      } else if (format === 'pdf') {
        // إنشاء ملف PDF
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
        });
        
        // تحميل الصورة من Data URL
        const imgProps = pdf.getImageProperties(dataURL);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // حساب النسبة المناسبة
        const aspectRatio = imgProps.width / imgProps.height;
        let imgWidth = pdfWidth;
        let imgHeight = imgWidth / aspectRatio;
        
        if (imgHeight > pdfHeight) {
          imgHeight = pdfHeight;
          imgWidth = imgHeight * aspectRatio;
        }
        
        // إضافة الصورة إلى PDF
        const xOffset = (pdfWidth - imgWidth) / 2;
        const yOffset = (pdfHeight - imgHeight) / 2;
        
        pdf.addImage(dataURL, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
        
        // حفظ الملف
        pdf.save(`${filename}.pdf`);
      }
      
      onClose();
    } catch (err) {
      console.error('خطأ في التصدير:', err);
      setError('حدث خطأ أثناء تصدير السبورة');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} dir="rtl" maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        تصدير السبورة
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <TextField
            label="اسم الملف"
            variant="outlined"
            fullWidth
            value={filename}
            onChange={handleFilenameChange}
            error={!!error && error.includes('اسم')}
            helperText={error && error.includes('اسم') ? error : ''}
            disabled={exporting}
            sx={{ mb: 3 }}
          />
          
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend">صيغة التصدير</FormLabel>
            <RadioGroup
              aria-label="format"
              name="format"
              value={format}
              onChange={handleFormatChange}
              row
            >
              <FormControlLabel 
                value="png" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ImageIcon sx={{ mr: 1 }} />
                    <Typography>PNG (شفاف)</Typography>
                  </Box>
                }
                disabled={exporting}
              />
              <FormControlLabel 
                value="jpg" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ImageIcon sx={{ mr: 1 }} />
                    <Typography>JPG</Typography>
                  </Box>
                }
                disabled={exporting}
              />
              <FormControlLabel 
                value="pdf" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PictureAsPdfIcon sx={{ mr: 1 }} />
                    <Typography>PDF</Typography>
                  </Box>
                }
                disabled={exporting}
              />
            </RadioGroup>
          </FormControl>
          
          {error && !error.includes('اسم') && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={exporting}
          color="inherit"
        >
          إلغاء
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExport}
          disabled={exporting}
          startIcon={exporting ? <CircularProgress size={20} /> : <DownloadIcon />}
        >
          {exporting ? 'جاري التصدير...' : 'تصدير'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportManager;
