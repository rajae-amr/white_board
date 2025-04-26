import React from 'react';
import { ToolType } from '../../App';

// نوع لأدوات الرسم
export interface DrawingToolProps {
  currentTool: ToolType;
  currentColor: string;
  lineThickness: number;
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: string) => void;
  onLineThicknessChange: (thickness: number) => void;
}

// مكون أدوات الرسم
const DrawingTools: React.FC<DrawingToolProps> = ({
  currentTool,
  currentColor,
  lineThickness,
  onToolChange,
  onColorChange,
  onLineThicknessChange
}) => {
  // تعريف الأدوات المتاحة
  const tools = [
    { name: 'select', icon: '⟲', title: 'تحديد' },
    { name: 'pen', icon: '✎', title: 'قلم' },
    { name: 'line', icon: '⟍', title: 'خط' },
    { name: 'rect', icon: '□', title: 'مستطيل' },
    { name: 'circle', icon: '○', title: 'دائرة' },
    { name: 'triangle', icon: '△', title: 'مثلث' },
    { name: 'text', icon: 'أ', title: 'نص' },
    { name: 'latex', icon: '∑', title: 'رياضيات' },
    { name: 'image', icon: '🖼', title: 'صورة' },
    { name: 'eraser', icon: '⌫', title: 'ممحاة' }
  ];

  // ألوان افتراضية للوحة الألوان
  const colorPalette = [
    '#000000', // أسود
    '#ffffff', // أبيض
    '#ff0000', // أحمر
    '#00ff00', // أخضر
    '#0000ff', // أزرق
    '#ffff00', // أصفر
    '#ff00ff', // وردي
    '#00ffff'  // سماوي
  ];

  // خيارات سمك الخط
  const thicknessOptions = [1, 2, 4, 8, 12, 16];

  return (
    <div className="drawing-tools">
      {/* أدوات الرسم */}
      <div className="tools-section">
        {tools.map((tool) => (
          <button
            key={tool.name}
            className={`tool-button ${currentTool === tool.name ? 'active' : ''}`}
            onClick={() => onToolChange(tool.name as ToolType)}
            title={tool.title}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* لوحة الألوان */}
      <div className="color-section">
        {colorPalette.map((color) => (
          <div
            key={color}
            className={`color-swatch ${currentColor === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
          ></div>
        ))}
      </div>

      {/* سمك الخط */}
      <div className="thickness-section">
        {thicknessOptions.map((thickness) => (
          <button
            key={thickness}
            className={`thickness-button ${lineThickness === thickness ? 'active' : ''}`}
            onClick={() => onLineThicknessChange(thickness)}
          >
            <div
              className="thickness-preview"
              style={{ height: thickness, width: '20px', backgroundColor: currentColor }}
            ></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DrawingTools;
