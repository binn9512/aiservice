import { useEffect, useState } from "react";
import { fetchClosetItems, uploadClosetPhoto } from "./api";

function App() {
  const [activeScreen, setActiveScreen] = useState("profile");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const [closetItems, setClosetItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [profile, setProfile] = useState({
    style: "페미닌 · 소프트",
    personalColor: "봄 웜 라이트",
    colorMood: "파스텔톤",
    bodyType: "웨이브 · 상체 슬림",
    highlight: "허리",
    cover: "복부",
  });

  const [surveyData, setSurveyData] = useState(profile);

  const weather = {
    weather: "맑음",
    temperature: "21°C",
    description: "오늘은 날씨가 좋아요.",
    extra: "가벼운 옷차림과 산책하기 좋은 날이에요.",
  };

  const categories = ["전체", "상의", "하의", "원피스", "아우터", "신발", "가방"];

  const surveyOptions = {
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

  const surveyLabels = {
    style: "1. 스타일 선호도",
    personalColor: "2. 퍼스널 컬러",
    colorMood: "3. 좋아하는 색상 느낌",
    bodyType: "4. 체형",
    highlight: "5. 강조하고 싶은 부위",
    cover: "6. 가리고 싶은 부위",
  };

  useEffect(() => {
    async function loadClosetItems() {
      try {
        const data = await fetchClosetItems();
        setClosetItems(data);
      } catch (error) {
        console.error("옷장 데이터 불러오기 실패:", error);
      }
    }

    loadClosetItems();
  }, []);

  function selectSurveyOption(group, value) {
    setSurveyData({
      ...surveyData,
      [group]: value,
    });
  }

  function submitSurvey() {
    setProfile(surveyData);
    setActiveScreen("profile");
  }

  async function handleClosetPhotoUpload(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      setIsUploading(true);

      const result = await uploadClosetPhoto(file);

      if (result.success) {
        setClosetItems((prevItems) => [...prevItems, result.item]);
        alert("옷이 자동 분석되어 옷장에 추가되었습니다.");
      } else {
        alert(result.message || "옷 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("옷 사진 업로드 실패:", error);
      alert("사진 업로드 또는 분석 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  const filteredItems =
    selectedCategory === "전체"
      ? closetItems
      : closetItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="phone">
      {activeScreen === "survey" && (
        <section className="screen active">
          <div className="header">
            <div>
              <div className="header-title">스타일 설문</div>
              <div className="header-subtitle">
                나에게 맞는 프로필을 만들기 위해
                <br />
                아래 항목을 선택해주세요.
              </div>
            </div>
          </div>

          {Object.keys(surveyOptions).map((group) => (
            <div className="survey-card" key={group}>
              <div className="question-title">{surveyLabels[group]}</div>

              <div className="option-grid">
                {surveyOptions[group].map((option) => (
                  <button
                    key={option}
                    className={
                      surveyData[group] === option
                        ? "option-button selected"
                        : "option-button"
                    }
                    onClick={() => selectSurveyOption(group, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button className="survey-submit" onClick={submitSurvey}>
            프로필 만들기
          </button>
        </section>
      )}

      {activeScreen === "profile" && (
        <section className="screen active">
          <div className="header">
            <div className="header-title">프로필</div>
            <div className="header-icon">⚙</div>
          </div>

          <div className="card">
            <div className="profile-summary">
              <div className="avatar">여성</div>

              <div>
                <div className="caption">나의 스타일 요약</div>
                <div className="style-title">{profile.style}</div>
                <div className="caption">선택한 스타일을 바탕으로</div>
                <div className="caption">오늘의 코디를 추천해드려요.</div>
              </div>
            </div>

            <div className="chip-row">
              <div className="chip">{profile.colorMood}</div>
              <div className="chip">{profile.bodyType}</div>
              <div className="chip">{profile.highlight} 강조</div>
            </div>
          </div>

          <div className="section-header">
            <div className="section-title no-margin">나의 정보</div>
            <button
              className="section-action"
              onClick={() => setActiveScreen("survey")}
            >
              설문 다시하기 〉
            </button>
          </div>

          <div className="info-list">
            <InfoRow icon="♡" label="스타일 선호도" value={profile.style} />
            <InfoRow icon="△" label="퍼스널 컬러" value={profile.personalColor} />
            <InfoRow icon="◌" label="좋아하는 색상 느낌" value={profile.colorMood} />
            <InfoRow icon="▱" label="체형" value={profile.bodyType} />
            <InfoRow icon="♧" label="강조하고 싶은 부위" value={profile.highlight} />
            <InfoRow icon="▢" label="가리고 싶은 부위" value={profile.cover} />
          </div>

          <div className="section-title">오늘의 날씨</div>

          <WeatherCard weather={weather} />
        </section>
      )}

      {activeScreen === "closet" && (
        <section className="screen active">
          <div className="header">
            <div className="header-title">내 옷장</div>
            <div className="closet-header-icons">
              <span>⌕</span>
              <span>☷</span>
            </div>
          </div>

          <div className="card">
            <div className="closet-summary">
              <div className="closet-icon-box">T</div>

              <div>
                <div className="body-text">AI가 인식한 내 옷</div>

                <div className="closet-count">
                  <div className="count-number">{closetItems.length}</div>
                  <div className="count-unit">개</div>
                </div>

                <div className="caption">최근 업데이트: 방금 전</div>
              </div>
            </div>
          </div>

          <div className="category-row">
            {categories.map((category) => (
              <button
                key={category}
                className={
                  selectedCategory === category
                    ? "category-chip active"
                    : "category-chip"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="keyword-title-row">
            <div className="keyword-title">키워드 태그</div>
            <div className="edit">편집</div>
          </div>

          <div className="tag-row">
            <div className="outline-chip">#그레이</div>
            <div className="outline-chip">#하늘색</div>
            <div className="outline-chip">#도트</div>
            <div className="outline-chip">#니트</div>
          </div>

          <div className="closet-grid">
            {filteredItems.map((item) => (
              <div className="item-card" key={item.id}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.style || item.name}
                    className="item-image"
                  />
                ) : (
                  <div
                    className="cloth-shape"
                    style={{
                      backgroundColor:
                        item.colorCode || item.color || "#D8D8D8",
                    }}
                  ></div>
                )}

                <div className="item-name">{item.style || item.name}</div>
              </div>
            ))}

            <label className="add-card">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={handleClosetPhotoUpload}
              />

              <div className="add-plus">＋</div>
              <div>{isUploading ? "분석 중..." : "사진 추가"}</div>
            </label>
          </div>
        </section>
      )}

      {activeScreen === "outfit" && (
        <section className="screen active">
          <div className="header">
            <div className="header-title">코디추천</div>
          </div>

          <div className="empty-screen">
            설문 결과와 날씨를 바탕으로
            <br />
            추천 코디 카드가 들어갈 자리입니다.
          </div>
        </section>
      )}

      {activeScreen !== "survey" && (
        <BottomTab
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
        />
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="info-row">
      <div className="info-icon">{icon}</div>
      <div className="info-label">{label}</div>
      <div className="info-value">{value}</div>
      <div className="arrow">〉</div>
    </div>
  );
}

function WeatherCard({ weather }) {
  const weatherStyle = {
    맑음: { icon: "🌳", bg: "#EAF8EE", color: "#2EAD5B" },
    비: { icon: "☔", bg: "#EAF4FF", color: "#4A90E2" },
    눈: { icon: "❄", bg: "#EEF8FF", color: "#68B7E8" },
    구름: { icon: "☁", bg: "#F2F0F1", color: "#999999" },
    바람: { icon: "💨", bg: "#EEF3F7", color: "#7A8FA6" },
    폭염: { icon: "☀", bg: "#FFF0E8", color: "#FF7A45" },
    일교차: { icon: "🧥", bg: "#FFF7D6", color: "#D99A00" },
  };

  const style = weatherStyle[weather.weather] || weatherStyle["구름"];

  return (
    <div className="weather-card" style={{ backgroundColor: style.bg }}>
      <div className="weather-icon" style={{ color: style.color }}>
        {style.icon}
      </div>

      <div>
        <div className="weather-main" style={{ color: style.color }}>
          {weather.weather} · {weather.temperature}
        </div>
        <div className="weather-desc">{weather.description}</div>
        <div className="weather-extra">{weather.extra}</div>
      </div>
    </div>
  );
}

function BottomTab({ activeScreen, setActiveScreen }) {
  return (
    <nav className="bottom-tab">
      <button
        className={activeScreen === "profile" ? "tab active" : "tab"}
        onClick={() => setActiveScreen("profile")}
      >
        <span className="tab-icon">●</span>
        <span>프로필</span>
      </button>

      <button
        className={activeScreen === "closet" ? "tab active" : "tab"}
        onClick={() => setActiveScreen("closet")}
      >
        <span className="tab-icon">▣</span>
        <span>옷장</span>
      </button>

      <button
        className={activeScreen === "outfit" ? "tab active" : "tab"}
        onClick={() => setActiveScreen("outfit")}
      >
        <span className="tab-icon">✦</span>
        <span>코디추천</span>
      </button>
    </nav>
  );
}

export default App;

async function handleClosetPhotoUpload(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  try {
    setIsUploading(true);

    const result = await uploadClosetPhoto(file);

    if (result.success) {
      setClosetItems((prevItems) => [...prevItems, result.item]);
      alert("옷이 자동 분석되어 옷장에 추가되었습니다.");
    } else {
      alert(result.message || "옷 추가에 실패했습니다.");
    }
  } catch (error) {
    console.error("옷 사진 업로드 실패:", error);
    alert(error.message);
  } finally {
    setIsUploading(false);
    event.target.value = "";
  }
}
