import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />

          <Stack.Screen name="survey" />
          <Stack.Screen name="clothing-detail" />
          <Stack.Screen name="recommend-outfit-detail" />
          <Stack.Screen name="avatar-generate" />
          <Stack.Screen name="avatar-generating" />
          <Stack.Screen name="avatar-result" />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}