import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Icon } from "./Icon";
import { JobRow } from "./JobRow";
import { fontSans, tokens } from "../design/tokens";
import type { Job } from "../data/mockJobs";

type Props = {
  doneJobs: Job[];
  onJobPress?: (job: Job) => void;
};

export function DoneAccordion({ doneJobs, onJobPress }: Props) {
  const [open, setOpen] = useState(false);
  if (doneJobs.length === 0) return null;

  return (
    <View>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => ({
          paddingHorizontal: 20,
          paddingVertical: 18,
          minHeight: 56,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: pressed ? tokens.colors["mist-deep"] : "transparent",
        })}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: tokens.colors["status-done"],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name="check"
            size={14}
            color={tokens.colors["ink-on-signal"]}
            strokeWidth={2.6}
          />
        </View>
        <Text
          style={{
            ...fontSans(600),
            color: tokens.colors.body,
            fontSize: 14,
          }}
        >
          {doneJobs.length} ukończone wcześniej
        </Text>
        <View style={{ marginLeft: "auto" }}>
          <View style={{ transform: [{ rotate: open ? "90deg" : "0deg" }] }}>
            <Icon
              name="chevron-right"
              size={16}
              color={tokens.colors.muted}
              strokeWidth={2.2}
            />
          </View>
        </View>
      </Pressable>

      {open && (
        <View>
          {doneJobs.map((job) => (
            <View
              key={job.id}
              style={{
                borderTopWidth: 1,
                borderTopColor: tokens.colors["border-soft"],
              }}
            >
              <JobRow job={job} onPress={() => onJobPress?.(job)} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
