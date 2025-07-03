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
  category: string;
  completed: boolean;
  approved: boolean;
  completedAt?: string;
  approvedAt?: string;
  createdAt: string;
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

export interface ShopItem {
  id: string;
  name: string;
  image: string;
  type: "food" | "toy" | "energy" | "accessory";
  slot?: "head" | "body" | "eyes" ;

  price: number;
  category?: string;
  description?: string;
}

export interface PurchasedItem extends ShopItem {
  quantity: number;
  purchasedAt: string;
}
