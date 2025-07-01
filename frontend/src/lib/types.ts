export type UserRole = "parent" | "child";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  parent?: string;
  coins?: number;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  approved: boolean;
  completedAt?: string;
  approvedAt?: string;
  child: string;
}

export interface Animal {
  _id: string;
  name: string;
  type: string;
  owner: string;
  level: number;
  experience: number;
  stats: {
    hunger: number;
    happiness: number;
    energy: number;
  };
  accessories: Array<{
    _id: string;
    type: "hat" | "collar" | "toy" | "bed" | "food";
    name: string;
    price: number;
    equipped: boolean;
  }>;
  lastFed: string;
  lastPlayed: string;
  lastSlept: string;
}
