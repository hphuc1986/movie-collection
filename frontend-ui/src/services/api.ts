import axios from 'axios';

export interface Movie {
  id: number;
  title: string;
  releaseYear?: number;
  format?: string;
  rating?: number;
  createdAt: string;
  frontCover?: string | null;
  backCover?: string | null;
}

const R2_MEDIA_BASE_URL =
  'https://f362c2cdf6eaef06c0ffd247f1a99967.r2.cloudflarestorage.com/media';

export const getCoverImageUrl = (fileName?: string | null): string | undefined => {
  const normalizedFileName = fileName?.trim();
  if (!normalizedFileName) return undefined;

  return `${R2_MEDIA_BASE_URL}/${encodeURIComponent(normalizedFileName)}`;
};

// Points directly to your secure .NET local server port we verified earlier
const api = axios.create({
  baseURL: 'https://backend-worker.hphuc86.workers.dev/api',
  //baseURL: 'http://localhost:8787',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getMovies = async (): Promise<Movie[]> => {
  const response = await api.get<Movie[]>('/movies');
  return response.data;
};

// Add these parameters to frontend-ui/src/services/api.ts

export const registerUser = async (email: string, password: string, fullName: string) => {
  const response = await api.post('/auth/register', { email, password, fullName });
  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // Contains your critical token payload
};

export const registerGuestUser = async (fullName: string) => {
  const response = await api.post('/auth/guest', { fullName });
  return response.data;
};
