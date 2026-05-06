import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { TopBar } from "../components/TopBar";
import { SpotlightCard } from "../components/SpotlightCard";
import { JobRow } from "../components/JobRow";
import { DoneAccordion } from "../components/DoneAccordion";
import { BottomCTA } from "../components/BottomCTA";
import { NewJobBanner } from "../components/NewJobBanner";
import { DemoToggle } from "../components/DemoToggle";
import { Icon } from "../components/Icon";
import { useAppState } from "../state/AppState";
import { fontSans, tokens } from "../design/tokens";
import type { Job } from "../data/mockJobs";

const DEMO_DATE = new Date(2025, 4, 6); // Wt, 6 maj 2025

function pickSpotlight(jobs: Job[]): Job | null {
  const inProgress = jobs.find((j) => j.status === "in_progress");
  if (inProgress) return inProgress;
  return jobs.find((j) => j.status === "pending") ?? null;
}

function spotlightLabel(
  spotlight: Job,
  upcoming: Job[],
  doneCount: number,
): "Następne zlecenie" | "Pierwsze zlecenie" | "Ostatnie zlecenie" | "Trwa zlecenie" {
  if (spotlight.status === "in_progress") return "Trwa zlecenie";
  if (doneCount === 0) return "Pierwsze zlecenie";
  if (upcoming.length === 1) return "Ostatnie zlecenie";
  return "Następne zlecenie";
}

function ctaForSpotlight(
  spotlight: Job,
): { label: string; iconName: "play" | "chevron-right" } {
  if (spotlight.status === "in_progress")
    return { label: "Otwórz zlecenie", iconName: "chevron-right" };
  return { label: "Rozpocznij", iconName: "play" };
}

export function TodayScreen() {
  const {
    demoState,
    setDemoState,
    jobs,
    syncState,
    queuedCount,
    pendingNewBanner,
    navigate,
    startJob,
    dismissBanner,
  } = useAppState();
  const insets = useSafeAreaInsets();

  const doneJobs = jobs.filter((j) => j.status === "done");
  const activeJobs = jobs.filter((j) => j.status !== "done");
  const spotlight = pickSpotlight(activeJobs);
  const restOfDay = spotlight
    ? activeJobs.filter((j) => j.id !== spotlight.id)
    : activeJobs;
  const allDone = activeJobs.length === 0;

  const cta = spotlight ? ctaForSpotlight(spotlight) : null;

  const onPrimaryCta = () => {
    if (!spotlight) return;
    if (spotlight.status === "pending") startJob(spotlight.id);
    navigate("detail", spotlight.id);
  };

  const newJob = jobs.find((j) => j.isNew);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: tokens.colors.cream }}
    >
      <DemoToggle current={demoState} onChange={setDemoState} />
      <TopBar date={DEMO_DATE} syncState={syncState} queuedCount={queuedCount} />

      <View style={{ flex: 1, position: "relative" }}>
        <NewJobBanner
          visible={pendingNewBanner}
          count={1}
          onPress={() => {
            dismissBanner();
            if (newJob) navigate("detail", newJob.id);
          }}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: pendingNewBanner ? 64 : 4,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {allDone ? (
            <AllDoneSummary count={doneJobs.length} />
          ) : spotlight ? (
            <Pressable
              onPress={() => navigate("detail", spotlight.id)}
              accessibilityRole="button"
              accessibilityLabel={`Otwórz: ${spotlight.address}`}
            >
              <SpotlightCard
                job={spotlight}
                spotlightLabel={spotlightLabel(
                  spotlight,
                  activeJobs,
                  doneJobs.length,
                )}
                showOfflineNote={demoState === "offline"}
              />
            </Pressable>
          ) : null}

          {restOfDay.length > 0 && (
            <View style={{ marginTop: 28 }}>
              <SectionHeader title="Reszta dnia" count={restOfDay.length} />
              <View>
                {restOfDay.map((job, idx) => (
                  <View
                    key={job.id}
                    style={{
                      borderTopWidth: idx === 0 ? 0 : 1,
                      borderTopColor: tokens.colors["border-soft"],
                    }}
                  >
                    <JobRow
                      job={job}
                      highlightNew={job.isNew}
                      onPress={() => navigate("detail", job.id)}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {doneJobs.length > 0 && !allDone && (
            <View
              style={{
                marginTop: 24,
                borderTopWidth: 1,
                borderTopColor: tokens.colors["border-soft"],
              }}
            >
              <DoneAccordion
                doneJobs={doneJobs}
                onJobPress={(j) => navigate("detail", j.id)}
              />
            </View>
          )}
        </ScrollView>
      </View>

      {!allDone && spotlight && cta && (
        <View style={{ paddingBottom: insets.bottom > 0 ? 0 : 8 }}>
          <BottomCTA
            label={cta.label}
            iconName={cta.iconName}
            onPress={onPrimaryCta}
          />
        </View>
      )}
      {allDone && (
        <View style={{ paddingBottom: insets.bottom > 0 ? 0 : 8 }}>
          <BottomCTA
            label="Pokaż następne"
            iconName="chevron-right"
            variant="secondary"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingBottom: 8,
        flexDirection: "row",
        alignItems: "baseline",
        gap: 8,
      }}
    >
      <Text
        style={{
          ...fontSans(700),
          color: tokens.colors.title,
          fontSize: 15,
          letterSpacing: -0.1,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          ...fontSans(500),
          color: tokens.colors.muted,
          fontSize: 13,
        }}
      >
        {count}
      </Text>
    </View>
  );
}

function AllDoneSummary({ count }: { count: number }) {
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
        alignItems: "flex-start",
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: tokens.colors["status-done"],
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Icon
          name="check"
          size={26}
          color={tokens.colors["ink-on-signal"]}
          strokeWidth={2.8}
        />
      </View>
      <Text
        style={{
          ...fontSans(700),
          color: tokens.colors.title,
          fontSize: 28,
          letterSpacing: -0.4,
          lineHeight: 32,
        }}
      >
        Wszystko zrobione.
      </Text>
      <Text
        style={{
          ...fontSans(500),
          color: tokens.colors.body,
          fontSize: 16,
          marginTop: 6,
        }}
      >
        {count}{" "}
        {count === 1
          ? "zlecenie ukończone"
          : count < 5
            ? "zlecenia ukończone"
            : "zleceń ukończonych"}{" "}
        dziś.
      </Text>
      <Text
        style={{
          ...fontSans(500),
          color: tokens.colors.muted,
          fontSize: 14,
          marginTop: 14,
          lineHeight: 20,
        }}
      >
        Najbliższe: jutro od 8:00. Skontaktuj się z dyspozytorem, jeśli
        potrzebujesz dodatkowych zleceń.
      </Text>
    </View>
  );
}
