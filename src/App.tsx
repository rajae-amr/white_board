import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { ThemeProvider, createTheme, CssBaseline, PaletteMode, IconButton, Tooltip, ThemeOptions, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import './App.css';
import './custom-styles.css';

// استيراد المكونات بشكل متأخر
const Whiteboard = React.lazy(() => import('./components/Whiteboard/Whiteboard'));
const Toolbar = React.lazy(() => import('./components/Toolbar/Toolbar'));
const MathTools = React.lazy(() => import('./components/MathTools/MathTools'));
// استيراد مكون ContentDisplay لعرض محتوى الشريط الجانبي
const ContentDisplay = React.lazy(() => import('./components/ContentDisplay'));
const Sidebar = React.lazy(() => import('./components/Sidebar/Sidebar'));
const PageNavigation = React.lazy(() => import('./components/PageNavigation/PageNavigation'));
const ExportManager = React.lazy(() => import('./components/ExportManager/ExportManager'));

// تعريف الأنواع
export interface Link {
  id: string;
  title: string;
  url: string;
  category: string;
}

export interface Page {
  id: string;
  name: string;
  elements: any[];
  thumbnail?: string; // إضافة خاصية للصورة المصغرة للصفحة (اختيارية)
}

export type ToolType =
  | 'pen'
  | 'eraser'
  | 'line'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'text'
  | 'math'
  | 'grid'
  | 'graph'
  | 'select'
  | 'image'
  | 'pdf'
  | '3d-shape'
  | '3d-shape-cube'
  | '3d-shape-sphere'
  | '3d-shape-cone'
  | '3d-shape-cylinder'
  | '3d-shape-pyramid'
  | '3d-shape-prism';

// إعدادات السمة
const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#1976d2', dark: '#115293', light: '#4791db' },
          secondary: { main: '#dc004e', dark: '#9a0036', light: '#e33371' },
          background: { default: '#f5f5f5', paper: '#ffffff' },
          text: { primary: '#333333', secondary: '#666666' },
        }
      : {
          primary: { main: '#90caf9', dark: '#648dae', light: '#a6d4fa' },
          secondary: { main: '#f48fb1', dark: '#aa647b', light: '#f6a5c0' },
          background: { default: '#121212', paper: '#1e1e1e' },
          text: { primary: '#ffffff', secondary: '#b0b0b0' },
        }),
  },
  typography: { fontFamily: 'Cairo, Arial, sans-serif' },
  direction: 'rtl',
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 8, textTransform: 'none', fontFamily: 'Cairo, Arial, sans-serif' } },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
  },
});

function App() {
  const loading = (
    <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', direction: 'rtl', fontFamily: 'Cairo, Arial, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="loading-spinner" style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #1976d2',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px auto'
        }}></div>
        <h2>جاري تحميل السبورة الذكية...</h2>
      </div>
    </div>
  );

  const whiteboardRef = useRef<any>(null);
  const [mode, setMode] = useState<PaletteMode>('light');
  const [links, setLinks] = useState<Link[]>([]);
  const [pages, setPages] = useState<Page[]>([{ id: 'page-1', name: 'صفحة 1', elements: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineThickness, setLineThickness] = useState(2);
  const [showGrid, setShowGrid] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false); // حالة لتتبع القطع المفتوحة
  const [showMathTools, setShowMathTools] = useState(false);
  // حالة لتخزين المحتوى المختار من الشريط الجانبي
  const [sidebarContent, setSidebarContent] = useState<{componentType: string, componentId?: string} | null>(null);
  // حالة لتحديد ما إذا كان سيتم عرض محتوى الشريط الجانبي
  const [showSidebarContent, setShowSidebarContent] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isRulerEnabled, setIsRulerEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as PaletteMode | null;
    if (savedMode) setMode(savedMode);
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    const loadArabicFont = () => {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700&display=swap';
      document.head.appendChild(fontLink);
    };
    loadArabicFont();
  }, []);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const handleToolChange = (tool: ToolType) => setCurrentTool(tool);
  const handleColorChange = (color: string) => setCurrentColor(color);
  const handleLineThicknessChange = (thickness: number) => setLineThickness(thickness);

  const handleAddPage = () => {
    const newPageId = `page-${Date.now()}`;
    const newPageName = `صفحة ${pages.length + 1}`;
    const newPage = { id: newPageId, name: newPageName, elements: [] };
    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    const newPageIndex = updatedPages.length - 1;
    setCurrentPageIndex(newPageIndex);
    if (whiteboardRef.current?.addNewPage) whiteboardRef.current.addNewPage();
  };

  const handleGoToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPageIndex(pageIndex);
      if (whiteboardRef.current?.goToPage) whiteboardRef.current.goToPage(pageIndex);
    }
  };

  const handleRenamePage = (pageIndex: number, newName: string) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      const updatedPages = [...pages];
      updatedPages[pageIndex] = { ...updatedPages[pageIndex], name: newName };
      setPages(updatedPages);
      if (whiteboardRef.current?.renamePage) whiteboardRef.current.renamePage(pageIndex, newName);
    }
  };

  const handleDeletePage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length && pages.length > 1) {
      const updatedPages = [...pages];
      updatedPages.splice(pageIndex, 1);
      setPages(updatedPages);
      let newPageIndex = currentPageIndex;
      if (currentPageIndex >= pageIndex && currentPageIndex > 0) newPageIndex = currentPageIndex - 1;
      setCurrentPageIndex(newPageIndex);
      if (whiteboardRef.current?.deletePage) whiteboardRef.current.deletePage(pageIndex);
    }
  };

  // وظيفة نسخ الصفحة
  const handleDuplicatePage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      const pageToDuplicate = pages[pageIndex];
      const newPageId = `page-${Date.now()}`;
      const newPageName = `${pageToDuplicate.name} (نسخة)`;
      
      // نسخ العناصر من الصفحة الأصلية
      const duplicatedElements = pageToDuplicate.elements.map(element => ({
        ...element,
        id: `${element.id}-${Date.now()}` // إعادة إنشاء معرفات فريدة للعناصر
      }));
      
      // إنشاء الصفحة الجديدة
      const newPage = { 
        id: newPageId, 
        name: newPageName, 
        elements: duplicatedElements,
        thumbnail: pageToDuplicate.thumbnail 
      };
      
      // إضافة الصفحة الجديدة بعد الصفحة الأصلية
      const updatedPages = [...pages];
      updatedPages.splice(pageIndex + 1, 0, newPage);
      setPages(updatedPages);
      
      // الانتقال إلى الصفحة الجديدة
      setCurrentPageIndex(pageIndex + 1);
      
      // إضافة الصفحة في لوحة الرسم
      if (whiteboardRef.current?.duplicatePage) {
        whiteboardRef.current.duplicatePage(pageIndex);
      }
    }
  };

  // وظيفة تغيير ترتيب الصفحات
  const handleMovePage = (pageIndex: number, newIndex: number) => {
    if (
      pageIndex >= 0 && 
      pageIndex < pages.length && 
      newIndex >= 0 && 
      newIndex < pages.length &&
      pageIndex !== newIndex
    ) {
      const updatedPages = [...pages];
      const [movedPage] = updatedPages.splice(pageIndex, 1);
      updatedPages.splice(newIndex, 0, movedPage);
      setPages(updatedPages);
      
      // تحديث مؤشر الصفحة الحالية
      if (currentPageIndex === pageIndex) {
        setCurrentPageIndex(newIndex);
      } else if (currentPageIndex > pageIndex && currentPageIndex <= newIndex) {
        setCurrentPageIndex(currentPageIndex - 1);
      } else if (currentPageIndex < pageIndex && currentPageIndex >= newIndex) {
        setCurrentPageIndex(currentPageIndex + 1);
      }
      
      // تحديث ترتيب الصفحات في لوحة الرسم
      if (whiteboardRef.current?.reorderPages) {
        whiteboardRef.current.reorderPages(pageIndex, newIndex);
      }
    }
  };

  // وظيفة تصدير الصفحة
  const handleExportPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      // حفظ الصفحة الحالية
      const currentPage = currentPageIndex;
      
      // الانتقال إلى الصفحة المطلوب تصديرها
      if (currentPageIndex !== pageIndex) {
        setCurrentPageIndex(pageIndex);
        // الانتظار لتحميل الصفحة قبل التصدير
        setTimeout(() => {
          if (whiteboardRef.current?.exportCurrentPage) {
            whiteboardRef.current.exportCurrentPage();
          }
          // العودة إلى الصفحة الأصلية
          setCurrentPageIndex(currentPage);
        }, 100);
      } else {
        // تصدير الصفحة الحالية مباشرة
        if (whiteboardRef.current?.exportCurrentPage) {
          whiteboardRef.current.exportCurrentPage();
        }
      }
    }
  };

  const handleUndo = () => {
    if (whiteboardRef.current?.undo) whiteboardRef.current.undo();
  };

  const handleRedo = () => {
    if (whiteboardRef.current?.redo) whiteboardRef.current.redo();
  };

  const clearWhiteboard = () => {
    if (whiteboardRef.current?.clear) whiteboardRef.current.clear();
  };

  const toggleGrid = () => setShowGrid(!showGrid);
  const toggleRuler = () => setIsRulerEnabled(!isRulerEnabled);
  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const toggleMathTools = () => setShowMathTools(prev => !prev);
  
  // وظيفة لإغلاق أدوات الرياضيات
  const handleCloseMathTools = () => {
    setShowMathTools(false);
  };

  // وظيفة لمعالجة اختيار محتوى من الشريط الجانبي
  const handleSidebarContentSelect = (content: {componentType: string, componentId?: string}) => {
    setSidebarContent(content);
    setShowSidebarContent(true);
  };

  // وظيفة لإغلاق محتوى الشريط الجانبي
  const handleCloseSidebarContent = () => {
    setShowSidebarContent(false);
  };

  // وظيفة للحصول على عنوان المحتوى بناءً على نوعه
  const getContentTitle = (contentType: string, contentId?: string): string => {
    switch (contentType) {
      case 'calculator':
        if (contentId === 'scientific') return 'الآلة الحاسبة العلمية';
        if (contentId === 'statistical') return 'الآلة الحاسبة الإحصائية';
        if (contentId === 'matrix') return 'حاسبة المصفوفات';
        return 'الآلة الحاسبة';
      
      case 'measuringTool':
        if (contentId === 'ruler') return 'المسطرة الإلكترونية';
        if (contentId === 'protractor') return 'المنقلة';
        if (contentId === 'compass') return 'الفرجار الإلكتروني';
        return 'أدوات القياس';
      
      case 'shapes2d':
        return 'مكتبة الأشكال ثنائية الأبعاد';
      
      case 'shapes3d':
        return 'مكتبة الأشكال ثلاثية الأبعاد';
      
      case 'boardSettings':
        return 'إعدادات السبورة';
      
      default:
        return 'المحتوى';
    }
  };

  const toggleRecording = () => setIsRecording(!isRecording);

  const handleCloseExportDialog = () => setShowExportDialog(false);
  const handleOpenExportDialog = () => setShowExportDialog(true);

  const handleAddGraphToWhiteboard = (graphState: string) => {
    if (whiteboardRef.current) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const graphElement = {
        id: `graph-${Date.now()}`,
        tool: 'graph' as ToolType,
        x: centerX,
        y: centerY,
        graphState,
        color: currentColor,
      };
      whiteboardRef.current.addElement(graphElement);
    }
  };

  // وظيفة لإضافة الأشكال ثلاثية الأبعاد إلى السبورة
  const handleAddShapeToWhiteboard = (shapeData: any) => {
    if (whiteboardRef.current) {
      const shapeElement = {
        id: `3d-shape-${Date.now()}`,
        tool: '3d-shape' as ToolType,
        x: shapeData.position.x,
        y: shapeData.position.y,
        width: shapeData.size.width,
        height: shapeData.size.height,
        color: shapeData.color,
        strokeWidth: 1,
        shapeId: shapeData.shapeId,
        name: shapeData.name,
        rotation: shapeData.rotation
      };
      whiteboardRef.current.addElement(shapeElement);
    }
  };

  const updateUndoRedoState = () => {
    if (whiteboardRef.current) {
      try {
        if (whiteboardRef.current.canUndo) setCanUndo(whiteboardRef.current.canUndo());
        if (whiteboardRef.current.canRedo) setCanRedo(whiteboardRef.current.canRedo());
      } catch (error) {
        console.error('خطأ في تحديث حالة أزرار التراجع والإعادة:', error);
      }
    }
  };

  useEffect(() => {
    const checkWhiteboardRef = () => {
      if (whiteboardRef.current) updateUndoRedoState();
      else setTimeout(checkWhiteboardRef, 500);
    };
    checkWhiteboardRef();
    const intervalId = setInterval(updateUndoRedoState, 2000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className="App">
        <div className="theme-toggle">
          <Tooltip title={mode === 'light' ? 'تبديل إلى الوضع المظلم' : 'تبديل إلى الوضع المضيء'}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>
        </div>
        <Suspense fallback={loading}>
          <Toolbar
            currentTool={currentTool}
            onToolChange={handleToolChange}
            currentColor={currentColor}
            onColorChange={handleColorChange}
            lineThickness={lineThickness}
            onLineThicknessChange={handleLineThicknessChange}
            showGrid={showGrid}
            onToggleGrid={toggleGrid}
            canUndo={canUndo}
            onUndo={handleUndo}
            canRedo={canRedo}
            onRedo={handleRedo}
            onClearWhiteboard={clearWhiteboard}
            darkMode={mode === 'dark'}
            colorPalette={['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']}
            thicknessOptions={[1, 2, 3, 5, 8, 12]}
          />
          <div className="main-content">
            <div className="content-wrapper">
              <div className="whiteboard-area">
                <Suspense fallback={loading}>
                  <Whiteboard
                    ref={whiteboardRef}
                    currentTool={currentTool}
                    currentColor={currentColor}
                    lineThickness={lineThickness}
                    showGrid={showGrid}
                    onToggleGrid={toggleGrid}
                    onToolChange={handleToolChange}
                    pages={pages}
                    currentPageIndex={currentPageIndex}
                  />
                  <PageNavigation
                    pages={pages}
                    currentPageIndex={currentPageIndex}
                    onAddPage={handleAddPage}
                    onGoToPage={handleGoToPage}
                    onRenamePage={handleRenamePage}
                    onDeletePage={handleDeletePage}
                    onDuplicatePage={handleDuplicatePage}
                    onMovePage={handleMovePage}
                    onExportPage={handleExportPage}
                  />
                </Suspense>
              </div>
              {showSidebar && (
                <div className="sidebar-panel">
                  <Suspense fallback={loading}>
                    <Sidebar onContentSelect={handleSidebarContentSelect} />
                  </Suspense>
                </div>
              )}
              {showMathTools && (
                <Suspense fallback={loading}>
                  <MathTools onAddGraphToWhiteboard={handleAddGraphToWhiteboard} />
                </Suspense>
              )}
              {/* عرض محتوى الشريط الجانبي */}
              {showSidebarContent && sidebarContent && (
                <div className="sidebar-content-panel" style={{
                  position: 'absolute',
                  right: '260px',
                  top: '100px',
                  zIndex: 100,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  width: '650px',
                  maxHeight: '80vh',
                  direction: 'rtl'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderBottom: '1px solid #eee',
                    backgroundColor: '#f9f9f9' 
                  }}>
                    <Typography variant="h6">
                      {getContentTitle(sidebarContent.componentType, sidebarContent.componentId)}
                    </Typography>
                    <IconButton size="small" onClick={handleCloseSidebarContent}>
                      <CloseIcon />
                    </IconButton>
                  </div>
                  <Suspense fallback={loading}>
                    <ContentDisplay 
                      content={sidebarContent} 
                      onAddShapeToWhiteboard={handleAddShapeToWhiteboard}
                      onCloseContent={handleCloseSidebarContent}
                    />
                  </Suspense>
                </div>
              )}
              <Suspense fallback={loading}>
                <ExportManager
                  open={showExportDialog}
                  onClose={handleCloseExportDialog}
                  onExport={async () => ''}
                  whiteboardRef={whiteboardRef}
                />
              </Suspense>
              <div className="view-controls">
                <button onClick={toggleSidebar} className="view-control-button">
                  <span>{showSidebar ? 'إخفاء الشريط الجانبي' : 'إظهار الشريط الجانبي'}</span>
                </button>
                <button onClick={toggleMathTools} className="view-control-button">
                  <span>{showMathTools ? 'إخفاء أدوات الرياضيات' : 'إظهار أدوات الرياضيات'}</span>
                </button>
                <button onClick={toggleGrid} className="view-control-button">
                  <span>{showGrid ? 'إخفاء الشبكة' : 'إظهار الشبكة'}</span>
                </button>
                <button onClick={handleOpenExportDialog} className="view-control-button">
                  <span>تصدير المحتوى</span>
                </button>
                <button onClick={toggleRuler} className="view-control-button">
                  <span>{isRulerEnabled ? 'إخفاء المسطرة' : 'إظهار المسطرة'}</span>
                </button>
                <button onClick={clearWhiteboard} className="view-control-button">
                  <span>مسح السبورة</span>
                </button>
                <button onClick={toggleRecording} className="view-control-button">
                  <span>{isRecording ? 'إيقاف التسجيل' : 'بدء التسجيل'}</span>
                </button>
              </div>
              <div className="floating-math-button" onClick={toggleMathTools}>
                <span>∑</span>
              </div>
            </div>
          </div>
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;