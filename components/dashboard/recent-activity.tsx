"use client";

import { mockActivities } from "@/lib/mockData";
import { getStatusColor } from "@/lib/utils";

export function RecentActivity() {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="p-6 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm font-medium text-slate-400 pb-2 border-b border-slate-700">
            <span>Date</span>
            <span>Scraper</span>
            <span>Status</span>
          </div>

          {mockActivities.map((activity) => (
            <div key={activity.id} className="grid grid-cols-3 gap-4 text-sm">
              <span className="text-slate-300">{activity.date}</span>
              <span className="text-slate-300">{activity.scraper}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium text-center flex items-center justify-center ${getStatusColor(
                  activity.status
                )}`}
              >
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
