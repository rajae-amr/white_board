import React, { useRef, useState, useEffect } from 'react';
import { Paper, Button, Box, Typography, IconButton, Slider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import './MathTools.css';
import './desmos-overrides.css';
import DesmosGraphing from './DesmosGraphing';

interface MathToolsProps {
  onAddGraphToWhiteboard?: (graphState: string) => void;
}

const MathTools: React.FC<MathToolsProps> = ({ 
  onAddGraphToWhiteboard = () => {} 
}) => {
  const desmosRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // الإعدادات الأولية للنافذة (أصغر حجماً وفي الجهة اليسرى)
  const [position, setPosition] = useState(() => {
    // حساب الموقع في الجهة اليسرى من الشاشة
    const windowWidth = window.innerWidth;
    return { x: windowWidth - 280, y: 100 };
  });
  // تعيين الحجم الصغير كإعداد افتراضي
  const [size, setSize] = useState({ width: 250, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  
  // التأكد من تطبيق الحجم المناسب عند تحميل المكون
  useEffect(() => {
    // ضبط الحجم والموضع عند بدء التشغيل
    const windowWidth = window.innerWidth;
    // حجم أكبر قليلاً مع موضع في الجهة اليمنى
    setSize({ width: 320, height: 380 });
    setPosition({ x: 40, y: 100 });
  }, []);
  
  // إضافة رسم بياني إلى السبورة
  const handleAddGraph = () => {
    if (desmosRef.current && desmosRef.current.getCurrentState) {
      const graphState = JSON.stringify(desmosRef.current.getCurrentState());
      onAddGraphToWhiteboard(graphState);
    }
  };
  
  // بدء عملية السحب
  const handleStartDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    // فقط إذا كان النقر على شريط العنوان
    if ((e.target as HTMLElement).closest('.header-drag-handle')) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };
  
  // بدء تغيير حجم الحاسبة
  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: size.width, height: size.height });
  };
  
  // إنهاء السحب أو تغيير الحجم
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };
  
  // تحريك أو تغيير حجم الحاسبة أثناء حركة الماوس
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      setPosition({
        x: position.x + dx,
        y: position.y + dy
      });
      setStartPos({ x: e.clientX, y: e.clientY });
    } else if (isResizing) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      setSize({
        width: Math.max(400, startSize.width + dx),
        height: Math.max(300, startSize.height + dy)
      });
    }
  };
  
  // إعادة ضبط حجم الحاسبة
  const resetSize = () => {
    setSize({ width: 600, height: 500 });
    setPosition({ x: 100, y: 100 });
  };
  
  // تكبير الحاسبة لتصبح بحجم الشاشة كاملة
  const maximizeCalculator = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    setSize({ width: windowWidth, height: windowHeight });
    setPosition({ x: 0, y: 0 });
  };
  
  // تصغير الحاسبة وإعادتها إلى الجهة اليمنى
  const minimizeCalculator = () => {
    setSize({ width: 320, height: 380 });
    setPosition({ x: 40, y: 100 });
  };
  
  // إضافة مستمعي الأحداث لتتبع حركة الماوس
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, position, size, startPos, startSize]);

  return (
    <Paper
      ref={containerRef}
      onMouseDown={handleStartDrag}
      sx={{ 
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        height: `${size.height}px`, 
        width: `${size.width}px`, 
        padding: 0, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        resize: 'both',
        backgroundColor: '#ffffff'
      }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '8px 16px',
          borderBottom: '1px solid #eee',
          backgroundColor: '#f9f9f9',
          direction: 'rtl', // الشريط العلوي بالعربية
          cursor: 'move'
        }}
        onMouseDown={handleStartDrag}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DragIndicatorIcon sx={{ marginLeft: '8px', cursor: 'move' }} />
          <Typography variant="h6" sx={{ fontFamily: 'Cairo, sans-serif' }}>
            الرسوم البيانية
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={minimizeCalculator} title="تصغير">
            <CloseFullscreenIcon />
          </IconButton>
          <IconButton size="small" onClick={maximizeCalculator} title="تكبير">
            <OpenInFullIcon />
          </IconButton>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddGraph}
            sx={{ fontFamily: 'Cairo, sans-serif' }}
          >
            إضافة للسبورة
          </Button>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, width: '100%', height: 'calc(100% - 56px)', direction: 'ltr' /* الحاسبة بالإنجليزية */ }}>
        
        <DesmosGraphing 
          ref={desmosRef}
          equation="y=x^2" 
        />  
      </Box>
      
      {/* مقبض لتغيير حجم الحاسبة */}
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 0, 
          right: 0, 
          width: '20px', 
          height: '20px', 
          cursor: 'nwse-resize',
          background: 'transparent',
          zIndex: 10
        }}
        onMouseDown={handleStartResize}
      />
    </Paper>
  );
};

export default MathTools;
