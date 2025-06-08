import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trophy, Star, Gift } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import VirtualPet, { Stat, Accessory } from '../pet/VirtualPet';
import PetShop, { ShopItem } from '../pet/PetShop';
import Inventory, { InventoryItem } from '../pet/Inventory';

const mockTasks = [
  { id: '1', title: 'Do homework', description: 'Math and English', completed: true, reward: 10 },
  { id: '2', title: 'Clean room', description: 'Tidy your bed and floor', completed: false, reward: 15 },
];

export default function KidDashboard() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState(100);
  const [tasks, setTasks] = useState(mockTasks);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [animal, setAnimal] = useState({
    name: 'Buddy',
    type: 'dog',
    level: 1,
    xp: 0,
    stats: { hunger: 70, happiness: 60, energy: 80 } as Stat,
    accessories: [] as Accessory[],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimal(prev => ({
        ...prev,
        stats: {
          hunger: Math.max(0, prev.stats.hunger - 1),
          happiness: Math.max(0, prev.stats.happiness - 0.5),
          energy: Math.max(0, prev.stats.energy - 0.2),
        },
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCompleteTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: true } : task
      )
    );
    const reward = tasks.find(t => t.id === id)?.reward || 0;
    setCoins(prev => prev + reward);
  };

  const handleFeed = () => {
    setAnimal(prev => ({
      ...prev,
      stats: { ...prev.stats, hunger: Math.min(100, prev.stats.hunger + 10) },
      xp: prev.xp + 10,
      level: Math.floor((prev.xp + 10) / 100) + 1,
    }));
  };

  const handlePlay = () => {
    setAnimal(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        happiness: Math.min(100, prev.stats.happiness + 10),
        energy: Math.max(0, prev.stats.energy - 5),
      },
      xp: prev.xp + 10,
      level: Math.floor((prev.xp + 10) / 100) + 1,
    }));
  };

  const handleSleep = () => {
    setAnimal(prev => ({
      ...prev,
      stats: { ...prev.stats, energy: 100 },
    }));
  };

  const handleBuy = (item: ShopItem) => {
    if (coins < item.price) return;
    setCoins(coins - item.price);
    if (item.effect) {
      setAnimal(prev => ({
        ...prev,
        stats: {
          hunger: Math.min(100, prev.stats.hunger + (item.effect?.hunger || 0)),
          happiness: Math.min(100, prev.stats.happiness + (item.effect?.happiness || 0)),
          energy: Math.min(100, prev.stats.energy + (item.effect?.energy || 0)),
        },
        xp: prev.xp + 5,
        level: Math.floor((prev.xp + 5) / 100) + 1,
      }));
    } else {
      setInventory(prev => [...prev, { id: item.id, name: item.name, image: item.image, type: item.type as 'hat' | 'shirt' }]);
    }
  };

  const handleEquip = (item: InventoryItem) => {
    setAnimal(prev => ({
      ...prev,
      accessories: [...prev.accessories.filter(a => a.type !== item.type), item],
    }));
  };

  const shopItems: ShopItem[] = [
    { id: 'banana', name: 'Banana', price: 10, type: 'food', effect: { hunger: +20 }, image: '/images/shop/banana.png' },
    { id: 'ball', name: 'Ball', price: 15, type: 'toy', effect: { happiness: +20 }, image: '/images/shop/ball.png' },
    { id: 'hat1', name: 'Red Hat', price: 25, type: 'hat', image: '/images/shop/hats/hat1.png' },
    { id: 'shirt1', name: 'Blue Shirt', price: 30, type: 'shirt', image: '/images/shop/shirts/shirt1.png' },
  ];

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const taskCoins = tasks.reduce((sum, t) => sum + (t.completed ? t.reward : 0), 0);

  return (
    <div className="grid gap-6 p-6 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-pink-600 drop-shadow">Kid Dashboard</h1>
        <Button variant="ghost" size="icon" onClick={() => navigate('/login')}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex justify-between"><CardTitle>Total Tasks</CardTitle><Trophy className="h-4 w-4"/></CardHeader><CardContent><div className="text-2xl font-bold">{totalTasks}</div><p className="text-xs">{completedTasks} completed</p></CardContent></Card>
        <Card><CardHeader className="flex justify-between"><CardTitle>Progress</CardTitle><Star className="h-4 w-4"/></CardHeader><CardContent><div className="text-2xl font-bold">{Math.round(taskProgress)}%</div><Progress value={taskProgress} className="mt-2" /></CardContent></Card>
        <Card><CardHeader className="flex justify-between"><CardTitle>Coins Earned</CardTitle><Gift className="h-4 w-4"/></CardHeader><CardContent><div className="text-2xl font-bold">{taskCoins}</div><p className="text-xs">From completed tasks</p></CardContent></Card>
      </div>

      {/* 🧾 Task List */}
      <Card>
        <CardHeader><CardTitle>My Tasks</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="bg-yellow-50 hover:bg-yellow-100 transition-all">
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
                <CardDescription>{task.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{task.reward} coins</Badge>
                  <Button
                    variant={task.completed ? 'secondary' : 'default'}
                    disabled={task.completed}
                    onClick={() => handleCompleteTask(task.id)}
                  >
                    {task.completed ? 'Completed' : 'Complete Task'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>My Pet</CardTitle></CardHeader><CardContent><VirtualPet animal={animal} onFeed={handleFeed} onPlay={handlePlay} onSleep={handleSleep} /></CardContent></Card>

      <Card><CardHeader><CardTitle>Pet Shop</CardTitle><CardDescription>You have {coins} coins</CardDescription></CardHeader><CardContent><PetShop items={shopItems} coins={coins} onBuy={handleBuy} /></CardContent></Card>

      <Card><CardHeader><CardTitle>Inventory</CardTitle></CardHeader><CardContent><Inventory items={inventory} onEquip={handleEquip} /></CardContent></Card>
    </div>
  );
}
