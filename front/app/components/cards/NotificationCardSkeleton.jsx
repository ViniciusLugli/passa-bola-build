"use client";

import React from "react";

export default function NotificationCardSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-default bg-surface overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded skeleton flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="h-4 skeleton rounded w-1/3 mb-2"></div>
          <div className="h-3 skeleton rounded w-full mb-2"></div>
          <div className="h-3 skeleton rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}
