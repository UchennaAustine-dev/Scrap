import { useState, useEffect, useCallback, useRef } from "react";
// import { ApiError } from "../api";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onError?: (error: any) => void;
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

  const isMountedRef = useRef(true);

  // Store options in ref to avoid recreating execute on every options change
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    if (!isMountedRef.current) return;

    console.log("[useApi] Starting request...");

    setState((prev: UseApiState<T>) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      // Call apiCall directly
      const data = await apiCall();

      if (isMountedRef.current) {
        console.log("[useApi] Request succeeded:", data);
        setState({ data, loading: false, error: null });
      }
    } catch (error) {
      if (!isMountedRef.current) return;

      let errorMessage = "An error occurred";
      if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as any).message || errorMessage;
      }
      console.error("[useApi] Request failed:", errorMessage, error);
      setState((prev: UseApiState<T>) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      if (optionsRef.current.onError) {
        optionsRef.current.onError(error);
      }
    }
  }, [apiCall]); // Only depend on apiCall

  useEffect(() => {
    // Execute on mount if immediate is not false
    if (optionsRef.current.immediate !== false) {
      execute();
    }
  }, [execute]); // Will re-execute when apiCall changes

  return {
    ...state,
    refetch: execute,
  };
}

export function useApiMutation<T, P = unknown>(
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
      console.log("[useApiMutation] Starting mutation with params:", params);
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall(params);
        console.log("[useApiMutation] Mutation succeeded:", result);
        setLoading(false);
        return result;
      } catch (err) {
        let errorMessage = "An error occurred";
        if (err && typeof err === "object" && "message" in err) {
          errorMessage = (err as any).message || errorMessage;
        }
        console.error("[useApiMutation] Mutation failed:", errorMessage, err);
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

  const isMountedRef = useRef(true);
  const intervalRef = useRef(interval);
  const enabledRef = useRef(enabled);
  const pollCountRef = useRef(0);

  // Update refs with latest values
  intervalRef.current = interval;
  enabledRef.current = enabled;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    pollCountRef.current = 0;

    const poll = async () => {
      if (!isMountedRef.current || !enabledRef.current) return;

      pollCountRef.current++;
      const currentPoll = pollCountRef.current;
      console.log(
        `[usePolling] Poll #${currentPoll} starting (interval: ${intervalRef.current}ms)`
      );

      try {
        setState((prev: UseApiState<T>) => ({
          ...prev,
          loading: true,
          error: null,
        }));

        // Call apiCall directly, not through a ref
        const data = await apiCall();

        if (isMountedRef.current) {
          console.log(`[usePolling] Poll #${currentPoll} succeeded:`, data);
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!isMountedRef.current) return;

        let errorMessage = "An error occurred";
        if (error && typeof error === "object" && "message" in error) {
          errorMessage = (error as any).message || errorMessage;
        }
        console.error(
          `[usePolling] Poll #${currentPoll} failed:`,
          errorMessage,
          error
        );
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
    console.log(
      `[usePolling] Starting polling (interval: ${intervalRef.current}ms, enabled: ${enabled})`
    );
    poll();

    return () => {
      console.log(
        `[usePolling] Stopping polling (total polls: ${pollCountRef.current})`
      );
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [apiCall, enabled]); // Depend on apiCall and enabled

  return state;
}
