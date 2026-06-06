import React, {
  useState,
  useEffect,
} from 'react';

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

import ItemDetailModal from '../components/modal/ItemDetailModal';

import {
  OutfitItem,
} from '../data/mockOutfits';

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

  const [
    selectedItem,
    setSelectedItem,
  ] = useState<OutfitItem | null>(
    null,
  );

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const current = outfits[index];

  console.log(
    'MODEL IMAGE =',
    current.modelImage,
  );

  console.log(
    'CURRENT OUTFIT =',
    JSON.stringify(current, null, 2),
  );

    console.log(
    JSON.stringify(
      current.items,
      null,
      2,
    ),
  );

  const [faceImage, setFaceImage] =
  useState<string | null>(null);

  useEffect(() => {
    const loadFaceImage =
      async () => {
        const savedImage =
          await AsyncStorage.getItem(
            'USER_AVATAR_IMAGE',
          );

        console.log(
          'USER_AVATAR_IMAGE =',
          savedImage,
        );

        if (savedImage) {
          setFaceImage(savedImage);
        }
      };

    loadFaceImage();
  }, []);

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

            {faceImage ? (
              <View style={styles.avatarWrapper}>
                <Image
                  source={
                    typeof current.modelImage ===
                    'string'
                      ? {
                          uri:
                            current.modelImage,
                        }
                      : current.modelImage
                  }
                  style={styles.modelImage}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View
                style={styles.emptyAvatar}>
                <Text
                  style={styles.emptyAvatarText}>
                  AI 아바타
                </Text>

                <Text
                  style={styles.emptyAvatarSub}>
                  프로필 화면에서
                </Text>

                <Text
                  style={styles.emptyAvatarSub}>
                  아바타 생성 후 표시됩니다
                </Text>
              </View>
            )}
            
          

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
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={styles.itemRow}
                  onPress={() => {
                    setSelectedItem(item);
                    setModalVisible(true);
                  }}>

                  <Image
                    source={
                      typeof item.image === 'string'
                        ? {uri: item.image}
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

                    <Text style={styles.itemSub}>
                      {item.type === 'closet'
                        ? '내 옷장'
                        : '추천 상품'}
                    </Text>
                  </View>

                </TouchableOpacity>
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

          <Text style={styles.questionSubTitle}>
            추천 질문을 누른 뒤 아래 입력창에서 자유롭게 수정할 수 있어요
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
                '비슷한 분위기의 다른 코디 보여줘',
              )
            }>
            <Text style={styles.questionText}>
              ✨ 비슷한 분위기의 다른 코디 보여줘 
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

      <ItemDetailModal
        visible={modalVisible}
        item={selectedItem}
        onClose={() => {
          setModalVisible(false);
          setSelectedItem(null);
        }}
        onRecommendQuestion={(prompt) => {
          setInputText(prompt);
          setModalVisible(false);
          setSelectedItem(null);
        }}
      />
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

    marginTop: 2,
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
    width: 240,

    height: 450,

    borderRadius: 24,

    resizeMode: 'cover',

    marginVertical: -55,

    marginLeft: -45,
  },

  avatarWrapper: {
    width: 160,
    height: 340,
    position: 'relative',
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

    marginLeft: 2,
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

    marginBottom: -4,
  },

  questionSubTitle: {
    fontSize: 13,

    color: '#666',

    marginBottom: 5,

    marginHorizontal: 1,
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

  emptyAvatar: {
  width: 160,

  height: 340,

  borderRadius: 24,

  backgroundColor: '#F5F5F5',

  justifyContent: 'center',

  alignItems: 'center',
},

emptyAvatarText: {
  fontSize: 20,

  fontWeight: '700',

  color: '#666',
},

emptyAvatarSub: {
  fontSize: 12,

  color: '#999',

  marginTop: 6,

  marginVertical: -3,
},

clothesLayer: {
  position: 'absolute',

  top: 60,

  left: 20,

  width: 120,

  height: 220,
},

dressLayer: {
  position: 'absolute',

  top: 55,

  left: 15,

  width: 130,

  height: 220,
},

shoesLayer: {
  position: 'absolute',

  top: 255,

  left: 35,

  width: 90,

  height: 60,
},

bagLayer: {
  position: 'absolute',

  top: 120,

  left: 85,

  width: 55,

  height: 80,
},

outerLayer: {
  position: 'absolute',
  top: 55,
  left: 10,
  width: 140,
  height: 120,
},

topLayer: {
  position: 'absolute',
  top: 90,
  left: 15,
  width: 130,
  height: 120,
},

bottomLayer: {
  position: 'absolute',
  top: 165,
  left: 25,
  width: 110,
  height: 140,
},
});