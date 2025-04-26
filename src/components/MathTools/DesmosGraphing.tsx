import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Box } from '@mui/material';

interface DesmosGraphingProps {
  equation?: string;
}

declare global {
  interface Window {
    Desmos: any;
  }
}

const DesmosGraphing = forwardRef<any, DesmosGraphingProps>(({ equation = '' }, ref) => {
  const calculatorRef = useRef<any>(null);
  const calculatorContainerRef = useRef<HTMLDivElement>(null);
  const defaultEquation = equation || 'y=x^2';

  useEffect(() => {
    const loadDesmosScript = () => {
      const script = document.createElement('script');
      script.src = 'https://www.desmos.com/api/v1.6/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
      script.async = true;
      script.onload = initializeCalculator;
      document.body.appendChild(script);
    };

    const initializeCalculator = () => {
      if (calculatorContainerRef.current && window.Desmos) {
        // استخدام الإعدادات الافتراضية لحاسبة Desmos كما في الموقع الرسمي
        calculatorRef.current = window.Desmos.GraphingCalculator(calculatorContainerRef.current, {
          // الإعدادات الأساسية فقط للحفاظ على الشكل الأصلي
          expressionsCollapsed: false,
          settingsMenu: true,
          language: 'en',
          administerSecretFolders: false
        });
        // إضافة معادلة افتراضية للظهور عند بدء التشغيل
        setTimeout(() => {
          if (calculatorRef.current) {
            calculatorRef.current.setExpression({ id: 'graph1', latex: defaultEquation, color: '#1e88e5' });
            console.log('تم إضافة المعادلة الافتراضية:', defaultEquation);
          }
        }, 500);
      }
    };

    if (!window.Desmos) {
      loadDesmosScript();
    } else {
      initializeCalculator();
    }

    return () => {
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
      }
    };
  }, [defaultEquation]);



  // إتاحة الوظائف للمكون الأب عن طريق ref
  useImperativeHandle(ref, () => ({
    getCurrentState: () => {
      if (calculatorRef.current) {
        return calculatorRef.current.getState();
      }
      return null;
    }
  }));

  return (
    <Box className="desmos-container" sx={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column', 
      direction: 'ltr' // استخدام اتجاه LTR للحاسبة
    }}>
      <Box
        ref={calculatorContainerRef}
        sx={{
          flexGrow: 1,
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          // إزالة التنسيقات المخصصة للسماح لحاسبة Desmos بالظهور بشكلها الافتراضي
        }}
      />
    </Box>
  );
});

export default DesmosGraphing;
