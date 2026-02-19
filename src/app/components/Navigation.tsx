import { Plus, LogOut, User } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Logo } from "@/app/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

interface NavigationProps {
  onAddMedication: () => void;
  activeView: 'dashboard' | 'reports';
  onViewChange: (view: 'dashboard' | 'reports') => void;
  user: { email: string } | null;
  onLogout: () => void;
}

export function Navigation({ onAddMedication, activeView, onViewChange, user, onLogout }: NavigationProps) {
  return (
    <nav className="border-b bg-white" style={{ borderColor: '#E6EAF0' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 lg:gap-8">
          <Logo size="small" showText={true} />

          {user && (
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onViewChange('dashboard')}
                className="px-3 lg:px-4 py-2 rounded-lg transition-colors text-sm lg:text-base"
                style={{
                  backgroundColor: activeView === 'dashboard' ? '#F7FAF9' : 'transparent',
                  color: activeView === 'dashboard' ? '#0F766E' : '#475569'
                }}
              >
                Dashboard
              </button>
              <button
                onClick={() => onViewChange('reports')}
                className="px-3 lg:px-4 py-2 rounded-lg transition-colors text-sm lg:text-base"
                style={{
                  backgroundColor: activeView === 'reports' ? '#F7FAF9' : 'transparent',
                  color: activeView === 'reports' ? '#0F766E' : '#475569'
                }}
              >
                Reports
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Button
                onClick={onAddMedication}
                className="h-10 sm:h-11 px-3 sm:px-6 gap-2"
                style={{ backgroundColor: '#0F766E' }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Medication</span>
                <span className="sm:hidden">Add</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center border"
                    style={{ backgroundColor: '#F7FAF9', borderColor: '#E6EAF0' }}
                  >
                    <User className="w-5 h-5" style={{ color: '#0F766E' }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Account</p>
                    <p style={{ fontSize: '12px', color: '#475569' }}>{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null}
        </div>
      </div>

      {/* Mobile Bottom Tab Bar for Dashboard/Reports */}
      {user && (
        <div className="md:hidden border-t" style={{ borderColor: '#E6EAF0' }}>
          <div className="flex">
            <button
              onClick={() => onViewChange('dashboard')}
              className="flex-1 py-3 text-center text-sm transition-colors"
              style={{
                backgroundColor: activeView === 'dashboard' ? '#F7FAF9' : 'transparent',
                color: activeView === 'dashboard' ? '#0F766E' : '#475569',
                fontWeight: activeView === 'dashboard' ? 600 : 400,
                borderBottom: activeView === 'dashboard' ? '2px solid #0F766E' : '2px solid transparent'
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => onViewChange('reports')}
              className="flex-1 py-3 text-center text-sm transition-colors"
              style={{
                backgroundColor: activeView === 'reports' ? '#F7FAF9' : 'transparent',
                color: activeView === 'reports' ? '#0F766E' : '#475569',
                fontWeight: activeView === 'reports' ? 600 : 400,
                borderBottom: activeView === 'reports' ? '2px solid #0F766E' : '2px solid transparent'
              }}
            >
              Reports
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}