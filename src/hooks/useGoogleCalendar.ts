import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { CalendarStatus, disconnectCalendar, getCalendarStatus, sendAuthCode } from '../api/calendar';

// 브라우저 리디렉션 완료 처리
WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

type CalendarErrorCode =
  | 'EXPO_GO_UNSUPPORTED'
  | 'MISSING_CLIENT_ID'
  | 'REDIRECT_URI_MISMATCH'
  | 'ACCESS_DENIED'
  | 'CANCELLED'
  | 'NETWORK_ERROR'
  | 'BACKEND_UNREACHABLE'
  | 'SESSION_FAILED'
  | 'UNKNOWN';

const ERROR_MESSAGES: Record<CalendarErrorCode, string> = {
  EXPO_GO_UNSUPPORTED:
    'Expo Go에서는 Google 캘린더 연결을 지원하지 않아요. development build로 실행해주세요.',
  MISSING_CLIENT_ID:
    'Google Client ID가 설정되지 않았어요. .env의 EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID를 확인해주세요.',
  REDIRECT_URI_MISMATCH:
    'Redirect URI가 Google Cloud Console 설정과 일치하지 않아요. 등록된 리디렉션 URI를 확인해주세요.',
  ACCESS_DENIED: '구글 계정에서 캘린더 접근 권한이 거부되었어요.',
  CANCELLED: '캘린더 연결이 취소되었어요.',
  NETWORK_ERROR: '네트워크 연결이 불안정해요. 잠시 후 다시 시도해주세요.',
  BACKEND_UNREACHABLE:
    '서버에 연결할 수 없어요. 백엔드 서버 실행 상태와 EXPO_PUBLIC_API_URL을 확인해주세요.',
  SESSION_FAILED: '인증 세션을 완료하지 못했어요. 다시 시도해주세요.',
  UNKNOWN: '캘린더 연결 중 알 수 없는 오류가 발생했어요.',
};

function logAuthSessionError(context: string, error?: AuthSession.AuthError | null) {
  if (!error) {
    console.log(`[CALENDAR][${context}] error 정보 없음`);
    return;
  }
  console.log(`[CALENDAR][${context}] code=${error.code ?? 'unknown'} message=${error.message ?? ''}`);
}

function classifyAuthSessionError(error?: AuthSession.AuthError | null): CalendarErrorCode {
  const code = error?.code ?? '';
  const description = error?.description ?? error?.message ?? '';
  if (code === 'access_denied') return 'ACCESS_DENIED';
  if (code === 'redirect_uri_mismatch' || /redirect_uri_mismatch/i.test(description)) {
    return 'REDIRECT_URI_MISMATCH';
  }
  return 'SESSION_FAILED';
}

function classifyBackendError(context: string, err: unknown): CalendarErrorCode {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      const backendMessage = (err.response.data as { error?: string } | undefined)?.error ?? '';
      console.log(`[CALENDAR][${context}] status=${err.response.status} error=${backendMessage}`);
      if (/redirect_uri_mismatch/i.test(backendMessage)) {
        return 'REDIRECT_URI_MISMATCH';
      }
      return 'UNKNOWN';
    }
    if (err.code === 'ECONNABORTED') {
      console.log(`[CALENDAR][${context}] 요청 타임아웃`);
      return 'NETWORK_ERROR';
    }
    console.log(`[CALENDAR][${context}] 응답 없음 (code=${err.code ?? 'unknown'})`);
    return 'BACKEND_UNREACHABLE';
  }
  console.log(`[CALENDAR][${context}]`, err instanceof Error ? err.message : err);
  return 'UNKNOWN';
}

const useGoogleCalendar = () => {
  const CLIENT_ID = (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '').trim();

  const [status, setStatus] = useState<CalendarStatus>({ connected: false, email: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 플랫폼별 Redirect URI 안전 생성
  const redirectUri = Platform.OS === 'web'
    ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081'}/calendar-auth`
    : AuthSession.makeRedirectUri({
      scheme: 'myvffexpo',
      path: 'calendar-auth',
      native: 'myvffexpo://calendar-auth',
    });

  console.log('[CALENDAR] Client ID:', CLIENT_ID);
  console.log('[CALENDAR] Redirect URI:', redirectUri);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly', 'email', 'openid'],
      usePKCE: true,
      extraParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    discovery,
  );

  const refreshStatus = useCallback(async () => {
    try {
      const data = await getCalendarStatus();
      setStatus(data);
    } catch (err) {
      console.log('[CALENDAR][status]', err instanceof Error ? err.message : err);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const finishAuth = async () => {
      if (!response) return;

      if (response.type === 'error') {
        logAuthSessionError('oauth-error', response.error);
        setError(ERROR_MESSAGES[classifyAuthSessionError(response.error)]);
        return;
      }
      if (response.type === 'cancel' || response.type === 'dismiss') {
        console.log(`[CALENDAR][oauth] ${response.type}`);
        setError(ERROR_MESSAGES.CANCELLED);
        return;
      }
      if (response.type === 'success') {
        if (!response.params.code) {
          console.log('[CALENDAR][oauth] success 응답에 code 없음');
          setError(ERROR_MESSAGES.SESSION_FAILED);
          return;
        }
        setLoading(true);
        setError(null);
        try {
          await sendAuthCode(response.params.code, redirectUri, request?.codeVerifier);
          await refreshStatus();
        } catch (err) {
          setError(ERROR_MESSAGES[classifyBackendError('auth', err)]);
        }
        setLoading(false);
      }
    };
    finishAuth();
  }, [response, redirectUri, request?.codeVerifier, refreshStatus]);

  const connect = async () => {
    setError(null);

    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      console.log('[CALENDAR][connect] Expo Go에서 실행 중이라 진행할 수 없음');
      setError(ERROR_MESSAGES.EXPO_GO_UNSUPPORTED);
      return;
    }
    if (!CLIENT_ID) {
      console.log('[CALENDAR][connect] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID가 비어있음');
      setError(ERROR_MESSAGES.MISSING_CLIENT_ID);
      return;
    }

    try {
      await promptAsync();
    } catch (err) {
      console.log('[CALENDAR][connect] promptAsync 실패', err instanceof Error ? err.message : err);
      setError(ERROR_MESSAGES.SESSION_FAILED);
    }
  };

  const disconnect = async () => {
    setLoading(true);
    try {
      await disconnectCalendar();
      await refreshStatus();
    } catch (err) {
      setError(ERROR_MESSAGES[classifyBackendError('disconnect', err)]);
    }
    setLoading(false);
  };

  return { status, loading, error, connect, disconnect, canConnect: !!request };
};

export default useGoogleCalendar;