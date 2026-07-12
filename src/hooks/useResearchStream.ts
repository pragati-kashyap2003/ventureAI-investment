import { useCallback, useRef, useState } from "react";
import type {
  CompanyCandidate,
  ResearchResult,
  StreamEvent,
} from "@/lib/types/research";

export interface ResearchHistoryEntry {
  id: string;
  company: string;
  verdict: string;
  confidence: number;
  timestamp: string;
  result?: ResearchResult;
}

interface UseResearchStreamOptions {
  onComplete?: (result: ResearchResult) => void;
}

export function useResearchStream(options?: UseResearchStreamOptions) {
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [streamMessages, setStreamMessages] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const [ambiguousCandidates, setAmbiguousCandidates] = useState<CompanyCandidate[] | null>(null);
  const [ambiguousCompany, setAmbiguousCompany] = useState<string | null>(null);

  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    startTimeRef.current = Date.now();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [stopTimer]);

  const parseSSEBuffer = (buffer: string): { events: StreamEvent[]; remainder: string } => {
    const events: StreamEvent[] = [];
    const parts = buffer.split("\n\n");
    const remainder = parts.pop() || "";

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data: ")) continue;
      try {
        events.push(JSON.parse(line.slice(6)) as StreamEvent);
      } catch {
        // skip malformed
      }
    }

    return { events, remainder };
  };

  const handleEvent = useCallback(
    (event: StreamEvent, searchCompany: string, appendResult: boolean) => {
      switch (event.type) {
        case "start":
          setIsDemo(Boolean(event.demo));
          break;
        case "progress":
          setStreamMessages((prev) => [...prev, event.message]);
          break;
        case "complete":
          setResult(event.result);
          if (appendResult) {
            setResults((prev) => [...prev, event.result]);
          }
          options?.onComplete?.(event.result);
          break;
        case "ambiguous":
          setAmbiguousCandidates(event.candidates);
          setAmbiguousCompany(event.company);
          break;
        case "error":
          setError(event.message);
          break;
      }
    },
    [options]
  );

  const runResearch = useCallback(
    async (searchCompany: string, opts?: { appendResult?: boolean; resetResults?: boolean }) => {
      const appendResult = opts?.appendResult ?? false;
      const resetResults = opts?.resetResults ?? !appendResult;

      if (!searchCompany.trim() || isSearching) return;

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsSearching(true);
      if (!appendResult) setResult(null);
      if (resetResults) setResults([]);
      setError(null);
      setStreamMessages([]);
      setAmbiguousCandidates(null);
      setAmbiguousCompany(null);
      setIsDemo(false);
      startTimer();

      try {
        const response = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company: searchCompany.trim() }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(
            (errBody as { error?: string }).error || `Request failed (${response.status})`
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const { events, remainder } = parseSSEBuffer(buffer);
          buffer = remainder;

          for (const event of events) {
            handleEvent(event, searchCompany, appendResult);
          }
        }

        if (buffer.trim()) {
          const { events } = parseSSEBuffer(buffer + "\n\n");
          for (const event of events) {
            handleEvent(event, searchCompany, appendResult);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsSearching(false);
        stopTimer();
      }
    },
    [handleEvent, isSearching, startTimer, stopTimer]
  );

  const clearAmbiguous = useCallback(() => {
    setAmbiguousCandidates(null);
    setAmbiguousCompany(null);
  }, []);

  const selectAmbiguousCompany = useCallback(
    (name: string) => {
      clearAmbiguous();
      runResearch(name);
    },
    [clearAmbiguous, runResearch]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsSearching(false);
    stopTimer();
  }, [stopTimer]);

  return {
    isSearching,
    result,
    results,
    error,
    streamMessages,
    elapsed,
    isDemo,
    ambiguousCandidates,
    ambiguousCompany,
    runResearch,
    selectAmbiguousCompany,
    clearAmbiguous,
    cancel,
    setResult,
    setError,
  };
}

export function saveToHistory(result: ResearchResult): ResearchHistoryEntry {
  const entry: ResearchHistoryEntry = {
    id: Date.now().toString(),
    company: result.company,
    verdict: (result.verdictData?.verdict as string) || "PASS",
    confidence: (result.verdictData?.confidence as number) || 0,
    timestamp: result.timestamp || new Date().toISOString(),
    result,
  };

  try {
    const stored = localStorage.getItem("research_history");
    const prev: ResearchHistoryEntry[] = stored ? JSON.parse(stored) : [];
    const newHistory = [
      entry,
      ...prev.filter((h) => h.company !== entry.company).slice(0, 9),
    ];
    localStorage.setItem("research_history", JSON.stringify(newHistory));
    return entry;
  } catch {
    return entry;
  }
}

export function loadHistory(): ResearchHistoryEntry[] {
  try {
    const stored = localStorage.getItem("research_history");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
