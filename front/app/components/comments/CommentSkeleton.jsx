"use client";

export default function CommentSkeleton() {
  return (
    <div className="flex items-start space-x-3 py-3 border-b last:border-b-0 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 w-1/3 rounded mb-2" />
        <div className="h-3 bg-gray-200 w-full rounded mb-1" />
        <div className="h-3 bg-gray-200 w-5/6 rounded" />
      </div>
    </div>
  );
}
