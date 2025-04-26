import React, { useState } from 'react';
import './PageManager.css';
import { DrawingElement } from '../Whiteboard/WhiteboardTypes';

export interface Page {
  id: string;
  name: string;
  elements: DrawingElement[];
  thumbnail?: string;
}

export interface PageManagerProps {
  pages: Page[];
  currentPageId: string;
  onPageChange: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onRenamePage: (pageId: string, newName: string) => void;
}

/**
 * مكون إدارة الصفحات للتنقل بين صفحات السبورة المتعددة
 */
const PageManager: React.FC<PageManagerProps> = ({
  pages,
  currentPageId,
  onPageChange,
  onAddPage,
  onDeletePage,
  onRenamePage
}) => {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState<string>('');

  // بدء تحرير اسم الصفحة
  const startEditing = (pageId: string, currentName: string) => {
    setEditingPageId(pageId);
    setNewPageName(currentName);
  };

  // تأكيد تغيير اسم الصفحة
  const confirmRename = (pageId: string) => {
    if (newPageName.trim()) {
      onRenamePage(pageId, newPageName.trim());
    }
    setEditingPageId(null);
  };

  // إلغاء تحرير اسم الصفحة
  const cancelEditing = () => {
    setEditingPageId(null);
  };

  return (
    <div className="page-manager">
      <div className="page-tabs">
        {pages.map((page) => (
          <div 
            key={page.id} 
            className={`page-tab ${currentPageId === page.id ? 'active' : ''}`}
          >
            <div 
              className="page-tab-content" 
              onClick={() => onPageChange(page.id)}
            >
              {editingPageId === page.id ? (
                <input
                  type="text"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  onBlur={() => confirmRename(page.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmRename(page.id);
                    if (e.key === 'Escape') cancelEditing();
                  }}
                  autoFocus
                />
              ) : (
                <span className="page-name">{page.name}</span>
              )}
            </div>
            <div className="page-actions">
              <button 
                className="rename-button" 
                onClick={() => startEditing(page.id, page.name)}
                title="إعادة تسمية"
              >
                ✏️
              </button>
              {pages.length > 1 && (
                <button 
                  className="delete-button" 
                  onClick={() => onDeletePage(page.id)}
                  title="حذف"
                >
                  ❌
                </button>
              )}
            </div>
          </div>
        ))}
        <button 
          className="add-page-button" 
          onClick={onAddPage}
          title="إضافة صفحة جديدة"
        >
          +
        </button>
      </div>
      
      <div className="page-navigation">
        <button 
          className="nav-button prev"
          onClick={() => {
            const currentIndex = pages.findIndex(p => p.id === currentPageId);
            if (currentIndex > 0) {
              onPageChange(pages[currentIndex - 1].id);
            }
          }}
          disabled={pages.findIndex(p => p.id === currentPageId) === 0}
          title="الصفحة السابقة"
        >
          ←
        </button>
        <span className="page-indicator">
          {`${pages.findIndex(p => p.id === currentPageId) + 1} / ${pages.length}`}
        </span>
        <button 
          className="nav-button next"
          onClick={() => {
            const currentIndex = pages.findIndex(p => p.id === currentPageId);
            if (currentIndex < pages.length - 1) {
              onPageChange(pages[currentIndex + 1].id);
            }
          }}
          disabled={pages.findIndex(p => p.id === currentPageId) === pages.length - 1}
          title="الصفحة التالية"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default PageManager;
