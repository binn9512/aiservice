import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import axios from 'axios';
import { useRouter } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export default function AvatarGeneratingScreen() {
  const router = useRouter();

  useEffect(() => {
    const generateAvatar = async () => {
      try {
        const faceImage = await AsyncStorage.getItem('USER_FACE_IMAGE');

        if (!faceImage) {
          router.replace('/avatar-result');
          return;
        }

        const formData = new FormData();

        formData.append('photo', {
          uri: faceImage,
          type: 'image/png',
          name: 'face.png',
        } as any);

        const response = await axios.post(
          `${API_BASE_URL}/generate-avatar`,
          formData,
          {
            headers: {
              'Accept': 'application/json',
            },
            timeout: 60000,
          }
        );

        console.log("✅ response =", response.data);

        const result = response.data;

        // 🌟 [핵심 수정] 
        // result.avatar_url이 존재하면 USER_AVATAR_IMAGE 및 USER_AVATAR_URL 모두에 
        // 서버 호스트 주소가 포함된 URL(http://...)을 저장합니다.
        const finalAvatarUrl = result.avatar_url || result.avatar_path;

        if (finalAvatarUrl) {
          await AsyncStorage.setItem('USER_AVATAR_IMAGE', finalAvatarUrl);
          await AsyncStorage.setItem('USER_AVATAR_URL', finalAvatarUrl);
          console.log("💾 저장된 백엔드 아바타 URL:", finalAvatarUrl);
        }

        router.replace('/avatar-result');

      } catch (e: any) {
        console.log("❌ generate-avatar error");
        console.log(e);
        console.log(e?.response?.data);

        alert(JSON.stringify(e?.response?.data ?? e.message));

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