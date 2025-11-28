import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppNavigator } from './navigation';
import { Header } from './components';
import { runMigration } from './storage';

/**
 * Main App component
 * 
 * This is the root component of the application.
 * 
 * B2.2.3 MIGRATION: Runs data migration on app startup to upgrade
 * existing bench-only data to multi-lift format.
 */
export function App() {
  // Run migration on app startup (idempotent - safe to run multiple times)
  React.useEffect(() => {
    try {
      const result = runMigration();
      if (result.trainingSetsMigrated > 0 || result.testedOneRmsMigrated > 0) {
        console.log(`Migration completed: ${result.trainingSetsMigrated} sets, ${result.testedOneRmsMigrated} tested 1RMs migrated`);
      }
    } catch (error) {
      console.error('Migration failed:', error);
      // Don't block app startup if migration fails
    }
  }, []);

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
        <Header />
        <AppNavigator />
      </div>
    </BrowserRouter>
  );
}

