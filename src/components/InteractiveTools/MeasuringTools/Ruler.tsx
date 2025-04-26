import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, Slider, FormControlLabel, Switch } from '@mui/material';

const Ruler: React.FC = () => {
  const [length, setLength] = useState<number>(20);
  const [showCm, setShowCm] = useState<boolean>(true);
  const rulerRef = useRef<HTMLDivElement>(null);
  const [pixelsPerCm, setPixelsPerCm] = useState<number>(37.8); // تقريبي 96dpi / 2.54cm

  // ضبط حجم المسطرة عند التحميل وتغيير الحجم
  useEffect(() => {
    const calculatePixelsPerCm = () => {
      // تحديد عدد البكسلات في السنتيمتر بالنسبة لشاشة المستخدم
      const testDiv = document.createElement('div');
      testDiv.style.width = '1cm';
      testDiv.style.height = '1cm';
      testDiv.style.position = 'absolute';
      testDiv.style.left = '-9999px';
      document.body.appendChild(testDiv);
      
      const calculatedPixelsPerCm = testDiv.offsetWidth;
      setPixelsPerCm(calculatedPixelsPerCm);
      
      document.body.removeChild(testDiv);
    };
    
    calculatePixelsPerCm();
    
    const handleResize = () => {
      calculatePixelsPerCm();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLengthChange = (_: Event, newValue: number | number[]) => {
    setLength(newValue as number);
  };

  const toggleUnitChange = () => {
    setShowCm(!showCm);
  };

  // حساب الطول بالوحدات المناسبة
  const getMeasurement = (value: number): string => {
    if (showCm) {
      return `${value} سم`;
    } else {
      // تحويل من سم إلى بوصة
      const inches = value / 2.54;
      return `${inches.toFixed(2)} بوصة`;
    }
  };

  // رسم التدريجات
  const renderTicks = () => {
    const ticks = [];
    const cmWidth = pixelsPerCm;
    const smallTickHeight = 10;
    const mediumTickHeight = 15;
    const largeTickHeight = 20;
    
    for (let i = 0; i <= length; i++) {
      // تدريجة رئيسية (كل 1 سم)
      ticks.push(
        <Box
          key={`tick-${i}`}
          sx={{
            position: 'absolute',
            left: `${i * cmWidth}px`,
            height: `${largeTickHeight}px`,
            width: '2px',
            backgroundColor: '#000',
            bottom: 0
          }}
        />
      );
      
      // إضافة الأرقام
      if (i < length) {
        ticks.push(
          <Typography
            key={`label-${i}`}
            variant="caption"
            sx={{
              position: 'absolute',
              left: `${i * cmWidth + 3}px`,
              bottom: `${largeTickHeight + 2}px`,
              fontSize: '0.7rem',
              direction: 'ltr'
            }}
          >
            {i}
          </Typography>
        );
      }
      
      // تدريجات نصفية (كل 0.5 سم)
      if (i < length) {
        ticks.push(
          <Box
            key={`half-tick-${i}`}
            sx={{
              position: 'absolute',
              left: `${i * cmWidth + cmWidth / 2}px`,
              height: `${mediumTickHeight}px`,
              width: '1px',
              backgroundColor: '#000',
              bottom: 0
            }}
          />
        );
      }
      
      // تدريجات صغيرة (كل 0.1 سم)
      if (i < length) {
        for (let j = 1; j < 10; j++) {
          if (j !== 5) { // تجاوز 0.5 لأننا أضفناها بالفعل
            ticks.push(
              <Box
                key={`small-tick-${i}-${j}`}
                sx={{
                  position: 'absolute',
                  left: `${i * cmWidth + (j * cmWidth / 10)}px`,
                  height: `${smallTickHeight}px`,
                  width: '1px',
                  backgroundColor: '#555',
                  bottom: 0
                }}
              />
            );
          }
        }
      }
    }
    
    return ticks;
  };

  return (
    <Paper elevation={3} sx={{ p: 2, maxWidth: 650, margin: '0 auto' }}>
      <Typography variant="h6" align="center" gutterBottom>
        المسطرة الإلكترونية
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ mr: 2 }}>الطول: {getMeasurement(length)}</Typography>
        <Slider
          value={length}
          onChange={handleLengthChange}
          min={5}
          max={50}
          valueLabelDisplay="auto"
          sx={{ flexGrow: 1 }}
        />
      </Box>
      
      <FormControlLabel
        control={<Switch checked={showCm} onChange={toggleUnitChange} />}
        label={showCm ? "سنتيمتر" : "بوصة"}
      />
      
      <Box 
        ref={rulerRef} 
        sx={{
          position: 'relative',
          width: `${length * pixelsPerCm}px`,
          height: '60px',
          backgroundColor: '#f3f3f3',
          borderLeft: '2px solid #000',
          borderBottom: '2px solid #000',
          borderTop: '1px solid #ccc',
          borderRight: '1px solid #ccc',
          mt: 2,
          overflow: 'hidden',
          transition: 'width 0.3s ease'
        }}
      >
        {renderTicks()}
      </Box>
    </Paper>
  );
};

export default Ruler;
