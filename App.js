import 'react-native-gesture-handler'; // Must be first import
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation';

/**
 * SolarSpec root component.
 * GestureHandlerRootView is required by @gorhom/bottom-sheet and react-navigation/stack.
 * SafeAreaProvider provides insets to all screens via useSafeAreaInsets().
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0E0E0E" />
        <Navigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
