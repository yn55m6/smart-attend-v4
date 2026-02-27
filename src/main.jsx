import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/**
 * [V4 최신 엔트리 포인트]
 * 1. React 18 createRoot 사용
 * 2. StrictMode 적용 (개발 중 오류 감지)
 * 3. index.html의 <div id="root">와 연결
 */
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error("Fatal Error: 'root' element not found in index.html. White screen expected.");
}
