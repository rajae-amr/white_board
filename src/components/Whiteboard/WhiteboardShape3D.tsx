import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateRightIcon from '@mui/icons-material/RotateRight';

interface WhiteboardShape3DProps {
  shapeData: any;
  isSelected: boolean;
  onSelect: () => void;
  onMove?: (x: number, y: number) => void;
  onResize?: (width: number, height: number) => void;
  onRotate?: (x: number, y: number, z: number) => void;
  onDelete?: () => void;
}

const WhiteboardShape3D: React.FC<WhiteboardShape3DProps> = (props) => {
  const { shapeData, isSelected } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [position, setPosition] = useState({ x: shapeData.position.x, y: shapeData.position.y });
  const [size, setSize] = useState({ width: shapeData.size.width, height: shapeData.size.height });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    // إنشاء مشهد ثلاثي الأبعاد للشكل
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size.width, size.height);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    
    // إضافة الإضاءة
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // إنشاء الشكل
    let geometry: THREE.BufferGeometry;
    
    switch (shapeData.shapeId) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.7, 32, 32);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.7, 1, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        break;
      case 'pyramid':
        geometry = new THREE.TetrahedronGeometry(0.8);
        break;
      case 'prism':
        geometry = new THREE.CylinderGeometry(0.7, 0.7, 1, 3);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }
    
    const material = new THREE.MeshPhongMaterial({
      color: shapeData.color,
      shininess: 100
    });
    
    const shape = new THREE.Mesh(geometry, material);
    shape.rotation.x = shapeData.rotation.x;
    shape.rotation.y = shapeData.rotation.y;
    shape.rotation.z = shapeData.rotation.z;
    scene.add(shape);
    meshRef.current = shape;
    
    // إضافة التحكم
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    
    // الرسم المتكرر
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // تدوير بسيط للشكل
      if (meshRef.current && !controls.enabled) {
        meshRef.current.rotation.y += 0.003;
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (renderer) {
        renderer.dispose();
      }
      if (geometry) {
        geometry.dispose();
      }
      if (material) {
        material.dispose();
      }
    };
  }, [shapeData.shapeId, size.width, size.height]);
  
  // معالجة السحب والإفلات
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isSelected) {
      props.onSelect();
      return;
    }
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    setPosition({ x: newX, y: newY });
    
    if (props.onMove) {
      props.onMove(newX, newY);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // معالجة تغيير حجم الشكل
  const handleResize = (factor: number) => {
    const newWidth = Math.max(100, size.width + factor * 20);
    const newHeight = Math.max(100, size.height + factor * 20);
    
    setSize({ width: newWidth, height: newHeight });
    
    if (props.onResize) {
      props.onResize(newWidth, newHeight);
    }
    
    // تحديث حجم المشغل
    if (rendererRef.current) {
      rendererRef.current.setSize(newWidth, newHeight);
    }
  };
  
  // معالجة تدوير الشكل
  const handleRotate = () => {
    if (meshRef.current) {
      const rotX = meshRef.current.rotation.x + 0.2;
      const rotY = meshRef.current.rotation.y + 0.2;
      const rotZ = meshRef.current.rotation.z;
      
      meshRef.current.rotation.x = rotX;
      meshRef.current.rotation.y = rotY;
      
      if (props.onRotate) {
        props.onRotate(rotX, rotY, rotZ);
      }
    }
  };
  
  // معالجة حذف الشكل
  const handleDelete = () => {
    if (props.onDelete) {
      props.onDelete();
    }
  };
  
  return (
    <div 
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isSelected ? 1000 : 1
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: isSelected ? '0 0 0 2px #2196f3' : 'none',
          transition: 'box-shadow 0.3s ease'
        }}
      />
      
      {isSelected && (
        <Box
          sx={{
            position: 'absolute',
            top: '-40px',
            right: 0,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            display: 'flex',
            boxShadow: 1
          }}
        >
          <IconButton size="small" onClick={() => handleResize(1)} title="تكبير">
            <ZoomInIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleResize(-1)} title="تصغير">
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleRotate} title="تدوير">
            <RotateRightIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleDelete} title="حذف" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </div>
  );
};

export default WhiteboardShape3D;
