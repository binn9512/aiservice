import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

function WeatherCard({ weather }: { weather: { title: string; message: string } }) {
  return (
    <View style={styles.weatherCard}>
      <Text style={styles.weatherEmoji}>🌤</Text>
      <View>
        <Text style={styles.weatherCardTitle}>{weather.title}</Text>
        <Text style={styles.weatherDesc}>{weather.message}</Text>
      </View>
    </View>
  );
}

const ProfileScreen = () => {
  const router = useRouter();
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;
  const [weather, setWeather] = useState({ title: '오늘의 날씨', message: '날씨 정보를 불러오는 중입니다.' });
  const [faceImage, setFaceImage] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/weather`);
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        setWeather({ title: '오늘의 날씨', message: '날씨 정보를 불러올 수 없습니다.' });
      }
    };
    loadWeather();

    const loadFaceImage = async () => {
      const savedImage = await AsyncStorage.getItem('USER_FACE_IMAGE');
      if (savedImage) setFaceImage(savedImage);
    };
    loadFaceImage();
  }, []);

  const handleFaceRegister = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await AsyncStorage.setItem('USER_FACE_IMAGE', uri);
      setFaceImage(uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>프로필</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <TouchableOpacity style={styles.avatar} onPress={handleFaceRegister}>
              {faceImage ? (
                <Image source={{ uri: faceImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>얼굴 등록</Text>
              )}
            </TouchableOpacity>
            <View style={styles.profileTextBox}>
              <Text style={styles.avatarTitle}>AI 아바타</Text>
              <Pressable style={styles.avatarButton} onPress={() => router.push('/avatar-generate')}>
                <Text style={styles.avatarButtonText}>AI 아바타 생성하기 →</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 오늘의 날씨 섹션 */}
        <Text style={styles.weatherSectionTitle}>오늘의 날씨</Text>
        <WeatherCard weather={weather} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111111' },
  profileCard: { backgroundColor: '#FFF7FA', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#EAEAEA', marginHorizontal: 20, marginBottom: 24 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 86, height: 86, borderRadius: 43, backgroundColor: '#fde6ea', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { color: '#444', fontWeight: '500' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 43 },
  profileTextBox: { flex: 1 },
  avatarTitle: { fontSize: 18, fontWeight: '700', color: '#FF5C8A', marginBottom: 8 },
  avatarButton: { backgroundColor: '#FF5C8A', borderRadius: 14, height: 40, justifyContent: 'center', alignItems: 'center' },
  avatarButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  weatherCard: { marginHorizontal: 20, borderRadius: 18, backgroundColor: '#EEF8F0', padding: 18, flexDirection: 'row', alignItems: 'center' },
  weatherEmoji: { fontSize: 34, marginRight: 16 },
  weatherSectionTitle: { fontSize: 18, fontWeight: '700', color: '#111111', marginHorizontal: 20, marginTop: 4, marginBottom: 12 },
  weatherCardTitle: { fontSize: 16, fontWeight: '700', color: '#2EAD5B', marginBottom: 6 },
  weatherDesc: { fontSize: 12, color: '#666666', lineHeight: 18 }
});