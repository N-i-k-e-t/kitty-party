export type DayPart = "morning" | "afternoon" | "evening" | "night";

export function getDayPart(date = new Date()): DayPart {
  const h = date.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

export function greetingFor(dayPart: DayPart): string {
  switch (dayPart) {
    case "morning":
      return "Good morning";
    case "afternoon":
      return "Good afternoon";
    case "evening":
      return "Good evening";
    default:
      return "Hello";
  }
}
