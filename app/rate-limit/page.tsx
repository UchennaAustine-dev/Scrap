import React from "react";
import { apiClient } from "@/lib/api";
import { useApi } from "@/lib/hooks/useApi";

const RateLimitPage: React.FC = () => {
  const { data, error, loading } = useApi(() => apiClient.getRateLimitStatus());

  return (
    <div>
      <h1>Rate Limit Status</h1>
      {loading && <p>Loading...</p>}
      {error && (
        <p>
          Error:{" "}
          {typeof error === "object" && "message" in error
            ? (error as any).message
            : String(error)}
        </p>
      )}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};

export default RateLimitPage;
