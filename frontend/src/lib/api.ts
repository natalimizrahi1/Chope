// API utility for backend communication
export type UserRole = 'parent' | 'child';
export type User = { id: string; name: string; role: UserRole; email?: string; parent?: string; coins?: number };
export type Task = { _id: string; title: string; description: string; reward: number; completed: boolean; child: string };
export type Animal = { _id: string; type: string; name: string; owner: string; level: number; lastFed: string };

const API = 'http://localhost:5001/api';

export async function register(data: { role: UserRole; name: string; email: string; password: string; parentId?: string }) {
  console.log('Registering with data:', data);
  const endpoint = data.role === 'parent' ? '/auth/register/parent' : '/auth/register/child';
  const url = `${API}${endpoint}`;
  console.log('Sending request to:', url);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      ...(data.role === 'child' && data.parentId ? { parentId: data.parentId } : {})
    }),
  });
  
  const responseData = await res.json();
  console.log('Registration response:', responseData);
  
  if (!res.ok) throw new Error(responseData.error || 'Registration failed');
  return responseData;
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
  return res.json();
}

export async function getChildren(token: string) {
  const res = await fetch(`${API}/parent/children`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch children');
  return res.json();
}

export async function getChildProgress(token: string, childId: string) {
  const res = await fetch(`${API}/parent/child/${childId}/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch progress');
  return res.json();
}

export async function createTask(token: string, data: { title: string; description: string; reward: number; child: string }) {
  const res = await fetch(`${API}/task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create task');
  return res.json();
}

export async function getTasks(token: string, childId: string) {
  const res = await fetch(`${API}/task/child/${childId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch tasks');
  return res.json();
}

export async function completeTask(token: string, taskId: string) {
  const res = await fetch(`${API}/task/${taskId}/complete`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to complete task');
  return res.json();
}

export async function getAnimal(token: string, childId: string) {
  const res = await fetch(`${API}/animal/child/${childId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch animal');
  return res.json();
}

export async function feedAnimal(token: string, animalId: string) {
  const res = await fetch(`${API}/animal/${animalId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'feed' }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to feed animal');
  return res.json();
}

export async function createAnimal(token: string, data: { type: string; name: string; owner: string }) {
  const res = await fetch(`${API}/animal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create animal');
  return res.json();
} 