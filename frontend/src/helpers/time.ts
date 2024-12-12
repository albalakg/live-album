class Time {
  convertToLocalTime(givenDate: string): string {
    const utcDate = new Date(givenDate + "Z"); // Appending 'Z' makes it a UTC date

    // Format the date to "YYYY-MM-DD HH:mm:ss" in the local timezone
    const year = utcDate.getFullYear();
    const month = String(utcDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(utcDate.getDate()).padStart(2, "0");
    const hours = String(utcDate.getHours()).padStart(2, "0");
    const minutes = String(utcDate.getMinutes()).padStart(2, "0");
    const seconds = String(utcDate.getSeconds()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }

  extractDate(givenDate: string): string {
    const date = new Date(givenDate + "Z"); // Adding 'Z' ensures it's treated as UTC
  
    // Extract the day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  }

  countdownTimer(targetDate: string): string {
    const targetTime = new Date(targetDate + "Z").getTime(); // UTC time
    const currentTime = Date.now(); // Local time in milliseconds

    const difference = targetTime - currentTime;

    if (difference <= 0) {
      return "00:00:00:00"; // If the target time has passed
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

export default new Time();
