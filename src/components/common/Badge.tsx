import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        primary: "bg-primary-100 text-primary-800",
        secondary: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        outline: "border border-gray-200 text-gray-800",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant, 
  size, 
  children, 
  ...props 
}) => {
  return (
    <div 
      className={cn(badgeVariants({ variant, size }), className)} 
      {...props}
    >
      {children}
    </div>
  );
};

// Predefined status badges for common use cases
export const StatusBadge: React.FC<{ 
  status: string; 
  className?: string;
}> = ({ status, className }) => {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'success':
      case 'successful':
      case 'positive':
        return 'success';
      case 'pending':
      case 'scheduled':
      case 'in_progress':
      case 'running':
        return 'warning';
      case 'failed':
      case 'error':
      case 'cancelled':
      case 'negative':
        return 'danger';
      case 'paused':
      case 'inactive':
      case 'neutral':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getVariant(status)} className={className}>
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  );
};

export { Badge, badgeVariants };
export default Badge;
