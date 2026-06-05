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

import ClothingDetailScreen
from './src/screens/ClothingDetailScreen';

import AvatarGenerateScreen
from './src/screens/AvatarGenerateScreen';

import AvatarGeneratingScreen
from './src/screens/AvatarGeneratingScreen';

import AvatarResultScreen
from './src/screens/AvatarResultScreen';

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

        <Stack.Screen
          name="ClothingDetail"
          component={ClothingDetailScreen}
        />

        <Stack.Screen
          name="AvatarGenerate"
          component={AvatarGenerateScreen}
        />

        <Stack.Screen
          name="AvatarGenerating"
          component={
            AvatarGeneratingScreen
          }
        />

        <Stack.Screen
          name="AvatarResult"
          component={
            AvatarResultScreen
          }
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}