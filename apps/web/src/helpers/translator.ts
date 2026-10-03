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
  "Order already in progress": "כבר קיימת הזמנה בתהליך. השלימו את התשלום הקודם או המתינו לסיום העיבוד לפני פתיחת הזמנה חדשה.",
  "Discount code is invalid or inactive": "הקוד לא תקין או לא פעיל",
  "Discount code already exists": "קוד ההנחה כבר קיים",
  "Discount code not found": "קוד ההנחה לא נמצא",
  "The code has already been taken.": "קוד ההנחה כבר קיים",
  "The code field format is invalid.": "קוד ההנחה יכול להכיל אותיות, מספרים, מקף וקו תחתון",
  "Trivia is not live": "הטריוויה לא פעילה כרגע",
  "Trivia is not configured for this event": "לא הוגדרה טריוויה לאירוע",
  "Add at least one trivia question before showing it": "הוסיפו לפחות שאלה אחת לפני ההצגה",
  "Questions cannot be edited while trivia is on screen": "אי אפשר לערוך שאלות בזמן שהטריוויה על המסך",
  "Results time must be after the start time": "מועד התוצאות חייב להיות אחרי מועד ההצגה",
  "Each question needs at least one correct answer": "לכל שאלה צריכה להיות לפחות תשובה נכונה אחת",
  "Invalid or missing trivia session": "החיבור למשחק לא תקין",
  "Trivia player was not found": "השחקן לא נמצא",
  "Could not save the player image": "לא הצלחנו לשמור את התמונה",
  "Answers are closed": "אי אפשר לענות יותר",
} as Record<string, string>;


class Translator {
  getMessage(error: string): string | null {
    return errorsList[error] ?? null;
  }
}

export default new Translator();
