import React, { useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemButton,
  ListItemIcon, 
  ListItemText, 
  Drawer, 
  Divider, 
  IconButton,
  Typography,
  Collapse,
  Link,
  Tooltip,
  Box
} from '@mui/material';

// استيراد مكون عرض المحتوى
import ContentDisplay from '../ContentDisplay';
import { 
  MenuBook, 
  Save, 
  Folder, 
  ExpandLess, 
  ExpandMore, 
  PhotoLibrary,
  Functions,
  School,
  Calculate,
  Straighten,
  Draw,
  Palette,
  Widgets,
  ThreeDRotation,
  GridOn,
  Link as LinkIcon,
  Settings
} from '@mui/icons-material';
import './Sidebar.css';

// نوع لتعريف المحتوى المعروض
type ContentType = {
  componentType: string;
  componentId?: string;
};

interface SidebarProps {
  onContentSelect?: (content: ContentType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onContentSelect }) => {
  const [openTemplates, setOpenTemplates] = useState(false);
  const [openLibrary, setOpenLibrary] = useState(false);
  const [openInteractiveTools, setOpenInteractiveTools] = useState(false);
  const [openShapesLibrary, setOpenShapesLibrary] = useState(false);
  const [openEducationalLinks, setOpenEducationalLinks] = useState(false);
  const [openCustomization, setOpenCustomization] = useState(false);
  
  // حالة لتخزين المحتوى المختار
  const [selectedContent, setSelectedContent] = useState<ContentType | null>(null);
  
  const handleToggleTemplates = () => {
    setOpenTemplates(!openTemplates);
  };
  
  const handleToggleLibrary = () => {
    setOpenLibrary(!openLibrary);
  };

  const handleToggleInteractiveTools = () => {
    setOpenInteractiveTools(!openInteractiveTools);
  };

  const handleToggleShapesLibrary = () => {
    setOpenShapesLibrary(!openShapesLibrary);
  };

  const handleToggleEducationalLinks = () => {
    setOpenEducationalLinks(!openEducationalLinks);
  };

  const handleToggleCustomization = () => {
    setOpenCustomization(!openCustomization);
  };
  
  // وظيفة لاختيار المحتوى وعرضه
  const handleSelectContent = (contentType: string, contentId?: string) => {
    const content: ContentType = {
      componentType: contentType,
      componentId: contentId
    };
    
    setSelectedContent(content);
    
    // إرسال المحتوى المختار إلى المكون الأب
    if (onContentSelect) {
      onContentSelect(content);
    }
  };

  const drawerWidth = 240;

  return (
    <Drawer
      variant="permanent"
      className="sidebar-drawer"
      anchor="right"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        position: 'relative',
        zIndex: 1200,
        '& .MuiDrawer-paper': { 
          width: drawerWidth, 
          position: 'relative',
          boxSizing: 'border-box',
          direction: 'rtl'
        },
      }}
    >
      <div className="sidebar-header">
        <Typography variant="h6" component="div">
          الأدوات المتقدمة
        </Typography>
      </div>
      <Divider />
      <List>
        {/* أدوات تفاعلية جاهزة للاستخدام */}
        <ListItem>
          <ListItemButton onClick={handleToggleInteractiveTools}>
            <ListItemIcon>
              <Calculate />
            </ListItemIcon>
            <ListItemText primary="أدوات تفاعلية" />
            {openInteractiveTools ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openInteractiveTools} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* آلات حاسبة متنوعة */}
            <ListItem>
              <ListItemButton 
                sx={{ pl: 4 }}
                onClick={() => handleSelectContent('calculator', 'scientific')}
              >
                <ListItemIcon>
                  <Calculate fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="آلة حاسبة علمية" />
              </ListItemButton>
            </ListItem>


            
  



            
            {/* أدوات الرسم الهندسي */}
            <ListItem>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Draw fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="رسم المثلثات" />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Draw fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="رسم الدوائر" />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Draw fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="خطوط متوازية" />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>
        

        
        {/* روابط لمواقع تعليمية */}
        
        <ListItem>
          <ListItemButton onClick={handleToggleEducationalLinks}>
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
            <ListItemText primary="مواقع تعليمية" />
            {openEducationalLinks ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openEducationalLinks} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
          <ListItem>
  <Tooltip title="https://www.intlmath.net/" placement="left">
    <ListItemButton sx={{ pl: 4 }} component="a" href="https://www.intlmath.net/" target="_blank">
      <ListItemIcon>
        <LinkIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary="intlmath" />
    </ListItemButton>
  </Tooltip>
</ListItem>

            <ListItem>
              <Tooltip title="https://www.khanacademy.org/math" placement="left">
                <ListItemButton sx={{ pl: 4 }} component="a" href="https://www.khanacademy.org/math" target="_blank">
                  <ListItemIcon>
                    <LinkIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="أكاديمية خان" />
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <ListItem>
              <Tooltip title="https://www.desmos.com/" placement="left">
                <ListItemButton sx={{ pl: 4 }} component="a" href="https://www.desmos.com/" target="_blank">
                  <ListItemIcon>
                    <LinkIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Desmos" />
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <ListItem>
              <Tooltip title="https://www.geogebra.org/" placement="left">
                <ListItemButton sx={{ pl: 4 }} component="a" href="https://www.geogebra.org/" target="_blank">
                  <ListItemIcon>
                    <LinkIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="GeoGebra" />
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <ListItem>
              <Tooltip title="https://www.wolframalpha.com/" placement="left">
                <ListItemButton sx={{ pl: 4 }} component="a" href="https://www.wolframalpha.com/" target="_blank">
                  <ListItemIcon>
                    <LinkIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Wolfram Alpha" />
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <ListItem>
              <Tooltip title="https://www.mathway.com/" placement="left">
                <ListItemButton sx={{ pl: 4 }} component="a" href="https://www.mathway.com/" target="_blank">
                  <ListItemIcon>
                    <LinkIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Mathway" />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </List>
        </Collapse>
        
        {/* تخصيص السبورة */}
        <ListItem>
          <ListItemButton 
            onClick={handleToggleCustomization}
          >
            <ListItemIcon>
              <Palette />
            </ListItemIcon>
            <ListItemText primary="تخصيص السبورة" />
            {openCustomization ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openCustomization} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem>
              <ListItemButton 
                sx={{ pl: 4 }}
                onClick={() => handleSelectContent('boardSettings')}
              >
                <ListItemIcon>
                  <Palette fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="ألوان وخلفيات" />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="خيارات العرض" />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  <GridOn fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="شبكة السبورة" />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>


      </List>
    </Drawer>
  );
};

export default Sidebar;
