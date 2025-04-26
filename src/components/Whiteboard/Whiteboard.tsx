import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, RefObject } from 'react';
import { Stage, Layer, Line, Circle, Rect, Transformer, Image as KonvaImage, Text as KonvaText, RegularPolygon, Group } from 'react-konva';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { KonvaEventObject } from 'konva/lib/Node';
import { ToolType } from '../../App';
import { DrawingElement, Page } from './WhiteboardTypes';
import './Whiteboard.css';

// استيراد مكون WhiteboardShape3D
import WhiteboardShape3D from './WhiteboardShape3D';

// استيراد المكونات الجديدة
import '../DrawingTools/DrawingTools.css';
import '../HistoryManager/HistoryManager.css';
import '../PageManager/PageManager.css';
import '../ZoomControl/ZoomControl.css';
import '../LinkManager/LinkManager.css';

// استخدام واجهة DrawingElement المستوردة من WhiteboardTypes

interface WhiteboardProps {
  currentTool: ToolType;
  currentColor: string;
  lineThickness: number;
  showGrid: boolean;
  onToolChange?: (tool: ToolType) => void;
  onColorChange?: (color: string) => void;
  onThicknessChange?: (thickness: number) => void;
  onToggleGrid: () => void;
  // إضافة دعم للصفحات والروابط
  pages?: Page[];
  currentPageIndex?: number;
  onAddPage?: () => void;
  onGoToPage?: (pageIndex: number) => void;
  onRenamePage?: (pageIndex: number, newName: string) => void;
  onDeletePage?: (pageIndex: number) => void;
}

// استخدام واجهة Point المستوردة من WhiteboardTypes

const Whiteboard = forwardRef<any, WhiteboardProps>((props, ref) => {
  const { currentTool, currentColor, lineThickness, showGrid } = props;
  
  // State إضافية للتكبير والتراجع/الإعادة
  
  // Refs
  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transformerRef = useRef<any>(null);
  const whiteboardContainerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [history, setHistory] = useState<DrawingElement[][]>([[]]);  // سجل للتراجع والإعادة
  const [historyIndex, setHistoryIndex] = useState(0);
  const [textEditingId, setTextEditingId] = useState<string | null>(null);
  const [textEditingValue, setTextEditingValue] = useState<string>("");
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  // تعريف متغيرات لدعم التراجع والإعادة والتكبير/التصغير
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState<number>(1);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [mediaCache, setMediaCache] = useState<Record<string, HTMLImageElement>>({});
  
  // دعم الصفحات المتعددة
  const [pages, setPages] = useState<{ id: string; name: string; elements: DrawingElement[] }[]>([{
    id: 'page-1',
    name: 'صفحة 1',
    elements: []
  }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Expose functions through ref
  // دالة للتعامل مع رفع الصور
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileType = file.type;
    
    // التحقق من نوع الملف المرفع
    if (fileType.startsWith('image/')) {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        // تحويل الملف إلى Data URL
        const src = reader.result as string;
        
        // إنشاء صورة لمعرفة أبعادها
        const img = new Image();
        img.src = src;
        
        img.onload = () => {
          // توفير الصورة للكاش
          const imgCopy = new Image();
          imgCopy.src = src;
          const mediaId = generateId();
          setMediaCache(prev => ({ ...prev, [mediaId]: imgCopy }));
          
          // حساب الأبعاد المناسبة لعرض الصورة
          const maxWidth = stageSize.width * 0.8;
          const maxHeight = stageSize.height * 0.8;
          
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
          }
          
          if (height > maxHeight) {
            const ratio = maxHeight / height;
            height = maxHeight;
            width = width * ratio;
          }
          
          // إضافة عنصر الصورة إلى السبورة
          const imageElement: DrawingElement = {
            id: mediaId,
            tool: 'image',
            x: (stageSize.width - width) / 2,
            y: (stageSize.height - height) / 2,
            width: width,
            height: height,
            color: currentColor,
            strokeWidth: lineThickness,
            src: src,
            fileName: file.name,
            fileType: fileType,
            originalWidth: img.width,
            originalHeight: img.height,
            rotation: 0,
          };
          
          // تحديث عناصر السبورة
          const updatedElements = [...elements, imageElement];
          updateElements(updatedElements);
          
          // تحديد العنصر الجديد
          setSelectedElementId(mediaId);
          
          // إعادة تعيين الأداة إلى التحديد
          props.onToolChange?.('select');
        }
      };
      
      reader.readAsDataURL(file);
    } else {
      alert('يرجى رفع صورة أو ملف PDF فقط');
    }
    
    // إعادة تعيين قيمة الإدخال للسماح بتحميل نفس الملف مرة أخرى
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // دالة لتحفيز حقل الملف عند النقر على أداة الصورة أو PDF
  const triggerFileUpload = (fileType: 'image' | 'pdf') => {
    if (fileInputRef.current) {
      if (fileType === 'image') {
        fileInputRef.current.accept = 'image/*';
      } else {
        fileInputRef.current.accept = 'application/pdf';
      }
      // لا ندعو الهذه الدالة تلقائيًا في useEffect
      // رسالة للمستخدم بدلاً من ذلك
    }
  };

  useImperativeHandle(ref, () => ({
    getElements: () => elements,
    getStage: () => stageRef.current,
    getHistory: () => history,
    getHistoryIndex: () => historyIndex,
    toDataURL: () => stageRef.current?.toDataURL(),
    // وظيفة التراجع (Undo)
    undo: handleUndo,
    // وظيفة الإعادة (Redo)
    redo: handleRedo,
    canUndo: () => {
      // التحقق من إمكانية التراجع - بسيطة ومباشرة
      const canUndo = historyIndex > 0;
      // تقليل السجلات للحد من الضجيج
      // console.log('CAN_UNDO:', canUndo, '(index:', historyIndex, ', size:', history.length, ')');
      return canUndo;
    },
    canRedo: () => {
      // التحقق من إمكانية الإعادة - بسيطة ومباشرة
      const canRedo = historyIndex < history.length - 1;
      // تقليل السجلات للحد من الضجيج
      // console.log('CAN_REDO:', canRedo, '(index:', historyIndex, ', size:', history.length, ')');
      return canRedo;
    },
    clearWhiteboard: () => {
      // حفظ الحالة الحالية في التاريخ قبل المسح
      addToHistory(elements);
      
      // تفريغ كل العناصر
      setElements([]);
      
      // إضافة الحالة الفارغة إلى التاريخ
      addToHistory([]);
    }
  }));

  // Generate a unique ID for each element
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // متابعة التغييرات في التاريخ للتأكد من تحديث الحالة
  useEffect(() => {
    // تنبيه عن تحديث التاريخ
    notifyHistoryChange();
  }, [history, historyIndex]);
  
  // متابعة العنصر المحدد
  useEffect(() => {
    if (selectedElementId) {
      // تحديث المحول عند تغيير العنصر المحدد
      if (transformerRef.current) {
        const selectedNode = layerRef.current?.findOne(`#${selectedElementId}`);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      }
    } else {
      // إلغاء تحديد كل العقد
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedElementId]);

  // تهيئة سجل التاريخ عند تحميل المكون
  useEffect(() => {
    // تهيئة حالة التاريخ الابتدائية
    if (history.length === 0) {
      // إنشاء تاريخ مع حالة فارغة كأول عنصر
      const initialHistory = [[]];
      setHistory(initialHistory);
      setHistoryIndex(0);
      console.log('History initialized with empty state');
    }
    
    // إرسال إشعار لتحديث حالة الأزرار
    window.dispatchEvent(new Event('historyChange'));
  }, []);
  
  // إضافة مراقبة للتغييرات في العناصر
  useEffect(() => {
    // تجنب إضافة الحالة الأولية مرتين
    if (elements.length === 0 && historyIndex <= 0) {
      return;
    }
    
    // تجنب إضافة حالة جديدة إذا كنا نقوم بالتراجع أو الإعادة
    if (!isDrawing && !textEditingId) {
      console.log('Elements changed via undo/redo, not adding to history');
      // إشعار التطبيق بتغيير التاريخ لتحديث حالة الأزرار
      notifyHistoryChange();
    }
  }, [elements]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth - 300,
        height: window.innerHeight - 120
      });
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Add current state to history when elements change
  useEffect(() => {
    if (elements.length > 0 && !isDrawing) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...elements]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [elements, isDrawing]);

  // Handle keydown events for undo/redo and text editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // إذا كان هناك نص قيد التحرير
      if (textEditingId) {
        if (e.key === 'Escape') {
          // إلغاء وضع التحرير عند الضغط على ESC
          setTextEditingId(null);
        } else if (e.key === 'Enter' && !e.shiftKey) {
          // إنهاء التحرير عند الضغط على Enter
          handleFinishTextEditing();
        }
        return;
      }
      
      // وظائف التراجع والإعادة
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex, textEditingId]);

  // التحقق من تغيير الأداة النشطة
  useEffect(() => {
    if (currentTool === 'grid') {
      // تبديل ظهور الشبكة
      props.onToggleGrid();
    }
    // تم إزالة تشغيل حوار الملفات تلقائيًا لأنه يتسبب في أخطاء
  }, [currentTool, props.onToggleGrid]);
  
  // التعامل مع تحديد العناصر
  const handleElementSelect = (id: string) => {
    setSelectedElementId(id);
  };
  
  // إلغاء تحديد العناصر
  const clearSelection = () => {
    setSelectedElementId(null);
  };
  
  // Handle mouse down event
  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // Ignore if editing text
    if (textEditingId) {
      return;
    }
    
    // إلغاء التحديد عند النقر على مكان فارغ
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      clearSelection();
    }
    
    // إذا كان في وضع التحديد، لا تبدأ في الرسم
    if (currentTool === 'select') {
      return;
    }
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition() || { x: 0, y: 0 };
    
    setIsDrawing(true);
    
    // Create a new element based on the current tool
    const newElement: DrawingElement = {
      id: generateId(),
      tool: currentTool,
      color: currentColor,
      strokeWidth: lineThickness,
    };
    
    // Set additional properties based on the tool
    switch (currentTool) {
      case 'pen':
      case 'eraser':
        newElement.points = [{ x: pos.x, y: pos.y }];
        break;
      case 'line':
        newElement.points = [{ x: pos.x, y: pos.y }, { x: pos.x, y: pos.y }];
        break;
      case 'rect':
        newElement.x = pos.x;
        newElement.y = pos.y;
        newElement.width = 0;
        newElement.height = 0;
        break;
      case 'circle':
        newElement.x = pos.x;
        newElement.y = pos.y;
        newElement.radius = 0;
        break;
      case 'triangle':
        newElement.x = pos.x;
        newElement.y = pos.y;
        newElement.radius = 0;
        break;
      case 'text':
        newElement.x = pos.x;
        newElement.y = pos.y;
        newElement.text = 'انقر لتعديل النص';
        setTextEditingId(newElement.id); // بدء تحرير النص مباشرة بعد إضافته
        break;
      default:
        break;
    }
    
    setCurrentElement(newElement);
    setElements([...elements, newElement]);
  };

  // Handle mouse move event
  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !currentElement) return;
    
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition() || { x: 0, y: 0 };
    
    // Update the current element based on the tool
    const updatedElements = [...elements];
    const index = updatedElements.findIndex(el => el.id === currentElement.id);
    
    if (index === -1) return;
    
    switch (currentElement.tool) {
      case 'pen':
      case 'eraser':
        updatedElements[index].points = [
          ...(updatedElements[index].points || []),
          { x: point.x, y: point.y }
        ];
        break;
      case 'line':
        {
          // التحقق من وجود النقاط وحفظ المرجع محلياً
          const element = updatedElements[index];
          const points = element.points;
          
          if (points && points.length >= 2) {
            points[1] = { x: point.x, y: point.y };
            element.points = points; // إعادة تعيين النقاط بعد التعديل
          }
        }
        break;
      case 'rect':
        {
          const element = updatedElements[index];
          const x = element.x;
          const y = element.y;
          
          if (typeof x === 'number' && typeof y === 'number') {
            element.width = point.x - x;
            element.height = point.y - y;
          }
        }
        break;
      case 'circle':
        {
          const element = updatedElements[index];
          const x = element.x;
          const y = element.y;
          
          if (typeof x === 'number' && typeof y === 'number') {
            const dx = point.x - x;
            const dy = point.y - y;
            element.radius = Math.sqrt(dx * dx + dy * dy);
          }
        }
        break;
      case 'triangle':
        {
          const element = updatedElements[index];
          const x = element.x;
          const y = element.y;
          
          if (typeof x === 'number' && typeof y === 'number') {
            const dx = point.x - x;
            const dy = point.y - y;
            element.radius = Math.sqrt(dx * dx + dy * dy);
          }
        }
        break;
      default:
        break;
    }
    
    setElements(updatedElements);
    setCurrentElement(updatedElements[index]);
  };

  // إشعار التطبيق بتغيير التاريخ
  const notifyHistoryChange = () => {
    console.log('Dispatching historyChange event');
    window.dispatchEvent(new Event('historyChange'));
  };

  // دالة مساعدة لتحديث التاريخ - تنفيذ مبسط
  const addToHistory = (elements: DrawingElement[]) => {
    console.log('Adding to history at index', historyIndex, 'current history size:', history.length);
    
    // قطع التاريخ إلى المؤشر الحالي
    let newHistory;
    try {
      // قطع التاريخ إلى المؤشر الحالي
      newHistory = [...history];
      if (historyIndex < history.length - 1) {
        newHistory = newHistory.slice(0, historyIndex + 1);
      }
      
      // إضافة الحالة الجديدة (نسخة عميقة من العناصر)
      const elementsCopy = [...elements]; // نسخة بسيطة للعناصر
      newHistory.push(elementsCopy);
      
      // تحديث التاريخ والمؤشر
      const newIndex = newHistory.length - 1;
      console.log('New history size:', newHistory.length, 'new index:', newIndex);
      setHistory(newHistory);
      setHistoryIndex(newIndex);
      
      // إشعار التطبيق بتغيير التاريخ
      window.dispatchEvent(new Event('historyChange'));
      return true;
    } catch (error) {
      console.error('Error adding to history:', error);
      return false;
    }
  };

  // Handle mouse up event
  const handleMouseUp = () => {
    // إذا كان هناك نص قيد التحرير، لا تنتهي من الرسم
    if (textEditingId) return;
    
    if (isDrawing) {
      // تسجيل الحالة الجديدة في التاريخ بعد الانتهاء من الرسم
      console.log('Drawing finished, adding state to history');
      addToHistory(elements);
    }
    
    setIsDrawing(false);
    setCurrentElement(null);
  };

  // وظيفة التراجع (Undo) - تنفيذ جديد مبسط
  const handleUndo = () => {
    console.log('UNDO FORCED: historyIndex =', historyIndex, 'total history =', history.length);
    
    // التحقق من إمكانية التراجع
    if (historyIndex > 0) {
      try {
        // التراجع خطوة للخلف
        const newIndex = historyIndex - 1;
        console.log('Setting historyIndex to', newIndex);
        
        // الحصول على العناصر من التاريخ
        const prevState = history[newIndex];
        console.log('Previous state elements:', prevState ? prevState.length : 'none');
        
        // تعيين الحالة الجديدة
        setHistoryIndex(newIndex); // تغيير المؤشر أولاً
        
        // نسخ عميق للعناصر وتطبيقها
        if (prevState) {
          // نسخة عميقة للتأكد من عدم مشاركة المراجع
          const elementsCopy = JSON.parse(JSON.stringify(prevState));
          setElements(elementsCopy);
          console.log('UNDO SUCCESS: Applied', elementsCopy.length, 'elements');
        } else {
          // إذا لم تكن هناك عناصر
          setElements([]);
          console.log('UNDO SUCCESS: Cleared elements');
        }
        
        // إعلام التطبيق بالتغيير
        window.dispatchEvent(new Event('historyChange'));
        return true;
      } catch (error) {
        console.error('ERROR IN UNDO:', error);
        return false;
      }
    }
    
    console.log('Nothing to undo - at start of history');
    return false;
  };

  // وظيفة الإعادة (Redo) - تنفيذ جديد مبسط
  const handleRedo = () => {
    console.log('REDO FORCED: historyIndex =', historyIndex, 'total history =', history.length);
    
    // التحقق من إمكانية الإعادة
    if (historyIndex < history.length - 1) {
      try {
        // الانتقال خطوة للأمام
        const newIndex = historyIndex + 1;
        console.log('Setting historyIndex to', newIndex);
        
        // الحصول على العناصر من التاريخ
        const nextState = history[newIndex];
        console.log('Next state elements:', nextState ? nextState.length : 'none');
        
        // تعيين الحالة الجديدة
        setHistoryIndex(newIndex); // تغيير المؤشر أولاً
        
        // نسخ عميق للعناصر وتطبيقها
        if (nextState) {
          // نسخة عميقة للتأكد من عدم مشاركة المراجع
          const elementsCopy = JSON.parse(JSON.stringify(nextState));
          setElements(elementsCopy);
          console.log('REDO SUCCESS: Applied', elementsCopy.length, 'elements');
        } else {
          // إذا لم تكن هناك عناصر
          setElements([]);
          console.log('REDO SUCCESS: Cleared elements');
        }
        
        // إعلام التطبيق بالتغيير
        window.dispatchEvent(new Event('historyChange'));
        return true;
      } catch (error) {
        console.error('ERROR IN REDO:', error);
        return false;
      }
    }
    
    console.log('Nothing to redo - at end of history');
    return false;
  };
  
  // معالجة تغيير النص
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!textEditingId) return;
    
    const updatedElements = [...elements];
    const index = updatedElements.findIndex(el => el.id === textEditingId);
    
    if (index !== -1) {
      updatedElements[index].text = e.target.value;
      setElements(updatedElements);
      // لا نحتاج إضافة للتاريخ هنا لأن هناك نص قيد التحرير
    }
  };
  
  // دالة إنهاء تحرير النص
  const handleFinishTextEditing = () => {
    if (!textEditingId) return;
    
    // حفظ تاريخ الحالة عند النتهاء من الرسم للسماح بالتراجع
    if (currentElement) {
      console.log('Drawing finished, adding state to history');
      const updatedElements = [...elements, { ...currentElement }];
      
      // تم الانتهاء من العنصر، إضافته إلى العناصر وتاريخ التغييرات
      setElements(updatedElements);
      addToHistory(updatedElements);
      
      // إعادة تعيين العنصر الحالي
      setCurrentElement(null);
    }
    
    // حفظ أي تغييرات على العناصر المحددة (صور، PDF)
    if (selectedElementId) {
      addToHistory([...elements]);
    }
    
    setTextEditingId(null);
    
    // تحديد النص الذي تم الانتهاء من تحريره
    setSelectedElementId(textEditingId);
  };
  
  // مكون محرر النص
  const TextEditor = () => {
    if (!textEditingId) return null;
    
    const textElement = elements.find(el => el.id === textEditingId);
    if (!textElement) return null;
    
    const textNode = layerRef.current?.findOne(`#${textEditingId}`);
    const position = textNode ? 
      { x: textNode.x(), y: textNode.y() } : 
      { x: textElement.x || 0, y: textElement.y || 0 };
    
    return (
      <div
        style={{
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
          zIndex: 1000,
        }}
      >
        <textarea
          autoFocus
          defaultValue={textElement.text || ''}
          onChange={handleTextChange}
          onBlur={() => setTextEditingId(null)}
          style={{
            width: '200px',
            minHeight: '50px',
            backgroundColor: 'white',
            border: '1px solid #0096FF',
            padding: '5px',
            fontFamily: 'Cairo, Arial',
            fontSize: '18px',
            color: textElement.color,
            direction: 'rtl',
            textAlign: 'right',
          }}
        />
      </div>
    );
  };

  // Render grid lines if enabled
  const renderGrid = () => {
    if (!showGrid) return null;
    
    const gridSize = 20;
    const gridLines = [];
    
    // Vertical lines
    for (let i = 0; i <= stageSize.width; i += gridSize) {
      gridLines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, stageSize.height]}
          stroke="#ddd"
          strokeWidth={0.5}
        />
      );
    }
    
    // Horizontal lines
    for (let i = 0; i <= stageSize.height; i += gridSize) {
      gridLines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, stageSize.width, i]}
          stroke="#ddd"
          strokeWidth={0.5}
        />
      );
    }
    
    return gridLines;
  };
  
  // تحديث موضع وحجم العنصر المحدد
  const handleTransform = (elementId: string, newAttrs: any) => {
    const updatedElements = elements.map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          ...newAttrs
        };
      }
      return el;
    });
    
    setElements(updatedElements);
  };
  
  // حفظ التغييرات بعد انتهاء التحويل
  const handleTransformEnd = () => {
    addToHistory([...elements]);
  };
  

  
  // Render all drawing elements
  const renderElements = () => {
    return elements.map(element => renderElement(element));
  };
  
  // دالة لعرض العنصر المناسب بناءً على نوع الأداة
  const renderElement = (element: DrawingElement) => {
    switch (element.tool) {
      case 'image':
        // ضبط حجم قماش الرسم ليناسب حجم النافذة
        const adjustStageSize = () => {
          const containerElement = document.querySelector('.whiteboard-container') as HTMLElement;
          if (!containerElement) return;
  
          const { clientWidth, clientHeight } = containerElement;
          setStageSize({
            width: clientWidth,
            height: clientHeight,
          });
        };

        // استخدام الصورة المخزنة مؤقتًا إن وجدت
        const imageElement = mediaCache[element.id];
        
        if (imageElement) {
          return (
            <KonvaImage
              key={element.id}
              id={element.id}
              image={imageElement}
              x={element.x || 0}
              y={element.y || 0}
              width={element.width || 100}
              height={element.height || 100}
              rotation={typeof element.rotation === 'number' ? element.rotation : 0}
              draggable={currentTool === 'select'}
              onClick={() => handleElementSelect(element.id)}
              onTap={() => handleElementSelect(element.id)}
              onDragEnd={(e) => {
                handleTransform(element.id, {
                  x: e.target.x(),
                  y: e.target.y()
                });
                handleTransformEnd();
              }}
              onTransformEnd={(e) => {
                const node = e.target;
                handleTransform(element.id, {
                  x: node.x(),
                  y: node.y(),
                  width: node.width() * node.scaleX(),
                  height: node.height() * node.scaleY(),
                  rotation: node.rotation() as number
                });
                node.scaleX(1);
                node.scaleY(1);
                handleTransformEnd();
              }}
            />
          );
        }

        // إذا لم تكن الصورة جاهزة، حاول تحميلها
        if (element.src) {
          const img = new Image();
          img.src = element.src;
          img.onload = () => {
            setMediaCache(prev => ({
              ...prev,
              [element.id]: img
            }));
          };
        }
        return null;
      case 'pen':
        return (
          <Line
            key={element.id}
            points={element.points?.flatMap(p => [p.x, p.y]) || []}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        );
      case 'eraser':
        return (
          <Line
            key={element.id}
            points={element.points?.flatMap(p => [p.x, p.y]) || []}
            stroke="rgba(0,0,0,1)"
            strokeWidth={element.strokeWidth * 2}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation="destination-out"
            listening={false}
          />
        );
      case 'line':
        return (
          <Line
            key={element.id}
            points={element.points?.flatMap(p => [p.x, p.y]) || []}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            lineCap="round"
          />
        );
      case 'rect':
        return (
          <Rect
            key={element.id}
            x={element.x || 0}
            y={element.y || 0}
            width={element.width || 0}
            height={element.height || 0}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            fill="transparent"
          />
        );
      case 'circle':
        return (
          <Circle
            key={element.id}
            x={element.x || 0}
            y={element.y || 0}
            radius={element.radius || 0}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            fill="transparent"
          />
        );
      case 'triangle':
        return (
          <RegularPolygon
            key={element.id}
            x={element.x || 0}
            y={element.y || 0}
            sides={3}
            radius={element.radius || 50} // إضافة قيمة افتراضية لنصف القطر
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            fill="transparent"
            rotation={180}
            draggable
          />
        );
      case 'text':
        // لا تعرض النص إذا كان قيد التحرير حاليًا
        if (element.id === textEditingId) {
          return null;
        }
        return (
          <KonvaText
            key={element.id}
            id={element.id}
            x={element.x || 0}
            y={element.y || 0}
            text={element.text || ''}
            fontSize={18}
            fill={element.color}
            fontFamily="Cairo, Arial"
            align="right"
            draggable
            onClick={(e) => {
              // تحديد النص عند النقر عليه
              setSelectedElementId(element.id);
              e.cancelBubble = true;
            }}
            onDblClick={(e) => {
              // تفعيل تحرير النص عند النقر المزدوج
              setTextEditingId(element.id);
              e.cancelBubble = true;
            }}
            // تطبيق نمط مختلف عند التحديد
            stroke={selectedElementId === element.id ? '#0096FF' : undefined}
            strokeWidth={selectedElementId === element.id ? 1 : 0}
          />
        );
      case 'math':
        // عرض معادلات LaTeX بشكل مبسط
        if (element.latex) {
          // عرض معادلة كنص مخصص لتجنب مشاكل العرض المعقدة
          return (
            <Group key={element.id} draggable>
              <Rect
                x={element.x || 0}
                y={element.y || 0}
                width={150}
                height={50}
                fill="#f9f9f9"
                stroke={element.color}
                strokeWidth={1}
                cornerRadius={5}
                shadowColor="rgba(0,0,0,0.2)"
                shadowBlur={3}
                shadowOffsetX={1}
                shadowOffsetY={1}
                onClick={() => handleElementSelect(element.id)}
                onTap={() => handleElementSelect(element.id)}
                onDragEnd={(e) => {
                  handleTransform(element.id, {
                    x: e.target.x(),
                    y: e.target.y()
                  });
                  handleTransformEnd();
                }}
              />
              <KonvaText
                x={(element.x || 0) + 10}
                y={(element.y || 0) + 15}
                text={element.latex || ''}
                fontSize={16}
                fill={element.color}
                width={130}
                align="center"
                fontFamily="monospace"
              />
            </Group>
          );
        }
        return null;
      case '3d-shape':
        if (element.x === undefined || element.y === undefined || 
            element.width === undefined || element.height === undefined) {
          return null;
        }
        return (
          <div key={element.id} style={{ position: 'absolute', pointerEvents: 'auto' }}>
            <WhiteboardShape3D
              shapeData={{
                type: '3d-shape',
                shapeId: element.shapeId || 'cube',
                name: element.name || 'مكعب',
                position: { x: element.x, y: element.y },
                size: { width: element.width, height: element.height },
                rotation: typeof element.rotation === 'object' ? element.rotation as { x: number; y: number; z: number } : { x: 0, y: 0, z: 0 },
                color: element.color
              }}
              isSelected={selectedElementId === element.id}
              onSelect={() => handleElementSelect(element.id)}
              onMove={(x, y) => handleTransform(element.id, { x, y })}
              onResize={(width, height) => handleTransform(element.id, { width, height })}
              onRotate={(x, y, z) => handleTransform(element.id, { rotation: { x, y, z } })}
              onDelete={() => {
                const updatedElements = elements.filter(el => el.id !== element.id);
                updateElements(updatedElements);
              }}
            />
          </div>
        );
      // يمكن إضافة المزيد من أنواع الأدوات هنا
      default:
        return null;
    }
  };

  // دالة التراجع عن التغييرات
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  };

  // دالة إعادة التغييرات
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  };
  
  // دالة مسح السبورة
  const clearWhiteboard = () => {
    setElements([]);
    addToHistory([]);
  };
  
  // تحديث عناصر السبورة
  const updateElements = (newElements: DrawingElement[]) => {
    setElements(newElements);
    
    // تحديث عناصر الصفحة الحالية
    const updatedPages = [...pages];
    updatedPages[currentPageIndex].elements = newElements;
    setPages(updatedPages);
  };

  // وظائف إدارة الصفحات
  const addNewPage = () => {
    const newPageId = `page-${pages.length + 1}`;
    setPages(prevPages => [
      ...prevPages,
      {
        id: newPageId,
        name: `صفحة ${pages.length + 1}`,
        elements: []
      }
    ]);
    // الانتقال للصفحة الجديدة
    setCurrentPageIndex(pages.length);
  };
  
  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      // حفظ الصفحة الحالية
      const updatedPages = [...pages];
      updatedPages[currentPageIndex].elements = [...elements];
      setPages(updatedPages);
      
      // الانتقال للصفحة المطلوبة
      setCurrentPageIndex(pageIndex);
      setElements(updatedPages[pageIndex].elements);
      
      // إعادة تعيين التاريخ للصفحة الجديدة
      setHistory([[...updatedPages[pageIndex].elements]]);
      setHistoryIndex(0);
    }
  };
  
  const renamePage = (pageIndex: number, newName: string) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      const updatedPages = [...pages];
      updatedPages[pageIndex].name = newName;
      setPages(updatedPages);
    }
  };
  
  const deletePage = (pageIndex: number) => {
    // لا يمكن حذف الصفحة إذا كانت الوحيدة
    if (pages.length <= 1) return;
    
    // حذف الصفحة والانتقال للصفحة السابقة إذا كانت الصفحة المحذوفة هي الحالية
    const updatedPages = pages.filter((_, index) => index !== pageIndex);
    setPages(updatedPages);
    
    // تحديث الصفحة الحالية
    if (currentPageIndex === pageIndex) {
      // الانتقال للصفحة السابقة، أو الأولى إذا تم حذف الصفحة الأولى
      const newPageIndex = pageIndex > 0 ? pageIndex - 1 : 0;
      setCurrentPageIndex(newPageIndex);
      setElements(updatedPages[newPageIndex].elements);
      
      // إعادة تعيين التاريخ للصفحة الجديدة
      setHistory([[...updatedPages[newPageIndex].elements]]);
      setHistoryIndex(0);
    } else if (currentPageIndex > pageIndex) {
      // تحديث مؤشر الصفحة الحالية إذا تم حذف صفحة قبلها
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  // وظيفة نسخ الصفحة
  const duplicatePage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      // حفظ الصفحة الحالية أولاً
      const updatedPages = [...pages];
      updatedPages[currentPageIndex].elements = [...elements];

      // نسخ الصفحة المطلوبة
      const pageToDuplicate = updatedPages[pageIndex] as Page;
      const newPageId = `page-${Date.now()}`;
      const newPageName = `${pageToDuplicate.name} (نسخة)`;
      
      // نسخ العناصر مع إنشاء معرفات جديدة
      const duplicatedElements = pageToDuplicate.elements.map(element => ({
        ...element,
        id: `${element.id}-${Date.now()}`
      }));
      
      // إنشاء الصفحة الجديدة
      const newPage: Page = { 
        id: newPageId, 
        name: newPageName, 
        elements: duplicatedElements,
        thumbnail: pageToDuplicate.thumbnail 
      };
      
      // إضافة الصفحة الجديدة بعد الصفحة الأصلية
      updatedPages.splice(pageIndex + 1, 0, newPage);
      setPages(updatedPages);
      
      // الانتقال إلى الصفحة الجديدة
      setCurrentPageIndex(pageIndex + 1);
      setElements(duplicatedElements);
      
      // إعادة تعيين التاريخ للصفحة الجديدة
      setHistory([[...duplicatedElements]]);
      setHistoryIndex(0);
    }
  };

  // وظيفة إعادة ترتيب الصفحات
  const reorderPages = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex >= 0 && 
      fromIndex < pages.length && 
      toIndex >= 0 && 
      toIndex < pages.length && 
      fromIndex !== toIndex
    ) {
      // حفظ الصفحة الحالية أولاً
      const updatedPages = [...pages];
      updatedPages[currentPageIndex].elements = [...elements];

      // إعادة ترتيب الصفحات
      const [movedPage] = updatedPages.splice(fromIndex, 1);
      updatedPages.splice(toIndex, 0, movedPage);
      setPages(updatedPages);
      
      // تحديث مؤشر الصفحة الحالية
      if (currentPageIndex === fromIndex) {
        // الانتقال مع الصفحة التي تم نقلها
        setCurrentPageIndex(toIndex);
      } else if (currentPageIndex > fromIndex && currentPageIndex <= toIndex) {
        // تحريك مؤشر الصفحة للخلف
        setCurrentPageIndex(currentPageIndex - 1);
      } else if (currentPageIndex < fromIndex && currentPageIndex >= toIndex) {
        // تحريك مؤشر الصفحة للأمام
        setCurrentPageIndex(currentPageIndex + 1);
      }
    }
  };

  // وظيفة تصدير الصفحة الحالية كصورة
  const exportCurrentPage = () => {
    if (stageRef.current) {
      try {
        // حفظ الحالة الحالية للستيج
        const stage = stageRef.current;
        const currentBgColor = stage.container().style.background;
        
        // تعيين خلفية بيضاء للستيج قبل التصدير
        stage.container().style.background = 'white';
        
        // إنشاء نسخة من الستيج لتصديرها مع خلفية بيضاء
        const dataURL = stage.toDataURL({ 
          pixelRatio: 2, // جودة أعلى
          mimeType: 'image/png',
          backgroundColor: 'white' // تعيين خلفية بيضاء
        });
        
        // إعادة الخلفية إلى حالتها الأصلية
        stage.container().style.background = currentBgColor;

        // إنشاء رابط مؤقت لتنزيل الصورة
        const link = document.createElement('a');
        link.download = `${pages[currentPageIndex].name || 'سبورة'}-${new Date().toISOString().slice(0,10)}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // تحديث طريقة العرض المصغرة للصفحة
        const updatedPages = [...pages];
        const updatedPage = updatedPages[currentPageIndex] as Page;
        updatedPage.thumbnail = dataURL;
        setPages(updatedPages);

        return true;
      } catch (error) {
        console.error('خطأ في تصدير الصفحة:', error);
        return false;
      }
    }
    return false;
  };

  // إضافة عنصر جديد للسبورة (مفيدة للمعادلات الرياضية والعناصر الخارجية)
  const addElement = (element: DrawingElement) => {
    const updatedElements = [...elements, element];
    setElements(updatedElements);
    addToHistory(updatedElements);
    return element.id;
  };

  // إضافة مراجع المكون للاستخدام الخارجي
  useImperativeHandle(ref, () => ({
    canUndo: () => historyIndex > 0,
    canRedo: () => historyIndex < history.length - 1,
    undo,
    redo,
    clear: clearWhiteboard,
    addElement,
    // وظائف إدارة الصفحات الجديدة
    addNewPage,
    goToPage,
    renamePage,
    deletePage,
    duplicatePage,
    reorderPages,
    exportCurrentPage,
    toDataURL: () => {
      if (stageRef.current) {
        return stageRef.current.toDataURL();
      }
      return null;
    }
  }));
  
  return (
    <div className="whiteboard-container" ref={whiteboardContainerRef}>
      {/* محرر النصوص */}
      {textEditingId && <TextEditor />}
      
      {/* حقل إدخال مخفي لرفع الملفات */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept="image/*"
      />
      

      
      {/* رسالة توجيه للمستخدم عند اختيار أداة الصورة */}
      {currentTool === 'image' && (
        <div className="upload-info" style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,150,255,0.9)',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '4px',
          fontSize: '14px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 1000,
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
            إضافة صورة
          </div>
          <div>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              style={{
                background: '#fff', 
                color: '#0096ff', 
                border: 'none', 
                padding: '5px 15px', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              اضغط هنا لاختيار ملف
            </button>
          </div>
        </div>
      )}
      

      
      {/* مكوّن التحكم بالتكبير والتصغير */}
      <div className="zoom-controls" style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 100,
        display: 'flex',
        gap: '10px',
        backgroundColor: '#fff',
        padding: '5px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
      }}>
        <button 
          onClick={() => setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5))}
          disabled={zoom <= 0.5}
          style={{
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: zoom <= 0.5 ? '#f0f0f0' : '#fff',
            cursor: zoom <= 0.5 ? 'not-allowed' : 'pointer',
            opacity: zoom <= 0.5 ? 0.5 : 1
          }}
        >
          −
        </button>
        <button 
          onClick={() => setZoom(1)}
          style={{
            minWidth: '50px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {`${Math.round(zoom * 100)}%`}
        </button>
        <button 
          onClick={() => setZoom(prevZoom => Math.min(prevZoom + 0.1, 3))}
          disabled={zoom >= 3}
          style={{
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: zoom >= 3 ? '#f0f0f0' : '#fff',
            cursor: zoom >= 3 ? 'not-allowed' : 'pointer',
            opacity: zoom >= 3 ? 0.5 : 1
          }}
        >
          +
        </button>
      </div>

      {/* مكوّن التاريخ (التراجع والإعادة) */}
      <div className="history-manager" style={{
        position: 'absolute',
        bottom: '70px',
        left: '20px',
        zIndex: 100,
        display: 'flex',
        gap: '10px',
        backgroundColor: '#fff',
        padding: '5px 10px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
      }}>
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          style={{
            backgroundColor: canUndo ? '#fff' : '#f0f0f0',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            opacity: canUndo ? 1 : 0.5
          }}
          title="تراجع"
        >
          ↩️ تراجع
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          style={{
            backgroundColor: canRedo ? '#fff' : '#f0f0f0',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: canRedo ? 'pointer' : 'not-allowed',
            opacity: canRedo ? 1 : 0.5
          }}
          title="إعادة"
        >
          ↪️ إعادة
        </button>
        <button
          onClick={() => {
            setElements([]);
            addToHistory([]);
          }}
          style={{
            backgroundColor: '#fff1f0',
            border: '1px solid #ffccc7',
            color: '#f5222d',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: 'pointer',
          }}
          title="مسح الكل"
        >
          🗑️ مسح الكل
        </button>
      </div>

      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={(e: any) => handleMouseDown(e as KonvaEventObject<MouseEvent>)}
        onTouchMove={(e: any) => handleMouseMove(e as KonvaEventObject<MouseEvent>)}
        onTouchEnd={(e: any) => handleMouseUp()}
        ref={stageRef}
        scaleX={zoom}
        scaleY={zoom}
        draggable={currentTool === 'select' && zoom !== 1}
      >
        <Layer ref={layerRef}>
          {/* رسم الشبكة إذا كانت مفعلة */}
          {showGrid && renderGrid()}
          
          {/* رسم كل العناصر */}
          {renderElements()}
          {currentElement && (
            <>
              {currentElement.tool === 'pen' && (
                <Line
                  points={currentElement.points?.flatMap(p => [p.x, p.y]) || []}
                  stroke={currentElement.color}
                  strokeWidth={currentElement.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
              {currentElement.tool === 'line' && (
                <Line
                  points={currentElement.points?.flatMap(p => [p.x, p.y]) || []}
                  stroke={currentElement.color}
                  strokeWidth={currentElement.strokeWidth}
                  lineCap="round"
                />
              )}
              {currentElement.tool === 'rect' && (
                <Rect
                  x={currentElement.x}
                  y={currentElement.y}
                  width={currentElement.width}
                  height={currentElement.height}
                  stroke={currentElement.color}
                  strokeWidth={currentElement.strokeWidth}
                />
              )}
              {currentElement.tool === 'circle' && (
                <Circle
                  x={currentElement.x}
                  y={currentElement.y}
                  radius={currentElement.radius}
                  stroke={currentElement.color}
                  strokeWidth={currentElement.strokeWidth}
                />
              )}
              {currentElement.tool === 'triangle' && (
                <RegularPolygon
                  x={currentElement.x || 0}
                  y={currentElement.y || 0}
                  sides={3}
                  radius={currentElement.radius || 50} // إضافة قيمة افتراضية لنصف القطر
                  stroke={currentElement.color}
                  strokeWidth={currentElement.strokeWidth}
                />
              )}
            </>
          )}
          
          {/* محول العناصر للتحكم في الصور وملفات PDF */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // التأكد من أن الكائن لا يمكن أن يكون أصغر من حد معين
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            enabledAnchors={[
              'top-left', 'top-center', 'top-right', 'middle-right',
              'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'
            ]}
            rotateEnabled={true}
            keepRatio={false}
            borderStroke="#0096ff"
            anchorStroke="#0096ff"
            anchorFill="#fff"
            anchorSize={8}
          />
        </Layer>
      </Stage>
    </div>
  );
});

export default Whiteboard;
