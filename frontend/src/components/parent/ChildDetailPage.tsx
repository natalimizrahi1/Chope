import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChildren, unapproveTask, getTasks, createTask, approveTask, rejectTask, getChildById, deleteTask } from "../../lib/api";
import type { Task, Animal } from "../../lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { Plus, PawPrint, CheckCircle, XCircle, Clock, Grid, List, Trash2, Filter } from "lucide-react";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import TaskCategorySelector from "./TaskCategorySelector";
import { AppSidebar } from "../ui/app-sidebar";
import { SiteHeader } from "../ui/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IconUsers } from "@tabler/icons-react";
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
  const [newTask, setNewTask] = useState({ title: "", description: "", reward: 0 });
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTime, setSelectedTime] = useState("all");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Debug: Log filter changes
  useEffect(() => {}, [selectedCategory, selectedStatus, selectedTime, tasks.length]);

  const loadChildData = async (showLoading = false) => {
    if (!token || !childId) return;
    try {
      if (showLoading) {
        setLoading(true);
      }
      const childData = await getChildById(token, childId);
      setChild(childData);
    } catch (error) {
      console.error("Failed to load child data:", error);
      if (error instanceof Error && error.message.includes("401")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login/parent");
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadChildren = async () => {
    if (!token) return;

    try {
      const childrenData = await getChildren(token);
      setChildren(childrenData);
    } catch (error) {
      console.error("Failed to load children:", error);
    }
  };

  const loadTasks = async (showLoading = false) => {
    if (!childId) return;
    try {
      if (showLoading) {
        setLoading(true);
      }
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
    } finally {
      if (showLoading) {
        setLoading(false);
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
      await loadChildData(true);
      await loadTasks(true);
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
        category: "custom",
      });

      setNewTask({ title: "", description: "", reward: 0 });
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
    });
    setShowCategorySelector(false);

    // Create task immediately with the selected template
    if (childId) {
      createTask(token, {
        title: taskTemplate.title,
        description: taskTemplate.description,
        reward: taskTemplate.reward,
        child: childId,
        category: taskTemplate.category,
      })
        .then(() => {
          toast({
            title: "Task created",
            description: "New task has been created successfully.",
          });
          loadTasks();

          // Notify child for immediate update
          localStorage.setItem("newTaskCreated", JSON.stringify({ childId, timestamp: Date.now() }));
          window.dispatchEvent(new Event("storage"));

          // Also dispatch custom event for same-tab notification
          const customEvent = new CustomEvent("taskCreated", {
            detail: { childId, timestamp: Date.now() },
          });
          window.dispatchEvent(customEvent);
        })
        .catch(error => {
          console.error("Failed to create task:", error);
          toast({
            title: "Error",
            description: "Failed to create task. Please try again.",
            variant: "destructive",
          });
        });
    }
  };

  const handleCustomTask = (customTask: { title: string; description: string; reward: number }) => {
    setNewTask(customTask);
    setShowCategorySelector(false);

    // Create task immediately with custom category
    if (childId) {
      createTask(token, {
        title: customTask.title,
        description: customTask.description,
        reward: customTask.reward,
        child: childId,
        category: "custom",
      })
        .then(() => {
          toast({
            title: "Task created",
            description: "New custom task has been created successfully.",
          });
          loadTasks();

          // Notify child for immediate update
          localStorage.setItem("newTaskCreated", JSON.stringify({ childId, timestamp: Date.now() }));
          window.dispatchEvent(new Event("storage"));

          // Also dispatch custom event for same-tab notification
          const customEvent = new CustomEvent("taskCreated", {
            detail: { childId, timestamp: Date.now() },
          });
          window.dispatchEvent(customEvent);
        })
        .catch(error => {
          console.error("Failed to create task:", error);
          toast({
            title: "Error",
            description: "Failed to create task. Please try again.",
            variant: "destructive",
          });
        });
    }
  };

  // Map children to the format required by AppSidebar/NavDocuments
  const childrenList = children.map(child => ({
    name: child.name,
    url: child._id, // Use _id for navigation
    icon: IconUsers,
  }));

  // Handler for navigating to child detail page
  const handleChildSelect = (id: string) => {
    navigate(`/parent/child/${id}`);
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

  const pendingApprovalTasks = tasks.filter((task: Task) => task.completed && !task.approved);
  const approvedTasks = tasks.filter((task: Task) => task.completed && task.approved);
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (approvedTasks.length / totalTasks) * 100 : 0;

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

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }>
      <AppSidebar variant='inset' childrenList={childrenList} onChildSelect={handleChildSelect} />
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
              <div className='px-4 lg:px-6'>
                <div className='grid gap-6'>
                  {/* Child Info Cards */}
                  <div className='grid gap-4 md:grid-cols-3'>
                    <Card>
                      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Total Tasks</CardTitle>
                        <Badge variant='secondary'>{totalTasks}</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className='text-2xl font-bold'>{approvedTasks.length}</div>
                        <p className='text-xs text-muted-foreground'>Tasks approved</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Progress</CardTitle>
                        <Badge variant='secondary'>{Math.round(progress)}%</Badge>
                      </CardHeader>
                      <CardContent>
                        <Progress value={progress} className='mt-2' />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Coins</CardTitle>
                        <Badge variant='secondary'>{child.coins}</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className='text-2xl font-bold'>{tasks.reduce((sum, task) => sum + (task.approved ? task.reward : 0), 0)}</div>
                        <p className='text-xs text-muted-foreground'>Earned from approved tasks</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Approved Tasks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='text-2xl font-bold'>{approvedTasks.length}</div>
                        <p className='text-xs text-muted-foreground'>Tasks approved</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Pending Approval</CardTitle>
                        {pendingApprovalTasks.length > 0 && <div className='bg-yellow-500 text-white text-xs px-2 py-1 rounded-full animate-pulse'>{pendingApprovalTasks.length} new</div>}
                      </CardHeader>
                      <CardContent>
                        <div className='text-2xl font-bold'>{pendingApprovalTasks.length}</div>
                        <p className='text-xs text-muted-foreground'>Waiting for approval</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Child Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{child.name}</CardTitle>
                      <CardDescription>{child.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='grid gap-4'>
                        {child.animal ? (
                          <div className='grid gap-4'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <PawPrint className='h-5 w-5 text-primary' />
                                <span className='text-lg font-medium'>Pet</span>
                              </div>
                              <Badge variant='secondary' className='text-base px-3 py-1'>
                                Level {child.animal.level}
                              </Badge>
                            </div>
                            <div className='grid gap-2'>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>Name</span>
                                <span className='font-medium'>{child.animal.name}</span>
                              </div>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>Type</span>
                                <Badge variant='outline' className='capitalize'>
                                  {child.animal.type}
                                </Badge>
                              </div>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>Last Fed</span>
                                <span className='text-sm'>{new Date(child.animal.lastFed).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className='text-center text-muted-foreground'>Your child hasn't created a pet yet.</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Create Task */}
                  <Card>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <div>
                          <CardTitle>Create New Task</CardTitle>
                          <CardDescription>Add a new task for {child.name}</CardDescription>
                        </div>
                        <div className='flex gap-2'>
                          <Button variant={showCategorySelector ? "default" : "outline"} size='sm' onClick={() => setShowCategorySelector(!showCategorySelector)}>
                            <Grid className='w-4 h-4 mr-2' />
                            Task Categories
                          </Button>
                          <Button variant={!showCategorySelector ? "default" : "outline"} size='sm' onClick={() => setShowCategorySelector(false)}>
                            <List className='w-4 h-4 mr-2' />
                            Quick Create
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
                            <Input id='title' value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder='Enter task title' />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='description'>Description</Label>
                            <Input id='description' value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder='Enter task description' />
                          </div>
                          <div className='grid gap-2'>
                            <Label htmlFor='reward'>Reward (coins)</Label>
                            <Input id='reward' type='number' value={newTask.reward} onChange={e => setNewTask({ ...newTask, reward: parseInt(e.target.value) || 0 })} placeholder='Enter reward amount' />
                          </div>
                          <Button onClick={handleCreateTask} disabled={!newTask.title || !newTask.description || newTask.reward <= 0}>
                            <Plus className='mr-2 h-4 w-4' />
                            Create Task
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Tasks List */}
                  <div className='grid gap-4'>
                    <div className='flex items-center justify-between'>
                      <h2 className='text-lg font-semibold'>Tasks</h2>
                      <div className='flex items-center gap-2'>
                        <Filter className='w-4 h-4 text-muted-foreground' />
                        <Select
                          value={selectedCategory}
                          onValueChange={value => {
                            console.log("Category filter changed to:", value);
                            setSelectedCategory(value);
                          }}>
                          <SelectTrigger className='w-48'>
                            <SelectValue placeholder='Filter by category' />
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
                        <Select
                          value={selectedStatus}
                          onValueChange={value => {
                            console.log("Status filter changed to:", value);
                            setSelectedStatus(value);
                          }}>
                          <SelectTrigger className='w-40'>
                            <SelectValue placeholder='Filter by status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='all'>All Status</SelectItem>
                            <SelectItem value='incomplete'>Incomplete</SelectItem>
                            <SelectItem value='completed'>Pending Approval</SelectItem>
                            <SelectItem value='approved'>Approved</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedTime}
                          onValueChange={value => {
                            console.log("Time filter changed to:", value);
                            setSelectedTime(value);
                          }}>
                          <SelectTrigger className='w-40'>
                            <SelectValue placeholder='Filter by time' />
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
                            Clear Filters
                          </Button>
                        )}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            console.log("=== MANUAL FILTER TEST ===");
                            console.log("Current filters:", { selectedCategory, selectedStatus, selectedTime });
                            console.log("Total tasks:", tasks.length);
                            console.log("Filtered tasks:", filteredTasks.length);

                            // Test each task manually
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

                              const shouldShow = categoryMatch && statusMatch && timeMatch;
                              console.log(`Task ${index + 1}: "${task.title}" - Should show: ${shouldShow} (Category: ${categoryMatch}, Status: ${statusMatch}, Time: ${timeMatch})`);
                            });

                            console.log("=== END MANUAL TEST ===");
                          }}>
                          Debug Filters
                        </Button>
                      </div>
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Showing {filteredTasks.length} of {tasks.length} tasks
                      {selectedCategory !== "all" || selectedStatus !== "all" || selectedTime !== "all" ? (
                        <div className='text-xs text-gray-500 mt-1'>
                          Filters: {selectedCategory !== "all" ? `Category: ${selectedCategory}` : ""}
                          {selectedStatus !== "all" ? ` | Status: ${selectedStatus}` : ""}
                          {selectedTime !== "all" ? ` | Time: ${selectedTime}` : ""}
                        </div>
                      ) : null}
                    </div>
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                      {filteredTasks.map(task => (
                        <Card key={task._id}>
                          <CardHeader>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                {!task.completed && (
                                  <Button size='sm' variant='ghost' className='h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700' onClick={() => handleDeleteTask(task._id)}>
                                    <XCircle className='w-4 h-4' />
                                  </Button>
                                )}
                                <CardTitle className='text-sm'>{task.title}</CardTitle>
                              </div>
                              {getTaskStatusIcon(task)}
                            </div>
                            <CardDescription>{task.description}</CardDescription>
                            <div className='flex items-center justify-between'>
                              <Badge variant={task.completed ? "default" : "outline"}>{task.reward} coins</Badge>
                              {getCategoryBadge(task.category || "custom")}
                              {getTaskStatusBadge(task)}
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
                          </CardHeader>
                          <CardContent>
                            {task.completed && !task.approved && (
                              <div className='flex gap-2'>
                                <Button size='sm' className='flex-1 bg-green-600 hover:bg-green-700' onClick={() => handleApproveTask(task._id)}>
                                  <CheckCircle className='w-3 h-3 mr-1' />
                                  Approve
                                </Button>
                                <Button size='sm' variant='destructive' className='flex-1' onClick={() => handleRejectTask(task._id)}>
                                  <XCircle className='w-3 h-3 mr-1' />
                                  Reject
                                </Button>
                              </div>
                            )}
                            {task.approved && (
                              <div className='flex gap-2'>
                                <div className='flex-1 text-center text-green-600 font-semibold text-sm'>✓ Coins awarded!</div>
                              </div>
                            )}
                            {task.completed && !task.approved && <div className='text-xs text-gray-500 mt-2 text-center'>Cannot delete - Task completed</div>}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
