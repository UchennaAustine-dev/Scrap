"use client";
import React, { useState } from "react";
import { apiClient } from "@/lib/api";
import { useApi } from "@/lib/hooks/useApi";

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const { data, error, loading, refetch } = useApi(
    () =>
      query
        ? apiClient.naturalLanguageSearch(query)
        : Promise.resolve({
            properties: [],
            total: 0,
            page: 1,
            limit: 10,
            has_more: false,
          }),
    { immediate: false }
  );

  const handleSearch = () => {
    refetch();
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Property Search</h1>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search query (e.g. 3 bedroom flat in Lekki)"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </div>
      {loading && <p className="text-gray-500">Searching...</p>}
      {error && (
        <p className="text-red-500">
          Error:{" "}
          {typeof error === "object" && "message" in error
            ? (error as any).message
            : String(error)}
        </p>
      )}
      {data && Array.isArray(data.properties) && data.properties.length > 0 ? (
        <ul className="space-y-2">
          {data.properties.map((property: any, idx: number) => (
            <li key={idx} className="bg-blue-50 p-3 rounded-lg flex flex-col">
              <span className="font-medium text-blue-900">
                {property.title}
              </span>
              <span className="text-green-700 font-bold">
                ₦{property.price?.toLocaleString()}
              </span>
              <span className="text-gray-600">{property.location}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No results found.</p>
      )}
    </div>
  );
};

export default SearchPage;
