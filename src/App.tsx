import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppNavigator } from './navigation';
import { Header } from './components';

/**
 * Main App component
 * 
 * This is the root component of the application.
 */
export function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
        <Header />
        <AppNavigator />
      </div>
    </BrowserRouter>
  );
}

