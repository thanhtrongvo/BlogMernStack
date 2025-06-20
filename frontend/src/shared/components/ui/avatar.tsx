import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

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

// Enhanced Avatar with name fallback functionality
interface EnhancedAvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  name?: string
  src?: string
  useReactAvatar?: boolean  // Keep for backward compatibility
  useNameFallback?: boolean
  avatarSize?: string | number  // Keep for backward compatibility
  avatarColor?: string
  avatarFgColor?: string
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  EnhancedAvatarProps
>(({ className, name, src, useReactAvatar = false, useNameFallback = false, avatarSize, avatarColor, avatarFgColor = "#FFFFFF", ...props }, ref) => {
  const backgroundColor = avatarColor || (name ? getColorFromName(name) : "#4F46E5")
  const shouldUseFallback = useReactAvatar || useNameFallback
  
  // Handle size if provided
  const sizeClass = avatarSize ? 
    (typeof avatarSize === 'number' ? `w-[${avatarSize}px] h-[${avatarSize}px]` : `w-${avatarSize} h-${avatarSize}`) : 
    ""
  
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        sizeClass,
        className
      )}
      {...props}
    >
      {src && <AvatarImage src={src} />}
      {shouldUseFallback && name && (
        <AvatarFallback 
          className="text-white font-medium"
          style={{ backgroundColor, color: avatarFgColor }}
        >
          {getInitials(name)}
        </AvatarFallback>
      )}
    </AvatarPrimitive.Root>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
