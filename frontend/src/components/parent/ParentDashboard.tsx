import { useEffect, useState, useRef } from "react";
import { getChildren, getTasks, approveTask } from "../../lib/api";
import type { Animal } from "../../lib/types";
import { useToast } from "../ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ChartPieInteractive } from "../ui/chart-pie-interactive";
import { DataTable } from "../ui/data-table";
import { SectionCards } from "../ui/section-cards";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, LogOut, User, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type Child = {
  _id: string;
  name: string;
  email: string;
  coins: number;
  animal?: Animal;
};

type Task = {
  _id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  child: string;
  completed: boolean;
  approved: boolean;
  completedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
};

type TaskTableData = {
  id: number;
  taskId: string;
  header: string;
  description: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
};

const childColors = ["bg-blue-50", "bg-indigo-50", "bg-purple-50", "bg-teal-50", "bg-yellow-50", "bg-orange-50", "bg-pink-50", "bg-green-50"];

function getChildColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return childColors[Math.abs(hash) % childColors.length];
}

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [taskTableData, setTaskTableData] = useState<TaskTableData[]>([]);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [chartData, setChartData] = useState([
    { name: "Tasks Sent", value: 0, color: "#3B82F6" },
    { name: "Pending Approval", value: 0, color: "#FFBB28" },
    { name: "Approved Tasks", value: 0, color: "#00C49F" },
  ]);
  const [coinsData, setCoinsData] = useState([
    { name: "Coins Given by Parent", value: 0, color: "#FFD700" },
    { name: "Total Children Coins", value: 0, color: "#4ECDC4" },
  ]);
  const [categoryData, setCategoryData] = useState([
    { name: "Homework", value: 0, color: "#3B82F6" },
    { name: "Chores", value: 0, color: "#10B981" },
    { name: "Reading", value: 0, color: "#F59E0B" },
    { name: "Exercise", value: 0, color: "#EF4444" },
    { name: "Other", value: 0, color: "#8B5CF6" },
  ]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get parent id robustly
  const userObj = JSON.parse(localStorage.getItem("user") || "{}") || {};
  console.log("user from localStorage:", userObj);
  const parentId = userObj._id || userObj.id || "N/A";
  const parentName = userObj.name || "Parent";

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
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
    getChildren(token)
      .then(childrenData => {
        setChildren(childrenData);
      })
      .catch(error => {
        console.error("Failed to load children:", error);
        if (error instanceof Error && error.message.includes("401")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login/parent");
        }
      });
  }, [navigate, toast]);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const loadAllTasks = async () => {
      try {
        if (children.length === 0) return;

        const tasksPromises = children.map(async child => {
          const tasks = await getTasks(token, child._id);
          return tasks.map((task: Task) => ({
            ...task,
            childName: child.name,
          }));
        });

        const allChildTasks = await Promise.all(tasksPromises);
        const flatTasks = allChildTasks.flat();
        setAllTasks(flatTasks);

        const tableData: TaskTableData[] = flatTasks.map((task, index) => {
          let status = "Pending";
          if (task.completed && task.approved) {
            status = "Approved";
          } else if (task.completed && !task.approved) {
            status = "Completed";
          }

          return {
            id: index + 1,
            taskId: task._id,
            header: task.title,
            description: task.description,
            type: task.category,
            status: status,
            target: task.reward.toString(),
            limit: task.childName,
            reviewer: task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "-",
          };
        });

        setTaskTableData(tableData);

        const totalTasks = flatTasks.length;
        const approvedTasks = flatTasks.filter(task => task.completed && task.approved).length;
        const pendingApproval = flatTasks.filter(task => task.completed && !task.approved).length;
        const totalChildrenCoins = children.reduce((sum, child) => sum + child.coins, 0);

        setPendingTasksCount(pendingApproval);
        setChartData([
          { name: "Tasks Sent", value: totalTasks, color: "#3B82F6" },
          { name: "Pending Approval", value: pendingApproval, color: "#FFBB28" },
          { name: "Approved Tasks", value: approvedTasks, color: "#00C49F" },
        ]);
        setCoinsData([
          {
            name: "Coins Given by Parent",
            value: approvedTasks * 10,
            color: "#FFD700",
          },
          {
            name: "Total Children Coins",
            value: totalChildrenCoins,
            color: "#4ECDC4",
          },
        ]);

        // Calculate tasks by category
        const categoryCounts: { [key: string]: number } = {};
        flatTasks.forEach(task => {
          const category = task.category || "Other";
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        setCategoryData([
          { name: "Custom", value: categoryCounts["custom"] || 0, color: "#3B82F6" },
          { name: "Education", value: categoryCounts["education"] || 0, color: "#10B981" },
          { name: "Health", value: categoryCounts["health"] || 0, color: "#F59E0B" },
          { name: "Creative", value: categoryCounts["creative"] || 0, color: "#EF4444" },
          { name: "Fitness", value: (categoryCounts["fitness"] || 0) + (categoryCounts["nature"] || 0), color: "#8B5CF6" },
        ]);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      }
    };

    if (children.length > 0) {
      loadAllTasks();
    }
  }, [children]);

  const handleChildSelect = (childId: string) => {
    navigate(`/parent/child/${childId}`);
  };

  const handleApproveTask = async (taskId: string) => {
    const token = localStorage.getItem("token") || "";
    try {
      await approveTask(token, taskId);
      toast({
        title: "Task Approved",
        description: "The task has been approved successfully.",
      });
      window.location.reload();
    } catch (error) {
      console.error("Failed to approve task:", error);
      toast({
        title: "Error",
        description: "Failed to approve the task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (taskId: string) => {
    const task = allTasks.find(t => t._id === taskId);
    if (task) {
      navigate(`/parent/child/${task.child}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login/parent");
  };

  const scrollToTip = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = 300 + 24; // card width + gap
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
    }
    setCurrentTipIndex(index);
  };

  const nextTip = () => {
    const nextIndex = Math.min(currentTipIndex + 1, 5);
    scrollToTip(nextIndex);
  };

  const prevTip = () => {
    const prevIndex = Math.max(currentTipIndex - 1, 0);
    scrollToTip(prevIndex);
  };

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
          <button className='w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold mb-4 cursor-default text-sm'>
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
              <button key={child._id} onClick={() => handleChildSelect(child._id)} className='w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left'>
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
          <Button variant='outline' onClick={handleLogout} className='w-full flex items-center gap-2'>
            <LogOut className='w-4 h-4' />
            Logout
          </Button>
        </div>
      </aside>
      {/* Main Content Area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Header */}
        <header className='bg-[#f3f3f3] px-2 sm:px-6 py-0 pt-10'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              {/* Mobile Menu Button (outside Sheet) */}
              <button onClick={() => setIsMobileMenuOpen(true)} className='lg:hidden bg-white rounded-full p-2 shadow border border-gray-200'>
                <Menu className='w-5 h-5 text-gray-700' />
              </button>
              <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
              <div className='hidden md:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2'>
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
            </div>

            <div className='flex items-center gap-3'>
              <Avatar className='h-8 w-8'>
                <AvatarFallback className='bg-blue-100 text-blue-600'>
                  <User className='w-4 h-4' />
                </AvatarFallback>
              </Avatar>
              <div className='text-right'>
                <p className='text-sm text-gray-600'>Welcome back, {parentName}</p>
              </div>
            </div>
          </div>
        </header>
        {/* Sheet Sidebar for Mobile */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side='left' className='w-64 p-0 bg-white border-r border-gray-200 shadow-lg'>
            <div className='flex flex-col h-full'>
              {/* Logo */}
              <div className='border-b border-gray-200'>
                <img src='/light_logo.svg' alt='CHOPE Logo' className='mx-0 my-[-30px] w-40 h-40' />
              </div>
              {/* Children List */}
              <div className='flex-1 p-6'>
                <h3 className='text-sm font-semibold text-gray-700 mb-4'>Your Children</h3>
                <div className='space-y-3'>
                  {children.map(child => (
                    <button
                      key={child._id}
                      onClick={() => {
                        handleChildSelect(child._id);
                        setIsMobileMenuOpen(false);
                      }}
                      className='w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left'>
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
                    handleLogout();
                    setIsMobileMenuOpen(false);
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
        <main className='flex-1 overflow-y-auto p-2 sm:p-6 space-y-6'>
          {/* Welcome Message */}
          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4'>
            <div className='flex items-center gap-6'>
              <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <div>
                <h2 className='text-lg font-bold text-gray-900 text-left'>Welcome back!</h2>
                <p className='text-[15px] text-gray-600'>Here you can track your children's performance and manage their tasks</p>
              </div>
            </div>
          </div>
          {/* Responsive grid for cards and charts */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
            {/* Statistics Cards */}
            <div className='lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4'>
              <SectionCards childrenCount={children.length} totalTasks={allTasks.length} pendingTasks={pendingTasksCount} totalCoinsGiven={allTasks.filter(task => task.completed && task.approved).reduce((sum, task) => sum + task.reward, 0)} />
            </div>

            {/* Charts Section - 2 columns */}
            <div className='lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4'>
              {/* Task Distribution Chart */}
              <ChartPieInteractive data={chartData} title='Task Distribution' description="Overview of children's task statuses" />

              {/* Coins Overview Chart */}
              <ChartPieInteractive data={coinsData} title='Coins Overview' description='Coins given vs coins held' />
            </div>
          </div>
          {/* Category Chart + Tasks Table Row */}
          <div className='flex flex-col lg:flex-row items-start gap-4'>
            {/* Left Column: Category Chart + Tips Carousel */}
            <div className='flex flex-col gap-4 max-w-sm w-full flex-shrink-0'>
              {/* Category Chart */}
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6'>
                <div className='flex justify-between pb-4 mb-4 border-b border-gray-200'>
                  <div className='flex items-center'>
                    <div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center me-3'>
                      <svg className='w-6 h-6 text-gray-500' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 20 19'>
                        <path d='M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z' />
                        <path d='M5 19h10v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2ZM5 7a5.008 5.008 0 0 1 4-4.9 3.988 3.988 0 1 0-3.9 5.859A4.974 4.974 0 0 1 5 7Zm5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-1h-.424a5.016 5.016 0 0 1-1.942 2.232A6.007 6.007 0 0 1 17 17h2a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5ZM5.424 9H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h2a6.007 6.007 0 0 1 4.366-5.768A5.016 5.016 0 0 1 5.424 9Z' />
                      </svg>
                    </div>
                    <div>
                      <h3 className='leading-none text-xl font-bold text-gray-900 pb-1 text-left'>{allTasks.length}</h3>
                      <p className='text-sm font-normal text-gray-500'>Total tasks created</p>
                    </div>
                  </div>
                  <div>
                    <span className='bg-green-100 text-green-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md'>
                      <svg className='w-2.5 h-2.5 me-1.5' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 10 14'>
                        <path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13V1m0 0L1 5m4-4 4 4' />
                      </svg>
                      {allTasks.length > 0 ? Math.round((allTasks.filter(task => task.completed && task.approved).length / allTasks.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className='grid grid-cols-2'>
                  <dl className='flex items-center'>
                    <dt className='text-gray-500 text-sm font-normal me-1'>Completed:</dt>
                    <dd className='text-gray-900 text-sm font-semibold'>{allTasks.filter(task => task.completed && task.approved).length}</dd>
                  </dl>
                  <dl className='flex items-center justify-end'>
                    <dt className='text-gray-500 text-sm font-normal me-1'>Pending:</dt>
                    <dd className='text-gray-900 text-sm font-semibold'>{pendingTasksCount}</dd>
                  </dl>
                </div>
                {/* Column Chart */}
                <div className='mt-6 h-48'>
                  <div className='grid grid-cols-5 gap-2 h-full items-end'>
                    {categoryData.map((category, index) => {
                      const maxValue = Math.max(...categoryData.map(c => c.value), 1);
                      const barHeight = Math.max(40, (category.value / maxValue) * 80);
                      return (
                        <div key={index} className='flex flex-col items-center'>
                          <div className='w-full flex items-end justify-center mb-2 h-32'>
                            <div
                              className='w-3 rounded-t-sm transition-all duration-300'
                              style={{
                                height: `${barHeight}%`,
                                backgroundColor: category.color,
                                minHeight: "8px",
                              }}
                            />
                          </div>
                          <p className='text-xs text-gray-600 text-center'>{category.name}</p>
                          <p className='text-xs font-semibold' style={{ color: category.color }}>
                            {category.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* Tips Section - Carousel */}
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 w-full max-w-sm'>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h3 className='text-base font-bold text-gray-900'>Parent Tips</h3>
                    <p className='text-xs text-gray-600'>Helpful tips to manage your children's tasks</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm' onClick={prevTip} disabled={currentTipIndex === 0} className='w-8 h-8 p-0'>
                      <ChevronLeft className='w-4 h-4' />
                    </Button>
                    <Button variant='outline' size='sm' onClick={nextTip} disabled={currentTipIndex === 5} className='w-8 h-8 p-0'>
                      <ChevronRight className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
                <div className='relative'>
                  <div ref={carouselRef} className='flex gap-4 overflow-x-auto pb-2 scrollbar-hide'>
                    <div className='bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 min-w-[220px]'>
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='w-7 h-7 bg-blue-200 rounded-lg flex items-center justify-center'>
                          <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                          </svg>
                        </div>
                        <h4 className='font-semibold text-blue-900 text-xs'>How to Approve Tasks</h4>
                      </div>
                      <p className='text-xs text-blue-700'>Click the "Approve" button in the table below when your child completes a task</p>
                    </div>
                    <div className='bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 min-w-[220px]'>
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='w-7 h-7 bg-green-200 rounded-lg flex items-center justify-center'>
                          <svg className='w-4 h-4 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                          </svg>
                        </div>
                        <h4 className='font-semibold text-green-900 text-xs'>Send New Task</h4>
                      </div>
                      <p className='text-xs text-green-700'>Select a child from the sidebar and click "Add Task" to create a new task</p>
                    </div>
                    <div className='bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4 min-w-[220px]'>
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='w-7 h-7 bg-yellow-200 rounded-lg flex items-center justify-center'>
                          <svg className='w-4 h-4 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' />
                          </svg>
                        </div>
                        <h4 className='font-semibold text-yellow-900 text-xs'>Track Coins</h4>
                      </div>
                      <p className='text-xs text-yellow-700'>See how many coins were given this week and track achievements</p>
                    </div>
                    <div className='bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 min-w-[220px]'>
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='w-7 h-7 bg-purple-200 rounded-lg flex items-center justify-center'>
                          <svg className='w-4 h-4 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                          </svg>
                        </div>
                        <h4 className='font-semibold text-purple-900 text-xs'>Performance Check</h4>
                      </div>
                      <p className='text-xs text-purple-700'>The charts above show task distribution and coins overview</p>
                    </div>
                    <div className='bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 min-w-[220px]'>
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='w-7 h-7 bg-orange-200 rounded-lg flex items-center justify-center'>
                          <svg className='w-4 h-4 text-orange-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                          </svg>
                        </div>
                        <h4 className='font-semibold text-orange-900 text-xs'>Pending Tasks</h4>
                      </div>
                      <p className='text-xs text-orange-700'>When there are tasks pending approval, you'll see a yellow alert</p>
                    </div>
                    <div className='bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-xl p-4 min-w-[220px]'>
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='w-7 h-7 bg-pink-200 rounded-lg flex items-center justify-center'>
                          <svg className='w-4 h-4 text-pink-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                          </svg>
                        </div>
                        <h4 className='font-semibold text-pink-900 text-xs'>Quick Navigation</h4>
                      </div>
                      <p className='text-xs text-pink-700'>Use the sidebar to quickly navigate between different children</p>
                    </div>
                  </div>
                  {/* Carousel Indicators */}
                  <div className='flex justify-center gap-1 mt-2'>
                    {[0, 1, 2, 3, 4, 5].map(index => (
                      <button key={index} onClick={() => scrollToTip(index)} className={`w-2 h-2 rounded-full transition-colors ${index === currentTipIndex ? "bg-purple-600" : "bg-gray-300"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Right Column: Tasks Table */}
            {taskTableData.length > 0 && (
              <div className='flex-1 ml-0 lg:ml-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 overflow-x-auto'>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h3 className='text-base font-bold text-gray-900 text-left'>Recent Tasks</h3>
                    <p className='text-sm text-gray-600'>Overview of all tasks across your children</p>
                  </div>
                  <div className='w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center'>
                    <svg className='w-5 h-5 text-indigo-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                    </svg>
                  </div>
                </div>
                <DataTable data={taskTableData} onApproveTask={handleApproveTask} onReloadTasks={() => window.location.reload()} onViewDetails={handleViewDetails} />
              </div>
            )}
          </div>

          {/* Pending Tasks Alert */}
          {pendingTasksCount > 0 && (
            <div className='bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center'>
                    <svg className='w-6 h-6 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>Tasks Pending Approval</h3>
                    <p className='text-gray-600'>You have {pendingTasksCount} task(s) waiting for your review</p>
                  </div>
                </div>
                <Button
                  variant='outline'
                  size='lg'
                  onClick={() => {
                    const firstChild = children[0];
                    if (firstChild) {
                      navigate(`/parent/child/${firstChild._id}`);
                    }
                  }}
                  className='bg-white hover:bg-gray-50 border-amber-200 text-amber-700 hover:text-amber-800'>
                  Review Now
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
