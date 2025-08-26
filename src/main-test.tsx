import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('🔍 TEST: main-test.tsx loading');

const TestApp = () => {
  console.log('🔍 TEST: TestApp component rendering');
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
      <h1>🎯 TEST APP WORKING!</h1>
      <p>React is rendering correctly</p>
    </div>
  );
};

console.log('🔍 TEST: About to render TestApp');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
);

console.log('🔍 TEST: ReactDOM.createRoot called');