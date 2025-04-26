import React, { useState } from 'react';
import './GeometricShapes.css';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { Stage, Layer, Rect, Circle, RegularPolygon, Line, Arrow } from 'react-konva';

// مكونات الأشكال الهندسية التي يمكن إضافتها للسبورة
interface ShapeData {
  id: string;
  type: string;
  props: any;
}

const GeometricShapes: React.FC = () => {
  // أمثلة للأشكال الهندسية الأساسية
  const basicShapes: ShapeData[] = [
    { id: 'square', type: 'rect', props: { width: 60, height: 60, fill: '#3498db' } },
    { id: 'rectangle', type: 'rect', props: { width: 80, height: 40, fill: '#2ecc71' } },
    { id: 'circle', type: 'circle', props: { radius: 30, fill: '#e74c3c' } },
    { id: 'triangle', type: 'regularPolygon', props: { sides: 3, radius: 35, fill: '#f39c12' } },
    { id: 'pentagon', type: 'regularPolygon', props: { sides: 5, radius: 35, fill: '#9b59b6' } },
    { id: 'hexagon', type: 'regularPolygon', props: { sides: 6, radius: 35, fill: '#1abc9c' } },
    { id: 'octagon', type: 'regularPolygon', props: { sides: 8, radius: 35, fill: '#34495e' } },
    { id: 'line', type: 'line', props: { points: [0, 0, 80, 0], stroke: '#000', strokeWidth: 2 } },
    { id: 'arrow', type: 'arrow', props: { points: [0, 0, 80, 0], stroke: '#000', fill: '#000', strokeWidth: 2 } },
  ];

  // أمثلة للمضلعات الرياضية
  const polygons: ShapeData[] = [
    { id: 'rhombus', type: 'regularPolygon', props: { sides: 4, radius: 35, rotation: 45, fill: '#fd79a8' } },
    { id: 'parallelogram', type: 'line', props: { 
      points: [0, 0, 60, 0, 80, 40, 20, 40, 0, 0], 
      stroke: '#00b894', 
      fill: '#55efc4', 
      closed: true 
    } },
    { id: 'trapezoid', type: 'line', props: { 
      points: [20, 0, 80, 0, 100, 40, 0, 40, 20, 0], 
      stroke: '#0984e3', 
      fill: '#74b9ff', 
      closed: true 
    } },
    { id: 'star', type: 'line', props: { 
      points: [50, 0, 61, 35, 98, 35, 68, 57, 79, 91, 50, 70, 21, 91, 32, 57, 2, 35, 39, 35, 50, 0], 
      stroke: '#d63031', 
      fill: '#ff7675', 
      closed: true,
      scale: { x: 0.5, y: 0.5 }
    } },
  ];

  // وظيفة رسم كل شكل في صندوق منفصل
  const renderShape = (shape: ShapeData) => {
    return (
      <Box 
        key={shape.id} 
        sx={{ 
          width: 100, 
          height: 100, 
          border: '1px solid #ddd',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          m: 1,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Stage width={100} height={100}>
          <Layer>
            {shape.type === 'rect' && (
              <Rect
                x={50 - shape.props.width / 2}
                y={50 - shape.props.height / 2}
                {...shape.props}
              />
            )}
            {shape.type === 'circle' && (
              <Circle
                x={50}
                y={50}
                {...shape.props}
              />
            )}
            {shape.type === 'regularPolygon' && (
              <RegularPolygon
                x={50}
                y={50}
                {...shape.props}
              />
            )}
            {shape.type === 'line' && (
              <Line
                x={10}
                y={50}
                {...shape.props}
              />
            )}
            {shape.type === 'arrow' && (
              <Arrow
                x={10}
                y={50}
                {...shape.props}
              />
            )}
          </Layer>
        </Stage>
        <Typography variant="caption" sx={{ position: 'absolute', bottom: 0, width: '100%', textAlign: 'center' }}>
          {getShapeName(shape.id)}
        </Typography>
      </Box>
    );
  };

  // وظيفة الحصول على اسم الشكل بالعربية
  const getShapeName = (id: string): string => {
    const nameMap: {[key: string]: string} = {
      'square': 'مربع',
      'rectangle': 'مستطيل',
      'circle': 'دائرة',
      'triangle': 'مثلث',
      'pentagon': 'خماسي',
      'hexagon': 'سداسي',
      'octagon': 'ثماني',
      'line': 'خط',
      'arrow': 'سهم',
      'rhombus': 'معين',
      'parallelogram': 'متوازي أضلاع',
      'trapezoid': 'شبه منحرف',
      'star': 'نجمة',
    };
    
    return nameMap[id] || id;
  };

  const handleAddShape = (shape: ShapeData) => {
    // هنا ستضيف وظيفة لإضافة الشكل إلى السبورة
    console.log(`تمت إضافة ${getShapeName(shape.id)} إلى السبورة`);
    // في التطبيق الفعلي، ستقوم بتحديث حالة السبورة وإضافة الشكل إليها
  };

  return (
    <Paper elevation={3} sx={{ p: 2, maxWidth: 650, margin: '0 auto', maxHeight: '80vh', overflow: 'auto' }}>
      <Typography variant="h6" align="center" gutterBottom>
        مكتبة الأشكال الهندسية ثنائية الأبعاد
      </Typography>
      
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        الأشكال الأساسية
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container justifyContent="center">
        {basicShapes.map(shape => (
          <div className="shape-item" key={shape.id} onClick={() => handleAddShape(shape)}>
            {renderShape(shape)}
          </div>
        ))}
      </Grid>
      
      <Typography variant="subtitle1" sx={{ mt: 4, mb: 1 }}>
        المضلعات الرياضية
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container justifyContent="center">
        {polygons.map(shape => (
          <div className="shape-item" key={shape.id} onClick={() => handleAddShape(shape)}>
            {renderShape(shape)}
          </div>
        ))}
      </Grid>
      
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
        انقر على أي شكل لإضافته إلى السبورة
      </Typography>
    </Paper>
  );
};

export default GeometricShapes;
