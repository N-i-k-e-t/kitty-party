import type { Festival } from "@/lib/types";

export const festivals: Festival[] = [
  { id: "diwali", name: "Diwali", month: 10, regionNote: "Pan-India" },
  { id: "diwali-late", name: "Diwali week", month: 11, regionNote: "Pan-India" },
  { id: "holi", name: "Holi", month: 3, regionNote: "North & West" },
  { id: "navratri", name: "Navratri", month: 10, regionNote: "Gujarat & Mumbai" },
  { id: "pongal", name: "Pongal", month: 1, regionNote: "South India" },
  { id: "rakhi", name: "Raksha Bandhan", month: 8, regionNote: "Pan-India" },
  { id: "eid", name: "Eid", month: 4, regionNote: "Pan-India" },
  { id: "christmas", name: "Christmas", month: 12, regionNote: "Metro cities" },
  { id: "newyear", name: "New Year’s Eve", month: 12, day: 31, regionNote: "Pan-India" },
];
