import { useState, useEffect } from "react";
import { Home, User, BookOpen, Play, FileText, CreditCard, Library, TrendingUp, Clock, CheckCircle, Target, Filter } from "lucide-react";
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Task } from "../../lib/types";
import { getTasks, completeTask, undoTask, getChildCoins, unapproveTask } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/use-toast";
import { Toaster } from "../ui/toaster";
import Notifications from "../notifications/Notifications";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const taskCategories = [
  { id: "all", name: "All Categories", color: "bg-gray-100 text-gray-800" },
  { id: "household", name: "Household Chores", color: "bg-blue-100 text-blue-800" },
  { id: "education", name: "Education & Learning", color: "bg-green-100 text-green-800" },
  { id: "kitchen", name: "Kitchen & Cooking", color: "bg-orange-100 text-orange-800" },
  { id: "health", name: "Health & Hygiene", color: "bg-red-100 text-red-800" },
  { id: "fitness", name: "Sports & Fitness", color: "bg-purple-100 text-purple-800" },
  { id: "creative", name: "Creative Activities", color: "bg-pink-100 text-pink-800" },
  { id: "music", name: "Music & Entertainment", color: "bg-indigo-100 text-indigo-800" },
  { id: "nature", name: "Nature & Outdoors", color: "bg-emerald-100 text-emerald-800" },
  { id: "custom", name: "Custom Tasks", color: "bg-gray-100 text-gray-800" },
];

const Tasks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCoins, setTotalCoins] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTime, setSelectedTime] = useState("all");

  // Filter tasks by selected category, status, and time
  const filteredTasks = tasks.filter((task: Task) => {
    // Category filter
    const taskCategory = task.category || "custom"; // Default to "custom" if missing
    const categoryMatch = selectedCategory === "all" || taskCategory === selectedCategory;

    // Status filter
    let statusMatch = true;
    if (selectedStatus === "completed") {
      statusMatch = task.completed && !task.approved;
    } else if (selectedStatus === "approved") {
      statusMatch = task.completed && task.approved;
    } else if (selectedStatus === "incomplete") {
      statusMatch = !task.completed;
    }

    // Time filter
    let timeMatch = true;
    if (selectedTime !== "all") {
      const taskDate = new Date(task.createdAt);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      if (selectedTime === "today") {
        timeMatch = taskDate >= today;
      } else if (selectedTime === "week") {
        timeMatch = taskDate >= weekAgo;
      } else if (selectedTime === "month") {
        timeMatch = taskDate >= monthAgo;
      } else if (selectedTime === "older") {
        timeMatch = taskDate < monthAgo;
      }
    }

    // Debug logging
    if (selectedCategory !== "all" || selectedStatus !== "all" || selectedTime !== "all") {
      console.log(`Task: ${task.title}`, {
        category: task.category || "MISSING",
        taskCategory: taskCategory,
        selectedCategory,
        categoryMatch,
        status: `${task.completed ? "completed" : "incomplete"}${task.approved ? " approved" : ""}`,
        selectedStatus,
        statusMatch,
        createdAt: task.createdAt,
        taskDate: new Date(task.createdAt),
        selectedTime,
        timeMatch,
        finalResult: categoryMatch && statusMatch && timeMatch,
      });
    }

    return categoryMatch && statusMatch && timeMatch;
  });

  const incompleteTasks = filteredTasks.filter((task: Task) => !task.completed);
  const pendingApprovalTasks = filteredTasks.filter((task: Task) => task.completed && !task.approved);
  const approvedTasks = filteredTasks.filter((task: Task) => task.completed && task.approved);

  // Function definitions
  const loadTasks = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

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
      console.log("Loading tasks for user ID:", user.id);

      const tasksData = await getTasks(token, user.id);
      console.log("=== LOADED TASKS ===");
      tasksData.forEach((task: Task, index: number) => {
        console.log(`Task ${index + 1}:`, {
          id: task._id,
          title: task.title,
          category: task.category || "MISSING CATEGORY",
          createdAt: task.createdAt,
          completed: task.completed,
          approved: task.approved,
        });

        // Check if task is missing category
        if (!task.category) {
          console.warn(`Task "${task.title}" is missing category field!`);
        }
      });
      console.log("=== END LOADED TASKS ===");
      setTasks(tasksData);
      console.log("Tasks loaded successfully:", tasksData);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadCoins = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        console.error("No token or user found");
        return;
      }

      const user = JSON.parse(userStr);
      console.log("Loading coins for user:", user.id);

      const coinsData = await getChildCoins(token, user.id);
      setTotalCoins(coinsData.coins);
      localStorage.setItem("currentCoins", coinsData.coins.toString());
      console.log("Coins loaded successfully:", coinsData.coins);
    } catch (error) {
      console.error("Failed to load coins:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Silent refresh function for background updates
  const silentRefreshTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        return;
      }

      const user = JSON.parse(userStr);
      const tasksData = await getTasks(token, user.id);
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to silent refresh tasks:", error);
    }
  };

  // Silent refresh function for coins
  const silentRefreshCoins = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        return;
      }

      const user = JSON.parse(userStr);
      const coinsData = await getChildCoins(token, user.id);
      setTotalCoins(coinsData.coins);
      localStorage.setItem("currentCoins", coinsData.coins.toString());
    } catch (error) {
      console.error("Failed to silent refresh coins:", error);
    }
  };

  // Silent refresh for both tasks and coins
  const silentRefreshAll = async () => {
    await silentRefreshTasks();
    await silentRefreshCoins();
  };

  const handleCoinUpdate = async () => {
    await loadCoins();
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
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
      const userId = user.id;

      await completeTask(token, taskId);
      await silentRefreshTasks();

      // Update last task update time
      const currentTime = Date.now();
      localStorage.setItem("lastTaskUpdate", currentTime.toString());

      toast({
        title: "Task Sent for Approval",
        description: "Your task has been sent to your parent for approval. You will receive your coins once approved.",
      });

      // Dispatch event to notify other components
      window.dispatchEvent(
        new CustomEvent("taskCompleted", {
          detail: { taskId, childId: userId, timestamp: currentTime },
        })
      );
    } catch (error) {
      console.error("Failed to complete task:", error);
      toast({
        title: "Error completing task",
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
      const userId = user.id;

      await undoTask(token, taskId);
      await silentRefreshTasks();

      // Update last task update time
      const currentTime = Date.now();
      localStorage.setItem("lastTaskUpdate", currentTime.toString());

      toast({
        title: "Task Undone",
        description: "The task has been undone and sent back to remaining tasks.",
      });

      // Dispatch event to notify other components
      window.dispatchEvent(
        new CustomEvent("taskCompleted", {
          detail: { taskId, childId: userId, timestamp: currentTime },
        })
      );
    } catch (error) {
      console.error("Failed to undo task:", error);
      toast({
        title: "Error",
        description: "Failed to undo task. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadTasks(true);
    loadCoins(true);

    // Check for new tasks in localStorage on mount
    const newTaskInfo = localStorage.getItem("newTaskCreated");
    if (newTaskInfo) {
      try {
        const taskInfo = JSON.parse(newTaskInfo);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (taskInfo.childId === user.id) {
          // Refresh tasks immediately
          silentRefreshTasks();

          // Clear the localStorage item
          localStorage.removeItem("newTaskCreated");
        }
      } catch (error) {
        console.error("Failed to parse new task info on mount:", error);
      }
    }

    // Enhanced auto-refresh system
    const autoRefresh = async () => {
      try {
        // Check for new tasks or updates
        const lastUpdate = localStorage.getItem("lastTaskUpdate");
        const lastUpdateTime = lastUpdate ? parseInt(lastUpdate) : 0;
        const currentTime = Date.now();

        // If more than 3 seconds have passed since last update, refresh silently
        if (currentTime - lastUpdateTime > 3000) {
          console.log("Auto-refreshing tasks page silently...");
          await silentRefreshAll();
        }
      } catch (error) {
        console.error("Error in auto-refresh:", error);
      }
    };

    // Set up interval for periodic refresh
    const interval = setInterval(autoRefresh, 3000);

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
          console.log("New task created event received, silently refreshing tasks...");
          // Immediately refresh tasks to show the new task
          await silentRefreshTasks();
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
            console.log("New task detected in localStorage, silently refreshing tasks...");
            // Immediately refresh tasks
            await silentRefreshTasks();

            // Clear the localStorage item
            localStorage.removeItem("newTaskCreated");
          }
        } catch (error) {
          console.error("Failed to parse new task info:", error);
        }
      }

      // Listen for task approval events
      if (event.key === "taskApproved" && event.newValue) {
        try {
          const info = JSON.parse(event.newValue);
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          if (info.childId === user.id) {
            console.log("Task approval detected in localStorage, silently refreshing tasks and coins...");
            // Immediately refresh tasks and coins
            await silentRefreshAll();

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

      // Listen for last update time changes
      if (event.key === "lastTaskUpdate") {
        console.log("Last update time changed, silently refreshing tasks...");
        silentRefreshAll();
      }
    };

    window.addEventListener("taskCreated", handleNewTaskCreated);
    window.addEventListener("storage", handleStorageChange);

    // Listen for visibility changes to refresh coins when returning to page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Tasks page became visible, silently refreshing data...");
        silentRefreshAll();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("taskCompleted", handleCoinUpdate);
      window.removeEventListener("coinSpent", handleCoinUpdate);
      window.removeEventListener("storage", handleCoinUpdate);
      window.removeEventListener("taskCreated", handleNewTaskCreated);
      window.removeEventListener("storage", handleStorageChange);
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
            console.log("Task approval event received, silently refreshing tasks and coins...");
            // Immediately refresh tasks and coins
            await silentRefreshAll();

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
    const handleTaskApprovedCustom = async (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log("🎉 Tasks page received custom task approval event:", customEvent.detail);
      const { childId: eventChildId } = customEvent.detail;
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (eventChildId === user.id) {
        console.log("✅ Tasks page updating for approved task");
        // Immediately refresh tasks and coins
        await silentRefreshAll();

        // Show success notification
        toast({
          title: "Task Approved! 🎉",
          description: "Your task has been approved and you received coins!",
        });
      }
    };

    // Enhanced polling for task approval events
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
            await silentRefreshAll();

            // Show success notification
            toast({
              title: "Task Approved! 🎉",
              description: "Your task has been approved and you received coins!",
            });

            // Clear the localStorage item
            localStorage.removeItem("taskApproved");
          }
        } catch (error) {
          console.error("Failed to handle task approval in polling:", error);
        }
      }

      // Check for new task creation
      const newTaskInfo = localStorage.getItem("newTaskCreated");
      if (newTaskInfo) {
        try {
          const info = JSON.parse(newTaskInfo);
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          if (info.childId === user.id) {
            console.log("🔔 Tasks page found new task info in localStorage:", info);
            // Immediately refresh tasks
            await silentRefreshTasks();

            // Clear the localStorage item
            localStorage.removeItem("newTaskCreated");
          }
        } catch (error) {
          console.error("Failed to handle new task in polling:", error);
        }
      }
    }, 2000); // Check every 2 seconds

    window.addEventListener("storage", handleTaskApproved);
    window.addEventListener("taskApproved", handleTaskApprovedCustom);

    return () => {
      window.removeEventListener("storage", handleTaskApproved);
      window.removeEventListener("taskApproved", handleTaskApprovedCustom);
      clearInterval(approvalCheckInterval);
    };
  }, []);

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

  const handleRefreshClick = () => {
    loadTasks(true);
    loadCoins(true);
  };

  const getCategoryBadge = (category: string) => {
    const categoryInfo = taskCategories.find(cat => cat.id === category);
    if (!categoryInfo) return null;

    return <Badge className={`${categoryInfo.color} text-xs`}>{categoryInfo.name}</Badge>;
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'>
      <Toaster />

      {/* Header */}
      <div className='bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-4'>
              <div className='bg-gradient-to-br from-[#87d4ee] to-[#4ec3f7] rounded-xl p-2'>
                <Target className='w-6 h-6 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-gray-900'>Tasks Dashboard</h1>
            </div>

            <div className='flex items-center gap-4'>
              {/* Notifications */}
              <div className='relative'>
                {(() => {
                  const user = JSON.parse(localStorage.getItem("user") || "{}");
                  const token = localStorage.getItem("token");
                  if (user.id && token) {
                    return <Notifications childId={user.id} token={token} userRole='child' />;
                  }
                  return null;
                })()}
              </div>

              {/* Coins Display */}
              <div className='flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-full'>
                <span className='text-yellow-600 font-bold text-lg'>🪙</span>
                <span className='text-yellow-600 font-bold text-lg'>{totalCoins}</span>
                <Button variant='ghost' size='sm' onClick={handleRefreshClick} className='ml-2 p-1 h-6 w-6 hover:bg-yellow-200'>
                  🔄
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        {/* Main Content Area */}
        <main className='space-y-6 lg:space-y-8 overflow-y-auto h-full p-4 lg:p-5 pt-0 pb-0'>
          {/* Task Summary Sidebar */}
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6'>
            {/* Main Content */}
            <div className='lg:col-span-3 space-y-6 lg:space-y-8'>
              {/* Filters */}
              <Card className='shadow-none bg-white'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg lg:text-xl'>Filter Tasks</CardTitle>
                    <div className='flex items-center gap-2'>
                      <Filter className='w-4 h-4 text-muted-foreground' />
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className='w-40'>
                          <SelectValue placeholder='Category' />
                        </SelectTrigger>
                        <SelectContent>
                          {taskCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className='flex items-center gap-2'>
                                <div className={`w-3 h-3 rounded-full ${category.color.replace("bg-", "bg-").replace(" text-", "")}`}></div>
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className='w-36'>
                          <SelectValue placeholder='Status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>All Status</SelectItem>
                          <SelectItem value='incomplete'>Incomplete</SelectItem>
                          <SelectItem value='completed'>Pending Approval</SelectItem>
                          <SelectItem value='approved'>Approved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger className='w-36'>
                          <SelectValue placeholder='Time' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>All Time</SelectItem>
                          <SelectItem value='today'>Today</SelectItem>
                          <SelectItem value='week'>Last Week</SelectItem>
                          <SelectItem value='month'>Last Month</SelectItem>
                          <SelectItem value='older'>Older than Month</SelectItem>
                        </SelectContent>
                      </Select>
                      {(selectedCategory !== "all" || selectedStatus !== "all" || selectedTime !== "all") && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setSelectedCategory("all");
                            setSelectedStatus("all");
                            setSelectedTime("all");
                          }}>
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Showing {filteredTasks.length} of {tasks.length} tasks
                  </div>
                </CardHeader>
              </Card>

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
                              <div className='mt-1'>{getCategoryBadge(task.category || "custom")}</div>
                              <div className='text-[8px] lg:text-[10px] text-gray-500 mt-1'>{new Date(task.createdAt).toLocaleDateString()}</div>
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
                              <div className='text-[8px] lg:text-[10px] text-gray-500 mt-1'>{new Date(task.createdAt).toLocaleDateString()}</div>
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
                              <div className='text-[8px] lg:text-[10px] text-gray-500 mt-1'>{new Date(task.createdAt).toLocaleDateString()}</div>
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
    </div>
  );
};

export default Tasks;
