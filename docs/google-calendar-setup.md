# Google Calendar 연동 설정 가이드

옷 코디 챗봇이 사용자의 Google 캘린더 일정을 읽고 상황에 맞는 코디를 추천할 수 있도록 설정하는 방법입니다. 처음 해보는 분도 따라할 수 있도록 단계별로 정리했습니다.

## 1. Google Cloud 프로젝트 생성

1. https://console.cloud.google.com/ 접속 후 로그인
2. 상단의 프로젝트 선택 드롭다운 → **새 프로젝트** 클릭
3. 프로젝트 이름 입력(예: `myvff-calendar`) 후 생성

## 2. Google Calendar API 활성화

1. 좌측 메뉴에서 **API 및 서비스 → 라이브러리** 이동
2. "Google Calendar API" 검색 후 클릭 → **사용 설정**

## 3. OAuth 동의 화면 설정

1. **API 및 서비스 → OAuth 동의 화면** 이동
2. User Type: **외부(External)** 선택
3. 앱 이름, 지원 이메일 등 필수 정보 입력
4. **범위(Scopes)** 단계에서 아래 스코프만 추가합니다(읽기 전용, 그 이상 요청하지 않음):
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `email`
5. **테스트 사용자** 단계에서 실제 로그인 테스트에 사용할 본인 Google 계정 이메일을 추가합니다.
   (앱이 "게시됨" 상태로 검수받기 전까지는 여기 등록된 계정만 로그인할 수 있습니다.)

## 4. OAuth Client ID 발급

**API 및 서비스 → 사용자 인증 정보 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID** 에서 아래 3개를 각각 만듭니다.

- **웹 애플리케이션(Web application)** — 토큰 교환을 담당하는 백엔드용. 여기서 발급되는 Client ID/Secret이 실제로 사용됩니다.
  - **승인된 리디렉션 URI**에 아래에서 정할 `GOOGLE_REDIRECT_URI` 값을 등록 (예: `http://<컴퓨터 IP>:5001/api/calendar/auth/callback` 또는 앱 스킴 기반 URI — 아래 6번 참고)
- **Android** — 패키지 이름과 SHA-1 서명 인증서 지문 필요(개발 중에는 `expo credentials:manager` 또는 `eas credentials`로 확인 가능)
- **iOS** — Bundle Identifier 필요 (`app.json`의 `ios.bundleIdentifier`, 현재 미설정 시 추가 필요)

> 이 프로젝트는 토큰 교환을 **백엔드에서만** 수행하므로(Client Secret을 앱에 넣지 않기 위해) 실제로 꼭 필요한 것은 **웹 클라이언트 ID + 시크릿**입니다. Android/iOS Client ID는 네이티브 앱에서 시스템 로그인 화면을 띄우는 용도로 함께 등록해 두면 이후 development build 전환 시 바로 쓸 수 있습니다.

## 5. 환경변수 입력

프로젝트 루트에 `.env` 파일을 만들고(`\.env.example` 참고):

```
EXPO_PUBLIC_API_URL=http://<컴퓨터 IP>:5001
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<웹 클라이언트 ID>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<Android 클라이언트 ID>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<iOS 클라이언트 ID>
```

`backend/.env` 파일을 만들고(`backend/.env.example` 참고):

```
GROQ_API_KEY=<기존에 쓰던 값>
HF_TOKEN=<기존에 쓰던 값>
GOOGLE_WEB_CLIENT_ID=<웹 클라이언트 ID, 위와 동일한 값>
GOOGLE_CLIENT_SECRET=<웹 클라이언트 Secret>
GOOGLE_REDIRECT_URI=<4번에서 등록한 리디렉션 URI>
```

**Client Secret은 반드시 `backend/.env`에만 넣습니다.** 프런트엔드 코드나 `EXPO_PUBLIC_` 접두사가 붙은 변수에는 절대 넣지 마세요. `.env` 파일들은 Git에 커밋되지 않습니다(`.gitignore`에 이미 포함됨) — `.env.example`만 저장소에 유지됩니다.

## 6. localhost 대신 컴퓨터 IP 사용하기

휴대폰(Expo Go 또는 development build)은 `localhost`로 컴퓨터의 Flask 서버에 접근할 수 없습니다. 컴퓨터와 휴대폰이 같은 Wi-Fi에 연결된 상태에서:

- Windows: `ipconfig` 실행 → "IPv4 주소" 확인 (예: `192.168.0.10`)
- 위에서 만든 `EXPO_PUBLIC_API_URL`, `GOOGLE_REDIRECT_URI`에 이 IP를 사용

## 7. 데이터베이스 테이블 생성 (최초 1회)

```bash
cd backend
python make_calendar_db.py
```

기존 `make_bookmark_db.py`, `make_chat_room_db.py`와 마찬가지로 서버 시작 시 자동 실행되지 않으므로 최초 1회 수동으로 실행해야 합니다.

## 8. 백엔드 실행

```bash
cd backend
python app.py
```

`http://<컴퓨터 IP>:5001/api/calendar/status` 접속 시 `{"connected": false, "email": null}`이 보이면 정상입니다.

## 9. Expo 앱 실행

```bash
npx expo start
```

## 10. ⚠️ Expo Go의 제약 — development build가 필요한 이유

Google OAuth는 로그인 후 앱으로 다시 돌아오는 "리디렉션"이 필요합니다. Expo Go는 세션마다 임시 URL(`exp://...`)을 사용하기 때문에 Google Cloud Console에 고정된 리디렉션 URI로 등록할 수 없어, **Expo Go에서는 실제 로그인이 완료되지 않습니다.**

실제 로그인 테스트를 하려면 이 앱만의 고정 스킴(`myvffexpo://`)을 가진 **development build**가 필요합니다:

```bash
npx expo run:android
# 또는
npx expo run:ios
```

혹은 EAS를 쓴다면:

```bash
eas build --profile development --platform android
```

development build를 설치한 뒤에는 Expo Go 대신 이 앱으로 `npx expo start`에 접속해서 테스트합니다.

## 11. 휴대폰에서 로그인/연결 테스트

1. 앱 실행 → **프로필** 탭 → "Google 캘린더 연동" 섹션
2. "Google 캘린더 연결하기" 버튼 탭
3. 3번에서 테스트 사용자로 등록한 Google 계정으로 로그인, 읽기 전용 캘린더 권한 허용
4. 연결된 이메일이 화면에 표시되는지 확인
5. "연결 해제" 버튼으로 정상적으로 연결이 끊기는지 확인

## 12. 일정 기반 코디 추천 테스트

**코디추천** 탭에서 아래 문장들로 테스트합니다:

- "오늘 뭐 입을까?"
- "오늘 일정에 맞춰 코디 추천해줘"
- "내일 뭐 입지?"
- (일정이 모호한 경우) 챗봇이 되묻는 질문에 "실내야", "많이 걸어" 등으로 답해 후속 대화가 이어지는지 확인
- 캘린더 미연결 상태에서 위 문장을 물어보면 연결을 안내하는 메시지가 나오는지 확인
- 오늘 일정이 없는 상태에서 물어보면 "등록된 일정이 없다"는 안내가 나오는지 확인

## 13. 자주 발생하는 오류

| 증상 | 원인 / 해결 |
|---|---|
| `redirect_uri_mismatch` | Google Cloud Console에 등록한 리디렉션 URI와 `GOOGLE_REDIRECT_URI`(백엔드) / 앱이 실제로 보내는 값이 정확히 일치하는지 확인 |
| Expo Go에서 로그인 버튼을 눌러도 반응이 없거나 로그인 후 앱으로 돌아오지 않음 | 10번 항목 참고 — development build 필요 |
| "이 앱은 확인되지 않았습니다" 경고 | 정상입니다(OAuth 동의 화면이 아직 게시 전 테스트 상태). 테스트 사용자로 로그인 중이면 "고급 → 이동" 눌러 계속 진행 가능 |
| `/api/calendar/status`가 항상 미연결로 나옴 | `make_calendar_db.py`를 실행했는지, `codi_v2.db`가 백엔드와 같은 작업 디렉터리에 있는지 확인 |
| 토큰 만료 후 일정이 안 불러와짐 | 최초 로그인 시 Google이 refresh_token을 내려주지 않는 경우가 있습니다. Google 계정 설정에서 이 앱에 대한 접근 권한을 해제한 뒤 다시 연결해보세요(`prompt=consent`가 강제로 재동의를 요청합니다) |
| 휴대폰에서 서버에 연결이 안 됨 | `EXPO_PUBLIC_API_URL`이 `localhost`가 아닌 컴퓨터의 실제 IP인지, 컴퓨터와 휴대폰이 같은 Wi-Fi인지, 방화벽이 5001 포트를 막고 있지 않은지 확인 |

## 참고: 알려진 제약사항

- 대화 기록과 마찬가지로 일정 추천 진행 상태(`schedule_context`)는 서버 메모리에만 저장되며, 백엔드 재시작 시 초기화됩니다.
- 사용자 구분은 이 프로젝트의 기존 방식과 동일하게 하드코딩된 단일 사용자(`su_ryong`)를 기준으로 동작합니다. 실제 다중 사용자 로그인 시스템은 이번 기능 범위에 포함되지 않습니다.
