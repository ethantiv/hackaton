import React from "react";
import { View } from "react-native";
import { Icon } from "./Icon";
import type { JobStatus, JobPriority } from "../data/mockJobs";
import { tokens } from "../design/tokens";

type Props = {
  status: JobStatus;
  priority?: JobPriority;
  size?: number;
};

const statusColor: Record<JobStatus, string> = {
  pending: tokens.colors["status-pending"],
  in_progress: tokens.colors["status-progress"],
  done: tokens.colors["status-done"],
};

export function StatusDot({ status, priority, size = 32 }: Props) {
  const isUrgent = priority === "urgent" && status !== "done";
  const bg = isUrgent ? tokens.colors["status-urgent"] : statusColor[status];
  const dotSize = size;

  return (
    <View
      className="items-center justify-center"
      style={{
        width: dotSize,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: bg,
      }}
    >
      {status === "done" && (
        <Icon
          name="check"
          size={dotSize * 0.55}
          color={tokens.colors["ink-on-signal"]}
          strokeWidth={2.5}
        />
      )}
      {status === "in_progress" && (
        <Icon
          name="play"
          size={dotSize * 0.45}
          color={tokens.colors["ink-on-signal"]}
        />
      )}
      {status === "pending" && isUrgent && (
        <Icon
          name="alert-triangle"
          size={dotSize * 0.55}
          color={tokens.colors["ink-on-signal"]}
          strokeWidth={2.5}
        />
      )}
    </View>
  );
}
