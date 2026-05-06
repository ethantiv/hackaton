import React from "react";
import { Pressable, Text, View } from "react-native";
import { Icon } from "./Icon";
import { fontMono, fontSans, tokens } from "../design/tokens";

type Props = {
  ticketId: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
};

export function DetailTopBar({ ticketId, onBack, rightSlot }: Props) {
  return (
    <View
      style={{
        paddingTop: 8,
        paddingBottom: 12,
        paddingHorizontal: 8,
        backgroundColor: tokens.colors.cream,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Wróć"
        hitSlop={8}
        style={({ pressed }) => ({
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: pressed ? tokens.colors["mist-deep"] : "transparent",
        })}
      >
        <View style={{ transform: [{ rotate: "180deg" }] }}>
          <Icon
            name="chevron-right"
            size={22}
            color={tokens.colors.title}
            strokeWidth={2.4}
          />
        </View>
      </Pressable>
      <View style={{ flex: 1, paddingLeft: 4 }}>
        <Text
          style={{
            ...fontSans(600),
            color: tokens.colors.muted,
            fontSize: 12,
            letterSpacing: 0.1,
          }}
        >
          Zlecenie
        </Text>
        <Text
          style={{
            ...fontMono(500),
            color: tokens.colors.title,
            fontSize: 15,
            marginTop: 1,
          }}
        >
          {ticketId}
        </Text>
      </View>
      {rightSlot}
    </View>
  );
}
