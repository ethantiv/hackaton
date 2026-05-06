import React from "react";
import { Pressable, Text, View } from "react-native";
import { Icon, categoryIcon } from "./Icon";
import { StatusDot } from "./StatusDot";
import { fontMono, fontSans, tokens } from "../design/tokens";
import type { Job } from "../data/mockJobs";
import { categoryLabel } from "../data/mockJobs";

type Props = {
  job: Job;
  highlightNew?: boolean;
  onPress?: () => void;
};

const statusLabel: Record<Job["status"], string> = {
  pending: "Zaplanowane",
  in_progress: "W trakcie",
  done: "Ukończone",
};

export function JobRow({ job, highlightNew, onPress }: Props) {
  const isUrgent = job.priority === "urgent" && job.status !== "done";
  const isDone = job.status === "done";

  const a11yStatus = isUrgent ? "Pilne" : statusLabel[job.status];
  const a11yAddress = job.unit ? `${job.address}, ${job.unit}` : job.address;
  const a11yLabel = `${a11yAddress}. ${categoryLabel[job.category]}, ${job.scheduledWindow}. Status: ${a11yStatus}.${highlightNew ? " Nowe zlecenie." : ""}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint="Otwiera szczegóły zlecenia"
      style={({ pressed }) => ({
        backgroundColor: pressed
          ? tokens.colors["mist-deep"]
          : highlightNew
            ? tokens.colors.signal.light
            : "transparent",
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 14,
        opacity: isDone ? 0.55 : 1,
      })}
    >
      <View style={{ paddingTop: 2 }}>
        <StatusDot status={job.status} priority={job.priority} size={36} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          className="flex-row items-center"
          style={{ gap: 6, marginBottom: 4 }}
        >
          <Icon
            name={categoryIcon[job.category]}
            size={12}
            color={tokens.colors.muted}
            strokeWidth={2}
          />
          <Text
            style={{
              ...fontSans(600),
              color: tokens.colors.muted,
              fontSize: 12,
              letterSpacing: 0.1,
            }}
          >
            {categoryLabel[job.category]}
          </Text>
          <Text
            style={{
              ...fontMono(400),
              color: tokens.colors.muted,
              fontSize: 11,
              marginLeft: "auto",
            }}
          >
            {job.ticketId}
          </Text>
        </View>

        <Text
          style={{
            ...fontSans(600),
            color: isDone ? tokens.colors.body : tokens.colors.title,
            fontSize: 17,
            lineHeight: 22,
            textDecorationLine: isDone ? "line-through" : "none",
          }}
          numberOfLines={1}
        >
          {job.address}
          {job.unit ? (
            <Text style={fontSans(500)}> {job.unit}</Text>
          ) : null}
        </Text>

        <Text
          style={{
            ...fontSans(400),
            color: tokens.colors.body,
            fontSize: 14,
            lineHeight: 19,
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {job.description}
        </Text>

        <View
          className="flex-row items-center"
          style={{ gap: 10, marginTop: 8, flexWrap: "wrap" }}
        >
          <Text
            style={{
              ...fontSans(600),
              color: isUrgent
                ? tokens.colors["status-urgent"]
                : isDone
                  ? tokens.colors["status-done"]
                  : tokens.colors.muted,
              fontSize: 13,
            }}
          >
            {isUrgent ? "Pilne" : statusLabel[job.status]}
          </Text>
          <View
            style={{
              width: 3,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: tokens.colors.border,
            }}
          />
          <Text
            style={{
              ...fontMono(400),
              color: tokens.colors.muted,
              fontSize: 13,
            }}
          >
            {job.scheduledWindow}
          </Text>
          {highlightNew && (
            <View
              style={{
                marginLeft: "auto",
                backgroundColor: tokens.colors.signal.DEFAULT,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  ...fontSans(700),
                  color: tokens.colors["ink-on-signal"],
                  fontSize: 11,
                  letterSpacing: 0.3,
                }}
              >
                Nowe
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ paddingTop: 18 }}>
        <Icon
          name="chevron-right"
          size={18}
          color={tokens.colors.border}
          strokeWidth={2}
        />
      </View>
    </Pressable>
  );
}
