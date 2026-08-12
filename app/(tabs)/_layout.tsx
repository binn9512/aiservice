import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF5C8A', // 핑크색 포인트 컬러 그대로 유지
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
      }}>
      
      {/* 1. 프로필 탭 */}
      <Tabs.Screen
        name="profile" // 연결될 파일 이름 (profile.tsx)
        options={{
          title: '프로필',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 2. 옷장 탭 */}
      <Tabs.Screen
        name="closet" // 연결될 파일 이름 (closet.tsx)
        options={{
          title: '옷장',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'shirt' : 'shirt-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 3. 코디 추천 탭 */}
      <Tabs.Screen
        name="recommend" // 연결될 파일 이름 (recommend.tsx)
        options={{
          title: '코디추천',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'sparkles' : 'sparkles-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}