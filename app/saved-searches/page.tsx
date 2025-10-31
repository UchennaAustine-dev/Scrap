import React from "react";
import { apiClient } from "@/lib/api";
import { useApi } from "@/lib/hooks/useApi";

const SavedSearchesPage: React.FC = () => {
  const { data, error, loading } = useApi(() => apiClient.listSavedSearches());

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Saved Searches</h1>
      {loading && <p className="text-gray-500">Loading saved searches...</p>}
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
          {data.map((search: any, idx: number) => (
            <li key={idx} className="bg-blue-50 p-3 rounded-lg flex flex-col">
              <span className="font-medium text-blue-900">{search.name}</span>
              <span className="text-gray-600">
                Created: {search.created_at}
              </span>
              <span className="text-gray-600">
                Results: {search.result_count ?? "N/A"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No saved searches found.</p>
      )}
    </div>
  );
};

export default SavedSearchesPage;
