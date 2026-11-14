import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "festival-2",
  "theme": {
    "palette_id": "default",
    "background_type": "LIGHT",
    "font_family": "Frank Ruhl Libre",
    "scale": "M",
    "cover": {
      "stock": "festival-2/hero"
    },
    "colors": {
      "primary": "#8A5A32",
      "secondary": "#C4894A",
      "accent": "#C4894A",
      "background": "#EDE4D4",
      "text": "#2A1C14"
    }
  },
  "blocks": [
    {
      "id": "hero",
      "type": "HERO_COUNTDOWN",
      "enabled": true,
      "order": 1,
      "data": {
        "title": "פסטיבל בוהו",
        "event_date": "2027-10-07T15:00:00+03:00",
        "kicker": "שלושה ימים ב",
        "venue": "חוות הדוגמה",
        "city": "הנגב",
        "welcome_heading": "קחו אוויר, קחו תמונה",
        "welcome": "יצירה, מוזיקה ואוכל בשטח. האלבום המשותף נבנה מכל הטלפונים — פשוט מעלים לכאן.",
        "date_he": "יום חמישי, 7 באוקטובר 2027",
        "time_he": "15:00",
        "cover": {
          "stock": "festival-2/hero"
        }
      }
    },
    {
      "id": "about",
      "type": "ABOUT",
      "enabled": true,
      "order": 2,
      "data": {
        "kicker": "בוהו",
        "heading": "קחו אוויר, קחו תמונה",
        "body": "שלושה ימים בחווה: יצירה, מוזיקה ואוכל. ההפקה כותבת כאן את הרוח. במוק אין מספרי קהל.",
        "image": {
          "stock": "art/bh-frame"
        },
        "layout": "split"
      }
    },
    {
      "id": "stages",
      "type": "EVENT_TIMELINE",
      "enabled": true,
      "order": 3,
      "data": {
        "heading": "מה קורה בשטח",
        "kicker": "לו״ז",
        "items": [
          {
            "time": "15:00",
            "label": "פתיחה ושוק יוצרים"
          },
          {
            "time": "17:00",
            "label": "סדנאות"
          },
          {
            "time": "19:00",
            "label": "במה מרכזית",
            "description": "הרכב לדוגמה, כשיתמלא שם"
          },
          {
            "time": "21:30",
            "label": "מעגל אש"
          }
        ]
      }
    },
    {
      "id": "grounds",
      "type": "GROUNDS",
      "enabled": true,
      "order": 4,
      "data": {
        "kicker": "התמצאות",
        "heading": "מפת החווה",
        "note": "תרשים לדוגמה.",
        "zones": [
          {
            "id": "gate",
            "label": "שער"
          },
          {
            "id": "main",
            "label": "במה"
          },
          {
            "id": "small",
            "label": "סדנאות"
          },
          {
            "id": "food",
            "label": "מטבח"
          },
          {
            "id": "camp",
            "label": "לינה"
          },
          {
            "id": "park",
            "label": "חניה"
          }
        ]
      }
    },
    {
      "id": "food",
      "type": "ZONES",
      "enabled": true,
      "order": 5,
      "data": {
        "kicker": "שולחן משותף",
        "heading": "אוכל בשטח",
        "note": "תיאורים כלליים, לא שמות שפים.",
        "items": [
          {
            "title": "המטבח",
            "body": "שעות הגשה יופיעו כאן."
          },
          {
            "title": "שוק",
            "body": "דוכנים של יוצרים, כשיתמלאו."
          },
          {
            "title": "קפה",
            "body": "אם יש פינה — היא תצוין."
          }
        ]
      }
    },
    {
      "id": "rules",
      "type": "RULES",
      "enabled": true,
      "order": 6,
      "data": {
        "kicker": "ביחד",
        "heading": "כללים עדינים",
        "items": [
          "משאירים את השטח כמו שמצאנו, או יותר יפה.",
          "רעש אחרי השעה שתיקבע — בשקט.",
          "צילום מכבד: לא מעלים מישהו שביקש שלא.",
          "ההפקה תוסיף כאן כללי בטיחות אמיתיים."
        ]
      }
    },
    {
      "id": "gallery",
      "type": "GALLERY",
      "enabled": true,
      "order": 7,
      "data": {
        "kicker": "עץ ואור",
        "heading": "בוהו לדוגמה",
        "style": "masonry",
        "note": "מקרמה, אורות ומרקם — בלי קהל.",
        "images": [
          {
            "image": {
              "stock": "art/bh-rich"
            },
            "caption": "מקרמה · דוגמה"
          },
          {
            "image": {
              "stock": "art/bh-rich2"
            },
            "caption": "אורות · דוגמה"
          },
          {
            "image": {
              "stock": "art/bh-frame"
            },
            "caption": "מסגרת · דוגמה"
          },
          {
            "image": {
              "stock": "art/bh-lights"
            },
            "caption": "חמים · דוגמה"
          },
          {
            "image": {
              "stock": "art/ds-horizon"
            },
            "caption": "שטח · דוגמה"
          },
          {
            "image": {
              "stock": "art/ol-rich"
            },
            "caption": "עלה · דוגמה"
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
        "heading": "העלו מהחווה",
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
        "album_text": "האלבום החי"
      }
    },
    {
      "id": "tickets",
      "type": "CARDS",
      "enabled": true,
      "order": 9,
      "data": {
        "kicker": "מידע",
        "heading": "כניסה ושהות",
        "items": [
          {
            "title": "כרטיס",
            "body": "פרטים יופיעו כאן, בלי מחיר בדוי."
          },
          {
            "title": "לינה",
            "body": "אם יש קמפינג — ההפקה מפרטת."
          },
          {
            "title": "מה מביאים",
            "body": "רשימה קצרה, כשיתמלא."
          }
        ]
      }
    },
    {
      "id": "arrive",
      "type": "MAP",
      "enabled": true,
      "order": 10,
      "data": {
        "kicker": "הגעה",
        "heading": "חוות הדוגמה",
        "location_name": "חוות הדוגמה",
        "city": "הנגב",
        "note": "סקיצת הגעה לדוגמה."
      }
    },
    {
      "id": "faq",
      "type": "FAQ",
      "enabled": true,
      "order": 11,
      "data": {
        "kicker": "שאלות",
        "heading": "לפני הירידה דרומה",
        "items": [
          {
            "q": "יש מקלחות?",
            "a": "ההפקה מציינת. במוק אין תיאור מתקן בדוי."
          },
          {
            "q": "אפשר להגיע עם כלב?",
            "a": "המדיניות תופיע כאן."
          },
          {
            "q": "מה עם רכב?",
            "a": "חניה לפי המפה."
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
