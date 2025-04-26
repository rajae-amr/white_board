import React from 'react';
import './ZoomControl.css';

export interface ZoomControlProps {
  currentZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}

/**
 * مكون التحكم في التكبير والتصغير للسبورة
 */
const ZoomControl: React.FC<ZoomControlProps> = ({
  currentZoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  minZoom = 0.5,
  maxZoom = 3,
  zoomStep = 0.1
}) => {
  // تنسيق النسبة المئوية للعرض
  const formatZoom = (zoom: number): string => {
    return `${Math.round(zoom * 100)}%`;
  };

  // التحقق من إمكانية التكبير
  const canZoomIn = currentZoom < maxZoom;
  
  // التحقق من إمكانية التصغير
  const canZoomOut = currentZoom > minZoom;

  return (
    <div className="zoom-control">
      <button
        className="zoom-button zoom-out"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        title="تصغير"
      >
        −
      </button>
      
      <button
        className="zoom-button zoom-reset"
        onClick={onZoomReset}
        title="إعادة تعيين حجم العرض"
      >
        {formatZoom(currentZoom)}
      </button>
      
      <button
        className="zoom-button zoom-in"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        title="تكبير"
      >
        +
      </button>
    </div>
  );
};

export default ZoomControl;
