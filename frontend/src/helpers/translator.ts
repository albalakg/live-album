const errorsList = {
  "The email has already been taken.": "כתובת המייל כבר קיימת במערכת",
  "The email field is required.": "כתובת המייל חסרה",
  "The token field is required.": "המפתח הייחודי חסר",
  "Password is incorrect": "הסיסמה הישנה אינה תקינה",
  "The full name field is required.": "השם מלא חסר",
  "The text field is required.": "השדה טקסט מלא חסר",
  "Reset Password request not found": "הלינק הזה לאיפוס סיסמה, כבר הינו זמין, נסו לשלוח לינק נוסף",
  "The starts at field must be a date after now.": "זמן תחילת האירוע חייב להיות גדול מעכשיו",
  "The image field must be a file of type: jpeg, png, jpg, webp.": "השדה תמונה חייב להיות מהבאים: jpeg/png/jpg/webp",
  "The image field must be a file of type: image/jpeg, image/png, image/webp.": "השדה תמונה חייב להיות מהבאים: jpeg/png/jpg/webp",
  "Can't update new password that matches the old password": "הסיסמה החדשה אינה יכולה להיות זהה לסיסמה הישנה",
  "Password is required and must be minimum 8 characters, at least one lowercase letter, uppercase letter and one number": "הסיסמה החדשה חייבת להכיל 8-40 תווים, אות גדולה, אות קטנה ומספר",
} as Record<string, string>;


class Translator {
  getMessage(error: string): string | null {
    return errorsList[error] ?? null;
  }
}

export default new Translator();
