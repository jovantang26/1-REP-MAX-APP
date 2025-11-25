# Navigation Plan

## Navigator Type
- Use **Stack Navigator** from `@react-navigation/native-stack` for Beta 1
- This allows screen-to-screen navigation with a header
- Can be upgraded to Tab Navigator later if needed

## File Structure
- Main navigator: `/src/navigation/AppNavigator.tsx`
- This file will contain the Stack Navigator setup
- Screen components will live in `/src/screens/`

## Screen Components
- HomeScreen - Main landing screen
- LogBenchScreen - Screen for logging bench press workouts
- HistoryScreen - Screen for viewing workout history
- ProfileScreen - Screen for user profile/settings

## App.tsx Integration
- App.tsx will import `NavigationContainer` from `@react-navigation/native`
- Wrap `AppNavigator` with `NavigationContainer`
- This provides the navigation context to all screens

## Navigation Flow
- Initial route: HomeScreen
- Users can navigate to LogBenchScreen, HistoryScreen, and ProfileScreen from HomeScreen
- Each screen will be a simple functional component with placeholder text initially

