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
          {/* Task Summary Sidebar */}
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
            {/* Main Content */}
            <div className='lg:col-span-3 space-y-8'>
              {/* Incomplete Tasks Section */}
              <Card className='shadow-none bg-white'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle>Incomplete Tasks</CardTitle>
                    <span className='text-sm text-gray-500'>{incompleteTasks.length} tasks remaining</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {[1, 2, 3, 4].map(i => (
                        <Card key={i} className='relative bg-white rounded-xl flex flex-col justify-between p-3 aspect-square hover:shadow-lg transition-all animate-pulse'>
                          <div className='w-8 h-8 bg-gray-300 rounded-lg mb-2 mx-auto'></div>
                          <div className='flex-1 flex flex-col justify-end w-full'>
                            <div className='h-3 bg-gray-300 rounded mb-1'></div>
                            <div className='h-2 bg-gray-300 rounded mb-2'></div>
                          </div>
                          <div className='h-6 bg-gray-300 rounded'></div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {incompleteTasks.map((task: Task) => (
                        <Card key={task._id} className='relative bg-white rounded-xl flex flex-col justify-between p-3 aspect-square hover:shadow-lg transition-all'>
                          <Button variant='ghost' size='icon' className='absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow hover:bg-white'>
                            <svg width='16' height='16' fill='none' viewBox='0 0 24 24'>
                              <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='#a78bfa' />
                            </svg>
                          </Button>
                          <CardContent className='flex flex-col items-center justify-between h-full p-0'>
                            <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2 mx-auto'>
                              <div className='w-5 h-5 bg-blue-400 rounded'></div>
                            </div>
                            <div className='flex-1 flex flex-col justify-end w-full'>
                              <CardTitle className='font-semibold text-gray-900 text-sm truncate'>{task.title}</CardTitle>
                              <CardDescription className='text-gray-600 text-xs truncate'>{task.description}</CardDescription>
                              <div className='flex items-center gap-1 mt-1'>
                                <span className='text-yellow-600 font-bold text-xs'>🪙</span>
                                <span className='text-yellow-600 font-bold text-xs'>{task.reward}</span>
                              </div>
                            </div>
                            <Button className='mt-2 w-full text-xs py-1' onClick={() => handleCompleteTask(task._id)}>
                              Complete
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completed Tasks Section */}
              <Card className='shadow-none bg-white'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle>Completed Tasks</CardTitle>
                    <span className='text-sm text-gray-500'>{completedTasksArr.length} tasks completed</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {[1, 2, 3, 4].map(i => (
                        <Card key={i} className='relative bg-white rounded-xl flex flex-col justify-between p-3 aspect-square hover:shadow-lg transition-all animate-pulse'>
                          <div className='w-8 h-8 bg-gray-300 rounded-lg mb-2 mx-auto'></div>
                          <div className='flex-1 flex flex-col justify-end w-full'>
                            <div className='h-3 bg-gray-300 rounded mb-1'></div>
                            <div className='h-2 bg-gray-300 rounded mb-2'></div>
                          </div>
                          <div className='h-6 bg-gray-300 rounded'></div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {completedTasksArr.map((task: Task) => (
                        <Card key={task._id} className='relative bg-white rounded-xl flex flex-col justify-between p-3 aspect-square hover:shadow-lg transition-all'>
                          <Button variant='ghost' size='icon' className='absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow hover:bg-white'>
                            <svg width='16' height='16' fill='none' viewBox='0 0 24 24'>
                              <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='#a78bfa' />
                            </svg>
                          </Button>
                          <CardContent className='flex flex-col items-center justify-between h-full p-0'>
                            <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2 mx-auto'>
                              <div className='w-5 h-5 bg-green-400 rounded'></div>
                            </div>
                            <div className='flex-1 flex flex-col justify-end w-full'>
                              <CardTitle className='font-semibold text-gray-900 text-sm truncate'>{task.title}</CardTitle>
                              <CardDescription className='text-gray-600 text-xs truncate'>{task.description}</CardDescription>
                              <div className='flex items-center gap-1 mt-1'>
                                <span className='text-yellow-600 font-bold text-xs'>🪙</span>
                                <span className='text-yellow-600 font-bold text-xs'>{task.reward}</span>
                              </div>
                            </div>
                            <Button variant='outline' className='mt-2 w-full text-xs py-1' onClick={() => handleUndoTask(task._id)}>
                              Undo
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className='lg:col-span-1'>
              <Card className='sticky top-1 shadow-none bg-white'>
                <CardHeader>
                  <CardTitle>Task Summary</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Total Tasks */}
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-gray-900 mb-1'>{tasks.length}</div>
                    <div className='text-sm text-gray-600'>Total Tasks</div>
                  </div>

                  {/* Progress Bar */}
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>Progress</span>
                      <span className='font-semibold text-gray-900'>{tasks.length > 0 ? Math.round((completedTasksArr.length / tasks.length) * 100) : 0}%</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div className='bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300' style={{ width: `${tasks.length > 0 ? (completedTasksArr.length / tasks.length) * 100 : 0}%` }}></div>
                    </div>
                  </div>

                  {/* Completed vs Pending */}
                  <div className='grid grid-cols-2 gap-4'>
                    <Card className='bg-green-50 border-green-200 shadow-none'>
                      <CardContent className='p-3'>
                        <div className='text-center'>
                          <div className='text-xl font-bold text-green-600 mb-1'>{completedTasksArr.length}</div>
                          <div className='text-[10px] text-green-700 leading-tight'>Completed</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className='bg-blue-50 border-blue-200 shadow-none'>
                      <CardContent className='p-3'>
                        <div className='text-center'>
                          <div className='text-xl font-bold text-blue-600 mb-1'>{incompleteTasks.length}</div>
                          <div className='text-[10px] text-blue-700 leading-tight'>Pending</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Coins Earned */}
                  <Card className='bg-yellow-50 border-yellow-200 shadow-none'>
                    <CardContent className='text-center p-4'>
                      <div className='text-2xl font-bold text-yellow-600 mb-1'>🪙 {totalCoins}</div>
                      <div className='text-xs text-yellow-700'>Total Coins</div>
                    </CardContent>
                  </Card>

                  {/* Completion Rate */}
                  <div className='text-center'>
                    <div className='text-lg font-semibold text-gray-900 mb-1'>{tasks.length > 0 ? Math.round((completedTasksArr.length / tasks.length) * 100) : 0}%</div>
                    <div className='text-xs text-gray-600'>Completion Rate</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Tasks;
