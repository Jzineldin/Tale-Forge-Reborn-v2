import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('🔍 SIMPLE TEST: Starting simple main.tsx');

const SimpleApp = () => {
  console.log('🔍 SIMPLE TEST: SimpleApp rendering');
  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(to bottom right, #1a1a2e, #16213e)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🎯 SIMPLE TEST WORKING!</h1>
      <p>React is rendering - TypeScript errors don't prevent basic rendering</p>
      <p>This confirms the agent release introduced TypeScript errors</p>
    </div>
  );
};

console.log('🔍 SIMPLE TEST: About to render SimpleApp');

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);

console.log('🔍 SIMPLE TEST: ReactDOM.createRoot called');