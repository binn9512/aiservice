import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

// 1️⃣ 기존 네비게이션 import 삭제 후, expo-router로 교체
import { useRouter } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AvatarResultScreen() {
  // 2️⃣ useNavigation() 대신 useRouter() 사용
  const router = useRouter(); 

  const [faceImage, setFaceImage] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      const savedImage = await AsyncStorage.getItem('USER_AVATAR_URL');

      console.log('USER_AVATAR_URL =', savedImage);

      if (savedImage) {
        setFaceImage(savedImage);
      }
    };
    loadImage();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>AI 아바타 생성 완료</Text>

      <View style={styles.avatarBox}>
        {faceImage ? (
          <Image
            source={{ uri: faceImage }}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        ) : (
          <Text>얼굴 사진 없음</Text>
        )}
      </View>

      <Text style={styles.desc}>이제 추천 코디를</Text>
      <Text style={styles.desc}>AI 아바타에 입혀볼 수 있어요!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          if (faceImage) {
            await AsyncStorage.setItem('USER_AVATAR_IMAGE', faceImage);
          }
          
          // 3️⃣ 이동 코드 변경! 기존 'MainTabs' 대신 파일 이름 기반 라우팅 사용
          // replace를 쓰면 뒤로 가기 눌러도 이 '완료 화면'으로 다시 돌아오지 않아서 UX상 훨씬 좋습니다.
          router.replace('/recommend'); 
        }}>
        <Text style={styles.buttonText}>코디 추천 받으러 가기</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginTop: 20, marginBottom: 30, marginHorizontal: 20 },
  avatarBox: { height: 500, borderRadius: 24, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginHorizontal: 20 },
  desc: { textAlign: 'center', color: '#666', marginTop: 20, marginVertical: -15 },
  button: { height: 54, borderRadius: 16, backgroundColor: '#FF5C8A', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', marginHorizontal: 20 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  avatarImage: { width: '100%', height: '100%', resizeMode: "contain", borderRadius: 24 },
});