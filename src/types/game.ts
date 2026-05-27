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
