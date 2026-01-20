import axios from 'axios';
import { supabase } from '../_utils/supabaseClient';
import type { UpdateUserDto } from '@/types/user';
import type { Resume } from '@/types/resume';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: '/api', // Vite proxy should handle this to http://localhost:3000
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

export const apiService = {
  async getPrivateMessage() {
    const response = await apiClient.get('/private');
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  async updateProfile(data: UpdateUserDto) {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },

  async getAllResumes(): Promise<Resume[]> {
    const response = await apiClient.get<Resume[]>('/resumes');
    return response.data;
  },

  async getResumeById(id: string): Promise<Resume> {
    const response = await apiClient.get<Resume>(`/resumes/${id}`);
    return response.data;
  },

  async createResume(title: string = 'Untitled Resume'): Promise<Resume> {
    const response = await apiClient.post<Resume>('/resumes', { title });
    return response.data;
  },

  async updateResume(id: string, data: Partial<Resume>): Promise<Resume> {
    const response = await apiClient.patch<Resume>(`/resumes/${id}`, data);
    return response.data;
  },

  async analyzeResume(id: string): Promise<Resume> {
    const response = await apiClient.post<Resume>(`/resumes/${id}/analyze`);
    return response.data;
  },

  async analyzeResumeStream(
    id: string,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
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
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
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
    return accumulatedText;
  },

  async deleteResume(id: string): Promise<void> {
    await apiClient.delete(`/resumes/${id}`);
  },
};
