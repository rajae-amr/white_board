import React from 'react';
import { DrawingElement } from '../Whiteboard/WhiteboardTypes';

// واجهة خصائص مدير التاريخ
export interface HistoryManagerProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearAll: () => void;
}

/**
 * مكون إدارة التاريخ للتراجع والإعادة ومسح كل شيء
 */
const HistoryManager: React.FC<HistoryManagerProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearAll
}) => {
  return (
    <div className="history-manager">
      <button
        className={`history-button undo-button ${!canUndo ? 'disabled' : ''}`}
        onClick={onUndo}
        disabled={!canUndo}
        title="تراجع"
      >
        <span className="icon">↩</span>
        <span className="text">تراجع</span>
      </button>
      
      <button
        className={`history-button redo-button ${!canRedo ? 'disabled' : ''}`}
        onClick={onRedo}
        disabled={!canRedo}
        title="إعادة"
      >
        <span className="icon">↪</span>
        <span className="text">إعادة</span>
      </button>
      
      <button
        className="history-button clear-button"
        onClick={onClearAll}
        title="مسح الكل"
      >
        <span className="icon">🗑️</span>
        <span className="text">مسح الكل</span>
      </button>
    </div>
  );
};

// كلاس لإدارة التاريخ
export class History<T> {
  private history: T[][] = [];
  private index: number = -1;
  
  /**
   * إضافة حالة جديدة إلى التاريخ
   */
  addState(state: T[]): void {
    // حذف التاريخ الذي يتجاوز المؤشر الحالي
    this.history = this.history.slice(0, this.index + 1);
    
    // إضافة الحالة الجديدة
    this.history.push([...state]);
    this.index = this.history.length - 1;
  }
  
  /**
   * التراجع عن الحالة الحالية
   */
  undo(): T[] | null {
    if (this.canUndo()) {
      this.index--;
      return this.getCurrentState();
    }
    return null;
  }
  
  /**
   * إعادة الحالة السابقة
   */
  redo(): T[] | null {
    if (this.canRedo()) {
      this.index++;
      return this.getCurrentState();
    }
    return null;
  }
  
  /**
   * الحصول على الحالة الحالية
   */
  getCurrentState(): T[] | null {
    if (this.index >= 0 && this.index < this.history.length) {
      return [...this.history[this.index]];
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
    this.history = [];
    this.index = -1;
  }
  
  /**
   * إضافة حالة أولية (فارغة) إذا كان التاريخ فارغًا
   */
  initialize(initialState: T[] = []): void {
    if (this.history.length === 0) {
      this.addState(initialState);
    }
  }
}

export default HistoryManager;
