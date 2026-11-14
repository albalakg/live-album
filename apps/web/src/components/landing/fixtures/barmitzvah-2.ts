import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "barmitzvah-2",
  "theme": {
    "palette_id": "default",
    "background_type": "DARK",
    "font_family": "Frank Ruhl Libre",
    "scale": "M",
    "cover": {
      "stock": "barmitzvah-2/hero"
    },
    "colors": {
      "primary": "#D4AF37",
      "secondary": "#B8B0A0",
      "accent": "#D4AF37",
      "background": "#0E1730",
      "text": "#F3EEE6"
    }
  },
  "blocks": [
    {
      "id": "hero",
      "type": "HERO_COUNTDOWN",
      "enabled": true,
      "order": 1,
      "data": {
        "title": "נועה",
        "event_date": "2027-05-06T18:00:00+03:00",
        "kicker": "בת המצווה של",
        "venue": "אולם הדוגמה",
        "city": "ירושלים",
        "welcome_heading": "לנועה, באהבה",
        "welcome": "הערב הזה נפתח בטקס וממשיך בחגיגה. אתם מוזמנים לצלם ולהעלות — התמונות יחכו לכולנו באלבום.",
        "date_he": "יום חמישי, 6 במאי 2027",
        "time_he": "18:00",
        "cover": {
          "stock": "barmitzvah-2/hero"
        }
      }
    },
    {
      "id": "about",
      "type": "ABOUT",
      "enabled": true,
      "order": 2,
      "data": {
        "kicker": "לנועה",
        "heading": "באהבה",
        "body": "פסקה אחת שהמשפחה כותבת לנועה. במוק השארנו את המקום פתוח, בלי סיפור חיים בדוי.",
        "layout": "wide"
      }
    },
    {
      "id": "parasha",
      "type": "ABOUT",
      "enabled": true,
      "order": 3,
      "data": {
        "kicker": "הטקס",
        "heading": "פרשת הקריאה",
        "body": "שם הפרשה וההפטרה יופיעו כאן, כשיתמלאו. לא שיבצנו פרשה לפי התאריך שבדוגמה.",
        "layout": "center"
      }
    },
    {
      "id": "family",
      "type": "PEOPLE",
      "enabled": true,
      "order": 4,
      "data": {
        "kicker": "המשפחה",
        "heading": "מי עומד לידה",
        "note": "שמות לדוגמה, בלי תמונות.",
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
            "initials": "ס",
            "name": "סבים וסבתות",
            "role": "אם ירצו להופיע"
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
        "heading": "סדר הערב",
        "kicker": "לו״ז",
        "items": [
          {
            "time": "18:00",
            "label": "קבלת פנים"
          },
          {
            "time": "18:45",
            "label": "עלייה לתורה"
          },
          {
            "time": "19:30",
            "label": "נאומים וברכות"
          },
          {
            "time": "20:30",
            "label": "חגיגה"
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
        "kicker": "אווירה",
        "heading": "זהב על כחול",
        "style": "masonry",
        "note": "עיטורי חיל־הים וארט־דקו, בלי תמונות אנשים.",
        "images": [
          {
            "image": {
              "stock": "art/ga-corner"
            },
            "caption": "זהב · דוגמה"
          },
          {
            "image": {
              "stock": "art/nv-corner"
            },
            "caption": "חיל־הים · דוגמה"
          },
          {
            "image": {
              "stock": "art/tx-crumple"
            },
            "caption": "רדיד · דוגמה"
          },
          {
            "image": {
              "stock": "art/ga-rich"
            },
            "caption": "ארט־דקו · דוגמה"
          },
          {
            "image": {
              "stock": "art/ye-rich"
            },
            "caption": "זהב · דוגמה"
          },
          {
            "image": {
              "stock": "art/tx-foil"
            },
            "caption": "ברק · דוגמה"
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
        "kicker": "האלבום החי",
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
        "album_text": "האלבום החי"
      }
    },
    {
      "id": "wishes",
      "type": "WISHING_WELL",
      "enabled": true,
      "order": 8,
      "data": {
        "title": "ברכות לנועה",
        "message": "כתבו לנועה כמה מילים לערב הזה."
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
        "body": "קישור לדוגמה בלבד.",
        "button": "לרשימת המתנות (דוגמה)"
      }
    },
    {
      "id": "arrive",
      "type": "MAP",
      "enabled": true,
      "order": 10,
      "data": {
        "kicker": "הגעה",
        "heading": "אולם הדוגמה",
        "location_name": "אולם הדוגמה",
        "city": "ירושלים",
        "note": "סקיצת מפה לדוגמה."
      }
    },
    {
      "id": "rsvp",
      "type": "RSVP",
      "enabled": true,
      "order": 11,
      "data": {
        "kicker": "אישור",
        "heading": "מגיעים?",
        "body": "אישור הגעה לדוגמה."
      }
    },
    {
      "id": "faq",
      "type": "FAQ",
      "enabled": true,
      "order": 12,
      "data": {
        "kicker": "שאלות",
        "heading": "לפני הערב",
        "items": [
          {
            "q": "מה לובשים?",
            "a": "ערב חגיגי. אפשר לבקש צבע מסוים — המארח ממלא."
          },
          {
            "q": "יש חניה?",
            "a": "לפי הוראות האולם בירושלים, כשיתמלאו."
          },
          {
            "q": "מתי מתחיל הטקס?",
            "a": "לפי הלו״ז למעלה. כדאי להגיע לקבלת הפנים."
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
