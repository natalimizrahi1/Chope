import { Task, Animal, UserRole, User } from "./types";

const API_BASE_URL = "http://localhost:5001/api";

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error ${response.status}:`, errorText);

    // Try to parse as JSON for better error messages
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.message || `HTTP ${response.status}: ${errorText}`);
    } catch {
      // If not JSON, throw the raw text
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }

  return response.json();
};

// Helper function to make authenticated API calls
const authenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  return handleResponse(response);
};

// Auth API functions
export const login = async (email: string, password: string, role: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, role }),
  });

  return handleResponse(response);
};

export const register = async (userData: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
};

// Task API functions
export const getTasks = async (token: string, childId: string) => {
  console.log("=== API: GETTING TASKS ===");
  console.log("Child ID:", childId);
  console.log("Token:", token ? "Present" : "Missing");

  const response = await fetch(`${API_BASE_URL}/task/child/${childId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("API response status:", response.status);

  const result = await handleResponse(response);
  console.log("API: Tasks loaded successfully:", result);
  console.log("=== API: GETTING TASKS COMPLETE ===");
  return result;
};

export const completeTask = async (token: string, taskId: string) => {
  const response = await fetch(`${API_BASE_URL}/task/${taskId}/complete`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

export const approveTask = async (token: string, taskId: string) => {
  console.log("=== API: APPROVING TASK ===");
  console.log("Task ID:", taskId);
  console.log("Token:", token ? "Present" : "Missing");

  const response = await fetch(`${API_BASE_URL}/task/${taskId}/approve`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("API response status:", response.status);

  const result = await handleResponse(response);
  console.log("API: Task approved successfully:", result);
  console.log("=== API: APPROVING TASK COMPLETE ===");
  return result;
};

export const rejectTask = async (token: string, taskId: string) => {
  const response = await fetch(`${API_BASE_URL}/task/${taskId}/reject`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

export const undoTask = async (token: string, taskId: string) => {
  const response = await fetch(`${API_BASE_URL}/task/${taskId}/undo`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

export const unapproveTask = async (token: string, taskId: string) => {
  const response = await fetch(`${API_BASE_URL}/task/${taskId}/unapprove`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

export const deleteTask = async (token: string, taskId: string) => {
  const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await handleResponse(response);

  return result;
};

// Parent API functions
export const getChildren = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/parent/children`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

export const getChildTasks = async (token: string, childId: string) => {
  const response = await fetch(`${API_BASE_URL}/parent/children/${childId}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

// Coins API functions
export const getChildCoins = async (token: string, childId: string) => {
  console.log("=== API: GETTING CHILD COINS ===");
  console.log("Child ID:", childId);
  console.log("Token:", token ? "Present" : "Missing");

  const response = await fetch(`${API_BASE_URL}/parent/child/${childId}/coins`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("API response status:", response.status);

  const result = await handleResponse(response);
  console.log("API: Child coins loaded successfully:", result);
  console.log("=== API: GETTING CHILD COINS COMPLETE ===");
  return result;
};

// Animal API functions
export const getAnimals = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/animals`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

export const adoptAnimal = async (token: string, animalId: string) => {
  const response = await fetch(`${API_BASE_URL}/animals/${animalId}/adopt`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

// Test server connectivity
export async function testServerConnection() {
  try {
    console.log("Testing server connection...");
    const response = await fetch("http://localhost:5001/test");
    const data = await response.json();
    console.log("Server test response:", data);
    return data;
  } catch (error) {
    console.error("Server connection test failed:", error);
    return null;
  }
}

export async function getChildProgress(token: string, childId: string) {
  const res = await fetch(`${API_BASE_URL}/parent/child/${childId}/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch progress");
  return res.json();
}

export async function createTask(token: string, data: { title: string; description: string; reward: number; child: string }) {
  console.log("=== API: CREATING TASK ===");
  console.log("Task data:", data);
  console.log("Token:", token ? "Present" : "Missing");

  const res = await fetch(`${API_BASE_URL}/task`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

  console.log("API response status:", res.status);

  if (!res.ok) {
    const errorData = await res.json();
    console.error("API: Task creation failed:", errorData);
    throw new Error(errorData.error || "Failed to create task");
  }

  const result = await res.json();
  console.log("API: Task created successfully:", result);
  console.log("=== API: TASK CREATION COMPLETE ===");
  return result;
}

export async function getAnimal(token: string, childId: string) {
  const res = await fetch(`${API_BASE_URL}/animals/child/${childId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to fetch animal");
  return res.json();
}

export async function feedAnimal(token: string, animalId: string) {
  const res = await fetch(`${API_BASE_URL}/animals/${animalId}/feed`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to feed animal");
  return res.json();
}

export async function playWithAnimal(token: string, animalId: string) {
  const res = await fetch(`${API_BASE_URL}/animals/${animalId}/play`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to play with animal");
  return res.json();
}

export async function letAnimalSleep(token: string, animalId: string) {
  const res = await fetch(`${API_BASE_URL}/animals/${animalId}/sleep`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to let animal sleep");
  return res.json();
}

export async function buyAccessory(token: string, animalId: string, data: { type: string; name: string; price: number }) {
  const res = await fetch(`${API_BASE_URL}/animals/${animalId}/accessories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to buy accessory");
  return res.json();
}

export async function toggleAccessory(token: string, animalId: string, accessoryId: string) {
  const res = await fetch(`${API_BASE_URL}/animals/${animalId}/accessories/${accessoryId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to toggle accessory");
  return res.json();
}

export async function equipAccessory(token: string, animalId: string, accessoryId: string) {
  const res = await fetch(`${API_BASE_URL}/animals/${animalId}/accessories/${accessoryId}/equip`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to equip accessory");
  return res.json();
}

export async function getChildById(token: string, childId: string) {
  console.log("API: Getting child by ID", childId);
  const res = await fetch(`${API_BASE_URL}/parent/child/${childId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json();
    console.error("API: Error response:", errorData);
    throw new Error(errorData.error || "Failed to fetch child");
  }
  const result = await res.json();
  console.log("API: Success response:", result);
  return result;
}
