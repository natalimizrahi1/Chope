import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [parentId, setParentId] = useState("");
  const [isParent, setIsParent] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "parent") {
      setIsParent(true);
      setParentId(user.id);
    }
  }, []);

  const copyParentId = () => {
    navigator.clipboard.writeText(parentId);
    toast({
      title: "Copied!",
      description: "Parent ID has been copied to clipboard.",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login/parent");
  };

  return (
    <header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger />
        <Separator orientation='vertical' className='mx-2 data-[orientation=vertical]:h-4' />
        <h1 className='text-base font-medium'>Dashboard</h1>
        <div className='ml-auto flex items-center gap-2'>
          {isParent && (
            <>
              <div className='text-sm text-muted-foreground'>Parent ID: {parentId}</div>
              <Button variant='ghost' size='icon' onClick={copyParentId}>
                <Copy className='h-4 w-4' />
              </Button>
              <Button variant='ghost' size='icon' onClick={handleLogout} title='Logout'>
                <LogOut className='h-4 w-4' />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
