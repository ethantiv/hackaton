import React from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { DetailTopBar } from "../components/DetailTopBar";
import { StatusBadge } from "../components/StatusBadge";
import { BottomCTA } from "../components/BottomCTA";
import { Icon, categoryIcon } from "../components/Icon";
import { useAppState, type Photo } from "../state/AppState";
import { fontMono, fontSans, tokens } from "../design/tokens";
import { categoryLabel, type Job } from "../data/mockJobs";

export function JobDetailScreen({
  job,
  photos,
}: {
  job: Job;
  photos: Photo[];
}) {
  const { goBack, navigate, startJob } = useAppState();
  const insets = useSafeAreaInsets();

  const onPrimary = () => {
    if (job.status === "pending") {
      startJob(job.id);
      return;
    }
    if (job.status === "in_progress") {
      navigate("capture", job.id);
      return;
    }
    goBack();
  };

  const primaryLabel =
    job.status === "pending"
      ? "Rozpocznij zlecenie"
      : job.status === "in_progress"
        ? photos.length === 0
          ? "Dodaj raport i zakończ"
          : "Zakończ zlecenie"
        : "Wróć do listy";
  const primaryIcon =
    job.status === "pending"
      ? "play"
      : job.status === "in_progress"
        ? "check"
        : "chevron-right";

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: tokens.colors.cream }}
    >
      <DetailTopBar
        ticketId={job.ticketId}
        onBack={goBack}
        rightSlot={<StatusBadge status={job.status} priority={job.priority} />}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <HeroBlock job={job} />
        <DescriptionBlock job={job} />
        <MetaBlock job={job} />
        {job.contactName && <ContactBlock job={job} />}
        <Timeline job={job} photoCount={photos.length} />
        {job.status !== "pending" && (
          <PhotosBlock
            photos={photos}
            canAdd={job.status === "in_progress"}
            onAdd={() => navigate("capture", job.id)}
          />
        )}
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom > 0 ? 0 : 8 }}>
        <BottomCTA
          label={primaryLabel}
          iconName={primaryIcon}
          onPress={onPrimary}
          variant={job.status === "done" ? "secondary" : "primary"}
        />
      </View>
    </SafeAreaView>
  );
}

function HeroBlock({ job }: { job: Job }) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 4,
        backgroundColor: tokens.colors.mist,
        borderRadius: 20,
        padding: 24,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: tokens.colors["mist-deep"],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name={categoryIcon[job.category]}
            size={15}
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
          {categoryLabel[job.category]}
        </Text>
      </View>
      <Text
        style={{
          ...fontSans(700),
          color: tokens.colors.title,
          fontSize: 30,
          lineHeight: 36,
          letterSpacing: -0.6,
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
            fontSize: 15,
            marginTop: 4,
          }}
        >
          {job.district}
        </Text>
      )}
    </View>
  );
}

function DescriptionBlock({ job }: { job: Job }) {
  return (
    <View style={{ marginHorizontal: 16, marginTop: 24 }}>
      <SectionLabel>Opis zgłoszenia</SectionLabel>
      <Text
        style={{
          ...fontSans(400),
          color: tokens.colors.body,
          fontSize: 16,
          lineHeight: 24,
          marginTop: 8,
        }}
      >
        {job.description}
      </Text>
    </View>
  );
}

function MetaBlock({ job }: { job: Job }) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 28,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: tokens.colors["border-soft"],
      }}
    >
      <SectionLabel>Realizacja</SectionLabel>
      <View style={{ marginTop: 12, gap: 0 }}>
        <MetaRow
          iconName="clock"
          label="Okno czasowe"
          value={job.scheduledWindow}
          mono
          first
        />
        {job.travelTimeMin !== undefined && (
          <MetaRow
            iconName="map-pin"
            label="Dojazd"
            value={`~ ${job.travelTimeMin} min jazdy`}
          />
        )}
        <MetaRow
          iconName="refresh-cw"
          label="Czas pracy"
          value={`~ ${job.estimatedDurationMin} min`}
        />
      </View>
    </View>
  );
}

function ContactBlock({ job }: { job: Job }) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 28,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: tokens.colors["border-soft"],
      }}
    >
      <SectionLabel>Kontakt na miejscu</SectionLabel>
      <View
        style={{
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: tokens.colors["mist-deep"],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              ...fontSans(700),
              color: tokens.colors.body,
              fontSize: 18,
            }}
          >
            {(job.contactName ?? "").slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              ...fontSans(600),
              color: tokens.colors.title,
              fontSize: 16,
            }}
          >
            {job.contactName}
          </Text>
          {job.contactPhone && (
            <Text
              style={{
                ...fontMono(400),
                color: tokens.colors.muted,
                fontSize: 14,
                marginTop: 2,
              }}
            >
              {job.contactPhone}
            </Text>
          )}
        </View>
        {job.contactPhone && (
          <Pressable
            onPress={() =>
              Linking.openURL(
                `tel:${job.contactPhone?.replace(/\s+/g, "")}`,
              ).catch(() => undefined)
            }
            accessibilityRole="button"
            accessibilityLabel={`Zadzwoń do ${job.contactName}`}
            hitSlop={8}
            style={({ pressed }) => ({
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: pressed
                ? tokens.colors.signal.dark
                : tokens.colors.signal.DEFAULT,
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <Icon
              name="phone"
              size={24}
              color={tokens.colors["ink-on-signal"]}
              strokeWidth={2.2}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Timeline({ job, photoCount }: { job: Job; photoCount: number }) {
  const steps: { label: string; done: boolean; subtitle?: string }[] = [
    { label: "Przydzielone", done: true, subtitle: job.scheduledWindow },
    {
      label: "Rozpoczęte",
      done: job.status !== "pending",
      subtitle:
        job.status === "pending"
          ? "Czeka na rozpoczęcie"
          : job.status === "done"
            ? `Zakończone, ${photoCount} ${photoCount === 1 ? "zdjęcie" : "zdjęć"}`
            : "W trakcie",
    },
    {
      label: "Ukończone",
      done: job.status === "done",
      subtitle:
        job.status === "done"
          ? "Zatwierdzone w aplikacji"
          : "Wymaga zdjęcia i opisu",
    },
  ];

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 28,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: tokens.colors["border-soft"],
      }}
    >
      <SectionLabel>Postęp</SectionLabel>
      <View style={{ marginTop: 14, position: "relative" }}>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 10,
            top: 12,
            bottom: 12,
            width: 2,
            backgroundColor: tokens.colors["border-soft"],
          }}
        />
        {steps.map((s, idx) => {
          const isCurrent = idx === 1 && job.status === "in_progress";
          return (
            <View
              key={s.label}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 14,
                marginBottom: idx === steps.length - 1 ? 0 : 14,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: s.done
                    ? tokens.colors["status-done"]
                    : isCurrent
                      ? tokens.colors.signal.DEFAULT
                      : tokens.colors.cream,
                  borderWidth: s.done || isCurrent ? 0 : 2,
                  borderColor: tokens.colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 1,
                }}
              >
                {s.done && (
                  <Icon
                    name="check"
                    size={12}
                    color={tokens.colors["ink-on-signal"]}
                    strokeWidth={2.6}
                  />
                )}
                {!s.done && isCurrent && (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: tokens.colors["ink-on-signal"],
                    }}
                  />
                )}
              </View>
              <View style={{ flex: 1, paddingTop: 1 }}>
                <Text
                  style={{
                    ...fontSans(600),
                    color: s.done
                      ? tokens.colors.title
                      : isCurrent
                        ? tokens.colors.signal.dark
                        : tokens.colors.muted,
                    fontSize: 15,
                  }}
                >
                  {s.label}
                </Text>
                {s.subtitle && (
                  <Text
                    style={{
                      ...fontSans(500),
                      color: tokens.colors.muted,
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    {s.subtitle}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function PhotosBlock({
  photos,
  canAdd,
  onAdd,
}: {
  photos: Photo[];
  canAdd: boolean;
  onAdd: () => void;
}) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 28,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: tokens.colors["border-soft"],
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <SectionLabel>Zdjęcia ({photos.length})</SectionLabel>
        {canAdd && (
          <Pressable
            onPress={onAdd}
            accessibilityRole="button"
            accessibilityLabel="Dodaj zdjęcie"
            hitSlop={8}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingVertical: 4,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Icon
              name="plus"
              size={14}
              color={tokens.colors.title}
              strokeWidth={2.4}
            />
            <Text
              style={{
                ...fontSans(600),
                color: tokens.colors.title,
                fontSize: 14,
              }}
            >
              Dodaj
            </Text>
          </Pressable>
        )}
      </View>
      {photos.length === 0 ? (
        <Text
          style={{
            ...fontSans(500),
            color: tokens.colors.muted,
            fontSize: 14,
            lineHeight: 20,
            marginTop: 12,
          }}
        >
          Brak zdjęć. Dodaj dowód wykonanej pracy zanim zakończysz zlecenie.
        </Text>
      ) : (
        <View style={{ marginTop: 12, gap: 8 }}>
          {photos.map((p) => (
            <View
              key={p.id}
              style={{
                flexDirection: "row",
                gap: 12,
                alignItems: "center",
                paddingVertical: 8,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  backgroundColor: tokens.colors["mist-deep"],
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  name="check"
                  size={22}
                  color={tokens.colors["status-done"]}
                  strokeWidth={2.6}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    ...fontSans(600),
                    color: tokens.colors.title,
                    fontSize: 14,
                  }}
                >
                  {p.description || "Bez opisu"}
                </Text>
                <Text
                  style={{
                    ...fontMono(400),
                    color: tokens.colors.muted,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {p.takenAt}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function MetaRow({
  iconName,
  label,
  value,
  mono,
  first,
}: {
  iconName: "clock" | "map-pin" | "refresh-cw";
  label: string;
  value: string;
  mono?: boolean;
  first?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: tokens.colors["border-soft"],
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: tokens.colors.mist,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon
          name={iconName}
          size={15}
          color={tokens.colors.body}
          strokeWidth={2}
        />
      </View>
      <Text
        style={{
          ...fontSans(500),
          color: tokens.colors.muted,
          fontSize: 13,
          minWidth: 88,
          maxWidth: 132,
          flexShrink: 0,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          ...(mono ? fontMono(500) : fontSans(600)),
          color: tokens.colors.title,
          fontSize: 15,
          flex: 1,
          flexShrink: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        ...fontSans(700),
        color: tokens.colors.title,
        fontSize: 13,
        letterSpacing: 0.1,
      }}
    >
      {children}
    </Text>
  );
}
