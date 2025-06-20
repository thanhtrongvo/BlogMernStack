import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { cn } from "../../utils"

// Utility function to generate initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Utility function to generate consistent color from name
const getColorFromName = (name: string): string => {
  const colors = [
    "#4F46E5", "#7C3AED", "#DC2626", "#EA580C", "#D97706", 
    "#059669", "#0891B2", "#0284C7", "#6366F1", "#8B5CF6"
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

interface UserAvatarProps {
  name: string
  size?: string | number
  src?: string
  className?: string
  round?: boolean
  color?: string
  fgColor?: string
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ name, size = 40, src, className, round = true, color, fgColor = "#FFFFFF", ...props }, ref) => {
    const backgroundColor = color || getColorFromName(name)
    const sizeClass = typeof size === 'number' ? `w-[${size}px] h-[${size}px]` : `w-${size} h-${size}`
    
    return (
      <div ref={ref} className={cn("", className)} {...props}>
        <Avatar className={cn("flex shrink-0 overflow-hidden", round ? "rounded-full" : "rounded-md", sizeClass)}>
          {src && <AvatarImage src={src} alt={name} />}
          <AvatarFallback 
            className="flex items-center justify-center text-white font-medium"
            style={{ backgroundColor, color: fgColor }}
          >
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      </div>
    )
  }
)
UserAvatar.displayName = "UserAvatar"

export { UserAvatar }
