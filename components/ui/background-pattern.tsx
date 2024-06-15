"use client"

interface BackgroundPatternProps {
  pattern?: 'dots' | 'grid' | 'waves' | 'gradient'
  opacity?: number
  className?: string
}

export function BackgroundPattern({ 
  pattern = 'gradient', 
  opacity = 0.1, 
  className = '' 
}: BackgroundPatternProps) {
  const patterns = {
    dots: (
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fillRule="evenodd">
          <g fill="currentColor" fillOpacity={opacity}>
            <circle cx="30" cy="30" r="2"/>
          </g>
        </g>
      </svg>
    ),
    grid: (
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fillRule="evenodd">
          <g fill="currentColor" fillOpacity={opacity}>
            <path d="M0 0h1v40H0V0zm40 0v1H0V0h40z"/>
          </g>
        </g>
      </svg>
    ),
    waves: (
      <svg width="100" height="20" viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 10c12.5 0 12.5-10 25-10s12.5 10 25 10 12.5-10 25-10 12.5 10 25 10"
          stroke="currentColor"
          strokeOpacity={opacity}
          fill="none"
          strokeWidth="1"
        />
      </svg>
    ),
    gradient: null
  }

  if (pattern === 'gradient') {
    return (
      <div 
        className={`absolute inset-0 ${className}`}
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, ${opacity}) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, ${opacity}) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(120, 219, 255, ${opacity}) 0%, transparent 50%)
          `
        }}
      />
    )
  }

  return (
    <div 
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(patterns[pattern]?.toString() || '')}")`,
        backgroundRepeat: 'repeat'
      }}
    />
  )
}




