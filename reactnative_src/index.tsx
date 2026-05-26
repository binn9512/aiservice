import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const API_BASE_URL = "http://10.50.99.57:5000";

type ScreenName = "survey" | "profile" | "closet" | "outfit";
type ClosetTab = "옷" | "룩북";

type ProfileData = {
  style: string;
  personalColor: string;
  colorMood: string;
  bodyType: string;
  highlight: string;
  cover: string;
};

type ClosetItem = {
  id: number | string;
  name?: string;
  category?: string;
  style?: string;
  color?: string;
  imageUrl?: string;
  originalImageUrl?: string;
};

type LookbookItem = {
  id: string;
  type?: "add";
  title?: string;
  count?: number;
  image?: string;
  description?: string;
  categories?: string[];
};

const defaultProfile: ProfileData = {
  style: "페미닌 · 소프트",
  personalColor: "봄 웜 라이트",
  colorMood: "파스텔톤",
  bodyType: "웨이브 · 상체 슬림",
  highlight: "허리",
  cover: "복부",
};

const surveyOptions: Record<keyof ProfileData, string[]> = {
  style: [
    "페미닌 · 소프트",
    "미니멀 · 심플",
    "캐주얼 · 편안함",
    "러블리 · 로맨틱",
    "시크 · 모던",
  ],
  personalColor: [
    "봄 웜 라이트",
    "여름 쿨 라이트",
    "가을 웜 뮤트",
    "겨울 쿨 딥",
  ],
  colorMood: ["파스텔톤", "무채색", "비비드 컬러", "뉴트럴톤"],
  bodyType: [
    "웨이브 · 상체 슬림",
    "스트레이트 · 균형형",
    "내추럴 · 골격형",
    "하체 발달형",
  ],
  highlight: ["허리", "다리", "어깨 라인", "목선", "전체 비율"],
  cover: ["복부", "팔뚝", "허벅지", "골반 라인"],
};

const surveyLabels: Record<keyof ProfileData, string> = {
  style: "1. 스타일 선호도",
  personalColor: "2. 퍼스널 컬러",
  colorMood: "3. 좋아하는 색상 느낌",
  bodyType: "4. 체형",
  highlight: "5. 강조하고 싶은 부위",
  cover: "6. 가리고 싶은 부위",
};

export default function HomeScreen() {
  const [activeScreen, setActiveScreen] = useState<ScreenName>("survey");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [closetTab, setClosetTab] = useState<ClosetTab>("옷");
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);
  const [selectedLookbook, setSelectedLookbook] = useState<LookbookItem | null>(
    null
  );
  const [surveyData, setSurveyData] = useState<ProfileData>(defaultProfile);
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const weather = {
    weather: "맑음",
    temperature: "21°C",
    description: "오늘은 날씨가 좋아요.",
    extra: "가벼운 옷차림과 산책하기 좋은 날이에요.",
  };

  const categories = [
    "전체",
    "상의",
    "하의",
    "원피스",
    "아우터",
    "신발",
    "가방",
    "액세서리",
    "기타",
  ];
  const lookbooks: LookbookItem[] = [
  {
    id: "add",
    type: "add",
  },
  {
    id: "1",
    title: "데이트룩",
    count: 16,
    description: "러블리한 상의, 원피스, 가방 중심의 코디",
    categories: ["상의", "원피스", "가방", "신발"],
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
  },
  {
    id: "2",
    title: "봄 코디",
    count: 18,
    description: "가벼운 상의, 하의, 아우터 중심의 봄 스타일",
    categories: ["상의", "하의", "아우터", "원피스"],
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
  },
  {
    id: "3",
    title: "출근룩",
    count: 12,
    description: "셔츠, 슬랙스, 자켓 중심의 단정한 코디",
    categories: ["상의", "하의", "아우터", "가방", "신발"],
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
  },
  {
    id: "4",
    title: "데일리룩",
    count: 24,
    description: "평소 입기 좋은 기본 아이템 조합",
    categories: ["상의", "하의", "아우터", "신발", "가방"],
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b",
  },
];

  // const lookbooks: LookbookItem[] = [
  //   {
  //     id: "add",
  //     type: "add",
  //   },
  //   {
  //     id: "1",
  //     title: "데이트룩",
  //     count: 16,
  //     image: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
  //   },
  //   {
  //     id: "2",
  //     title: "봄 코디",
  //     count: 18,
  //     image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
  //   },
  //   {
  //     id: "3",
  //     title: "출근룩",
  //     count: 12,
  //     image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
  //   },
  //   {
  //     id: "4",
  //     title: "데일리룩",
  //     count: 24,
  //     image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b",
  //   },
  // ];

  useEffect(() => {
    loadClosetItems();
  }, []);

  async function loadClosetItems() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/closet`);
      const data = await response.json();
      setClosetItems(data);
    } catch (error) {
      console.log("옷장 데이터 불러오기 실패:", error);
    }
  }

  function selectSurveyOption(group: keyof ProfileData, value: string) {
    setSurveyData({
      ...surveyData,
      [group]: value,
    });
  }

  function submitSurvey() {
    setProfileData(surveyData);
    setActiveScreen("profile");
  }

  function restartSurvey() {
    setSurveyData(profileData);
    setActiveScreen("survey");
  }

  async function pickImageFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("권한 필요", "사진 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  }

  async function takePhotoWithCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("권한 필요", "카메라 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0]);
    }
  }

  async function uploadImage(asset: ImagePicker.ImagePickerAsset) {
    try {
      setIsUploading(true);

      const uriParts = asset.uri.split(".");
      const fileType = uriParts[uriParts.length - 1] || "jpg";

      const formData = new FormData();

      formData.append("photo", {
        uri: asset.uri,
        name: `clothes.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      formData.append("user_id", "user1");

      const response = await fetch(`${API_BASE_URL}/api/closet/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "업로드 실패");
      }

      if (data.success) {
        setClosetItems((prev) => [...prev, data.item]);
        Alert.alert("완료", "옷이 자동 분석되어 옷장에 추가되었습니다.");
      }
    } catch (error: any) {
      console.log("사진 업로드 실패:", error);
      Alert.alert("오류", String(error.message || error));
    } finally {
      setIsUploading(false);
    }
  }
  function openLookbook(lookbook: LookbookItem) {
    if (lookbook.type === "add") {
    Alert.alert("새 룩북 만들기", "나중에 룩북 생성 기능을 연결할 수 있어요.");
    return;
  }

  setSelectedLookbook(lookbook);
}

function getLookbookClothes(lookbook: LookbookItem | null) {
  if (!lookbook || !lookbook.categories) {
    return [];
  }

  return closetItems.filter((item) =>
    lookbook.categories?.includes(item.category || "")
  );
}
  const filteredItems =
    selectedCategory === "전체"
      ? closetItems
      : closetItems.filter((item) => item.category === selectedCategory);

  const selectedLookbookItems = getLookbookClothes(selectedLookbook);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.phone}>
        <View style={styles.fakeStatusBar}>
          <Text style={styles.statusTime}>9:41</Text>
          <View style={styles.dynamicIsland} />
          <Text style={styles.statusIcons}>◦◦◦  ᯤ  ▰</Text>
        </View>

        {activeScreen === "survey" && (
          <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>스타일 설문</Text>
                <Text style={styles.surveySubtitle}>
                  나에게 맞는 프로필을 만들기 위해{"\n"}
                  아래 항목을 선택해주세요.
                </Text>
              </View>
            </View>

            {(Object.keys(surveyOptions) as (keyof ProfileData)[]).map(
              (group) => (
                <View style={styles.surveyCard} key={group}>
                  <Text style={styles.questionTitle}>{surveyLabels[group]}</Text>

                  <View style={styles.optionGrid}>
                    {surveyOptions[group].map((option) => {
                      const selected = surveyData[group] === option;

                      return (
                        <Pressable
                          key={option}
                          style={[
                            styles.optionButton,
                            selected && styles.optionButtonSelected,
                          ]}
                          onPress={() => selectSurveyOption(group, option)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              selected && styles.optionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )
            )}

            <Pressable style={styles.surveySubmit} onPress={submitSurvey}>
              <Text style={styles.surveySubmitText}>프로필 만들기</Text>
            </Pressable>
          </ScrollView>
        )}

        {activeScreen === "profile" && (
          <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>프로필</Text>
              <Text style={styles.headerIcon}>⚙</Text>
            </View>

            <View style={styles.profileCard}>
              <View style={styles.profileRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>여성</Text>
                </View>

                <View style={styles.profileTextBox}>
                  <Text style={styles.caption}>나의 스타일 요약</Text>
                  <Text style={styles.styleTitle}>{profileData.style}</Text>
                  <Text style={styles.caption}>선택한 스타일을 바탕으로</Text>
                  <Text style={styles.caption}>오늘의 코디를 추천해드려요.</Text>
                </View>
              </View>

              <View style={styles.chipRow}>
                <Text style={styles.chip}>{profileData.colorMood}</Text>
                <Text style={styles.chip}>{profileData.bodyType}</Text>
                <Text style={styles.chip}>{profileData.highlight} 강조</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>나의 정보</Text>

              <Pressable onPress={restartSurvey}>
                <Text style={styles.actionText}>설문 다시하기 〉</Text>
              </Pressable>
            </View>

            <View style={styles.infoList}>
              <InfoRow icon="♡" label="스타일 선호도" value={profileData.style} />
              <InfoRow
                icon="△"
                label="퍼스널 컬러"
                value={profileData.personalColor}
              />
              <InfoRow
                icon="◌"
                label="좋아하는 색상 느낌"
                value={profileData.colorMood}
              />
              <InfoRow icon="▱" label="체형" value={profileData.bodyType} />
              <InfoRow
                icon="♧"
                label="강조하고 싶은 부위"
                value={profileData.highlight}
              />
              <InfoRow
                icon="▢"
                label="가리고 싶은 부위"
                value={profileData.cover}
              />
            </View>

            <Text style={styles.sectionTitle}>오늘의 날씨</Text>
            <WeatherCard weather={weather} />
          </ScrollView>
        )}

        {activeScreen === "closet" && (
          <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
            <View style={styles.closetHeader}>
              <Text style={styles.bigHeaderTitle}>내 옷장</Text>

              <View style={styles.headerRightIcons}>
                <Text style={styles.headerBigIcon}>⌕</Text>
                <Text style={styles.headerBigIcon}>☷</Text>
              </View>
            </View>

            <View style={styles.closetTopTabs}>
              <Pressable
                style={styles.closetTopTabButton}
                onPress={() => setClosetTab("옷")}
              >
                <Text
                  style={[
                    styles.closetTopTabText,
                    closetTab === "옷" && styles.closetTopTabTextActive,
                  ]}
                >
                  옷
                </Text>

                {closetTab === "옷" && <View style={styles.closetTopTabLine} />}
              </Pressable>

              <Pressable
                style={styles.closetTopTabButton}
                onPress={() => setClosetTab("룩북")}
              >
                <Text
                  style={[
                    styles.closetTopTabText,
                    closetTab === "룩북" && styles.closetTopTabTextActive,
                  ]}
                >
                  룩북
                </Text>

                {closetTab === "룩북" && <View style={styles.closetTopTabLine} />}
              </Pressable>
            </View>

            {closetTab === "옷" ? (
              <>
                <View style={styles.closetSummaryCard}>
                  <View style={styles.closetIconBox}>
                    <Text style={styles.closetIconText}>👕</Text>
                  </View>

                  <View>
                    <Text style={styles.bodyText}>AI가 인식한 내 옷</Text>

                    <View style={styles.countRow}>
                      <Text style={styles.countNumber}>{closetItems.length}</Text>
                      <Text style={styles.countUnit}>개</Text>
                    </View>

                    <Text style={styles.caption}>최근 업데이트: 방금 전</Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {categories.map((category) => (
                    <Pressable
                      key={category}
                      onPress={() => setSelectedCategory(category)}
                      style={[
                        styles.categoryChip,
                        selectedCategory === category && styles.categoryChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          selectedCategory === category &&
                            styles.categoryTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <View style={styles.uploadButtonRow}>
                  <Pressable
                    style={styles.uploadButton}
                    onPress={pickImageFromLibrary}
                    disabled={isUploading}
                  >
                    <Text style={styles.uploadButtonText}>파일에서 가져오기</Text>
                  </Pressable>

                  <Pressable
                    style={styles.uploadButton}
                    onPress={takePhotoWithCamera}
                    disabled={isUploading}
                  >
                    <Text style={styles.uploadButtonText}>사진 찍기</Text>
                  </Pressable>
                </View>

                <View style={styles.grid}>
                  <Pressable
                    style={styles.addCard}
                    onPress={pickImageFromLibrary}
                    disabled={isUploading}
                  >
                    <Text style={styles.addPlus}>＋</Text>
                    <Text style={styles.addText}>
                      {isUploading ? "분석 중..." : "사진 추가"}
                    </Text>
                  </Pressable>

                  {filteredItems.map((item) => (
                    <View style={styles.itemCard} key={item.id}>
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.itemImage}
                        />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <Text style={styles.placeholderText}>옷</Text>
                        </View>
                      )}

                      <Text style={styles.itemName}>{item.style || item.name}</Text>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : selectedLookbook ? (
  <View style={styles.lookbookDetailContainer}>
    <Pressable
      style={styles.lookbookBackButton}
      onPress={() => setSelectedLookbook(null)}
    >
      <Text style={styles.lookbookBackText}>〈 룩북 목록으로</Text>
    </Pressable>

    <View style={styles.lookbookDetailHeader}>
      {selectedLookbook.image && (
        <Image
          source={{ uri: selectedLookbook.image }}
          style={styles.lookbookDetailImage}
        />
      )}

      <View style={styles.lookbookDetailOverlay}>
        <Text style={styles.lookbookDetailTitle}>
          {selectedLookbook.title}
        </Text>

        <Text style={styles.lookbookDetailDesc}>
          {selectedLookbook.description}
        </Text>
      </View>
    </View>

    <View style={styles.lookbookCategoryRow}>
      {selectedLookbook.categories?.map((category) => (
        <View key={category} style={styles.lookbookCategoryChip}>
          <Text style={styles.lookbookCategoryText}>{category}</Text>
        </View>
      ))}
    </View>

    <View style={styles.lookbookSectionHeader}>
      <Text style={styles.lookbookSectionTitle}>이 룩북에 어울리는 옷</Text>

      <Text style={styles.lookbookSectionCount}>
        {selectedLookbookItems.length}개
      </Text>
    </View>

    {selectedLookbookItems.length === 0 ? (
      <View style={styles.emptyLookbookBox}>
        <Text style={styles.emptyLookbookText}>
          아직 이 룩북에 해당하는 옷이 없어요.{"\n"}
          옷장에서 사진을 추가하면 여기에 표시됩니다.
        </Text>
      </View>
    ) : (
      <View style={styles.grid}>
        {selectedLookbookItems.map((item) => (
          <View style={styles.itemCard} key={item.id}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.itemImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>옷</Text>
              </View>
            )}

            <Text style={styles.itemName}>{item.style || item.name}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
) : (
  <View style={styles.lookbookGrid}>
    {lookbooks.map((lookbook) => {
      if (lookbook.type === "add") {
        return (
          <Pressable
            key={lookbook.id}
            style={styles.lookbookAddCard}
            onPress={() => openLookbook(lookbook)}
          >
            <Text style={styles.lookbookPlus}>＋</Text>
            <Text style={styles.lookbookAddText}>새 룩북 만들기</Text>
          </Pressable>
        );
      }

      return (
        <Pressable
          key={lookbook.id}
          style={styles.lookbookCard}
          onPress={() => openLookbook(lookbook)}
        >
          {lookbook.image && (
            <Image
              source={{ uri: lookbook.image }}
              style={styles.lookbookImage}
            />
          )}

          <View style={styles.lookbookInfo}>
            <Text style={styles.lookbookTitle}>{lookbook.title}</Text>
            <Text style={styles.lookbookCount}>{lookbook.count}개 코디</Text>
          </View>
        </Pressable>
      );
    })}
  </View>

            )}
          </ScrollView>
        )}

        {activeScreen === "outfit" && (
          <View style={styles.screen}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>코디추천</Text>
            </View>

            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                설문 결과와 날씨를 바탕으로{"\n"}추천 코디 카드가 들어갈 자리입니다.
              </Text>
            </View>
          </View>
        )}

        {activeScreen !== "survey" && (
          <View style={styles.bottomTab}>
            <TabButton
              label="프로필"
              icon="●"
              active={activeScreen === "profile"}
              onPress={() => setActiveScreen("profile")}
            />
            <TabButton
              label="옷장"
              icon="▣"
              active={activeScreen === "closet"}
              onPress={() => setActiveScreen("closet")}
            />
            <TabButton
              label="코디추천"
              icon="✦"
              active={activeScreen === "outfit"}
              onPress={() => setActiveScreen("outfit")}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

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
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.arrow}>〉</Text>
    </View>
  );
}

function WeatherCard({
  weather,
}: {
  weather: {
    weather: string;
    temperature: string;
    description: string;
    extra: string;
  };
}) {
  return (
    <View style={styles.weatherCard}>
      <Text style={styles.weatherIcon}>🌳</Text>

      <View>
        <Text style={styles.weatherMain}>
          {weather.weather} · {weather.temperature}
        </Text>
        <Text style={styles.weatherDesc}>{weather.description}</Text>
        <Text style={styles.weatherExtra}>{weather.extra}</Text>
      </View>
    </View>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
      <Text style={[styles.tabIcon, active && styles.tabActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8EEF3",
    alignItems: "center",
  },
  phone: {
    width: "100%",
    maxWidth: 430,
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 34,
    overflow: "hidden",
  },
  fakeStatusBar: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 26,
    backgroundColor: "#FFFFFF",
  },
  statusTime: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },
  dynamicIsland: {
    width: 120,
    height: 34,
    borderRadius: 20,
    backgroundColor: "#000000",
  },
  statusIcons: {
    fontSize: 13,
    color: "#111111",
    fontWeight: "600",
  },
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111111",
  },
  headerIcon: {
    fontSize: 20,
    color: "#111111",
  },
  surveySubtitle: {
    fontSize: 13,
    color: "#666666",
    marginTop: 6,
    lineHeight: 20,
  },
  surveyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eeeeee",
    padding: 16,
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 14,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    width: "48%",
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#F3F1F2",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  optionButtonSelected: {
    backgroundColor: "#FFE3EE",
    borderWidth: 1.5,
    borderColor: "#FF5C8A",
  },
  optionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
  },
  optionTextSelected: {
    color: "#FF5C8A",
  },
  surveySubmit: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#FF5C8A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 100,
  },
  surveySubmitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  profileCard: {
    backgroundColor: "#FFF7FA",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    marginBottom: 18,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#F4D7DC",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#666666",
    fontWeight: "600",
  },
  profileTextBox: {
    flex: 1,
  },
  caption: {
    fontSize: 12,
    color: "#666666",
    lineHeight: 18,
  },
  styleTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF5C8A",
    marginVertical: 5,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    color: "#666666",
    fontSize: 11,
    backgroundColor: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
    marginVertical: 12,
  },
  actionText: {
    fontSize: 12,
    color: "#FF5C8A",
    fontWeight: "600",
  },
  infoList: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  infoRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    gap: 10,
  },
  infoIcon: {
    width: 18,
    color: "#FF5C8A",
    fontSize: 15,
  },
  infoLabel: {
    flex: 1,
    fontSize: 12,
    color: "#111111",
  },
  infoValue: {
    maxWidth: 150,
    fontSize: 12,
    color: "#666666",
    textAlign: "right",
  },
  arrow: {
    color: "#999999",
  },
  weatherCard: {
    minHeight: 82,
    borderRadius: 18,
    backgroundColor: "#EAF8EE",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 18,
    marginBottom: 30,
  },
  weatherIcon: {
    fontSize: 30,
  },
  weatherMain: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2EAD5B",
    marginBottom: 3,
  },
  weatherDesc: {
    fontSize: 11,
    color: "#666666",
  },
  weatherExtra: {
    fontSize: 11,
    color: "#666666",
  },
  closetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  bigHeaderTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111111",
  },
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  headerBigIcon: {
    fontSize: 30,
    color: "#111111",
  },
  closetTopTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    marginBottom: 24,
  },
  closetTopTabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 12,
    position: "relative",
  },
  closetTopTabText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#999999",
  },
  closetTopTabTextActive: {
    color: "#FF5C8A",
  },
  closetTopTabLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#FF5C8A",
  },
  closetSummaryCard: {
    backgroundColor: "#FFF7FA",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  closetIconBox: {
    width: 72,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#FFE3EE",
    alignItems: "center",
    justifyContent: "center",
  },
  closetIconText: {
    fontSize: 28,
  },
  bodyText: {
    fontSize: 14,
    color: "#111111",
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  countNumber: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FF5C8A",
  },
  countUnit: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF5C8A",
  },
  categoryScroll: {
    marginVertical: 18,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#F2F0F1",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#FF5C8A",
  },
  categoryText: {
    fontSize: 12,
    color: "#111111",
  },
  categoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  uploadButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  uploadButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFE3EE",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonText: {
    color: "#FF5C8A",
    fontWeight: "700",
    fontSize: 13,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 120,
  },
  itemCard: {
    width: "31%",
    minHeight: 125,
    borderRadius: 16,
    backgroundColor: "#F2F0F1",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  itemImage: {
    width: 62,
    height: 62,
    borderRadius: 12,
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },
  placeholderImage: {
    width: 62,
    height: 62,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#999999",
  },
  itemName: {
    marginTop: 8,
    fontSize: 11,
    color: "#666666",
    textAlign: "center",
  },
  itemCategory: {
    marginTop: 2,
    fontSize: 10,
    color: "#999999",
  },
  addCard: {
    width: "31%",
    minHeight: 125,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#FFB7CB",
    backgroundColor: "#FFF7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  addPlus: {
    fontSize: 30,
    color: "#FF5C8A",
  },
  addText: {
    marginTop: 6,
    color: "#FF5C8A",
    fontWeight: "600",
    fontSize: 12,
  },
  lookbookGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 120,
  },
  lookbookAddCard: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#FFB7CB",
    backgroundColor: "#FFF8FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  lookbookPlus: {
    fontSize: 38,
    color: "#FF5C8A",
    marginBottom: 10,
  },
  lookbookAddText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF5C8A",
  },
  lookbookCard: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },
  lookbookImage: {
    width: "100%",
    height: "68%",
    resizeMode: "cover",
  },
  lookbookInfo: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  lookbookTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 4,
  },
  lookbookCount: {
    fontSize: 14,
    color: "#999999",
  },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  bottomTab: {
    height: 64,
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabIcon: {
    fontSize: 18,
    color: "#666666",
  },
  tabLabel: {
    fontSize: 11,
    color: "#666666",
  },
  tabActive: {
    color: "#FF5C8A",
    fontWeight: "700",
  },
  lookbookDetailContainer: {
  paddingBottom: 120,
},

lookbookBackButton: {
  alignSelf: "flex-start",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 14,
  backgroundColor: "#FFF3F7",
  marginBottom: 14,
},

lookbookBackText: {
  color: "#FF5C8A",
  fontSize: 13,
  fontWeight: "800",
},

lookbookDetailHeader: {
  height: 190,
  borderRadius: 24,
  overflow: "hidden",
  backgroundColor: "#F2F0F1",
  marginBottom: 14,
},

lookbookDetailImage: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},

lookbookDetailOverlay: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  padding: 16,
  backgroundColor: "rgba(0, 0, 0, 0.35)",
},

lookbookDetailTitle: {
  color: "#FFFFFF",
  fontSize: 24,
  fontWeight: "900",
  marginBottom: 5,
},

lookbookDetailDesc: {
  color: "#FFFFFF",
  fontSize: 12,
  lineHeight: 18,
},

lookbookCategoryRow: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 18,
},

lookbookCategoryChip: {
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 999,
  backgroundColor: "#FFE3EE",
},

lookbookCategoryText: {
  color: "#FF5C8A",
  fontSize: 12,
  fontWeight: "800",
},

lookbookSectionHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
},

lookbookSectionTitle: {
  fontSize: 17,
  fontWeight: "900",
  color: "#111111",
},

lookbookSectionCount: {
  fontSize: 13,
  color: "#999999",
  fontWeight: "700",
},

emptyLookbookBox: {
  minHeight: 150,
  borderRadius: 20,
  backgroundColor: "#FFF8FA",
  borderWidth: 1,
  borderColor: "#FFE3EE",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
},

emptyLookbookText: {
  textAlign: "center",
  color: "#777777",
  lineHeight: 22,
  fontSize: 13,
},
});
