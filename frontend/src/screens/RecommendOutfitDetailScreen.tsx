import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useNavigation,
  NavigationProp,
  useRoute,
  RouteProp,
} from '@react-navigation/native';

type OutfitItem = {
  name: string;
  sub: string;
  image: any;
};

type Outfit = {
  id: string;
  modelImage: any;
  items: OutfitItem[];
};

type RootStackParamList = {
  RecommendOutfitDetail: {
    outfits: Outfit[];
    initialIndex: number;
  };

  Recommend: {
    prompt?: string;
  };
};

export default function RecommendOutfitDetailScreen() {
  const navigation =
    useNavigation<
      NavigationProp<any>
    >();

  const route =
    useRoute<
      RouteProp<
        RootStackParamList,
        'RecommendOutfitDetail'
      >
    >();

  const {
    outfits,
    initialIndex = 0,
  } = route.params;

  const [index, setIndex] =
    useState<number>(
      initialIndex,
    );

  const [inputText, setInputText] =
    useState('');

  const current = outfits[index];

  return (
    <>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.headerRow}>

          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }>
            <Text style={styles.backButton}>
              ‹
            </Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            채팅
          </Text>

        </View>

        <Text style={styles.outfitTitle}>
          추천 코디
        </Text>

        {/* Content */}
        <View style={styles.content}>

          <Image
            source={current.modelImage}
            style={styles.modelImage}
          />

          <View style={styles.itemBox}>
            <Text style={styles.itemTitle}>
              코디 아이템
            </Text>

            <View style={styles.itemsContainer}>
            {current.items.map(
              (
                item: OutfitItem,
                idx: number,
              ) => (
                <View
                  key={idx}
                  style={styles.itemRow}>

                  <Image
                    source={
                      typeof item.image === 'string'
                        ? { uri: item.image }
                        : item.image
                    }
                    style={styles.itemImage}
                    resizeMode="contain"
                  />

                  <View style={{flex: 1}}>
                    <Text
                      numberOfLines={1}
                      style={styles.itemName}>
                      {item.name}
                    </Text>

                    <Text
                      style={styles.itemSub}>
                      {item.sub}
                    </Text>
                  </View>
                </View>
              ),
            )}
            </View>
          </View>


        </View>

        {/* Questions */}
        <View style={styles.questionSection}>

          <Text style={styles.questionTitle}>
            추천 질문
          </Text>

          <TouchableOpacity
            style={styles.questionButton}
            onPress={() =>
              setInputText(
                '오늘 날씨에 맞게 수정해줘',
              )
            }>
            <Text style={styles.questionText}>
              ✨ 오늘 날씨에 맞게 수정해줘
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.questionButton}
            onPress={() =>
              setInputText(
                '현재 아이템들은 유지하고 다른 코디 보여줘',
              )
            }>
            <Text style={styles.questionText}>
              ✨ 현재 아이템들은 유지하고 다른 코디 보여줘
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.questionButton}
            onPress={() =>
              setInputText(
                '가방만 다른 걸로 추천해줘',
              )
            }>
            <Text style={styles.questionText}>
              ✨ 가방만 다른 걸로 추천해줘
            </Text>
          </TouchableOpacity>

        </View>

      </View>

      {/* Fixed Input */}
      <View style={styles.inputWrapper}>
        <TextInput
          value={inputText}
          onChangeText={
            setInputText
          }
          placeholder="수정하고 싶은 점을 입력해보세요"
          placeholderTextColor="#B5B5B5"
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={async () => {
            const trimmed =
              inputText.trim();

            if (!trimmed) {
              return;
            }

            console.log(
              '🔥 SEND BUTTON',
              trimmed,
            );

            await AsyncStorage.setItem(
              'PENDING_PROMPT',
              trimmed,
            );

            navigation.goBack();

            setInputText('');
          }}>
          
          <Text style={styles.sendText}>
            ➜
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 20,

    paddingTop: 54,

    paddingBottom: 140,
  },

  headerRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  backButton: {
    fontSize: 38,

    color: '#111',

    marginRight: 8,

    marginTop: -4,
  },

  headerTitle: {
    fontSize: 18,

    fontWeight: '600',

    color: '#111',
  },

  outfitTitle: {
    fontSize: 22,

    fontWeight: '700',

    color: '#111',

    marginTop: 13,

    marginBottom: 12,
  },

  content: {
    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'flex-start',

    position: 'relative',
  },

  modelImage: {
    width: 160,

    height: 340,

    borderRadius: 24,

    resizeMode: 'cover',
  },

  itemBox: {
    width: 160,

    height: 340,

    marginLeft: 18,

    borderWidth: 1,

    borderColor: '#F1D8E1',

    borderRadius: 20,

    padding: 12,
  },

  itemTitle: {
    color: '#FF5C8A',

    fontWeight: '700',

    fontSize: 15,

    marginBottom: 14,
  },

  itemRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 14,
  },

  itemImage: {
    width: 46,

    height: 46,

    borderRadius: 10,

    marginRight: 10,
  },

  itemsContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
  },

  itemName: {
    fontSize: 12,

    fontWeight: '600',

    color: '#111',
  },

  itemSub: {
    fontSize: 11,

    color: '#777',

    marginTop: 2,
  },

  questionSection: {
    marginTop: 25,

    gap: 10,
  },

  questionTitle: {
    fontSize: 22,

    fontWeight: '700',

    color: '#111',

    marginBottom: 3,
  },

  questionButton: {
    backgroundColor: '#FFF5F8',

    borderWidth: 1,

    borderColor: '#FFD6E3',

    borderRadius: 999,

    paddingVertical: 12,

    paddingHorizontal: 12,
  },

  questionText: {
    fontSize: 14,

    color: '#FF5C8A',

    fontWeight: '600',
  },

  inputWrapper: {
    position: 'absolute',

    left: 16,

    right: 16,

    bottom: 24,

    flexDirection: 'row',

    alignItems: 'center',

    borderWidth: 1,

    borderColor: '#EAEAEA',

    borderRadius: 999,

    paddingLeft: 18,

    paddingRight: 8,

    height: 58,

    backgroundColor: '#FFFFFF',
  },

  input: {
    flex: 1,

    fontSize: 15,

    color: '#111',

    paddingVertical: 0,
  },

  sendButton: {
    width: 46,

    height: 46,

    borderRadius: 23,

    backgroundColor: '#FF5C8A',

    justifyContent: 'center',

    alignItems: 'center',
  },

  sendText: {
    color: '#FFF',

    fontSize: 18,

    fontWeight: '700',
  },
});