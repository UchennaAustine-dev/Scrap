import React from "react";
import { apiClient } from "@/lib/api";
import { useApi } from "@/lib/hooks/useApi";

const MarketTrendsPage: React.FC = () => {
  const { data, error, loading } = useApi(() => apiClient.getMarketTrends());

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Market Trends</h1>
      {loading && <p className="text-gray-500">Loading market trends...</p>}
      {error && (
        <p className="text-red-500">
          Error:{" "}
          {typeof error === "object" && "message" in error
            ? (error as any).message
            : String(error)}
        </p>
      )}
      {data && (
        <div>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              Overall
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-medium text-blue-900">Average Price</span>
                <span className="text-green-700 font-bold">
                  ₦{data.overall.avg_price?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-blue-900">Median Price</span>
                <span className="text-green-700 font-bold">
                  ₦{data.overall.median_price?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-blue-900">
                  Total Listings
                </span>
                <span className="text-gray-700 font-bold">
                  {data.overall.total_listings}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-blue-900">Price Trend</span>
                <span className="text-blue-700 font-bold">
                  {data.overall.price_trend}
                </span>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              By Property Type
            </h2>
            <ul className="space-y-2">
              {data.by_property_type.map((type: any, idx: number) => (
                <li
                  key={idx}
                  className="bg-green-50 p-3 rounded-lg flex justify-between items-center"
                >
                  <span className="font-medium text-green-900">
                    {type.property_type}
                  </span>
                  <span className="text-green-700 font-bold">
                    ₦{type.avg_price?.toLocaleString()}
                  </span>
                  <span className="text-gray-600">{type.count} listings</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              By Location
            </h2>
            <ul className="space-y-2">
              {data.by_location.map((loc: any, idx: number) => (
                <li
                  key={idx}
                  className="bg-yellow-50 p-3 rounded-lg flex justify-between items-center"
                >
                  <span className="font-medium text-yellow-900">
                    {loc.location}
                  </span>
                  <span className="text-green-700 font-bold">
                    ₦{loc.avg_price?.toLocaleString()}
                  </span>
                  <span className="text-gray-600">{loc.count} listings</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketTrendsPage;
