"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, X, Plus } from "lucide-react"
import { useWeekendStore } from "@/hooks/use-weekend-store"
import { LongWeekend } from "@/lib/calendar-service"

interface HolidayAlertModalProps {
    isOpen: boolean
    onClose: () => void
    longWeekend: LongWeekend | null
}

export function HolidayAlertModal({ isOpen, onClose, longWeekend }: HolidayAlertModalProps) {
    const { setLongWeekendMode, isLongWeekendMode } = useWeekendStore()

    const formatDate = (date: Date | string) => {
        const dateObj = date instanceof Date ? date : new Date(date)
        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
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

    const getDayIcon = (day: string) => {
        switch (day.toLowerCase()) {
            case 'thursday': return '📅'
            case 'friday': return '🎉'
            case 'saturday': return '🏖️'
            case 'sunday': return '🌅'
            case 'monday': return '☕'
            default: return '📅'
        }
    }

    const getDayColor = (day: string) => {
        switch (day.toLowerCase()) {
            case 'thursday': return 'bg-purple-100 text-purple-800 border-purple-200'
            case 'friday': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'saturday': return 'bg-green-100 text-green-800 border-green-200'
            case 'sunday': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'monday': return 'bg-orange-100 text-orange-800 border-orange-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const enableLongWeekendPlanning = () => {
        console.log('🎉 Enabling long weekend planning for:', longWeekend)
        setLongWeekendMode(true)
        onClose()
    }

    const disableLongWeekendPlanning = () => {
        console.log('🚫 Disabling long weekend planning')
        setLongWeekendMode(false)
        onClose()
    }

    if (!longWeekend) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold">
                                    🎉 Long Weekend Alert!
                                </DialogTitle>
                                <DialogDescription className="text-lg">
                                    You have a {longWeekend.name} coming up in {longWeekend.daysUntil === 0 ? 'today' : `${longWeekend.daysUntil} day${longWeekend.daysUntil === 1 ? '' : 's'}!`}
                                </DialogDescription>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Long Weekend Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                {longWeekend.name} Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Date Range</h4>
                                    <div className="flex items-center gap-2 text-lg font-medium">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        {formatDateRange(longWeekend.startDate, longWeekend.endDate)}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Days Off</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {longWeekend.days.map((day, index) => (
                                            <Badge
                                                key={index}
                                                className={`${getDayColor(day)} border text-sm px-3 py-1`}
                                            >
                                                {getDayIcon(day)} {day.charAt(0).toUpperCase() + day.slice(1)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Reason Section */}
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">Reason & Holidays</h4>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                    <div className="text-lg font-medium text-gray-900 mb-3">
                                        {longWeekend.reason}
                                    </div>
                                    {longWeekend.holidays.length > 0 && (
                                        <div className="space-y-3">
                                            <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                                                <span className="text-lg">🎉</span>
                                                Celebrated Holidays:
                                            </h5>
                                            <div className="grid gap-3">
                                                {longWeekend.holidays.map((holiday, index) => (
                                                    <div key={index} className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                                                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                            <span className="text-yellow-500">⭐</span>
                                                            {holiday.name}
                                                        </div>
                                                        <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {holiday.date}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>


                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        {!isLongWeekendMode ? (
                            <Button
                                onClick={enableLongWeekendPlanning}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Enable Long Weekend Planning
                            </Button>
                        ) : (
                            <Button
                                onClick={disableLongWeekendPlanning}
                                variant="destructive"
                                className="flex-1"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Disable Long Weekend Planning
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
