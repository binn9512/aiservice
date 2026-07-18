import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. 하단 탭 네비게이터를 가장 기본 화면으로 설정 */}
      <Stack.Screen name="(tabs)" />

      {/* 2. 나머지 상세 화면들 (필요하다면 나중에 헤더를 켤 수도 있습니다) */}
      <Stack.Screen name="survey" />
      <Stack.Screen name="clothing-detail" />
      <Stack.Screen name="recommend-outfit-detail" />
      <Stack.Screen name="avatar-generate" />
      <Stack.Screen name="avatar-generating" />
      <Stack.Screen name="avatar-result" />
    </Stack>
  );
}