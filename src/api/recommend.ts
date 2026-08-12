import client from './client';

export const analyzeImage = async (
  userId: string,
  imagePath: string,
) => {
  const response = await client.post(
    '/analyze',
    {
      user_id: userId,
      image_path: imagePath,
    },
  );

  return response.data;
};