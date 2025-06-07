import { useEffect, useState } from 'react';
import { getChildren, getChildProgress, createTask, createAnimal } from '../../lib/api';
import type { Task, Animal } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Copy, Plus, PawPrint, Star, Trophy, Gift, LogOut } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type Child = {
  _id: string;
  name: string;
  email: string;
  coins: number;
  animal?: Animal;
};

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [token] = useState(localStorage.getItem("token") || "");
  const [newTask, setNewTask] = useState({ title: "", description: "", reward: 0 });
  const { toast } = useToast();
  const [parentId, setParentId] = useState('');
  const [newAnimal, setNewAnimal] = useState({ name: '', type: '' });

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
    setParentId(user.id);

    // Load children data
    getChildren(token)
      .then(setChildren)
      .catch(error => {
        console.error("Failed to load children:", error);
        toast({
          title: "Error",
          description: "Failed to load children data. Please try again.",
          variant: "destructive",
        });
      });
  }, [token, navigate, toast]);

  useEffect(() => {
    if (selectedChild && token) {
      getChildProgress(token, selectedChild._id)
        .then(response => {
          // Ensure we're working with an array
          const tasksArray = Array.isArray(response) ? response : [];
          setTasks(tasksArray);
        })
        .catch(error => {
          console.error("Failed to load child progress:", error);
          setTasks([]); // Set empty array on error
          toast({
            title: "Error",
            description: "Failed to load child progress. Please try again.",
            variant: "destructive",
          });
        });
    } else {
      setTasks([]); // Reset tasks when no child is selected
    }
  }, [selectedChild, token, toast]);

  const handleCreateTask = async () => {
    if (!selectedChild) return;
    try {
      await createTask(token, {
        ...newTask,
        child: selectedChild._id,
      });
      setNewTask({ title: "", description: "", reward: 0 });
      // Refresh tasks for the selected child
      getChildProgress(token, selectedChild._id).then(response => {
        const tasksArray = Array.isArray(response) ? response : [];
        setTasks(tasksArray);
      });
      toast({
        title: "Task created successfully",
        description: "The task has been added to your child's list.",
      });
    } catch (error) {
      toast({
        title: "Failed to create task",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAnimal = async () => {
    if (!selectedChild) return;
    
    // Validate input
    if (!newAnimal.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the pet",
        variant: "destructive",
      });
      return;
    }
    
    if (!newAnimal.type) {
      toast({
        title: "Error",
        description: "Please select a pet type",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating animal with data:', {
        name: newAnimal.name,
        type: newAnimal.type,
        owner: selectedChild._id
      });

      const response = await createAnimal(token, {
        name: newAnimal.name,
        type: newAnimal.type,
        owner: selectedChild._id
      });

      console.log('Animal creation response:', response);

      setNewAnimal({ name: '', type: '' });
      // Refresh child data to show new animal
      const updatedChildren = await getChildren(token);
      console.log('Updated children data:', updatedChildren);
      setChildren(updatedChildren);

      toast({
        title: "Animal created successfully",
        description: "Your child now has a new pet!",
      });
    } catch (error) {
      console.error('Failed to create animal:', error);
      toast({
        title: "Failed to create animal",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyParentId = () => {
    navigator.clipboard.writeText(parentId);
    toast({
      title: "Copied!",
      description: "Parent ID has been copied to clipboard.",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login/parent");
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <div className='hidden lg:flex w-64 flex-col border-r bg-muted/40'>
        <div className='flex h-14 items-center border-b px-4'>
          <h2 className='text-lg font-semibold'>Children</h2>
        </div>
        <div className='flex-1 overflow-auto py-2'>
          <nav className='grid items-start px-2 text-sm font-medium'>
            {children.map(child => (
              <button key={child._id} onClick={() => setSelectedChild(child)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground ${selectedChild?._id === child._id ? "bg-muted text-foreground" : ""}`}>
                {child.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 overflow-auto'>
        <div className='flex h-14 items-center justify-between border-b px-4'>
          <h1 className='text-lg font-semibold'>Dashboard</h1>
          <div className='flex items-center gap-4'>
            <div className='text-sm text-muted-foreground'>Parent ID: {parentId}</div>
            <Button variant='ghost' size='icon' onClick={copyParentId}>
              <Copy className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='icon' onClick={handleLogout} title='Logout'>
              <LogOut className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <div className='p-6'>
          {selectedChild ? (
            <div className='grid gap-6'>
              {/* Child Info */}
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
                    <Badge variant='secondary'>{selectedChild.coins}</Badge>
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
                  <CardTitle>{selectedChild.name}</CardTitle>
                  <CardDescription>{selectedChild.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid gap-4'>
                    {selectedChild.animal ? (
                      <div className='grid gap-4'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <PawPrint className='h-5 w-5 text-primary' />
                            <span className='text-lg font-medium'>Pet</span>
                          </div>
                          <Badge variant='secondary' className='text-base px-3 py-1'>
                            Level {selectedChild.animal.level}
                          </Badge>
                        </div>
                        <div className='grid gap-2'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-muted-foreground'>Name</span>
                            <span className='font-medium'>{selectedChild.animal.name}</span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-muted-foreground'>Type</span>
                            <Badge variant='outline' className='capitalize'>
                              {selectedChild.animal.type}
                            </Badge>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-muted-foreground'>Last Fed</span>
                            <span className='text-sm'>{new Date(selectedChild.animal.lastFed).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        <div className="flex items-center gap-2">
                          <PawPrint className="h-5 w-5 text-primary" />
                          <span className="text-lg font-medium">Create New Pet</span>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="animal-name">Pet Name</Label>
                          <Input
                            id="animal-name"
                            value={newAnimal.name}
                            onChange={(e) => setNewAnimal({ ...newAnimal, name: e.target.value })}
                            placeholder="Enter pet name"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="animal-type">Pet Type</Label>
                          <Select
                            value={newAnimal.type}
                            onValueChange={(value: string) => setNewAnimal({ ...newAnimal, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select pet type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dog">🐕 Dog</SelectItem>
                              <SelectItem value="cat">🐱 Cat</SelectItem>
                              <SelectItem value="rabbit">🐰 Rabbit</SelectItem>
                              <SelectItem value="hamster">🐹 Hamster</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleCreateAnimal} className="w-full">
                          <PawPrint className="mr-2 h-4 w-4" />
                          Create Pet
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Create Task */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Task</CardTitle>
                  <CardDescription>Add a new task for {selectedChild.name}</CardDescription>
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
          ) : (
            <div className='flex h-[calc(100vh-3.5rem)] items-center justify-center'>
              <p className='text-muted-foreground'>Select a child to view their dashboard</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
