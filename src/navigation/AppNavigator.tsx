import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  OnboardingScreen,
  DashboardScreen,
  LogBenchScreen,
  HistoryScreen,
  SettingsScreen,
} from '../screens';

/**
 * Main application navigator
 * 
 * Sets up all routes and navigation structure.
 * Default route redirects to onboarding (can be changed to dashboard if user is already onboarded).
 * Note: BrowserRouter is now in App.tsx to allow Header to use navigation hooks.
 */
export function AppNavigator() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding" replace />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/dashboard" element={<DashboardScreen />} />
      <Route path="/log-session" element={<LogBenchScreen />} />
      <Route path="/history" element={<HistoryScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
    </Routes>
  );
}

