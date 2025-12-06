"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl";
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  iconClassName,
  children,
  maxWidth = "lg",
  headerActions,
  footer,
  className,
  disabled = false,
}: BaseModalProps) {
  const handleClose = () => {
    if (!disabled) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col z-50",
              maxWidthClasses[maxWidth],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {Icon && (
                    <div
                      className={cn(
                        "w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center",
                        iconClassName
                      )}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    {description && (
                      <p className="text-purple-100 text-sm">{description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {headerActions}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={disabled}
                    className="text-white hover:bg-white/20 h-10 w-10 p-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="border-t border-gray-200 bg-gray-50 px-8 py-4 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
