import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { mockJobs, newIncomingJob, type Job } from "../data/mockJobs";

export type DemoState = "default" | "offline" | "new" | "empty";

export type Screen = "today" | "detail" | "capture";

export type Photo = {
  id: string;
  description: string;
  takenAt: string;
  uri: string;
};

type State = {
  demoState: DemoState;
  screen: Screen;
  currentJobId: string | null;
  jobs: Job[];
  photosByJob: Record<string, Photo[]>;
  pendingNewBanner: boolean;
};

type Action =
  | { type: "set-demo"; demoState: DemoState }
  | { type: "navigate"; screen: Screen; jobId?: string | null }
  | { type: "back-to-today" }
  | { type: "start-job"; jobId: string }
  | { type: "complete-job"; jobId: string }
  | { type: "add-photo"; jobId: string; description: string }
  | { type: "dismiss-banner" }
  | { type: "accept-new-job" };

function buildJobs(demo: DemoState): {
  jobs: Job[];
  pendingNewBanner: boolean;
} {
  if (demo === "empty") {
    return {
      jobs: mockJobs.map((j) => ({ ...j, status: "done" as const })),
      pendingNewBanner: false,
    };
  }
  if (demo === "new") {
    const list = [...mockJobs];
    const insertAt = list.findIndex(
      (j) =>
        j.status === "pending" &&
        j.scheduledStart > newIncomingJob.scheduledStart,
    );
    if (insertAt >= 0) list.splice(insertAt, 0, newIncomingJob);
    else list.push(newIncomingJob);
    return { jobs: list, pendingNewBanner: true };
  }
  return { jobs: mockJobs, pendingNewBanner: false };
}

function init(demo: DemoState): State {
  const { jobs, pendingNewBanner } = buildJobs(demo);
  return {
    demoState: demo,
    screen: "today",
    currentJobId: null,
    jobs,
    photosByJob: {},
    pendingNewBanner,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set-demo": {
      return init(action.demoState);
    }
    case "navigate":
      return {
        ...state,
        screen: action.screen,
        currentJobId: action.jobId ?? state.currentJobId,
      };
    case "back-to-today":
      return { ...state, screen: "today" };
    case "start-job":
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === action.jobId ? { ...j, status: "in_progress" as const } : j,
        ),
      };
    case "complete-job":
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === action.jobId ? { ...j, status: "done" as const } : j,
        ),
        screen: "today",
        currentJobId: null,
      };
    case "add-photo": {
      const photo: Photo = {
        id: `p-${Date.now()}`,
        description: action.description,
        takenAt: new Date().toLocaleTimeString("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        uri: "",
      };
      const existing = state.photosByJob[action.jobId] ?? [];
      return {
        ...state,
        photosByJob: {
          ...state.photosByJob,
          [action.jobId]: [...existing, photo],
        },
      };
    }
    case "dismiss-banner":
      return { ...state, pendingNewBanner: false };
    case "accept-new-job":
      return { ...state, pendingNewBanner: false };
    default:
      return state;
  }
}

export type SyncState = "synced" | "queued" | "offline";

export type AppApi = State & {
  setDemoState: (demo: DemoState) => void;
  navigate: (screen: Screen, jobId?: string | null) => void;
  goBack: () => void;
  startJob: (jobId: string) => void;
  completeJob: (jobId: string) => void;
  addPhoto: (jobId: string, description: string) => void;
  dismissBanner: () => void;
  acceptNewJob: () => void;
  syncState: SyncState;
  queuedCount: number;
};

const Ctx = createContext<AppApi | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, "default" as DemoState, init);

  const setDemoState = useCallback(
    (demo: DemoState) => dispatch({ type: "set-demo", demoState: demo }),
    [],
  );
  const navigate = useCallback(
    (screen: Screen, jobId?: string | null) =>
      dispatch({ type: "navigate", screen, jobId }),
    [],
  );
  const goBack = useCallback(() => dispatch({ type: "back-to-today" }), []);
  const startJob = useCallback(
    (jobId: string) => dispatch({ type: "start-job", jobId }),
    [],
  );
  const completeJob = useCallback(
    (jobId: string) => dispatch({ type: "complete-job", jobId }),
    [],
  );
  const addPhoto = useCallback(
    (jobId: string, description: string) =>
      dispatch({ type: "add-photo", jobId, description }),
    [],
  );
  const dismissBanner = useCallback(
    () => dispatch({ type: "dismiss-banner" }),
    [],
  );
  const acceptNewJob = useCallback(
    () => dispatch({ type: "accept-new-job" }),
    [],
  );

  const value: AppApi = useMemo(() => {
    const isOffline = state.demoState === "offline";
    return {
      ...state,
      syncState: isOffline ? "offline" : "synced",
      queuedCount: isOffline ? 2 : 0,
      setDemoState,
      navigate,
      goBack,
      startJob,
      completeJob,
      addPhoto,
      dismissBanner,
      acceptNewJob,
    };
  }, [
    state,
    setDemoState,
    navigate,
    goBack,
    startJob,
    completeJob,
    addPhoto,
    dismissBanner,
    acceptNewJob,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("AppStateProvider missing");
  return v;
}

export function useCurrentJob(): Job | null {
  const { jobs, currentJobId } = useAppState();
  return jobs.find((j) => j.id === currentJobId) ?? null;
}
