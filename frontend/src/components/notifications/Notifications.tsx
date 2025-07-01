import React, { useState, useEffect } from "react";
import { Bell, X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { getTasks } from "../../lib/api";
import { Task } from "../../lib/types";
import { useToast } from "../ui/use-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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

    // Listen for task creation events from parent dashboard
    const handleTaskCreated = (event: CustomEvent) => {
      const { task, childId: eventChildId } = event.detail;

      if (eventChildId === childId) {
        checkForNewTasks();
      }
    };

    window.addEventListener("taskCreated", handleTaskCreated as EventListener);

    return () => {
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
      <motion.button
        className='relative bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg hover:bg-white transition-colors'
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          // If panel is open, close it and mark notifications as read
          if (isOpen) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          }

          setIsOpen(!isOpen);
          setShowBadge(false);
        }}>
        <Bell className='w-5 h-5 text-gray-600' />
        {showBadge && unreadCount > 0 && <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }} className='absolute right-0 top-14 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 max-h-[500px] overflow-hidden' style={{ zIndex: 999999 }}>
            <div className='p-4'>
              {/* Header */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <div className='bg-gradient-to-br from-[#87d4ee] to-[#4ec3f7] rounded-xl p-2'>
                    <Bell className='w-4 h-4 text-white' />
                  </div>
                  <h3 className='text-lg font-bold text-gray-800'>Notifications</h3>
                </div>
                <div className='flex items-center gap-2'>
                  {unreadCount > 0 && <div className='bg-gradient-to-br from-[#f9a8d4] to-[#ffbacc] text-white text-xs px-2 py-1 rounded-full font-bold'>{unreadCount} new</div>}
                  <span className='text-sm text-gray-500'>{notifications.length} total</span>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className='text-center py-8'>
                  <motion.div className='bg-gradient-to-br from-[#ffd986] to-[#ffbacc] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4' animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                    <span className='text-2xl'>🔔</span>
                  </motion.div>
                  <h3 className='text-lg font-bold text-gray-800 mb-2'>All caught up! 🎉</h3>
                  <p className='text-gray-600 text-sm'>No new notifications</p>
                  <p className='text-gray-500 text-xs mt-1'>You're doing great!</p>
                </div>
              ) : (
                <div className='max-h-64 overflow-y-auto space-y-3 pr-2'>
                  {notifications.map((notification, index) => (
                    <motion.div key={notification.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={`relative overflow-hidden rounded-xl border transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] ${!notification.read ? "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-blue-200 shadow-md" : "bg-white border-gray-200 hover:bg-gray-50"}`} onClick={() => markAsRead(notification.id)}>
                      {/* Unread indicator line */}
                      {!notification.read && <div className='absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#87d4ee] to-[#4ec3f7]'></div>}
                      <div className='flex items-start gap-3 p-4'>
                        {/* Icon */}
                        <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-lg mt-1 ${!notification.read ? "bg-gradient-to-br from-[#87d4ee] to-[#4ec3f7]" : "bg-gray-100"}`}>
                          <span className='text-base'>📝</span>
                        </div>
                        {/* Text block */}
                        <div className='flex-1'>
                          <div className='flex items-baseline gap-2'>
                            <span className='font-bold text-sm text-gray-800'>{notification.title}</span>
                            <span className='text-xs text-gray-500 font-medium'>{formatTime(notification.timestamp)}</span>
                          </div>
                          <div className='mt-1 ml-0 pl-0'>
                            <span className='text-sm text-gray-600'>{notification.description}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Footer */}
              {notifications.length > 0 && (
                <div className='mt-4 pt-3 border-t border-gray-200'>
                  <div className='flex items-center justify-between text-xs text-gray-500'>
                    <span>Click to mark as read</span>
                    <span>{unreadCount} unread</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
