import { useState } from "react";
// import {
//   Book, Dog, LogOut, Trophy, Star, Gift, ShoppingCart, UserCircle
// } from 'lucide-react';
// import {
//   Card, CardContent, CardDescription, CardHeader, CardTitle
// } from '../ui/card';
// import { Progress } from '../ui/progress';
// import { Button } from '../ui/button';
// import { Badge } from '../ui/badge';
// import { useNavigate } from 'react-router-dom';
// import { useEffect } from 'react';
import VirtualPet from "../pet/VirtualPet";
// import PetShop, { ShopItem } from '../pet/PetShop';
// import Inventory, { InventoryItem } from '../pet/Inventory';
// import { Stat, Accessory } from '../pet/VirtualPet';

const mockTasks = [
  { id: "1", title: "Do homework", description: "Math and English", completed: true, reward: 10 },
  { id: "2", title: "Clean room", description: "Tidy your bed and floor", completed: false, reward: 15 },
];

// export default function KidDashboard() {
//   const navigate = useNavigate();
//   const [coins, setCoins] = useState(100);
//   const [tasks, setTasks] = useState(mockTasks);
//   const [inventory, setInventory] = useState<InventoryItem[]>([]);
//   const [animal, setAnimal] = useState({
//     name: 'Buddy',
//     type: 'dog',
//     level: 1,
//     xp: 0,
//     stats: { hunger: 70, happiness: 60, energy: 80 } as Stat,
//     accessories: [] as Accessory[],
//   });

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setAnimal(prev => ({
//         ...prev,
//         stats: {
//           hunger: Math.max(0, prev.stats.hunger - 1),
//           happiness: Math.max(0, prev.stats.happiness - 0.5),
//           energy: Math.max(0, prev.stats.energy - 0.2),
//         },
//       }));
//     }, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const completedTasks = tasks.filter(t => t.completed).length;
//   const totalTasks = tasks.length;
//   const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
//   const taskCoins = tasks.reduce((sum, t) => sum + (t.completed ? t.reward : 0), 0);

//   const shopItems: ShopItem[] = [
//     { id: 'banana', name: 'Banana', price: 10, type: 'food', effect: { hunger: +20 }, image: '/images/shop/banana.png' },
//     { id: 'ball', name: 'Ball', price: 15, type: 'toy', effect: { happiness: +20 }, image: '/images/shop/ball.png' },
//     { id: 'hat1', name: 'Red Hat', price: 25, type: 'hat', image: '/images/shop/hats/hat1.png' },
//     { id: 'shirt1', name: 'Blue Shirt', price: 30, type: 'shirt', image: '/images/shop/shirts/shirt1.png' },
//   ];

//   const handleCompleteTask = (id: string) => {
//     setTasks(prev =>
//       prev.map(task => task.id === id ? { ...task, completed: true } : task)
//     );
//     const reward = tasks.find(t => t.id === id)?.reward || 0;
//     setCoins(prev => prev + reward);
//   };

//   const handleFeed = () => {
//     setAnimal(prev => ({
//       ...prev,
//       stats: { ...prev.stats, hunger: Math.min(100, prev.stats.hunger + 10) },
//       xp: prev.xp + 10,
//       level: Math.floor((prev.xp + 10) / 100) + 1,
//     }));
//   };

//   const handlePlay = () => {
//     setAnimal(prev => ({
//       ...prev,
//       stats: {
//         ...prev.stats,
//         happiness: Math.min(100, prev.stats.happiness + 10),
//         energy: Math.max(0, prev.stats.energy - 5),
//       },
//       xp: prev.xp + 10,
//       level: Math.floor((prev.xp + 10) / 100) + 1,
//     }));
//   };

//   const handleSleep = () => {
//     setAnimal(prev => ({
//       ...prev,
//       stats: { ...prev.stats, energy: 100 },
//     }));
//   };

//   const handleBuy = (item: ShopItem) => {
//     if (coins < item.price) return;
//     setCoins(coins - item.price);
//     if (item.effect) {
//       setAnimal(prev => ({
//         ...prev,
//         stats: {
//           hunger: Math.min(100, prev.stats.hunger + (item.effect?.hunger || 0)),
//           happiness: Math.min(100, prev.stats.happiness + (item.effect?.happiness || 0)),
//           energy: Math.min(100, prev.stats.energy + (item.effect?.energy || 0)),
//         },
//         xp: prev.xp + 5,
//         level: Math.floor((prev.xp + 5) / 100) + 1,
//       }));
//     } else {
//       setInventory(prev => [...prev, { id: item.id, name: item.name, image: item.image, type: item.type as 'hat' | 'shirt' }]);
//     }
//   };

//   const handleEquip = (item: InventoryItem) => {
//     setAnimal(prev => ({
//       ...prev,
//       accessories: [...prev.accessories.filter(a => a.type !== item.type), item],
//     }));
//   };

//   return (
//     <div className="grid grid-cols-12 min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">

//       {/* Sidebar */}
//       <aside className="col-span-2 p-4 bg-white shadow-lg rounded-r-3xl flex flex-col gap-6">
//         <h1 className="text-xl font-bold text-purple-700">🐾 MyPet</h1>
//         <nav className="flex flex-col gap-3 text-sm">
//           <Button variant="ghost" className="justify-start gap-2"><Book className="w-4 h-4" /> My Tasks</Button>
//           <Button variant="ghost" className="justify-start gap-2"><Dog className="w-4 h-4" /> Pet</Button>
//           <Button variant="ghost" className="justify-start gap-2"><ShoppingCart className="w-4 h-4" /> Shop</Button>
//           <Button variant="ghost" className="justify-start gap-2"><UserCircle className="w-4 h-4" /> Profile</Button>
//         </nav>
//         <Button variant="outline" className="mt-auto" onClick={() => navigate('/login')}>
//           <LogOut className="mr-2 h-4 w-4" /> Logout
//         </Button>
//       </aside>

//       {/* Main content */}
//       <main className="col-span-7 p-6">
//         {/* Hero */}
//         <div className="bg-purple-100 rounded-xl p-6 flex justify-between items-center">
//           <div>
//             <h2 className="text-xl font-semibold text-purple-800">Hi, Kiddo!</h2>
//             <p className="text-sm text-purple-600">Take care of your virtual pet and complete fun tasks!</p>
//             <Button className="mt-3">Learn more</Button>
//           </div>
//           <img src="/images/ui/hero-pet.png" alt="pet" className="w-28 h-28 object-contain" />
//         </div>

//         {/* My Tasks */}
//         <section className="mt-8">
//           <h3 className="text-lg font-bold mb-2">My Tasks</h3>
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {tasks.map((task) => (
//               <Card key={task.id} className="bg-white/90 hover:bg-white transition-all">
//                 <CardHeader>
//                   <CardTitle>{task.title}</CardTitle>
//                   <CardDescription>{task.description}</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="flex justify-between items-center">
//                     <Badge variant="outline">{task.reward} coins</Badge>
//                     <Button
//                       variant={task.completed ? 'secondary' : 'default'}
//                       disabled={task.completed}
//                       onClick={() => handleCompleteTask(task.id)}
//                     >
//                       {task.completed ? 'Completed' : 'Complete Task'}
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </section>

//         {/* Pet Stats + Inventory */}
//         <section className="mt-8">
//           <div className="grid md:grid-cols-2 gap-6">
//             <Card><CardHeader><CardTitle>My Pet</CardTitle></CardHeader><CardContent><VirtualPet animal={animal} onFeed={handleFeed} onPlay={handlePlay} onSleep={handleSleep} /></CardContent></Card>
//             <div className="grid gap-4">
//               <Card><CardHeader className="flex justify-between"><CardTitle>Total Tasks</CardTitle><Trophy className="h-4 w-4"/></CardHeader><CardContent><div className="text-xl font-bold">{totalTasks}</div><p className="text-xs">{completedTasks} completed</p></CardContent></Card>
//               <Card><CardHeader className="flex justify-between"><CardTitle>Progress</CardTitle><Star className="h-4 w-4"/></CardHeader><CardContent><div className="text-xl font-bold">{Math.round(taskProgress)}%</div><Progress value={taskProgress} /></CardContent></Card>
//               <Card><CardHeader className="flex justify-between"><CardTitle>Coins Earned</CardTitle><Gift className="h-4 w-4"/></CardHeader><CardContent><div className="text-xl font-bold">{taskCoins}</div></CardContent></Card>
//               <Card><CardHeader><CardTitle>Inventory</CardTitle></CardHeader><CardContent><Inventory items={inventory} onEquip={handleEquip} /></CardContent></Card>
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* Right side: Pet Shop */}
//       <aside className="col-span-3 p-4 space-y-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Pet Shop</CardTitle>
//             <CardDescription>You have {coins} coins</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             {shopItems.map(item => (
//               <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm hover:bg-gray-100">
//                 <div className="flex items-center gap-2">
//                   <img src={item.image} alt={item.name} className="w-10 h-10" />
//                   <div>
//                     <p className="font-semibold text-sm">{item.name}</p>
//                     <p className="text-xs text-gray-500">{item.price} coins</p>
//                   </div>
//                 </div>
//                 <Button size="sm" onClick={() => handleBuy(item)}>Buy</Button>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       </aside>
//     </div>
//   );
// }

import { Home, Users, User, BookOpen, Play, FileText, CreditCard, Library, TrendingUp, Bell, Search, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Player } from "@lottiefiles/react-lottie-player";
import leftAnim from "@/assets/animations/left-decor.json";
import rightAnim from "@/assets/animations/right-decor.json";

const KidDashboard = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const incompleteTasks = tasks.filter((task: any) => !task.completed);
  const completedTasksArr = tasks.filter((task: any) => task.completed);
  const [activeTab, setActiveTab] = useState<"home" | "pet">("home");
  const [animal, setAnimal] = useState({
    name: "Buddy",
    type: "dog",
    level: 1,
    xp: 0,
    stats: { hunger: 70, happiness: 60, energy: 80 },
    accessories: [],
  });
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
      stats: { ...prev.stats, energy: Math.min(100, prev.stats.energy + 10) },
    }));
  };
  const handleResetHunger = () => {
    setAnimal(prev => ({
      ...prev,
      stats: { ...prev.stats, hunger: 0 },
    }));
  };
  const handleResetHappiness = () => {
    setAnimal(prev => ({
      ...prev,
      stats: { ...prev.stats, happiness: 0 },
    }));
  };
  const handleResetEnergy = () => {
    setAnimal(prev => ({
      ...prev,
      stats: { ...prev.stats, energy: 0 },
    }));
  };

  return (
    <div className='min-h-screen flex' style={{ background: "#f7f6fb" }}>
      {/* Sidebar */}
      <Card className='w-64 bg-white shadow-none border-0 flex flex-col min-h-screen p-0 m-4 mr-0'>
        {/* Logo */}
        <CardHeader className='p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center'>
              <div className='w-4 h-4 bg-white rounded opacity-80'></div>
            </div>
            <span className='text-xl font-bold text-gray-900'>SkillSet</span>
          </div>
        </CardHeader>
        {/* Navigation */}
        <CardContent className='flex-1 flex flex-col mt-6 space-y-1 px-3 p-0'>
          <Button variant={activeTab === "home" ? "secondary" : "ghost"} className={`flex items-center px-3 py-2 rounded-lg justify-start border-r-2 transition-all ${activeTab === "home" ? "bg-purple-50 text-purple-600 border-purple-600" : "text-gray-600 hover:bg-gray-100 border-transparent"}`} onClick={() => setActiveTab("home")}>
            <Home className='w-5 h-5 mr-3' /> Home
          </Button>
          <Button variant={activeTab === "pet" ? "secondary" : "ghost"} className={`flex items-center px-3 py-2 rounded-lg justify-start border-r-2 transition-all ${activeTab === "pet" ? "bg-purple-50 text-purple-600 border-purple-600" : "text-gray-600 hover:bg-gray-100 border-transparent"}`} onClick={() => setActiveTab("pet")}>
            <User className='w-5 h-5 mr-3' /> My Pet
          </Button>
          <Button variant='ghost' className='flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg justify-start'>
            <BookOpen className='w-5 h-5 mr-3' /> Courses
          </Button>
          <Button variant='ghost' className='flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg justify-start'>
            <Play className='w-5 h-5 mr-3' /> Live Class
          </Button>
          <Button variant='ghost' className='flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg justify-start'>
            <FileText className='w-5 h-5 mr-3' /> Attendance
          </Button>
          <Button variant='ghost' className='flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg justify-start'>
            <CreditCard className='w-5 h-5 mr-3' /> Payments
          </Button>
          <Button variant='ghost' className='flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg justify-start'>
            <Library className='w-5 h-5 mr-3' /> Library
          </Button>
          <Button variant='ghost' className='flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg justify-start'>
            <TrendingUp className='w-5 h-5 mr-3' /> Reports
          </Button>
        </CardContent>
        {/* Upgrade Section */}
        <Card className='mt-auto w-48 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl px-4 py-3 text-white text-center flex flex-col items-center shadow-lg border-0'>
          <CardContent className='p-0 flex flex-col items-center'>
            <span className='text-sm font-semibold mb-1'>Upgrade to Pro</span>
            <span className='text-xs opacity-90 mb-2'>for more facilities</span>
            <Button className='bg-white text-purple-700 font-bold px-5 py-1.5 rounded-lg shadow hover:bg-purple-50 transition text-sm mt-1'>Upgrade</Button>
          </CardContent>
        </Card>
      </Card>

      {/* Main Content */}
      <div className='flex-1 overflow-hidden'>
        {activeTab === "home" ? (
          <>
            {/* Header */}
            <header className='px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='relative'>
                    <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                    <Input type='text' placeholder='Search...' className='pl-10 pr-4 py-2 w-70 border-0 rounded-lg focus:outline-none focus:ring-0 focus:ring-purple-500 bg-white' />
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <Button className='bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium'>Live</Button>
                  <Button variant='ghost' size='icon' className='p-2 text-gray-600 hover:bg-gray-100 rounded-lg'>
                    <Moon className='w-5 h-5' />
                  </Button>
                  <Button variant='ghost' size='icon' className='p-2 text-gray-600 hover:bg-gray-100 rounded-lg'>
                    <Bell className='w-5 h-5' />
                  </Button>
                  <Avatar className='w-8 h-8 bg-purple-500'>
                    <AvatarFallback className='text-white text-sm font-medium'>I</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className='space-y-8 overflow-y-auto h-full p-5 pt-0 pb-0'>
              {/* Hero Section */}
              <Card className='bg-gradient-to-b from-[#8f8ef2] to-[#6a6ae7] rounded-2xl text-white relative overflow-hidden border-0 flex flex-col items-center text-center justify-center h-60 mb-5 shadow-none '>
                <CardContent className='relative z-10 max-w-lg p-8 '>
                  <CardTitle className='text-3xl font-bold mb-3'>Hi, Irham Muhammad Shidiq</CardTitle>
                  <CardDescription className='text-[#c6c7f8] mb-5 text-md'>
                    The library serves as a welcoming home for knowledge <br /> seekers and avid readers alike
                  </CardDescription>
                  <Button className='bg-transparent border-2 border-white/20 backdrop-blur-sm text-[#bcbcf1] px-7 py-2 rounded-lg hover:bg-white/30 hover:text-white transition-colors'>Learn more</Button>
                </CardContent>
                {/* Decorative Elements */}
                <div className='absolute left-0 top-1/2 transform -translate-y-1/2 z-0 ml-20'>
                  <Player autoplay loop src={leftAnim} style={{ width: 170, height: 170 }} />
                </div>

                <div className='absolute right-0 top-1/2 transform -translate-y-1/2 z-0 mr-10'>
                  <Player autoplay loop src={rightAnim} style={{ width: 220, height: 220 }} />
                </div>
                {/* Floating circles */}
                <div className='absolute top-4 right-1/4 w-4 h-4 bg-yellow-300 rounded-full opacity-60'></div>
                <div className='absolute bottom-6 left-1/3 w-3 h-3 bg-pink-300 rounded-full opacity-50'></div>
                <div className='absolute top-1/3 right-1/3 w-2 h-2 bg-blue-300 rounded-full opacity-70'></div>
              </Card>

              <div className="flex gap-4">
                {/* Left Column */}
                <div className='flex-1 space-y-8 rounded-2xl bg-white p-5 shadow-none'>
                  {/* Popular Section */}
                  <div>
                    <div className='flex items-center justify-between mb-4'>
                      <h2 className='text-xl font-bold text-gray-900'>Completed</h2>
                      <Button variant='link' className='text-[#b8bac1] text-xs font-semibold hover:text-violet-300 p-0 h-auto'>
                        VIEW ALL
                      </Button>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                      {incompleteTasks.map((task: any, i: number) => (
                        <Card key={task.id} className='relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex flex-col justify-between p-4 aspect-square shadow hover:shadow-lg transition-all'>
                          <Button variant='ghost' size='icon' className='absolute top-3 right-3 bg-white/80 rounded-full p-1.5 shadow hover:bg-white'>
                            <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                              <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='#a78bfa' />
                            </svg>
                          </Button>
                          <CardContent className='flex flex-col items-center justify-between h-full p-0'>
                            <div className='w-12 h-12 bg-white/70 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                              <div className='w-7 h-7 bg-blue-400 rounded'></div>
                            </div>
                            <div className='flex-1 flex flex-col justify-end w-full'>
                              <CardTitle className='font-semibold text-gray-900 text-base truncate'>{task.title}</CardTitle>
                              <CardDescription className='text-gray-600 text-xs truncate'>{task.description}</CardDescription>
                            </div>
                            <Button className='mt-4 w-full' onClick={() => setTasks((prev: any) => prev.map((t: any) => (t.id === task.id ? { ...t, completed: true } : t)))}>
                              Complete
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Ongoing Section */}
                  <div className="mt-0">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Ongoing</h2>
                      <Button variant="link" className="text-[#b8bac1] text-xs font-semibold hover:text-violet-300 p-0 h-auto">VIEW ALL</Button>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                      {completedTasksArr.map((task: any, i: number) => (
                        <Card key={task.id} className='relative bg-gradient-to-br from-purple-200 to-blue-200 rounded-2xl flex flex-col justify-between p-4 aspect-square shadow hover:shadow-lg transition-all'>
                          <Button variant='ghost' size='icon' className='absolute top-3 right-3 bg-white/80 rounded-full p-1.5 shadow hover:bg-white'>
                            <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                              <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='#a78bfa' />
                            </svg>
                          </Button>
                          <CardContent className='flex flex-col items-center justify-between h-full p-0'>
                            <div className='w-12 h-12 bg-white/70 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                              <div className='w-7 h-7 bg-purple-400 rounded'></div>
                            </div>
                            <div className='flex-1 flex flex-col justify-end w-full'>
                              <CardTitle className='font-semibold text-gray-900 text-base truncate'>{task.title}</CardTitle>
                              <CardDescription className='text-gray-600 text-xs truncate'>{task.description}</CardDescription>
                            </div>
                            <Button className='mt-4 w-full' variant='secondary' onClick={() => setTasks((prev: any) => prev.map((t: any) => (t.id === task.id ? { ...t, completed: false } : t)))}>
                              Undo
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="w-80 space-y-4 mb-0">
                  {/* Achievement Section */}
                  <Card className="bg-white rounded-xl p-0 shadow-none border-0 mb-4">
                    <CardHeader className="flex items-center justify-between mb-0 p-4 pb-0">
                      <CardTitle className="font-semibold text-gray-900 text-base">Unlock achievement</CardTitle>
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      </div>
                    </CardHeader>
                    <CardContent className='p-6 pt-2'>
                      <CardDescription className='text-gray-600 text-sm mb-4'>Goal achieved success unlocked</CardDescription>
                      <div className='space-y-3'>
                        <div className='flex items-center space-x-3'>
                          <Avatar className='w-10 h-10 bg-purple-100'>
                            <AvatarFallback className='text-purple-600 text-sm font-medium'>K</AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm font-medium'>60% Achieved</span>
                              <span className='text-xs text-gray-500'>7 Days left</span>
                            </div>
                            <div className='w-full bg-gray-200 rounded-full h-1.5 mt-1'>
                              <div className='bg-purple-500 h-1.5 rounded-full' style={{ width: "60%" }}></div>
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center space-x-3'>
                          <Avatar className='w-10 h-10 bg-orange-100'>
                            <AvatarFallback className='text-orange-600 text-sm font-medium'>A</AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm font-medium'>35% Achieved</span>
                              <span className='text-xs text-gray-500'>12 Days left</span>
                            </div>
                            <div className='w-full bg-gray-200 rounded-full h-1.5 mt-1'>
                              <div className='bg-orange-500 h-1.5 rounded-full' style={{ width: "35%" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Best Sales Section */}
                  <Card className='bg-white rounded-xl p-0 shadow-none border-0'>
                    <CardHeader className='flex items-center justify-between mb-0 p-6 pb-0'>
                      <CardTitle className='font-semibold text-gray-900 text-base'>Best sales</CardTitle>
                      <Button variant='link' className='text-purple-600 text-sm font-medium hover:text-purple-700 p-0 h-auto'>
                        VIEW ALL
                      </Button>
                    </CardHeader>
                    <CardContent className='space-y-4 p-6 pt-2'>
                      {[1, 2, 3, 4].map((_, i) => (
                        <div key={i} className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <div className='w-12 h-12 bg-gradient-to-br from-pink-100 to-red-100 rounded-lg flex items-center justify-center'>
                              <div className='w-6 h-4 bg-pink-400 rounded'></div>
                            </div>
                            <div>
                              <span className='font-medium text-gray-900 block'>Grow green</span>
                              <div className='flex items-center space-x-1'>
                                <span className='text-yellow-400'>★</span>
                                <span className='text-sm text-gray-600'>4.5</span>
                              </div>
                            </div>
                          </div>
                          <Button className='bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium'>Order</Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </>
        ) : (
          <main className='p-6 space-y-8 overflow-y-auto h-full flex flex-col items-center justify-center'>
            <VirtualPet animal={animal} onFeed={handleFeed} onPlay={handlePlay} onSleep={handleSleep} onResetHunger={handleResetHunger} onResetHappiness={handleResetHappiness} onResetEnergy={handleResetEnergy} />
          </main>
        )}
      </div>
    </div>
  );
};

export default KidDashboard;
