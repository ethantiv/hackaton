import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../components/Icon";
import { BottomCTA } from "../components/BottomCTA";
import { useAppState } from "../state/AppState";
import { fontMono, fontSans, tokens } from "../design/tokens";
import type { Job } from "../data/mockJobs";

export function CaptureScreen({ job }: { job: Job }) {
  const { goBack, addPhoto, completeJob } = useAppState();
  const [photoTaken, setPhotoTaken] = useState(false);
  const [description, setDescription] = useState("");
  const insets = useSafeAreaInsets();

  const canSave = photoTaken && description.trim().length >= 3;

  const onSaveAndComplete = () => {
    if (!canSave) return;
    addPhoto(job.id, description.trim());
    completeJob(job.id);
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: tokens.colors.cream }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            paddingTop: 8,
            paddingBottom: 12,
            paddingHorizontal: 8,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: tokens.colors.cream,
          }}
        >
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Anuluj"
            hitSlop={8}
            style={({ pressed }) => ({
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed
                ? tokens.colors["mist-deep"]
                : "transparent",
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
              Raport zlecenia
            </Text>
            <Text
              style={{
                ...fontMono(500),
                color: tokens.colors.title,
                fontSize: 15,
                marginTop: 1,
              }}
            >
              {job.ticketId}
            </Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              ...fontSans(700),
              color: tokens.colors.title,
              fontSize: 24,
              lineHeight: 30,
              letterSpacing: -0.4,
              marginTop: 8,
              marginBottom: 4,
            }}
          >
            Zdjęcie + krótki opis
          </Text>
          <Text
            style={{
              ...fontSans(500),
              color: tokens.colors.muted,
              fontSize: 14,
              lineHeight: 20,
              marginBottom: 16,
            }}
          >
            Pokaż wykonaną pracę i opisz jednym zdaniem co zostało zrobione.
          </Text>

          <Pressable
            onPress={() => setPhotoTaken((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={photoTaken ? "Zdjęcie zrobione" : "Zrób zdjęcie"}
            style={({ pressed }) => ({
              backgroundColor: photoTaken
                ? tokens.colors.mist
                : tokens.colors["mist-deep"],
              borderRadius: 20,
              borderWidth: 2,
              borderColor: photoTaken
                ? tokens.colors["status-done"]
                : tokens.colors.border,
              borderStyle: photoTaken ? "solid" : "dashed",
              height: 240,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.85 : 1,
              padding: 16,
            })}
          >
            {photoTaken ? (
              <>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: tokens.colors["status-done"],
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Icon
                    name="check"
                    size={36}
                    color={tokens.colors["ink-on-signal"]}
                    strokeWidth={2.8}
                  />
                </View>
                <Text
                  style={{
                    ...fontSans(700),
                    color: tokens.colors.title,
                    fontSize: 18,
                  }}
                >
                  Zdjęcie zrobione
                </Text>
                <Text
                  style={{
                    ...fontSans(500),
                    color: tokens.colors.muted,
                    fontSize: 13,
                    marginTop: 4,
                    textAlign: "center",
                  }}
                >
                  Stuknij ponownie, żeby zrobić jeszcze raz.
                </Text>
              </>
            ) : (
              <>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: tokens.colors.cream,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Icon
                    name="plus"
                    size={32}
                    color={tokens.colors.title}
                    strokeWidth={2.4}
                  />
                </View>
                <Text
                  style={{
                    ...fontSans(700),
                    color: tokens.colors.title,
                    fontSize: 18,
                  }}
                >
                  Stuknij, żeby zrobić zdjęcie
                </Text>
                <Text
                  style={{
                    ...fontSans(500),
                    color: tokens.colors.muted,
                    fontSize: 13,
                    marginTop: 4,
                    textAlign: "center",
                  }}
                >
                  Pokaż naprawiony element przed zamknięciem zlecenia.
                </Text>
              </>
            )}
          </Pressable>

          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                ...fontSans(700),
                color: tokens.colors.title,
                fontSize: 13,
                letterSpacing: 0.1,
                marginBottom: 8,
              }}
            >
              Krótki opis ({description.trim().length}/140)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              maxLength={140}
              multiline
              placeholder="Np. Wymieniono uszczelkę pod zlewem, wyciek ustał."
              placeholderTextColor={tokens.colors.muted}
              accessibilityLabel="Krótki opis wykonanej pracy"
              style={{
                ...fontSans(400),
                fontSize: 16,
                lineHeight: 22,
                color: tokens.colors.title,
                backgroundColor: tokens.colors.mist,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: tokens.colors["border-soft"],
                padding: 14,
                minHeight: 96,
                textAlignVertical: "top",
              }}
            />
          </View>

          {!canSave && (
            <Text
              style={{
                ...fontSans(500),
                color: tokens.colors.muted,
                fontSize: 13,
                marginTop: 12,
                lineHeight: 18,
              }}
            >
              Żeby zakończyć zlecenie, dodaj zdjęcie i co najmniej trzy znaki opisu.
            </Text>
          )}
        </ScrollView>

        <View
          style={{
            opacity: canSave ? 1 : 0.5,
            paddingBottom: insets.bottom > 0 ? 0 : 8,
          }}
        >
          <BottomCTA
            label="Zapisz i zakończ zlecenie"
            iconName="check"
            onPress={onSaveAndComplete}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
