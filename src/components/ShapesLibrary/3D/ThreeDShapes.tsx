import React, { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  FormControl, 
  Select, 
  MenuItem, 
  InputLabel,
  SelectChangeEvent,
  Divider,
  CircularProgress,
  Slider,
  IconButton,
  Tooltip,
  InputAdornment,
  TextField
} from '@mui/material';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './ThreeDShapes.css';

interface ShapeOption {
  id: string;
  name: string;
  className: string;
  create: (color: number, wireframe: boolean) => THREE.Mesh;
}

interface ThreeDShapesProps {
  onAddShape?: (shapeData: any) => void;
}

const createShapeMaterial = (color: number, wireframe: boolean = false) => new THREE.MeshPhongMaterial({
  color: color,
  shininess: 100,
  side: THREE.DoubleSide,
  wireframe: wireframe
});

const shapeOptions: ShapeOption[] = [
  {
    id: 'cube',
    name: 'مكعب',
    className: 'shape-cube',
    create: (color, wireframe) => new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      createShapeMaterial(color, wireframe)
    )
  },
  {
    id: 'sphere',
    name: 'كرة',
    className: 'shape-sphere',
    create: (color, wireframe) => new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 32, 32),
      createShapeMaterial(color, wireframe)
    )
  },
  {
    id: 'cone',
    name: 'مخروط',
    className: 'shape-cone',
    create: (color, wireframe) => new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 1, 32),
      createShapeMaterial(color, wireframe)
    )
  },
  {
    id: 'cylinder',
    name: 'أسطوانة',
    className: 'shape-cylinder',
    create: (color, wireframe) => new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
      createShapeMaterial(color, wireframe)
    )
  },
  {
    id: 'pyramid',
    name: 'هرم',
    className: 'shape-pyramid',
    create: (color, wireframe) => new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.8),
      createShapeMaterial(color, wireframe)
    )
  },
  {
    id: 'prism',
    name: 'منشور',
    className: 'shape-prism',
    create: (color, wireframe) => new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 1, 3),
      createShapeMaterial(color, wireframe)
    )
  },
  {
    id: 'torus',
    name: 'حلقة',
    className: 'shape-torus',
    create: (color, wireframe) => new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.2, 16, 100),
      createShapeMaterial(color, wireframe)
    )
  },
  {
    id: 'octahedron',
    name: 'ثماني الأوجه',
    className: 'shape-octahedron',
    create: (color, wireframe) => new THREE.Mesh(
      new THREE.OctahedronGeometry(0.7),
      createShapeMaterial(color, wireframe)
    )
  },
  {
    id: 'dodecahedron',
    name: 'اثني عشري الأوجه',
    className: 'shape-dodecahedron',
    create: (color, wireframe) => new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.7),
      createShapeMaterial(color, wireframe)
    )
  }
];

const ThreeDShapes: React.FC<ThreeDShapesProps> = (props) => {
  const [selectedShape, setSelectedShape] = useState<string>('cube');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shapeColor, setShapeColor] = useState<string>('#2196f3');
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.005);

  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const objectRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const initializeScene = () => {
    if (!canvasRef.current) return;

    setIsLoading(true);

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2.5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(400, 400);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controlsRef.current = controls;

    // Append renderer to DOM
    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(renderer.domElement);

    // Add initial shape
    const shapeOption = shapeOptions.find(option => option.id === selectedShape);
    if (shapeOption) {
      const object = shapeOption.create(new THREE.Color(shapeColor).getHex(), wireframe);
      scene.add(object);
      objectRef.current = object;
    }

    setIsLoading(false);
  };

  const animate = () => {
    animationFrameRef.current = requestAnimationFrame(animate);

    if (objectRef.current) {
      objectRef.current.rotation.x += rotationSpeed;
      objectRef.current.rotation.y += rotationSpeed;
    }

    if (controlsRef.current) {
      controlsRef.current.update();
    }

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  useEffect(() => {
    initializeScene();
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !objectRef.current) return;

    // Remove previous shape
    sceneRef.current.remove(objectRef.current);

    // Add new shape
    const shapeOption = shapeOptions.find(option => option.id === selectedShape);
    if (shapeOption) {
      const object = shapeOption.create(new THREE.Color(shapeColor).getHex(), wireframe);
      sceneRef.current.add(object);
      objectRef.current = object;
    }
  }, [selectedShape, shapeColor, wireframe]);

  const handleShapeChange = (event: SelectChangeEvent) => {
    setSelectedShape(event.target.value);
  };

  const handleAddShape = () => {
    const shapeOption = shapeOptions.find(option => option.id === selectedShape);
    if (!shapeOption) return;

    // إنشاء كائن يحتوي على معلومات الشكل
    // الحصول على دوران الشكل الحالي وحفظه
    const currentRotation = objectRef.current ? {
      x: objectRef.current.rotation.x,
      y: objectRef.current.rotation.y,
      z: objectRef.current.rotation.z
    } : { x: 0, y: 0, z: 0 };

    const shapeData = {
      type: '3d-shape',
      shapeId: selectedShape,
      name: shapeOption.name,
      position: { x: 100, y: 100 },
      size: { width: 150, height: 150 },
      rotation: currentRotation,
      color: shapeColor,
      wireframe: wireframe
    };

    console.log(`تمت إضافة ${getShapeName(selectedShape)} إلى السبورة`);
    
    // استدعاء الدالة التي تم تمريرها من الأب لإضافة الشكل إلى السبورة
    if (props.onAddShape) {
      props.onAddShape(shapeData);
    }
  };

  const getShapeName = (id: string): string => {
    const option = shapeOptions.find(option => option.id === id);
    return option ? option.name : id;
  };

  const basicShapes = shapeOptions.slice(0, 4);
  const advancedShapes = shapeOptions.slice(4);

  // دالة التقاط لقطة شاشة للشكل الحالي
  const captureScreenshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    
    // حفظ حالة الدوران
    if (controlsRef.current) {
      controlsRef.current.update();
    }
    
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    
    try {
      const dataURL = rendererRef.current.domElement.toDataURL('image/png');
      
      // إنشاء رابط مؤقت للتنزيل
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${getShapeName(selectedShape)}.png`;
      link.click();
      
      console.log('تم حفظ الصورة بنجاح');
    } catch (error) {
      console.error('خطأ في حفظ الصورة:', error);
    }
  };
  
  // تحويل قيمة hex إلى rgb لاستخدامها في three.js
  const hexToRgb = (hex: string) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    return { r, g, b };
  };
  
  // تحديث لون الشكل الحالي
  const updateShapeColor = (colorHex: string) => {
    setShapeColor(colorHex);
    
    if (objectRef.current && objectRef.current.material) {
      // تحديث لون الشكل
      const material = objectRef.current.material as THREE.MeshPhongMaterial;
      material.color.setHex(new THREE.Color(colorHex).getHex());
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        maxWidth: 800, 
        margin: '20px auto', 
        maxHeight: '90vh', 
        overflow: 'auto',
        borderRadius: 2
      }}
    >
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        مكتبة الأشكال ثلاثية الأبعاد
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 200, maxWidth: 350 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="shape-select-label">اختر الشكل</InputLabel>
            <Select
              labelId="shape-select-label"
              value={selectedShape}
              label="اختر الشكل"
              onChange={handleShapeChange}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ p: 1, fontWeight: 'bold' }}>
                الأشكال الأساسية
              </Typography>
              {basicShapes.map(option => (
                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
              ))}
              <Divider />
              <Typography variant="subtitle2" sx={{ p: 1, fontWeight: 'bold' }}>
                الأشكال المتقدمة
              </Typography>
              {advancedShapes.map(option => (
                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
            الشكل الحالي: <strong>{getShapeName(selectedShape)}</strong>
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            استخدم الماوس لتدوير الشكل، والتمرير للتكبير/التصغير
          </Typography>

          {/* خصائص الشكل */}
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
            خصائص الشكل
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>لون الشكل</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                size="small"
                value={shapeColor}
                onChange={(e) => updateShapeColor(e.target.value)}
                inputProps={{
                  style: { width: '80px' }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          backgroundColor: shapeColor,
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              عرض سلكي
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={wireframe ? "true" : "false"}
                onChange={(e) => setWireframe(e.target.value === "true")}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="false">إخفاء</MenuItem>
                <MenuItem value="true">إظهار</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>سرعة الدوران</Typography>
            <Slider
              value={rotationSpeed * 1000} // تحويل لعرض أفضل
              min={0}
              max={20}
              step={1}
              onChange={(_, newValue) => setRotationSpeed(Number(newValue) / 1000)}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value / 1000}`}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Box 
              sx={{ 
                flex: 1,
                p: 2, 
                borderRadius: 1, 
                backgroundColor: '#f5f5f5', 
                border: '1px dashed #ccc',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'background-color 0.3s',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                }
              }}
              onClick={handleAddShape}
            >
              <Typography variant="button">
                إضافة الشكل إلى السبورة
              </Typography>
            </Box>
            
            <Tooltip title="التقاط صورة للشكل الحالي">
              <IconButton 
                color="primary" 
                onClick={captureScreenshot}
                sx={{ 
                  border: '1px dashed #ccc',
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#e0e0e0',
                  }
                }}
              >
                <CameraAltIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            width: 400, 
            height: 400, 
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: '#f0f0f0'
          }}
        >
          {isLoading && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <Box ref={canvasRef} sx={{ width: '100%', height: '100%' }} />
        </Box>
      </Box>
    </Paper>
  );
};

export default ThreeDShapes;