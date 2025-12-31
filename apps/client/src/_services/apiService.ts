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

  async deleteResume(id: string): Promise<void> {
    await apiClient.delete(`/resumes/${id}`);
  },
};
