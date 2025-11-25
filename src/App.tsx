import React from 'react';
import { AppNavigator } from './navigation';
import { Header } from './components';

/**
 * Main App component
 * 
 * This is the root component of the application.
 */
export function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <Header />
      <AppNavigator />
    </div>
  );
}

