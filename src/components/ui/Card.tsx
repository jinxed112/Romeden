import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'dreamy' | 'floating' | 'gradient' | 'magic';
  hover?: boolean;
  glow?: boolean;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'dreamy';
  border?: boolean;
  backdrop?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    children,
    variant = 'default',
    hover = false,
    glow = false,
    interactive = false,
    padding = 'md',
    rounded = 'lg',
    shadow = 'md',
    border = false,
    backdrop = false,
    ...props
  }, ref) => {

    const baseStyles = "relative transition-all duration-300 ease-out";

    const variants = {
      default: "bg-white",
      glass: "bg-white/60 backdrop-blur-md border border-white/20",
      dreamy: "bg-gradient-to-br from-white/80 via-white/60 to-white/80 backdrop-blur-sm",
      floating: "bg-white shadow-float",
      gradient: "bg-gradient-to-br from-rose-50 via-peach-50 to-cream-50",
      magic: "bg-gradient-to-br from-white/90 via-lavender-50/30 to-rose-50/50 backdrop-blur-sm border border-white/40"
    };

    const paddingStyles = {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
      xl: "p-8"
    };

    const roundedStyles = {
      sm: "rounded-md",
      md: "rounded-lg",
      lg: "rounded-xl",
      xl: "rounded-2xl",
      '2xl': "rounded-3xl",
      full: "rounded-full"
    };

    const shadowStyles = {
      none: "shadow-none",
      sm: "shadow-sm",
      md: "shadow-soft",
      lg: "shadow-lg",
      xl: "shadow-xl",
      dreamy: "shadow-dreamy"
    };

    const hoverEffects = hover ? "hover:-translate-y-2 hover:shadow-lg" : "";
    const interactiveEffects = interactive ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : "";
    const glowEffects = glow ? "hover:shadow-rose hover:shadow-xl" : "";
    const borderStyles = border ? "border border-gray-200" : "";
    const backdropStyles = backdrop ? "backdrop-blur-lg" : "";

    return (
      <div
        className={cn(
          baseStyles,
          variants[variant],
          paddingStyles[padding],
          roundedStyles[rounded],
          shadowStyles[shadow],
          hoverEffects,
          interactiveEffects,
          glowEffects,
          borderStyles,
          backdropStyles,
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Magic Gradient Overlay */}
        {variant === 'magic' && (
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-inherit opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}

        {/* Glass Reflection Effect */}
        {(variant === 'glass' || variant === 'dreamy') && (
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Floating Sparkles for Magic Variant */}
        {variant === 'magic' && (
          <div className="absolute inset-0 overflow-hidden rounded-inherit pointer-events-none">
            <div className="sparkle" style={{ top: '20%', left: '10%' }} />
            <div className="sparkle" style={{ top: '60%', right: '15%' }} />
            <div className="sparkle" style={{ bottom: '30%', left: '70%' }} />
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

// Sub-components for common patterns
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-1.5", className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-display font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-600", className)}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-4", className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = "CardFooter";

export default Card;