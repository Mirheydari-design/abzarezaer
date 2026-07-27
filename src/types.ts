export interface ZiyaratService {
  id: string;
  name: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  tags: string[];
  embedding?: number[];
  emoji: string;
  gradient: string;
  type: string;
}

export interface Review {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}
