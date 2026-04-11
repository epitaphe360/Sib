import React from 'react';
import ReactDOM from 'react-dom/client';
import ScannerApp from './ScannerApp';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <ScannerApp />
    </Router>
  </React.StrictMode>
);
