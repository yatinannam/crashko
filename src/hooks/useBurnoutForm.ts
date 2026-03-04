"use client";

import { useState } from "react";
import type { BurnoutInput, AnalyzeApiResponse } from "@/types";

interface UseBurnoutFormReturn {
  loading: boolean;
  error: string | null;
  response: AnalyzeApiResponse | null;
  submitted: boolean;
  submitForm: (data: BurnoutInput) => Promise<void>;
  lastInput: BurnoutInput | null;
  reset: () => void;
}

export function useBurnoutForm(userId = "anon"): UseBurnoutFormReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AnalyzeApiResponse | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [lastInput, setLastInput] = useState<BurnoutInput | null>(null);

  const submitForm = async (data: BurnoutInput) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Server error ${res.status}`);
      }

      const json: AnalyzeApiResponse = await res.json();
      setResponse(json);
      setLastInput(data);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResponse(null);
    setSubmitted(false);
    setError(null);
    setLastInput(null);
  };

  return { loading, error, response, submitted, submitForm, lastInput, reset };
}
