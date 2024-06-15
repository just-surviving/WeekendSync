"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, LogOut, Settings, User, Users, MapPin, Home, Palette, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { weekendThemes } from "@/components/planner/weekend-theme-selector"
import { NotificationBell } from "@/components/notifications/notification-bell"

interface HeaderProps {
  onAuthClick: () => void
  currentView?: string
  onViewChange?: (view: string) => void
  onAIPlannerClick?: () => void
  isLandingPage?: boolean
}

export function Header({ onAuthClick, currentView, onViewChange, onAIPlannerClick, isLandingPage = false }: HeaderProps) {
  const { user, isAuthenticated, signOut } = useAuth()
  const { selectedTheme, setSelectedTheme } = useTheme()

  const navigationItems = [
    { id: "community", label: "Community", icon: Users },
    { id: "events", label: "Local Events", icon: MapPin },
  ]

  return (
    <header className={`${isLandingPage ? 'bg-white/90 backdrop-blur-md border-b border-white/20 shadow-lg shadow-gray-200/50' : 'bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm'} sticky top-0 z-40 w-full`}>
      <div className="w-full px-6 h-16 flex items-center justify-between">
        {/* Logo as Home Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onViewChange?.("planner")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
          >
            <div className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg ${isLandingPage ? 'bg-gray-100/80 border border-gray-200/50 hover:bg-gray-200/80' : 'bg-primary/10 border border-primary/20 hover:bg-primary/20'}`}>
              <img
                src="/logo.svg"
                alt="WeekSync Logo"
                className="h-5 w-5 object-contain"
                onError={(e) => {
                  // Fallback to Calendar icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Calendar className={`h-5 w-5 hidden ${isLandingPage ? 'text-gray-600' : 'text-primary'}`} />
            </div>
            <h1 className={`text-xl font-bold tracking-tight ${isLandingPage ? 'text-gray-800' : 'text-foreground'}`}>WeekSync</h1>
          </button>
        </div>

        {/* Center Navigation */}
        {isAuthenticated && onViewChange && (
          <nav className="hidden sm:flex items-center gap-1 md:gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewChange(item.id)}
                  className={`
                    relative px-2 md:px-4 py-2 rounded-lg transition-all duration-200 font-medium text-xs md:text-sm
                    ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }
                  `}
                >
                  <Icon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              )
            })}
          </nav>
        )}

        <div className="flex items-center gap-1 md:gap-3">
          {isAuthenticated && onAIPlannerClick && (
            <Button
              onClick={onAIPlannerClick}
              className="text-xs md:text-sm px-2 md:px-4 transition-all duration-200"
              style={{
                background: '#4DD9CB',
                color: '#0A0E27',
                border: 'none',
                borderRadius: '24px',
                fontWeight: '600',
                boxShadow: '0 4px 16px rgba(77, 217, 203, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3AC4B6'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(77, 217, 203, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#4DD9CB'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(77, 217, 203, 0.2)'
              }}
            >
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">AI Planner</span>
            </Button>
          )}

          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg px-3 py-2 font-medium transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#B8C4E6',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.color = '#FFFFFF'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.color = '#B8C4E6'
                  }}
                >
                  <div className="flex items-center gap-2">
                    {selectedTheme ? (
                      <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{
                          backgroundColor: selectedTheme.color.includes('purple') ? '#8b5cf6' :
                            selectedTheme.color.includes('orange') ? '#f97316' :
                              selectedTheme.color.includes('pink') ? '#ec4899' :
                                selectedTheme.color.includes('green') ? '#10b981' :
                                  selectedTheme.color.includes('emerald') ? '#059669' :
                                    selectedTheme.color.includes('indigo') ? '#6366f1' : '#6b7280'
                        }}
                      />
                    ) : (
                      <Palette className="h-4 w-4" />
                    )}
                    {selectedTheme ? selectedTheme.name : "Theme"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" className="w-48 z-[200]" sideOffset={5}>
                <DropdownMenuItem onClick={() => setSelectedTheme(null)}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-600" />
                    Default
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {weekendThemes.map((theme) => (
                  <DropdownMenuItem
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={selectedTheme?.id === theme.id ? "bg-muted" : ""}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: theme.color.includes('purple') ? '#8b5cf6' :
                            theme.color.includes('orange') ? '#f97316' :
                              theme.color.includes('pink') ? '#ec4899' :
                                theme.color.includes('green') ? '#10b981' :
                                  theme.color.includes('emerald') ? '#059669' :
                                    theme.color.includes('indigo') ? '#6366f1' : '#6b7280'
                        }}
                      />
                      {theme.name}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isAuthenticated && <NotificationBell />}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted/50 transition-all duration-200">
                  <Avatar className="h-9 w-9 border-2 border-primary/20 transition-all duration-200">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewChange?.("profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange?.("settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={onAuthClick}
              className={`transition-all duration-200 hover:opacity-90 ${isLandingPage ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
