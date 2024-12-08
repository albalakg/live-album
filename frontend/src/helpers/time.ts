class Time {
  convertToLocalTime(serverDate: string): string {
    const utcDate = new Date(serverDate + "Z"); // Appending 'Z' makes it a UTC date

    // Format the date to "YYYY-MM-DD HH:mm:ss" in the local timezone
    const year = utcDate.getFullYear();
    const month = String(utcDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(utcDate.getDate()).padStart(2, "0");
    const hours = String(utcDate.getHours()).padStart(2, "0");
    const minutes = String(utcDate.getMinutes()).padStart(2, "0");
    const seconds = String(utcDate.getSeconds()).padStart(2, "0");

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }
}

export default new Time();
