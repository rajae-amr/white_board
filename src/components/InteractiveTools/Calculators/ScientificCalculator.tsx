import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Typography,
  styled
} from '@mui/material';
import './ScientificCalculator.css';

const CalculatorButton = styled(Button)(({ theme }) => ({
  width: '100%',
  height: '50px',
  margin: '2px',
  fontSize: '1.2rem',
}));

const CalculatorDisplay = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: '10px 15px',
  marginBottom: '10px',
  backgroundColor: '#f0f0f0',
  borderRadius: '4px',
  textAlign: 'right',
  fontFamily: 'monospace',
  fontSize: '1.5rem',
  border: '1px solid #ccc',
  direction: 'ltr'
}));

const ScientificCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const clearDisplay = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const currentValue = prevValue || 0;
      let newValue = 0;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = currentValue / inputValue;
          break;
        case '^':
          newValue = Math.pow(currentValue, inputValue);
          break;
        default:
          newValue = inputValue;
      }

      setPrevValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const executeSpecialFunction = (func: string) => {
    const inputValue = parseFloat(display);
    let result = 0;

    switch (func) {
      case 'sqrt':
        result = Math.sqrt(inputValue);
        break;
      case 'sin':
        result = Math.sin(inputValue * (Math.PI / 180)); // في درجات
        break;
      case 'cos':
        result = Math.cos(inputValue * (Math.PI / 180)); // في درجات
        break;
      case 'tan':
        result = Math.tan(inputValue * (Math.PI / 180)); // في درجات
        break;
      case 'log':
        result = Math.log10(inputValue);
        break;
      case 'ln':
        result = Math.log(inputValue);
        break;
      case '1/x':
        result = 1 / inputValue;
        break;
      case 'x²':
        result = Math.pow(inputValue, 2);
        break;
      default:
        result = inputValue;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  };

  const calculatePercentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const calculateResult = () => {
    if (!prevValue || !operation) return;

    performOperation('=');
    setOperation(null);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, maxWidth: 350, margin: '0 auto' }}>
      <Typography variant="h6" align="center" gutterBottom>
        الآلة الحاسبة العلمية
      </Typography>
      <CalculatorDisplay>
        {display}
      </CalculatorDisplay>

      <div className="calculator-grid">
        {/* الوظائف العلمية */}
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => executeSpecialFunction('sin')}>sin</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => executeSpecialFunction('cos')}>cos</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => executeSpecialFunction('tan')}>tan</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => executeSpecialFunction('sqrt')}>√</CalculatorButton>
        </div>

        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => executeSpecialFunction('log')}>log</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => executeSpecialFunction('ln')}>ln</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => executeSpecialFunction('1/x')}>1/x</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => executeSpecialFunction('x²')}>x²</CalculatorButton>
        </div>

        {/* الصف الأول من الأزرار */}
        <div className="calculator-button-container">
          <CalculatorButton variant="contained" color="error" onClick={clearDisplay}>C</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={toggleSign}>±</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={calculatePercentage}>%</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="contained" color="primary" onClick={() => performOperation('÷')}>÷</CalculatorButton>
        </div>

        {/* الصف الثاني من الأزرار */}
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => inputDigit('7')}>7</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => inputDigit('8')}>8</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => inputDigit('9')}>9</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="contained" color="primary" onClick={() => performOperation('×')}>×</CalculatorButton>
        </div>

        {/* الصف الثالث من الأزرار */}
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => inputDigit('4')}>4</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => inputDigit('5')}>5</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => inputDigit('6')}>6</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="contained" color="primary" onClick={() => performOperation('-')}>-</CalculatorButton>
        </div>

        {/* الصف الرابع من الأزرار */}
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => inputDigit('1')}>1</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => inputDigit('2')}>2</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => inputDigit('3')}>3</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="contained" color="primary" onClick={() => performOperation('+')}>+</CalculatorButton>
        </div>

        {/* الصف الخامس من الأزرار */}
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => performOperation('^')}>^</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={() => inputDigit('0')}>0</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="outlined" onClick={inputDecimal}>.</CalculatorButton>
        </div>
        <div className="calculator-button-container">
          <CalculatorButton variant="contained" color="success" onClick={calculateResult}>=</CalculatorButton>
        </div>
      </div>

      {/* تنسيق CSS للآلة الحاسبة */}
    </Paper>
  );
};

export default ScientificCalculator;
