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
  'https://pub-c6abaec6093d4c5284782aa8c4d38477.r2.dev';

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

export interface TestOrderRequest {
  customerId?: string | null;
  customerName: string;
  email: string;
  phone?: string;
  shippingAddress: {
    address1: string;
    address2?: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  items: Array<{ productId: number; quantity: number }>;
  discountCode?: string | null;
}

export interface TestOrderResponse {
  orderId: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  paymentStatus: 'Test';
  orderStatus: string;
  createdAt: string;
}

export interface OrderHistoryItem {
  id: number;
  productId: number;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderHistoryEntry {
  Id: string;
  CustomerName: string;
  Email: string;
  Subtotal: number;
  DiscountCode: string | null;
  DiscountAmount: number;
  Total: number;
  PaymentStatus: string;
  OrderStatus: string;
  CreatedAt: string;
  OrderItems: Array<{
    Id: number;
    ProductId: number;
    ProductTitle: string;
    UnitPrice: number;
    Quantity: number;
    LineTotal: number;
  }>;
}

export const createTestOrder = async (
  order: TestOrderRequest,
  accessToken?: string | null,
): Promise<TestOrderResponse> => {
  const response = await api.post<TestOrderResponse>('/orders', order, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  return response.data;
};

export const getOrderHistory = async (
  accessToken: string,
): Promise<OrderHistoryEntry[]> => {
  const response = await api.get<OrderHistoryEntry[]>('/orders', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
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
