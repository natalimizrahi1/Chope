import { useState, useEffect } from "react";
import { Search, Moon, Bell, Home, Users, User, BookOpen, Play, FileText, CreditCard, Library, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Task } from "../../lib/types";
import { getTasks, completeTask, undoTask, getChildCoins, unapproveTask } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/use-toast";
import { Toaster } from "../ui/toaster";
import Notifications from "../notifications/Notifications";

const Tasks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCoins, setTotalCoins] = useState(0);

  const incompleteTasks = tasks.filter((task: Task) => !task.completed);
  const completedTasksArr = tasks.filter((task: Task) => task.completed);
  const pendingApprovalTasks = tasks.filter((task: Task) => task.completed && !task.approved);
  const approvedTasks = tasks.filter((task: Task) => task.completed && task.approved);

  useEffect(() => {
    loadTasks();
    loadCoins();

    // Check for new tasks in localStorage on mount
    const newTaskInfo = localStorage.getItem("newTaskCreated");
    if (newTaskInfo) {
      try {
        const taskInfo = JSON.parse(newTaskInfo);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (taskInfo.childId === user.id) {
          // Refresh tasks immediately
          loadTasks();

          // Clear the localStorage item
          localStorage.removeItem("newTaskCreated");
        }
      } catch (error) {
        console.error("Failed to parse new task info on mount:", error);
      }
    }

    // Set up interval for periodic refresh
    const interval = setInterval(() => {
      loadTasks();
      loadCoins();
    }, 3000);

    // Add event listeners for coin updates
    window.addEventListener("taskCompleted", handleCoinUpdate);
    window.addEventListener("coinSpent", handleCoinUpdate);

    // Add localStorage event listener as backup
    window.addEventListener("storage", handleCoinUpdate);

    // Listen for new task creation events
    const handleNewTaskCreated = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { task, childId: eventChildId } = customEvent.detail;

      // Check if this event is for the current user
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (eventChildId === user.id) {
        try {
          // Immediately refresh tasks to show the new task
          await loadTasks();
        } catch (error) {
          console.error("Failed to refresh tasks after new task creation:", error);
        }
      }
    };

    // Listen for localStorage changes (immediate detection)
    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key === "newTaskCreated" && event.newValue) {
        try {
          const taskInfo = JSON.parse(event.newValue);
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          if (taskInfo.childId === user.id) {
            // Immediately refresh tasks
            await loadTasks();

            // Clear the localStorage item
            localStorage.removeItem("newTaskCreated");
          }
        } catch (error) {
          console.error("Failed to parse new task info:", error);
        }
      }
    };

    window.addEventListener("taskCreated", handleNewTaskCreated);
    window.addEventListener("storage", handleStorageChange);

    // Listen for visibility changes to refresh coins when returning to page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadTasks();
        loadCoins();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("taskCompleted", handleCoinUpdate);
      window.removeEventListener("coinSpent", handleCoinUpdate);
      window.removeEventListener("storage", handleCoinUpdate);
      window.removeEventListener("taskCreated", handleNewTaskCreated);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  // Refresh coins every 5 seconds
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    if (!user.id || !token) return;

    const interval = setInterval(async () => {
      try {
        await loadCoins();
      } catch (error) {
        console.error("Failed to refresh coins:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Listen for task approval events to update immediately
  useEffect(() => {
    const handleTaskApproved = async (event: StorageEvent) => {
      if (event.key === "taskApproved" && event.newValue) {
        try {
          const info = JSON.parse(event.newValue);
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          if (info.childId === user.id) {
            // Immediately refresh tasks and coins
            await loadTasks();
            await loadCoins();

            // Show success notification
            toast({
              title: "Task Approved! 🎉",
              description: "Your task has been approved and you received coins!",
            });

            // Clear the localStorage item
            localStorage.removeItem("taskApproved");
          }
        } catch (error) {
          console.error("Failed to handle task approval event:", error);
        }
      }
    };

    // Listen for custom task approval events (same tab)
    const handleTaskApprovedCustom = async (event: CustomEvent) => {
      console.log("🎉 Tasks page received custom task approval event:", event.detail);
      const { childId: eventChildId } = event.detail;
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (eventChildId === user.id) {
        console.log("✅ Tasks page updating for approved task");
        // Immediately refresh tasks and coins
        await loadTasks();
        await loadCoins();

        // Show success notification
        toast({
          title: "Task Approved! 🎉",
          description: "Your task has been approved and you received coins!",
        });
      }
    };

    // Set up interval to check for task approval events in localStorage
    const approvalCheckInterval = setInterval(async () => {
      const taskApprovedInfo = localStorage.getItem("taskApproved");
      if (taskApprovedInfo) {
        try {
          const info = JSON.parse(taskApprovedInfo);
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          console.log("🔔 Tasks page found task approval info in localStorage:", info);
          if (info.childId === user.id) {
            console.log("🔔 Tasks page updating for approved task (localStorage check)");
            // Immediately refresh tasks and coins
            await loadTasks();
            await loadCoins();

            // Show success notification
            toast({
              title: "Task Approved! 🎉",
              description: "Your task has been approved and you received coins!",
            });

            // Clear the localStorage item
            localStorage.removeItem("taskApproved");
          }
        } catch (error) {
          console.error("Failed to parse task approval info:", error);
        }
      }
    }, 2000); // Check every 2 seconds

    window.addEventListener("storage", handleTaskApproved);
    window.addEventListener("taskApproved", handleTaskApprovedCustom as unknown as EventListener);
    return () => {
      window.removeEventListener("storage", handleTaskApproved);
      window.removeEventListener("taskApproved", handleTaskApprovedCustom as unknown as EventListener);
      clearInterval(approvalCheckInterval);
    };
  }, [toast]);

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

      // Coins are now loaded separately via loadCoins function
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCoins = async () => {
    try {
      console.log("=== LOADING COINS IN TASKS ===");
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      console.log("Token:", token ? "Present" : "Missing");
      console.log("User string:", userStr);

      if (!token || !userStr) {
        console.log("No token or user found, returning");
        return;
      }

      const user = JSON.parse(userStr);
      console.log("User ID:", user.id);

      // Get coins directly from server
      try {
        console.log("Getting coins from server...");
        const coinsData = await getChildCoins(token, user.id);
        console.log("Coins data from server:", coinsData);
        console.log("Previous coins in state:", totalCoins);
        console.log("New coins from server:", coinsData.coins);

        setTotalCoins(coinsData.coins);
        localStorage.setItem("currentCoins", coinsData.coins.toString());
        console.log("Coins state updated successfully");
        console.log("=== COINS LOADED SUCCESSFULLY ===");
      } catch (serverError) {
        console.error("Failed to get coins from server, falling back to calculation:", serverError);
        // Fallback to old calculation method
        const tasks = await getTasks(token, user.id);
        const approvedTasks = tasks.filter((task: Task) => task.completed && task.approved);
        const earnedCoins = approvedTasks.reduce((sum: number, task: Task) => sum + task.reward, 0);
        const spentCoins = parseInt(localStorage.getItem("spentCoins") || "0");
        const currentTotal = earnedCoins - spentCoins;
        setTotalCoins(currentTotal);
      }
    } catch (error) {
      console.error("Error loading coins:", error);
    }
  };

  const handleCoinUpdate = async () => {
    await loadCoins();
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      console.log("Starting task completion for task ID:", taskId);

      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        console.error("No token or user found");
        toast({
          title: "Error",
          description: "Error: Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const user = JSON.parse(userStr);
      console.log("Completing task for user:", user.id);

      await completeTask(token, taskId);
      console.log("Task completed successfully on server");

      // Show notification to child - this should always appear
      setTimeout(() => {
        toast({
          title: "Task Sent for Approval",
          description: "Your task has been sent to your parent for approval. You will receive your coins once approved.",
        });
        console.log("Alert shown to user");
      }, 100);

      // Reload tasks to get updated data
      console.log("Reloading tasks...");
      const tasksData = await getTasks(token, user.id);
      setTasks(tasksData);
      console.log("Tasks reloaded successfully");

      // Reload coins from server
      console.log("Reloading coins...");
      await loadCoins();
      console.log("Coins reloaded successfully");

      // Dispatch event for coin update
      window.dispatchEvent(new CustomEvent("taskCompleted"));

      // Update last task time
      localStorage.setItem("lastTaskTime", Date.now().toString());
      console.log("Task completion process finished successfully");
    } catch (error) {
      console.error("Error completing task:", error);

      // Show error message to user
      toast({
        title: "Error",
        description: "There was an error completing the task. Please try again.",
        variant: "destructive",
      });
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

      // Immediately reload coins from server
      await loadCoins();

      // Dispatch event for coin update
      window.dispatchEvent(new CustomEvent("taskCompleted"));

      toast({
        title: "Task Undone",
        description: "The task has been undone. If it was approved, coins have been deducted.",
      });
    } catch (error) {
      console.error("Error undoing task:", error);
      toast({
        title: "Error",
        description: "Failed to undo task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnapproveTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        console.error("No token or user found");
        return;
      }

      const user = JSON.parse(userStr);
      await unapproveTask(token, taskId);

      // Reload tasks to get updated data
      const tasksData = await getTasks(token, user.id);
      setTasks(tasksData);

      // Reload coins from server
      await loadCoins();

      // Dispatch event for coin update
      window.dispatchEvent(new CustomEvent("taskCompleted"));

      toast({
        title: "Task Unapproved",
        description: "The task has been unapproved and coins have been deducted.",
      });
    } catch (error) {
      console.error("Error unapproving task:", error);
      toast({
        title: "Error",
        description: "Failed to unapprove task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTaskStatusBadge = (task: Task) => {
    if (task.approved) {
      return <Badge className='bg-green-100 text-green-800 text-[8px] lg:text-[10px]'>Approved</Badge>;
    } else if (task.completed) {
      return <Badge className='bg-yellow-100 text-yellow-800 text-[8px] lg:text-[10px]'>Pending Approval</Badge>;
    }
    return null;
  };

  const getTaskStatusIcon = (task: Task) => {
    if (task.approved) {
      return <CheckCircle className='w-4 h-4 lg:w-5 lg:h-5 text-green-500' />;
    } else if (task.completed) {
      return <Clock className='w-4 h-4 lg:w-5 lg:h-5 text-yellow-500' />;
    }
    return <div className='w-4 h-4 lg:w-5 lg:h-5 bg-blue-400 rounded' />;
  };

  const getTaskStatusBg = (task: Task) => {
    if (task.approved) {
      return "bg-green-100";
    } else if (task.completed) {
      return "bg-yellow-100";
    }
    return "bg-blue-100";
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
          <Button variant='ghost' className='flex items-center px-3 py-2 rounded-lg justify-start border-r-2 transition-all text-gray-600 hover:bg-gray-100 border-transparent' onClick={() => navigate("/kid/virtualpet")}>
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
            <div className='flex items-center space-x-4'></div>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-300'>
                <span className='text-yellow-600 font-bold text-lg'>🪙</span>
                <span className='text-yellow-600 font-bold text-lg'>{totalCoins}</span>
                <Button variant='ghost' size='sm' onClick={loadCoins} className='ml-2 p-1 h-6 w-6 hover:bg-yellow-200'>
                  🔄
                </Button>
              </div>
              {(() => {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                const token = localStorage.getItem("token");
                console.log("🔔 Tasks page - User:", user.id, "Token:", token ? "present" : "missing");
                return user.id && token ? <Notifications childId={user.id} token={token} /> : null;
              })()}
              <Avatar className='w-8 h-8 bg-purple-500'>
                <AvatarFallback className='text-white text-sm font-medium'>I</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className='space-y-6 lg:space-y-8 overflow-y-auto h-full p-4 lg:p-5 pt-0 pb-0'>
          {/* Task Summary Sidebar */}
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6'>
            {/* Main Content */}
            <div className='lg:col-span-3 space-y-6 lg:space-y-8'>
              {/* Incomplete Tasks Section */}
              <Card className='shadow-none bg-white'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg lg:text-xl'>Incomplete Tasks</CardTitle>
                    <span className='text-xs lg:text-sm text-gray-500'>{incompleteTasks.length} tasks remaining</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4'>
                      {[1, 2, 3, 4].map(i => (
                        <Card key={i} className='relative bg-white rounded-xl flex flex-col justify-between p-3 aspect-square hover:shadow-lg transition-all animate-pulse'>
                          <div className='w-6 h-6 lg:w-8 lg:h-8 bg-gray-300 rounded-lg mb-2 mx-auto'></div>
                          <div className='flex-1 flex flex-col justify-end w-full'>
                            <div className='h-3 bg-gray-300 rounded mb-1'></div>
                            <div className='h-2 bg-gray-300 rounded mb-2'></div>
                          </div>
                          <div className='h-6 bg-gray-300 rounded'></div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4'>
                      {incompleteTasks.map((task: Task) => (
                        <Card key={task._id} className='relative bg-white rounded-xl flex flex-col justify-between p-3 aspect-square hover:shadow-lg transition-all'>
                          <Button variant='ghost' size='icon' className='absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow hover:bg-white'>
                            <svg width='16' height='16' fill='none' viewBox='0 0 24 24'>
                              <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='#a78bfa' />
                            </svg>
                          </Button>
                          <CardContent className='flex flex-col items-center justify-between h-full p-0'>
                            <div className='w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2 mx-auto'>
                              <div className='w-4 h-4 lg:w-5 lg:h-5 bg-blue-400 rounded'></div>
                            </div>
                            <div className='flex-1 flex flex-col justify-end w-full'>
                              <CardTitle className='font-semibold text-gray-900 text-xs lg:text-sm truncate'>{task.title}</CardTitle>
                              <CardDescription className='text-gray-600 text-[10px] lg:text-xs truncate'>{task.description}</CardDescription>
                              <div className='flex items-center gap-1 mt-1'>
                                <span className='text-yellow-600 font-bold text-[10px] lg:text-xs'>🪙</span>
                                <span className='text-yellow-600 font-bold text-[10px] lg:text-xs'>{task.reward}</span>
                              </div>
                            </div>
                            <Button className='mt-2 w-full text-[10px] lg:text-xs py-1' onClick={() => handleCompleteTask(task._id)}>
                              Complete
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Approval Tasks Section */}
              {pendingApprovalTasks.length > 0 && (
                <Card className='shadow-none bg-white'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-lg lg:text-xl'>Pending Approval</CardTitle>
                      <span className='text-xs lg:text-sm text-gray-500'>{pendingApprovalTasks.length} tasks waiting</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4'>
                      {pendingApprovalTasks.map((task: Task) => (
                        <Card key={task._id} className='relative bg-white rounded-xl flex flex-col justify-between p-3 aspect-square hover:shadow-lg transition-all'>
                          <div className='absolute top-2 right-2'>{getTaskStatusBadge(task)}</div>
                          <CardContent className='flex flex-col items-center justify-between h-full p-0'>
                            <div className={`w-6 h-6 lg:w-8 lg:h-8 ${getTaskStatusBg(task)} rounded-lg flex items-center justify-center mb-2 mx-auto`}>{getTaskStatusIcon(task)}</div>
                            <div className='flex-1 flex flex-col justify-end w-full'>
                              <CardTitle className='font-semibold text-gray-900 text-xs lg:text-sm truncate'>{task.title}</CardTitle>
                              <CardDescription className='text-gray-600 text-[10px] lg:text-xs truncate'>{task.description}</CardDescription>
                              <div className='flex items-center gap-1 mt-1'>
                                <span className='text-yellow-600 font-bold text-[10px] lg:text-xs'>🪙</span>
                                <span className='text-yellow-600 font-bold text-[10px] lg:text-xs'>{task.reward}</span>
                              </div>
                            </div>
                            <Button variant='outline' className='mt-2 w-full text-[10px] lg:text-xs py-1 px-2 lg:px-3' onClick={() => handleUndoTask(task._id)}>
                              Undo
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Completed & Approved Tasks Section */}
              <Card className='shadow-none bg-white'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg lg:text-xl'>Completed & Approved</CardTitle>
                    <span className='text-xs lg:text-sm text-gray-500'>{approvedTasks.length} tasks approved</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4'>
                      {[1, 2, 3, 4].map(i => (
                        <Card key={i} className='relative bg-white rounded-xl flex flex-col justify-between p-3 aspect-square hover:shadow-lg transition-all animate-pulse'>
                          <div className='w-6 h-6 lg:w-8 lg:h-8 bg-gray-300 rounded-lg mb-2 mx-auto'></div>
                          <div className='flex-1 flex flex-col justify-end w-full'>
                            <div className='h-3 bg-gray-300 rounded mb-1'></div>
                            <div className='h-2 bg-gray-300 rounded mb-2'></div>
                          </div>
                          <div className='h-6 bg-gray-300 rounded'></div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4'>
                      {approvedTasks.map((task: Task) => (
                        <Card key={task._id} className='relative bg-white rounded-xl flex flex-col justify-between p-3 aspect-square hover:shadow-lg transition-all'>
                          <div className='absolute top-2 right-2'>{getTaskStatusBadge(task)}</div>
                          <CardContent className='flex flex-col items-center justify-between h-full p-0'>
                            <div className={`w-6 h-6 lg:w-8 lg:h-8 ${getTaskStatusBg(task)} rounded-lg flex items-center justify-center mb-2 mx-auto`}>{getTaskStatusIcon(task)}</div>
                            <div className='flex-1 flex flex-col justify-end w-full'>
                              <CardTitle className='font-semibold text-gray-900 text-xs lg:text-sm truncate'>{task.title}</CardTitle>
                              <CardDescription className='text-gray-600 text-[10px] lg:text-xs truncate'>{task.description}</CardDescription>
                              <div className='flex items-center gap-1 mt-1'>
                                <span className='text-yellow-600 font-bold text-[10px] lg:text-xs'>🪙</span>
                                <span className='text-yellow-600 font-bold text-[10px] lg:text-xs'>{task.reward}</span>
                              </div>
                            </div>
                            <Button variant='outline' className='mt-2 w-full text-[10px] lg:text-xs py-1 px-2 lg:px-3' onClick={() => handleUnapproveTask(task._id)}>
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
              <Card className='lg:sticky lg:top-1 shadow-none bg-white'>
                <CardHeader>
                  <CardTitle className='text-lg lg:text-xl'>Task Summary</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 lg:space-y-6'>
                  {/* Total Tasks */}
                  <div className='text-center'>
                    <div className='text-2xl lg:text-3xl font-bold text-gray-900 mb-1'>{tasks.length}</div>
                    <div className='text-xs lg:text-sm text-gray-600'>Total Tasks</div>
                  </div>

                  {/* Progress Bar */}
                  <div className='space-y-2'>
                    <div className='flex justify-between text-xs lg:text-sm'>
                      <span className='text-gray-600'>Progress</span>
                      <span className='font-semibold text-gray-900'>{tasks.length > 0 ? Math.round((approvedTasks.length / tasks.length) * 100) : 0}%</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div className='bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300' style={{ width: `${tasks.length > 0 ? (approvedTasks.length / tasks.length) * 100 : 0}%` }}></div>
                    </div>
                  </div>

                  {/* Task Status Breakdown */}
                  <div className='grid grid-cols-2 gap-3 lg:gap-4'>
                    <Card className='bg-green-50 border-green-200 shadow-none'>
                      <CardContent className='p-2 lg:p-3'>
                        <div className='text-center'>
                          <div className='text-lg lg:text-xl font-bold text-green-600 mb-1'>{approvedTasks.length}</div>
                          <div className='text-[8px] lg:text-[10px] text-green-700 leading-tight'>Approved</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className='bg-yellow-50 border-yellow-200 shadow-none'>
                      <CardContent className='p-2 lg:p-3'>
                        <div className='text-center'>
                          <div className='text-lg lg:text-xl font-bold text-yellow-600 mb-1'>{pendingApprovalTasks.length}</div>
                          <div className='text-[8px] lg:text-[10px] text-yellow-700 leading-tight'>Pending</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Coins Earned */}
                  <Card className='bg-yellow-50 border-yellow-200 shadow-none'>
                    <CardContent className='text-center p-3 lg:p-4'>
                      <div className='text-xl lg:text-2xl font-bold text-yellow-600 mb-1'>🪙 {totalCoins}</div>
                      <div className='text-[10px] lg:text-xs text-yellow-700'>Total Coins</div>
                    </CardContent>
                  </Card>

                  {/* Completion Rate */}
                  <div className='text-center'>
                    <div className='text-base lg:text-lg font-semibold text-gray-900 mb-1'>{tasks.length > 0 ? Math.round((approvedTasks.length / tasks.length) * 100) : 0}%</div>
                    <div className='text-[10px] lg:text-xs text-gray-600'>Approval Rate</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default Tasks;
