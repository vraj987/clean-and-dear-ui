export type InspectionCustomer = {
  id: string;
  name: string;
  mobile: string;
  address: string;
  city: string;
  brand: string;
  model: string;
  variant: string;
  deviceDetails: string;
  visitStatus: "New visit" | "Follow up";
  requestType: "Sell" | "Exchange";
  requestedPhone?: {
    brand: string;
    model: string;
    variant: string;
  };
};

// Sample customer and device details for the UI-only inspection workflow.
export const inspectionCustomers: InspectionCustomer[] = [
  {
    id: "cust-101",
    name: "Aarav Patel",
    mobile: "98765 43210",
    address: "12, Shilp Residency, near Science City Road",
    city: "Ahmedabad, Gujarat 380060",
    brand: "Apple",
    model: "iPhone 15 Pro",
    variant: "256GB · Natural Titanium",
    deviceDetails: "Purchased 18 Aug 2025 · Invoice available",
    visitStatus: "New visit",
    requestType: "Exchange",
    requestedPhone: {
      brand: "Apple",
      model: "iPhone 17 Pro",
      variant: "256GB · Desert Titanium",
    },
  },
  {
    id: "cust-102",
    name: "Mira Shah",
    mobile: "98250 13579",
    address: "B-304, Riverfront Heights, Paldi",
    city: "Ahmedabad, Gujarat 380007",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    variant: "512GB · Titanium Gray",
    deviceDetails: "Purchased 04 Feb 2025 · Invoice available",
    visitStatus: "Follow up",
    requestType: "Sell",
  },
  {
    id: "cust-103",
    name: "Dev Mehta",
    mobile: "99090 24680",
    address: "17, Orchid Avenue, Vesu",
    city: "Surat, Gujarat 395007",
    brand: "Google",
    model: "Pixel 9 Pro",
    variant: "256GB · Obsidian",
    deviceDetails: "Purchased 22 Nov 2024 · Invoice available",
    visitStatus: "New visit",
    requestType: "Exchange",
    requestedPhone: {
      brand: "Google",
      model: "Pixel 10 Pro",
      variant: "256GB · Moonstone",
    },
  },
];

export const inspectionStatusOptions = ["Pass", "Fail", "Not Available"] as const;
export type InspectionStatus = (typeof inspectionStatusOptions)[number];

export const physicalChecks = [
  "Display",
  "Touch response",
  "Frame",
  "Back panel",
  "Camera glass",
  "Camera",
  "Flash",
  "Speaker",
  "Microphone",
  "Charging port",
  "Buttons",
  "Face ID / fingerprint",
  "Wi-Fi",
  "Bluetooth",
  "SIM slot",
  "Network",
  "Battery health",
];

export const damageChecks = [
  "Screen crack",
  "Body damage",
  "Dent",
  "Water damage",
  "Camera damage",
  "Port damage",
  "Missing parts",
];

export const repairChecks = [
  "Screen replaced?",
  "Battery replaced?",
  "Motherboard repaired or replaced?",
  "Camera replaced?",
  "Other repair or replacement?",
];

export const accessoryChecks = [
  "Original bill",
  "Original box",
  "Charger",
  "Cable",
  "Other accessories",
];
