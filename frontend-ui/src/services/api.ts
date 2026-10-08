import axios from 'axios';

export interface Movie {
  id: number;
  title: string;
  releaseYear?: number;
  format?: string;
  rating?: number;
  createdAt: string;
}

// Points directly to your secure .NET local server port we verified earlier
const api = axios.create({
  baseURL: 'https://backend-worker.hphuc86.workers.dev',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getMovies = async (): Promise<Movie[]> => {
  const response = await api.get<Movie[]>('/Movie');
  return response.data;
};
