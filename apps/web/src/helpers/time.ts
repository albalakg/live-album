class Time {
  private parseUtcDateString(givenDate: string): Date | null {
    if (!givenDate?.trim()) return null;

    const trimmed = givenDate.trim();

    // Already formatted as local YYYY/MM/DD ...
    if (/^\d{4}\/\d{2}\/\d{2}/.test(trimmed)) {
      const normalized = trimmed.replace(/\//g, "-").replace(" ", "T");
      const date = new Date(normalized);
      return isNaN(date.getTime()) ? null : date;
    }

    // ISO string with explicit timezone (Z or offset)
    if (/[Zz]$/.test(trimmed) || /[+-]\d{2}:?\d{2}$/.test(trimmed)) {
      const date = new Date(trimmed);
      return isNaN(date.getTime()) ? null : date;
    }

    // Naive datetime from API — treat as UTC
    const isoLike = trimmed.includes("T")
      ? trimmed
      : trimmed.replace(" ", "T");
    const date = new Date(`${isoLike}Z`);
    return isNaN(date.getTime()) ? null : date;
  }

  convertToLocalTime(givenDate: string): string {
    const utcDate = this.parseUtcDateString(givenDate);
    if (!utcDate) return "";

    const year = utcDate.getFullYear();
    const month = String(utcDate.getMonth() + 1).padStart(2, "0");
    const day = String(utcDate.getDate()).padStart(2, "0");
    const hours = String(utcDate.getHours()).padStart(2, "0");
    const minutes = String(utcDate.getMinutes()).padStart(2, "0");
    const seconds = String(utcDate.getSeconds()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }

  extractDate(givenDate: string): string {
    const date = this.parseUtcDateString(givenDate);
    if (!date) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  countdownTimer(targetDate: string): string {
    const targetTime = new Date(targetDate).getTime();
    const currentTime = Date.now();

    const difference = targetTime - currentTime;

    if (difference <= 0) {
      return "00:00:00:00"; // If the target time has passed
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return `${String(days).padStart(2, "0")}:${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  addDays(date: string, days: number): string {
    const [datePart, timePart] = date.split(" ");
    const [year, month, day] = datePart.split("/").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);
    const originalDate = new Date(year, month - 1, day, hour, minute, second);
    originalDate.setDate(originalDate.getDate() + days);
    return this.formatDate(originalDate);
  }

  addHours(date: string, hours: number): string {
    const [datePart, timePart] = date.split(" ");
    const [year, month, day] = datePart.split("/").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);
    const originalDate = new Date(year, month - 1, day, hour, minute, second);
    originalDate.setHours(originalDate.getHours() + hours);
    return this.formatDate(originalDate);
  }

  addMonths(date: string, months: number): string {
    const [datePart, timePart] = date.split(" ");
    const [year, month, day] = datePart.split("/").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);
    const originalDate = new Date(year, month - 1, day, hour, minute, second);
    originalDate.setMonth(originalDate.getMonth() + months);
    return this.formatDate(originalDate);
  }

  formatDate(originalDate: Date): string {
    const newYear = originalDate.getFullYear();
    const newMonth = String(originalDate.getMonth() + 1).padStart(2, "0");
    const newDay = String(originalDate.getDate()).padStart(2, "0");
    const newHour = String(originalDate.getHours()).padStart(2, "0");
    const newMinute = String(originalDate.getMinutes()).padStart(2, "0");
    const newSecond = String(originalDate.getSeconds()).padStart(2, "0");

    return `${newYear}/${newMonth}/${newDay} ${newHour}:${newMinute}:${newSecond}`;
  }

  toUTC(date: string | Date): string {
    if(typeof date !== "string") {
      date = date.toISOString();
    }
    
    if (!date) return date;

    // 1. Replace slashes with dashes
    let normalized = date.replace(/\//g, "-");

    // 2. If there's a space, replace with "T"
    normalized = normalized.includes(" ")
      ? normalized.replace(" ", "T")
      : normalized;

    // 3. Parse as local time
    const d = new Date(normalized);
    if (isNaN(d.getTime())) throw new Error(`Invalid date: ${date}`);

    // 4. Return ISO string (UTC)
    return d.toISOString(); // e.g. "2025-08-22T00:29:00.000Z"
  }
}

export default new Time();
