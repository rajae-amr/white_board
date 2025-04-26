import React from 'react';
import { 
  AppBar, 
  Toolbar as MUIToolbar, 
  IconButton, 
  Tooltip, 
  Slider,
  Divider,
  Paper
} from '@mui/material';
import { 
  Create, 
  HighlightOff, 
  Timeline, 
  Crop169, 
  RadioButtonUnchecked, 
  ChangeHistory,
  TextFields,
  GridOn,
  GridOff,
  PanTool,
  FormatColorFill,
  DeleteSweep,
  Undo,
  Redo,
  Image,
  ViewInAr, // أيقونة للأشكال ثلاثية الأبعاد
  Language, // أيقونة للكرة
  ThreeDRotation // أيقونة للدوران ثلاثي الأبعاد
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import { ToolType } from '../../App';
import './Toolbar.css';

interface ToolbarProps {
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  lineThickness: number;
  onLineThicknessChange: (thickness: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  colorPalette?: string[];
  thicknessOptions?: number[];
  darkMode?: boolean;
  onClearWhiteboard?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  currentColor,
  onColorChange,
  lineThickness,
  onLineThicknessChange,
  showGrid,
  onToggleGrid,
  colorPalette = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'],
  thicknessOptions = [1, 2, 4, 8, 12, 16],
  darkMode = false,
  onClearWhiteboard,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const toggleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
  };

  const handleThicknessChange = (_event: Event, newValue: number | number[]) => {
    onLineThicknessChange(newValue as number);
  };

  // Function to render an icon button for a tool
  const renderToolButton = (tool: ToolType, icon: React.ReactNode, tooltip: string) => (
    <Tooltip title={tooltip} placement="top">
      <IconButton 
        color={currentTool === tool ? "primary" : "default"} 
        onClick={() => onToolChange(tool)}
        size="large"
        sx={{
          transition: 'all 0.2s ease',
          transform: currentTool === tool ? 'scale(1.1)' : 'scale(1)',
          ...(darkMode && {
            color: currentTool === tool ? '#90caf9' : '#ffffff'
          })
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );

  return (
    <Paper 
      elevation={3} 
      className="toolbar-container"
      sx={{
        backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
        color: darkMode ? '#ffffff' : '#333333',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <MUIToolbar variant="dense" className="drawing-toolbar">
        {/* Drawing tools */}
        <div className="toolbar-section">
          {renderToolButton('pen', <Create />, 'قلم')}
          {renderToolButton('eraser', <HighlightOff />, 'ممحاة')}
          {renderToolButton('line', <Timeline />, 'خط')}
          {renderToolButton('rect', <Crop169 />, 'مستطيل')}
          {renderToolButton('circle', <RadioButtonUnchecked />, 'دائرة')}
          {renderToolButton('triangle', <ChangeHistory />, 'مثلث')}
        </div>
        
        <Divider 
          orientation="vertical" 
          flexItem 
          sx={{ 
            mx: 1,
            backgroundColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' 
          }} 
        />
        
        {/* Text and selection tools */}
        <div className="toolbar-section">
          {renderToolButton('text', <TextFields />, 'نص')}
          {renderToolButton('select', <PanTool />, 'تحديد')}
        </div>
        
        <Divider 
          orientation="vertical" 
          flexItem 
          sx={{ 
            mx: 1,
            backgroundColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' 
          }} 
        />
        
        {/* أدوات الوسائط */}
        <div className="toolbar-section">
          {renderToolButton('image', <Image />, 'إضافة صورة')}
        </div>
        
        <Divider 
          orientation="vertical" 
          flexItem 
          sx={{ 
            mx: 1,
            backgroundColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' 
          }} 
        />
        
        {/* أدوات الأشكال ثلاثية الأبعاد */}
        <div className="toolbar-section">
          {renderToolButton('3d-shape-cube', <ViewInAr />, 'مكعب')}
          {renderToolButton('3d-shape-sphere', <Language />, 'كرة')}
          {renderToolButton('3d-shape-cone', <ThreeDRotation />, 'مخروط')}
        </div>
        
        <Divider 
          orientation="vertical" 
          flexItem 
          sx={{ 
            mx: 1,
            backgroundColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' 
          }} 
        />
        
        {/* أزرار التراجع والإعادة */}
        <div className="toolbar-section">
          {onUndo && (
            <Tooltip title="تراجع" placement="top">
              <span>
                <IconButton 
                  onClick={() => {
                    console.log('Undo button clicked, canUndo =', canUndo);
                    if (onUndo) onUndo();
                  }}
                  disabled={!canUndo}
                  size="large"
                  sx={{
                    color: canUndo ? (darkMode ? '#ffffff' : '#2196f3') : (darkMode ? '#555' : '#ccc'),
                    opacity: canUndo ? 1 : 0.5,
                    transition: 'all 0.2s ease',
                    '&:hover': canUndo ? {
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      transform: 'scale(1.1)',
                    } : {},
                  }}
                >
                  <Undo />
                </IconButton>
              </span>
            </Tooltip>
          )}
          
          {onRedo && (
            <Tooltip title="إعادة" placement="top">
              <span>
                <IconButton 
                  onClick={() => {
                    console.log('Redo button clicked, canRedo =', canRedo);
                    if (onRedo) onRedo();
                  }}
                  disabled={!canRedo}
                  size="large"
                  sx={{
                    color: canRedo ? (darkMode ? '#ffffff' : '#2196f3') : (darkMode ? '#555' : '#ccc'),
                    opacity: canRedo ? 1 : 0.5,
                    transition: 'all 0.2s ease',
                    '&:hover': canRedo ? {
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      transform: 'scale(1.1)',
                    } : {},
                  }}
                >
                  <Redo />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </div>
        
        <Divider 
          orientation="vertical" 
          flexItem 
          sx={{ 
            mx: 1,
            backgroundColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' 
          }} 
        />
        
        {/* Grid toggle */}
        <div className="toolbar-section">
          <Tooltip title={showGrid ? 'إخفاء الشبكة' : 'إظهار الشبكة'} placement="top">
            <IconButton 
              color={showGrid ? "primary" : "default"} 
              onClick={onToggleGrid}
              size="large"
            >
              {showGrid ? <GridOn /> : <GridOff />}
            </IconButton>
          </Tooltip>
          
          {/* زر مسح السبورة */}
          {onClearWhiteboard && (
            <Tooltip title="مسح السبورة" placement="top">
              <IconButton 
                color="error" 
                onClick={() => {
                  // إظهار رسالة تأكيد قبل المسح
                  if (window.confirm('هل تريد مسح جميع محتويات السبورة؟')) {
                    onClearWhiteboard();
                  }
                }}
                size="large"
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    backgroundColor: 'rgba(211, 47, 47, 0.1)'
                  }
                }}
              >
                <DeleteSweep />
              </IconButton>
            </Tooltip>
          )}
        </div>
        
        <Divider 
          orientation="vertical" 
          flexItem 
          sx={{ 
            mx: 1,
            backgroundColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' 
          }} 
        />
        
        {/* Color and thickness controls */}
        <div className="toolbar-section color-thickness-controls">
          <div className="color-picker-container">
            <Tooltip title="لون" placement="top">
              <IconButton 
                onClick={toggleColorPicker}
                size="large"
                sx={{ 
                  backgroundColor: currentColor,
                  '&:hover': {
                    backgroundColor: currentColor,
                    opacity: 0.8
                  },
                  border: darkMode ? '2px solid rgba(255,255,255,0.3)' : '2px solid rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease',
                  '&:active': {
                    transform: 'scale(0.95)'
                  }
                }}
              >
                <FormatColorFill style={{ color: getContrastColor(currentColor) }} />
              </IconButton>
            </Tooltip>
            
            {showColorPicker && (
              <div className="color-picker-popover" style={{ backgroundColor: darkMode ? '#2d2d2d' : '#ffffff', boxShadow: darkMode ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.2)' }}>
                <HexColorPicker color={currentColor} onChange={onColorChange} />
                <div className="color-palette">
                  {colorPalette.map((color) => (
                    <div 
                      key={color}
                      className="color-palette-item"
                      style={{ 
                        backgroundColor: color,
                        border: color === currentColor ? '2px solid #1976d2' : darkMode ? '1px solid #555' : '1px solid #ddd',
                        cursor: 'pointer',
                        width: '24px',
                        height: '24px',
                        margin: '3px',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                      onClick={() => onColorChange(color)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="thickness-slider">
            <Slider
              value={lineThickness}
              onChange={handleThicknessChange}
              aria-labelledby="line-thickness-slider"
              min={1}
              max={20}
              valueLabelDisplay="auto"
              marks={thicknessOptions.map(value => ({ value, label: '' }))}
              sx={{ 
                width: 120,
                color: darkMode ? '#90caf9' : '#1976d2',
                '& .MuiSlider-thumb': {
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.2)'
                  },
                },
                '& .MuiSlider-track': {
                  transition: 'height 0.2s ease',
                  height: 4,
                },
                '& .MuiSlider-rail': {
                  opacity: 0.5,
                  backgroundColor: darkMode ? '#bdbdbd' : '#000000',
                }
              }}
            />
            <div className="thickness-presets">
              {thicknessOptions.map((thickness) => (
                <div 
                  key={thickness}
                  className="thickness-preset-item"
                  style={{ 
                    width: `${thickness * 2}px`,
                    height: `${thickness * 2}px`,
                    borderRadius: '50%',
                    backgroundColor: darkMode ? '#ffffff' : '#000000',
                    opacity: lineThickness === thickness ? 1 : 0.5,
                    cursor: 'pointer',
                    margin: '0 3px',
                    display: 'inline-block',
                    transition: 'transform 0.2s, opacity 0.2s',
                    transform: lineThickness === thickness ? 'scale(1.2)' : 'scale(1)',
                  }}
                  onClick={() => onLineThicknessChange(thickness)}
                />
              ))}
            </div>
          </div>
        </div>
      </MUIToolbar>
    </Paper>
  );
};

// Helper function to determine text color based on background color
const getContrastColor = (hexColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export default Toolbar;
