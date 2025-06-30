import { useEffect, useState, useCallback } from "react";
import VirtualPet, { Pet } from "../pet/VirtualPet";
import { Home, Users, User, BookOpen, Play, FileText, CreditCard, Library, TrendingUp, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Player } from "@lottiefiles/react-lottie-player";
import leftAnim from "@/assets/animations/left-decor.json";
import rightAnim from "@/assets/animations/right-decor.json";
import { useNavigate } from "react-router-dom";
import { getTasks, completeTask, undoTask, getChildCoins, unapproveTask, testServerConnection } from "../../lib/api";
import { Task } from "../../lib/types";
import Tasks from "../tasks/Tasks";
import Notifications from "../notifications/Notifications";
import { Toaster } from "../ui/toaster";
import { useToast } from "../ui/use-toast";

const mockTasks = [
  { id: "1", title: "Do homework", description: "Math and English", completed: true, reward: 10 },
  { id: "2", title: "Clean room", description: "Tidy your bed and floor", completed: false, reward: 15 },
];

const KidDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem("token") || "");
  const [userId, setUserId] = useState("");
  const [totalCoins, setTotalCoins] = useState(0);
  const [userName, setUserName] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingCoins, setIsLoadingCoins] = useState(false);

  const incompleteTasks = tasks.filter((task: Task) => !task.completed).slice(-4);
  const pendingApprovalTasks = tasks.filter((task: Task) => task.completed && !task.approved).slice(-4);
  const approvedTasks = tasks.filter((task: Task) => task.completed && task.approved).slice(-4);
  const [activeTab, setActiveTab] = useState<"home" | "pet" | "PetShop">("home");

  const [animal, setAnimal] = useState<Pet>({
    name: "Buddy",
    type: "dog",
    level: 1,
    xp: 50,
    stats: { hunger: 30, happiness: 80, energy: 60 },
    accessories: [],
  });

  useEffect(() => {
    localStorage.setItem("pet", JSON.stringify(animal));
  }, [animal]);

  // Load user data and tasks
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "child") {
      // Clear cache when user is not authenticated
      localStorage.removeItem("cachedTasks");
      localStorage.removeItem("cachedTasksTimestamp");
      navigate("/login/kid");
      return;
    }

    setUserId(user.id);
    setUserName(user.name || user.username || "User");
    setIsInitialized(true);

    // Load cached tasks immediately if available
    const cachedTasks = localStorage.getItem("cachedTasks");
    const cacheTimestamp = localStorage.getItem("cachedTasksTimestamp");
    const now = Date.now();
    const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
    const maxCacheAge = 5 * 60 * 1000; // 5 minutes

    if (cachedTasks && cacheAge < maxCacheAge) {
      try {
        const tasksData = JSON.parse(cachedTasks);
        setTasks(tasksData);
      } catch (error) {
        console.error("Failed to parse cached tasks:", error);
      }
    }

    // Load fresh data
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const tasksData = await getTasks(token, user.id);
        setTasks(tasksData);

        // Save tasks to localStorage
        localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
        localStorage.setItem("cachedTasksTimestamp", Date.now().toString());

        // Get coins from server
        const coinsData = await getChildCoins(token, user.id);
        setTotalCoins(coinsData.coins);
        localStorage.setItem("currentCoins", coinsData.coins.toString());
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Load initial data
    if (user.id && token) {
      loadInitialData();

      // Check for new tasks in localStorage on mount
      const newTaskInfo = localStorage.getItem("newTaskCreated");
      if (newTaskInfo) {
        try {
          const taskInfo = JSON.parse(newTaskInfo);
          if (taskInfo.childId === user.id) {
            // Refresh tasks immediately
            getTasks(token, user.id).then(tasksData => {
              setTasks(tasksData);
              localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
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
  }, [token, navigate]); // Only depend on token and navigate

  // Listen for task completion events
  useEffect(() => {
    const handleTaskCompleted = async () => {
      if (userId && token) {
        try {
          const tasksData = await getTasks(token, userId);
          setTasks(tasksData);
          localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
          localStorage.setItem("cachedTasksTimestamp", Date.now().toString());

          const coinsData = await getChildCoins(token, userId);
          setTotalCoins(coinsData.coins);
          localStorage.setItem("currentCoins", coinsData.coins.toString());
        } catch (error) {
          console.error("Failed to refresh data after task completion:", error);
        }
      }
    };

    // Listen for new task creation events
    const handleNewTaskCreated = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { task, childId: eventChildId } = customEvent.detail;

      if (eventChildId === userId && token) {
        try {
          // Immediately refresh tasks to show the new task
          const tasksData = await getTasks(token, userId);
          setTasks(tasksData);
          localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
          localStorage.setItem("cachedTasksTimestamp", Date.now().toString());
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
          if (taskInfo.childId === userId) {
            // Immediately refresh tasks
            const tasksData = await getTasks(token, userId);
            setTasks(tasksData);
            localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
            localStorage.setItem("cachedTasksTimestamp", Date.now().toString());

            // Clear the localStorage item
            localStorage.removeItem("newTaskCreated");
          }
        } catch (error) {
          console.error("Failed to parse new task info:", error);
        }
      }
    };

    window.addEventListener("taskCompleted", handleTaskCompleted);
    window.addEventListener("taskCreated", handleNewTaskCreated);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("taskCompleted", handleTaskCompleted);
      window.removeEventListener("taskCreated", handleNewTaskCreated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [userId, token]);

  // Refresh coins every 5 seconds
  useEffect(() => {
    if (!userId || !token) return;

    const interval = setInterval(async () => {
      try {
        const coinsData = await getChildCoins(token, userId);
        setTotalCoins(coinsData.coins);
        localStorage.setItem("currentCoins", coinsData.coins.toString());
      } catch (error) {
        console.error("Failed to refresh coins:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, token]);

  // Listen for task approval events to update immediately
  useEffect(() => {
    const handleTaskApproved = async (event: StorageEvent) => {
      if (event.key === "taskApproved" && event.newValue) {
        try {
          const info = JSON.parse(event.newValue);
          if (info.childId === userId) {
            // Immediately refresh tasks and coins
            const tasksData = await getTasks(token, userId);
            setTasks(tasksData);
            localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
            localStorage.setItem("cachedTasksTimestamp", Date.now().toString());

            const coinsData = await getChildCoins(token, userId);
            setTotalCoins(coinsData.coins);
            localStorage.setItem("currentCoins", coinsData.coins.toString());

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
      const { childId: eventChildId } = event.detail;
      if (eventChildId === userId) {
        // Immediately refresh tasks and coins
        const tasksData = await getTasks(token, userId);
        setTasks(tasksData);
        localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
        localStorage.setItem("cachedTasksTimestamp", Date.now().toString());

        const coinsData = await getChildCoins(token, userId);
        setTotalCoins(coinsData.coins);
        localStorage.setItem("currentCoins", coinsData.coins.toString());

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
            if (info.childId === userId) {
            // Immediately refresh tasks and coins
            const tasksData = await getTasks(token, userId);
            setTasks(tasksData);
            localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
            localStorage.setItem("cachedTasksTimestamp", Date.now().toString());

            const coinsData = await getChildCoins(token, userId);
            setTotalCoins(coinsData.coins);
            localStorage.setItem("currentCoins", coinsData.coins.toString());

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
  }, [userId, token, toast]);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(token, taskId);

      // Show notification to child
      toast({
        title: "Task Sent for Approval",
        description: "Your task has been sent to your parent for approval. You will receive your coins once approved.",
      });

      // Refresh data
      const tasksData = await getTasks(token, userId);
      setTasks(tasksData);
      localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
      localStorage.setItem("cachedTasksTimestamp", Date.now().toString());

      // Dispatch event to update other components
      window.dispatchEvent(new CustomEvent("taskCompleted"));
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
      await undoTask(token, taskId);

      // Refresh data
      const tasksData = await getTasks(token, userId);
      setTasks(tasksData);
      localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
      localStorage.setItem("cachedTasksTimestamp", Date.now().toString());

      // Refresh coins
      const coinsData = await getChildCoins(token, userId);
      setTotalCoins(coinsData.coins);
      localStorage.setItem("currentCoins", coinsData.coins.toString());

      // Dispatch event to update other components
      window.dispatchEvent(new CustomEvent("taskCompleted"));

      toast({
        title: "Task Undone",
        description: "The task has been undone. If it was approved, coins have been deducted.",
      });
    } catch (error) {
      console.error("Failed to undo task:", error);
      toast({
        title: "Error",
        description: "Failed to undo task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnapproveTask = async (taskId: string) => {
    try {
      await unapproveTask(token, taskId);

      // Refresh data
      const tasksData = await getTasks(token, userId);
      setTasks(tasksData);
      localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
      localStorage.setItem("cachedTasksTimestamp", Date.now().toString());

      // Refresh coins
      const coinsData = await getChildCoins(token, userId);
      setTotalCoins(coinsData.coins);
      localStorage.setItem("currentCoins", coinsData.coins.toString());

      // Dispatch event to update other components
      window.dispatchEvent(new CustomEvent("taskCompleted"));

      toast({
        title: "Task Unapproved",
        description: "The task has been unapproved and coins have been deducted. You can complete it again to earn coins.",
      });
    } catch (error) {
      console.error("Failed to unapprove task:", error);
      toast({
        title: "Error",
        description: "Failed to unapprove task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFeed = () => {
    setAnimal((prev: Pet) => ({
      ...prev,
      stats: { ...prev.stats, hunger: Math.min(100, prev.stats.hunger + 10) },
      xp: prev.xp + 10,
    }));
  };
  const handlePlay = () => {
    setAnimal((prev: Pet) => ({
      ...prev,
      stats: {
        ...prev.stats,
        happiness: Math.min(100, prev.stats.happiness + 10),
        energy: Math.min(100, prev.stats.energy + 5),
      },
      xp: prev.xp + 10,
    }));
  };
  const handleSleep = () => {
    setAnimal((prev: Pet) => ({
      ...prev,
      stats: { ...prev.stats, energy: Math.min(100, prev.stats.energy + 10) },
    }));
  };
  const handleResetHunger = () => {
    setAnimal((prev: Pet) => ({
      ...prev,
      stats: { ...prev.stats, hunger: 0 },
    }));
  };
  const handleResetHappiness = () => {
    setAnimal((prev: Pet) => ({
      ...prev,
      stats: { ...prev.stats, happiness: 0 },
    }));
  };
  const handleResetEnergy = () => {
    setAnimal((prev: Pet) => ({
      ...prev,
      stats: { ...prev.stats, energy: 0 },
    }));
  };

  const handleRefreshCoins = async () => {
    if (!userId || !token) return;

    try {
      const coinsData = await getChildCoins(token, userId);
      setTotalCoins(coinsData.coins);
      localStorage.setItem("currentCoins", coinsData.coins.toString());
    } catch (error) {
      console.error("Failed to refresh coins:", error);
    }
  };

  // const handlePurchase = (item: PurchasedItem) => {
  //   setPurchasedItems((prev: PurchasedItem[]) => [...prev, item]);
  // };

  // Debug: Log task categories
  useEffect(() => {
  }, [tasks, incompleteTasks, pendingApprovalTasks, approvedTasks]);

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
          <Button variant={activeTab === "home" ? "secondary" : "ghost"} className={`flex items-center px-3 py-2 rounded-lg justify-start border-r-2 transition-all ${activeTab === "home" ? "bg-purple-50 text-purple-600 border-purple-600" : "text-gray-600 hover:bg-gray-100 border-transparent"}`} onClick={() => setActiveTab("home")}>
            <Home className='w-5 h-5 mr-3' /> Home
          </Button>
          <Button variant={activeTab === "pet" ? "secondary" : "ghost"} className={`flex items-center px-3 py-2 rounded-lg justify-start border-r-2 transition-all ${activeTab === "pet" ? "bg-purple-50 text-purple-600 border-purple-600" : "text-gray-600 hover:bg-gray-100 border-transparent"}`} onClick={() => navigate("/kid/virtualpet")}>
            <User className='w-5 h-5 mr-3' /> My Pet
          </Button>
          <Button variant='ghost' className='flex items-center px-3 py-2 rounded-lg justify-start border-r-2 transition-all text-gray-600 hover:bg-gray-100 border-transparent' onClick={() => navigate("/kid/tasks")}>
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
        {activeTab === "home" ? (
          <>
            {/* Header */}
            <header className='px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'></div>
                <div className='flex items-center space-x-4'>
                  <div className='flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-300'>
                    <span className='text-yellow-600 font-bold text-lg'>🪙</span>
                    <span className='text-yellow-600 font-bold text-lg'>{totalCoins}</span>
                  </div>
                  {userId &&
                    (() => {
                      return <Notifications childId={userId} token={token} />;
                    })()}
                  <Avatar className='w-8 h-8 bg-purple-500'>
                    <AvatarFallback className='text-white text-sm font-medium'>I</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className='space-y-8 overflow-y-auto h-full p-5 pt-0 pb-0'>
              {/* Hero Section */}
              <Card className='bg-gradient-to-b from-[#8f8ef2] to-[#6a6ae7] rounded-2xl text-white relative overflow-hidden border-0 flex flex-col items-center text-center justify-center h-60 mb-5 shadow-none '>
                <CardContent className='relative z-10 max-w-lg p-8 '>
                  <CardTitle className='text-3xl font-bold mb-3'>Hi, {userName}</CardTitle>
                  <CardDescription className='text-[#c6c7f8] mb-5 text-md'>
                    The library serves as a welcoming home for knowledge <br /> seekers and avid readers alike
                  </CardDescription>
                  <Button className='bg-transparent border-2 border-white/20 backdrop-blur-sm text-[#bcbcf1] px-7 py-2 rounded-lg hover:bg-white/30 hover:text-white transition-colors'>Learn more</Button>
                </CardContent>
                {/* Decorative Elements */}
                <div className='absolute left-0 top-1/2 transform -translate-y-1/2 z-0 ml-20'>
                  <Player autoplay loop src={leftAnim} style={{ width: 170, height: 170 }} />
                </div>

                <div className='absolute right-0 top-1/2 transform -translate-y-1/2 z-0 mr-10'>
                  <Player autoplay loop src={rightAnim} style={{ width: 220, height: 220 }} />
                </div>
                {/* Floating circles */}
                <div className='absolute top-4 right-1/4 w-4 h-4 bg-yellow-300 rounded-full opacity-60'></div>
                <div className='absolute bottom-6 left-1/3 w-3 h-3 bg-pink-300 rounded-full opacity-50'></div>
                <div className='absolute top-1/3 right-1/3 w-2 h-2 bg-blue-300 rounded-full opacity-70'></div>
              </Card>

              <div className='flex gap-4'>
                {/* Left Column */}
                <div className='flex-1 space-y-8 rounded-2xl bg-white p-5 shadow-none'>
                  {/* Popular Section */}
                  <div>
                    <div className='flex items-center justify-between mb-4'>
                      <h2 className='text-xl font-bold text-gray-900'>Recent Incomplete Tasks</h2>
                      <Button variant='link' className='text-[#b8bac1] text-xs font-semibold hover:text-violet-300 p-0 h-auto' onClick={() => navigate("/kid/tasks")}>
                        VIEW ALL
                      </Button>
                    </div>
                    {loading && tasks.length === 0 ? (
                      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                        {[1, 2, 3, 4].map(i => (
                          <Card key={i} className='relative bg-gradient-to-br from-purple-200 to-blue-200 rounded-2xl flex flex-col justify-between p-4 aspect-square shadow hover:shadow-lg transition-all animate-pulse'>
                            <div className='w-12 h-12 bg-gray-300 rounded-xl mb-4 mx-auto'></div>
                            <div className='flex-1 flex flex-col justify-end w-full'>
                              <div className='h-4 bg-gray-300 rounded mb-2'></div>
                              <div className='h-3 bg-gray-300 rounded mb-4'></div>
                            </div>
                            <div className='h-8 bg-gray-300 rounded'></div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                        {incompleteTasks.map((task: Task, i: number) => (
                          <Card key={task._id} className='relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex flex-col justify-between p-4 aspect-square shadow hover:shadow-lg transition-all'>
                            <Button variant='ghost' size='icon' className='absolute top-3 right-3 bg-white/80 rounded-full p-1.5 shadow hover:bg-white'>
                              <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                                <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='#a78bfa' />
                              </svg>
                            </Button>
                            <CardContent className='flex flex-col items-center justify-between h-full p-0'>
                              <div className='w-12 h-12 bg-white/70 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                                <div className='w-7 h-7 bg-blue-400 rounded'></div>
                              </div>
                              <div className='flex-1 flex flex-col justify-end w-full'>
                                <CardTitle className='font-semibold text-gray-900 text-base truncate'>{task.title}</CardTitle>
                                <CardDescription className='text-gray-600 text-xs truncate'>{task.description}</CardDescription>
                                <div className='flex items-center gap-1 mt-2'>
                                  <span className='text-yellow-600 font-bold text-sm'>🪙</span>
                                  <span className='text-yellow-600 font-bold text-sm'>{task.reward}</span>
                                </div>
                              </div>
                              <Button className='mt-4 w-full' onClick={() => handleCompleteTask(task._id)}>
                                Complete
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pending Approval Section */}
                  {pendingApprovalTasks.length > 0 && (
                    <div className='mt-0'>
                      <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-xl font-bold text-gray-900'>Pending Approval</h2>
                        <Button variant='link' className='text-[#b8bac1] text-xs font-semibold hover:text-violet-300 p-0 h-auto' onClick={() => navigate("/kid/tasks")}>
                          VIEW ALL
                        </Button>
                      </div>
                      {loading ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                          {[1, 2, 3, 4].map(i => (
                            <Card key={i} className='relative bg-gradient-to-br from-yellow-200 to-orange-200 rounded-2xl flex flex-col justify-between p-4 aspect-square shadow hover:shadow-lg transition-all animate-pulse'>
                              <div className='w-12 h-12 bg-gray-300 rounded-xl mb-4 mx-auto'></div>
                              <div className='flex-1 flex flex-col justify-end w-full'>
                                <div className='h-4 bg-gray-300 rounded mb-2'></div>
                                <div className='h-3 bg-gray-300 rounded mb-4'></div>
                              </div>
                              <div className='h-8 bg-gray-300 rounded'></div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                          {pendingApprovalTasks.map((task: Task, i: number) => (
                            <Card key={task._id} className='relative bg-gradient-to-br from-yellow-200 to-orange-200 rounded-2xl flex flex-col justify-between p-4 aspect-square shadow hover:shadow-lg transition-all'>
                              <Button variant='ghost' size='icon' className='absolute top-3 right-3 bg-white/80 rounded-full p-1.5 shadow hover:bg-white'>
                                <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                                  <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='#a78bfa' />
                                </svg>
                              </Button>
                              <CardContent className='flex flex-col items-center justify-between h-full p-0'>
                                <div className='w-12 h-12 bg-white/70 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                                  <div className='w-7 h-7 bg-yellow-400 rounded'></div>
                                </div>
                                <div className='flex-1 flex flex-col justify-end w-full'>
                                  <CardTitle className='font-semibold text-gray-900 text-base truncate'>{task.title}</CardTitle>
                                  <CardDescription className='text-gray-600 text-xs truncate'>{task.description}</CardDescription>
                                  <div className='flex items-center gap-1 mt-2'>
                                    <span className='text-yellow-600 font-bold text-sm'>🪙</span>
                                    <span className='text-yellow-600 font-bold text-sm'>{task.reward}</span>
                                  </div>
                                </div>
                                <Button className='mt-4 w-full' variant='outline' onClick={() => handleUnapproveTask(task._id)}>
                                  Undo
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ongoing Section */}
                  <div className='mt-0'>
                    <div className='flex items-center justify-between mb-4'>
                      <h2 className='text-xl font-bold text-gray-900'>Recent Approved Tasks</h2>
                      <Button variant='link' className='text-[#b8bac1] text-xs font-semibold hover:text-violet-300 p-0 h-auto' onClick={() => navigate("/kid/tasks")}>
                        VIEW ALL
                      </Button>
                    </div>
                    {loading ? (
                      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                        {[1, 2, 3, 4].map(i => (
                          <Card key={i} className='relative bg-gradient-to-br from-purple-200 to-blue-200 rounded-2xl flex flex-col justify-between p-4 aspect-square shadow hover:shadow-lg transition-all animate-pulse'>
                            <div className='w-12 h-12 bg-gray-300 rounded-xl mb-4 mx-auto'></div>
                            <div className='flex-1 flex flex-col justify-end w-full'>
                              <div className='h-4 bg-gray-300 rounded mb-2'></div>
                              <div className='h-3 bg-gray-300 rounded mb-4'></div>
                            </div>
                            <div className='h-8 bg-gray-300 rounded'></div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                        {approvedTasks.map((task: Task, i: number) => (
                          <Card key={task._id} className='relative bg-gradient-to-br from-purple-200 to-blue-200 rounded-2xl flex flex-col justify-between p-4 aspect-square shadow hover:shadow-lg transition-all'>
                            <Button variant='ghost' size='icon' className='absolute top-3 right-3 bg-white/80 rounded-full p-1.5 shadow hover:bg-white'>
                              <svg width='20' height='20' fill='none' viewBox='0 0 24 24'>
                                <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='#a78bfa' />
                              </svg>
                            </Button>
                            <CardContent className='flex flex-col items-center justify-between h-full p-0'>
                              <div className='w-12 h-12 bg-white/70 rounded-xl flex items-center justify-center mb-4 mx-auto'>
                                <div className='w-7 h-7 bg-purple-400 rounded'></div>
                              </div>
                              <div className='flex-1 flex flex-col justify-end w-full'>
                                <CardTitle className='font-semibold text-gray-900 text-base truncate'>{task.title}</CardTitle>
                                <CardDescription className='text-gray-600 text-xs truncate'>{task.description}</CardDescription>
                                <div className='flex items-center gap-1 mt-2'>
                                  <span className='text-yellow-600 font-bold text-sm'>🪙</span>
                                  <span className='text-yellow-600 font-bold text-sm'>{task.reward}</span>
                                </div>
                              </div>
                              <div className='mt-4 w-full text-center text-green-600 font-semibold text-sm'>Coins Earned!</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className='w-80 space-y-4 mb-0'>
                  {/* Achievement Section */}
                  <Card className='bg-white rounded-xl p-0 shadow-none border-0 mb-4'>
                    <CardHeader className='flex items-center justify-between mb-0 p-4 pb-0'>
                      <CardTitle className='font-semibold text-gray-900 text-base'>Unlock achievement</CardTitle>
                      <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
                        <div className='w-4 h-4 bg-purple-500 rounded-full'></div>
                      </div>
                    </CardHeader>
                    <CardContent className='p-6 pt-2'>
                      <CardDescription className='text-gray-600 text-sm mb-4'>Goal achieved success unlocked</CardDescription>
                      <div className='space-y-3'>
                        <div className='flex items-center space-x-3'>
                          <Avatar className='w-10 h-10 bg-purple-100'>
                            <AvatarFallback className='text-purple-600 text-sm font-medium'>K</AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm font-medium'>60% Achieved</span>
                              <span className='text-xs text-gray-500'>7 Days left</span>
                            </div>
                            <div className='w-full bg-gray-200 rounded-full h-1.5 mt-1'>
                              <div className='bg-purple-500 h-1.5 rounded-full' style={{ width: "60%" }}></div>
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center space-x-3'>
                          <Avatar className='w-10 h-10 bg-orange-100'>
                            <AvatarFallback className='text-orange-600 text-sm font-medium'>A</AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm font-medium'>35% Achieved</span>
                              <span className='text-xs text-gray-500'>12 Days left</span>
                            </div>
                            <div className='w-full bg-gray-200 rounded-full h-1.5 mt-1'>
                              <div className='bg-orange-500 h-1.5 rounded-full' style={{ width: "35%" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pet Status Section */}
                  <Card className='bg-white rounded-xl p-0 shadow-none border-0 mb-4'>
                    <CardHeader className='flex items-center justify-between mb-0 p-4 pb-0'>
                      <CardTitle className='font-semibold text-gray-900 text-base'>My Pet Status</CardTitle>
                      <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                        <div className='w-4 h-4 bg-blue-500 rounded-full'></div>
                      </div>
                    </CardHeader>
                    <CardContent className='p-6 pt-2'>
                      <div className='flex items-center space-x-4 mb-4'>
                        {/* Pet Image */}
                        <div className='relative overflow-hidden' style={{ width: "100px", height: "120px" }}>
                          <div
                            style={{
                              width: 329,
                              height: 447,
                              background: "url(https://res.cloudinary.com/dytmcam8b/image/upload/v1561677299/virtual%20pet/Sheet.png) 0 0",
                              transform: "scale(0.25)",
                              transformOrigin: "top left",
                            }}
                          />
                          {/* Display accessories */}
                          {animal.accessories &&
                            animal.accessories.map(accessory => (
                              <div key={accessory.id} className='absolute top-0 left-0 w-full h-full' style={{ transform: "scale(0.25)", transformOrigin: "top left" }}>
                                <img src={accessory.image} alt={accessory.name} className='w-full h-full object-contain' />
                              </div>
                            ))}
                        </div>

                        {/* Pet Info */}
                        <div className='flex-1'>
                          <h4 className='font-semibold text-gray-900 text-sm mb-1'>{animal.name}</h4>
                          <p className='text-xs text-gray-600 mb-2'>Level {animal.level}</p>
                          <div className='flex items-center gap-1'>
                            <span className='text-yellow-600 text-xs'>🪙</span>
                            <span className='text-yellow-600 text-xs font-medium'>{animal.xp} XP</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='w-4 h-4 bg-orange-100 rounded flex items-center justify-center'>
                              <span className='text-orange-600 text-xs'>🍩</span>
                            </div>
                            <span className='text-xs text-gray-700'>Hunger</span>
                          </div>
                          <div className='flex-1 mx-3'>
                            <div className='w-full bg-gray-200 rounded-full h-1.5'>
                              <div className='bg-orange-500 h-1.5 rounded-full' style={{ width: `${(animal.stats.hunger / 100) * 100}%` }}></div>
                            </div>
                          </div>
                          <span className='text-xs text-gray-600 w-8 text-right'>{animal.stats.hunger}%</span>
                        </div>

                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='w-4 h-4 bg-yellow-100 rounded flex items-center justify-center'>
                              <span className='text-yellow-600 text-xs'>⭐</span>
                            </div>
                            <span className='text-xs text-gray-700'>Happiness</span>
                          </div>
                          <div className='flex-1 mx-3'>
                            <div className='w-full bg-gray-200 rounded-full h-1.5'>
                              <div className='bg-yellow-500 h-1.5 rounded-full' style={{ width: `${(animal.stats.happiness / 100) * 100}%` }}></div>
                            </div>
                          </div>
                          <span className='text-xs text-gray-600 w-8 text-right'>{animal.stats.happiness}%</span>
                        </div>

                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='w-4 h-4 bg-red-100 rounded flex items-center justify-center'>
                              <span className='text-red-600 text-xs'>❤️</span>
                            </div>
                            <span className='text-xs text-gray-700'>Energy</span>
                          </div>
                          <div className='flex-1 mx-3'>
                            <div className='w-full bg-gray-200 rounded-full h-1.5'>
                              <div className='bg-red-500 h-1.5 rounded-full' style={{ width: `${(animal.stats.energy / 100) * 100}%` }}></div>
                            </div>
                          </div>
                          <span className='text-xs text-gray-600 w-8 text-right'>{animal.stats.energy}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Best Sales Section */}
                  <Card className='bg-white rounded-xl p-0 shadow-none border-0'>
                    <CardHeader className='flex items-center justify-between mb-0 p-6 pb-0'>
                      <CardTitle className='font-semibold text-gray-900 text-base'>Best sales</CardTitle>
                      <Button variant='link' className='text-purple-600 text-sm font-medium hover:text-purple-700 p-0 h-auto'>
                        VIEW ALL
                      </Button>
                    </CardHeader>
                    <CardContent className='space-y-4 p-6 pt-2'>
                      {[1, 2, 3, 4].map((_, i) => (
                        <div key={i} className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <div className='w-12 h-12 bg-gradient-to-br from-pink-100 to-red-100 rounded-lg flex items-center justify-center'>
                              <div className='w-6 h-4 bg-pink-400 rounded'></div>
                            </div>
                            <div>
                              <span className='font-medium text-gray-900 block'>Grow green</span>
                              <div className='flex items-center space-x-1'>
                                <span className='text-yellow-400'>★</span>
                                <span className='text-sm text-gray-600'>4.5</span>
                              </div>
                            </div>
                          </div>
                          <Button className='bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium'>Order</Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </>
        ) : (
          <main className='p-6 space-y-8 overflow-y-auto h-full flex flex-col items-center justify-center'>
            <VirtualPet animal={animal} onFeed={handleFeed} onPlay={handlePlay} onSleep={handleSleep} onResetHunger={handleResetHunger} onResetHappiness={handleResetHappiness} onResetEnergy={handleResetEnergy} setAnimal={setAnimal} />
          </main>
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default KidDashboard;
