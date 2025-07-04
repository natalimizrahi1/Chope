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
      {/* Sidebar */}
      <aside className='hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col'>
        {/* Logo */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-center'>
            <svg xmlns='http://www.w3.org/2000/svg' width='120' height='40' viewBox='0 0 375 374.999991'>
              <g style={{ fill: "#23326a", fillOpacity: 1 }}>
                <g transform='translate(65.662515, 235.67957)'>
                  <path
                    style={{ stroke: "none" }}
                    d='M 33.203125 0.484375 C 29.898438 1.347656 26.515625 1.617188 23.046875 1.296875 C 19.585938 0.972656 16.34375 0.0390625 13.3125 -1.5 C 10.28125 -3.039062 7.765625 -5.140625 5.765625 -7.796875 C 4.035156 -10.171875 2.695312 -12.914062 1.75 -16.03125 C 0.800781 -19.144531 0.242188 -22.429688 0.078125 -25.890625 C -0.078125 -29.359375 0.0820312 -32.769531 0.5625 -36.125 C 1.488281 -41.757812 3.410156 -46.523438 6.328125 -50.421875 C 9.253906 -54.316406 12.910156 -57.019531 17.296875 -58.53125 C 21.679688 -60.050781 26.523438 -60.050781 31.828125 -58.53125 C 35.347656 -57.613281 38.09375 -56.257812 40.0625 -54.46875 C 42.039062 -52.6875 43.460938 -50.6875 44.328125 -48.46875 C 45.191406 -46.25 45.703125 -44.003906 45.859375 -41.734375 C 46.023438 -39.460938 46.054688 -37.378906 45.953125 -35.484375 C 45.898438 -33.859375 44.925781 -32.910156 43.03125 -32.640625 L 31.5 -32.3125 C 30.632812 -32.207031 29.875 -32.4375 29.21875 -33 C 28.570312 -33.570312 28.222656 -34.289062 28.171875 -35.15625 C 28.171875 -35.476562 28.128906 -36.054688 28.046875 -36.890625 C 27.960938 -37.734375 27.785156 -38.585938 27.515625 -39.453125 C 27.242188 -40.316406 26.8125 -40.914062 26.21875 -41.25 C 24.488281 -42 23.175781 -41.847656 22.28125 -40.796875 C 21.394531 -39.742188 20.785156 -38.078125 20.453125 -35.796875 C 20.128906 -33.523438 19.96875 -30.929688 19.96875 -28.015625 L 19.96875 -27.609375 C 20.019531 -23.328125 20.664062 -20.1875 21.90625 -18.1875 C 23.15625 -16.1875 25.054688 -15.726562 27.609375 -16.8125 C 28.203125 -17.132812 28.617188 -17.710938 28.859375 -18.546875 C 29.109375 -19.390625 29.269531 -20.242188 29.34375 -21.109375 C 29.425781 -21.972656 29.46875 -22.59375 29.46875 -22.96875 C 29.519531 -23.78125 29.867188 -24.472656 30.515625 -25.046875 C 31.171875 -25.617188 31.929688 -25.847656 32.796875 -25.734375 L 44.328125 -25.40625 C 46.273438 -25.132812 47.273438 -24.160156 47.328125 -22.484375 C 47.441406 -20.648438 47.398438 -18.609375 47.203125 -16.359375 C 47.015625 -14.109375 46.488281 -11.875 45.625 -9.65625 C 44.757812 -7.4375 43.351562 -5.429688 41.40625 -3.640625 C 39.457031 -1.859375 36.722656 -0.484375 33.203125 0.484375 Z M 33.203125 0.484375 '
                  />
                </g>
                <g transform='translate(116.323381, 235.67957)'>
                  <path style={{ stroke: "none" }} d='M 2.84375 0 C 2.082031 0 1.429688 -0.351562 0.890625 -1.0625 C 0.296875 -1.757812 0 -2.488281 0 -3.25 L 0.15625 -55.046875 C 0.15625 -56.078125 0.425781 -56.863281 0.96875 -57.40625 C 1.570312 -58 2.25 -58.296875 3 -58.296875 L 17.53125 -58.21875 C 18.238281 -58.21875 18.941406 -57.914062 19.640625 -57.3125 C 20.242188 -56.613281 20.515625 -55.800781 20.453125 -54.875 L 20.140625 -34.09375 L 27.203125 -34.09375 L 27.28125 -55.203125 C 27.28125 -56.179688 27.550781 -56.941406 28.09375 -57.484375 C 28.6875 -58.078125 29.363281 -58.375 30.125 -58.375 L 44.65625 -58.296875 C 45.351562 -58.296875 46.054688 -58 46.765625 -57.40625 C 47.359375 -56.695312 47.628906 -55.910156 47.578125 -55.046875 L 46.6875 -4.140625 C 46.6875 -3.273438 46.414062 -2.546875 45.875 -1.953125 C 45.332031 -1.296875 44.628906 -0.96875 43.765625 -0.96875 L 29.953125 -0.96875 C 29.203125 -0.96875 28.554688 -1.320312 28.015625 -2.03125 C 27.410156 -2.726562 27.109375 -3.429688 27.109375 -4.140625 L 27.203125 -19.15625 L 19.8125 -19.15625 L 19.5625 -3.25 C 19.5625 -2.332031 19.289062 -1.570312 18.75 -0.96875 C 18.207031 -0.320312 17.503906 0 16.640625 0 Z M 2.84375 0 ' />
                </g>
                <g transform='translate(167.146631, 235.67957)'>
                  <path
                    style={{ stroke: "none" }}
                    d='M 16.078125 -0.078125 C 12.117188 -1.378906 9.003906 -3.015625 6.734375 -4.984375 C 4.460938 -6.960938 2.8125 -9.628906 1.78125 -12.984375 C 0.757812 -16.347656 0.164062 -20.679688 0 -25.984375 C 0.164062 -31.285156 0.773438 -36.03125 1.828125 -40.21875 C 2.878906 -44.414062 4.539062 -47.960938 6.8125 -50.859375 C 9.09375 -53.753906 12.179688 -55.851562 16.078125 -57.15625 C 18.078125 -57.800781 20.347656 -58.164062 22.890625 -58.25 C 25.429688 -58.332031 27.945312 -58.085938 30.4375 -57.515625 C 32.9375 -56.953125 35.101562 -56.046875 36.9375 -54.796875 C 39.644531 -52.960938 41.742188 -50.664062 43.234375 -47.90625 C 44.722656 -45.144531 45.773438 -41.988281 46.390625 -38.4375 C 47.015625 -34.894531 47.410156 -30.957031 47.578125 -26.625 C 47.578125 -21.695312 46.816406 -17.132812 45.296875 -12.9375 C 43.785156 -8.75 41 -5.273438 36.9375 -2.515625 C 35.101562 -1.273438 32.9375 -0.367188 30.4375 0.203125 C 27.945312 0.773438 25.429688 1.019531 22.890625 0.9375 C 20.347656 0.851562 18.078125 0.515625 16.078125 -0.078125 Z M 18.671875 -27.84375 C 18.722656 -24.488281 19.25 -21.945312 20.25 -20.21875 C 21.257812 -18.488281 22.425781 -17.582031 23.75 -17.5 C 25.070312 -17.414062 26.257812 -18.1875 27.3125 -19.8125 C 28.375 -21.4375 28.957031 -23.898438 29.0625 -27.203125 C 29.0625 -31.472656 28.535156 -34.742188 27.484375 -37.015625 C 26.429688 -39.296875 25.210938 -40.503906 23.828125 -40.640625 C 22.453125 -40.773438 21.25 -39.785156 20.21875 -37.671875 C 19.1875 -35.554688 18.671875 -32.28125 18.671875 -27.84375 Z M 18.671875 -27.84375 '
                  />
                </g>
                <g transform='translate(217.969881, 235.67957)'>
                  <path style={{ stroke: "none" }} d='M 2.921875 0 C 2.160156 0 1.507812 -0.3125 0.96875 -0.9375 C 0.425781 -1.5625 0.15625 -2.304688 0.15625 -3.171875 L 0 -54.484375 C 0 -55.234375 0.28125 -55.945312 0.84375 -56.625 C 1.414062 -57.300781 2.054688 -57.640625 2.765625 -57.640625 L 23.46875 -57.5625 C 27.46875 -57.5625 31.035156 -57.164062 34.171875 -56.375 C 37.316406 -55.59375 39.957031 -54.238281 42.09375 -52.3125 C 44.226562 -50.394531 45.734375 -47.734375 46.609375 -44.328125 C 46.984375 -43.023438 47.238281 -41.359375 47.375 -39.328125 C 47.507812 -37.304688 47.492188 -35.1875 47.328125 -32.96875 C 47.171875 -30.75 46.804688 -28.648438 46.234375 -26.671875 C 45.671875 -24.691406 44.875 -23.082031 43.84375 -21.84375 C 42 -19.5625 39.804688 -17.835938 37.265625 -16.671875 C 34.722656 -15.515625 31.9375 -14.734375 28.90625 -14.328125 C 25.875 -13.921875 22.679688 -13.664062 19.328125 -13.5625 L 19.5625 -3.328125 C 19.675781 -2.410156 19.40625 -1.640625 18.75 -1.015625 C 18.101562 -0.390625 17.425781 -0.078125 16.71875 -0.078125 Z M 18.75 -38.96875 L 19 -30.046875 L 23.140625 -30.046875 C 25.035156 -30.046875 26.492188 -30.488281 27.515625 -31.375 C 28.546875 -32.269531 29.085938 -33.3125 29.140625 -34.5 C 29.203125 -35.695312 28.660156 -36.753906 27.515625 -37.671875 C 26.972656 -38.109375 25.890625 -38.421875 24.265625 -38.609375 C 22.648438 -38.796875 20.8125 -38.914062 18.75 -38.96875 Z M 18.75 -38.96875 ' />
                </g>
                <g transform='translate(268.711929, 235.67957)'>
                  <path style={{ stroke: "none" }} d='M 2.921875 0 C 2.222656 0 1.570312 -0.296875 0.96875 -0.890625 C 0.425781 -1.429688 0.15625 -2.191406 0.15625 -3.171875 L 0 -54.5625 C 0 -55.3125 0.296875 -56.039062 0.890625 -56.75 C 1.484375 -57.394531 2.109375 -57.71875 2.765625 -57.71875 L 34.1875 -57.640625 C 35.101562 -57.640625 35.859375 -57.367188 36.453125 -56.828125 C 37.046875 -56.234375 37.34375 -55.554688 37.34375 -54.796875 L 37.34375 -42.703125 C 37.34375 -42.054688 37.019531 -41.4375 36.375 -40.84375 C 35.78125 -40.351562 35.050781 -40.050781 34.1875 -39.9375 L 18.828125 -39.21875 L 19 -35.15625 L 27.765625 -35.078125 C 28.472656 -35.078125 29.097656 -34.882812 29.640625 -34.5 C 30.171875 -34.125 30.410156 -33.613281 30.359375 -32.96875 L 29.953125 -24.28125 C 29.953125 -23.738281 29.679688 -23.273438 29.140625 -22.890625 C 28.660156 -22.566406 28.066406 -22.351562 27.359375 -22.25 L 19.328125 -21.84375 L 19.484375 -18.59375 L 34.1875 -17.9375 C 35.050781 -17.832031 35.78125 -17.535156 36.375 -17.046875 C 37.019531 -16.503906 37.34375 -15.882812 37.34375 -15.1875 L 37.34375 -3.078125 C 37.34375 -2.328125 37.046875 -1.65625 36.453125 -1.0625 C 35.859375 -0.519531 35.101562 -0.25 34.1875 -0.25 L 12.5 0 C 12.394531 0 12.257812 0 12.09375 0 C 11.9375 0 11.800781 -0.0234375 11.6875 -0.078125 Z M 2.921875 0 ' />
                </g>
              </g>
            </svg>
          </div>
        </div>
        {/* Navigation */}
        <nav className='px-6 pt-4 pb-2'>
          <button className='w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold mb-4 cursor-default'>
            <svg className='w-5 h-5 text-indigo-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6' />
            </svg>
            Dashboard
          </button>
        </nav>
        {/* Children List */}
        <div className='flex-1 px-6 pb-6 overflow-y-auto'>
          <h3 className='text-sm font-semibold text-gray-700 mb-4'>Your Children</h3>
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

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Header */}
        <header className='bg-[#f3f3f3] px-6 py-0 pt-10'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              {/* Mobile Menu Button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='sm' className='lg:hidden'>
                    <Menu className='w-5 h-5' />
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-64 p-0'>
                  <div className='flex flex-col h-full'>
                    {/* Logo */}
                    <div className='p-6 border-b border-gray-200'>
                      <div className='flex items-center justify-center'>
                        <svg xmlns='http://www.w3.org/2000/svg' width='120' height='40' viewBox='0 0 375 374.999991'>
                          <g style={{ fill: "#23326a", fillOpacity: 1 }}>
                            <g transform='translate(65.662515, 235.67957)'>
                              <path
                                style={{ stroke: "none" }}
                                d='M 33.203125 0.484375 C 29.898438 1.347656 26.515625 1.617188 23.046875 1.296875 C 19.585938 0.972656 16.34375 0.0390625 13.3125 -1.5 C 10.28125 -3.039062 7.765625 -5.140625 5.765625 -7.796875 C 4.035156 -10.171875 2.695312 -12.914062 1.75 -16.03125 C 0.800781 -19.144531 0.242188 -22.429688 0.078125 -25.890625 C -0.078125 -29.359375 0.0820312 -32.769531 0.5625 -36.125 C 1.488281 -41.757812 3.410156 -46.523438 6.328125 -50.421875 C 9.253906 -54.316406 12.910156 -57.019531 17.296875 -58.53125 C 21.679688 -60.050781 26.523438 -60.050781 31.828125 -58.53125 C 35.347656 -57.613281 38.09375 -56.257812 40.0625 -54.46875 C 42.039062 -52.6875 43.460938 -50.6875 44.328125 -48.46875 C 45.191406 -46.25 45.703125 -44.003906 45.859375 -41.734375 C 46.023438 -39.460938 46.054688 -37.378906 45.953125 -35.484375 C 45.898438 -33.859375 44.925781 -32.910156 43.03125 -32.640625 L 31.5 -32.3125 C 30.632812 -32.207031 29.875 -32.4375 29.21875 -33 C 28.570312 -33.570312 28.222656 -34.289062 28.171875 -35.15625 C 28.171875 -35.476562 28.128906 -36.054688 28.046875 -36.890625 C 27.960938 -37.734375 27.785156 -38.585938 27.515625 -39.453125 C 27.242188 -40.316406 26.8125 -40.914062 26.21875 -41.25 C 24.488281 -42 23.175781 -41.847656 22.28125 -40.796875 C 21.394531 -39.742188 20.785156 -38.078125 20.453125 -35.796875 C 20.128906 -33.523438 19.96875 -30.929688 19.96875 -28.015625 L 19.96875 -27.609375 C 20.019531 -23.328125 20.664062 -20.1875 21.90625 -18.1875 C 23.15625 -16.1875 25.054688 -15.726562 27.609375 -16.8125 C 28.203125 -17.132812 28.617188 -17.710938 28.859375 -18.546875 C 29.109375 -19.390625 29.269531 -20.242188 29.34375 -21.109375 C 29.425781 -21.972656 29.46875 -22.59375 29.46875 -22.96875 C 29.519531 -23.78125 29.867188 -24.472656 30.515625 -25.046875 C 31.171875 -25.617188 31.929688 -25.847656 32.796875 -25.734375 L 44.328125 -25.40625 C 46.273438 -25.132812 47.273438 -24.160156 47.328125 -22.484375 C 47.441406 -20.648438 47.398438 -18.609375 47.203125 -16.359375 C 47.015625 -14.109375 46.488281 -11.875 45.625 -9.65625 C 44.757812 -7.4375 43.351562 -5.429688 41.40625 -3.640625 C 39.457031 -1.859375 36.722656 -0.484375 33.203125 0.484375 Z M 33.203125 0.484375 '
                              />
                            </g>
                          </g>
                        </svg>
                      </div>
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

        {/* Main Content Area */}
        <main className='flex-1 overflow-y-auto p-6 space-y-6'>
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

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
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

          {/* Category Chart + Tips + Tasks Table Row */}
          <div className='flex flex-row items-start'>
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
              <div className='flex-1 ml-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-4'>
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
