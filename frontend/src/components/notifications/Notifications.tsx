import { useState, useEffect, useCallback } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { getTasks, getChildCoins } from "../../lib/api";
import { Task } from "../../lib/types";
import { useToast } from "../ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  taskId: string;
  read: boolean;
  type: "new_task" | "task_approved" | "task_completed" | "task_pending_approval";
  reward?: number;
  childName?: string;
}

interface NotificationsProps {
  childId: string;
  token: string;
  userRole?: "child" | "parent";
}

const Notifications = ({ childId, token, userRole }: NotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { toast } = useToast();

  // Check if notifications were cleared
  const areNotificationsCleared = useCallback(() => {
    const savedNotifications = localStorage.getItem(`notifications_${childId}`);
    const isCleared = !savedNotifications;
    console.log("🔍 areNotificationsCleared check:", { childId, savedNotifications, isCleared });
    return isCleared;
  }, [childId]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    console.log("📱 Notifications component mounting with childId:", childId);
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
        console.log("📱 Loaded existing notifications:", notificationsWithDates.length);
      } catch (error) {
        console.error("Failed to parse notifications from localStorage:", error);
      }
    } else {
      console.log("📱 No existing notifications found");
    }

    // Load already notified tasks to avoid duplicates
    const savedNotifiedTasks = localStorage.getItem(`notifiedTasks_${childId}`);
    if (savedNotifiedTasks) {
      try {
        const notifiedTasks = JSON.parse(savedNotifiedTasks);
        console.log("📱 Loaded notified tasks:", notifiedTasks);
      } catch (error) {
        console.error("Failed to parse notified tasks:", error);
      }
    } else {
      console.log("📱 No notified tasks found");
    }
  }, [childId]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`notifications_${childId}`, JSON.stringify(notifications));
  }, [notifications, childId]);

  // Add new notification
  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp">) => {
      console.log("🔔 addNotification called with:", notification);

      // Check if notifications were cleared
      if (areNotificationsCleared()) {
        console.log("📝 Notifications were cleared, ignoring new notification");
        return;
      }

      const newNotification: Notification = {
        ...notification,
        id: `notification_${Date.now()}_${Math.random()}`,
        timestamp: new Date(),
      };

      console.log("🔔 Creating new notification:", newNotification);

      setNotifications(prev => {
        const updated = [newNotification, ...prev];
        console.log("🔔 Updated notifications array:", updated);
        return updated;
      });
      setShowBadge(true);

      // Show toast notification only for truly new notifications (not on refresh)
      // Check if this notification already exists to avoid duplicate toasts
      const existingNotifications = JSON.parse(localStorage.getItem(`notifications_${childId}`) || "[]");
      const isDuplicate = existingNotifications.some((n: any) => n.taskId === notification.taskId && n.type === notification.type && n.title === notification.title);

      if (!isDuplicate) {
        console.log("🔔 Showing toast notification");
        toast({
          title: notification.title,
          description: notification.description,
          duration: 5000,
        });
      } else {
        console.log("🔔 Skipping toast - duplicate notification");
      }
    },
    [toast, childId, areNotificationsCleared]
  );

  // Check for new tasks
  const checkForNewTasks = useCallback(async () => {
    try {
      const currentTasks = await getTasks(token, childId);

      // Check if notifications were cleared
      if (areNotificationsCleared()) {
        console.log("📝 Notifications were cleared, skipping new task notifications");
        return;
      }

      // Get already notified tasks
      const savedNotifiedTasks = localStorage.getItem(`notifiedTasks_${childId}`);
      const notifiedTasks = savedNotifiedTasks ? JSON.parse(savedNotifiedTasks) : [];

      // Get the timestamp when notifications were last cleared
      const clearedAt = localStorage.getItem(`notificationsClearedAt_${childId}`);
      const clearedTimestamp = clearedAt ? parseInt(clearedAt) : 0;

      // Find new tasks (tasks that are not completed and not approved)
      const newTasks = currentTasks.filter((task: Task) => {
        const isNew = !task.completed && !task.approved;
        const alreadyNotified = notifiedTasks.includes(task._id);

        // If notifications were cleared, only show notifications for tasks that weren't already notified
        if (clearedTimestamp > 0) {
          console.log("📝 Notifications were cleared, only showing new un-notified tasks");
          return isNew && !alreadyNotified;
        }

        return isNew && !alreadyNotified;
      });

      if (newTasks.length > 0) {
        console.log(`🎉 Found ${newTasks.length} new tasks after clear`);
        // Create notifications for new tasks
        newTasks.forEach((task: Task) => {
          addNotification({
            title: `New Task! 🎉`,
            description: `${task.title} - ${task.description}`,
            taskId: task._id,
            read: false,
            type: "new_task",
            reward: task.reward,
          });
        });

        // Add task IDs to notified tasks list
        const newNotifiedTasks = [...notifiedTasks, ...newTasks.map((task: Task) => task._id)];
        localStorage.setItem(`notifiedTasks_${childId}`, JSON.stringify(newNotifiedTasks));
      }
    } catch (error) {
      console.error("❌ Error checking for new tasks:", error);
    }
  }, [token, childId, addNotification, areNotificationsCleared]);

  // האזנה לאירוע newTaskCreated בלבד
  useEffect(() => {
    const handleNewTaskCreated = (event: CustomEvent) => {
      console.log("🔔 newTaskCreated event received:", event.detail);
      const { task, childId: eventChildId } = event.detail;
      if (eventChildId === childId) {
        console.log("🔔 Event matches current childId, creating notification");
        // Check if notifications were cleared
        if (areNotificationsCleared()) {
          console.log("📝 Notifications were cleared, ignoring newTaskCreated event");
          return;
        }

        // בדוק אם כבר קיימת התראה על המשימה הזו
        const notifiedTasks = JSON.parse(localStorage.getItem(`notifiedTasks_${childId}`) || "[]");
        if (!notifiedTasks.includes(task._id)) {
          console.log("🔔 Creating new task notification for task:", task._id);
          addNotification({
            title: `New Task! 🎉`,
            description: `${task.title} - ${task.description}`,
            taskId: task._id,
            read: false,
            type: "new_task",
            reward: task.reward,
          });
          // update notifiedTasks
          localStorage.setItem(`notifiedTasks_${childId}`, JSON.stringify([...notifiedTasks, task._id]));
        } else {
          console.log("🔔 Task already notified, skipping:", task._id);
        }
      } else {
        console.log("🔔 Event childId doesn't match current childId:", { eventChildId, currentChildId: childId });
      }
    };
    window.addEventListener("newTaskCreated", handleNewTaskCreated as EventListener);
    return () => window.removeEventListener("newTaskCreated", handleNewTaskCreated as EventListener);
  }, [childId, addNotification, areNotificationsCleared]);

  // Check for approved tasks
  const checkForApprovedTasks = useCallback(async () => {
    try {
      const currentTasks = await getTasks(token, childId);
      const coinsData = await getChildCoins(token, childId);

      // Check if notifications were cleared
      if (areNotificationsCleared()) {
        console.log("📝 Notifications were cleared, skipping approved task notifications");
        return;
      }

      // Get already notified approved tasks
      const savedNotifiedApprovedTasks = localStorage.getItem(`notifiedApprovedTasks_${childId}`);
      const notifiedApprovedTasks = savedNotifiedApprovedTasks ? JSON.parse(savedNotifiedApprovedTasks) : [];

      // Get the timestamp when notifications were last cleared
      const clearedAt = localStorage.getItem(`notificationsClearedAt_${childId}`);
      const clearedTimestamp = clearedAt ? parseInt(clearedAt) : 0;

      // Find newly approved tasks
      const newlyApprovedTasks = currentTasks.filter((task: Task) => {
        const isApproved = task.completed && task.approved;
        const alreadyNotified = notifiedApprovedTasks.includes(task._id);

        // If notifications were cleared, only consider tasks approved after the clear
        if (clearedTimestamp > 0 && task.approvedAt) {
          const taskApprovedAt = new Date(task.approvedAt).getTime();
          const isAfterClear = taskApprovedAt > clearedTimestamp;
          return isApproved && !alreadyNotified && isAfterClear;
        }

        return isApproved && !alreadyNotified;
      });

      if (newlyApprovedTasks.length > 0) {
        console.log(`🎉 Found ${newlyApprovedTasks.length} newly approved tasks after clear`);
        // Create notifications for approved tasks
        newlyApprovedTasks.forEach((task: Task) => {
          addNotification({
            title: `Task Approved! 🎉`,
            description: `${task.title} - You earned ${task.reward} coins! Total: ${coinsData.coins} coins`,
            taskId: task._id,
            read: false,
            type: "task_approved",
            reward: task.reward,
          });
        });

        // Add task IDs to notified approved tasks list
        const newNotifiedApprovedTasks = [...notifiedApprovedTasks, ...newlyApprovedTasks.map((task: Task) => task._id)];
        localStorage.setItem(`notifiedApprovedTasks_${childId}`, JSON.stringify(newNotifiedApprovedTasks));
      }
    } catch (error) {
      console.error("❌ Error checking for approved tasks:", error);
    }
  }, [token, childId, addNotification, areNotificationsCleared]);

  // Check for pending approval tasks (for parent)
  const checkForPendingApprovalTasks = useCallback(async () => {
    if (userRole !== "parent") return;

    try {
      const currentTasks = await getTasks(token, childId);

      // Check if notifications were cleared
      if (areNotificationsCleared()) {
        console.log("📝 Notifications were cleared, skipping pending approval notifications");
        return;
      }

      // Get already notified pending tasks
      const savedNotifiedPendingTasks = localStorage.getItem(`notifiedPendingTasks_${childId}`);
      const notifiedPendingTasks = savedNotifiedPendingTasks ? JSON.parse(savedNotifiedPendingTasks) : [];

      // Get the timestamp when notifications were last cleared
      const clearedAt = localStorage.getItem(`notificationsClearedAt_${childId}`);
      const clearedTimestamp = clearedAt ? parseInt(clearedAt) : 0;

      // Find newly pending approval tasks
      const newlyPendingTasks = currentTasks.filter((task: Task) => {
        const isPending = task.completed && !task.approved;
        const alreadyNotified = notifiedPendingTasks.includes(task._id);

        // If notifications were cleared, only consider tasks completed after the clear
        if (clearedTimestamp > 0 && task.completedAt) {
          const taskCompletedAt = new Date(task.completedAt).getTime();
          const isAfterClear = taskCompletedAt > clearedTimestamp;
          return isPending && !alreadyNotified && isAfterClear;
        }

        return isPending && !alreadyNotified;
      });

      if (newlyPendingTasks.length > 0) {
        console.log(`🎉 Found ${newlyPendingTasks.length} newly pending tasks after clear`);
        // Create notifications for pending tasks
        newlyPendingTasks.forEach((task: Task) => {
          addNotification({
            title: `Task Pending Approval! 📋`,
            description: `${task.title} - ${task.description} (${task.reward} coins)`,
            taskId: task._id,
            read: false,
            type: "task_pending_approval",
            reward: task.reward,
            childName: "Your child", // You can pass actual child name if needed
          });
        });

        // Add task IDs to notified pending tasks list
        const newNotifiedPendingTasks = [...notifiedPendingTasks, ...newlyPendingTasks.map((task: Task) => task._id)];
        localStorage.setItem(`notifiedPendingTasks_${childId}`, JSON.stringify(newNotifiedPendingTasks));
      }
    } catch (error) {
      console.error("❌ Error checking for pending approval tasks:", error);
    }
  }, [token, childId, addNotification, userRole, areNotificationsCleared]);

  // Enhanced real-time notification system
  useEffect(() => {
    console.log("🚀 Notifications useEffect running with:", { childId, userRole, token: token ? "present" : "missing" });

    // Initial check based on user role
    if (userRole === "child") {
      console.log("👶 Running child notifications setup");
      checkForNewTasks();
      checkForApprovedTasks();
    } else if (userRole === "parent") {
      console.log("👨‍👩‍👧‍👦 Running parent notifications setup");
      checkForPendingApprovalTasks();
    } else {
      console.log("❓ No userRole specified, running default child setup");
      // Default behavior for child
      checkForNewTasks();
      checkForApprovedTasks();
    }

    // Listen for task creation events from parent dashboard
    const handleTaskCreated = (event: CustomEvent) => {
      const { task, childId: eventChildId } = event.detail;

      if (eventChildId === childId) {
        // Check if notifications were cleared
        if (areNotificationsCleared()) {
          console.log("📝 Notifications were cleared, ignoring task created event");
          return;
        }

        console.log("🎉 Notification: New task created event received");
        // Add immediate notification for new task
        addNotification({
          title: `New Task! 🎉`,
          description: `${task.title} - ${task.description}`,
          taskId: task._id || `temp_${Date.now()}`,
          read: false,
          type: "new_task",
          reward: task.reward,
        });

        // Also check for any other new tasks
        setTimeout(() => {
          checkForNewTasks();
        }, 1000);
      }
    };

    // Listen for task approval events
    const handleTaskApproved = (event: CustomEvent) => {
      const { childId: eventChildId, taskId } = event.detail;

      if (eventChildId === childId) {
        // Check if notifications were cleared
        if (areNotificationsCleared()) {
          console.log("📝 Notifications were cleared, ignoring task approved event");
          return;
        }

        console.log("🎉 Notification: Task approved event received");
        // Check for approved tasks after a short delay to ensure server data is updated
        setTimeout(() => {
          checkForApprovedTasks();
        }, 1000);
      }
    };

    // Listen for task completion events (for parent)
    const handleTaskCompleted = (event: CustomEvent) => {
      const { childId: eventChildId, taskId } = event.detail;

      if (eventChildId === childId && userRole === "parent") {
        // Check if notifications were cleared
        if (areNotificationsCleared()) {
          console.log("📝 Notifications were cleared, ignoring task completed event");
          return;
        }

        console.log("🎉 Notification: Task completed event received (parent)");
        // Check for pending approval tasks after a short delay
        setTimeout(() => {
          checkForPendingApprovalTasks();
        }, 1000);
      }
    };

    // האזנה ל-storage event עבור משימות חדשות מההורה (cross-tab)
    const handleStorage = (event: StorageEvent) => {
      console.log("📦 Storage event received:", { key: event.key, newValue: event.newValue });
      if (event.key === "newTaskCreated" && event.newValue) {
        console.log("📦 newTaskCreated storage event detected");
        try {
          const info = JSON.parse(event.newValue);
          console.log("📦 Parsed storage info:", info);
          if (info.childId === childId) {
            console.log("📦 Storage event matches current childId, processing notification");

            // Check if notifications were cleared
            if (areNotificationsCleared()) {
              console.log("📝 Notifications were cleared, ignoring storage event");
              return;
            }

            // בדוק אם כבר קיבלת התראה על המשימה הזו
            const notifiedTasks = JSON.parse(localStorage.getItem(`notifiedTasks_${childId}`) || "[]");
            if (!notifiedTasks.includes(info.task._id)) {
              console.log("📦 Creating notification from storage event for task:", info.task._id);
              addNotification({
                title: `New Task! 🎉`,
                description: `${info.task.title} - ${info.task.description}`,
                taskId: info.task._id,
                read: false,
                type: "new_task",
                reward: info.task.reward,
              });
              localStorage.setItem(`notifiedTasks_${childId}`, JSON.stringify([...notifiedTasks, info.task._id]));
            } else {
              console.log("📦 Task already notified via storage, skipping:", info.task._id);
            }
          } else {
            console.log("📦 Storage event childId doesn't match:", { eventChildId: info.childId, currentChildId: childId });
          }
        } catch (error) {
          console.error("📦 Error parsing storage event:", error);
        }
      }
    };

    // Set up polling for missed events
    const pollingInterval = setInterval(() => {
      // Check if notifications were cleared first
      if (areNotificationsCleared()) {
        console.log("📝 Notifications were cleared, skipping polling");
        return;
      }

      if (userRole === "child") {
        checkForNewTasks();
        checkForApprovedTasks();
      } else if (userRole === "parent") {
        checkForPendingApprovalTasks();
      } else {
        // Default behavior for child
        checkForNewTasks();
        checkForApprovedTasks();
      }
    }, 10000); // Check every 10 seconds

    console.log("🎧 Setting up event listeners...");
    console.log("🎧 Current page URL:", window.location.href);
    console.log("🎧 Current childId:", childId);
    console.log("🎧 Current userRole:", userRole);
    console.log("🎧 Setting up listeners for: newTaskCreated, taskCreated, taskApproved, taskCompleted, storage");

    // Add a general event listener to catch all events
    const generalEventHandler = (event: Event) => {
      console.log("🎧 General event listener caught:", event.type, event);
      if (event.type === "newTaskCreated") {
        const customEvent = event as CustomEvent;
        console.log("🎧 newTaskCreated event detail:", customEvent.detail);
      }
    };

    window.addEventListener("taskCreated", handleTaskCreated as EventListener);
    window.addEventListener("taskApproved", handleTaskApproved as EventListener);
    window.addEventListener("taskCompleted", handleTaskCompleted as EventListener);
    window.addEventListener("storage", handleStorage);

    // Add general event listener for debugging
    window.addEventListener("newTaskCreated", generalEventHandler);
    window.addEventListener("taskCreated", generalEventHandler);
    window.addEventListener("taskApproved", generalEventHandler);
    window.addEventListener("taskCompleted", generalEventHandler);
    console.log("🎧 Event listeners set up successfully");
    console.log("🎧 Added listeners for: taskCreated, taskApproved, taskCompleted, storage, newTaskCreated (general)");

    return () => {
      window.removeEventListener("taskCreated", handleTaskCreated as EventListener);
      window.removeEventListener("taskApproved", handleTaskApproved as EventListener);
      window.removeEventListener("taskCompleted", handleTaskCompleted as EventListener);
      window.removeEventListener("storage", handleStorage);

      // Remove general event listeners
      window.removeEventListener("newTaskCreated", generalEventHandler);
      window.removeEventListener("taskCreated", generalEventHandler);
      window.removeEventListener("taskApproved", generalEventHandler);
      window.removeEventListener("taskCompleted", generalEventHandler);

      clearInterval(pollingInterval);
    };
  }, [childId, token, checkForNewTasks, checkForApprovedTasks, checkForPendingApprovalTasks, addNotification, userRole, areNotificationsCleared]);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setShowClearConfirm(true);
  };

  // Confirm clear all notifications
  const confirmClearAll = () => {
    setNotifications([]);
    setShowBadge(false);
    setShowClearConfirm(false);

    // Clear from localStorage
    localStorage.removeItem(`notifications_${childId}`);

    // Clear notified tasks lists to prevent re-creation on refresh
    localStorage.removeItem(`notifiedTasks_${childId}`);
    localStorage.removeItem(`notifiedApprovedTasks_${childId}`);
    localStorage.removeItem(`notifiedPendingTasks_${childId}`);

    // Also clear any other notification-related data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(`notified`) && key.includes(childId)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Set a timestamp for when notifications were cleared
    localStorage.setItem(`notificationsClearedAt_${childId}`, Date.now().toString());

    // Show success toast
    toast({
      title: "Notifications cleared",
      description: "All notifications have been cleared successfully.",
      duration: 3000,
    });
  };

  // Cancel clear all notifications
  const cancelClearAll = () => {
    setShowClearConfirm(false);
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setShowBadge(false);

    // Show success toast
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
      duration: 3000,
    });
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "new_task":
        return "bg-gradient-to-br from-[#87d4ee] to-[#4ec3f7]";
      case "task_approved":
        return "bg-gradient-to-br from-green-400 to-green-600";
      case "task_completed":
        return "bg-gradient-to-br from-yellow-400 to-orange-400";
      case "task_pending_approval":
        return "bg-gradient-to-br from-orange-400 to-red-500";
      default:
        return "bg-gray-100";
    }
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
        animate={
          unreadCount > 0
            ? {
                scale: [1, 1.1, 1],
                boxShadow: ["0 4px 6px -1px rgba(0, 0, 0, 0.1)", "0 10px 15px -3px rgba(59, 130, 246, 0.3)", "0 4px 6px -1px rgba(0, 0, 0, 0.1)"],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: unreadCount > 0 ? Infinity : 0,
          ease: "easeInOut",
        }}
        onClick={() => {
          // If panel is open, close it and mark notifications as read
          if (isOpen) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          }

          setIsOpen(!isOpen);
          setShowBadge(false);
        }}
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-blue-600" : "text-gray-600"}`} />
        {showBadge && unreadCount > 0 && (
          <motion.span
            className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'
            animate={{
              scale: [1, 1.2, 1],
              backgroundColor: ["#ef4444", "#dc2626", "#ef4444"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }} className='absolute right-0 top-14 w-96 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 max-h-[500px] overflow-hidden' style={{ zIndex: 999999 }}>
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
                    <motion.div key={notification.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={`relative overflow-hidden rounded-xl border transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] w-full ${!notification.read ? (notification.type === "new_task" ? "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-300 shadow-lg" : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-blue-200 shadow-md") : "bg-white border-gray-200 hover:bg-gray-50"}`} onClick={() => markAsRead(notification.id)}>
                      {/* Unread indicator line */}
                      {!notification.read && <div className={`absolute top-0 left-0 w-1 h-full ${notification.type === "new_task" ? "bg-gradient-to-b from-blue-500 to-indigo-600" : "bg-gradient-to-b from-[#87d4ee] to-[#4ec3f7]"}`}></div>}

                      {/* Icon background - full height */}
                      <div className={`absolute left-0 top-0 w-12 h-full ${!notification.read ? (notification.type === "new_task" ? "bg-gradient-to-br from-blue-500 to-indigo-600" : getNotificationColor(notification.type)) : "bg-gray-100"}`}></div>

                      <div className='flex items-start gap-3 p-4 pl-16'>
                        {/* Text block */}
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-baseline gap-2 flex-wrap'>
                            <span className={`font-bold text-sm ${notification.type === "new_task" ? "text-blue-800 font-extrabold" : "text-gray-800"}`}>{notification.title}</span>
                            <span className='text-xs text-gray-500 font-medium'>{formatTime(notification.timestamp)}</span>
                            {notification.reward && (
                              <div className='flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold'>
                                <span>🪙</span>
                                <span>{notification.reward}</span>
                              </div>
                            )}
                          </div>
                          <div className='mt-1 ml-0 pl-0'>
                            <span className={`text-sm font-semibold ${notification.type === "new_task" ? "text-blue-700" : "text-gray-600"}`}>
                              {notification.description.split(" - ").map((part, i) => {
                                if (i === 0) {
                                  return (
                                    <span key={i} className='font-bold'>
                                      {part}
                                    </span>
                                  );
                                } else if (part.includes("Total:")) {
                                  const [beforeTotal, afterTotal] = part.split("Total:");
                                  return (
                                    <span key={i}>
                                      - {beforeTotal}
                                      <span className='font-bold'>Total:</span>
                                      {afterTotal}
                                    </span>
                                  );
                                } else {
                                  return <span key={i}> - {part}</span>;
                                }
                              })}
                            </span>
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
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Button variant='ghost' size='sm' onClick={markAllAsRead} className='text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 flex items-center gap-1'>
                        <Check className='w-3 h-3' />
                        Mark all as read
                      </Button>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button variant='ghost' size='sm' onClick={clearAllNotifications} className='text-xs text-red-600 hover:text-red-800 hover:bg-red-50 flex items-center gap-1'>
                        <Trash2 className='w-3 h-3' />
                        Clear all
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Confirmation Popup */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center' onClick={cancelClearAll}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className='bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-sm mx-4' onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className='flex items-center gap-3 mb-4'>
                <div className='bg-red-100 p-3 rounded-full'>
                  <Trash2 className='w-6 h-6 text-red-600' />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-gray-900'>Clear All Notifications</h3>
                  <p className='text-sm text-gray-600'>This action cannot be undone</p>
                </div>
              </div>

              {/* Content */}
              <div className='mb-6'>
                <p className='text-gray-700 text-base leading-relaxed'>
                  Are you sure you want to clear all <span className='font-semibold text-gray-900'>{notifications.length}</span> notification{notifications.length !== 1 ? "s" : ""}?
                  <br />
                  <span className='text-red-600 font-medium'>This will permanently delete all your notifications.</span>
                </p>
              </div>

              {/* Actions */}
              <div className='flex gap-3'>
                <Button variant='outline' onClick={cancelClearAll} className='flex-1 text-gray-700 hover:text-gray-900'>
                  Cancel
                </Button>
                <Button variant='destructive' onClick={confirmClearAll} className='flex-1 bg-red-600 hover:bg-red-700 text-white'>
                  Clear All
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
