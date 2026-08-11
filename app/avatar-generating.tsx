import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

// 1️⃣ expo-router import로 교체
import { useRouter } from 'expo-router';

export default function AvatarGeneratingScreen() {
  // 2️⃣ 기존 navigation 대신 router 사용
  const router = useRouter();

  useEffect(() => {
    const generateAvatar = async () => {
      try {

        const faceImage =
          await AsyncStorage.getItem(
            'USER_FACE_IMAGE'
          );

        if (!faceImage) {
          router.replace('/avatar-result');
          return;
        }

        const formData = new FormData();

        formData.append(
          'photo',
          {
            uri: faceImage,
            type: 'image/png',
            name: 'face.png',
          } as any
        );

        const response = await axios.post(

          `${API_BASE_URL}/generate-avatar`,

          formData,

          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },
          }

        );

        console.log("✅ response =", response.data);

        const result = response.data;

        await AsyncStorage.setItem(
          'USER_AVATAR_IMAGE',
          result.avatar_path
        );

        await AsyncStorage.setItem(
          'USER_AVATAR_URL',
          result.avatar_url
        );

        router.replace('/avatar-result');

      } catch (e: any) {
        console.log("❌ generate-avatar error");
        console.log(e);
        console.log(e?.response?.data);

        alert(JSON.stringify(e?.response?.data ?? e));

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