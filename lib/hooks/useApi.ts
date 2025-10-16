import { useState, useEffect, useCallback, useRef } from "react";
import { ApiError } from "../api";

// Type definitions for NodeJS
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onError?: (error: ApiError) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Use ref to store the latest apiCall without causing re-renders
  const apiCallRef = useRef(apiCall);
  const isMountedRef = useRef(true);
  const optionsRef = useRef(options);

  // Always update the ref with the latest function
  apiCallRef.current = apiCall;
  optionsRef.current = options;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState((prev: UseApiState<T>) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const data = await apiCallRef.current();

      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
      }
    } catch (error) {
      if (!isMountedRef.current) return;

      const errorMessage =
        error instanceof ApiError ? error.message : "An error occurred";
      setState((prev: UseApiState<T>) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      if (optionsRef.current.onError && error instanceof ApiError) {
        optionsRef.current.onError(error);
      }
    }
  }, []); // Remove options.onError from dependencies

  useEffect(() => {
    if (optionsRef.current.immediate !== false) {
      execute();
    }
  }, [execute]); // Only depend on execute which is now stable

  return {
    ...state,
    refetch: execute,
  };
}

export function useApiMutation<T, P = any>(
  apiCall: (params: P) => Promise<T>
): {
  mutate: (params: P) => Promise<T>;
  loading: boolean;
  error: string | null;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (params: P): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall(params);
        setLoading(false);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof ApiError ? err.message : "An error occurred";
        setError(errorMessage);
        setLoading(false);
        throw err;
      }
    },
    [apiCall]
  );

  return { mutate, loading, error };
}

// Polling hook for real-time updates
export function usePolling<T>(
  apiCall: () => Promise<T>,
  interval: number = 5000,
  enabled: boolean = true
): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Use ref to store the latest apiCall and mount status
  const apiCallRef = useRef(apiCall);
  const isMountedRef = useRef(true);
  const intervalRef = useRef(interval);
  const enabledRef = useRef(enabled);

  // Always update refs with latest values
  apiCallRef.current = apiCall;
  intervalRef.current = interval;
  enabledRef.current = enabled;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      if (!isMountedRef.current || !enabledRef.current) return;

      try {
        setState((prev: UseApiState<T>) => ({
          ...prev,
          loading: true,
          error: null,
        }));

        const data = await apiCallRef.current();

        if (isMountedRef.current) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!isMountedRef.current) return;

        const errorMessage =
          error instanceof ApiError ? error.message : "An error occurred";
        setState((prev: UseApiState<T>) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }

      // Schedule next poll only if still enabled and mounted
      if (enabledRef.current && isMountedRef.current) {
        timeoutId = setTimeout(poll, intervalRef.current);
      }
    };

    // Start polling immediately
    poll();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [enabled]); // Only depend on enabled to restart polling when toggled

  return state;
}
