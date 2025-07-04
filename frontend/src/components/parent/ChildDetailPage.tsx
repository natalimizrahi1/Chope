import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChildren, getTasks, createTask, approveTask, rejectTask, getChildById, deleteTask } from "../../lib/api";
import type { Task, Animal } from "../../lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { Plus, CheckCircle, XCircle, Trash, Clock, Grid, List, Filter, LogOut, Menu } from "lucide-react";
import { Badge } from "../ui/badge";
import TaskCategorySelector from "./TaskCategorySelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

type Child = {
  _id: string;
  name: string;
  email: string;
  coins: number;
  animal?: Animal;
};

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

const childColors = ["bg-blue-50", "bg-indigo-50", "bg-purple-50", "bg-teal-50", "bg-yellow-50", "bg-orange-50", "bg-pink-50", "bg-green-50"];
function getChildColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return childColors[Math.abs(hash) % childColors.length];
}

export default function ChildDetailPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [token] = useState(localStorage.getItem("token") || "");
  const [newTask, setNewTask] = useState<{ title: string; description: string; reward: number; category?: string }>({ title: "", description: "", reward: 0, category: undefined });
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTime, setSelectedTime] = useState("all");
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debug: Log filter changes
  useEffect(() => {}, [selectedCategory, selectedStatus, selectedTime, tasks.length]);

  const loadChildData = async () => {
    if (!token || !childId) return;
    try {
      const childData = await getChildById(token, childId);
      setChild(childData);
    } catch (error) {
      console.error("Failed to load child data:", error);
      if (error instanceof Error && error.message.includes("401")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login/parent");
      }
    }
  };

  const loadChildren = async () => {
    console.log("🔍 loadChildren called");
    if (!token) {
      console.log("🔍 No token, returning");
      return;
    }

    try {
      console.log("🔍 Calling getChildren API...");
      const childrenData = await getChildren(token);
      console.log("🔍 Children loaded:", childrenData);
      setChildren(childrenData);
    } catch (error) {
      console.error("Failed to load children:", error);
    }
  };

  const loadTasks = async () => {
    if (!childId) return;
    try {
      const tasksData = await getTasks(token, childId);
      // Removed console.log loop to prevent infinite rendering
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      if (error instanceof Error && error.message.includes("401")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login/parent");
      }
    }
  };

  // Silent refresh functions for background updates
  const silentRefreshChildData = async () => {
    if (!token || !childId) return;
    try {
      const childData = await getChildById(token, childId);
      setChild(childData);
    } catch (error) {
      console.error("Failed to silent refresh child data:", error);
    }
  };

  const silentRefreshTasks = async () => {
    if (!childId) return;
    try {
      const tasksData = await getTasks(token, childId);
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to silent refresh tasks:", error);
    }
  };

  const silentRefreshAll = async () => {
    await silentRefreshChildData();
    await silentRefreshTasks();
  };

  useEffect(() => {
    // Check if user is logged in and is a parent
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.role !== "parent") {
      toast({
        title: "Access denied",
        description: "Please login as a parent to access this page.",
        variant: "destructive",
      });
      navigate("/login/parent");
      return;
    }

    // Load child data and children list
    if (childId) {
      loadChildData();
    }
    loadChildren();
  }, [childId, token, navigate, toast]);

  useEffect(() => {
    if (child && token) {
      loadTasks();
    }
  }, [child, token]);

  // Single useEffect for all auto-refresh and event handling
  useEffect(() => {
    if (!childId || !token) return;

    const loadData = async () => {
      await loadChildData();
      await loadTasks();
    };

    loadData();

    // Silent auto-refresh system
    const autoRefresh = async () => {
      try {
        // Check for new tasks or updates
        const lastUpdate = localStorage.getItem("lastTaskUpdate");
        const lastUpdateTime = lastUpdate ? parseInt(lastUpdate) : 0;
        const currentTime = Date.now();

        // If more than 10 seconds have passed since last update, refresh silently
        if (currentTime - lastUpdateTime > 10000) {
          console.log("Auto-refreshing child detail page silently...");
          await silentRefreshAll();
        }
      } catch (error) {
        console.error("Error in auto-refresh:", error);
      }
    };

    // Set up auto-refresh every 10 seconds
    const interval = setInterval(autoRefresh, 10000);

    // Listen for visibility changes to refresh when returning to page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("ChildDetailPage became visible, silently refreshing data...");
        silentRefreshAll();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for storage events (when tasks are created or approved)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "lastTaskUpdate") {
        console.log("Storage event: Task update detected, silently refreshing child detail page...");
        silentRefreshAll();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Listen for custom events
    const handleTaskCreated = () => {
      console.log("Custom event: Task created, silently refreshing child detail page...");
      silentRefreshAll();
    };

    const handleTaskApproved = () => {
      console.log("Custom event: Task approved, silently refreshing child detail page...");
      silentRefreshAll();
    };

    window.addEventListener("taskCreated", handleTaskCreated);
    window.addEventListener("taskApproved", handleTaskApproved);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("taskCreated", handleTaskCreated);
      window.removeEventListener("taskApproved", handleTaskApproved);
    };
  }, [childId, token]); // Only depend on childId and token

  const handleCreateTask = async () => {
    if (!child) return;
    try {
      const createdTask = await createTask(token, {
        ...newTask,
        child: child._id,
        category: newTask.category || "custom",
      });

      setNewTask({ title: "", description: "", reward: 0, category: undefined });
      setShowCategorySelector(false);

      await loadTasks();

      // Update last task update time
      const currentTime = Date.now();
      localStorage.setItem("lastTaskUpdate", currentTime.toString());

      // Dispatch event to notify child's dashboard about new task
      console.log("📤 Parent: Dispatching newTaskCreated event");
      console.log("📤 Parent: Event detail:", { task: createdTask, childId: childId });

      const taskCreatedEvent = new CustomEvent("newTaskCreated", {
        detail: { task: createdTask, childId: childId },
      });
      window.dispatchEvent(taskCreatedEvent);
      console.log("📤 Parent: Event dispatched successfully");

      // Also store in localStorage for immediate detection
      console.log("📤 Parent: Storing newTaskCreated in localStorage");
      const storageData = {
        task: createdTask,
        childId: childId,
        timestamp: currentTime,
      };
      console.log("📤 Parent: Storage data:", storageData);

      localStorage.setItem("newTaskCreated", JSON.stringify(storageData));

      // Force storage event for immediate update in all tabs
      console.log("📤 Parent: Dispatching storage event");
      window.dispatchEvent(new Event("storage"));
      console.log("📤 Parent: Storage event dispatched");

      // Clear the localStorage item after a short delay to prevent accumulation
      setTimeout(() => {
        localStorage.removeItem("newTaskCreated");
      }, 2000);

      // Refresh child data to update any changes
      setTimeout(() => {
        loadChildData();
      }, 500);

      toast({
        title: "Task created successfully",
        description: "The task has been added to your child's list.",
      });
    } catch (error) {
      console.error("Failed to create task:", error);
      toast({
        title: "Failed to create task",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTaskSelect = (taskTemplate: { title: string; description: string; reward: number; category: string }) => {
    setNewTask({
      title: taskTemplate.title,
      description: taskTemplate.description,
      reward: taskTemplate.reward,
      category: taskTemplate.category,
    });
    setShowCategorySelector(false);
  };

  const handleCustomTask = (customTask: { title: string; description: string; reward: number }) => {
    setNewTask({
      ...customTask,
      category: "custom",
    });
    setShowCategorySelector(false);
  };

  // Handler for navigating to child detail page
  const handleChildSelect = (childId: string) => {
    navigate(`/parent/child/${childId}`);
  };

  const handleApproveTask = async (taskId: string) => {
    try {
      await approveTask(token, taskId);
      await loadTasks();
      await loadChildData(); // Refresh child data to get updated coins

      // Update last task update time
      const currentTime = Date.now();
      localStorage.setItem("lastTaskUpdate", currentTime.toString());

      // Notify child for immediate update
      localStorage.setItem(
        "taskApproved",
        JSON.stringify({
          taskId,
          childId: child?._id,
          timestamp: currentTime,
        })
      );
      window.dispatchEvent(new Event("storage"));

      // Also dispatch custom event for same-tab notification
      const customEvent = new CustomEvent("taskApproved", {
        detail: { childId: child?._id, taskId, timestamp: currentTime },
      });
      window.dispatchEvent(customEvent);

      // Clear the localStorage item after a short delay to prevent accumulation
      setTimeout(() => {
        localStorage.removeItem("taskApproved");
      }, 2000);

      // Refresh child data to update coins display
      setTimeout(() => {
        loadChildData();
      }, 500);

      toast({
        title: "Task approved",
        description: "Your child has received the coins for this task.",
      });
    } catch (error) {
      console.error("Error approving task:", error);
      toast({
        title: "Failed to approve task",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectTask = async (taskId: string) => {
    try {
      await rejectTask(token, taskId);
      await loadTasks();
      await loadChildData(); // Refresh child data to get updated coins
      toast({
        title: "Task rejected",
        description: "The task has been marked as incomplete.",
      });
    } catch (error) {
      toast({
        title: "Failed to reject task",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!token) {
      return;
    }

    try {
      await deleteTask(token, taskId);

      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });

      loadTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!child) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground'>Loading child details...</p>
        </div>
      </div>
    );
  }

  const approvedTasks = tasks.filter((task: Task) => task.completed && task.approved);
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (approvedTasks.length / totalTasks) * 100 : 0;

  const filteredTasks = tasks.filter((task: Task) => {
    const taskCategory = task.category || "custom";
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

      // Calculate days difference
      const taskTime = taskDate.getTime();
      const nowTime = now.getTime();
      const daysDiff = Math.floor((nowTime - taskTime) / (1000 * 60 * 60 * 24));

      if (selectedTime === "today") {
        // Same day
        const taskDay = taskDate.getDate();
        const taskMonth = taskDate.getMonth();
        const taskYear = taskDate.getFullYear();
        const nowDay = now.getDate();
        const nowMonth = now.getMonth();
        const nowYear = now.getFullYear();
        timeMatch = taskDay === nowDay && taskMonth === nowMonth && taskYear === nowYear;
      } else if (selectedTime === "week") {
        // Within last 7 days (but not today)
        timeMatch = daysDiff > 0 && daysDiff <= 7;
      } else if (selectedTime === "month") {
        // Within last 30 days (but not this week)
        timeMatch = daysDiff > 7 && daysDiff <= 30;
      } else if (selectedTime === "older") {
        // More than 30 days ago
        timeMatch = daysDiff > 30;
      }

      // Debug time calculation
      console.log(`Time calculation for "${task.title}":`, {
        taskDate: taskDate.toISOString(),
        taskDateLocal: taskDate.toLocaleDateString(),
        daysDiff,
        selectedTime,
        timeMatch,
        note: `Task is ${daysDiff} days ${daysDiff > 0 ? "ago" : "in the future"}`,
      });
    }

    // Debug logging for ALL tasks when filters are active
    if (selectedCategory !== "all" || selectedStatus !== "all" || selectedTime !== "all") {
      console.log(`Task: "${task.title}"`, {
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

    const result = categoryMatch && statusMatch && timeMatch;
    return result;
  });

  // Additional debug: Show which tasks passed each filter
  if (selectedCategory !== "all" || selectedStatus !== "all" || selectedTime !== "all") {
    tasks.forEach((task, index) => {
      const taskCategory = task.category || "custom";
      const categoryMatch = selectedCategory === "all" || taskCategory === selectedCategory;

      let statusMatch = true;
      if (selectedStatus === "completed") {
        statusMatch = task.completed && !task.approved;
      } else if (selectedStatus === "approved") {
        statusMatch = task.completed && task.approved;
      } else if (selectedStatus === "incomplete") {
        statusMatch = !task.completed;
      }

      let timeMatch = true;
      if (selectedTime !== "all") {
        const taskDate = new Date(task.createdAt);
        const now = new Date();

        // Calculate days difference
        const taskTime = taskDate.getTime();
        const nowTime = now.getTime();
        const daysDiff = Math.floor((nowTime - taskTime) / (1000 * 60 * 60 * 24));

        if (selectedTime === "today") {
          // Same day
          const taskDay = taskDate.getDate();
          const taskMonth = taskDate.getMonth();
          const taskYear = taskDate.getFullYear();
          const nowDay = now.getDate();
          const nowMonth = now.getMonth();
          const nowYear = now.getFullYear();
          timeMatch = taskDay === nowDay && taskMonth === nowMonth && taskYear === nowYear;
        } else if (selectedTime === "week") {
          // Within last 7 days (but not today)
          timeMatch = daysDiff > 0 && daysDiff <= 7;
        } else if (selectedTime === "month") {
          // Within last 30 days (but not this week)
          timeMatch = daysDiff > 7 && daysDiff <= 30;
        } else if (selectedTime === "older") {
          // More than 30 days ago
          timeMatch = daysDiff > 30;
        }
      }

      console.log(`Task ${index + 1}: "${task.title}"`, {
        category: `${taskCategory} (${categoryMatch ? "✓" : "✗"})`,
        status: `${task.completed ? "completed" : "incomplete"}${task.approved ? " approved" : ""} (${statusMatch ? "✓" : "✗"})`,
        time: `${new Date(task.createdAt).toLocaleDateString()} (${timeMatch ? "✓" : "✗"})`,
        finalResult: categoryMatch && statusMatch && timeMatch ? "SHOWN" : "HIDDEN",
      });
    });
  }

  const getTaskStatusBadge = (task: Task) => {
    if (task.approved) {
      return <Badge className='bg-green-100 text-green-800'>Approved</Badge>;
    } else if (task.completed) {
      return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
    }
    return <Badge variant='outline'>Incomplete</Badge>;
  };

  const getTaskStatusIcon = (task: Task) => {
    if (task.approved) {
      return <CheckCircle className='w-4 h-4 text-green-500' />;
    } else if (task.completed) {
      return <Clock className='w-4 h-4 text-yellow-500' />;
    }
    return <div className='w-4 h-4 bg-gray-400 rounded' />;
  };

  const getCategoryBadge = (category: string) => {
    const categoryInfo = taskCategories.find(cat => cat.id === category);
    if (!categoryInfo) return null;

    return <Badge className={`${categoryInfo.color} text-xs`}>{categoryInfo.name}</Badge>;
  };

  // Get parent id robustly
  const userObj = JSON.parse(localStorage.getItem("user") || "{}") || {};
  console.log("user from localStorage:", userObj);
  const parentId = userObj._id || userObj.id || "N/A";

  return (
    <div className='flex h-screen bg-[#f3f3f3] font-sans'>
      {/* Sidebar Desktop */}
      <aside className='hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col'>
        {/* Logo */}
        <div className='border-b border-gray-200'>
          <img src='/light_logo.svg' alt='CHOPE Logo' className='mx-0 my-[-30px] w-40 h-40' />
        </div>
        {/* Navigation */}
        <nav className='px-6 pt-4 pb-2'>
          <button className='w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 font-semibold mb-4 cursor-pointer text-sm hover:bg-gray-50' onClick={() => navigate("/parent/dashboard")}>
            <svg className='w-5 h-5 text-indigo-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6' />
            </svg>
            Dashboard
          </button>
        </nav>
        {/* Children List */}
        <div className='flex-1 px-6 pb-6 overflow-y-auto'>
          <h3 className='text-sm font-semibold text-gray-700 mb-4 text-left'>Your Children</h3>
          <div className='space-y-3'>
            {children.map(child => (
              <button key={child._id} onClick={() => handleChildSelect(child._id)} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${child._id === childId ? "bg-indigo-100 border border-indigo-300" : "hover:bg-gray-50"}`}>
                <Avatar className={`h-8 w-8 ${getChildColor(child.name)}`}>
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`} alt={child.name} />
                  <AvatarFallback className='font-medium'>{child.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>{child.name}</p>
                  <p className='text-xs text-gray-500'>{child.coins} coins</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* Logout Button */}
        <div className='p-6 border-t border-gray-200'>
          <Button
            variant='outline'
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              navigate("/login/parent");
            }}
            className='w-full flex items-center gap-2'>
            <LogOut className='w-4 h-4' />
            Logout
          </Button>
        </div>
      </aside>
      {/* Sidebar Mobile (Sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <button className='lg:hidden fixed top-4 left-4 z-30 bg-white rounded-full p-2 shadow border border-gray-200'>
            <Menu className='w-6 h-6 text-gray-700' />
          </button>
        </SheetTrigger>
        <SheetContent side='left' className='w-64 p-0 bg-white border-r border-gray-200 shadow-lg'>
          <div className='flex flex-col h-full'>
            {/* Logo */}
            <div className='border-b border-gray-200'>
              <img src='/lic/light_logo.svg' alt='CHOPE Logo' className='mx-0 my-[-30px] w-40 h-40' />
            </div>
            {/* Navigation */}
            <nav className='px-6 pt-4 pb-2'>
              <button className='w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 font-semibold mb-4 cursor-pointer text-sm hover:bg-gray-50' onClick={() => navigate("/parent/dashboard")}>
                <svg className='w-5 h-5 text-indigo-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6' />
                </svg>
                Dashboard
              </button>
            </nav>
            {/* Children List */}
            <div className='flex-1 px-6 pb-6 overflow-y-auto'>
              <h3 className='text-sm font-semibold text-gray-700 mb-4 text-left'>Your Children</h3>
              <div className='space-y-3'>
                {children.map(child => (
                  <button key={child._id} onClick={() => handleChildSelect(child._id)} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${child._id === childId ? "bg-indigo-100 border border-indigo-300" : "hover:bg-gray-50"}`}>
                    <Avatar className={`h-8 w-8 ${getChildColor(child.name)}`}>
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`} alt={child.name} />
                      <AvatarFallback className='font-medium'>{child.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>{child.name}</p>
                      <p className='text-xs text-gray-500'>{child.coins} coins</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {/* Logout Button */}
            <div className='p-6 border-t border-gray-200'>
              <Button
                variant='outline'
                onClick={() => {
                  localStorage.removeItem("user");
                  localStorage.removeItem("token");
                  navigate("/login/parent");
                }}
                className='w-full flex items-center gap-2'>
                <LogOut className='w-4 h-4' />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {/* Main Content Area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <main className='flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 space-y-6'>
          <div className='container mx-auto flex-1 flex-col gap-4 px-0 sm:px-2 md:px-6 py-4'>
            {/* Cards grid responsive */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6'>
              <Card className='rounded-2xl border border-gray-200 shadow-md p-6 flex flex-col items-center bg-white'>
                <CardTitle className='text-lg font-bold text-gray-800 mb-2'>Total Tasks</CardTitle>
                <div className='text-3xl font-bold text-blue-500'>{totalTasks}</div>
                <div className='text-sm text-gray-500'>Tasks</div>
              </Card>
              <Card className='rounded-2xl border border-gray-200 shadow-md p-6 flex flex-col items-center bg-white'>
                <CardTitle className='text-lg font-bold text-gray-800 mb-2'>Progress</CardTitle>
                <div className='flex items-start justify-center w-full h-20'>
                  <span className='text-3xl font-extrabold text-green-500'>{Math.round(progress)}%</span>
                </div>
              </Card>
              <Card className='rounded-2xl border border-gray-200 shadow-md p-6 flex flex-col items-center bg-white'>
                <CardTitle className='text-lg font-bold text-gray-800 mb-2'>Coins</CardTitle>
                <div className='text-3xl font-bold text-yellow-500'>{child.coins}</div>
                <div className='text-sm text-gray-500'>Earned</div>
              </Card>
              <Card className='rounded-2xl border border-gray-200 shadow-md p-6 flex flex-col items-center bg-white '>
                <CardTitle className='text-lg font-bold text-gray-800 mb-2'>Approved Tasks</CardTitle>
                <div className='text-3xl font-bold text-green-500'>{approvedTasks.length}</div>
                <div className='text-sm text-gray-500'>Approved</div>
              </Card>
            </div>
            {/* Create Task card: make form fields and buttons full width on mobile */}
            <Card className='rounded-2xl border border-gray-200 shadow-md p-4 sm:p-6 mb-6 bg-white'>
              <CardHeader>
                <div className='flex flex-col sm:flex-row items-center justify-between gap-2 w-full'>
                  <div>
                    <CardTitle className='text-lg font-bold text-gray-900'>Create New Task</CardTitle>
                    <CardDescription className='text-gray-500'>Add a new task for {child.name}</CardDescription>
                  </div>
                  <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
                    <Button variant={showCategorySelector ? "default" : "outline"} size='sm' className='rounded-full px-4 py-2 text-base font-semibold w-full sm:w-auto' onClick={() => setShowCategorySelector(!showCategorySelector)}>
                      <Grid className='w-4 h-4 mr-2' /> Task Categories
                    </Button>
                    <Button variant={!showCategorySelector ? "default" : "outline"} size='sm' className='rounded-full px-4 py-2 text-base font-semibold w-full sm:w-auto' onClick={() => setShowCategorySelector(false)}>
                      <List className='w-4 h-4 mr-2' /> Quick Create
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {showCategorySelector ? (
                  <TaskCategorySelector onTaskSelect={handleTaskSelect} onCustomTask={handleCustomTask} />
                ) : (
                  <div className='grid gap-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='title'>Title</Label>
                      <Input id='title' value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder='Enter task title' className='rounded-lg border-gray-300' />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='description'>Description</Label>
                      <Input id='description' value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder='Enter task description' className='rounded-lg border-gray-300' />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='category'>Category</Label>
                      <div className='flex items-center gap-2'>
                        <Select value={newTask.category || "custom"} onValueChange={value => setNewTask({ ...newTask, category: value })}>
                          <SelectTrigger className='flex-1 rounded-lg border-gray-300'>
                            <SelectValue placeholder='Select category' />
                          </SelectTrigger>
                          <SelectContent className='bg-white border border-gray-200 shadow-lg'>
                            <SelectItem value='custom'>
                              <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-gray-400'></div>
                                Custom Task
                              </div>
                            </SelectItem>
                            <SelectItem value='household'>
                              <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-blue-400'></div>
                                Household Chores
                              </div>
                            </SelectItem>
                            <SelectItem value='education'>
                              <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-green-400'></div>
                                Education & Learning
                              </div>
                            </SelectItem>
                            <SelectItem value='kitchen'>
                              <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-orange-400'></div>
                                Kitchen & Cooking
                              </div>
                            </SelectItem>
                            <SelectItem value='health'>
                              <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-red-400'></div>
                                Health & Hygiene
                              </div>
                            </SelectItem>
                            <SelectItem value='fitness'>
                              <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-purple-400'></div>
                                Sports & Fitness
                              </div>
                            </SelectItem>
                            <SelectItem value='creative'>
                              <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-pink-400'></div>
                                Creative Activities
                              </div>
                            </SelectItem>
                            <SelectItem value='music'>
                              <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-indigo-400'></div>
                                Music & Entertainment
                              </div>
                            </SelectItem>
                            <SelectItem value='nature'>
                              <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-emerald-400'></div>
                                Nature & Outdoors
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {newTask.category && newTask.category !== "custom" && (
                          <Badge variant='outline' className='text-xs'>
                            {getCategoryBadge(newTask.category)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='reward'>Reward (coins)</Label>
                      <Input id='reward' type='number' value={newTask.reward} onChange={e => setNewTask({ ...newTask, reward: parseInt(e.target.value) || 0 })} placeholder='Enter reward amount' className='rounded-lg border-gray-300' />
                    </div>
                    <Button onClick={handleCreateTask} disabled={!newTask.title || !newTask.description || newTask.reward <= 0} className='w-full py-3 rounded-full text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700'>
                      <Plus className='mr-2 h-5 w-5' /> Create Task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Tasks List: add overflow-x-auto for mobile */}
            <Card className='rounded-2xl border border-gray-200 shadow-md p-4 sm:p-6 mb-6 bg-white'>
              <CardHeader>
                <CardTitle className='text-lg font-bold text-gray-900'>Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-col sm:flex-row items-center gap-2 mb-4'>
                  <Filter className='w-5 h-5 text-muted-foreground' />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className='w-40 rounded-lg border-gray-300'>
                      <SelectValue placeholder='Category' />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-gray-200 shadow-lg'>
                      {taskCategories.map(category => (
                        <SelectItem key={category.id} value={category.id} className='!p-0'>
                          <div className='flex items-center gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-gray-50 cursor-pointer'>
                            <div className={`w-4 h-4 rounded-full ${category.color.split(" ")[0]}`}></div>
                            <span className='text-sm font-medium text-gray-800 text-left flex-1'>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className='w-36 rounded-lg border-gray-300'>
                      <SelectValue placeholder='Status' />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-gray-200 shadow-lg'>
                      <SelectItem value='all'>All Status</SelectItem>
                      <SelectItem value='incomplete'>Incomplete</SelectItem>
                      <SelectItem value='completed'>Pending Approval</SelectItem>
                      <SelectItem value='approved'>Approved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger className='w-36 rounded-lg border-gray-300'>
                      <SelectValue placeholder='Time' />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-gray-200 shadow-lg'>
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
                      className='rounded-full px-4 py-2 text-base font-semibold'
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedStatus("all");
                        setSelectedTime("all");
                      }}>
                      Clear
                    </Button>
                  )}
                </div>
                <div className='overflow-x-auto'>
                  <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
                    {filteredTasks.map(task => (
                      <Card key={task._id} className='rounded-xl border border-gray-200 shadow p-4 flex flex-col w-full'>
                        <CardHeader className='flex flex-row items-center justify-between pb-2'>
                          <div className='flex items-center gap-2'>
                            {!task.completed && (
                              <Button size='sm' variant='ghost' className='h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700' onClick={() => handleDeleteTask(task._id)}>
                                <Trash className='w-4 h-4' />
                              </Button>
                            )}
                            <CardTitle className='text-base font-semibold'>{task.title}</CardTitle>
                          </div>
                          {getTaskStatusIcon(task)}
                        </CardHeader>
                        <CardContent className='pb-1'>
                          <CardDescription className='text-gray-600 mb-2'>{task.description}</CardDescription>
                          <div className='flex flex-row flex-nowrap items-center gap-2 mt-4 text-yellow-600 font-semibold text-xs'>
                            <Badge variant={task.completed ? "default" : "outline"}>{task.reward} coins</Badge>
                            {getCategoryBadge(task.category || "custom")}
                            {getTaskStatusBadge(task)}
                          </div>
                          <div className='text-xs text-muted-foreground mt-3'>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
                        </CardContent>
                        <CardContent className='pt-0'>
                          {task.completed && !task.approved && (
                            <div className='flex gap-2'>
                              <Button size='sm' className='flex-1 bg-green-600 hover:bg-green-700 rounded-full text-white text-base py-2' onClick={() => handleApproveTask(task._id)}>
                                <CheckCircle className='w-4 h-4 mr-1' /> Approve
                              </Button>
                              <Button size='sm' variant='outline' className='flex-1 rounded-full text-base py-2 text-gray-800 border-gray-300' onClick={() => handleRejectTask(task._id)}>
                                <XCircle className='w-4 h-4 mr-1' /> Reject
                              </Button>
                            </div>
                          )}
                          {task.approved && (
                            <div className='flex gap-2'>
                              <div className='flex-1 text-center text-green-600 font-semibold text-base'>✓ Coins awarded!</div>
                            </div>
                          )}
                          {task.completed && !task.approved && <div className='text-xs text-gray-500 mt-2 text-center'>Cannot delete - Task completed</div>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
