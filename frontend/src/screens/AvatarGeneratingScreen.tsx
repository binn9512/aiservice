import React, {
  useEffect,
} from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

export default function AvatarGeneratingScreen() {
  const navigation =
    useNavigation<any>();

  useEffect(() => {
    const timer =
      setTimeout(() => {
        navigation.replace(
          'AvatarResult',
        );
      }, 3000);

    return () =>
      clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView
      style={styles.container}>

      <Text style={styles.title}>
        AI 아바타 생성 중
      </Text>

      <ActivityIndicator
        size="large"
        color="#FF5C8A"
      />

      <Text style={styles.mainText}>
        특징을 분석하고 있어요
      </Text>

      <Text style={styles.mainText2}>
        잠시만 기다려주세요!
      </Text>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
  },

  mainText: {
    marginTop: 30,
    fontSize: 17,
    fontWeight: '500',
  },

  mainText2: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: '500',
  },
});