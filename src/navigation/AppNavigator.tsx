import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
 */
export function AppNavigator() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/log-session" element={<LogBenchScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

