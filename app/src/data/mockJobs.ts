export type JobCategory =
  | "elektryka"
  | "hydraulika"
  | "klimatyzacja"
  | "stolarka"
  | "ogolne";

export type JobStatus = "pending" | "in_progress" | "done";

export type JobPriority = "normal" | "urgent";

export type Job = {
  id: string;
  ticketId: string;
  category: JobCategory;
  address: string;
  unit?: string;
  district?: string;
  description: string;
  scheduledWindow: string;
  scheduledStart: string;
  estimatedDurationMin: number;
  status: JobStatus;
  priority: JobPriority;
  contactName?: string;
  contactPhone?: string;
  travelTimeMin?: number;
  isNew?: boolean;
};

export const categoryLabel: Record<JobCategory, string> = {
  elektryka: "Elektryka",
  hydraulika: "Hydraulika",
  klimatyzacja: "Klimatyzacja",
  stolarka: "Stolarka",
  ogolne: "Ogólne",
};

export const mockJobs: Job[] = [
  {
    id: "j-001",
    ticketId: "ZL-24-0418",
    category: "hydraulika",
    address: "ul. Marszałkowska 142",
    unit: "m. 8",
    district: "Śródmieście",
    description: "Przeciek pod zlewem w łazience na drugim piętrze",
    scheduledWindow: "08:30–09:30",
    scheduledStart: "08:30",
    estimatedDurationMin: 60,
    status: "done",
    priority: "normal",
  },
  {
    id: "j-002",
    ticketId: "ZL-24-0421",
    category: "elektryka",
    address: "Aleja Solidarności 56",
    unit: "m. 12",
    district: "Śródmieście",
    description: "Wymiana włącznika światła w przedpokoju",
    scheduledWindow: "10:00–10:45",
    scheduledStart: "10:00",
    estimatedDurationMin: 45,
    status: "done",
    priority: "normal",
  },
  {
    id: "j-003",
    ticketId: "ZL-24-0425",
    category: "ogolne",
    address: "ul. Powstańców Śląskich 18",
    district: "Bemowo",
    description: "Reset bezpiecznika w piwnicy budynku, zgłoszenie z klatki B",
    scheduledWindow: "11:30–12:00",
    scheduledStart: "11:30",
    estimatedDurationMin: 30,
    status: "done",
    priority: "normal",
  },
  {
    id: "j-004",
    ticketId: "ZL-24-0429",
    category: "hydraulika",
    address: "ul. Targowa 24",
    unit: "m. 4",
    district: "Praga-Północ",
    description: "Wymiana baterii umywalkowej w mieszkaniu lokatora",
    scheduledWindow: "13:00–14:00",
    scheduledStart: "13:00",
    estimatedDurationMin: 60,
    status: "done",
    priority: "normal",
  },
  {
    id: "j-005",
    ticketId: "ZL-24-0432",
    category: "elektryka",
    address: "ul. Mokotowska 73",
    district: "Śródmieście",
    description: "Naprawa oświetlenia w klatce schodowej: parter i pierwsze piętro",
    scheduledWindow: "14:30–15:30",
    scheduledStart: "14:30",
    estimatedDurationMin: 60,
    status: "pending",
    priority: "normal",
    contactName: "Anna Kowalska",
    contactPhone: "+48 601 234 567",
    travelTimeMin: 8,
  },
  {
    id: "j-006",
    ticketId: "ZL-24-0437",
    category: "klimatyzacja",
    address: "ul. Świętokrzyska 30",
    unit: "lok. 8",
    district: "Śródmieście",
    description: "Czyszczenie filtra klimatyzacji w biurze administracji",
    scheduledWindow: "15:45–16:30",
    scheduledStart: "15:45",
    estimatedDurationMin: 45,
    status: "pending",
    priority: "urgent",
    contactName: "Piotr Nowak",
    contactPhone: "+48 602 345 678",
  },
  {
    id: "j-007",
    ticketId: "ZL-24-0440",
    category: "stolarka",
    address: "ul. Górczewska 184",
    unit: "m. 27",
    district: "Bemowo",
    description: "Regulacja drzwi wejściowych, utrudnione zamykanie",
    scheduledWindow: "16:45–17:30",
    scheduledStart: "16:45",
    estimatedDurationMin: 45,
    status: "pending",
    priority: "normal",
    contactName: "Marta Wiśniewska",
  },
  {
    id: "j-008",
    ticketId: "ZL-24-0444",
    category: "hydraulika",
    address: "ul. Belwederska 18A",
    unit: "m. 3",
    district: "Mokotów",
    description: "Sprawdzenie wycieku w łazience: sufit u sąsiada",
    scheduledWindow: "17:45–18:30",
    scheduledStart: "17:45",
    estimatedDurationMin: 45,
    status: "pending",
    priority: "normal",
  },
];

export const newIncomingJob: Job = {
  id: "j-009",
  ticketId: "ZL-24-0449",
  category: "elektryka",
  address: "ul. Wilcza 14",
  unit: "m. 6",
  district: "Śródmieście",
  description: "Awaria oświetlenia w korytarzu, zgłoszenie pilne od lokatora",
  scheduledWindow: "16:00–16:45",
  scheduledStart: "16:00",
  estimatedDurationMin: 45,
  status: "pending",
  priority: "urgent",
  contactName: "Jan Lewandowski",
  contactPhone: "+48 603 456 789",
  isNew: true,
};
