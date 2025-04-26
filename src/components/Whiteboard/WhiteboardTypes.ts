import { ToolType } from "../../App";

/**
 * نقطة على السبورة
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * عنصر رسم على السبورة (إما أشكال أو صور أو نصوص)
 */
export interface DrawingElement {
  id: string;
  tool: ToolType;
  points?: Point[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  // دعم خاص للصور
  src?: string;            // مصدر الصورة
  fileName?: string;       // اسم الملف
  fileType?: string;       // نوع الملف (image/*)
  originalWidth?: number;  // العرض الأصلي
  originalHeight?: number; // الارتفاع الأصلي
  rotation?: number | { x: number; y: number; z: number }; // دوران العنصر (رقم للعناصر 2D أو كائن للعناصر 3D)
  // دعم للمعادلات الرياضية
  latex?: string;          // معادلة LaTeX
  // دعم للأشكال ثلاثية الأبعاد
  shapeId?: string;        // معرف الشكل ثلاثي الأبعاد
  name?: string;           // اسم الشكل
}

/**
 * خصائص السبورة
 */
export interface WhiteboardProps {
  currentTool: ToolType;
  currentColor: string;
  lineThickness: number;
  showGrid: boolean;
  onToolChange?: (tool: ToolType) => void;
  onToggleGrid: () => void;
}

/**
 * وضعية السبورة التي يتم حفظها
 */
export interface WhiteboardState {
  elements: DrawingElement[];
  currentPage: number;
  pages: Page[];
  zoom: number;
}

/**
 * صفحة من صفحات السبورة
 */
export interface Page {
  id: string;
  name: string;
  elements: DrawingElement[];
  thumbnail?: string;
}

/**
 * مدير تاريخ السبورة
 */
export class WhiteboardHistory {
  private history: DrawingElement[][] = [];
  private index: number = -1;
  
  constructor() {
    this.initialize();
  }
  
  /**
   * تهيئة التاريخ
   */
  initialize(initialState: DrawingElement[] = []): void {
    this.history = [initialState];
    this.index = 0;
  }
  
  /**
   * إضافة حالة جديدة للتاريخ
   */
  addState(elements: DrawingElement[]): void {
    // قطع التاريخ عند المؤشر الحالي
    if (this.index < this.history.length - 1) {
      this.history = this.history.slice(0, this.index + 1);
    }
    
    // إضافة نسخة عميقة من العناصر
    this.history.push(JSON.parse(JSON.stringify(elements)));
    this.index = this.history.length - 1;
  }
  
  /**
   * التراجع خطوة للخلف
   */
  undo(): DrawingElement[] | null {
    if (this.canUndo()) {
      this.index--;
      return this.getCurrentState();
    }
    return null;
  }
  
  /**
   * إعادة خطوة للأمام
   */
  redo(): DrawingElement[] | null {
    if (this.canRedo()) {
      this.index++;
      return this.getCurrentState();
    }
    return null;
  }
  
  /**
   * الحصول على الحالة الحالية
   */
  getCurrentState(): DrawingElement[] | null {
    if (this.index >= 0 && this.index < this.history.length) {
      return JSON.parse(JSON.stringify(this.history[this.index]));
    }
    return null;
  }
  
  /**
   * هل يمكن التراجع؟
   */
  canUndo(): boolean {
    return this.index > 0;
  }
  
  /**
   * هل يمكن الإعادة؟
   */
  canRedo(): boolean {
    return this.index < this.history.length - 1;
  }
  
  /**
   * مسح التاريخ
   */
  clear(): void {
    this.history = [[]];
    this.index = 0;
  }
}

/**
 * إعدادات الشبكة على السبورة
 */
export interface GridConfig {
  show: boolean;
  size: number;
  color: string;
  snapToGrid: boolean;
}

/**
 * خيارات الأدوات
 */
export interface ToolOptions {
  pen: {
    strokeWidth: number;
    color: string;
  };
  shapes: {
    strokeWidth: number;
    color: string;
    fill: string;
    fillEnabled: boolean;
  };
  text: {
    fontSize: number;
    fontFamily: string;
    color: string;
  };
  eraser: {
    size: number;
  };
}
