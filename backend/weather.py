# pip install requests
import requests

def get_today_weather_and_outfit(api_key, city="Seoul"):
    """
    OpenWeather API를 연동하여 날씨 정보와 코디 추천 멘트를 반환합니다.
    """
    # 1. API 요청 URL 세팅 (units=metric: 섭씨온도, lang=kr: 한국어)
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric&lang=kr"

    try:
        response = requests.get(url)
        response.raise_for_status() # 에러 발생 시 예외 처리
        data = response.json()

        # 2. 데이터 추출 (온도 및 날씨 상태)
        temp = round(data['main']['temp'])        # 현재 온도 (반올림해서 정수로)
        weather_main = data['weather'][0]['main'] # 날씨 상태 (Clear, Clouds, Rain 등)

        # 3. 날씨 상태를 한국어로 예쁘게 변환
        condition_kr = "맑음"
        if weather_main == "Clouds":
            condition_kr = "구름 많음"
        elif weather_main == "Rain":
            condition_kr = "비"
        elif weather_main == "Snow":
            condition_kr = "눈"

        # 4. 온도와 날씨에 따른 옷차림 추천 멘트 생성 (UI 디자인 반영)
        if weather_main in ["Rain", "Snow"]:
            message = "우산이나 우비를 꼭 챙기세요.\n비/눈에 젖지 않는 옷차림을 추천해요."
        elif temp >= 28:
            message = "햇볕이 뜨거운 무더운 날씨예요.\n시원하고 얇은 옷차림을 추천해요."
        elif 20 <= temp < 28:
            # 💡 디자인 시안에 있는 멘트!
            message = "오늘은 날씨가 좋아요.\n가벼운 옷차림과 산책하기 좋은 날이에요." 
        elif 10 <= temp < 20:
            message = "약간 쌀쌀할 수 있어요.\n입고 벗기 편한 가벼운 겉옷을 챙겨보세요."
        else:
            message = "꽤 추운 날씨예요.\n따뜻한 아우터와 방한용품을 꼭 챙기세요."

        # 5. 최종 결과 반환
        return {
            "title": f"{condition_kr} · {temp}°C",
            "message": message
        }

    except Exception as e:
        print(f"❌ 날씨 정보를 가져오는 데 실패했습니다: {e}")
        return None

# --- 실행 테스트 ---
if __name__ == "__main__":
    # 본인의 OpenWeather API 키를 여기에 넣으세요!
    MY_API_KEY = "e62c1806eb7b13df76cbdfb855dff027" 
    
    # 임시 테스트용 가짜 키를 넣으면 에러가 나니, 꼭 발급받은 키를 쓰셔야 합니다.
    weather_info = get_today_weather_and_outfit(MY_API_KEY)
    
    if weather_info:
        print("\n=== [프로필 화면: 오늘의 날씨] ===")
        print(f"🌱 {weather_info['title']}")
        print(f"{weather_info['message']}")
        print("==================================\n")