import { useMutation } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';

interface SendTextResponse {
  message: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_REALTIME_NEWS_API;

export const useSendText = (
  onSuccess: (data: SendTextResponse) => void,
  onError: (error: Error) => void
) => {
  return useMutation<SendTextResponse, Error, string>({
    mutationFn: async (text: string) => {
      if (!text.trim()) {
        throw new Error('Text cannot be empty');
      }
      const response: AxiosResponse<SendTextResponse> = await axios.post(
        `${API_BASE_URL}/realtime/text`,
        { text }
      );
      return response.data;
    },
    onSuccess,
    onError,
  });
};
