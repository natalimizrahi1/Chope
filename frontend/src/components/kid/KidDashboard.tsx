import { useEffect, useState, useCallback } from "react";
import VirtualPet, { Pet } from "../pet/VirtualPet";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Player } from "@lottiefiles/react-lottie-player";
import leftAnim from "@/assets/animations/left-decor.json";
import rightAnim from "@/assets/animations/right-decor.json";
import { useNavigate } from "react-router-dom";
import { getTasks, completeTask, undoTask, getChildCoins, unapproveTask, testServerConnection } from "../../lib/api";
import { Task } from "../../lib/types";
import { Toaster } from "../ui/toaster";
import { Trophy, Coins, Target, CheckCircle, Play, ShoppingBag, LogOut } from "lucide-react";
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
  const [activeSection, setActiveSection] = useState<"tasks" | "pet" | "shop">("tasks");
  const [activeTaskTab, setActiveTaskTab] = useState<"incomplete" | "completed">("incomplete");

  // Task categories
  const incompleteTasks = tasks.filter((task: Task) => !task.completed);
  const pendingApprovalTasks = tasks.filter((task: Task) => task.completed && !task.approved);
  const approvedTasks = tasks.filter((task: Task) => task.completed && task.approved);
  const completedTasksArr = tasks.filter((task: Task) => task.completed);

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
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
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
      localStorage.setItem("cachedTasks", JSON.stringify(tasksData));
      localStorage.setItem("cachedTasksTimestamp", Date.now().toString());
      // Get coins from server
      const coinsData = await getChildCoins(token, user.id);
      setTotalCoins(coinsData.coins);
      localStorage.setItem("currentCoins", coinsData.coins.toString());
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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

  // Listen for task completion/approval events
  useEffect(() => {
    const handleTaskCompleted = async () => {
      await loadTasks();
    };
    const handleTaskApproved = async () => {
      await loadTasks();
    };
    window.addEventListener("taskCompleted", handleTaskCompleted);
    window.addEventListener("taskApproved", handleTaskApproved);
    return () => {
      window.removeEventListener("taskCompleted", handleTaskCompleted);
      window.removeEventListener("taskApproved", handleTaskApproved);
    };
  }, [loadTasks]);

  // Task actions
  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(token, taskId);
      await loadTasks();
      toast({
        title: "Task Sent for Approval",
        description: "Your task has been sent to your parent for approval. You will receive your coins once approved.",
      });
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
      await loadTasks();
      toast({
        title: "Task Undone",
        description: "The task has been undone. If it was approved, coins have been deducted.",
      });
      window.dispatchEvent(new CustomEvent("taskCompleted"));
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
      await loadTasks();
      toast({
        title: "Task Unapproved",
        description: "The task has been unapproved and coins have been deducted. You can complete it again to earn coins.",
      });
      window.dispatchEvent(new CustomEvent("taskCompleted"));
    } catch (error) {
      console.error("Failed to unapprove task:", error);
      toast({
        title: "Error",
        description: "Failed to unapprove task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleShopClick = () => {
    navigate("/kid/shop");
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
                <motion.button onClick={() => setActiveSection("tasks")} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all text-sm ${activeSection === "tasks" ? "bg-gradient-to-r from-[#ffd986] to-[#ffbacc] text-white shadow-lg" : "text-gray-600 hover:text-gray-800"}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Target className='w-4 h-4' />
                  Tasks
                </motion.button>
                <motion.button onClick={() => setActiveSection("pet")} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all text-sm ${activeSection === "pet" ? "bg-gradient-to-r from-[#ffd986] to-[#ffbacc] text-white shadow-lg" : "text-gray-600 hover:text-gray-800"}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Play className='w-4 h-4' />
                  My Pet
                </motion.button>
                <motion.button onClick={handleShopClick} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition-all text-sm ${activeSection === "shop" ? "bg-gradient-to-r from-[#ffd986] to-[#ffbacc] text-white shadow-lg" : "text-gray-600 hover:text-gray-800"}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
        {activeSection === "tasks" && (
          <motion.div key='tasks' initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.4 }} className='relative z-0 px-6 pb-6 space-y-6'>
            {/* Stats cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                  <div className='bg-gradient-to-br from-[#f9a8d4] to-[#ffbacc] rounded-xl p-2'>
                    <CheckCircle className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Completed Today</p>
                    <p className='text-2xl font-bold text-gray-800'>{completedTasksArr.length}</p>
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
                    <p className='text-2xl font-bold text-gray-800'>{tasks.length > 0 ? Math.round((completedTasksArr.length / tasks.length) * 100) : 0}%</p>
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
                <motion.button onClick={() => setActiveTaskTab("completed")} className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${activeTaskTab === "completed" ? "bg-gradient-to-r from-[#f9a8d4] to-[#ffbacc] text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Completed ({completedTasksArr.length})
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
              ) : activeTaskTab === "completed" && completedTasksArr.length === 0 ? (
                <div className='text-center py-8'>
                  <div className='bg-gradient-to-br from-[#87d4ee] to-[#4ec3f7] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                    <Target className='w-8 h-8 text-white' />
                  </div>
                  <h3 className='text-xl font-bold text-gray-800 mb-2'>No completed tasks yet</h3>
                  <p className='text-gray-600'>Complete some tasks to see them here!</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {(activeTaskTab === "incomplete" ? incompleteTasks : completedTasksArr).map((task, index) => (
                    <motion.div key={task._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} className={`bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] rounded-xl p-4 border-l-4 transition-all ${activeTaskTab === "incomplete" ? "border-[#87d4ee] hover:shadow-md" : "border-[#f9a8d4] hover:shadow-md"}`}>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <h3 className='font-semibold text-gray-800 mb-1'>{task.title}</h3>
                          {task.description && <p className='text-sm text-gray-600'>{task.description}</p>}
                          <div className='flex items-center gap-2 mt-2'>
                            <Coins className='w-4 h-4 text-yellow-500' />
                            <span className='text-sm font-medium text-gray-700'>{task.reward} coins</span>
                          </div>
                        </div>
                        {activeTaskTab === "incomplete" ? (
                          <motion.button onClick={() => handleCompleteTask(task._id)} className='bg-gradient-to-r from-[#87d4ee] to-[#4ec3f7] text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            Complete! ✨
                          </motion.button>
                        ) : (
                          <motion.button onClick={() => handleUndoTask(task._id)} className='bg-gradient-to-r from-[#f9a8d4] to-[#ffbacc] text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            Undo
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Approval Section */}
            {pendingApprovalTasks.length > 0 && (
              <div className='bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='bg-gradient-to-br from-yellow-200 to-orange-200 rounded-xl p-2'>
                    <CheckCircle className='w-6 h-6 text-white' />
                  </div>
                  <h2 className='text-2xl font-bold text-gray-800'>Waiting for Parent Approval</h2>
                </div>
                <div className='space-y-4'>
                  {pendingApprovalTasks.map(task => (
                    <div key={task._id} className='bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-l-4 border-yellow-300 flex items-center justify-between'>
                      <div>
                        <h3 className='font-semibold text-gray-800 mb-1'>{task.title}</h3>
                        <p className='text-sm text-gray-600'>{task.description}</p>
                      </div>
                      <span className='text-yellow-600 font-bold'>Pending Approval</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeSection === "pet" && (
          <motion.div key='pet' initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.4 }} className='w-full flex flex-col items-center justify-center min-h-[60vh] p-0 m-0'>
            {/* Pet board full width, centered */}
            <div className='w-full flex flex-col items-center justify-center'>
              <VirtualPet animal={animal} setAnimal={setAnimal} />
            </div>
          </motion.div>
        )}

        {activeSection === "shop" && (
          <motion.div key='shop' initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.4 }} className='relative z-0 px-6 pb-6 space-y-6'>
            <div className='bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='bg-gradient-to-br from-[#ffd986] to-[#ffbacc] rounded-xl p-2'>
                  <ShoppingBag className='w-6 h-6 text-white' />
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>Pet Shop</h2>
              </div>

              <div className='text-center py-8'>
                <div className='bg-gradient-to-br from-[#ffd986] to-[#ffbacc] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                  <ShoppingBag className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-xl font-bold text-gray-800 mb-2'>Coming Soon! 🛍️</h3>
                <p className='text-gray-600'>The shop will open soon with lots of surprises!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  );
};

export default KidDashboard;
