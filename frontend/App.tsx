import React from 'react';

import {NavigationContainer} from '@react-navigation/native';

import {createNativeStackNavigator}
from '@react-navigation/native-stack';

import BottomTabNavigator
from './src/navigation/BottomTabNavigator';

import RecommendOutfitDetailScreen
from './src/screens/RecommendOutfitDetailScreen';

import SurveyScreen
from './src/screens/SurveyScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
        />

        <Stack.Screen
          name="RecommendOutfitDetail"
          component={
            RecommendOutfitDetailScreen
          }
        />

        <Stack.Screen
          name="Survey"
          component={SurveyScreen}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}