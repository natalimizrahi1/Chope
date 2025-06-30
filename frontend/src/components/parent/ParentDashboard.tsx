import { useEffect, useState } from "react";
import { getChildren, getTasks } from "../../lib/api";
import type { Animal } from "../../lib/types";
import { useToast } from "../ui/use-toast";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "../ui/app-sidebar";
import { ChartAreaInteractive } from "../ui/chart-area-interactive";
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
  const [token] = useState(localStorage.getItem("token") || "");
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
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
      })
      .catch(error => {
        console.error("Failed to load children:", error);
        toast({
          title: "Error",
          description: "Failed to load children data. Please try again.",
          variant: "destructive",
        });
      });

    // Listen for visibility changes to refresh when returning to page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("ParentDashboard became visible, refreshing children...");
        getChildren(token)
          .then(childrenData => {
            setChildren(childrenData);
          })
          .catch(error => {
            console.error("Failed to refresh children:", error);
          });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set up interval to refresh every 15 seconds
    const interval = setInterval(() => {
      getChildren(token)
        .then(childrenData => {
          setChildren(childrenData);
          // Check for pending tasks after loading children
          checkPendingTasks();
        })
        .catch(error => {
          console.error("Failed to refresh children:", error);
        });
    }, 15000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [token, navigate, toast]);

  // Map children to the format required by AppSidebar/NavDocuments
  const childrenList = children.map(child => ({
    name: child.name,
    url: child._id, // Use _id for navigation
    icon: IconUsers,
  }));

  // Check for pending approval tasks
  const checkPendingTasks = async () => {
    try {
      const pendingTasksPromises = children.map(async child => {
        const tasks = await getTasks(token, child._id);
        const pendingCount = tasks.filter((task: any) => task.completed && !task.approved).length;
        return { childId: child._id, childName: child.name, pendingCount };
      });

      const pendingResults = await Promise.all(pendingTasksPromises);
      const totalPending = pendingResults.reduce((sum, result) => sum + result.pendingCount, 0);

      if (totalPending > 0) {
        console.log(`Found ${totalPending} pending tasks across all children`);
        // You can add a toast notification here if you want
      }

      setPendingTasksCount(totalPending);
      return pendingResults;
    } catch (error) {
      console.error("Failed to check pending tasks:", error);
      return [];
    }
  };

  // Handler for navigating to child detail page
  const handleChildSelect = (id: string) => {
    navigate(`/parent/child/${id}`);
  };

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
                      }}
                    >
                      Review Tasks
                    </Button>
                  </div>
                </div>
              )}
              <SectionCards />
              <div className='px-4 lg:px-6'>
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
