import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "barmitzvah-1",
  "theme": {
    "palette_id": "default",
    "background_type": "LIGHT",
    "font_family": "Varela Round",
    "scale": "M",
    "cover": {
      "stock": "barmitzvah-1/hero"
    },
    "colors": {
      "primary": "#1F7A72",
      "secondary": "#C9A36A",
      "accent": "#C9A36A",
      "background": "#F3F6F0",
      "text": "#1A3A36"
    }
  },
  "blocks": [
    {
      "id": "hero",
      "type": "HERO_COUNTDOWN",
      "enabled": true,
      "order": 1,
      "data": {
        "title": "בר המצווה של יונתן",
        "event_date": "2027-03-18T17:30:00+02:00",
        "kicker": "חוגגים את",
        "venue": "אולם הדוגמה",
        "city": "רעננה",
        "welcome_heading": "משפחה וחברים",
        "welcome": "שמחים שאתם כאן עם יונתן. העלו תמונות מהחגיגה — הן יופיעו באלבום החי לכולם.",
        "date_he": "יום חמישי, 18 במרץ 2027",
        "time_he": "17:30",
        "cover": {
          "stock": "barmitzvah-1/hero"
        }
      }
    },
    {
      "id": "about",
      "type": "ABOUT",
      "enabled": true,
      "order": 2,
      "data": {
        "kicker": "לכבוד",
        "heading": "יונתן",
        "body": "כאן המשפחה כותבת כמה מילים על יונתן — מי הוא, מה הוא אוהב, למה הערב הזה משמח אותם. במוק אין ביוגרפיה בדויה, רק המקום לטקסט.",
        "image": {
          "stock": "art/tl-frame"
        },
        "layout": "split"
      }
    },
    {
      "id": "parasha",
      "type": "ABOUT",
      "enabled": true,
      "order": 3,
      "data": {
        "kicker": "עלייה לתורה",
        "heading": "פרשת הקריאה",
        "body": "כאן יופיעו שם הפרשה וההפטרה, כשהמשפחה תמלא אותן. לא בחרנו פרשה בשביל התאריך שבדוגמה.",
        "layout": "center"
      }
    },
    {
      "id": "family",
      "type": "PEOPLE",
      "enabled": true,
      "order": 4,
      "data": {
        "kicker": "יחד",
        "heading": "המשפחה",
        "note": "שמות וראשי תיבות לדוגמה בלבד, בלי תמונות.",
        "items": [
          {
            "initials": "א",
            "name": "אמא",
            "role": "שם לדוגמה"
          },
          {
            "initials": "א",
            "name": "אבא",
            "role": "שם לדוגמה"
          },
          {
            "initials": "א",
            "name": "אחים",
            "role": "אם יש, יופיעו כאן"
          }
        ]
      }
    },
    {
      "id": "schedule",
      "type": "EVENT_TIMELINE",
      "enabled": true,
      "order": 5,
      "data": {
        "heading": "סדר היום",
        "kicker": "לו״ז",
        "items": [
          {
            "time": "17:30",
            "label": "קבלת פנים"
          },
          {
            "time": "18:15",
            "label": "עלייה לתורה",
            "description": "בבית הכנסת הצמוד לאולם"
          },
          {
            "time": "19:30",
            "label": "חגיגה וארוחה"
          },
          {
            "time": "21:00",
            "label": "ריקודים ומשחקים"
          }
        ]
      }
    },
    {
      "id": "party",
      "type": "CARDS",
      "enabled": true,
      "order": 6,
      "data": {
        "kicker": "אחר כך",
        "heading": "החגיגה",
        "items": [
          {
            "title": "רחבה",
            "body": "מוזיקה וריקודים באולם, אחרי הארוחה."
          },
          {
            "title": "משחקים",
            "body": "אם המשפחה מזמינה פעילות — היא תופיע כאן."
          },
          {
            "title": "טריוויה",
            "body": "אפשר לפתוח משחק קצר לכבוד יונתן, על המסך."
          }
        ]
      }
    },
    {
      "id": "gallery",
      "type": "GALLERY",
      "enabled": true,
      "order": 7,
      "data": {
        "kicker": "אווירה",
        "heading": "תמונות לדוגמה",
        "style": "grid",
        "note": "נייר גזור, בלונים וקונפטי — עיטור בלבד, בלי תמונות ילדים.",
        "images": [
          {
            "image": {
              "stock": "art/tl-rich1"
            },
            "caption": "נייר גזור · דוגמה"
          },
          {
            "image": {
              "stock": "art/tl-rich2"
            },
            "caption": "טורקיז · דוגמה"
          },
          {
            "image": {
              "stock": "art/tl-frame"
            },
            "caption": "מסגרת · דוגמה"
          },
          {
            "image": {
              "stock": "art/bl-rich1"
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
              "stock": "art/dd-rich1"
            },
            "caption": "ציור · דוגמה"
          }
        ]
      }
    },
    {
      "id": "join",
      "type": "STEPS",
      "enabled": true,
      "order": 8,
      "data": {
        "kicker": "האלבום",
        "heading": "שלושה צעדים, בלי אפליקציה",
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
      "order": 9,
      "data": {
        "kicker": "הגעה",
        "heading": "אולם הדוגמה",
        "location_name": "אולם הדוגמה",
        "city": "רעננה",
        "note": "סקיצת מפה לדוגמה."
      }
    },
    {
      "id": "gifts",
      "type": "GIFT",
      "enabled": true,
      "order": 10,
      "data": {
        "kicker": "מתנות",
        "heading": "רשימת מתנות",
        "body": "המשפחה מדביקה כאן קישור לרשימה, אם יש. במוק הקישור לדוגמה בלבד.",
        "button": "לרשימה (דוגמה)"
      }
    },
    {
      "id": "rsvp",
      "type": "RSVP",
      "enabled": true,
      "order": 11,
      "data": {
        "kicker": "אישור",
        "heading": "מגיעים לחגוג?",
        "body": "אישור הגעה לדוגמה, בלי שמירה בשרת."
      }
    },
    {
      "id": "faq",
      "type": "FAQ",
      "enabled": true,
      "order": 12,
      "data": {
        "kicker": "שאלות",
        "heading": "כדאי לדעת",
        "items": [
          {
            "q": "יש חניה?",
            "a": "כן, לפי שילוט האולם — המשפט מתחלף אצל המארח."
          },
          {
            "q": "מה לובשים?",
            "a": "חגיגי ונוח. אפשר לפרט חולצה לבנה לעלייה לתורה."
          },
          {
            "q": "האם הערב מתאים לילדים?",
            "a": "בר המצווה פתוח למשפחה. הפירוט אצל המארח."
          },
          {
            "q": "איך מעבירים מתנה?",
            "a": "רשימה או קופה, בסעיף המתנות."
          }
        ]
      }
    },
    {
      "id": "snapshare_cta",
      "type": "SNAPSHARE_CTA",
      "enabled": true,
      "order": 13,
      "data": {
        "button_text": "העלו תמונות",
        "subtitle": "בלי אפליקציה"
      }
    },
    {
      "id": "footer",
      "type": "FOOTER",
      "enabled": true,
      "order": 14,
      "data": {
        "note": "העמוד הזה נוצר ב־SnapShare. האורחים מעלים בלי אפליקציה, והתמונות מופיעות באלבום החי."
      }
    }
  ]
};

export default hubConfig;
