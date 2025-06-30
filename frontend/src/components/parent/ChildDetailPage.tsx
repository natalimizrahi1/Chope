import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChildren, getTasks, createTask, approveTask, rejectTask, getChildById, unapproveTask } from "../../lib/api";
import type { Task, Animal } from "../../lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { Plus, PawPrint, CheckCircle, XCircle, Clock } from "lucide-react";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";

type Child = {
  _id: string;
  name: string;
  email: string;
  coins: number;
  animal?: Animal;
};

export default function ChildDetailPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [token] = useState(localStorage.getItem("token") || "");
  const [newTask, setNewTask] = useState({ title: "", description: "", reward: 0 });
  const { toast } = useToast();

  const loadChildData = async () => {
    if (!token || !childId) return;

    try {
      // Use the new direct API call
      const childData = await getChildById(token, childId);
      setChild(childData);
    } catch (error) {
      console.error("Failed to load child data:", error);
      // Fallback to the old method
      try {
        const children = await getChildren(token);
        const foundChild = children.find((c: Child) => c._id === childId);
        if (foundChild) {
          setChild(foundChild);
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    }
  };

  const loadTasks = async () => {
    if (!childId) return;

    try {
      const tasksData = await getTasks(token, childId);

      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
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

    // Load child data
    if (childId) {
      loadChildData();
    }
  }, [childId, token, navigate, toast]);

  useEffect(() => {
    if (child && token) {
      loadTasks();
    }
  }, [child, token]);

  useEffect(() => {
    loadChildData();
    loadTasks();

    // Listen for visibility changes to refresh when returning to page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadChildData();
        loadTasks();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set up interval to refresh every 10 seconds
    const interval = setInterval(() => {
      loadTasks();
    }, 10000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [childId, token]);

  // Load initial data
  useEffect(() => {
    if (childId && token) {
      loadChildData();
      loadTasks();

      // Check for new tasks in localStorage on mount
      const newTaskInfo = localStorage.getItem("newTaskCreated");
      if (newTaskInfo) {
        try {
          const taskInfo = JSON.parse(newTaskInfo);
          if (taskInfo.childId === childId) {
            // Refresh tasks immediately
            loadTasks().then(() => {
              localStorage.setItem("cachedTasks", JSON.stringify(tasks));
              localStorage.setItem("cachedTasksTimestamp", Date.now().toString());
            });

            // Clear the localStorage item
            localStorage.removeItem("newTaskCreated");
          }
        } catch (error) {
          console.error("Failed to parse new task info on mount:", error);
        }
      }
    }
  }, [childId, token]);

  // Force refresh tasks after task creation
  useEffect(() => {
    const handleTaskCreated = () => {
      if (childId && token) {
        loadTasks();
      }
    };

    window.addEventListener("taskCreated", handleTaskCreated);
    return () => {
      window.removeEventListener("taskCreated", handleTaskCreated);
    };
  }, [childId, token]);

  // Listen for storage changes to refresh tasks immediately
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "newTaskCreated" && event.newValue && childId) {
        try {
          const taskInfo = JSON.parse(event.newValue);
          if (taskInfo.childId === childId) {
            loadTasks();
            localStorage.removeItem("newTaskCreated");
          }
        } catch (error) {
          console.error("Failed to parse new task info from storage:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [childId]);

  // Force immediate refresh after task creation
  useEffect(() => {
    const handleImmediateRefresh = () => {
      if (childId && token) {
        setTimeout(() => {
          loadTasks();
        }, 100); // Small delay to ensure server has processed the task
      }
    };

    window.addEventListener("taskCreated", handleImmediateRefresh);
    return () => {
      window.removeEventListener("taskCreated", handleImmediateRefresh);
    };
  }, [childId, token]);

  // Check for new tasks every 2 seconds as backup
  useEffect(() => {
    if (!childId || !token) return;

    const interval = setInterval(() => {
      const newTaskInfo = localStorage.getItem("newTaskCreated");
      if (newTaskInfo) {
        try {
          const taskInfo = JSON.parse(newTaskInfo);
          if (taskInfo.childId === childId) {
            loadTasks();
            localStorage.removeItem("newTaskCreated");
          }
        } catch (error) {
          console.error("Failed to parse new task info in backup check:", error);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [childId, token]);

  const handleCreateTask = async () => {
    if (!child) return;
    try {
      await createTask(token, {
        ...newTask,
        child: child._id,
      });

      setNewTask({ title: "", description: "", reward: 0 });

      await loadTasks();

      // Dispatch event to notify child's dashboard about new task
      const taskCreatedEvent = new CustomEvent("taskCreated", {
        detail: { task: newTask, childId: childId },
      });
      window.dispatchEvent(taskCreatedEvent);

      // Also store in localStorage for immediate detection
      localStorage.setItem(
        "newTaskCreated",
        JSON.stringify({
          task: newTask,
          childId: childId,
          timestamp: Date.now(),
        })
      );
      // Force storage event for immediate update in all tabs
      window.dispatchEvent(new Event("storage"));

      toast({
        title: "Task created successfully",
        description: "The task has been added to your child's list.",
      });
      localStorage.setItem("lastTaskTime", Date.now().toString());
    } catch (error) {
      console.error("Failed to create task:", error);
      toast({
        title: "Failed to create task",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveTask = async (taskId: string) => {
    try {
      await approveTask(token, taskId);
      await loadTasks();
      await loadChildData(); // Refresh child data to get updated coins

      // Notify child for immediate update
      localStorage.setItem("taskApproved", JSON.stringify({ taskId, childId: child?._id, timestamp: Date.now() }));
      window.dispatchEvent(new Event("storage"));

      // Also dispatch custom event for same-tab notification
      const customEvent = new CustomEvent("taskApproved", {
        detail: { childId: child?._id, taskId, timestamp: Date.now() },
      });
      window.dispatchEvent(customEvent);

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

  const handleUnapproveTask = async (taskId: string) => {
    try {
      await unapproveTask(token, taskId);
      await loadTasks();
      await loadChildData(); // Refresh child data to get updated coins
      toast({
        title: "Task unapproved",
        description: "The task has been unapproved and coins have been deducted.",
      });
    } catch (error) {
      toast({
        title: "Failed to unapprove task",
        description: "Please try again.",
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
  const incompleteTasks = tasks.filter((task: Task) => !task.completed).sort((a, b) => b._id.localeCompare(a._id));
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (approvedTasks.length / totalTasks) * 100 : 0;

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

  return (
    <div className='min-h-screen bg-background'>
      {/* Main content */}
      <div className='p-6'>
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
              <CardTitle>Create New Task</CardTitle>
              <CardDescription>Add a new task for {child.name}</CardDescription>
            </CardHeader>
            <CardContent>
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
                <Button onClick={handleCreateTask}>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Task
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <div className='grid gap-4'>
            <h2 className='text-lg font-semibold'>Tasks</h2>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {tasks.map(task => (
                <Card key={task._id}>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-sm'>{task.title}</CardTitle>
                      {getTaskStatusIcon(task)}
                    </div>
                    <CardDescription>{task.description}</CardDescription>
                    <div className='flex items-center justify-between'>
                      <Badge variant={task.completed ? "default" : "outline"}>{task.reward} coins</Badge>
                      {getTaskStatusBadge(task)}
                    </div>
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
                        <Button size='sm' variant='outline' className='flex-1' onClick={() => handleUnapproveTask(task._id)}>
                          <XCircle className='w-3 h-3 mr-1' />
                          Unapprove
                        </Button>
                        <div className='flex-1 text-center text-green-600 font-semibold text-sm'>✓ Coins awarded!</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
