import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Slider,
  FormControlLabel,
  FormGroup,
  Switch,
  Divider,
  Grid,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel
} from '@mui/material';
// Selector de colores simple utilizando input type="color"

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// مكون لعرض محتوى التبويب
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`board-tabpanel-${index}`}
      aria-labelledby={`board-tab-${index}`}
      {...other}
      style={{ padding: '16px 0' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// إعدادات السبورة الافتراضية
const defaultSettings = {
  backgroundColor: '#ffffff',
  gridColor: '#e0e0e0',
  showGrid: true,
  gridSize: 20,
  snapToGrid: true,
  lineColor: '#000000',
  lineWidth: 2,
  textColor: '#000000',
  fontSize: 16,
  fontFamily: 'Arial',
  theme: 'light',
  boardType: 'blank',
  showRuler: false,
  showCoordinates: false
};

const BoardSettings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState(defaultSettings);

  // تغيير التبويب النشط
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // تحديث إعدادات السبورة
  const updateSettings = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // تطبيق الإعدادات على السبورة
  const applySettings = () => {
    console.log('تطبيق الإعدادات:', settings);
    // هنا ستقوم بإرسال الإعدادات إلى المكون الرئيسي للسبورة
  };

  // إعادة الإعدادات إلى الوضع الافتراضي
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, maxWidth: 650, margin: '0 auto', maxHeight: '80vh', overflow: 'auto' }}>
      <Typography variant="h6" align="center" gutterBottom>
        إعدادات السبورة
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="board settings tabs" centered>
          <Tab label="الخلفية والشبكة" />
          <Tab label="أدوات الرسم" />
          <Tab label="النص" />
          <Tab label="إعدادات متقدمة" />
        </Tabs>
      </Box>

      {/* إعدادات الخلفية والشبكة */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="subtitle1" gutterBottom>
          لون الخلفية
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => updateSettings('backgroundColor', e.target.value)}
            style={{ width: '50px', height: '30px' }}
          />
          <Typography sx={{ ml: 2 }}>{settings.backgroundColor}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.showGrid}
                onChange={(e) => updateSettings('showGrid', e.target.checked)}
              />
            }
            label="إظهار الشبكة"
          />
        </FormGroup>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          لون الشبكة
        </Typography>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <input
            type="color"
            value={settings.gridColor}
            onChange={(e) => updateSettings('gridColor', e.target.value)}
            style={{ width: '50px', height: '30px' }}
          />
          <Typography sx={{ ml: 2 }}>{settings.gridColor}</Typography>
        </Box>

        <Typography gutterBottom>
          حجم الشبكة: {settings.gridSize}px
        </Typography>
        <Slider
          value={settings.gridSize}
          onChange={(_, value) => updateSettings('gridSize', value)}
          aria-labelledby="grid-size-slider"
          min={5}
          max={50}
          sx={{ width: '100%' }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={settings.snapToGrid}
              onChange={(e) => updateSettings('snapToGrid', e.target.checked)}
            />
          }
          label="تثبيت العناصر على الشبكة"
        />
      </TabPanel>

      {/* إعدادات أدوات الرسم */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="subtitle1" gutterBottom>
          لون الخط
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <input
            type="color"
            value={settings.lineColor}
            onChange={(e) => updateSettings('lineColor', e.target.value)}
            style={{ width: '50px', height: '30px' }}
          />
          <Typography sx={{ ml: 2 }}>{settings.lineColor}</Typography>
        </Box>

        <Typography gutterBottom>
          سمك الخط: {settings.lineWidth}px
        </Typography>
        <Slider
          value={settings.lineWidth}
          onChange={(_, value) => updateSettings('lineWidth', value)}
          aria-labelledby="line-width-slider"
          min={1}
          max={10}
          sx={{ width: '100%' }}
        />
      </TabPanel>

      {/* إعدادات النص */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="subtitle1" gutterBottom>
          لون النص
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <input
            type="color"
            value={settings.textColor}
            onChange={(e) => updateSettings('textColor', e.target.value)}
            style={{ width: '50px', height: '30px' }}
          />
          <Typography sx={{ ml: 2 }}>{settings.textColor}</Typography>
        </Box>

        <Typography gutterBottom>
          حجم الخط: {settings.fontSize}px
        </Typography>
        <Slider
          value={settings.fontSize}
          onChange={(_, value) => updateSettings('fontSize', value)}
          aria-labelledby="font-size-slider"
          min={10}
          max={36}
          sx={{ width: '100%' }}
        />

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
          نوع الخط
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="font-family"
            name="font-family"
            value={settings.fontFamily}
            onChange={(e) => updateSettings('fontFamily', e.target.value)}
          >
            <FormControlLabel value="Arial" control={<Radio />} label="Arial" />
            <FormControlLabel value="Times New Roman" control={<Radio />} label="Times New Roman" />
            <FormControlLabel value="Courier New" control={<Radio />} label="Courier New" />
            <FormControlLabel value="Calibri" control={<Radio />} label="Calibri" />
          </RadioGroup>
        </FormControl>
      </TabPanel>

      {/* إعدادات متقدمة */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="subtitle1" gutterBottom>
          سمة السبورة
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="theme"
            name="theme"
            value={settings.theme}
            onChange={(e) => updateSettings('theme', e.target.value)}
          >
            <FormControlLabel value="light" control={<Radio />} label="فاتح" />
            <FormControlLabel value="dark" control={<Radio />} label="داكن" />
            <FormControlLabel value="blue" control={<Radio />} label="أزرق" />
            <FormControlLabel value="green" control={<Radio />} label="أخضر" />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          نوع السبورة
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="board-type"
            name="board-type"
            value={settings.boardType}
            onChange={(e) => updateSettings('boardType', e.target.value)}
          >
            <FormControlLabel value="blank" control={<Radio />} label="فارغة" />
            <FormControlLabel value="ruled" control={<Radio />} label="مسطرة" />
            <FormControlLabel value="dotted" control={<Radio />} label="نقطية" />
            <FormControlLabel value="graph" control={<Radio />} label="رسم بياني" />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.showRuler}
                onChange={(e) => updateSettings('showRuler', e.target.checked)}
              />
            }
            label="إظهار المسطرة"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.showCoordinates}
                onChange={(e) => updateSettings('showCoordinates', e.target.checked)}
              />
            }
            label="إظهار الإحداثيات"
          />
        </FormGroup>
      </TabPanel>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={applySettings}
          sx={{ minWidth: '150px' }}
        >
          تطبيق الإعدادات
        </Button>
        <Button 
          variant="outlined"
          onClick={resetSettings}
          sx={{ minWidth: '150px' }}
        >
          إعادة الضبط
        </Button>
      </Box>
    </Paper>
  );
};

export default BoardSettings;
