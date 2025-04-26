import React, { useState } from 'react';
import './LinkManager.css';

export interface Link {
  id: string;
  title: string;
  url: string;
  category: string;
}

export interface LinkManagerProps {
  links: Link[];
  onAddLink: (link: Omit<Link, 'id'>) => void;
  onRemoveLink: (linkId: string) => void;
}

/**
 * مكون إدارة الروابط لإضافة وعرض الروابط التعليمية
 */
const LinkManager: React.FC<LinkManagerProps> = ({
  links,
  onAddLink,
  onRemoveLink
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '', category: 'عام' });
  const [showLinks, setShowLinks] = useState(false);

  // فئات الروابط المقترحة
  const categories = [
    { id: 'general', label: 'عام' },
    { id: 'math', label: 'رياضيات' },
    { id: 'geometry', label: 'هندسة' },
    { id: 'algebra', label: 'جبر' },
    { id: 'calculus', label: 'تفاضل وتكامل' },
    { id: 'statistics', label: 'إحصاء' }
  ];

  // مواقع تعليمية مقترحة
  const suggestedLinks = [
    { title: 'خان أكاديمي', url: 'https://ar.khanacademy.org/', category: 'عام' },
    { title: 'Desmos', url: 'https://www.desmos.com/calculator?lang=ar', category: 'رياضيات' },
    { title: 'GeoGebra', url: 'https://www.geogebra.org/?lang=ar', category: 'هندسة' },
    { title: 'Wolfram Alpha', url: 'https://www.wolframalpha.com/', category: 'رياضيات' }
  ];

  // إضافة رابط جديد
  const handleAddLink = () => {
    if (newLink.title.trim() && isValidUrl(newLink.url)) {
      onAddLink({
        title: newLink.title.trim(),
        url: ensureHttps(newLink.url.trim()),
        category: newLink.category
      });
      setNewLink({ title: '', url: '', category: 'عام' });
      setShowAddForm(false);
    }
  };

  // التحقق من صحة الرابط
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(ensureHttps(url));
      return true;
    } catch (e) {
      return false;
    }
  };

  // التأكد من وجود بروتوكول HTTP/HTTPS
  const ensureHttps = (url: string): string => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  // إضافة رابط مقترح
  const addSuggestedLink = (link: typeof suggestedLinks[0]) => {
    onAddLink({
      title: link.title,
      url: link.url,
      category: link.category
    });
  };

  // تجميع الروابط حسب الفئة
  const groupedLinks = links.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, Link[]>);

  return (
    <div className="link-manager">
      <div className="link-manager-header">
        <button 
          className="toggle-links-button"
          onClick={() => setShowLinks(!showLinks)}
        >
          {showLinks ? 'إخفاء الروابط' : 'إظهار الروابط'} 🔗
        </button>
        
        {showLinks && (
          <button 
            className="add-link-button"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'إلغاء' : 'إضافة رابط جديد'} {showAddForm ? '❌' : '➕'}
          </button>
        )}
      </div>
      
      {showLinks && (
        <div className="links-container">
          {showAddForm && (
            <div className="add-link-form">
              <h3>إضافة رابط جديد</h3>
              <div className="form-group">
                <label>العنوان:</label>
                <input 
                  type="text" 
                  value={newLink.title} 
                  onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                  placeholder="عنوان الرابط"
                />
              </div>
              <div className="form-group">
                <label>الرابط:</label>
                <input 
                  type="text" 
                  value={newLink.url} 
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  placeholder="https://example.com"
                  className={newLink.url && !isValidUrl(newLink.url) ? 'error' : ''}
                />
                {newLink.url && !isValidUrl(newLink.url) && (
                  <div className="error-message">رابط غير صحيح</div>
                )}
              </div>
              <div className="form-group">
                <label>الفئة:</label>
                <select 
                  value={newLink.category} 
                  onChange={(e) => setNewLink({...newLink, category: e.target.value})}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.label}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                className="submit-button"
                onClick={handleAddLink}
                disabled={!newLink.title || !newLink.url || !isValidUrl(newLink.url)}
              >
                إضافة
              </button>
            </div>
          )}
          
          {!showAddForm && Object.keys(groupedLinks).length === 0 && (
            <div className="suggested-links">
              <h3>روابط مقترحة للتعليم</h3>
              <div className="suggestions-list">
                {suggestedLinks.map((link, index) => (
                  <div key={index} className="suggested-link">
                    <div className="link-info">
                      <span className="link-title">{link.title}</span>
                      <span className="link-url">{link.url}</span>
                    </div>
                    <button 
                      className="add-suggested-button"
                      onClick={() => addSuggestedLink(link)}
                    >
                      إضافة
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {Object.keys(groupedLinks).length > 0 && (
            <div className="saved-links">
              <h3>الروابط المحفوظة</h3>
              {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
                <div key={category} className="category-group">
                  <h4 className="category-title">{category}</h4>
                  <div className="category-links">
                    {categoryLinks.map((link) => (
                      <div key={link.id} className="saved-link">
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="link-title"
                        >
                          {link.title}
                        </a>
                        <button 
                          className="remove-link-button"
                          onClick={() => onRemoveLink(link.id)}
                          title="حذف الرابط"
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LinkManager;
