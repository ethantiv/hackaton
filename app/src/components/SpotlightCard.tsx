import React from "react";
import { Text, View } from "react-native";
import { Icon, categoryIcon } from "./Icon";
import { PriorityTag } from "./PriorityTag";
import { fontMono, fontSans, tokens } from "../design/tokens";
import type { Job } from "../data/mockJobs";
import { categoryLabel } from "../data/mockJobs";

type SpotlightLabel =
  | "Następne zlecenie"
  | "Pierwsze zlecenie"
  | "Ostatnie zlecenie"
  | "Trwa zlecenie";

type Props = {
  job: Job;
  spotlightLabel: SpotlightLabel;
  showOfflineNote?: boolean;
};

export function SpotlightCard({ job, spotlightLabel, showOfflineNote }: Props) {
  const isUrgent = job.priority === "urgent";

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: tokens.colors.mist,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: tokens.colors["border-soft"],
      }}
    >
      <View
        className="flex-row items-center justify-between"
        style={{ marginBottom: 16 }}
      >
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: tokens.colors["mist-deep"],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={categoryIcon[job.category]}
              size={13}
              color={tokens.colors.body}
              strokeWidth={2.2}
            />
          </View>
          <Text
            style={{
              ...fontSans(600),
              color: tokens.colors.muted,
              fontSize: 13,
              letterSpacing: 0.1,
            }}
          >
            {spotlightLabel} · {categoryLabel[job.category]}
          </Text>
        </View>
        {isUrgent && <PriorityTag />}
      </View>

      <Text
        style={{
          ...fontSans(700),
          color: tokens.colors.title,
          fontSize: 28,
          lineHeight: 34,
          letterSpacing: -0.5,
        }}
      >
        {job.address}
        {job.unit ? (
          <Text style={{ ...fontSans(500), color: tokens.colors.body }}>
            {" "}
            {job.unit}
          </Text>
        ) : null}
      </Text>
      {job.district && (
        <Text
          style={{
            ...fontSans(500),
            color: tokens.colors.muted,
            fontSize: 14,
            marginTop: 2,
          }}
        >
          {job.district}
        </Text>
      )}

      <Text
        style={{
          ...fontSans(400),
          color: tokens.colors.body,
          fontSize: 16,
          lineHeight: 22,
          marginTop: 12,
        }}
        numberOfLines={2}
      >
        {job.description}
      </Text>

      <View
        className="flex-row items-center"
        style={{
          gap: 16,
          marginTop: 18,
          flexWrap: "wrap",
        }}
      >
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <Icon name="clock" size={15} color={tokens.colors.body} />
          <Text
            style={{
              ...fontMono(500),
              color: tokens.colors.body,
              fontSize: 14,
            }}
          >
            {job.scheduledWindow}
          </Text>
        </View>
        {job.travelTimeMin !== undefined && (
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Icon name="map-pin" size={15} color={tokens.colors.body} />
            <Text
              style={{
                ...fontSans(500),
                color: tokens.colors.body,
                fontSize: 14,
              }}
            >
              ~ {job.travelTimeMin} min jazdy
            </Text>
          </View>
        )}
        <Text
          style={{
            ...fontMono(400),
            color: tokens.colors.muted,
            fontSize: 12,
            marginLeft: "auto",
          }}
        >
          {job.ticketId}
        </Text>
      </View>

      {showOfflineNote && (
        <View
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: tokens.colors["border-soft"],
          }}
        >
          <Text
            style={{
              ...fontSans(500),
              color: tokens.colors.muted,
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            Tryb offline. Zmiany zapiszą się gdy wróci sieć.
          </Text>
        </View>
      )}
    </View>
  );
}
