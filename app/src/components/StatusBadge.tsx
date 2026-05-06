import React from "react";
import { Text, View } from "react-native";
import { Icon } from "./Icon";
import { fontSans, tokens } from "../design/tokens";
import type { Job } from "../data/mockJobs";

const meta = {
  pending: {
    label: "Zaplanowane",
    bg: tokens.colors["status-pending-soft"],
    fg: tokens.colors.body,
  },
  in_progress: {
    label: "W trakcie",
    bg: tokens.colors["status-progress-soft"],
    fg: tokens.colors.signal.dark,
  },
  done: {
    label: "Ukończone",
    bg: tokens.colors["status-done-soft"],
    fg: tokens.colors["status-done"],
  },
} as const;

export function StatusBadge({
  status,
  priority,
}: {
  status: Job["status"];
  priority?: Job["priority"];
}) {
  const m = meta[status];
  const isUrgent = priority === "urgent" && status !== "done";
  const bg = isUrgent ? tokens.colors["status-urgent-soft"] : m.bg;
  const fg = isUrgent ? tokens.colors["status-urgent"] : m.fg;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: bg,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
      }}
    >
      {isUrgent && (
        <Icon
          name="alert-triangle"
          size={13}
          color={fg}
          strokeWidth={2.4}
        />
      )}
      {status === "in_progress" && !isUrgent && (
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: fg,
          }}
        />
      )}
      {status === "done" && !isUrgent && (
        <Icon name="check" size={13} color={fg} strokeWidth={2.6} />
      )}
      <Text
        style={{
          ...fontSans(600),
          color: fg,
          fontSize: 13,
        }}
      >
        {isUrgent ? "Pilne" : m.label}
      </Text>
    </View>
  );
}
