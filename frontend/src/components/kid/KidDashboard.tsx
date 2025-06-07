import { useEffect, useState } from "react";
import { getTasks, completeTask, getAnimal, feedAnimal, createAnimal } from "../../lib/api";
import type { Task, Animal } from "../../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Trophy, Star, Gift, LogOut, PawPrint } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function KidDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  const [childId, setChildId] = useState("");
  const { toast } = useToast();
  const [newAnimal, setNewAnimal] = useState({ name: "", type: "" });

  useEffect(() => {
    // Check if user is logged in and is a child
    const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
    if (!token || user.role !== "child") {
      toast({
        title: "Access denied",
        description: "Please login as a child to access this page.",
        variant: "destructive",
      });
      navigate("/login/kid");
      return;
    }
    setChildId(user.id);

    // Load tasks and animal data
    getTasks(token, user.id)
      .then(setTasks)
      .catch(error => {
        console.error("Failed to load tasks:", error);
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        });
      });

    getAnimal(token, user.id)
      .then(setAnimal)
      .catch(error => {
        console.error("Failed to load animal:", error);
        toast({
          title: "Error",
          description: "Failed to load animal data. Please try again.",
          variant: "destructive",
        });
      });
  }, [token, navigate, toast]);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(token, taskId);
      getTasks(token, childId).then(setTasks);
      toast({
        title: "Task completed!",
        description: "Great job! You've earned some coins.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFeedAnimal = async () => {
    if (!animal) return;
    try {
      await feedAnimal(token, animal._id);
      getAnimal(token, childId).then(setAnimal);
      toast({
        title: "Animal fed!",
        description: "Your animal is happy and growing!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to feed animal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login/kid");
  };

  const handleCreateAnimal = async () => {
    // Validate input
    if (!newAnimal.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your pet",
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
      console.log("Creating animal with data:", {
        name: newAnimal.name,
        type: newAnimal.type,
        owner: childId,
      });

      const response = await createAnimal(token, {
        name: newAnimal.name,
        type: newAnimal.type,
        owner: childId,
      });

      console.log("Animal creation response:", response);

      setNewAnimal({ name: "", type: "" });
      // Refresh animal data
      const updatedAnimal = await getAnimal(token, childId);
      setAnimal(updatedAnimal);

      toast({
        title: "Pet created successfully",
        description: "You now have a new pet to take care of!",
      });
    } catch (error) {
      console.error("Failed to create animal:", error);
      toast({
        title: "Failed to create pet",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className='flex min-h-screen'>
      {/* Main content */}
      <div className='flex-1 overflow-auto'>
        <div className='flex h-14 items-center justify-between border-b px-4'>
          <h1 className='text-lg font-semibold'>My Dashboard</h1>
          <Button variant='ghost' size='icon' onClick={handleLogout} title='Logout'>
            <LogOut className='h-4 w-4' />
          </Button>
        </div>
        <div className='p-6'>
          <div className='grid gap-6'>
            {/* Stats Overview */}
            <div className='grid gap-4 md:grid-cols-3'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Total Tasks</CardTitle>
                  <Trophy className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{totalTasks}</div>
                  <p className='text-xs text-muted-foreground'>{completedTasks} completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Progress</CardTitle>
                  <Star className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{Math.round(progress)}%</div>
                  <Progress value={progress} className='mt-2' />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Coins Earned</CardTitle>
                  <Gift className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{tasks.reduce((sum, task) => sum + (task.completed ? task.reward : 0), 0)}</div>
                  <p className='text-xs text-muted-foreground'>From completed tasks</p>
                </CardContent>
              </Card>
            </div>

            {/* Animal Card */}
            <Card>
              <CardHeader>
                <CardTitle>My Pet</CardTitle>
                <CardDescription>Take care of your virtual pet by completing tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {animal ? (
                  <div className='flex flex-col items-center gap-4'>
                    <div className='text-2xl font-bold'>{animal.name}</div>
                    <Badge variant='secondary' className='capitalize'>
                      {animal.type}
                    </Badge>
                    <div className='flex items-center gap-2'>
                      <span className='text-lg'>Level {animal.level}</span>
                      <Progress value={(animal.level / 10) * 100} className='w-32' />
                    </div>
                    <Button onClick={handleFeedAnimal} className='mt-2'>
                      <PawPrint className='mr-2 h-4 w-4' />
                      Feed Pet
                    </Button>
                  </div>
                ) : (
                  <div className='grid gap-4'>
                    <div className='flex items-center gap-2'>
                      <PawPrint className='h-5 w-5 text-primary' />
                      <span className='text-lg font-medium'>Create Your Pet</span>
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='animal-name'>Pet Name</Label>
                      <Input id='animal-name' value={newAnimal.name} onChange={e => setNewAnimal({ ...newAnimal, name: e.target.value })} placeholder='Enter pet name' />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='animal-type'>Pet Type</Label>
                      <Select value={newAnimal.type} onValueChange={(value: string) => setNewAnimal({ ...newAnimal, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select pet type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='dog'>🐕 Dog</SelectItem>
                          <SelectItem value='cat'>🐱 Cat</SelectItem>
                          <SelectItem value='rabbit'>🐰 Rabbit</SelectItem>
                          <SelectItem value='hamster'>🐹 Hamster</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateAnimal} className='w-full'>
                      <PawPrint className='mr-2 h-4 w-4' />
                      Create Pet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tasks List */}
            <div className='grid gap-4'>
              <h2 className='text-lg font-semibold'>My Tasks</h2>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {tasks.map(task => (
                  <Card key={task._id}>
                    <CardHeader>
                      <CardTitle>{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='flex items-center justify-between'>
                        <Badge variant='outline' className='text-sm'>
                          {task.reward} coins
                        </Badge>
                        <Button variant={task.completed ? "secondary" : "default"} disabled={task.completed} onClick={() => handleCompleteTask(task._id)}>
                          {task.completed ? "Completed" : "Complete Task"}
                        </Button>
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
  );
}
