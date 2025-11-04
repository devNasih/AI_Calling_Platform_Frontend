import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Bell,
  Search,
  User,
  LogOut,
  Menu,
  Command,
  Settings,
  Check,
  X,
  Phone,
  PhoneMissed,
  PhoneIncoming,
  Bot,
  Zap,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface Notification {
  id: string;
  type:
    | "call-completed"
    | "call-failed"
    | "call-scheduled"
    | "low-credits"
    | "ai-improvement"
    | "analytics"
    | "system-alert";
  title: string;
  message: string;
  time: string;
  read: boolean;
  metadata?: {
    duration?: string;
    callsCount?: number;
    credits?: number;
  };
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "call-completed",
      title: "AI Call Completed Successfully",
      message:
        "Call to customer Sarah Johnson completed. Lead qualified and appointment scheduled.",
      time: "5 minutes ago",
      read: false,
      metadata: { duration: "3m 24s" },
    },
    {
      id: "2",
      type: "call-failed",
      title: "Call Failed",
      message: "AI attempted to reach John Martinez but no answer.",
      time: "12 minutes ago",
      read: false,
    },
    {
      id: "3",
      type: "analytics",
      title: "Daily Analytics Report",
      message: "Your AI made 47 calls today with 89% success rate.",
      time: "1 hour ago",
      read: false,
      metadata: { callsCount: 47 },
    },
    {
      id: "4",
      type: "call-scheduled",
      title: "Batch Calls Scheduled",
      message: "150 AI calls scheduled for tomorrow at 9:00 AM.",
      time: "2 hours ago",
      read: true,
      metadata: { callsCount: 150 },
    },
    {
      id: "5",
      type: "ai-improvement",
      title: "AI Voice Model Updated",
      message: "Your AI agent has been updated with improved NLP.",
      time: "5 hours ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "call-completed":
        return <Phone className="w-4 h-4" />;
      case "call-failed":
        return <PhoneMissed className="w-4 h-4" />;
      case "call-scheduled":
        return <PhoneIncoming className="w-4 h-4" />;
      case "low-credits":
        return <Zap className="w-4 h-4" />;
      case "ai-improvement":
        return <Bot className="w-4 h-4" />;
      case "analytics":
        return <TrendingUp className="w-4 h-4" />;
      case "system-alert":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "call-completed":
        return "bg-green-100 text-green-600";
      case "call-failed":
        return "bg-red-100 text-red-600";
      case "call-scheduled":
        return "bg-blue-100 text-blue-600";
      case "low-credits":
        return "bg-yellow-100 text-yellow-600";
      case "ai-improvement":
        return "bg-purple-100 text-purple-600";
      case "analytics":
        return "bg-indigo-100 text-indigo-600";
      case "system-alert":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleLogout = () => {
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 lg:px-6 py-4 shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and search */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Mobile menu button */}
          <button className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200">
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="hidden sm:block flex-1 max-w-md">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search anything..."
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm hover:bg-white"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <kbd className="inline-flex items-center px-2 py-1 border border-gray-200 rounded text-xs font-medium text-gray-500 bg-gray-50">
                  <Command className="h-3 w-3 mr-1" />K
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-3">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center z-10">
                      <span className="text-xs text-white font-medium">
                        {unreadCount}
                      </span>
                    </span>
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-400 rounded-full animate-ping" />
                  </>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Notifications
                        </div>
                        <div className="text-xs text-gray-600">
                          {unreadCount > 0
                            ? `${unreadCount} unread`
                            : "All caught up!"}
                        </div>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bot className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          No notifications
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                              !notification.read ? "bg-blue-50/30" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-lg ${getIconColor(
                                  notification.type
                                )} flex-shrink-0 mt-0.5`}
                              >
                                {getIcon(notification.type)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-semibold text-gray-800 text-sm">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <span className="text-xs text-gray-400">
                                    {notification.time}
                                  </span>
                                  {notification.metadata?.duration && (
                                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                                      {notification.metadata.duration}
                                    </span>
                                  )}
                                  {notification.metadata?.callsCount && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                                      {notification.metadata.callsCount} calls
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-1 flex-shrink-0">
                                {!notification.read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                                    title="Mark as read"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <div className="relative">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-gray-900">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email || "user@example.com"}
                </div>
              </div>
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200">
                  <div className="font-semibold text-gray-900">
                    {user?.name}
                  </div>
                  <div className="text-sm text-gray-600">{user?.email}</div>
                  <div className="text-xs text-blue-600 mt-1 font-medium">
                    Administrator
                  </div>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/profile");
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="h-4 w-4 mr-3 text-gray-400" />
                    View Profile
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/settings");
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-3 text-gray-400" />
                    Account Settings
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
