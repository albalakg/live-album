import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "birthday-1",
  "theme": {
    "palette_id": "default",
    "background_type": "LIGHT",
    "font_family": "Varela Round",
    "scale": "M",
    "cover": {
      "stock": "birthday-1/hero"
    },
    "colors": {
      "primary": "#E15A6A",
      "secondary": "#7B4BAA",
      "accent": "#7B4BAA",
      "background": "#FFF6F3",
      "text": "#4A2040"
    }
  },
  "blocks": [
    {
      "id": "hero",
      "type": "HERO_COUNTDOWN",
      "enabled": true,
      "order": 1,
      "data": {
        "title": "תמר בת 12",
        "event_date": "2027-04-22T16:00:00+03:00",
        "kicker": "יום הולדת",
        "venue": "גינת הדוגמה",
        "city": "הרצליה",
        "welcome_heading": "תמר בת 12",
        "welcome": "בואו לחגוג איתה. צלמו, העלו, וכל התמונות יישארו באלבום אחד — גם אחרי שהבלונים יורדים.",
        "date_he": "יום חמישי, 22 באפריל 2027",
        "time_he": "16:00",
        "cover": {
          "stock": "birthday-1/hero"
        }
      }
    },
    {
      "id": "about",
      "type": "ABOUT",
      "enabled": true,
      "order": 2,
      "data": {
        "kicker": "חוגגים",
        "heading": "תמר בת 12",
        "body": "כאן ההורים כותבים כמה מילים על תמר ועל המסיבה. במוק לא המצאנו תחביבים או סיפור בית-ספר.",
        "image": {
          "stock": "art/bl-top"
        },
        "layout": "split"
      }
    },
    {
      "id": "year",
      "type": "MILESTONES",
      "enabled": true,
      "order": 3,
      "data": {
        "kicker": "השנה הזאת",
        "heading": "אבני דרך לדוגמה",
        "note": "המארח ממלא רגעים אמיתיים. השורות כאן הן מקום שמור בלבד.",
        "items": [
          {
            "tag": "01",
            "title": "רגע ראשון",
            "body": "כאן יופיע רגע שהמשפחה תבחר."
          },
          {
            "tag": "02",
            "title": "רגע שני",
            "body": "עוד מקום למילים, לא לביוגרפיה בדויה."
          },
          {
            "tag": "03",
            "title": "המסיבה",
            "body": "ומה מחכה בגינה היום."
          }
        ]
      }
    },
    {
      "id": "schedule",
      "type": "EVENT_TIMELINE",
      "enabled": true,
      "order": 4,
      "data": {
        "heading": "מה קורה היום",
        "kicker": "לו״ז",
        "items": [
          {
            "time": "16:00",
            "label": "קבלת פנים ומשחקים"
          },
          {
            "time": "17:00",
            "label": "עוגה והפתעות"
          },
          {
            "time": "17:45",
            "label": "פעילות בחצר"
          },
          {
            "time": "18:30",
            "label": "סיום ומתנות"
          }
        ]
      }
    },
    {
      "id": "playlist",
      "type": "PLAYLIST",
      "enabled": true,
      "order": 5,
      "data": {
        "heading": "מה שומעים",
        "note": "רשימה לדוגמה, לא פלייליסט אמיתי.",
        "tracks": [
          {
            "song": "שיר פתיחה",
            "art": "הרשימה של תמר",
            "dur": "3:12"
          },
          {
            "song": "ריקוד",
            "art": "הרשימה של תמר",
            "dur": "3:40"
          },
          {
            "song": "עוגה",
            "art": "הרשימה של תמר",
            "dur": "2:55"
          },
          {
            "song": "סיום",
            "art": "הרשימה של תמר",
            "dur": "3:20"
          }
        ]
      }
    },
    {
      "id": "gallery",
      "type": "GALLERY",
      "enabled": true,
      "order": 6,
      "data": {
        "kicker": "צבע",
        "heading": "תמונות לדוגמה",
        "style": "carousel",
        "note": "בלונים, דגלונים וקונפטי. בלי תמונות ילדים.",
        "images": [
          {
            "image": {
              "stock": "art/bl-rich1"
            },
            "caption": "בלונים · דוגמה"
          },
          {
            "image": {
              "stock": "art/bl-rich2"
            },
            "caption": "בלונים · דוגמה"
          },
          {
            "image": {
              "stock": "art/bl-rich3"
            },
            "caption": "בלונים · דוגמה"
          },
          {
            "image": {
              "stock": "art/cf-rich"
            },
            "caption": "קונפטי · דוגמה"
          },
          {
            "image": {
              "stock": "art/dd-rich2"
            },
            "caption": "דגלנים · דוגמה"
          },
          {
            "image": {
              "stock": "art/cf-rich2"
            },
            "caption": "צבע · דוגמה"
          }
        ]
      }
    },
    {
      "id": "join",
      "type": "STEPS",
      "enabled": true,
      "order": 7,
      "data": {
        "kicker": "האלבום",
        "heading": "שלושה צעדים",
        "steps": [
          {
            "n": "01",
            "title": "סורקים",
            "body": "סריקת ה־QR על השולחן, או כניסה מהקישור. בלי הורדת אפליקציה."
          },
          {
            "n": "02",
            "title": "מעלים",
            "body": "תמונה או סרטון ישר מהטלפון, מהמצלמה או מהגלריה."
          },
          {
            "n": "03",
            "title": "רואים חי",
            "body": "הקובץ מופיע באלבום המשותף, ועל המסך באולם אם המארח הפעיל."
          }
        ],
        "button_text": "העלו תמונות",
        "album_text": "צפו באלבום"
      }
    },
    {
      "id": "arrive",
      "type": "MAP",
      "enabled": true,
      "order": 8,
      "data": {
        "kicker": "הגעה",
        "heading": "גינת הדוגמה",
        "location_name": "גינת הדוגמה",
        "city": "הרצליה",
        "note": "סקיצת מפה לדוגמה."
      }
    },
    {
      "id": "gifts",
      "type": "GIFT",
      "enabled": true,
      "order": 9,
      "data": {
        "kicker": "מתנות",
        "heading": "רשימה, אם יש",
        "body": "קישור לדוגמה.",
        "button": "לרשימה (דוגמה)"
      }
    },
    {
      "id": "rsvp",
      "type": "RSVP",
      "enabled": true,
      "order": 10,
      "data": {
        "kicker": "אישור",
        "heading": "תמר מחכה לכם",
        "body": "אישור הגעה ליום ההולדת, בלי שמירה בשרת."
      }
    },
    {
      "id": "faq",
      "type": "FAQ",
      "enabled": true,
      "order": 11,
      "data": {
        "kicker": "שאלות",
        "heading": "להורים",
        "items": [
          {
            "q": "מתי מסיימים?",
            "a": "לפי הלו״ז, בסביבות 18:30. המארח יכול לעדכן."
          },
          {
            "q": "צריך נעליים מיוחדות?",
            "a": "נוח לחצר. אם יש בקשה אחרת — היא תופיע כאן."
          },
          {
            "q": "יש חניה?",
            "a": "ליד הגינה, לפי ההוראות שיתמלאו."
          },
          {
            "q": "אלרגיות ואוכל?",
            "a": "המארח מציין כאן. במוק אין תפריט בדוי."
          }
        ]
      }
    },
    {
      "id": "snapshare_cta",
      "type": "SNAPSHARE_CTA",
      "enabled": true,
      "order": 12,
      "data": {
        "button_text": "העלו תמונות",
        "subtitle": "בלי אפליקציה"
      }
    },
    {
      "id": "footer",
      "type": "FOOTER",
      "enabled": true,
      "order": 13,
      "data": {
        "note": "העמוד הזה נוצר ב־SnapShare. האורחים מעלים בלי אפליקציה, והתמונות מופיעות באלבום החי."
      }
    }
  ]
};

export default hubConfig;
