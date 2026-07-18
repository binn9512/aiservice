import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// 1️⃣ expo-router import로 교체
import { useRouter, useLocalSearchParams } from 'expo-router';

const sections = [
  { key: 'style', title: '추구하는 스타일', options: ['페미닌', '미니멀', '캐주얼', '비지니스', '빈티지'] },
  { key: 'personalColor', title: '퍼스널 컬러', options: ['봄 웜톤', '여름 쿨톤', '가을 웜톤', '겨울 쿨톤'] },
  { key: 'colorMood', title: '좋아하는 색감', options: ['파스텔', '무채색', '비비드', '뉴트럴'] },
  { key: 'bodyType', title: '체형', options: ['웨이브', '스트레이트', '내추럴'] },
  { key: 'highlight', title: '강조하고 싶은 부위', options: ['목선', '팔', '허리', '다리', '비율'] },
  { key: 'cover', title: '가리고 싶은 부위', options: ['복부', '팔', '허벅지', '종아리'] },
];

const SurveyScreen = () => {
  // 2️⃣ 기존 navigation, route 훅 대신 router, params 사용
  const router = useRouter();
  const params = useLocalSearchParams();

  // 엑스포 라우터는 데이터를 문자열(string)로 전달하므로 파싱 처리
  let initialData = null;
  try {
    if (params.profileData) {
      initialData = JSON.parse(params.profileData as string);
    }
  } catch (e) {
    console.log('초기 데이터 파싱 에러', e);
  }

  const [form, setForm] = useState(
    initialData || {
      style: '',
      personalColor: '',
      colorMood: '',
      bodyType: '',
      highlight: '',
      cover: '',
    },
  );

  function selectOption(key: string, value: string) {
    setForm({ ...form, [key]: value });
  }

  // 3️⃣ 화면 이동 및 파라미터 전달 코드 변경
    function submitSurvey() {
      router.replace({
        pathname: '/profile' as any, // 👈 여기에 as any 를 붙여주세요!
        params: {
          updatedProfile: JSON.stringify(form), 
        },
      });
    }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>스타일 설문</Text>
        </View>

        {sections.map(section => (
          <View key={section.key} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.optionGrid}>
              {section.options.map(option => {
                const selected = form[section.key as keyof typeof form] === option;
                return (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.8}
                    onPress={() => selectOption(section.key, option)}
                    style={[styles.optionButton, selected && styles.selectedOption]}>
                    <Text style={[styles.optionText, selected && styles.selectedText]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity activeOpacity={0.8} style={styles.submitButton} onPress={submitSurvey}>
          <Text style={styles.submitText}>완료</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SurveyScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#111111' },
  section: { marginBottom: 18, paddingHorizontal: 25 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111111', marginBottom: 12 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  optionButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, backgroundColor: '#F3F3F3', marginRight: 10, marginBottom: 10 },
  selectedOption: { backgroundColor: '#FFE3EE', borderWidth: 1, borderColor: '#FF5C8A' },
  optionText: { fontSize: 13, fontWeight: '600', color: '#555555' },
  selectedText: { color: '#FF5C8A' },
  submitButton: { height: 54, borderRadius: 18, backgroundColor: '#FF5C8A', justifyContent: 'center', alignItems: 'center', marginHorizontal: 20, marginTop: 50, marginBottom: 120 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});