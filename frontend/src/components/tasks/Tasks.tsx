import { useState, useEffect } from "react";
import { Search, Moon, Bell, Home, Users, User, BookOpen, Play, FileText, CreditCard, Library, TrendingUp } from "lucide-react";
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Task } from "../../lib/types";
import { getTasks, completeTask, undoTask } from "../../lib/api";
import { useNavigate } from "react-router-dom";

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCoins, setTotalCoins] = useState(0);

  const incompleteTasks = tasks.filter((task: Task) => !task.completed);
  const completedTasksArr = tasks.filter((task: Task) => task.completed);

  useEffect(() => {
    loadTasks();
    loadCoins();

    // Add event listeners for coin updates
    window.addEventListener("taskCompleted", handleCoinUpdate);
    window.addEventListener("coinSpent", handleCoinUpdate);

    // Add localStorage event listener as backup
    window.addEventListener("storage", handleCoinUpdate);

    // Set up interval to update coins every 3 seconds
    const interval = setInterval(() => {
      loadCoins();
    }, 3000);

    return () => {
      window.removeEventListener("taskCompleted", handleCoinUpdate);
      window.removeEventListener("coinSpent", handleCoinUpdate);
      window.removeEventListener("storage", handleCoinUpdate);
      clearInterval(interval);
    };
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      console.log("Loading tasks - Token:", token ? "exists" : "missing");
      console.log("Loading tasks - User:", userStr);

      if (!token || !userStr) {
        console.error("No token or user found");
        return;
      }

      const user = JSON.parse(userStr);
      console.log("Loading tasks for user ID:", user.id);

      const tasksData = await getTasks(token, user.id);
      console.log("Tasks loaded:", tasksData);
      setTasks(tasksData);

      // Calculate total coins from completed tasks
      const coins = tasksData.filter((task: Task) => task.completed).reduce((sum: number, task: Task) => sum + task.reward, 0);

      // Get spent coins from localStorage
      const spentCoins = parseInt(localStorage.getItem("spentCoins") || "0");
      setTotalCoins(coins - spentCoins);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCoins = () => {
    try {
      const calculateCoins = async () => {
        try {
          const token = localStorage.getItem("token");
          const userStr = localStorage.getItem("user");

          if (!token || !userStr) {
            return;
          }

          const user = JSON.parse(userStr);
          const tasks = await getTasks(token, user.id);
          const completedTasks = tasks.filter((task: Task) => task.completed);
          const earnedCoins = completedTasks.reduce((sum: number, task: Task) => sum + task.reward, 0);

          // Get spent coins from localStorage
          const spentCoins = parseInt(localStorage.getItem("spentCoins") || "0");
          const currentTotal = earnedCoins - spentCoins;

          setTotalCoins(currentTotal);
        } catch (error) {
          console.error("Error calculating coins:", error);
        }
      };

      calculateCoins();
    } catch (error) {
      console.error("Error loading coins:", error);
    }
  };

  const handleCoinUpdate = () => {
    loadCoins();
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        console.error("No token or user found");
        return;
      }

      const user = JSON.parse(userStr);
      await completeTask(token, taskId);

      // Reload tasks to get updated data
      const tasksData = await getTasks(token, user.id);
      setTasks(tasksData);

      // Update coins
      const coins = tasksData.filter((task: Task) => task.completed).reduce((sum: number, task: Task) => sum + task.reward, 0);
      const spentCoins = parseInt(localStorage.getItem("spentCoins") || "0");
      setTotalCoins(coins - spentCoins);

      // Dispatch event for coin update
      window.dispatchEvent(new CustomEvent("taskCompleted"));

      // Update last task time
      localStorage.setItem("lastTaskTime", Date.now().toString());
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleUndoTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        console.error("No token or user found");
        return;
      }

      const user = JSON.parse(userStr);
      await undoTask(token, taskId);

      // Reload tasks to get updated data
      const tasksData = await getTasks(token, user.id);
      setTasks(tasksData);

      // Update coins
      const coins = tasksData.filter((task: Task) => task.completed).reduce((sum: number, task: Task) => sum + task.reward, 0);
      const spentCoins = parseInt(localStorage.getItem("spentCoins") || "0");
      setTotalCoins(coins - spentCoins);

      // Dispatch event for coin update
      window.dispatchEvent(new CustomEvent("taskCompleted"));
    } catch (error) {
      console.error("Error undoing task:", error);
    }
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
          <Button variant='ghost' className='flex items-center px-3 py-2 rounded-lg justify-start border-r-2 transition-all text-gray-600 hover:bg-gray-100 border-transparent' onClick={() => navigate("/kid/dashboard")}>
            <Home className='w-5 h-5 mr-3' /> Home
          </Button>
          <Button variant='ghost' className='flex items-center px-3 py-2 rounded-lg justify-start border-r-2 transition-all text-gray-600 hover:bg-gray-100 border-transparent' onClick={() => navigate("/kid/dashboard")}>
            <User className='w-5 h-5 mr-3' /> My Pet
          </Button>
          <Button variant='secondary' className='flex items-center px-3 py-2 rounded-lg justify-start border-r-2 transition-all bg-purple-50 text-purple-600 border-purple-600'>
            <FileText className='w-5 h-5 mr-3' /> My Tasks
          </Button>
          <Button variant='ghost' className='flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg justify-start' onClick={() => navigate("/kid/shop")}>
            <BookOpen className='w-5 h-5 mr-3' /> Shop
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
              <div className='flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-300'>
                <span className='text-yellow-600 font-bold text-lg'>🪙</span>
                <span className='text-yellow-600 font-bold text-lg'>{totalCoins}</span>
              </div>
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
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold text-gray-900'>My Tasks</h1>
          </div>

          {/* Incomplete Tasks Section */}
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-bold text-gray-900'>Incomplete Tasks</h2>
              <span className='text-sm text-gray-500'>{incompleteTasks.length} tasks remaining</span>
            </div>
            {loading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                {[1, 2, 3].map(i => (
                  <Card key={i} className='relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex flex-col justify-between p-4 aspect-square shadow hover:shadow-lg transition-all animate-pulse'>
                    <div className='w-12 h-12 bg-gray-300 rounded-xl mb-4 mx-auto'></div>
                    <div className='flex-1 flex flex-col justify-end w-full'>
                      <div className='h-4 bg-gray-300 rounded mb-2'></div>
                      <div className='h-3 bg-gray-300 rounded mb-4'></div>
                    </div>
                    <div className='h-8 bg-gray-300 rounded'></div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                {incompleteTasks.map((task: Task) => (
                  <Card key={task._id} className='relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex flex-col justify-between p-4 aspect-square shadow hover:shadow-lg transition-all'>
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
                        <div className='flex items-center gap-1 mt-2'>
                          <span className='text-yellow-600 font-bold text-sm'>🪙</span>
                          <span className='text-yellow-600 font-bold text-sm'>{task.reward}</span>
                        </div>
                      </div>
                      <Button className='mt-4 w-full' onClick={() => handleCompleteTask(task._id)}>
                        Complete
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Completed Tasks Section */}
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-bold text-gray-900'>Completed Tasks</h2>
              <span className='text-sm text-gray-500'>{completedTasksArr.length} tasks completed</span>
            </div>
            {loading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                {[1, 2, 3].map(i => (
                  <Card key={i} className='relative bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex flex-col justify-between p-4 aspect-square shadow hover:shadow-lg transition-all animate-pulse'>
                    <div className='w-12 h-12 bg-gray-300 rounded-xl mb-4 mx-auto'></div>
                    <div className='flex-1 flex flex-col justify-end w-full'>
                      <div className='h-4 bg-gray-300 rounded mb-2'></div>
                      <div className='h-3 bg-gray-300 rounded mb-4'></div>
                    </div>
                    <div className='h-8 bg-gray-300 rounded'></div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                {completedTasksArr.map((task: Task) => (
                  <Card key={task._id} className='relative bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex flex-col justify-between p-4 aspect-square shadow hover:shadow-lg transition-all'>
                    <Button variant='ghost' size='icon' className='absolute top-3 right-3 bg-white/80 rounded-full p-1.5 shadow hover:bg-white'>
                      <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                        <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='#a78bfa' />
                      </svg>
                    </Button>
                    <CardContent className='flex flex-col items-center justify-between h-full p-0'>
                      <div className='w-12 h-12 bg-white/70 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                        <div className='w-7 h-7 bg-green-400 rounded'></div>
                      </div>
                      <div className='flex-1 flex flex-col justify-end w-full'>
                        <CardTitle className='font-semibold text-gray-900 text-base truncate'>{task.title}</CardTitle>
                        <CardDescription className='text-gray-600 text-xs truncate'>{task.description}</CardDescription>
                        <div className='flex items-center gap-1 mt-2'>
                          <span className='text-yellow-600 font-bold text-sm'>🪙</span>
                          <span className='text-yellow-600 font-bold text-sm'>{task.reward}</span>
                        </div>
                      </div>
                      <Button variant='outline' className='mt-4 w-full' onClick={() => handleUndoTask(task._id)}>
                        Undo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Tasks;
