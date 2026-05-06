import React from "react";
import { Pressable, Text, View } from "react-native";
import { Icon, type IconName } from "./Icon";
import { fontSans, tokens } from "../design/tokens";

type Props = {
  label: string;
  onPress?: () => void;
  iconName?: IconName;
  variant?: "primary" | "secondary";
};

export function BottomCTA({
  label,
  onPress,
  iconName = "play",
  variant = "primary",
}: Props) {
  const isPrimary = variant === "primary";
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
        backgroundColor: tokens.colors.cream,
        borderTopWidth: 1,
        borderTopColor: tokens.colors["border-soft"],
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: isPrimary
            ? pressed
              ? tokens.colors.signal.dark
              : tokens.colors.signal.DEFAULT
            : pressed
              ? tokens.colors["mist-deep"]
              : tokens.colors.mist,
          height: 64,
          borderRadius: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        })}
      >
        <Icon
          name={iconName}
          size={20}
          color={isPrimary ? tokens.colors["ink-on-signal"] : tokens.colors.title}
          strokeWidth={2.4}
        />
        <Text
          style={{
            ...fontSans(700),
            color: isPrimary ? tokens.colors["ink-on-signal"] : tokens.colors.title,
            fontSize: 18,
            letterSpacing: -0.1,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}
