import * as React from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  fullScreen?: boolean;
}

const LoadingScreen = React.forwardRef<HTMLDivElement, LoadingScreenProps>(
  ({ className, message = "Loading...", fullScreen = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center transition-all duration-300",
          fullScreen
            ? "fixed inset-0 z-50 bg-white/90 backdrop-blur-sm"
            : "w-full h-full min-h-[140px] bg-transparent", 
          className
        )}
        {...props}
      >
        <div className="relative flex items-center justify-center mb-4">
          {/* Outer Ring (Subtle Brand Primary) */}
          <div className="absolute inset-[-8px] border-[3px] border-primary-100 rounded-full animate-[spin_3s_linear_infinite]" />
          
          {/* Inner Ring (Brand Primary Strong) */}
          <div className="absolute inset-[-8px] border-[3px] border-t-primary-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          
          {/* Center Icon */}
          <div className="relative h-12 w-12 bg-white rounded-full shadow-lg shadow-primary-100/50 flex items-center justify-center z-10 border border-primary-50">
             <Activity className="h-6 w-6 text-primary-600 animate-pulse" />
          </div>
        </div>

        {/* Dynamic Message */}
        <p className="text-sm font-medium text-primary-700 animate-pulse tracking-wide">
          {message}
        </p>
      </div>
    );
  }
);

LoadingScreen.displayName = "LoadingScreen";

export { LoadingScreen };
