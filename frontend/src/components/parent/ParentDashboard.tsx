import { useEffect, useState } from "react";
import { getChildren, getTasks, approveTask } from "../../lib/api";
import type { Animal } from "../../lib/types";
import { useToast } from "../ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ChartPieInteractive } from "../ui/chart-pie-interactive";
import { DataTable } from "../ui/data-table";
import { SectionCards } from "../ui/section-cards";
import { Button } from "@/components/ui/button";
import { Copy, LogOut } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { toast } = useToast();

  // Get parent id robustly
  const userObj = JSON.parse(localStorage.getItem("user") || "{}") || {};
  console.log("user from localStorage:", userObj);
  const parentId = userObj._id || userObj.id || "N/A";

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

  return (
    <div className='px-6 py-6 space-y-6 bg-gradient-to-br from-[#faf8f2] via-[#fcf8f5] to-[#ffffff] min-h-screen'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-[#22223b]'>Dashboard</h2>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm'>
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

          {/* Children dropdown */}
          <Select onValueChange={handleChildSelect}>
            <SelectTrigger className='w-48 bg-white rounded-lg shadow-sm'>
              <SelectValue placeholder='Select Child' />
            </SelectTrigger>
            <SelectContent>
              {children.map(child => (
                <SelectItem key={child._id} value={child._id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant='outline'
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login/parent");
            }}
            className='flex items-center gap-2'>
            <LogOut className='w-4 h-4' />
            Logout
          </Button>
        </div>
      </div>

      {pendingTasksCount > 0 && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex justify-between items-center'>
          <div className='text-yellow-800 font-medium'>You have {pendingTasksCount} task(s) pending approval.</div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              const firstChild = children[0];
              if (firstChild) {
                navigate(`/parent/child/${firstChild._id}`);
              }
            }}>
            Review Now
          </Button>
        </div>
      )}

      <SectionCards childrenCount={children.length} totalTasks={allTasks.length} pendingTasks={pendingTasksCount} />

      <ChartPieInteractive data={chartData} rightData={coinsData} title='Task Distribution' description="Overview of children's task statuses" rightTitle='Coins Overview' rightDescription='Coins given vs coins held' />

      {taskTableData.length > 0 && <DataTable data={taskTableData} onApproveTask={handleApproveTask} onReloadTasks={() => window.location.reload()} onViewDetails={handleViewDetails} />}
    </div>
  );
}
