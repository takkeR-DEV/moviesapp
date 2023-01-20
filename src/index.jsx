import React from 'react';
import { createRoot } from 'react-dom/client';

// import './App.css';
import App from './components/App/App';
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
