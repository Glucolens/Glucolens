import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Activity, Settings, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo'; // <--- NEW IMPORT

// -- Sidebar Item Component --
const SidebarItem = ({ icon: Icon, label, path }: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;
  
  return (
    <button
      onClick={() => navigate(path)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
        isActive 
          ? "bg-primary-50 text-primary-700" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <Icon className={cn("h-4 w-4", isActive ? "text-primary-600" : "text-gray-500")} />
      {label}
    </button>
  );
};

// -- Main Layout Component --
export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-40">
        {/* Replaced hardcoded text with Logo Component */}
        <Logo layout="horizontal" linkTo="/dashboard" />
        
        <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar (Slide-over on mobile, Fixed on desktop) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center px-6 border-b border-gray-100 justify-between">
           {/* Replaced hardcoded text with Logo Component */}
           <Logo layout="horizontal" linkTo="/dashboard" />

           {/* Close button for mobile inside sidebar */}
           <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
             <X className="h-5 w-5" />
           </button>
        </div>
        
        <div className="px-3 py-6 space-y-1">
          {/* Close menu on click (mobile UX) */}
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" />
            <SidebarItem icon={Activity} label="New Assessment" path="/assessment" />
            <SidebarItem icon={Settings} label="Settings" path="/settings" />
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="absolute bottom-4 left-0 w-full px-3">
          <div className="mb-2 px-3 py-2 flex items-center gap-3 rounded-lg bg-gray-50 border border-gray-100">
             {/* Updated Avatar to use Semantic Primary Colors */}
             <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                {user?.email?.[0] || 'U'}
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-gray-900">{user?.email || 'User'}</p>
                <p className="truncate text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
             </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
            onClick={() => { logout(); navigate('/auth/login'); }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 md:pl-64 w-full transition-all">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in zoom-in-95 duration-300">
          {children}
        </div>
      </main>
    </div>
  );
};
      
