export interface Tier {
  min: number;
  max: number;
  name: string;
  color: string;
  soft: string;
  characterImage: string;
}

export interface Badge {
  id: string;
  name: string;
  category: 'attendance' | 'explore' | 'quiz' | 'social' | 'special';
  description: string;
  condition: string;
  earned: boolean;
  earnedAt?: string;
}

export interface UserGame {
  /** 서버 닉네임 (/api/users/game 의 user_game.nickname) */
  name: string;
  /** 네이버 프로필 이미지 URL (없으면 티어 캐릭터로 폴백) */
  profileImageUrl?: string | null;
  level: number;
  xp: number;
  streak: number;
  dailyGoal: number;
  dailyProgress: number;
  scrapped: string[];
  completedQuizzes: string[];
  badges: Badge[];
  following: number;
  totalNodesExplored: number;
  totalQuizzesSolved: number;
}

export interface RankingEntry {
  rank: number;
  name: string;
  avatar: string;
  level: number;
  weekXp: number;
  persona?: string;
  isMe?: boolean;
}

export interface ReceiptData {
  date: string;
  username: string;
  synapseFrom: string;
  synapseTo: string;
  serial: string;
}

// 친구/검색 유저 — UI 모델 (서버 raw는 friend.ts 에서 정규화)
export interface FriendProfile {
  user_id: number;
  nickname: string;
  level: number;
  persona?: string;
  profileImageUrl?: string | null;
}
