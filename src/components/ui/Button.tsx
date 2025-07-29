import React, { forwardRef } from 'react';

// Fonction cn simple pour combiner les classes
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gradient' | 'magic';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  glow?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    children,
    disabled,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    rounded = false,
    glow = false,
    ...props
  }, ref) => {

    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none relative overflow-hidden";

    const variants = {
      primary: "bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl focus:ring-rose-400 active:scale-95",
      secondary: "border-2 border-purple-400 text-purple-600 hover:bg-purple-50 hover:border-purple-500 focus:ring-purple-400 active:scale-95",
      ghost: "text-gray-700 hover:text-rose-500 hover:bg-rose-50 focus:ring-rose-400 active:scale-95",
      outline: "border-2 border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400 focus:ring-rose-400 active:scale-95",
      gradient: "bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 text-white shadow-lg hover:shadow-xl focus:ring-purple-400 active:scale-95",
      magic: "bg-gradient-to-r from-indigo-400 via-rose-400 to-pink-400 hover:from-indigo-500 hover:via-rose-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl focus:ring-rose-400 active:scale-95"
    };

    const sizes = {
      sm: "h-8 px-3 py-1 text-sm gap-1.5",
      md: "h-10 px-4 py-2 text-base gap-2",
      lg: "h-12 px-6 py-3 text-lg gap-2.5",
      xl: "h-14 px-8 py-4 text-xl gap-3"
    };

    const roundedStyles = {
      sm: rounded ? "rounded-full" : "rounded-lg",
      md: rounded ? "rounded-full" : "rounded-xl",
      lg: rounded ? "rounded-full" : "rounded-xl",
      xl: rounded ? "rounded-full" : "rounded-2xl"
    };

    const glowStyles = glow && !disabled ? "hover:shadow-2xl hover:shadow-rose-400/25" : "";

    const hoverEffects = "hover:scale-105 hover:-translate-y-0.5";

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          roundedStyles[size],
          glowStyles,
          hoverEffects,
          fullWidth && "w-full",
          loading && "cursor-wait",
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />
          </div>
        )}

        {/* Content Container */}
        <div className={cn(
          "flex items-center gap-2",
          loading && "opacity-0"
        )}>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}

          <span className="flex-1">{children}</span>

          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </div>

        {/* Shimmer Effect for Magic Variant */}
        {variant === 'magic' && (
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
          </div>
        )}

        {/* Ripple Effect Container */}
        <div className="absolute inset-0 overflow-hidden rounded-inherit">
          <div className="absolute inset-0 transform scale-0 bg-white/20 rounded-full transition-transform duration-300 group-active:scale-100" />
        </div>
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;