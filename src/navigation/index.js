import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import ClientInfoScreen from '../screens/ClientInfoScreen';
import SystemConfigScreen from '../screens/SystemConfigScreen';
import LoadInputScreen from '../screens/LoadInputScreen';
import SystemRecommendationScreen from '../screens/SystemRecommendationScreen';
import SystemDiagramScreen from '../screens/SystemDiagramScreen';
import ComponentListScreen from '../screens/ComponentListScreen';
import ProposalPreviewScreen from '../screens/ProposalPreviewScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

/**
 * Root navigation stack for SolarSpec.
 * Stack navigation only — no tabs, no drawer, no modal stack.
 * All screens use headerShown:false (custom headers built per screen).
 * @returns {JSX.Element} NavigationContainer with full screen stack
 */
export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#131313' },
          animationEnabled: true,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ClientInfo" component={ClientInfoScreen} />
        <Stack.Screen name="SystemConfig" component={SystemConfigScreen} />
        <Stack.Screen name="LoadInput" component={LoadInputScreen} />
        <Stack.Screen name="SystemRecommendation" component={SystemRecommendationScreen} />
        <Stack.Screen name="SystemDiagram" component={SystemDiagramScreen} />
        <Stack.Screen name="ComponentList" component={ComponentListScreen} />
        <Stack.Screen name="ProposalPreview" component={ProposalPreviewScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
