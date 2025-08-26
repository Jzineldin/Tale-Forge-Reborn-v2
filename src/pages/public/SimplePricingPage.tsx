import React from 'react';

const SimplePricingPage: React.FC = () => {
  const creditPackages = [
    { name: 'Starter Pack', price: '$5', credits: '50', link: 'https://buy.stripe.com/cNi28rg8eb5Lghk5Hegbm00' },
    { name: 'Popular Pack', price: '$10', credits: '100', link: 'https://buy.stripe.com/9B6fZhbRY1vbaX05Hegbm01' },
    { name: 'Value Pack', price: '$20', credits: '250', link: 'https://buy.stripe.com/00wbJ17BIehX5CGfhOgbm02' },
    { name: 'Mega Pack', price: '$35', credits: '500', link: 'https://buy.stripe.com/4gM4gz9JQ4Hn1mq3z6gbm03' },
  ];

  return (
    <div style={{ padding: '40px', background: '#1a1a1a', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '40px' }}>
        Purchase Credits - Simple Version
      </h1>
      
      {/* Test basic functionality */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <button 
          onClick={() => alert('JavaScript is working!')}
          style={{ padding: '10px 20px', marginRight: '10px', cursor: 'pointer' }}
        >
          Test Alert
        </button>
        <button 
          onClick={() => console.log('Console log working')}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          Test Console
        </button>
      </div>

      {/* Credit Packages with multiple button types */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {creditPackages.map((pkg, index) => (
          <div key={index} style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ color: 'white' }}>{pkg.name}</h3>
            <p style={{ color: '#fbbf24', fontSize: '24px', fontWeight: 'bold' }}>{pkg.price}</p>
            <p style={{ color: 'white' }}>{pkg.credits} credits</p>
            
            {/* Method 1: Direct anchor link */}
            <a 
              href={pkg.link}
              style={{
                display: 'inline-block',
                width: '100%',
                padding: '12px',
                background: '#fbbf24',
                color: '#1f2937',
                textAlign: 'center',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}
            >
              Buy Now (Link)
            </a>
            
            {/* Method 2: Button with window.location */}
            <button
              onClick={() => { window.location.href = pkg.link; }}
              style={{
                width: '100%',
                padding: '12px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              Buy Now (Redirect)
            </button>
            
            {/* Method 3: Button opening new tab */}
            <button
              onClick={() => { window.open(pkg.link, '_blank'); }}
              style={{
                width: '100%',
                padding: '12px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Buy Now (New Tab)
            </button>
          </div>
        ))}
      </div>
      
      {/* Debug information */}
      <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        <h3 style={{ color: 'white' }}>Debug Info:</h3>
        <p style={{ color: '#9ca3af' }}>React version: {React.version}</p>
        <p style={{ color: '#9ca3af' }}>Page loaded at: {new Date().toISOString()}</p>
        <p style={{ color: '#9ca3af' }}>Browser: {navigator.userAgent}</p>
      </div>
    </div>
  );
};

export default SimplePricingPage;