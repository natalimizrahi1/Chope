import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { getTasks } from "../../lib/api";
import { Task } from "../../lib/types";
import { useToast } from "../ui/use-toast";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  taskId: string;
  read: boolean;
}

interface NotificationsProps {
  childId: string;
  token: string;
}

const Notifications = ({ childId, token }: NotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [showBadge, setShowBadge] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem(`notifications_${childId}`);
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Convert timestamp strings back to Date objects
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(notificationsWithDates);
      } catch (error) {
        console.error("Failed to parse notifications from localStorage:", error);
      }
    }

    const savedLastCheck = localStorage.getItem(`lastCheckTime_${childId}`);
    if (savedLastCheck) {
      setLastCheckTime(new Date(savedLastCheck));
    }

    // Load already notified tasks to avoid duplicates
    const savedNotifiedTasks = localStorage.getItem(`notifiedTasks_${childId}`);
    if (savedNotifiedTasks) {
      try {
        const notifiedTasks = JSON.parse(savedNotifiedTasks);
      } catch (error) {
        console.error("Failed to parse notified tasks:", error);
      }
    }
  }, [childId]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`notifications_${childId}`, JSON.stringify(notifications));
  }, [notifications, childId]);

  // Check for new tasks
  const checkForNewTasks = async () => {
    try {
      setLoading(true);

      const currentTasks = await getTasks(token, childId);
      const lastCheck = lastCheckTime || new Date(0);

      // Get already notified tasks
      const savedNotifiedTasks = localStorage.getItem(`notifiedTasks_${childId}`);
      const notifiedTasks = savedNotifiedTasks ? JSON.parse(savedNotifiedTasks) : [];

      // Find tasks created after last check
      const newTasks = currentTasks.filter((task: Task) => {
        const taskDate = new Date(); // Use current time since Task doesn't have createdAt/updatedAt
        const isNewTask = !task.completed; // Simplified logic - show all incomplete tasks as new
        const alreadyNotified = notifiedTasks.includes(task._id);

        return isNewTask && !alreadyNotified;
      });

      if (newTasks.length > 0) {
        // Create notifications for new tasks
        const newNotifications = newTasks.map((task: Task) => ({
          id: `notification_${task._id}_${Date.now()}`,
          title: `New Task: ${task.title}`,
          description: task.description,
          timestamp: new Date(),
          taskId: task._id,
          read: false,
        }));

        setNotifications(prev => [...newNotifications, ...prev]);
        setShowBadge(true); // Show badge when new notifications arrive

        // Add task IDs to notified tasks list
        const newNotifiedTasks = [...notifiedTasks, ...newTasks.map((task: Task) => task._id)];
        localStorage.setItem(`notifiedTasks_${childId}`, JSON.stringify(newNotifiedTasks));

        // Show toast notifications
        newTasks.forEach((task: Task) => {
          toast({
            title: `New Task! 🎉`,
            description: `${task.title} - ${task.description}`,
            duration: 5000,
          });
        });

        // Dispatch event to update other components (like Recent Incomplete Tasks)
        window.dispatchEvent(
          new CustomEvent("newTasksReceived", {
            detail: { tasks: newTasks, childId },
          })
        );
      }

      // Update last check time
      const now = new Date();
      setLastCheckTime(now);
      localStorage.setItem(`lastCheckTime_${childId}`, now.toISOString());
    } catch (error) {
      console.error("❌ Error checking for new tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check for new tasks every 3 seconds
  useEffect(() => {
    // Initial check
    checkForNewTasks();

    // Set up interval
    const interval = setInterval(checkForNewTasks, 3000);

    // Listen for task creation events from parent dashboard
    const handleTaskCreated = (event: CustomEvent) => {
      const { task, childId: eventChildId } = event.detail;

      if (eventChildId === childId) {
        checkForNewTasks();
      }
    };

    window.addEventListener("taskCreated", handleTaskCreated as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener("taskCreated", handleTaskCreated as EventListener);
    };
  }, [childId, token, lastCheckTime]);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
  };

  // Format time
  const formatTime = (date: Date) => {
    try {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "unknown";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className='relative'>
      {/* Notification Bell Button */}
      <Button
        variant='ghost'
        size='icon'
        className='relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg'
        onClick={() => {
          // If panel is open, close it and mark notifications as read
          if (isOpen) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          }

          setIsOpen(!isOpen);
          setShowBadge(false);
        }}
      >
        <Bell className='w-5 h-5' />
        {showBadge && unreadCount > 0 && <Badge className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-0'>{unreadCount > 9 ? "9+" : unreadCount}</Badge>}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className='absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden'>
          <div className='p-4 bg-gradient-to-r from-purple-50 to-blue-50'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-lg font-semibold text-gray-900'>Notifications</h3>
            </div>

            {notifications.length === 0 ? (
              <div className='text-center text-gray-500'>
                <Bell className='w-8 h-8 mx-auto mb-2 opacity-50' />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className='max-h-64 overflow-y-auto'>
                <div className='space-y-2'>
                  {notifications.map(notification => (
                    <div key={notification.id} className={`p-3 rounded-lg border transition-all cursor-pointer hover:bg-gray-50 ${!notification.read ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`} onClick={() => markAsRead(notification.id)}>
                      <div className='flex items-start gap-3'>
                        {/* Icon */}
                        <div className='w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center flex-shrink-0'>
                          <span className='text-white text-sm'>📝</span>
                        </div>

                        {/* Content */}
                        <div className='flex-1 min-w-0'>
                          <h4 className='font-medium text-sm text-gray-900 mb-1 truncate'>{notification.title}</h4>
                          <p className='text-xs text-gray-600 mb-2 line-clamp-2'>{notification.description}</p>

                          {/* Time and status */}
                          <div className='flex items-center justify-between'>
                            <span className='text-xs text-gray-500'>{formatTime(notification.timestamp)}</span>
                            {!notification.read && <div className='w-2 h-2 bg-blue-500 rounded-full'></div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
