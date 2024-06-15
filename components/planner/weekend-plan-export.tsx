"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, Share2, Copy, Sun, Moon, Clock, MapPin, Calendar, Smile, Heart, Zap, Star, Leaf, Image, Loader2 } from "lucide-react"
import { type ScheduledActivity } from "@/hooks/use-weekend-store"
import { type WeekendTheme } from "./weekend-theme-selector"
import html2canvas from 'html2canvas'
import { toast } from "sonner"

interface WeekendPlanExportProps {
  saturdayActivities?: ScheduledActivity[]
  sundayActivities?: ScheduledActivity[]
  fridayActivities?: ScheduledActivity[]
  mondayActivities?: ScheduledActivity[]
  thursdayActivities?: ScheduledActivity[]
  selectedTheme?: WeekendTheme | null
}

export function WeekendPlanExport({
  saturdayActivities = [],
  sundayActivities = [],
  fridayActivities = [],
  mondayActivities = [],
  thursdayActivities = [],
  selectedTheme
}: WeekendPlanExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isGeneratingPNG, setIsGeneratingPNG] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const getMoodIcon = (mood: ScheduledActivity["mood"]) => {
    switch (mood) {
      case "happy": return "😊"
      case "relaxed": return "🍃"
      case "energetic": return "⚡"
      case "excited": return "⭐"
      case "peaceful": return "💙"
      default: return ""
    }
  }

  const generateShareableText = () => {
    const totalActivities = (thursdayActivities?.length || 0) + (fridayActivities?.length || 0) +
      (saturdayActivities?.length || 0) + (sundayActivities?.length || 0) +
      (mondayActivities?.length || 0)
    if (totalActivities === 0) return "My weekend plan is still in the making! 🎯"

    const isLongWeekend = (thursdayActivities?.length || 0) > 0 || (fridayActivities?.length || 0) > 0 || (mondayActivities?.length || 0) > 0
    let text = `🎯 My ${isLongWeekend ? 'Long ' : ''}Weekend Plan${selectedTheme ? ` - ${selectedTheme.name}` : ""}\n\n`

    const daySections = [
      { activities: thursdayActivities, name: 'THURSDAY', icon: '📅' },
      { activities: fridayActivities, name: 'FRIDAY', icon: '🎉' },
      { activities: saturdayActivities, name: 'SATURDAY', icon: '🌞' },
      { activities: sundayActivities, name: 'SUNDAY', icon: '🌙' },
      { activities: mondayActivities, name: 'MONDAY', icon: '🎊' },
    ]

    daySections.forEach(({ activities, name, icon }) => {
      if (activities && activities.length > 0) {
        text += `${icon} ${name} (${activities.length} activities)\n`
        activities.forEach((activity, index) => {
          text += `${index + 1}. ${activity.title}`
          if (activity.startTime) text += ` at ${activity.startTime}`
          if (activity.duration) text += ` (${formatDuration(activity.duration)})`
          if (activity.mood) text += ` ${getMoodIcon(activity.mood)}`
          text += `\n`
        })
        text += `\n`
      }
    })

    text += `\n✨ Planned with WeekSync`
    return text
  }

  const generatePosterHTML = () => {
    const allActivities = [...(thursdayActivities || []), ...(fridayActivities || []),
    ...(saturdayActivities || []), ...(sundayActivities || []),
    ...(mondayActivities || [])]
    const totalDuration = allActivities.reduce((sum, activity) => sum + (activity.duration || 0), 0)
    const totalActivities = allActivities.length
    const isLongWeekend = (thursdayActivities?.length || 0) > 0 || (fridayActivities?.length || 0) > 0 || (mondayActivities?.length || 0) > 0

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>My Weekend Plan</title>
        <style>
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .poster { 
            background: #1e293b; 
            border-radius: 24px; 
            padding: 48px; 
            max-width: 600px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            position: relative;
            overflow: hidden;
            border: 1px solid #334155;
          }
          .poster::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: ${selectedTheme ? 'linear-gradient(90deg, #667eea, #764ba2)' : 'linear-gradient(90deg, #06b6d4, #3b82f6)'};
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px;
          }
          .title { 
            font-size: 32px; 
            font-weight: 800; 
            color: #f1f5f9; 
            margin-bottom: 8px;
          }
          .theme-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 16px;
            ${selectedTheme ? `
              background: ${selectedTheme.color.includes('purple') ? 'rgba(139, 92, 246, 0.2)' :
          selectedTheme.color.includes('orange') ? 'rgba(249, 115, 22, 0.2)' :
            selectedTheme.color.includes('pink') ? 'rgba(236, 72, 153, 0.2)' :
              selectedTheme.color.includes('green') ? 'rgba(34, 197, 94, 0.2)' :
                selectedTheme.color.includes('emerald') ? 'rgba(16, 185, 129, 0.2)' :
                  'rgba(59, 130, 246, 0.2)'};
              color: ${selectedTheme.color.includes('purple') ? '#a78bfa' :
          selectedTheme.color.includes('orange') ? '#fb923c' :
            selectedTheme.color.includes('pink') ? '#f472b6' :
              selectedTheme.color.includes('green') ? '#4ade80' :
                selectedTheme.color.includes('emerald') ? '#34d399' :
                  '#60a5fa'};
              border: 1px solid ${selectedTheme.color.includes('purple') ? 'rgba(139, 92, 246, 0.3)' :
          selectedTheme.color.includes('orange') ? 'rgba(249, 115, 22, 0.3)' :
            selectedTheme.color.includes('pink') ? 'rgba(236, 72, 153, 0.3)' :
              selectedTheme.color.includes('green') ? 'rgba(34, 197, 94, 0.3)' :
                selectedTheme.color.includes('emerald') ? 'rgba(16, 185, 129, 0.3)' :
                  'rgba(59, 130, 246, 0.3)'};
            ` : 'background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3);'}
          }
          .stats { 
            display: flex; 
            justify-content: space-around; 
            margin-bottom: 32px; 
            padding: 20px;
            background: rgba(51, 65, 85, 0.5);
            border-radius: 16px;
            border: 1px solid rgba(71, 85, 105, 0.3);
          }
          .stat { 
            text-align: center; 
          }
          .stat-number { 
            font-size: 24px; 
            font-weight: 700; 
            color: #60a5fa; 
          }
          .stat-label { 
            font-size: 12px; 
            color: #94a3b8; 
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .day { 
            margin-bottom: 32px; 
          }
          .day-header { 
            display: flex; 
            align-items: center; 
            font-size: 20px; 
            font-weight: 700; 
            color: #f1f5f9; 
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid rgba(71, 85, 105, 0.5);
          }
          .day-icon { 
            margin-right: 12px; 
            font-size: 24px;
          }
          .activity { 
            display: flex; 
            align-items: center; 
            padding: 16px; 
            margin-bottom: 12px; 
            background: rgba(51, 65, 85, 0.4); 
            border-radius: 12px;
            border-left: 4px solid #60a5fa;
            border: 1px solid rgba(71, 85, 105, 0.3);
          }
          .activity-content { 
            flex: 1; 
          }
          .activity-title { 
            font-weight: 600; 
            color: #f1f5f9; 
            margin-bottom: 4px;
          }
          .activity-details { 
            font-size: 14px; 
            color: #94a3b8; 
          }
          .activity-mood {
            margin-left: 12px;
            font-size: 18px;
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 24px;
            border-top: 1px solid rgba(71, 85, 105, 0.5);
            color: #94a3b8; 
            font-size: 14px;
          }
          .watermark {
            font-weight: 600;
            background: linear-gradient(135deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        </style>
      </head>
      <body>
        <div class="poster">
          <div class="header">
            <div class="title">My ${isLongWeekend ? 'Long ' : ''}Weekend Plan</div>
            ${selectedTheme ? `<div class="theme-badge">${selectedTheme.name}</div>` : ''}
            <div class="stats">
              <div class="stat">
                <div class="stat-number">${totalActivities}</div>
                <div class="stat-label">Activities</div>
              </div>
              <div class="stat">
                <div class="stat-number">${Math.ceil(totalDuration / 60)}</div>
                <div class="stat-label">Hours</div>
              </div>
              <div class="stat">
                <div class="stat-number">${isLongWeekend ? '5' : '2'}</div>
                <div class="stat-label">Days</div>
              </div>
            </div>
          </div>
          
          ${thursdayActivities && thursdayActivities.length > 0 ? `
            <div class="day">
              <div class="day-header">
                <span class="day-icon">📅</span>
                Thursday
              </div>
              ${thursdayActivities.map(activity => `
                <div class="activity">
                  <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-details">
                      ${activity.startTime ? `⏰ ${activity.startTime}` : ''}
                      ${activity.duration ? ` • ${formatDuration(activity.duration)}` : ''}
                      ${activity.location ? ` • 📍 ${activity.location}` : ''}
                    </div>
                  </div>
                  ${activity.mood ? `<div class="activity-mood">${getMoodIcon(activity.mood)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${fridayActivities && fridayActivities.length > 0 ? `
            <div class="day">
              <div class="day-header">
                <span class="day-icon">🎉</span>
                Friday
              </div>
              ${fridayActivities.map(activity => `
                <div class="activity">
                  <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-details">
                      ${activity.startTime ? `⏰ ${activity.startTime}` : ''}
                      ${activity.duration ? ` • ${formatDuration(activity.duration)}` : ''}
                      ${activity.location ? ` • 📍 ${activity.location}` : ''}
                    </div>
                  </div>
                  ${activity.mood ? `<div class="activity-mood">${getMoodIcon(activity.mood)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${saturdayActivities && saturdayActivities.length > 0 ? `
            <div class="day">
              <div class="day-header">
                <span class="day-icon">🌞</span>
                Saturday
              </div>
              ${saturdayActivities.map(activity => `
                <div class="activity">
                  <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-details">
                      ${activity.startTime ? `⏰ ${activity.startTime}` : ''}
                      ${activity.duration ? ` • ${formatDuration(activity.duration)}` : ''}
                      ${activity.location ? ` • 📍 ${activity.location}` : ''}
                    </div>
                  </div>
                  ${activity.mood ? `<div class="activity-mood">${getMoodIcon(activity.mood)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${sundayActivities && sundayActivities.length > 0 ? `
            <div class="day">
              <div class="day-header">
                <span class="day-icon">🌙</span>
                Sunday
              </div>
              ${sundayActivities.map(activity => `
                <div class="activity">
                  <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-details">
                      ${activity.startTime ? `⏰ ${activity.startTime}` : ''}
                      ${activity.duration ? ` • ${formatDuration(activity.duration)}` : ''}
                      ${activity.location ? ` • 📍 ${activity.location}` : ''}
                    </div>
                  </div>
                  ${activity.mood ? `<div class="activity-mood">${getMoodIcon(activity.mood)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${mondayActivities && mondayActivities.length > 0 ? `
            <div class="day">
              <div class="day-header">
                <span class="day-icon">🎊</span>
                Monday
              </div>
              ${mondayActivities.map(activity => `
                <div class="activity">
                  <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-details">
                      ${activity.startTime ? `⏰ ${activity.startTime}` : ''}
                      ${activity.duration ? ` • ${formatDuration(activity.duration)}` : ''}
                      ${activity.location ? ` • 📍 ${activity.location}` : ''}
                    </div>
                  </div>
                  ${activity.mood ? `<div class="activity-mood">${getMoodIcon(activity.mood)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="footer">
            <div class="watermark">✨ Planned with WeekSync</div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateShareableText())
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleDownloadPoster = () => {
    setIsExporting(true)
    const html = generatePosterHTML()
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `weekend-plan-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setTimeout(() => setIsExporting(false), 1000)
  }

  const handleGeneratePNG = async () => {
    if (!posterRef.current) return

    setIsGeneratingPNG(true)
    try {
      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        width: 600,
        height: 800,
      })

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `weekend-plan-${new Date().toISOString().split('T')[0]}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          toast.success('Weekend plan poster downloaded as PNG!')
        }
      }, 'image/png', 0.95)

    } catch (error) {
      console.error('Error generating PNG:', error)
      toast.error('Failed to generate PNG. Please try again.')
    } finally {
      setIsGeneratingPNG(false)
    }
  }

  const handleSharePNG = async () => {
    if (!posterRef.current) return

    setIsGeneratingPNG(true)
    try {
      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 600,
        height: 800,
      })

      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          try {
            const file = new File([blob], 'weekend-plan.png', { type: 'image/png' })
            await navigator.share({
              title: 'My Weekend Plan',
              text: 'Check out my weekend plan!',
              files: [file]
            })
            toast.success('Weekend plan shared successfully!')
          } catch (error) {
            console.error('Error sharing:', error)
            // Fallback to download
            handleGeneratePNG()
          }
        } else {
          // Fallback to download
          handleGeneratePNG()
        }
      }, 'image/png', 0.95)

    } catch (error) {
      console.error('Error generating PNG for sharing:', error)
      toast.error('Failed to share. Please try downloading instead.')
    } finally {
      setIsGeneratingPNG(false)
    }
  }

  const handleShare = async () => {
    const text = generateShareableText()

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Weekend Plan',
          text: text,
        })
      } catch (err) {
        console.error('Error sharing:', err)
        // Fallback to copy
        handleCopyText()
      }
    } else {
      // Fallback to copy
      handleCopyText()
    }
  }

  const totalActivities = (thursdayActivities?.length || 0) + (fridayActivities?.length || 0) +
    (saturdayActivities?.length || 0) + (sundayActivities?.length || 0) +
    (mondayActivities?.length || 0)

  if (totalActivities === 0) {
    return (
      <Card
        className="opacity-50"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        <CardContent className="p-4 text-center" style={{ color: '#7A86A8' }}>
          <Share2 className="h-8 w-8 mx-auto mb-2 opacity-50" style={{ color: '#7A86A8' }} />
          <p className="text-sm">Add activities to enable sharing</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}
    >
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#FFFFFF' }}>
          <Share2 className="h-5 w-5" style={{ color: '#4DD9CB' }} />
          Share Your Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button
            onClick={handleSharePNG}
            className="flex-1"
            disabled={isGeneratingPNG}
            style={{
              background: '#4DD9CB',
              color: '#0A0E27',
              border: 'none',
              borderRadius: '24px',
              fontWeight: '600',
              boxShadow: '0 4px 16px rgba(77, 217, 203, 0.2)'
            }}
          >
            {isGeneratingPNG ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4 mr-2" />
            )}
            Share PNG
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyText}
            style={{
              background: 'transparent',
              color: '#4DD9CB',
              border: '2px solid #4DD9CB',
              borderRadius: '24px',
              fontWeight: '600'
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Text
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGeneratePNG}
            disabled={isGeneratingPNG}
            className="flex-1"
            variant="outline"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#B8C4E6',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              fontWeight: '500'
            }}
          >
            {isGeneratingPNG ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Image className="h-4 w-4 mr-2" />
            )}
            Download PNG
          </Button>
          <Button
            onClick={handleDownloadPoster}
            disabled={isExporting}
            variant="outline"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#B8C4E6',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              fontWeight: '500'
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download HTML
          </Button>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#B8C4E6',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                fontWeight: '500'
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Preview Poster
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle style={{ color: '#FFFFFF' }}>Weekend Plan Poster Preview</DialogTitle>
              <DialogDescription style={{ color: '#B8C4E6' }}>
                Preview your shareable weekend plan poster
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[80vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-blue-900 p-6 rounded-lg">
              <div
                ref={posterRef}
                className="rounded-lg"
                dangerouslySetInnerHTML={{ __html: generatePosterHTML().match(/<div class="poster">[\s\S]*<\/div>/)?.[0] || '' }}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { }}>
                Close
              </Button>
              <Button onClick={handleGeneratePNG} disabled={isGeneratingPNG}>
                {isGeneratingPNG ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating PNG...
                  </>
                ) : (
                  <>
                    <Image className="h-4 w-4 mr-2" />
                    Download PNG
                  </>
                )}
              </Button>
              <Button onClick={handleSharePNG} disabled={isGeneratingPNG}>
                {isGeneratingPNG ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share PNG
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}




