import * as React from "react";
import { IconCamera, IconChartBar, IconDashboard, IconDatabase, IconFileAi, IconFileDescription, IconFileWord, IconFolder, IconHelp, IconInnerShadowTop, IconListDetails, IconReport, IconSearch, IconSettings, IconUsers } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import { NavDocuments } from "@/components/ui/nav-documents";
import { NavMain } from "@/components/ui/nav-main";
import { NavSecondary } from "@/components/ui/nav-secondary";
import { NavUser } from "@/components/ui/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Amit",
    email: "a@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/parent/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Lifecycle",
      url: "#",
      icon: IconListDetails,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      title: "Team",
      url: "#",
      icon: IconUsers,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
};

export function AppSidebar({
  childrenList,
  onChildSelect,
  ...props
}: {
  childrenList: { name: string; url: string; icon: any }[];
  onChildSelect?: (id: string) => void;
} & React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();

  const handleMainNavClick = (url: string) => {
    if (url !== "#") {
      navigate(url);
    }
  };

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='data-[slot=sidebar-menu-button]:!p-1.5'>
              <a
                href='#'
                onClick={e => {
                  e.preventDefault();
                  navigate("/parent/dashboard");
                }}
              >
                <IconInnerShadowTop className='!size-5' />
                <span className='text-base font-semibold'>Chope</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} onItemClick={handleMainNavClick} />
        <NavDocuments items={childrenList} onChildSelect={onChildSelect} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
