import axios from 'axios';
import { supabase } from './supabase';
import { toast } from 'sonner';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Auth token
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export { apiClient };

// Streaming logic for AI Analysis
export async function analyzeResumeStream(
  id: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('No auth token found');
  }

  const response = await fetch(`/api/resumes/${id}/analyze/stream`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let accumulatedText = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6);
            if (!jsonStr.trim()) continue;

            const data = JSON.parse(jsonStr);
            if (data.text) {
              onChunk(data.text);
              accumulatedText += data.text;
            }
          } catch (e) {
            console.error('Error parsing SSE chunk', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Stream reading failed', error);
    throw error;
  } finally {
    reader.releaseLock();
  }

  return accumulatedText;
}
