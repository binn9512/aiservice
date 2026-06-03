import React from 'react';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import Ionicons from 'react-native-vector-icons/Ionicons';

import ProfileScreen from '../screens/ProfileScreen';
import ClosetScreen from '../screens/ClosetScreen';
import RecommendScreen from '../screens/RecommendScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,

        tabBarActiveTintColor: '#FF5C8A',
        tabBarInactiveTintColor: '#999999',

        tabBarStyle: {
          position: 'absolute',

          height: 75,

          paddingTop: 6,
          paddingBottom: 10,

          borderTopWidth: 1,
          borderTopColor: '#EAEAEA',

          backgroundColor: '#FFFFFF',
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },

        tabBarIcon: ({color, focused}) => {
          let iconName:
            | 'person-circle'
            | 'person-circle-outline'
            | 'shirt'
            | 'shirt-outline'
            | 'sparkles'
            | 'sparkles-outline';

          if (route.name === '프로필') {
            iconName = focused
              ? 'person-circle'
              : 'person-circle-outline';
          } else if (route.name === '옷장') {
            iconName = focused
              ? 'shirt'
              : 'shirt-outline';
          } else {
            iconName = focused
              ? 'sparkles'
              : 'sparkles-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={24}
              color={color}
            />
          );
        },
      })}>
      <Tab.Screen
        name="프로필"
        component={ProfileScreen}
      />

      <Tab.Screen
        name="옷장"
        component={ClosetScreen}
      />

      <Tab.Screen
        name="코디추천"
        component={RecommendScreen}
      />
    </Tab.Navigator>
  );
}