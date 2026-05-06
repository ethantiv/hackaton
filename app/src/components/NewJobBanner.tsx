import React, { useEffect, useState } from "react";
import { AccessibilityInfo, Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Icon } from "./Icon";
import { fontSans, tokens } from "../design/tokens";

type Props = {
  visible: boolean;
  count?: number;
  onPress?: () => void;
};

export function NewJobBanner({ visible, count = 1, onPress }: Props) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const translate = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((on) => {
      if (mounted) setReduceMotion(on);
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (on) => setReduceMotion(on),
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    const duration = reduceMotion ? 0 : 280;
    translate.value = withTiming(visible ? 0 : -80, {
      duration: reduceMotion ? 0 : duration,
      easing: Easing.out(Easing.exp),
    });
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: reduceMotion ? 0 : 200,
      easing: Easing.out(Easing.quad),
    });
  }, [visible, translate, opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translate.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingTop: 8,
          zIndex: 10,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={
          count === 1
            ? "Jedno nowe zlecenie"
            : `${count} nowe zlecenia`
        }
        style={({ pressed }) => ({
          backgroundColor: pressed
            ? tokens.colors.signal.dark
            : tokens.colors.signal.DEFAULT,
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        })}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "rgba(255,255,255,0.18)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name="plus"
            size={16}
            color={tokens.colors["ink-on-signal"]}
            strokeWidth={2.4}
          />
        </View>
        <Text
          style={{
            ...fontSans(600),
            color: tokens.colors["ink-on-signal"],
            fontSize: 15,
            flex: 1,
          }}
        >
          {count === 1 ? "+1 nowe zlecenie" : `+${count} nowe zlecenia`}
        </Text>
        <Text
          style={{
            ...fontSans(500),
            color: "rgba(251,252,254,0.78)",
            fontSize: 13,
          }}
        >
          Pokaż
        </Text>
      </Pressable>
    </Animated.View>
  );
}
