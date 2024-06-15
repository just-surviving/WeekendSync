"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { useWeekendStore } from "@/hooks/use-weekend-store"
import { Header } from "@/components/layout/header"
import { AuthModal } from "@/components/auth/auth-modal"
import { HeroSection } from "@/components/ui/hero-section"
import { BackgroundPattern } from "@/components/ui/background-pattern"
import { DragDropActivityBrowser } from "@/components/activities/drag-drop-activity-browser"
import { DragDropWeekendPlanner } from "@/components/planner/drag-drop-weekend-planner"
import { TimelineWeekendPlanner } from "@/components/planner/timeline-weekend-planner"
import { GooglePlacesIntegration } from "@/components/integrations/google-places-integration"
import { EventDiscovery } from "@/components/integrations/event-discovery"
import { MapIntegration } from "@/components/integrations/map-integration"
import { GeminiRecommendations } from "@/components/integrations/gemini-recommendations"
import { AIPlannerPage } from "@/components/ai-planner/ai-planner-page"
import { ActivityBrowser } from "@/components/activities/activity-browser"
import { CommunityHub } from "@/components/community/community-hub"
import { LocalEvents } from "@/components/events/local-events"
import { SettingsPanel } from "@/components/settings/settings-panel"
import { SettingsPage } from "@/components/settings/settings-page"
import { ProfilePage } from "@/components/profile/profile-page"
import { HolidayAwareness } from "@/components/holiday/holiday-awareness"
import { HolidayAlertIcon } from "@/components/holiday/holiday-alert-icon"
import { HolidayAlertModal } from "@/components/holiday/holiday-alert-modal"
import { WeekendPlanExport } from "@/components/planner/weekend-plan-export"
import { MagicButton } from "@/components/ui/magic-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, MapPin } from "lucide-react"

export default function WeekSyncApp() {
  const { isAuthenticated, signOut } = useAuth()
  const { selectedTheme, isAnimating } = useTheme()
  const { getActivitiesForDay } = useWeekendStore()

  // Get activities for each day
  const saturdayActivities = getActivitiesForDay("saturday")
  const sundayActivities = getActivitiesForDay("sunday")
  const fridayActivities = getActivitiesForDay("friday")
  const mondayActivities = getActivitiesForDay("monday")
  const thursdayActivities = getActivitiesForDay("thursday")
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [currentView, setCurrentView] = useState("planner")
  const [plannerView, setPlannerView] = useState<"drag-drop" | "timeline">("drag-drop")
  const [showIntegrations, setShowIntegrations] = useState(false)
  const [showAIPlanner, setShowAIPlanner] = useState(false)
  const [weatherData, setWeatherData] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<any>(null)
  const [showHolidayAlert, setShowHolidayAlert] = useState(false)
  const [longWeekendInfo, setLongWeekendInfo] = useState<any>(null)

  useEffect(() => {
    // Listen for weather and location updates from Local Events
    const handleWeatherLocationUpdate = (event: CustomEvent) => {
      setWeatherData(event.detail.weatherData)
      setUserLocation(event.detail.userLocation)
    }

    // Listen for TAB key to open AI Planner
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && isAuthenticated) {
        event.preventDefault()
        setShowAIPlanner(true)
      }
    }

    window.addEventListener('weatherLocationUpdate', handleWeatherLocationUpdate as EventListener)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('weatherLocationUpdate', handleWeatherLocationUpdate as EventListener)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAuthenticated])

  const handleHolidayAlertClick = (longWeekendInfo: any) => {
    setLongWeekendInfo(longWeekendInfo)
    setShowHolidayAlert(true)
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${isAnimating ? 'opacity-90' : 'opacity-100'}`}>
        <Header onAuthClick={() => setAuthModalOpen(true)} isLandingPage={true} />
        <HeroSection onGetStarted={() => setAuthModalOpen(true)} />
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

        {/* Holiday Alert System */}
        <HolidayAlertIcon
          onAlertClick={handleHolidayAlertClick}
          userLocation={userLocation}
        />
        <HolidayAlertModal
          isOpen={showHolidayAlert}
          onClose={() => setShowHolidayAlert(false)}
          longWeekend={longWeekendInfo}
        />
      </div>
    )
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "planner":
        return (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={plannerView === "drag-drop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPlannerView("drag-drop")}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Drag & Drop</span>
                  <span className="sm:hidden">Drag</span>
                </Button>
                <Button
                  variant={plannerView === "timeline" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPlannerView("timeline")}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Timeline View</span>
                  <span className="sm:hidden">Timeline</span>
                </Button>
              </div>
            </div>
            {plannerView === "timeline" && <TimelineWeekendPlanner />}
            {showIntegrations && (
              <div className="space-y-6">
                {/* Gemini AI Recommendations */}
                {weatherData && userLocation && (
                  <GeminiRecommendations
                    userLocation={userLocation}
                    weatherData={weatherData}
                    onRecommendationSelect={(recommendation) => {
                      console.log('Selected recommendation:', recommendation)
                      // Here you can add the recommendation to the weekend plan
                    }}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <GooglePlacesIntegration
                    activityType="restaurants"
                    onPlaceSelect={(place) => console.log('Selected place:', place)}
                  />
                  <EventDiscovery
                    onEventSelect={(event) => console.log('Selected event:', event)}
                  />
                </div>
                <MapIntegration activities={[]} />
              </div>
            )}
          </div>
        )
      case "activities":
        return <ActivityBrowser />
      case "community":
        return <CommunityHub />
      case "events":
        return <LocalEvents />
      case "settings":
        return <SettingsPage />
      case "profile":
        return <ProfilePage />
      default:
        return (
          <div className="space-y-8">
            <DragDropActivityBrowser />
            <DragDropWeekendPlanner />
          </div>
        )
    }
  }

  // Show AI Planner page if active
  if (showAIPlanner) {
    return (
      <AIPlannerPage
        weatherData={weatherData}
        userLocation={userLocation}
        onBack={() => setShowAIPlanner(false)}
        onRecommendationSelect={(recommendation) => {
          // Handle recommendation selection - could add to planner
          console.log('Selected recommendation:', recommendation)
          setShowAIPlanner(false)
        }}
      />
    )
  }

  // Show hero section when not authenticated or when explicitly showing landing page
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-background transition-all duration-500 ${isAnimating ? 'opacity-90' : 'opacity-100'} overflow-x-hidden`}>
        {/* Joyful themed header for landing page */}
        <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 backdrop-blur-md border-b border-white/20">
          <div className="w-full px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 group"
              >
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-300/30 transition-all duration-300 hover:scale-110 hover:from-purple-500/30 hover:to-pink-500/30 hover:shadow-lg group-hover:shadow-purple-200/50">
                  <img
                    src="/logo.svg"
                    alt="WeekSync Logo"
                    className="h-5 w-5 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <Calendar className="h-5 w-5 text-purple-600 hidden" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
                  WeekSync
                </h1>
              </button>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-purple-200/50 transition-all duration-200 font-semibold"
              >
                Sign In
              </Button>
              <Button
                onClick={() => signOut()}
                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-300/30 text-orange-600 hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-200 text-xs font-medium"
              >
                Clear Auth
              </Button>
            </div>
          </div>
        </header>

        <HeroSection onGetStarted={() => setAuthModalOpen(true)} />

        {/* Magic Button for Landing Page */}
        <div className="fixed bottom-4 left-4 sm:bottom-8 sm:left-8 z-50">
          <MagicButton onClick={() => setAuthModalOpen(true)} variant="landing" />
        </div>

        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

        {/* Theme Transition Overlay */}
        {isAnimating && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-none" />
        )}
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-background transition-all duration-500 ${isAnimating ? 'opacity-90' : 'opacity-100'} overflow-x-hidden`}>
      <Header
        onAuthClick={() => setAuthModalOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onAIPlannerClick={() => setShowAIPlanner(true)}
        isLandingPage={false}
      />

      <main className="w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="w-full">
          <div className="slide-in-up">
            {currentView === "planner" && plannerView === "drag-drop" && (
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[600px]">
                {/* Left Sidebar - Browse Activities */}
                <div className="w-full lg:w-80 bg-card rounded-lg border shadow-sm overflow-hidden lg:flex-shrink-0 lg:h-[calc(100vh-140px)] max-h-96 lg:max-h-none">
                  <DragDropActivityBrowser />
                </div>

                {/* Center Content - Weekend Planner + Holiday Awareness + Export */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Weekend Planner */}
                  <div className="flex-1">
                    <DragDropWeekendPlanner />
                  </div>

                  {/* Export Section - At Bottom */}
                  <div className="flex-shrink-0">
                    <WeekendPlanExport
                      saturdayActivities={saturdayActivities}
                      sundayActivities={sundayActivities}
                      fridayActivities={fridayActivities}
                      mondayActivities={mondayActivities}
                      thursdayActivities={thursdayActivities}
                      selectedTheme={selectedTheme}
                    />
                  </div>
                </div>

                {/* Right Sidebar - Nearby Places */}
                <div className="w-full lg:w-80 bg-card rounded-lg border shadow-sm overflow-hidden lg:flex-shrink-0 lg:h-[calc(100vh-140px)] max-h-96 lg:max-h-none">
                  <GooglePlacesIntegration
                    activityType="restaurants"
                    onPlaceSelect={(place) => console.log('Selected place:', place)}
                  />
                </div>
              </div>
            )}

            {currentView !== "planner" && renderCurrentView()}
            {currentView === "planner" && plannerView !== "drag-drop" && renderCurrentView()}
          </div>
        </div>
      </main>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      {/* Holiday Alert System */}
      <HolidayAlertIcon
        onAlertClick={handleHolidayAlertClick}
        userLocation={userLocation}
      />
      <HolidayAlertModal
        isOpen={showHolidayAlert}
        onClose={() => setShowHolidayAlert(false)}
        longWeekend={longWeekendInfo}
      />

      {/* Magic Button - Floating AI Planner Access */}
      {isAuthenticated && (
        <div className="fixed bottom-4 left-4 sm:bottom-8 sm:left-8 z-50">
          <MagicButton onClick={() => setShowAIPlanner(true)} />
        </div>
      )}

      {/* Theme Transition Overlay */}
      {isAnimating && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-none" />
      )}
    </div>
  )
}
