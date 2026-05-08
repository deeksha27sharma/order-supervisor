const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Supervisors
export const getSupervisors = () => request<import("./types").Supervisor[]>("/api/supervisors");
export const getSupervisor = (id: string) => request<import("./types").Supervisor>(`/api/supervisors/${id}`);
export const createSupervisor = (data: unknown) =>
  request<import("./types").Supervisor>("/api/supervisors", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const deleteSupervisor = (id: string) =>
  request<{ message: string }>(`/api/supervisors/${id}`, { method: "DELETE" });

// Runs
export const getRuns = () => request<import("./types").Run[]>("/api/runs");
export const getRun = (id: string) => request<import("./types").Run>(`/api/runs/${id}`);
export const createRun = (data: unknown) =>
  request<import("./types").Run>("/api/runs", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const deleteRun = (id: string) =>
  request<{ message: string }>(`/api/runs/${id}`, { method: "DELETE" });
export const getActivities = (runId: string) =>
  request<import("./types").Activity[]>(`/api/runs/${runId}/activities`);
export const injectEvent = (runId: string, event_type: string, payload: Record<string, unknown>) =>
  request(`/api/runs/${runId}/events`, {
    method: "POST",
    body: JSON.stringify({ event_type, payload }),
  });
export const addInstruction = (runId: string, instruction: string) =>
  request(`/api/runs/${runId}/instructions`, {
    method: "POST",
    body: JSON.stringify({ instruction }),
  });
export const interruptRun = (runId: string) =>
  request(`/api/runs/${runId}/interrupt`, { method: "POST" });
export const resumeRun = (runId: string) =>
  request(`/api/runs/${runId}/resume`, { method: "POST" });
export const terminateRun = (runId: string) =>
  request(`/api/runs/${runId}/terminate`, { method: "POST" });