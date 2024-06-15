"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { LongWeekend } from "@/lib/calendar-service"

interface HolidayAlertIconProps {
    onAlertClick: (longWeekend: LongWeekend) => void
    userLocation?: {
        country?: string
        region?: string
    }
}

export function HolidayAlertIcon({ onAlertClick, userLocation }: HolidayAlertIconProps) {
    const [longWeekend, setLongWeekend] = useState<LongWeekend | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isPulsing, setIsPulsing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        checkForLongWeekend()

        // Check every 6 hours for new long weekends
        const interval = setInterval(checkForLongWeekend, 6 * 60 * 60 * 1000)

        return () => clearInterval(interval)
    }, [userLocation])

    const checkForLongWeekend = async () => {
        if (isLoading) return

        setIsLoading(true)

        try {
            const country = userLocation?.country || 'US'
            const region = userLocation?.region || ''

            console.log('🗓️ Fetching real-time long weekends for:', { country, region })

            const response = await fetch(`/api/calendar/long-weekends?country=${country}&region=${region}`)

            if (response.ok) {
                const data = await response.json()

                if (data.success && data.longWeekends.length > 0) {
                    // Find the next upcoming long weekend
                    const upcomingLongWeekend = data.longWeekends.find((weekend: LongWeekend) =>
                        weekend.isUpcoming && weekend.daysUntil >= 0
                    )

                    if (upcomingLongWeekend) {
                        setLongWeekend(upcomingLongWeekend)
                        setIsVisible(true)

                        // Start pulsing animation if it's within 7 days
                        if (upcomingLongWeekend.daysUntil <= 7) {
                            setIsPulsing(true)
                        }

                        console.log('🎉 Real long weekend detected:', upcomingLongWeekend)
                    } else {
                        setIsVisible(false)
                        setIsPulsing(false)
                    }
                } else {
                    setIsVisible(false)
                    setIsPulsing(false)
                }
            } else {
                console.warn('🗓️ Failed to fetch long weekends, falling back to static detection')
                fallbackToStaticDetection()
            }
        } catch (error) {
            console.error('🗓️ Error fetching long weekends:', error)
            fallbackToStaticDetection()
        } finally {
            setIsLoading(false)
        }
    }

    const fallbackToStaticDetection = () => {
        const today = new Date()
        const upcomingLongWeekend = findUpcomingLongWeekend(today)

        if (upcomingLongWeekend) {
            setLongWeekend(upcomingLongWeekend)
            setIsVisible(true)

            if (upcomingLongWeekend.daysUntil <= 7) {
                setIsPulsing(true)
            }

            console.log('🎉 Fallback long weekend detected:', upcomingLongWeekend)
        } else {
            setIsVisible(false)
            setIsPulsing(false)
        }
    }

    const findUpcomingLongWeekend = (today: Date): LongWeekend | null => {
        // For fallback, we'll use mock holidays to detect long weekends
        const mockHolidays = [
            { name: 'Republic Day', date: '2025-01-26', dayOfWeek: 0 }, // Sunday - no long weekend
            { name: 'Independence Day', date: '2025-08-15', dayOfWeek: 5 }, // Friday - creates long weekend
            { name: 'Gandhi Jayanti', date: '2025-10-02', dayOfWeek: 4 }, // Thursday - creates long weekend
            { name: 'Diwali', date: '2025-11-01', dayOfWeek: 6 }, // Saturday - no long weekend
            { name: 'Christmas Day', date: '2025-12-25', dayOfWeek: 4 }, // Thursday - creates long weekend
        ]

        for (const holiday of mockHolidays) {
            const holidayDate = new Date(holiday.date)
            const daysUntil = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

            // Only show if it's in the future and within 30 days
            if (daysUntil >= 0 && daysUntil <= 30) {
                let longWeekend: LongWeekend | null = null

                // Friday holiday = Thursday-Friday-Saturday-Sunday (4-day weekend)
                if (holiday.dayOfWeek === 5) {
                    const thursday = new Date(holidayDate)
                    thursday.setDate(holidayDate.getDate() - 1)
                    const sunday = new Date(holidayDate)
                    sunday.setDate(holidayDate.getDate() + 2)

                    longWeekend = {
                        id: `fallback-holiday-${holiday.date}-friday`,
                        name: `${holiday.name} Weekend`,
                        startDate: thursday,
                        endDate: sunday,
                        days: ['thursday', 'friday', 'saturday', 'sunday'],
                        isUpcoming: true,
                        daysUntil,
                        reason: `Public holiday: ${holiday.name}`,
                        holidays: [{
                            name: holiday.name,
                            date: holiday.date,
                            type: 'public',
                            country: 'IN',
                            description: holiday.name
                        }]
                    }
                }
                // Thursday holiday = Thursday-Friday-Saturday-Sunday (4-day weekend)
                else if (holiday.dayOfWeek === 4) {
                    const sunday = new Date(holidayDate)
                    sunday.setDate(holidayDate.getDate() + 3)

                    longWeekend = {
                        id: `fallback-holiday-${holiday.date}-thursday`,
                        name: `${holiday.name} Weekend`,
                        startDate: holidayDate,
                        endDate: sunday,
                        days: ['thursday', 'friday', 'saturday', 'sunday'],
                        isUpcoming: true,
                        daysUntil,
                        reason: `Public holiday: ${holiday.name}`,
                        holidays: [{
                            name: holiday.name,
                            date: holiday.date,
                            type: 'public',
                            country: 'IN',
                            description: holiday.name
                        }]
                    }
                }

                if (longWeekend) {
                    console.log('🎉 Fallback long weekend detected:', longWeekend)
                    return longWeekend
                }
            }
        }

        return null
    }

    const formatDateRange = (startDate: Date | string, endDate: Date | string) => {
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric'
        }

        // Convert to Date objects if they're strings
        const start = startDate instanceof Date ? startDate : new Date(startDate)
        const end = endDate instanceof Date ? endDate : new Date(endDate)

        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
    }

    if (!isVisible || !longWeekend) {
        return null
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button
                onClick={() => onAlertClick(longWeekend)}
                className={cn(
                    "relative h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
                    "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                    "border-2 border-white",
                    isPulsing && "animate-pulse"
                )}
                size="lg"
            >
                <Bell className="h-6 w-6 text-white" />

                {/* Notification Badge */}
                <Badge
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-white text-xs p-0 flex items-center justify-center animate-bounce"
                >
                    !
                </Badge>

                {/* Tooltip */}
                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-orange-400" />
                        <span className="font-medium">Long Weekend Alert!</span>
                    </div>
                    <div className="mt-1">
                        {longWeekend.name} in {longWeekend.daysUntil === 0 ? 'today' : `${longWeekend.daysUntil} day${longWeekend.daysUntil === 1 ? '' : 's'}`}
                    </div>
                    <div className="text-gray-300">
                        {formatDateRange(longWeekend.startDate, longWeekend.endDate)}
                    </div>

                    {/* Arrow */}
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </div>
            </Button>
        </div>
    )
}
