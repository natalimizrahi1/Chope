import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChildren, getTasks, createTask } from "../../lib/api";
import type { Task, Animal } from "../../lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { Plus, PawPrint } from "lucide-react";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { AppSidebar } from "../ui/app-sidebar";
import { SiteHeader } from "../ui/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IconUsers } from "@tabler/icons-react";

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
  const [children, setChildren] = useState<Child[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [token] = useState(localStorage.getItem("token") || "");
  const [newTask, setNewTask] = useState({ title: "", description: "", reward: 0 });
  const { toast } = useToast();

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

    // Load children data
    getChildren(token)
      .then(childrenData => {
        setChildren(childrenData);
        const foundChild = childrenData.find((c: Child) => c._id === childId);
        if (foundChild) {
          setChild(foundChild);
        } else {
          toast({
            title: "Child not found",
            description: "The requested child could not be found.",
            variant: "destructive",
          });
          navigate("/parent/dashboard");
        }
      })
      .catch(error => {
        console.error("Failed to load child:", error);
        toast({
          title: "Error",
          description: "Failed to load child data. Please try again.",
          variant: "destructive",
        });
        navigate("/parent/dashboard");
      });
  }, [childId, token, navigate, toast]);

  useEffect(() => {
    if (child && token) {
      getTasks(token, child._id)
        .then(response => {
          const tasksArray = Array.isArray(response) ? response : [];
          setTasks(tasksArray);
        })
        .catch(error => {
          console.error("Failed to load child tasks:", error);
          setTasks([]);
          toast({
            title: "Error",
            description: "Failed to load child tasks. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [child, token, toast]);

  const handleCreateTask = async () => {
    if (!child) return;
    try {
      await createTask(token, {
        ...newTask,
        child: child._id,
      });
      setNewTask({ title: "", description: "", reward: 0 });
      getTasks(token, child._id).then(setTasks);
      toast({
        title: "Task created successfully",
        description: "The task has been added to your child's list.",
      });
      localStorage.setItem("lastTaskTime", Date.now().toString());
    } catch (error) {
      toast({
        title: "Failed to create task",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Map children to the format required by AppSidebar/NavDocuments
  const childrenList = children.map(childItem => ({
    name: childItem.name,
    url: childItem._id,
    icon: IconUsers,
  }));

  // Handler for navigating to child detail page
  const handleChildSelect = (id: string) => {
    navigate(`/parent/child/${id}`);
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

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
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
                        <div className='text-2xl font-bold'>{completedTasks}</div>
                        <p className='text-xs text-muted-foreground'>Tasks completed</p>
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
                        <div className='text-2xl font-bold'>{tasks.reduce((sum, task) => sum + (task.completed ? task.reward : 0), 0)}</div>
                        <p className='text-xs text-muted-foreground'>Earned from tasks</p>
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
                            <CardTitle>{task.title}</CardTitle>
                            <CardDescription>{task.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className='flex items-center justify-between'>
                              <Badge variant={task.completed ? "default" : "outline"}>{task.reward} coins</Badge>
                              <Badge variant={task.completed ? "secondary" : "default"}>{task.completed ? "Completed" : "Pending"}</Badge>
                            </div>
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
