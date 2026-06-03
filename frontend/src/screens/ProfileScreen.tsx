import React, {
  useState,
  useEffect,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Text style={styles.infoIcon}>
          {icon}
        </Text>

        <Text style={styles.infoLabel}>
          {label}
        </Text>
      </View>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

function WeatherCard({
  weather,
}: {
  weather: {
    title: string;
    message: string;
  };
}) {
  return (
    <View style={styles.weatherCard}>
      <Text style={styles.weatherEmoji}>
        🌤
      </Text>

      <View>
        <Text style={styles.weatherCardTitle}>
          {weather.title}
        </Text>

        <Text style={styles.weatherDesc}>
          {weather.message}
        </Text>
      </View>
    </View>
  );
}

const ProfileScreen = () => {
  const navigation =
    useNavigation<any>();

  const route = useRoute<any>();

  const [profileData] =
    useState(
      route.params
        ?.updatedProfile ||
        defaultProfile,
    );

    const [weather, setWeather] =
  useState({
    title: '날씨 불러오는 중...',
    message: '',
  });

  useEffect(() => {
  fetch(
    'http://192.168.219.125:5001/weather',
  )
    .then(res => res.json())
    .then(data => {
      setWeather(data);
    })
    .catch(error => {
      console.log(
        '날씨 API 오류:',
        error,
      );
    });
}, []);

  function restartSurvey() {
    navigation.navigate(
      'Survey',
      {
        profileData,
      },
    );
  }

  return (
    <SafeAreaView
      style={styles.container}>
      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={
          false
        }>
        <View style={styles.header}>
          <Text
            style={
              styles.headerTitle
            }>
            프로필
          </Text>
        </View>

        <View
          style={
            styles.profileCard
          }>
          <View
            style={
              styles.profileRow
            }>
            <View
              style={
                styles.avatar
              }>
              <Text
                style={
                  styles.avatarText
                }>
                여성
              </Text>
            </View>

            <View
              style={
                styles.profileTextBox
              }>
              <Text
                style={
                  styles.caption
                }>
                나의 스타일 요약
              </Text>

              <Text
                style={
                  styles.styleTitle
                }>
                {
                  profileData.style
                }
              </Text>

              <Text
                style={
                  styles.caption
                }>
                선택한 스타일을
                바탕으로
              </Text>

              <Text
                style={
                  styles.caption
                }>
                오늘의 코디를
                추천해드려요.
              </Text>
            </View>
          </View>

          <View
            style={
              styles.chipRow
            }>
            <Text
              style={styles.chip}>
              {
                profileData.colorMood
              }
            </Text>

            <Text
              style={styles.chip}>
              {
                profileData.bodyType
              }
            </Text>

            <Text
              style={styles.chip}>
              {
                profileData.highlight
              }{' '}
              강조
            </Text>
          </View>
        </View>

        <View
          style={
            styles.sectionHeader
          }>
          <Text
            style={
              styles.infoTitle
            }>
            나의 정보
          </Text>

          <Pressable
            onPress={
              restartSurvey
            }>
            <Text
              style={
                styles.actionText
              }>
              설문 다시하기 〉
            </Text>
          </Pressable>
        </View>

        <View
          style={
            styles.infoList
          }>
          <InfoRow
            icon="🩷"
            label="스타일 선호도"
            value={
              profileData.style
            }
          />

          <InfoRow
            icon="🎨"
            label="퍼스널 컬러"
            value={
              profileData.personalColor
            }
          />

          <InfoRow
            icon="🌈"
            label="좋아하는 색상"
            value={
              profileData.colorMood
            }
          />

          <InfoRow
            icon="🧍‍♀️"
            label="체형"
            value={
              profileData.bodyType
            }
          />

          <InfoRow
            icon="✨"
            label="강조하고 싶은 부위"
            value={
              profileData.highlight
            }
          />

          <InfoRow
            icon="🛡️"
            label="가리고 싶은 부위"
            value={
              profileData.cover
            }
          />
        </View>

        <Text
          style={
            styles.weatherSectionTitle
          }>
          오늘의 날씨
        </Text>

        <WeatherCard
          weather={weather}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#FFFFFF',
  },

  screen: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    paddingTop: 12,
    paddingBottom: 12,

    paddingHorizontal: 20,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
  },

  headerIcon: {
    fontSize: 22,
  },

  profileCard: {
    backgroundColor:
      '#FFF7FA',

    borderRadius: 18,

    padding: 16,

    borderWidth: 1,

    borderColor: '#EAEAEA',

    marginHorizontal: 20,

    marginBottom: 18,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 86,
    height: 86,

    borderRadius: 43,

    backgroundColor:
      '#F4D7DC',

    alignItems: 'center',

    justifyContent:
      'center',

    marginRight: 16,
  },

  avatarText: {
    color: '#666666',
    fontWeight: '600',
  },

  profileTextBox: {
    flex: 1,
  },

  caption: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },

  styleTitle: {
    fontSize: 20,
    fontWeight: '800',

    color: '#FF5C8A',

    marginVertical: 5,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    marginTop: 12,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 20,

    borderWidth: 1,

    borderColor: '#EAEAEA',

    color: '#666666',

    fontSize: 11,

    backgroundColor:
      '#FFFFFF',

    marginRight: 8,
  },

  sectionHeader: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    paddingHorizontal: 20,

    marginBottom: 8,
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },

  actionText: {
    fontSize: 13,
    color: '#FF5C8A',
    fontWeight: '600',
  },

  infoList: {
    marginHorizontal: 20,
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    paddingVertical: 16,

    borderBottomWidth: 1,

    borderBottomColor:
      '#F3F3F3',
  },

  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 30,
    fontSize: 15,
    color: '#777777',
  },

  infoLabel: {
    fontSize: 14,
    color: '#111111',
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555555',
  },

  weatherCard: {
    marginHorizontal: 20,

    marginBottom: 40,

    borderRadius: 18,

    backgroundColor:
      '#EEF8F0',

    padding: 18,

    flexDirection: 'row',

    alignItems: 'center',
  },

  weatherEmoji: {
    fontSize: 34,
    marginRight: 16,
  },

  weatherSectionTitle: {
    fontSize: 18,
    fontWeight: '700',

    color: '#111111',

    marginHorizontal: 20,

    marginTop: 4,
    marginBottom: 12,
  },

  weatherCardTitle: {
    fontSize: 16,
    fontWeight: '700',

    color: '#2EAD5B',

    marginBottom: 6,
  },

  weatherDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#666666',
  },
});