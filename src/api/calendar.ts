import client from './client';

export type CalendarStatus = {
  connected: boolean;
  email: string | null;
};

export const getCalendarStatus = async (): Promise<CalendarStatus> => {
  const response = await client.get('/api/calendar/status');
  return response.data;
};

export const sendAuthCode = async (
  code: string,
  redirectUri: string,
  codeVerifier?: string,
) => {
  const response = await client.post('/api/calendar/auth/google', {
    code,
    redirectUri,
    codeVerifier,
  });
  return response.data;
};

export const disconnectCalendar = async () => {
  const response = await client.post('/api/calendar/disconnect');
  return response.data;
};
