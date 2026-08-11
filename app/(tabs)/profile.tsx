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
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';

// 캘린더 마킹 및 타입 정의
interface MarkedDateCustom {
  selected?: boolean;
  selectedColor?: string;
  marked?: boolean;
  dotColor?: string;
}

interface MarkedDatesMap {
  [date: string]: MarkedDateCustom;
}

interface ScheduleItem {
  title: string;
  tpo_tag: string;
}

interface ScheduleApiResponse {
  success: boolean;
  message: string;
}

// 캘린더 한글화 설정
LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'kr';

function WeatherCard({ weather }: { weather: { title: string; message: string } }) {
  return (
    <View style={styles.weatherCard}>
      <Text style={styles.weatherEmoji}>🌤</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.weatherCardTitle}>{weather.title}</Text>
        <Text style={styles.weatherDesc}>{weather.message}</Text>
      </View>
    </View>
  );
}

const ProfileScreen = () => {
  const router = useRouter();
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.219.125:5001';

  const [weather, setWeather] = useState({ title: '오늘의 날씨', message: '날씨 정보를 불러오는 중입니다.' });
  const [faceImage, setFaceImage] = useState<string | null>(null);

  // 캘린더 상태 관리
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [tpoTag, setTpoTag] = useState<string>('Formal');
  const [markedDates, setMarkedDates] = useState<MarkedDatesMap>({});
  const [todaySchedules, setTodaySchedules] = useState<ScheduleItem[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(true);

  // DB에 등록된 모든 일정을 가져와 달력에 점(dot) 찍기
  const fetchAllSchedules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/schedules`);
      const responseText = await response.text();

      if (!response.ok) {
        console.log('❌ 서버 에러 응답 내용:', responseText);
        return;
      }

      const data = JSON.parse(responseText);

      if (data.success && data.schedules) {
        setMarkedDates((prev: MarkedDatesMap) => {
          const updated: MarkedDatesMap = {};

          data.schedules.forEach((item: { event_date: string }) => {
            if (item.event_date) {
              updated[item.event_date] = {
                marked: true,
                dotColor: '#FF5C8A',
              };
            }
          });

          if (selectedDate) {
            updated[selectedDate] = {
              ...(updated[selectedDate] || {}),
              selected: true,
              selectedColor: '#FF5C8A',
            };
          }

          return updated;
        });
      }
    } catch (error) {
      console.log('기존 일정 불러오기 실패:', error);
    }
  };

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

    fetchAllSchedules();
  }, []);

  const handleFaceRegister = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await AsyncStorage.setItem('USER_FACE_IMAGE', uri);
      setFaceImage(uri);
    }
  };

  // 📅 날짜 선택 이벤트
  const handleDayPress = async (day: DateData): Promise<void> => {
    const dateStr: string = day.dateString;
    setSelectedDate(dateStr);

    setMarkedDates((prev: MarkedDatesMap): MarkedDatesMap => {
      const updated: MarkedDatesMap = { ...prev };
      Object.keys(updated).forEach((key: string) => {
        if (updated[key]?.selected) {
          const { selected, selectedColor, ...rest } = updated[key];
          updated[key] = rest;
        }
      });

      updated[dateStr] = {
        ...(updated[dateStr] || {}),
        selected: true,
        selectedColor: '#FF5C8A',
      };
      return updated;
    });

    try {
      const response = await fetch(`${API_BASE_URL}/schedules`);
      const data = await response.json();
      if (data.success && data.schedules) {
        const filtered = data.schedules.filter((s: any) => s.event_date === dateStr);
        setTodaySchedules(filtered);
      }
    } catch (e) {
      console.log('선택 날짜 일정 조회 실패:', e);
    }
  };

  // 📌 일정 등록
  const handleAddSchedule = async (): Promise<void> => {
    if (!selectedDate) {
      Alert.alert('알림', '달력에서 날짜를 먼저 선택해 주세요.');
      return;
    }

    const trimmedTitle = (title || '').trim();
    if (!trimmedTitle) {
      Alert.alert('알림', '일정 제목을 입력해 주세요.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          event_date: selectedDate,
          tpo_tag: tpoTag,
        }),
      });

      const data: ScheduleApiResponse = await response.json();

      if (data.success) {
        Alert.alert('성공', `'${trimmedTitle}' 일정이 등록되었습니다.`);

        await fetchAllSchedules();
        setTodaySchedules((prev: ScheduleItem[]) => [
          ...prev,
          { title: trimmedTitle, tpo_tag: tpoTag },
        ]);

        setTitle('');
        Keyboard.dismiss();
      } else {
        Alert.alert('오류', data.message || '일정 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('일정 등록 에러:', error);
      Alert.alert('통신 오류', '서버 연결에 실패했습니다.');
    }
  };

  // 🗑️ 일정 삭제 함수
  const handleDeleteSchedule = async (scheduleTitle: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scheduleTitle,
          event_date: selectedDate,
        }),
      });

      const data: ScheduleApiResponse = await response.json();
      if (data.success) {
        Alert.alert('성공', '일정이 삭제되었습니다.');
        await fetchAllSchedules();
        setTodaySchedules((prev) => prev.filter((item) => item.title !== scheduleTitle));
      } else {
        Alert.alert('오류', '삭제 실패');
      }
    } catch (e) {
      console.log('삭제 통신 에러:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.screen}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>프로필</Text>
            </View>

            {/* AI 아바타 카드 */}
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

            {/* 📅 내장 스마트 캘린더 섹션 */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.weatherSectionTitle}>TPO 일정 관리</Text>
              <TouchableOpacity onPress={() => setIsCalendarOpen(!isCalendarOpen)}>
                <Text style={styles.toggleText}>{isCalendarOpen ? '접기 ▲' : '펼치기 ▼'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarCard}>
              {isCalendarOpen && (
                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                  theme={{
                    todayTextColor: '#FF5C8A',
                    arrowColor: '#FF5C8A',
                    selectedDayBackgroundColor: '#FF5C8A',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: '#A0AEC0',
                  }}
                  style={styles.calendarStyle}
                />
              )}

              <View style={styles.inputBox}>
                <Text style={styles.selectedDateText}>
                  📌 {selectedDate ? `${selectedDate} 일정 등록` : '달력에서 날짜를 터치하세요'}
                </Text>

                <View style={styles.formRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="일정 입력 (예: 경진대회 발표, 하객)"
                    placeholderTextColor="#999999"
                    value={title || ''}
                    onChangeText={setTitle}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddSchedule}>
                    <Text style={styles.addButtonText}>등록</Text>
                  </TouchableOpacity>
                </View>

                {/* TPO 태그 선택 칩 */}
                <View style={styles.tagRow}>
                  {['Formal', 'Casual', 'Date', 'Sports'].map((tag: string) => (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagButton, tpoTag === tag && styles.activeTagButton]}
                      onPress={() => setTpoTag(tag)}
                    >
                      <Text style={[styles.tagText, tpoTag === tag && styles.activeTagText]}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 등록된 일정 목록 */}
              {todaySchedules.length > 0 && (
                <View style={styles.scheduleList}>
                  <Text style={styles.listTitle}>등록된 일정:</Text>
                  {todaySchedules.map((item: ScheduleItem, idx: number) => (
                    <View key={idx} style={styles.listItemRow}>
                      <Text style={styles.listItem}>• {item.title} [{item.tpo_tag}]</Text>
                      <TouchableOpacity onPress={() => handleDeleteSchedule(item.title)}>
                        <Text style={styles.deleteButtonText}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 오늘의 날씨 섹션 */}
            <Text style={styles.weatherSectionTitle}>오늘의 날씨</Text>
            <WeatherCard weather={weather} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111111' },
  profileCard: {
    backgroundColor: '#FFF7FA',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginHorizontal: 20,
    marginBottom: 18,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#fde6ea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { color: '#444444', fontWeight: '500' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 43 },
  profileTextBox: { flex: 1 },
  avatarTitle: { fontSize: 18, fontWeight: '700', color: '#FF5C8A', marginBottom: 8 },
  avatarButton: {
    backgroundColor: '#FF5C8A',
    borderRadius: 14,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  // 캘린더 스타일
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 12,
  },
  toggleText: { fontSize: 13, color: '#FF5C8A', fontWeight: 'bold' },
  calendarCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: '#FFF7FA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: 16,
  },
  calendarStyle: { borderRadius: 12, marginBottom: 12 },
  inputBox: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#F0F0F0' },
  selectedDateText: { fontSize: 13, fontWeight: '700', color: '#333333', marginBottom: 8 },
  formRow: { flexDirection: 'row', marginBottom: 10 },
  input: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#111111',
  },
  addButton: {
    backgroundColor: '#FF5C8A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  tagRow: { flexDirection: 'row', justifyContent: 'space-between' },
  tagButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#F0F0F0' },
  activeTagButton: { backgroundColor: '#FF5C8A' },
  tagText: { fontSize: 11, color: '#666666' },
  activeTagText: { color: '#FFFFFF', fontWeight: 'bold' },
  scheduleList: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EAEAEA' },
  listTitle: { fontSize: 12, fontWeight: 'bold', color: '#777777', marginBottom: 4 },
  listItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  listItem: { fontSize: 13, color: '#333333' },
  deleteButtonText: {
    fontSize: 12,
    color: '#FF5C8A',
    fontWeight: 'bold',
    marginLeft: 10,
  },

  // 날씨 카드
  weatherCard: {
    marginHorizontal: 20,
    borderRadius: 18,
    backgroundColor: '#EEF8F0',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  weatherEmoji: { fontSize: 34, marginRight: 16 },
  weatherSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 12,
  },
  weatherCardTitle: { fontSize: 16, fontWeight: '700', color: '#2EAD5B', marginBottom: 6 },
  weatherDesc: { fontSize: 12, color: '#666666', lineHeight: 18 },
});