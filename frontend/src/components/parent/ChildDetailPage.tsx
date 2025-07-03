import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChildren, getTasks, createTask, approveTask, rejectTask, getChildById, deleteTask } from "../../lib/api";
import type { Task, Animal } from "../../lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { Plus, CheckCircle, XCircle, Clock, Grid, List, Filter, Copy, LogOut, ArrowLeft } from "lucide-react";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import TaskCategorySelector from "./TaskCategorySelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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
      return <Badge className='bg-yellow-100 text-yellow-800'>Pending Approval</Badge>;
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
    <div className='px-6 py-6 space-y-6 bg-gradient-to-br from-[#faf8f2] via-[#fcf8f5] to-[#ffffff] min-h-screen'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Button variant='secondary' onClick={() => navigate("/parent/dashboard")} className='flex items-center gap-2'>
            <ArrowLeft className='w-4 h-4' />
            Back to Dashboard
          </Button>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm'>
            <span className='text-sm text-gray-600'>Parent ID:</span>
            <span className='text-sm font-mono text-gray-800'>{parentId}</span>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                if (parentId && parentId !== "N/A") {
                  navigator.clipboard.writeText(parentId);
                  toast({
                    title: "Copied!",
                    description: "Parent ID copied to clipboard",
                  });
                }
              }}
              className='h-6 w-6 p-0'>
              <Copy className='w-3 h-3' />
            </Button>
          </div>
          {/* Children dropdown */}
          <Select onValueChange={handleChildSelect}>
            <SelectTrigger className='w-48 bg-white rounded-lg shadow-sm'>
              <SelectValue placeholder='Select Child' />
            </SelectTrigger>
            <SelectContent>
              {children.map(child => (
                <SelectItem key={child._id} value={child._id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              navigate("/login/parent");
            }}
            className='flex items-center gap-2'>
            <LogOut className='w-4 h-4' />
            Logout
          </Button>
        </div>
      </div>

      <div className='container mx-auto flex-1 flex-col gap-4 px-2 sm:px-6 py-6'>
        {/* כרטיסי מידע */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card className='rounded-2xl border border-gray-200 shadow-md p-6 flex flex-col items-center'>
            <CardTitle className='text-lg font-bold text-gray-800 mb-2'>Total Tasks</CardTitle>
            <div className='text-3xl font-bold text-blue-500'>{totalTasks}</div>
            <div className='text-sm text-gray-500'>Tasks</div>
          </Card>
          <Card className='rounded-2xl border border-gray-200 shadow-md p-6 flex flex-col items-center'>
            <CardTitle className='text-lg font-bold text-gray-800 mb-2'>Progress</CardTitle>
            <Progress value={progress} className='mt-2' />
            <div className='text-xl font-bold text-green-500 mt-2'>{Math.round(progress)}%</div>
          </Card>
          <Card className='rounded-2xl border border-gray-200 shadow-md p-6 flex flex-col items-center'>
            <CardTitle className='text-lg font-bold text-gray-800 mb-2'>Coins</CardTitle>
            <div className='text-3xl font-bold text-yellow-500'>{child.coins}</div>
            <div className='text-sm text-gray-500'>Earned</div>
          </Card>
          <Card className='rounded-2xl border border-gray-200 shadow-md p-6 flex flex-col items-center'>
            <CardTitle className='text-lg font-bold text-gray-800 mb-2'>Approved Tasks</CardTitle>
            <div className='text-3xl font-bold text-green-500'>{approvedTasks.length}</div>
            <div className='text-sm text-gray-500'>Approved</div>
          </Card>
        </div>
        {/* יצירת משימה */}
        <Card className='rounded-2xl border border-gray-200 shadow-md p-6 mb-8'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-lg font-bold text-gray-900'>Create New Task</CardTitle>
                <CardDescription className='text-gray-500'>Add a new task for {child.name}</CardDescription>
              </div>
              <div className='flex gap-2'>
                <Button variant={showCategorySelector ? "default" : "outline"} size='sm' className='rounded-full px-4 py-2 text-base font-semibold' onClick={() => setShowCategorySelector(!showCategorySelector)}>
                  <Grid className='w-4 h-4 mr-2' /> Task Categories
                </Button>
                <Button variant={!showCategorySelector ? "default" : "outline"} size='sm' className='rounded-full px-4 py-2 text-base font-semibold' onClick={() => setShowCategorySelector(false)}>
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
                      <SelectContent>
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
        {/* רשימת משימות */}
        <Card className='rounded-2xl border border-gray-200 shadow-md p-6 mb-8'>
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
                <SelectTrigger className='w-36 rounded-lg border-gray-300'>
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
                <SelectTrigger className='w-36 rounded-lg border-gray-300'>
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
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredTasks.map(task => (
                <Card key={task._id} className='rounded-xl border border-gray-200 shadow p-4 flex flex-col gap-2'>
                  <CardHeader className='flex flex-row items-center justify-between pb-2'>
                    <div className='flex items-center gap-2'>
                      {!task.completed && (
                        <Button size='sm' variant='ghost' className='h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700' onClick={() => handleDeleteTask(task._id)}>
                          <XCircle className='w-4 h-4' />
                        </Button>
                      )}
                      <CardTitle className='text-base font-semibold'>{task.title}</CardTitle>
                    </div>
                    {getTaskStatusIcon(task)}
                  </CardHeader>
                  <CardContent className='pb-2'>
                    <CardDescription className='text-gray-600 mb-2'>{task.description}</CardDescription>
                    <div className='flex items-center gap-2 mb-2'>
                      <Badge variant={task.completed ? "default" : "outline"}>{task.reward} coins</Badge>
                      {getCategoryBadge(task.category || "custom")}
                      {getTaskStatusBadge(task)}
                    </div>
                    <div className='text-xs text-muted-foreground mt-1'>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
                  </CardContent>
                  <CardContent className='pt-0'>
                    {task.completed && !task.approved && (
                      <div className='flex gap-2'>
                        <Button size='sm' className='flex-1 bg-green-600 hover:bg-green-700 rounded-full text-white text-base py-2' onClick={() => handleApproveTask(task._id)}>
                          <CheckCircle className='w-4 h-4 mr-1' /> Approve
                        </Button>
                        <Button size='sm' variant='destructive' className='flex-1 rounded-full text-base py-2' onClick={() => handleRejectTask(task._id)}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
