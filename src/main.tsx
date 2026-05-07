import './polyfills';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    console.error("Critical Render Error:", error);
    rootElement.innerHTML = `<div style="padding: 20px; color: white; background: black; font-family: mono;">
      <h1 style="color: #f87171;">CRITICAL_FAILURE</h1>
      <p>Neural Core initialization failed. Check console for trace.</p>
      <pre style="font-size: 10px; color: #9ca3af;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>`;
  }
}
