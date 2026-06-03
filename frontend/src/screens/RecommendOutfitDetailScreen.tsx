import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';

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

          <TouchableOpacity
            style={styles.leftArrow}
            onPress={() =>
              setIndex(
                (prev: number) =>
                  prev === 0
                    ? outfits.length - 1
                    : prev - 1,
              )
            }>
            <Text style={styles.arrow}>
              ‹
            </Text>
          </TouchableOpacity>

          <Image
            source={current.modelImage}
            style={styles.modelImage}
          />

          <View style={styles.itemBox}>
            <Text style={styles.itemTitle}>
              코디 아이템
            </Text>

            {current.items.map(
              (
                item: OutfitItem,
                idx: number,
              ) => (
                <View
                  key={idx}
                  style={styles.itemRow}>

                  <Image
                    source={item.image}
                    style={styles.itemImage}
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

          <TouchableOpacity
            style={styles.rightArrow}
            onPress={() =>
              setIndex(
                (prev: number) =>
                  prev ===
                  outfits.length - 1
                    ? 0
                    : prev + 1,
              )
            }>
            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

        </View>

        {/* Pagination */}
        <Text style={styles.pageText}>
          {index + 1} /{' '}
          {outfits.length}
        </Text>

        <View style={styles.dotRow}>
          {outfits.map(
            (
              _: Outfit,
              idx: number,
            ) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === index &&
                    styles.activeDot,
                ]}
              />
            ),
          )}
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
          placeholder="메시지를 입력하세요..."
          placeholderTextColor="#B5B5B5"
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => {
            const trimmed =
              inputText.trim();

            if (!trimmed) {
              return;
            }

            navigation.navigate(
              'MainTabs',
              {
                screen: '코디추천',

                params: {
                  prompt: trimmed,
                },
              },
            );

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

  leftArrow: {
    position: 'absolute',

    left: 14,

    top: '42%',

    zIndex: 10,
  },

  rightArrow: {
    position: 'absolute',

    right: 192,

    top: '42%',

    zIndex: 10,
  },

  arrow: {
    fontSize: 40,

    fontWeight: '500',

    color: '#111',
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

  pageText: {
    textAlign: 'center',

    marginTop: 22,

    fontSize: 16,

    fontWeight: '400',

    color: '#111',
  },

  dotRow: {
    flexDirection: 'row',

    justifyContent: 'center',

    marginTop: 10,
  },

  dot: {
    width: 8,

    height: 8,

    borderRadius: 4,

    backgroundColor: '#D9D9D9',

    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: '#FF5C8A',
  },

  questionSection: {
    marginTop: 10,

    gap: 10,
  },

  questionTitle: {
    fontSize: 20,

    fontWeight: '700',

    color: '#111',

    marginBottom: 4,
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