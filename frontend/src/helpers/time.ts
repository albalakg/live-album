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
}

export default new Time();
