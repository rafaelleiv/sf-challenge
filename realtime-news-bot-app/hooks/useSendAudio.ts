import { useMutation } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';

interface SendAudioResponse {
  message: string;
}

interface FileData {
  uri: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_REALTIME_NEWS_API;

export const useSendAudio = (
  onSuccess: (data: SendAudioResponse) => void,
  onError: (error: Error) => void
) => {
  return useMutation<SendAudioResponse, Error, FileData>({
    mutationFn: async (file: FileData) => {
      if (!file || !file.uri) {
        throw new Error('Invalid audio file');
      }
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: 'audio/wav',
        name: 'audio.wav',
      } as any);

      const response: AxiosResponse<SendAudioResponse> = await axios.post(
        `${API_BASE_URL}/realtime/audio`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    },
    onSuccess,
    onError,
  });
};
