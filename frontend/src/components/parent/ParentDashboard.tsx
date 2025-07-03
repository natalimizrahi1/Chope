import { useEffect, useState } from "react";
import { getChildren, getTasks } from "../../lib/api";
import type { Animal } from "../../lib/types";
import { useToast } from "../ui/use-toast";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "../ui/app-sidebar";
import { ChartPieInteractive } from "../ui/chart-pie-interactive";
import { DataTable } from "../ui/data-table";
import { SectionCards } from "../ui/section-cards";
import { SiteHeader } from "../ui/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IconUsers } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

import data from "../../app/dashboard/data.json";

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

  // Check for pending approval tasks and update chart/coins data
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const checkPendingTasks = async () => {
      try {
        if (children.length === 0) return;
        const pendingTasksPromises = children.map(async child => {
          const tasks = await getTasks(token, child._id);
          const pendingCount = tasks.filter((task: any) => task.completed && !task.approved).length;
          const approvedCount = tasks.filter((task: any) => task.completed && task.approved).length;
          const totalTasks = tasks.length;
          return {
            childId: child._id,
            childName: child.name,
            pendingCount,
            approvedCount,
            totalTasks,
            coins: child.coins,
          };
        });
        const pendingResults = await Promise.all(pendingTasksPromises);
        const totalPending = pendingResults.reduce((sum, result) => sum + result.pendingCount, 0);
        const totalApproved = pendingResults.reduce((sum, result) => sum + result.approvedCount, 0);
        const totalTasksSent = pendingResults.reduce((sum, result) => sum + result.totalTasks, 0);
        const totalChildrenCoins = pendingResults.reduce((sum, result) => sum + result.coins, 0);
        setPendingTasksCount(totalPending);
        // Update chart data only on initial load
        const isInitialLoad = chartData[0].value === 0 && chartData[1].value === 0 && chartData[2].value === 0;
        if (isInitialLoad) {
          setChartData([
            { name: "Tasks Sent", value: totalTasksSent, color: "#3B82F6" },
            { name: "Pending Approval", value: totalPending, color: "#FFBB28" },
            { name: "Approved Tasks", value: totalApproved, color: "#00C49F" },
          ]);
          setCoinsData([
            { name: "Coins Given by Parent", value: totalApproved * 10, color: "#FFD700" },
            { name: "Total Children Coins", value: totalChildrenCoins, color: "#4ECDC4" },
          ]);
        }
      } catch (error) {
        console.error("Failed to check pending tasks:", error);
      }
    };
    if (children.length > 0) {
      checkPendingTasks();
    }
  }, [children]);

  // Build childrenList for sidebar
  const childrenList = children.map(child => ({
    name: child.name,
    url: child._id,
    icon: IconUsers,
  }));

  // Handler for navigating to child detail page
  const handleChildSelect = (id: string) => {
    navigate(`/parent/child/${id}`);
  };

  console.log("[ParentDashboard] render, children:", children);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }>
      <AppSidebar variant='inset' childrenList={childrenList} onChildSelect={handleChildSelect} />
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
              {/* Notifications for Parent */}
              {/* REMOVED: Notifications panel for parent */}
              {/* Pending Tasks Notification */}
              {pendingTasksCount > 0 && (
                <div className='px-4 lg:px-6'>
                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='bg-yellow-500 text-white p-2 rounded-full'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                      </div>
                      <div>
                        <h3 className='font-semibold text-yellow-800'>Tasks Pending Approval</h3>
                        <p className='text-sm text-yellow-600'>You have {pendingTasksCount} task(s) waiting for your approval</p>
                      </div>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        // Navigate to the first child with pending tasks
                        const firstChild = children[0];
                        if (firstChild) {
                          navigate(`/parent/child/${firstChild._id}`);
                        }
                      }}>
                      Review Tasks
                    </Button>
                  </div>
                </div>
              )}
              <SectionCards />
              <div className='px-4 lg:px-6'>
                <ChartPieInteractive data={chartData} rightData={coinsData} title='Task Distribution' description="Overview of all children's task status" rightTitle='Coins Overview' rightDescription="Coins given by parent vs children's total coins" />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
