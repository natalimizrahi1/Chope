import { useEffect, useState, useCallback, useRef } from "react";
import { Pet } from "../pet/VirtualPet";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useNavigate } from "react-router-dom";
import { getTasks, completeTask, undoTask, getChildCoins } from "../../lib/api";
import { Task } from "../../lib/types";
import { Toaster } from "../ui/toaster";
import { Trophy, Coins, Target, CheckCircle, Play, ShoppingBag, LogOut, Clock } from "lucide-react";
import Notifications from "../notifications/Notifications";
import { useToast } from "../ui/use-toast";

const KidDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem("token") || "");
  const [userId, setUserId] = useState("");
  const [totalCoins, setTotalCoins] = useState(0);
  const [userName, setUserName] = useState("");
  const [activeTaskTab, setActiveTaskTab] = useState<"incomplete" | "pending" | "completed">("incomplete");

  // Add refs for tracking last update times
  const lastTaskUpdateRef = useRef<number>(0);
  const lastCoinsUpdateRef = useRef<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Task categories
  const incompleteTasks = tasks.filter((task: Task) => !task.completed);
  const pendingApprovalTasks = tasks.filter((task: Task) => task.completed && !task.approved);
  const approvedTasks = tasks.filter((task: Task) => task.completed && task.approved);

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
  const loadTasks = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!token || user.role !== "child") {
          localStorage.removeItem("cachedTasks");
          localStorage.removeItem("cachedTasksTimestamp");
          navigate("/login/kid");
          return;
        }
        setUserId(user.id);
        setUserName(user.name || user.username || "User");
        const tasksData = await getTasks(token, user.id);
        setTasks(tasksData);
        lastTaskUpdateRef.current = Date.now();
        localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
        localStorage.setItem("cachedTasksTimestamp", Date.now().toString());
        // Get coins from server
        const coinsData = await getChildCoins(token, user.id);
        setTotalCoins(coinsData.coins);
        lastCoinsUpdateRef.current = Date.now();
        localStorage.setItem("currentCoins", coinsData.coins.toString());
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [token, navigate]
  );

  // Silent refresh function for background updates
  const silentRefresh = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!token || user.role !== "child") {
        return;
      }
      const tasksData = await getTasks(token, user.id);
      setTasks(tasksData);
      lastTaskUpdateRef.current = Date.now();
      localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
      localStorage.setItem("cachedTasksTimestamp", Date.now().toString());

      // Get coins from server
      const coinsData = await getChildCoins(token, user.id);
      setTotalCoins(coinsData.coins);
      lastCoinsUpdateRef.current = Date.now();
      localStorage.setItem("currentCoins", coinsData.coins.toString());
    } catch (error) {
      console.error("Failed to silent refresh:", error);
    }
  }, [token]);

  useEffect(() => {
    loadTasks(true); // Show loading on initial load
  }, [loadTasks]);

  // Enhanced auto-refresh system with polling
  useEffect(() => {
    if (!userId || !token) return;

    // Function to check for updates
    const checkForUpdates = async () => {
      try {
        // Check if there's a new task created
        const newTaskCreated = localStorage.getItem("newTaskCreated");
        if (newTaskCreated) {
          const info = JSON.parse(newTaskCreated);
          if (info.childId === userId) {
            console.log("New task detected, silent refreshing tasks...");
            await silentRefresh();
            localStorage.removeItem("newTaskCreated");
            return;
          }
        }

        // Check if there's a task approval
        const taskApproved = localStorage.getItem("taskApproved");
        if (taskApproved) {
          const info = JSON.parse(taskApproved);
          if (info.childId === userId) {
            console.log("Task approval detected, silent refreshing tasks and coins...");
            await silentRefresh();
            localStorage.removeItem("taskApproved");
            return;
          }
        }

        // Check for last update time to see if we need to refresh
        const lastUpdate = localStorage.getItem("lastTaskUpdate");
        const lastUpdateTime = lastUpdate ? parseInt(lastUpdate) : 0;
        const currentTime = Date.now();

        // If more than 5 seconds have passed since last update, refresh silently
        if (currentTime - lastUpdateTime > 5000) {
          console.log("Auto-refreshing tasks and coins silently...");
          await silentRefresh();
        }
      } catch (error) {
        console.error("Error in auto-refresh:", error);
      }
    };

    // Set up polling every 3 seconds
    pollingIntervalRef.current = setInterval(checkForUpdates, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [userId, token, silentRefresh]);

  // Listen for task completion/approval events
  useEffect(() => {
    const handleTaskCompleted = async () => {
      console.log("Task completed event received");
      await silentRefresh();
    };

    const handleTaskApproved = async () => {
      console.log("Task approved event received");
      await silentRefresh();
    };

    const handleNewTaskCreated = async () => {
      console.log("New task created event received");
      await silentRefresh();
    };

    window.addEventListener("taskCompleted", handleTaskCompleted);
    window.addEventListener("taskApproved", handleTaskApproved);
    window.addEventListener("newTaskCreated", handleNewTaskCreated);

    return () => {
      window.removeEventListener("taskCompleted", handleTaskCompleted);
      window.removeEventListener("taskApproved", handleTaskApproved);
      window.removeEventListener("newTaskCreated", handleNewTaskCreated);
    };
  }, [silentRefresh]);

  // Listen for storage events (cross-tab communication)
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "taskApproved" && event.newValue) {
        const info = JSON.parse(event.newValue);
        if (info.childId === userId) {
          console.log("Storage event: Task approved");
          silentRefresh();
        }
      }

      // Listen for new task creation
      if (event.key === "newTaskCreated" && event.newValue) {
        const info = JSON.parse(event.newValue);
        if (info.childId === userId) {
          console.log("Storage event: New task created");
          silentRefresh();
        }
      }

      // Listen for last update time changes
      if (event.key === "lastTaskUpdate") {
        console.log("Storage event: Last update time changed");
        silentRefresh();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [silentRefresh, userId]);

  // Task actions
  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(token, taskId);
      await silentRefresh();

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
      await undoTask(token, taskId);
      await silentRefresh();

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Debug: Log task categories
  useEffect(() => {}, [tasks, incompleteTasks, pendingApprovalTasks, approvedTasks]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#87d4ee] via-[#f9a8d4] to-[#ffd986] relative overflow-hidden'>
      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden'>
        <motion.div
          className='absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full'
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className='absolute top-40 right-20 w-16 h-16 bg-white/20 rounded-full'
          animate={{
            y: [0, 15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className='absolute bottom-20 left-1/4 w-24 h-24 bg-white/20 rounded-full'
          animate={{
            y: [0, -10, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Modern Header */}
      <motion.div className='relative z-10 p-6' initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className='flex items-center justify-between'>
          {/* User info */}
          <div className='flex items-center gap-4'>
            <motion.div className='bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg' whileHover={{ scale: 1.05 }}>
              <Avatar className='w-12 h-12'>
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
                <AvatarFallback className='bg-gradient-to-br from-[#ffbacc] to-[#f9a8d4] text-white font-bold'>{userName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <h1 className='text-2xl font-bold text-white drop-shadow-lg'>Hello {userName}! 👋</h1>
              <p className='text-white/90 text-sm'>Let's play and progress! 🎮</p>
            </div>
          </div>

          {/* Coins, navigation and logout */}
          <div className='flex items-center gap-4'>
            {/* Navigation tabs */}
            <div className='bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg'>
              <div className='flex gap-2'>
                <motion.button className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all text-sm bg-gradient-to-r from-[#ffd986] to-[#ffbacc] text-white shadow-lg`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Target className='w-4 h-4' />
                  Tasks
                </motion.button>
                <motion.button onClick={() => navigate("/kid/virtualpet")} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all text-sm`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Play className='w-4 h-4' />
                  My Pet
                </motion.button>
                <motion.button onClick={() => navigate("/kid/shop")} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all text-sm`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <ShoppingBag className='w-4 h-4' />
                  Shop
                </motion.button>
              </div>
            </div>

            <motion.div className='bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2' whileHover={{ scale: 1.05 }}>
              <Coins className='w-5 h-5 text-yellow-500' />
              <span className='font-bold text-lg text-gray-800'>{totalCoins}</span>
            </motion.div>

            {/* Notifications */}
            <div className='relative z-50'>
              <Notifications childId={userId} token={token} />
            </div>

            <motion.button onClick={handleLogout} className='bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg hover:bg-white transition-colors' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <LogOut className='w-5 h-5 text-gray-600' />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      {/* AnimatePresence and tab content are now outside the px-6 pb-6 container */}
      <AnimatePresence mode='wait'>
        <motion.div key='tasks' initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.4 }} className='relative z-0 px-6 pb-6 space-y-6'>
          {/* Stats cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <motion.div className='bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg' whileHover={{ scale: 1.02 }}>
              <div className='flex items-center gap-3'>
                <div className='bg-gradient-to-br from-[#87d4ee] to-[#4ec3f7] rounded-xl p-2'>
                  <Target className='w-6 h-6 text-white' />
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Remaining Tasks</p>
                  <p className='text-2xl font-bold text-gray-800'>{incompleteTasks.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div className='bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg' whileHover={{ scale: 1.02 }}>
              <div className='flex items-center gap-3'>
                <div className='bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl p-2'>
                  <Clock className='w-6 h-6 text-white' />
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Pending Approval</p>
                  <p className='text-2xl font-bold text-gray-800'>{pendingApprovalTasks.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div className='bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg' whileHover={{ scale: 1.02 }}>
              <div className='flex items-center gap-3'>
                <div className='bg-gradient-to-br from-[#f9a8d4] to-[#ffbacc] rounded-xl p-2'>
                  <CheckCircle className='w-6 h-6 text-white' />
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Completed Today</p>
                  <p className='text-2xl font-bold text-gray-800'>{approvedTasks.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div className='bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg' whileHover={{ scale: 1.02 }}>
              <div className='flex items-center gap-3'>
                <div className='bg-gradient-to-br from-[#ffd986] to-[#ffbacc] rounded-xl p-2'>
                  <Trophy className='w-6 h-6 text-white' />
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Progress Level</p>
                  <p className='text-2xl font-bold text-gray-800'>{tasks.length > 0 ? Math.round((approvedTasks.length / tasks.length) * 100) : 0}%</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tasks */}
          <div className='bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='bg-gradient-to-br from-[#87d4ee] to-[#4ec3f7] rounded-xl p-2'>
                <Target className='w-6 h-6 text-white' />
              </div>
              <h2 className='text-2xl font-bold text-gray-800'>Your Tasks Today</h2>
            </div>

            {/* Task tabs */}
            <div className='flex gap-2 mb-6'>
              <motion.button onClick={() => setActiveTaskTab("incomplete")} className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${activeTaskTab === "incomplete" ? "bg-gradient-to-r from-[#87d4ee] to-[#4ec3f7] text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Remaining ({incompleteTasks.length})
              </motion.button>
              <motion.button onClick={() => setActiveTaskTab("pending")} className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${activeTaskTab === "pending" ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Pending ({pendingApprovalTasks.length})
              </motion.button>
              <motion.button onClick={() => setActiveTaskTab("completed")} className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${activeTaskTab === "completed" ? "bg-gradient-to-r from-[#f9a8d4] to-[#ffbacc] text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Completed ({approvedTasks.length})
              </motion.button>
            </div>

            {loading ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#87d4ee] mx-auto'></div>
                <p className='text-gray-600 mt-4'>Loading tasks...</p>
              </div>
            ) : activeTaskTab === "incomplete" && incompleteTasks.length === 0 ? (
              <div className='text-center py-8'>
                <div className='bg-gradient-to-br from-[#ffd986] to-[#ffbacc] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                  <Trophy className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-xl font-bold text-gray-800 mb-2'>Great job! 🎉</h3>
                <p className='text-gray-600'>You've completed all your tasks today!</p>
              </div>
            ) : activeTaskTab === "pending" && pendingApprovalTasks.length === 0 ? (
              <div className='text-center py-8'>
                <div className='bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                  <Clock className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-xl font-bold text-gray-800 mb-2'>No pending tasks</h3>
                <p className='text-gray-600'>Complete some tasks to see them here!</p>
              </div>
            ) : activeTaskTab === "completed" && approvedTasks.length === 0 ? (
              <div className='text-center py-8'>
                <div className='bg-gradient-to-br from-[#87d4ee] to-[#4ec3f7] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                  <Target className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-xl font-bold text-gray-800 mb-2'>No completed tasks yet</h3>
                <p className='text-gray-600'>Complete some tasks to see them here!</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {(activeTaskTab === "incomplete" ? incompleteTasks : activeTaskTab === "pending" ? pendingApprovalTasks : approvedTasks).map((task, index) => (
                  <motion.div key={task._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} className={`bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] rounded-xl p-4 border-l-4 transition-all ${activeTaskTab === "incomplete" ? "border-[#87d4ee] hover:shadow-md" : activeTaskTab === "pending" ? "border-yellow-400 hover:shadow-md" : "border-[#f9a8d4] hover:shadow-md"}`}>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-gray-800 mb-1'>{task.title}</h3>
                        {task.description && <p className='text-sm text-gray-600'>{task.description}</p>}
                        <div className='flex items-center gap-2 mt-2'>
                          <Coins className='w-4 h-4 text-yellow-500' />
                          <span className='text-sm font-medium text-gray-700'>{task.reward} coins</span>
                        </div>
                      </div>
                      {activeTaskTab === "incomplete" && (
                        <motion.button onClick={() => handleCompleteTask(task._id)} className='bg-gradient-to-r from-[#87d4ee] to-[#4ec3f7] text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          Complete! ✨
                        </motion.button>
                      )}
                      {activeTaskTab === "pending" && (
                        <motion.button onClick={() => handleUndoTask(task._id)} className='bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          Undo
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <Toaster />
    </div>
  );
};

export default KidDashboard;
