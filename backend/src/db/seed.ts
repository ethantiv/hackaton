import type { Database } from "bun:sqlite";
import { randomUUID } from "node:crypto";
import { hashPassword } from "../auth/passwords";
import { getDb } from "./client";
import { runMigrations } from "./migrate";

const PASSWORD = "test1234";

type JobInput = Omit<
  JobSeed,
  "id" | "technician_id" | "created_at" | "updated_at" | "is_new" | "unit" | "contact_name" | "contact_phone" | "travel_time_min"
> &
  Partial<Pick<JobSeed, "is_new" | "unit" | "contact_name" | "contact_phone" | "travel_time_min">>;

type Tech = {
  email: string;
  display_name: string;
  specialization: string;
  jobs: Array<Omit<JobSeed, "technician_id" | "id" | "created_at" | "updated_at">>;
};

type JobSeed = {
  id: string;
  ticket_id: string;
  technician_id: string;
  category: string;
  address: string;
  unit: string | null;
  district: string | null;
  description: string;
  scheduled_window: string;
  scheduled_start: string;
  estimated_duration_min: number;
  status: "pending" | "in_progress" | "done";
  priority: "normal" | "urgent";
  contact_name: string | null;
  contact_phone: string | null;
  travel_time_min: number | null;
  is_new: 0 | 1;
  created_at: number;
  updated_at: number;
};

const TECHS: Tech[] = [
  {
    email: "marek@firma.pl",
    display_name: "Marek Kowalski",
    specialization: "elektryk",
    jobs: makeMarekJobs(),
  },
  {
    email: "anna@firma.pl",
    display_name: "Anna Nowak",
    specialization: "hydraulik",
    jobs: makeAnnaJobs(),
  },
  {
    email: "piotr@firma.pl",
    display_name: "Piotr Wójcik",
    specialization: "klimatyzacja",
    jobs: makePiotrJobs(),
  },
  {
    email: "kasia@firma.pl",
    display_name: "Katarzyna Zielińska",
    specialization: "ogolne",
    jobs: makeKasiaJobs(),
  },
];

export async function seed(db: Database = getDb()): Promise<void> {
  runMigrations(db);
  const hash = await hashPassword(PASSWORD);
  const now = Date.now();

  const insertUser = db.prepare(
    `INSERT OR IGNORE INTO users (id, email, password_hash, display_name, specialization, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const insertJob = db.prepare(
    `INSERT OR IGNORE INTO jobs (id, ticket_id, technician_id, category, address, unit, district,
       description, scheduled_window, scheduled_start, estimated_duration_min, status, priority,
       contact_name, contact_phone, travel_time_min, is_new, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  );

  for (const tech of TECHS) {
    const techId = `u-${tech.email.split("@")[0]}`;
    insertUser.run(techId, tech.email, hash, tech.display_name, tech.specialization, now);
    for (const job of tech.jobs) {
      insertJob.run(
        randomUUID(),
        job.ticket_id,
        techId,
        job.category,
        job.address,
        job.unit ?? null,
        job.district ?? null,
        job.description,
        job.scheduled_window,
        job.scheduled_start,
        job.estimated_duration_min,
        job.status,
        job.priority,
        job.contact_name ?? null,
        job.contact_phone ?? null,
        job.travel_time_min ?? null,
        job.is_new,
        now,
        now,
      );
    }
  }
}

// --- Job templates per technician ---

function makeMarekJobs() {
  // 3 done + 5 pending — `default` scenario
  return [
    j({ ticket_id: "ZL-26-0418", category: "elektryka", address: "ul. Marszałkowska 142",
        unit: "m. 8", district: "Śródmieście", description: "Wymiana włącznika światła",
        scheduled_window: "08:30–09:30", scheduled_start: "08:30", estimated_duration_min: 60,
        status: "done", priority: "normal" }),
    j({ ticket_id: "ZL-26-0421", category: "elektryka", address: "Aleja Solidarności 56",
        unit: "m. 12", district: "Śródmieście", description: "Reset bezpiecznika w piwnicy",
        scheduled_window: "10:00–10:45", scheduled_start: "10:00", estimated_duration_min: 45,
        status: "done", priority: "normal" }),
    j({ ticket_id: "ZL-26-0425", category: "elektryka", address: "ul. Powstańców Śląskich 18",
        district: "Bemowo", description: "Naprawa oświetlenia w klatce schodowej",
        scheduled_window: "11:30–12:00", scheduled_start: "11:30", estimated_duration_min: 30,
        status: "done", priority: "normal" }),
    j({ ticket_id: "ZL-26-0432", category: "elektryka", address: "ul. Mokotowska 73",
        district: "Śródmieście", description: "Naprawa oświetlenia, parter i pierwsze piętro",
        scheduled_window: "14:30–15:30", scheduled_start: "14:30", estimated_duration_min: 60,
        status: "pending", priority: "normal", contact_name: "Anna Kowalska",
        contact_phone: "+48 601 234 567", travel_time_min: 8 }),
    j({ ticket_id: "ZL-26-0437", category: "elektryka", address: "ul. Świętokrzyska 30",
        unit: "lok. 8", district: "Śródmieście", description: "Sprawdzenie tablicy rozdzielczej",
        scheduled_window: "15:45–16:30", scheduled_start: "15:45", estimated_duration_min: 45,
        status: "pending", priority: "urgent", contact_name: "Piotr Nowak",
        contact_phone: "+48 602 345 678" }),
    j({ ticket_id: "ZL-26-0440", category: "elektryka", address: "ul. Górczewska 184",
        unit: "m. 27", district: "Bemowo", description: "Wymiana gniazdka w kuchni",
        scheduled_window: "16:45–17:30", scheduled_start: "16:45", estimated_duration_min: 45,
        status: "pending", priority: "normal", contact_name: "Marta Wiśniewska" }),
    j({ ticket_id: "ZL-26-0444", category: "elektryka", address: "ul. Belwederska 18A",
        unit: "m. 3", district: "Mokotów", description: "Awaria oświetlenia w kuchni",
        scheduled_window: "17:45–18:30", scheduled_start: "17:45", estimated_duration_min: 45,
        status: "pending", priority: "normal" }),
    j({ ticket_id: "ZL-26-0448", category: "elektryka", address: "ul. Wilcza 14",
        unit: "m. 6", district: "Śródmieście", description: "Sprawdzenie instalacji po awarii",
        scheduled_window: "18:45–19:30", scheduled_start: "18:45", estimated_duration_min: 45,
        status: "pending", priority: "normal" }),
  ];
}

function makeAnnaJobs() {
  // 6 jobs, 1 done + 5 pending — `offline` scenario (client-side flag)
  return [
    j({ ticket_id: "ZL-26-0501", category: "hydraulika", address: "ul. Targowa 24",
        unit: "m. 4", district: "Praga-Północ", description: "Wymiana baterii umywalkowej",
        scheduled_window: "09:00–10:00", scheduled_start: "09:00", estimated_duration_min: 60,
        status: "done", priority: "normal" }),
    j({ ticket_id: "ZL-26-0502", category: "hydraulika", address: "ul. Grochowska 12",
        unit: "m. 22", district: "Praga-Południe", description: "Przeciek pod zlewem",
        scheduled_window: "10:30–11:30", scheduled_start: "10:30", estimated_duration_min: 60,
        status: "pending", priority: "urgent", contact_name: "Tomasz Lis" }),
    j({ ticket_id: "ZL-26-0503", category: "hydraulika", address: "ul. Wileńska 5",
        district: "Praga-Północ", description: "Niedrożność kanalizacji",
        scheduled_window: "12:00–13:00", scheduled_start: "12:00", estimated_duration_min: 60,
        status: "pending", priority: "normal" }),
    j({ ticket_id: "ZL-26-0504", category: "hydraulika", address: "al. Waszyngtona 80",
        unit: "m. 11", district: "Praga-Południe", description: "Wymiana spłuczki",
        scheduled_window: "13:30–14:15", scheduled_start: "13:30", estimated_duration_min: 45,
        status: "pending", priority: "normal" }),
    j({ ticket_id: "ZL-26-0505", category: "hydraulika", address: "ul. Kobielska 23",
        district: "Praga-Południe", description: "Awaria pompy ciepłej wody",
        scheduled_window: "14:45–16:00", scheduled_start: "14:45", estimated_duration_min: 75,
        status: "pending", priority: "urgent" }),
    j({ ticket_id: "ZL-26-0506", category: "hydraulika", address: "ul. Stalowa 18",
        unit: "m. 2", district: "Praga-Północ", description: "Wymiana zaworu pod zlewem",
        scheduled_window: "16:30–17:15", scheduled_start: "16:30", estimated_duration_min: 45,
        status: "pending", priority: "normal" }),
  ];
}

function makePiotrJobs() {
  // 5 jobs, 1 with is_new = 1 — `new` scenario
  return [
    j({ ticket_id: "ZL-26-0601", category: "klimatyzacja", address: "ul. Domaniewska 50",
        district: "Mokotów", description: "Czyszczenie filtra klimatyzacji",
        scheduled_window: "09:30–10:15", scheduled_start: "09:30", estimated_duration_min: 45,
        status: "done", priority: "normal" }),
    j({ ticket_id: "ZL-26-0602", category: "klimatyzacja", address: "ul. Puławska 145",
        unit: "lok. 4", district: "Mokotów", description: "Naprawa skraplacza zewnętrznego",
        scheduled_window: "11:00–12:30", scheduled_start: "11:00", estimated_duration_min: 90,
        status: "in_progress", priority: "normal" }),
    j({ ticket_id: "ZL-26-0603", category: "klimatyzacja", address: "ul. Wilcza 14",
        unit: "m. 6", district: "Śródmieście", description: "Awaria klimatyzacji w korytarzu, zgłoszenie pilne",
        scheduled_window: "16:00–16:45", scheduled_start: "16:00", estimated_duration_min: 45,
        status: "pending", priority: "urgent", contact_name: "Jan Lewandowski",
        contact_phone: "+48 603 456 789", is_new: 1 }),
    j({ ticket_id: "ZL-26-0604", category: "klimatyzacja", address: "ul. Górnośląska 7",
        district: "Śródmieście", description: "Roczny przegląd serwisowy",
        scheduled_window: "13:30–15:00", scheduled_start: "13:30", estimated_duration_min: 90,
        status: "pending", priority: "normal" }),
    j({ ticket_id: "ZL-26-0605", category: "klimatyzacja", address: "ul. Hoża 27",
        unit: "lok. 1", district: "Śródmieście", description: "Wymiana filtra HEPA",
        scheduled_window: "17:00–17:45", scheduled_start: "17:00", estimated_duration_min: 45,
        status: "pending", priority: "normal" }),
  ];
}

function makeKasiaJobs() {
  // 8 jobs, all done — `empty` scenario
  return [
    "08:00", "09:00", "10:00", "11:00", "12:30", "13:30", "14:30", "15:30",
  ].map((start, i) =>
    j({ ticket_id: `ZL-26-070${i + 1}`, category: "ogolne", address: `ul. Modlińska ${10 + i}`,
        district: "Białołęka", description: `Konserwacja ogólna nr ${i + 1}`,
        scheduled_window: `${start}–${addMin(start, 45)}`, scheduled_start: start,
        estimated_duration_min: 45, status: "done", priority: "normal" }),
  );
}

function addMin(hhmm: string, min: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + min;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function j(input: JobInput) {
  return {
    ...input,
    unit: input.unit ?? null,
    contact_name: input.contact_name ?? null,
    contact_phone: input.contact_phone ?? null,
    travel_time_min: input.travel_time_min ?? null,
    is_new: (input.is_new ?? 0) as 0 | 1,
  } as Omit<JobSeed, "technician_id" | "id" | "created_at" | "updated_at">;
}

if (import.meta.main) {
  await seed();
  console.log("Seed complete.");
}
