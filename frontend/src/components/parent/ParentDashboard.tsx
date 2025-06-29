import { useEffect, useState } from "react";
import { getChildren } from "../../lib/api";
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

  // Map children to the format required by AppSidebar/NavDocuments
  const childrenList = children.map(child => ({
    name: child.name,
    url: child._id, // Use _id for navigation
    icon: IconUsers,
  }));

  // Handler for navigating to child detail page
  const handleChildSelect = (id: string) => {
    navigate(`/parent/child/${id}`);
  };

  return (
    <>
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

      {/* /////////////// */}
      <div className='flex min-h-screen'>
        {/* Sidebar */}
        <div className='hidden lg:flex w-64 flex-col border-r bg-muted/40'>
          <div className='flex h-14 items-center border-b px-4'>
            <h2 className='text-lg font-semibold'>Children</h2>
          </div>
          <div className='flex-1 overflow-auto py-2'>
            <nav className='grid items-start px-2 text-sm font-medium'>
              {children.map(child => (
                <button key={child._id} onClick={() => navigate(`/parent/child/${child._id}`)} className='flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted'>
                  {child.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className='flex-1 overflow-auto'>
          <div className='p-6'>
            <div className='flex h-[calc(100vh-3.5rem)] items-center justify-center'>
              <div className='text-center'>
                <p className='text-muted-foreground mb-4'>Welcome to your Parent Dashboard</p>
                <p className='text-sm text-muted-foreground'>Click on a child from the sidebar to view their details</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
