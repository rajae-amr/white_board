import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

// استيراد المكونات المختلفة
import ScientificCalculator from './InteractiveTools/Calculators/ScientificCalculator';
import Ruler from './InteractiveTools/MeasuringTools/Ruler';
import GeometricShapes from './ShapesLibrary/2D/GeometricShapes';
import ThreeDShapes from './ShapesLibrary/3D/ThreeDShapes';
import BoardSettings from './BoardCustomization/BoardSettings';

// نوع لتحديد المحتوى المعروض
type ContentType = {
  componentType: string;
  componentId?: string;
};

interface ContentDisplayProps {
  content: ContentType | null;
  onAddShapeToWhiteboard?: (shapeData: any) => void;
  onCloseContent?: () => void;
}

// المكون المسؤول عن عرض المحتوى المختار من الشريط الجانبي
const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, onAddShapeToWhiteboard, onCloseContent }) => {
  if (!content || !content.componentType) {
    return (
      <Paper elevation={1} sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          يرجى اختيار أداة من الشريط الجانبي
        </Typography>
      </Paper>
    );
  }

  // اختيار المكون الذي سيتم عرضه بناءً على النوع والمعرف
  const renderContent = () => {
    switch (content.componentType) {
      case 'calculator':
        switch (content.componentId) {
          case 'scientific':
            return <ScientificCalculator />;
          // يمكن إضافة المزيد من الآلات الحاسبة هنا
          default:
            return <ScientificCalculator />;
        }
      
      case 'measuringTool':
        switch (content.componentId) {
          case 'ruler':
            return <Ruler />;
          // يمكن إضافة المزيد من أدوات القياس هنا
          default:
            return <Ruler />;
        }
      
      case 'shapes2d':
        return <GeometricShapes />;
      
      case 'shapes3d':
        return <ThreeDShapes onAddShape={(shapeData) => {
          if (onAddShapeToWhiteboard) {
            onAddShapeToWhiteboard(shapeData);
            // إغلاق النافذة المنبثقة بعد إضافة الشكل
            if (onCloseContent) onCloseContent();
          }
        }} />;
      
      case 'boardSettings':
        return <BoardSettings />;
      
      default:
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">
              المكون غير متوفر
            </Typography>
            <Typography variant="body1">
              نأسف، هذه الميزة قيد التطوير حالياً.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {renderContent()}
    </Box>
  );
};

export default ContentDisplay;
