import { NavLink } from "react-router-dom";
import { Home, User, Settings, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  childrenList: { name: string; url: string; icon: any }[];
  onChildSelect: (id: string) => void;
  variant?: "inset";
}

export function AppSidebar({ childrenList, onChildSelect }: SidebarProps) {
  return (
    <aside className='bg-gradient-to-br from-[#f9f6f1] to-[#ffffff] border-r border-gray-200 w-60 min-h-screen p-6 shadow-sm'>
      <div className='mb-8'>
        <h2 className='text-lg font-bold text-[#23326a] mb-2'>Navigation</h2>
        <nav className='space-y-2'>
          <NavLink to='/parent/dashboard' className={({ isActive }) => cn("block px-3 py-2 rounded-lg font-medium text-sm", isActive ? "bg-[#fbbdcb]/40 text-[#23326a]" : "text-gray-700 hover:bg-[#fbbdcb]/20")}>
            <Home className='inline mr-2 w-4 h-4' />
            Dashboard
          </NavLink>
          <NavLink to='/parent/settings' className={({ isActive }) => cn("block px-3 py-2 rounded-lg font-medium text-sm", isActive ? "bg-[#fbbdcb]/40 text-[#23326a]" : "text-gray-700 hover:bg-[#fbbdcb]/20")}>
            <Settings className='inline mr-2 w-4 h-4' />
            Settings
          </NavLink>
        </nav>
      </div>

      <div>
        <h3 className='text-sm font-semibold text-[#23326a] mb-2'>Your Kids</h3>
        <ul className='space-y-2'>
          {childrenList.map(child => (
            <li key={child.url}>
              <button onClick={() => onChildSelect(child.url)} className='w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-[#8cd4f3]/20 transition'>
                <child.icon className='mr-2 w-4 h-4' />
                {child.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
