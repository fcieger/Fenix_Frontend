import React from "react";
import { LucideIcon } from "lucide-react";

interface FormSectionProps {
  title: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
}

export function FormSection({
  title,
  icon: Icon,
  iconBgColor = "bg-purple-100",
  iconColor = "text-purple-600",
  headerBgColor,
  headerTextColor = "text-gray-900",
  children,
  actionButton,
}: FormSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div
        className={`flex items-center ${
          actionButton ? "justify-between" : ""
        } mb-8`}
      >
        {headerBgColor ? (
          <div className={`${headerBgColor} rounded-xl p-6 mb-8 w-full`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <h2 className={`text-xl font-bold ${headerTextColor}`}>
                  {title}
                </h2>
              </div>
              {actionButton && <div>{actionButton}</div>}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <h2 className={`text-xl font-bold ${headerTextColor}`}>
                {title}
              </h2>
            </div>
            {actionButton && <div>{actionButton}</div>}
          </>
        )}
      </div>
      {children}
    </div>
  );
}





