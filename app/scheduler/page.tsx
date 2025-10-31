import React from "react";
import { apiClient } from "@/lib/api";
import { useApi } from "@/lib/hooks/useApi";

const SchedulerPage: React.FC = () => {
  const { data, error, loading } = useApi(() => apiClient.listScheduledJobs());

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Scheduled Jobs</h1>
      {loading && <p className="text-gray-500">Loading scheduled jobs...</p>}
      {error && (
        <p className="text-red-500">
          Error:{" "}
          {typeof error === "object" && "message" in error
            ? (error as any).message
            : String(error)}
        </p>
      )}
      {data && Array.isArray(data) && data.length > 0 ? (
        <ul className="space-y-2">
          {data.map((job: any, idx: number) => (
            <li key={idx} className="bg-blue-50 p-3 rounded-lg flex flex-col">
              <span className="font-medium text-blue-900">
                Job ID: {job.id}
              </span>
              <span className="text-gray-600">
                Scheduled: {job.schedule_time}
              </span>
              <span className="text-gray-600">
                Sites: {Array.isArray(job.sites) ? job.sites.join(", ") : "N/A"}
              </span>
              <span className="text-gray-600">Status: {job.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No scheduled jobs found.</p>
      )}
    </div>
  );
};

export default SchedulerPage;
