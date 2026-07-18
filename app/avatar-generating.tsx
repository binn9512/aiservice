import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

// 1️⃣ expo-router import로 교체
import { useRouter } from 'expo-router';

export default function AvatarGeneratingScreen() {
  // 2️⃣ 기존 navigation 대신 router 사용
  const router = useRouter();

  useEffect(() => {
    const generateAvatar = async () => {
      try {
        const faceImage = await AsyncStorage.getItem('USER_FACE_IMAGE');
        console.log('USER_FACE_IMAGE =', faceImage);

        if (faceImage) {
          await AsyncStorage.setItem('USER_AVATAR_IMAGE', faceImage);
          console.log('USER_AVATAR_IMAGE 저장 완료');
        }

        // 3️⃣ navigation.replace() ➡️ router.replace('/파일이름')
        router.replace('/avatar-result');
      } catch (error) {
        console.log('❌ avatar error', error);
        router.replace('/avatar-result');
      }
    };

    generateAvatar();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>AI 아바타 생성 중</Text>

      <ActivityIndicator size="large" color="#FF5C8A" />

      <Text style={styles.mainText}>특징을 분석하고 있어요</Text>
      <Text style={styles.mainText2}>잠시만 기다려주세요!</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 30 },
  mainText: { marginTop: 30, fontSize: 17, fontWeight: '500' },
  mainText2: { marginTop: 2, fontSize: 17, fontWeight: '500' },
});