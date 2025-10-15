import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  History,
  PhoneIncoming,
  Brain, 
  BookOpen, 
  BarChart3, 
  Settings,
  Phone,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useSidebar } from './Layout';
import { cn } from '../../lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  badgeColor?: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone, badge: 'New', badgeColor: 'bg-green-500' },
  { name: 'Call History', href: '/history', icon: History },
  { name: 'Inbound Calls', href: '/inbound', icon: PhoneIncoming },
  { name: 'Outbound Calls', href: '/outbound', icon: Phone },
  { name: 'AI Insights', href: '/ai', icon: Brain, badge: 'AI', badgeColor: 'bg-purple-500' },
  { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const { isOpen, close } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div 
        className={cn(
          "hidden lg:flex flex-col bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl relative transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
        animate={isCollapsed ? { width: 64 } : { width: 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Collapse Button */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-8 z-50 bg-white border border-gray-200 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>

        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-4 py-6">
            <div className="relative">
              <Phone className="h-8 w-8 text-blue-600" />
              <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3"
                >
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI Calling
                  </span>
                  <div className="text-xs text-gray-500 font-medium">
                    Platform
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 px-3">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-105"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"
                          layoutId="activeTab"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <div className="relative z-10 flex items-center w-full">
                        <item.icon
                          className={cn(
                            "flex-shrink-0 h-5 w-5 transition-colors",
                            isCollapsed ? "mx-auto" : "mr-3"
                          )}
                          aria-hidden="true"
                        />
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center justify-between w-full"
                            >
                              <span>{item.name}</span>
                              {item.badge && (
                                <span className={cn(
                                  "px-2 py-0.5 text-xs font-medium text-white rounded-full",
                                  item.badgeColor || "bg-blue-500"
                                )}>
                                  {item.badge}
                                </span>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
          
          {/* Footer */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 border-t border-gray-200"
              >
                <div className="text-center">
                  <div className="text-xs text-gray-500 font-medium">
                    AI Calling Platform
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    v2.0 Professional
                  </div>
                  <div className="mt-2 flex justify-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="ml-2 text-xs text-green-600 font-medium">Online</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200 shadow-2xl lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center px-4 py-6 border-b border-gray-200">
                <div className="relative">
                  <Phone className="h-8 w-8 text-blue-600" />
                  <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />
                </div>
                <div className="ml-3">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI Calling
                  </span>
                  <div className="text-xs text-gray-500 font-medium">
                    Platform
                  </div>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex-1 px-3 py-4">
                <nav className="space-y-1">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={close}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        )
                      }
                    >
                      {() => (
                        <>
                          <item.icon
                            className="mr-3 flex-shrink-0 h-5 w-5"
                            aria-hidden="true"
                          />
                          <div className="flex items-center justify-between w-full">
                            <span>{item.name}</span>
                            {item.badge && (
                              <span className={cn(
                                "px-2 py-0.5 text-xs font-medium text-white rounded-full",
                                item.badgeColor || "bg-blue-500"
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-xs text-gray-500 font-medium">
                    AI Calling Platform
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    v2.0 Professional
                  </div>
                  <div className="mt-2 flex justify-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="ml-2 text-xs text-green-600 font-medium">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
