import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Save, FiberManualRecord, Stop, PlayArrow, Image, PictureAsPdf } from '@mui/icons-material';
import jsPDF from 'jspdf';
import './Header.css';

interface HeaderProps {
  isRecording?: boolean;
  toggleRecording?: () => void;
  children?: React.ReactNode;
  onSave?: () => { elements: any[]; title: string; };
  onToggleSidebar?: () => void;
  onToggleColorMode?: () => void;
  darkMode?: boolean;
  onToggleMathTools?: () => void;
  showMathTools?: boolean;
  onClearWhiteboard?: () => void;
  onExport?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isRecording = false, 
  toggleRecording = () => {}, 
  children, 
  onSave,
  onToggleSidebar = () => {},
  onToggleColorMode = () => {},
  darkMode = false,
  onToggleMathTools = () => {},
  showMathTools = false,
  onClearWhiteboard = () => {},
  onExport = () => {}
}) => {
  const handleSave = () => {
    try {
      // إذا كانت دالة onSave متوفرة، استخدمها للحصول على محتوى السبورة
      if (onSave) {
        // الحصول على محتوى السبورة والعنوان من الدالة
        const { elements, title } = onSave();
        
        // إنشاء كائن حالة السبورة مع المحتوى الكامل
        const boardState = {
          id: `board-${Date.now()}`,
          date: new Date().toISOString(),
          title: title || `لوحة ${new Date().toLocaleDateString('ar-AE')}`,
          elements: elements,
          thumbnail: stageRef.current instanceof HTMLCanvasElement ? stageRef.current.toDataURL() : null
        };
        
        // الحصول على اللوحات المحفوظة سابقاً أو تهيئة مصفوفة فارغة
        const savedBoards = JSON.parse(localStorage.getItem('smartBoardSaved') || '[]');
        savedBoards.push(boardState);
        localStorage.setItem('smartBoardSaved', JSON.stringify(savedBoards));
        
        alert('تم حفظ اللوحة بنجاح! يمكنك استعادتها من القائمة الجانبية.');
      } else {
        // إذا لم تكن دالة onSave متوفرة، احفظ فقط المعلومات الأساسية
        const boardState = {
          id: `board-${Date.now()}`,
          date: new Date().toISOString(),
          title: `لوحة ${new Date().toLocaleDateString('ar-AE')}`,
        };
        
        // الحصول على اللوحات المحفوظة سابقاً أو تهيئة مصفوفة فارغة
        const savedBoards = JSON.parse(localStorage.getItem('smartBoardSaved') || '[]');
        savedBoards.push(boardState);
        localStorage.setItem('smartBoardSaved', JSON.stringify(savedBoards));
        
        alert('تم حفظ معلومات اللوحة فقط! للحفظ الكامل، تحتاج إلى تحديث الإصدار.');
      }
    } catch (error) {
      console.error('Error saving whiteboard:', error);
      alert('حدث خطأ أثناء حفظ اللوحة');
    }
  };
  
  // مرجع للحصول على صورة مصغرة للسبورة
  // استخدام HTMLCanvasElement لضمان توفر دالة toDataURL
  const stageRef = { 
    current: document.querySelector('.konvajs-content canvas') as HTMLCanvasElement | null 
  };

  const handleExportImage = () => {
    // Get the canvas element from the stage
    const whiteboard = document.querySelector('.konvajs-content canvas');
    
    if (whiteboard) {
      try {
        // Convert the canvas to a data URL
        const dataURL = (whiteboard as HTMLCanvasElement).toDataURL('image/png');
        
        // Create a download link
        const link = document.createElement('a');
        link.download = 'سبورة-الرياضيات-' + new Date().toLocaleDateString('ar-AE') + '.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting image:', error);
        alert('حدث خطأ أثناء تصدير الصورة');
      }
    } else {
      alert('لم يتم العثور على اللوحة');
    }
  };

  const handleExportPDF = () => {
    // Get the canvas element from the stage
    const whiteboard = document.querySelector('.konvajs-content canvas');
    
    if (whiteboard) {
      try {
        // Get canvas dimensions
        const canvas = whiteboard as HTMLCanvasElement;
        const imgData = canvas.toDataURL('image/png');
        const width = canvas.width;
        const height = canvas.height;

        // Calculate PDF dimensions (A4 is 210x297 mm)
        const pdf = new jsPDF({
          orientation: width > height ? 'landscape' : 'portrait',
          unit: 'mm',
        });

        // Calculate PDF page size
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Calculate ratio to fit the image properly
        const ratio = Math.min(pdfWidth / width, pdfHeight / height) * 0.9;
        const imgWidth = width * ratio;
        const imgHeight = height * ratio;

        // Center the image on the page
        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight - imgHeight) / 2;

        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        
        // Save the PDF
        pdf.save('سبورة-الرياضيات-' + new Date().toLocaleDateString('ar-AE') + '.pdf');

        console.log('PDF exported successfully');
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('حدث خطأ أثناء تصدير ملف PDF');
      }
    } else {
      alert('لم يتم العثور على اللوحة');
    }
  };

  return (
    <AppBar 
      position="static" 
      className="header" 
      color="primary"
      sx={{
        transition: 'background-color 0.3s ease',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          className="header-title"
          sx={{ 
            fontWeight: 500,
            letterSpacing: '0.5px',
            transition: 'color 0.3s ease'
          }}
        >
          السبورة الذكية لمعلمي الرياضيات
        </Typography>
        
        <div className="header-buttons" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Save />}
            onClick={handleSave}
            className="header-button"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'medium',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }
            }}
          >
            حفظ
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PictureAsPdf />}
            onClick={onExport}
            className="header-button"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'medium',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }
            }}
          >
            تصدير
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PictureAsPdf />}
            onClick={handleExportPDF}
            className="header-button"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'medium',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }
            }}
          >
            تصدير كPDF
          </Button>
          
          <IconButton
            color="inherit"
            onClick={toggleRecording}
            className="recording-button"
            sx={{
              position: 'relative',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)'
              }
            }}
          >
            {isRecording ? <Stop /> : <PlayArrow />}
            {isRecording && <FiberManualRecord className="recording-indicator" />}
          </IconButton>
          
          {/* Render any additional children (like theme toggle button) */}
          {children}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
