import React from "react";
import { Text, View } from "react-native";
import { Icon } from "./Icon";
import { fontSans, tokens } from "../design/tokens";

export function PriorityTag({ compact = false }: { compact?: boolean }) {
  return (
    <View
      className="flex-row items-center"
      style={{
        backgroundColor: tokens.colors["status-urgent-soft"],
        paddingVertical: compact ? 2 : 4,
        paddingHorizontal: compact ? 6 : 8,
        borderRadius: 6,
        gap: 4,
      }}
    >
      <Icon
        name="alert-triangle"
        size={compact ? 12 : 14}
        color={tokens.colors["status-urgent"]}
        strokeWidth={2.5}
      />
      <Text
        style={{
          ...fontSans(600),
          color: tokens.colors["status-urgent"],
          fontSize: compact ? 11 : 12,
          letterSpacing: 0.2,
        }}
      >
        Pilne
      </Text>
    </View>
  );
}
