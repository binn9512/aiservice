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
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

type ProfileData = {
  style: string;
  personalColor: string;
  colorMood: string;
  bodyType: string;
  highlight: string;
  cover: string;
};

const defaultProfile: ProfileData = {
  style: '페미닌 · 소프트',
  personalColor: '봄 웜 라이트',
  colorMood: '파스텔톤',
  bodyType: '웨이브 · 상체 슬림',
  highlight: '허리',
  cover: '복부',
};

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Text style={styles.infoIcon}>{icon}</Text>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

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
  const params = useLocalSearchParams();
  const [profileData, setProfileData] = useState(defaultProfile);
  const [weather, setWeather] = useState({ title: '오늘의 날씨', message: '날씨 정보를 불러오는 중입니다.' });
  const [faceImage, setFaceImage] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const response = await fetch('http://192.168.219.125:5001/weather');
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
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await AsyncStorage.setItem('USER_FACE_IMAGE', uri);
      setFaceImage(uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={styles.headerTitle}>프로필</Text></View>

        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <TouchableOpacity style={styles.avatar} onPress={handleFaceRegister}>
              {faceImage ? <Image source={{ uri: faceImage }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>얼굴 등록</Text>}
            </TouchableOpacity>
            <View style={styles.profileTextBox}>
              <Text style={styles.avatarTitle}>AI 아바타</Text>
              <Pressable style={styles.avatarButton} onPress={() => router.push('/avatar-generate')}>
                <Text style={styles.avatarButtonText}>AI 아바타 생성하기 →</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.infoTitle}>나의 정보</Text>
          <Pressable onPress={() => router.push('/survey')}><Text style={styles.actionText}>설문 다시하기 〉</Text></Pressable>
        </View>

        <View style={styles.infoList}>
          <InfoRow icon="🩷" label="스타일 선호도" value={profileData.style} />
          <InfoRow icon="🎨" label="퍼스널 컬러" value={profileData.personalColor} />
          <InfoRow icon="🌈" label="좋아하는 색상" value={profileData.colorMood} />
          <InfoRow icon="🧍‍♀️" label="체형" value={profileData.bodyType} />
          <InfoRow icon="✨" label="강조하고 싶은 부위" value={profileData.highlight} />
          <InfoRow icon="🛡️" label="가리고 싶은 부위" value={profileData.cover} />
        </View>

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
  profileCard: { backgroundColor: '#FFF7FA', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#EAEAEA', marginHorizontal: 20, marginBottom: 18 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 86, height: 86, borderRadius: 43, backgroundColor: '#fde6ea', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { color: '#444', fontWeight: '500' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 43 },
  profileTextBox: { flex: 1 },
  avatarTitle: { fontSize: 18, fontWeight: '700', color: '#FF5C8A', marginBottom: 8 },
  avatarButton: { backgroundColor: '#FF5C8A', borderRadius: 14, height: 40, justifyContent: 'center', alignItems: 'center' },
  avatarButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 },
  infoTitle: { fontSize: 18, fontWeight: '700', color: '#111111' },
  actionText: { fontSize: 13, color: '#FF5C8A', fontWeight: '600' },
  infoList: { marginHorizontal: 20, marginBottom: 18 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F3F3' },
  infoLeft: { flexDirection: 'row', alignItems: 'center' },
  infoIcon: { width: 30, fontSize: 15 },
  infoLabel: { fontSize: 14, color: '#111111' },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#555555' },
  weatherCard: { marginHorizontal: 20, borderRadius: 18, backgroundColor: '#EEF8F0', padding: 18, flexDirection: 'row', alignItems: 'center' },
  weatherEmoji: { fontSize: 34, marginRight: 16 },
  weatherSectionTitle: { fontSize: 18, fontWeight: '700', color: '#111111', marginHorizontal: 20, marginTop: 4, marginBottom: 12 },
  weatherCardTitle: { fontSize: 16, fontWeight: '700', color: '#2EAD5B', marginBottom: 6 },
  weatherDesc: { fontSize: 12, color: '#666666', lineHeight: 18 }
});