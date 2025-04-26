import React, { useState, useRef } from 'react';
import { 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Button,
  Badge,
  Divider,
  Snackbar,
  Alert,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './PageNavigation.css';

interface Page {
  id: string;
  name: string;
  elements: any[];
  thumbnail?: string; // إضافة خاصية للصورة المصغرة اختيارية
}

interface PageNavigationProps {
  pages: Page[];
  currentPageIndex: number;
  onAddPage: () => void;
  onGoToPage: (pageIndex: number) => void;
  onRenamePage: (pageIndex: number, newName: string) => void;
  onDeletePage: (pageIndex: number) => void;
  onDuplicatePage?: (pageIndex: number) => void;
  onMovePage?: (pageIndex: number, newIndex: number) => void;
  onExportPage?: (pageIndex: number) => void;
}

const PageNavigation: React.FC<PageNavigationProps> = ({
  pages,
  currentPageIndex,
  onAddPage,
  onGoToPage,
  onRenamePage,
  onDeletePage,
  onDuplicatePage,
  onMovePage,
  onExportPage
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [pageToRename, setPageToRename] = useState(-1);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(-1);
  const [viewPageIndex, setViewPageIndex] = useState(-1);
  const [viewPageDialogOpen, setViewPageDialogOpen] = useState(false);
  const [expandedThumbnails, setExpandedThumbnails] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRenameClick = (pageIndex: number) => {
    setPageToRename(pageIndex);
    setNewPageName(pages[pageIndex].name);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleRenameSubmit = () => {
    if (pageToRename !== -1 && newPageName.trim()) {
      onRenamePage(pageToRename, newPageName);
    }
    setDialogOpen(false);
    setPageToRename(-1);
    setNewPageName('');
  };

  const handleDeleteClick = (pageIndex: number) => {
    setPageToDelete(pageIndex);
    setConfirmDeleteOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (pageToDelete !== -1) {
      onDeletePage(pageToDelete);
    }
    setConfirmDeleteOpen(false);
    setPageToDelete(-1);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setPageToDelete(-1);
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      onGoToPage(currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      onGoToPage(currentPageIndex + 1);
    }
  };

  // عرض إشعار
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // معالجة نسخ الصفحة
  const handleDuplicatePage = (pageIndex: number) => {
    if (onDuplicatePage) {
      onDuplicatePage(pageIndex);
      showNotification(`تم نسخ الصفحة ${pages[pageIndex].name} بنجاح`);
    }
    handleMenuClose();
  };

  // معالجة تصدير الصفحة
  const handleExportPage = (pageIndex: number) => {
    if (onExportPage) {
      onExportPage(pageIndex);
      showNotification(`جاري تصدير الصفحة ${pages[pageIndex].name}`, 'info');
    }
    handleMenuClose();
  };

  // معالجة تحريك الصفحة للأعلى
  const handleMovePageUp = (pageIndex: number) => {
    if (pageIndex > 0 && onMovePage) {
      onMovePage(pageIndex, pageIndex - 1);
      showNotification(`تم نقل الصفحة للأعلى`);
    }
    handleMenuClose();
  };

  // معالجة تحريك الصفحة للأسفل
  const handleMovePageDown = (pageIndex: number) => {
    if (pageIndex < pages.length - 1 && onMovePage) {
      onMovePage(pageIndex, pageIndex + 1);
      showNotification(`تم نقل الصفحة للأسفل`);
    }
    handleMenuClose();
  };

  // معالجة عرض الصفحة بشكل منفصل
  const handleViewPage = (pageIndex: number) => {
    setViewPageIndex(pageIndex);
    setViewPageDialogOpen(true);
    handleMenuClose();
  };

  // تبديل حالة عرض المصغرات الموسعة
  const toggleExpandedThumbnails = () => {
    setExpandedThumbnails(!expandedThumbnails);
  };

  // عرض مصغرات الصفحات
  const renderPageThumbnails = () => {
    // إذا كان العرض الموسّع مفعلاً، اعرض كل الصفحات
    const visiblePagesCount = expandedThumbnails ? pages.length : Math.min(pages.length, 5);
    const startIdx = expandedThumbnails ? 0 : Math.max(0, Math.min(currentPageIndex - Math.floor(visiblePagesCount / 2), pages.length - visiblePagesCount));
    
    return (
      <div 
        className={`page-thumbnails ${expandedThumbnails ? 'expanded' : ''}`}
        ref={thumbnailsContainerRef}
      >
        {pages.slice(startIdx, expandedThumbnails ? pages.length : startIdx + visiblePagesCount).map((page, idx) => {
          const actualIndex = expandedThumbnails ? idx : startIdx + idx;
          return (
            <div 
              key={page.id} 
              className={`page-thumbnail ${actualIndex === currentPageIndex ? 'active' : ''}`}
              onClick={() => onGoToPage(actualIndex)}
              title={page.name}
            >
              <div className="thumbnail-content">
                <span className="thumbnail-number">{actualIndex + 1}</span>
              </div>
              <div className="thumbnail-label">{page.name}</div>
            </div>
          );
        })}
        
        {pages.length > 5 && (
          <Tooltip title={expandedThumbnails ? "عرض مصغر" : "عرض كل الصفحات"}>
            <IconButton 
              size="small" 
              className="expand-thumbnails-button"
              onClick={toggleExpandedThumbnails}
            >
              {expandedThumbnails ? <CloseIcon fontSize="small" /> : <Badge badgeContent={pages.length} color="primary"><VisibilityIcon fontSize="small" /></Badge>}
            </IconButton>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div className="page-navigation">
      <div className="page-controls">
        <Tooltip title="الصفحة السابقة">
          <span>
            <IconButton 
              onClick={handlePreviousPage} 
              disabled={currentPageIndex === 0}
              size="small"
              className="page-nav-button"
            >
              <NavigateBeforeIcon />
            </IconButton>
          </span>
        </Tooltip>
        
        <div className="page-indicator">
          <span className="current-page">{currentPageIndex + 1}</span>
          <span className="page-count"> / {pages.length}</span>
        </div>
        
        <Tooltip title="الصفحة التالية">
          <span>
            <IconButton 
              onClick={handleNextPage}
              disabled={currentPageIndex >= pages.length - 1}
              size="small"
              className="page-nav-button"
            >
              <NavigateNextIcon />
            </IconButton>
          </span>
        </Tooltip>
        
        <Tooltip title="إضافة صفحة جديدة">
          <IconButton onClick={onAddPage} size="small" className="page-nav-button add-page">
            <AddIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="خيارات الصفحة">
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            className="page-nav-button"
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </div>
      
      {/* عرض مصغرات الصفحات */}
      {renderPageThumbnails()}
      
      {/* قائمة خيارات الصفحة */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleRenameClick(currentPageIndex)}>
          <EditIcon fontSize="small" style={{ marginLeft: 8 }} />
          إعادة تسمية الصفحة
        </MenuItem>
        {onDuplicatePage && (
          <MenuItem onClick={() => handleDuplicatePage(currentPageIndex)}>
            <ContentCopyIcon fontSize="small" style={{ marginLeft: 8 }} />
            نسخ الصفحة
          </MenuItem>
        )}
        {onExportPage && (
          <MenuItem onClick={() => handleExportPage(currentPageIndex)}>
            <SaveAltIcon fontSize="small" style={{ marginLeft: 8 }} />
            تصدير الصفحة
          </MenuItem>
        )}
        <Divider />
        {onMovePage && (
          <>
            <MenuItem 
              onClick={() => handleMovePageUp(currentPageIndex)}
              disabled={currentPageIndex <= 0}
            >
              <KeyboardArrowUpIcon fontSize="small" style={{ marginLeft: 8 }} />
              نقل الصفحة للأعلى
            </MenuItem>
            <MenuItem 
              onClick={() => handleMovePageDown(currentPageIndex)}
              disabled={currentPageIndex >= pages.length - 1}
            >
              <KeyboardArrowDownIcon fontSize="small" style={{ marginLeft: 8 }} />
              نقل الصفحة للأسفل
            </MenuItem>
            <Divider />
          </>
        )}
        <MenuItem onClick={() => handleViewPage(currentPageIndex)}>
          <VisibilityIcon fontSize="small" style={{ marginLeft: 8 }} />
          عرض الصفحة بشكل منفصل
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDeleteClick(currentPageIndex)}
          disabled={pages.length <= 1}
        >
          <DeleteIcon fontSize="small" style={{ marginLeft: 8, color: '#f44336' }} />
          حذف الصفحة
        </MenuItem>
      </Menu>
      
      {/* مربع حوار عرض الصفحة */}
      <Dialog 
        open={viewPageDialogOpen} 
        onClose={() => setViewPageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {viewPageIndex >= 0 && viewPageIndex < pages.length && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{pages[viewPageIndex].name}</span>
              <IconButton onClick={() => setViewPageDialogOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </div>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {viewPageIndex >= 0 && viewPageIndex < pages.length && (
            <div className="page-preview">
              {/* هنا يمكن عرض محتوى الصفحة */}
              <div className="page-preview-content" style={{ minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* يمكن هنا عرض الصورة المصغرة للصفحة */}
                {pages[viewPageIndex].thumbnail ? (
                  <img 
                    src={pages[viewPageIndex].thumbnail} 
                    alt={pages[viewPageIndex].name} 
                    style={{ maxWidth: '100%', maxHeight: '100%', background: 'white' }} 
                  />
                ) : (
                  <div className="page-placeholder" style={{ 
                    padding: 20, 
                    textAlign: 'center', 
                    width: '100%',
                    height: '400px',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6">محتوى الصفحة {viewPageIndex + 1}</Typography>
                    <Typography variant="body1" style={{ margin: '10px 0' }}>
                      عدد العناصر: {pages[viewPageIndex].elements.length}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      style={{ marginTop: 10 }}
                      onClick={() => {
                        setViewPageDialogOpen(false);
                        onGoToPage(viewPageIndex);
                      }}
                    >
                      الانتقال إلى هذه الصفحة
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {onExportPage && (
            <Button 
              onClick={() => {
                if (viewPageIndex >= 0) handleExportPage(viewPageIndex);
                setViewPageDialogOpen(false);
              }}
              color="primary"
              startIcon={<SaveAltIcon />}
            >
              تصدير
            </Button>
          )}
          <Button onClick={() => setViewPageDialogOpen(false)} color="inherit">
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* إشعار العمليات */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={3000} 
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* مربع حوار إعادة تسمية الصفحة */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>إعادة تسمية الصفحة</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="اسم الصفحة"
            fullWidth
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            variant="outlined"
            inputProps={{ dir: 'rtl' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            إلغاء
          </Button>
          <Button onClick={handleRenameSubmit} color="primary">
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* مربع حوار تأكيد الحذف */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          هل أنت متأكد من رغبتك في حذف هذه الصفحة؟ لا يمكن التراجع عن هذه العملية.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            إلغاء
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PageNavigation;
