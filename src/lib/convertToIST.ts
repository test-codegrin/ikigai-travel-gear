// utils/convertToIST.ts
export function convertToIST(
  input?: string,               // <-- make input optional
  showTime: boolean = true
): string {
  if (!input || typeof input !== "string") {
    // return fallback value instead of crashing
    return showTime ? "N/A" : "Invalid Date";
  }

  // Remove wrong Z (timestamp is actually Mountain Time)
  const noZ = input.replace("Z", "");
  const mountainTagged = `${noZ}-07:00`; // Mountain Time (UTC-7)

  // Create date from Mountain Time
  const mountainDate = new Date(mountainTagged);

  // Convert to IST
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const ist = new Intl.DateTimeFormat("en-IN", options).format(mountainDate);
  const [datePart, timePart] = ist.split(", ");
  const [dd, mm, yyyy] = datePart.split("/");
  const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];
  // If only date needed
  if (!showTime) {
  
    return `${dd} ${months[parseInt(mm) - 1]} ${yyyy}`;
  }

  return `${dd} ${months[parseInt(mm) - 1]} ${timePart}`;
}
