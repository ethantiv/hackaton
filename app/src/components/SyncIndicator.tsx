import React from "react";
import { Text, View } from "react-native";
import { Icon } from "./Icon";
import { fontSans, tokens } from "../design/tokens";

type Props = {
  state: "synced" | "queued" | "offline";
  queuedCount?: number;
};

export function SyncIndicator({ state, queuedCount = 0 }: Props) {
  if (state === "synced") {
    return (
      <View className="flex-row items-center" style={{ gap: 6 }}>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: tokens.colors["status-done"],
          }}
        />
        <Text
          style={{
            ...fontSans(500),
            color: tokens.colors.muted,
            fontSize: 13,
          }}
        >
          Zsynchronizowano
        </Text>
      </View>
    );
  }

  if (state === "queued") {
    return (
      <View className="flex-row items-center" style={{ gap: 6 }}>
        <Icon
          name="refresh-cw"
          size={14}
          color={tokens.colors["status-urgent"]}
        />
        <Text
          style={{
            ...fontSans(600),
            color: tokens.colors["status-urgent"],
            fontSize: 13,
          }}
        >
          Czeka na sieć: {queuedCount}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center" style={{ gap: 6 }}>
      <Icon name="cloud-off" size={14} color={tokens.colors.body} />
      <Text
        style={{
          ...fontSans(600),
          color: tokens.colors.body,
          fontSize: 13,
        }}
      >
        Offline
        {queuedCount > 0 ? ` · ${queuedCount} w kolejce` : ""}
      </Text>
    </View>
  );
}
