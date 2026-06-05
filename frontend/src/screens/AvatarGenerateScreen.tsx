import React, {
  useEffect,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

import Ionicons
from 'react-native-vector-icons/Ionicons';

import {
  useNavigation,
} from '@react-navigation/native';

export default function AvatarGenerateScreen() {
  const navigation =
    useNavigation<any>();

  const [faceImage, setFaceImage] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    const loadImage =
      async () => {
        const savedImage =
          await AsyncStorage.getItem(
            'USER_FACE_IMAGE',
          );

        if (savedImage) {
          setFaceImage(
            savedImage,
          );
        }
      };

    loadImage();
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      <TouchableOpacity
        onPress={() =>
          navigation.goBack()
        }>
        <Text style={styles.back}>
          ‹
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        AI 아바타 생성
      </Text>

      {/* 얼굴 사진 */}
      <View style={styles.faceCard}>

        {faceImage ? (
          <Image
            source={{
              uri: faceImage,
            }}
            style={
              styles.faceImage
            }
          />
        ) : (
          <View
            style={
              styles.emptyFace
            }>
            <Text
              style={
                styles.emptyFaceText
              }>
              얼굴 사진 없음
            </Text>
          </View>
        )}

      </View>

      <Text style={styles.desc}>
        얼굴 사진을 기반으로
      </Text>

      <Text style={styles.desc}>
        AI 아바타를 생성합니다.
      </Text>

      <View style={styles.flowBox}>

        <Text style={styles.flowTitle}>
            아바타 생성 과정
        </Text>

        <View style={styles.flowRow}>

            <View style={styles.flowCard}>
            <Ionicons
                name="happy-outline"
                size={40}
                color="#FF5C8A"
            />

            <Text style={styles.flowCardText}>
                얼굴 사진
            </Text>
            </View>

            <Ionicons
            name="arrow-forward"
            size={24}
            color="#FF5C8A"
            />

            <View style={styles.flowCard}>
            <Ionicons
                name="body-outline"
                size={40}
                color="#FF5C8A"
            />

            <Text style={styles.flowCardText}>
                AI 아바타
            </Text>
            </View>

            <Ionicons
            name="arrow-forward"
            size={24}
            color="#FF5C8A"
            />

            <View style={styles.flowCard}>
            <Ionicons
                name="shirt-outline"
                size={40}
                color="#FF5C8A"
            />

            <Text style={styles.flowCardText}>
                추천 코디
            </Text>
            </View>

        </View>

        </View>

      <Text style={styles.infoText}>
        생성된 아바타로 다양한 코디를 입혀볼 수 있어요!
      </Text>

      <View style={{flex: 1}} />

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
            navigation.navigate(
            'AvatarGenerating',
            )
        }>
        <Text style={styles.buttonText}>
          AI 아바타 생성하기
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor:
      '#FFFFFF',

    padding: 20,
  },

  back: {
    fontSize: 36,

    color: '#111',

    marginHorizontal: 12,
  },

  title: {
    fontSize: 24,

    fontWeight: '800',

    color: '#111',

    marginTop: 2,

    marginBottom: 25,

    marginHorizontal: 25,
  },

  faceCard: {
    alignItems: 'center',

    marginBottom: 20,
  },

  faceImage: {
    width: 300,

    height: 300,

    borderRadius: 20,
  },

  emptyFace: {
    width: 300,

    height: 300,

    borderRadius: 20,

    backgroundColor:
      '#F5F5F5',

    justifyContent:
      'center',

    alignItems: 'center',
  },

  emptyFaceText: {
    color: '#999',
  },

  desc: {
    fontSize: 15,

    color: '#666',

    textAlign: 'center',

    marginBottom: 4,
  },

  flowBox: {
  marginTop: 20,

  paddingVertical: 20,
  paddingHorizontal: 18,

  marginHorizontal: 10,

  borderRadius: 20,

  backgroundColor: '#FFF5F8',
},

  flowTitle: {
    fontSize: 18,

    fontWeight: '700',

    color: '#111',

    marginBottom: 18,
  },

  flowText: {
    fontSize: 15,

    color: '#444',
  },

  arrow: {
    fontSize: 20,

    color: '#FF5C8A',

    marginVertical: 8,
  },

  infoText: {
    textAlign: 'center',

    color: '#666',

    marginTop: 10,

    fontSize: 14,
  },

  button: {
    height: 54,

    borderRadius: 16,

    backgroundColor:
      '#FF5C8A',

    justifyContent:
      'center',

    alignItems: 'center',

    marginBottom: 8,

    marginHorizontal: 20,
  },

  buttonText: {
    color: '#FFF',

    fontSize: 16,

    fontWeight: '700',
  },

  flowRow: {
  flexDirection: 'row',

  alignItems: 'center',

  justifyContent: 'space-between',

  width: '100%',
},

flowCard: {
  width: 90,

  height: 110,

  borderRadius: 16,

  backgroundColor: '#FFFFFF',

  justifyContent: 'center',

  alignItems: 'center',
},

flowCardText: {
  marginTop: 10,

  fontSize: 13,

  fontWeight: '600',

  color: '#444',
},
});