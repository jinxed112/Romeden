import React, { forwardRef, useState } from 'react';

// Fonction cn simple pour combiner les classes
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'glass' | 'dreamy' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    helperText,
    icon,
    iconPosition = 'left',
    variant = 'default',
    size = 'md',
    fullWidth = true,
    loading = false,
    required,
    disabled,
    placeholder,
    value,
    ...props
  }, ref) => {

    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const isFloating = variant === 'floating';
    const shouldFloat = isFloating && (isFocused || hasValue);

    const containerStyles = "relative";

    const inputBaseStyles = "w-full transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-400";

    const variants_styles = {
      default: "border border-gray-200 bg-white focus:ring-2 focus:ring-rose-400 focus:border-transparent hover:border-gray-300",
      glass: "bg-white/60 backdrop-blur-sm border border-white/40 focus:ring-2 focus:ring-rose-400/50 focus:border-white/60 hover:bg-white/70",
      dreamy: "bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm border border-rose-200/50 focus:ring-2 focus:ring-rose-400 focus:border-rose-300 hover:border-rose-300/70",
      floating: "border-b-2 border-gray-300 bg-transparent focus:border-rose-400 hover:border-gray-400 rounded-none"
    };

    const sizeStyles = {
      sm: {
        input: "h-9 px-3 py-2 text-sm",
        icon: "w-4 h-4",
        spacing: "pl-9"
      },
      md: {
        input: "h-11 px-4 py-3 text-base",
        icon: "w-5 h-5",
        spacing: "pl-11"
      },
      lg: {
        input: "h-13 px-5 py-4 text-lg",
        icon: "w-6 h-6",
        spacing: "pl-13"
      }
    };

    const roundedStyles = {
      default: "rounded-xl",
      glass: "rounded-xl",
      dreamy: "rounded-2xl",
      floating: "rounded-none"
    };

    const iconStyles = `absolute top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200 ${
      isFocused ? 'text-rose-400' : ''
    } ${sizeStyles[size].icon}`;

    const leftIconStyles = `${iconStyles} left-3`;
    const rightIconStyles = `${iconStyles} right-3`;

    const inputPaddingWithIcon = icon ? (
      iconPosition === 'left'
        ? sizeStyles[size].spacing + " pr-4"
        : "pr-11 pl-4"
    ) : '';

    const errorStyles = error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "";
    const successStyles = !error && hasValue ? "border-green-400" : "";

    return (
      <div className={cn(containerStyles, fullWidth ? "w-full" : "")}>
        {/* Standard Label */}
        {label && !isFloating && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {icon && iconPosition === 'left' && (
            <div className={leftIconStyles}>
              {icon}
            </div>
          )}

          {/* Input Field */}
          <input
            type={type}
            className={cn(
              inputBaseStyles,
              variants_styles[variant],
              sizeStyles[size].input,
              roundedStyles[variant],
              inputPaddingWithIcon,
              errorStyles,
              successStyles,
              loading && "cursor-wait",
              className
            )}
            placeholder={isFloating ? "" : placeholder}
            disabled={disabled || loading}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            ref={ref}
            {...props}
          />

          {/* Floating Label */}
          {isFloating && label && (
            <label
              className={cn(
                "absolute left-4 transition-all duration-200 pointer-events-none",
                shouldFloat
                  ? "top-2 text-xs text-rose-500 font-medium"
                  : "top-1/2 transform -translate-y-1/2 text-gray-400",
                required && "after:content-['*'] after:text-red-500 after:ml-1"
              )}
            >
              {label}
            </label>
          )}

          {/* Right Icon */}
          {icon && iconPosition === 'right' && (
            <div className={rightIconStyles}>
              {icon}
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Success/Error Icon */}
          {!loading && hasValue && !icon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {error ? (
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}

          {/* Focus Ring Enhancement */}
          {isFocused && variant === 'dreamy' && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-400/10 to-pink-400/10 pointer-events-none" />
          )}
        </div>

        {/* Helper Text or Error */}
        {(error || helperText) && (
          <p className={cn(
            "mt-2 text-sm transition-colors duration-200",
            error ? "text-red-500" : "text-gray-500"
          )}>
            {error || helperText}
          </p>
        )}

        {/* Character Count (if maxLength is provided) */}
        {props.maxLength && hasValue && (
          <p className="mt-1 text-xs text-gray-400 text-right">
            {(value?.toString().length || 0)}/{props.maxLength}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;