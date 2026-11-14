import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "birthday-2",
  "theme": {
    "palette_id": "default",
    "background_type": "LIGHT",
    "font_family": "Frank Ruhl Libre",
    "scale": "M",
    "cover": {
      "stock": "birthday-2/hero"
    },
    "colors": {
      "primary": "#8B3A4A",
      "secondary": "#C9A36A",
      "accent": "#C9A36A",
      "background": "#F6EFE6",
      "text": "#3B2418"
    }
  },
  "blocks": [
    {
      "id": "hero",
      "type": "HERO_COUNTDOWN",
      "enabled": true,
      "order": 1,
      "data": {
        "title": "אדם · 30",
        "event_date": "2027-09-16T20:30:00+03:00",
        "kicker": "מוזמנים לערב של",
        "venue": "בר הדוגמה",
        "city": "תל אביב",
        "welcome_heading": "שלושים",
        "welcome": "ערב קטן וחגיגי. תביאו את עצמכם, ואת התמונות תשאירו אצלנו — באלבום החי.",
        "date_he": "יום חמישי, 16 בספטמבר 2027",
        "time_he": "20:30",
        "cover": {
          "stock": "birthday-2/hero"
        }
      }
    },
    {
      "id": "about",
      "type": "ABOUT",
      "enabled": true,
      "order": 2,
      "data": {
        "kicker": "שלושים",
        "heading": "ערב קטן, שולחנות נמוכים",
        "body": "כאן אדם כותב למה הוא מזמין, ומה צפוי בבר. במוק השארנו את הפסקה כללית, בלי ביוגרפיה בדויה.",
        "image": {
          "stock": "art/ad-ribbon"
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
        "kicker": "עד כאן",
        "heading": "קווים לשנה",
        "note": "אבני דרך שהמארח ממלא. כאן הן מקום שמור.",
        "items": [
          {
            "tag": "—",
            "title": "מה שהיה",
            "body": "משפט שהמארח יכתוב."
          },
          {
            "tag": "—",
            "title": "מה שבא",
            "body": "עוד משפט, אם ירצה."
          },
          {
            "tag": "30",
            "title": "הערב",
            "body": "חברים, בר, ואלבום חי."
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
        "heading": "הערב",
        "kicker": "לו״ז",
        "items": [
          {
            "time": "20:30",
            "label": "קבלת פנים"
          },
          {
            "time": "21:15",
            "label": "ברכות וכוסות"
          },
          {
            "time": "22:00",
            "label": "מוזיקה ושולחנות"
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
        "heading": "הפסקול",
        "note": "רשימה לדוגמה.",
        "tracks": [
          {
            "song": "פתיחה שקטה",
            "art": "רשימת הבית",
            "dur": "3:40"
          },
          {
            "song": "אמצע הערב",
            "art": "רשימת הבית",
            "dur": "4:05"
          },
          {
            "song": "רחבה",
            "art": "רשימת הבית",
            "dur": "3:55"
          },
          {
            "song": "סיום",
            "art": "רשימת הבית",
            "dur": "4:10"
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
        "heading": "סרטים וזהב",
        "style": "masonry",
        "note": "עיטורי ערב ומארג זהב, בלי תמונות אנשים.",
        "images": [
          {
            "image": {
              "stock": "art/ad-rich1"
            },
            "caption": "סרט · דוגמה"
          },
          {
            "image": {
              "stock": "art/ad-rich2"
            },
            "caption": "ערב · דוגמה"
          },
          {
            "image": {
              "stock": "art/ad-gold"
            },
            "caption": "זהב · דוגמה"
          },
          {
            "image": {
              "stock": "art/ad-ribbon"
            },
            "caption": "סרט · דוגמה"
          },
          {
            "image": {
              "stock": "art/tx-crumple"
            },
            "caption": "רדיד · דוגמה"
          },
          {
            "image": {
              "stock": "art/fl-blush2"
            },
            "caption": "פרח · דוגמה"
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
        "button_text": "העלו רגע",
        "album_text": "האלבום"
      }
    },
    {
      "id": "arrive",
      "type": "MAP",
      "enabled": true,
      "order": 8,
      "data": {
        "kicker": "הגעה",
        "heading": "בר הדוגמה",
        "location_name": "בר הדוגמה",
        "city": "תל אביב",
        "note": "סקיצת מפה לדוגמה."
      }
    },
    {
      "id": "wishes",
      "type": "WISHING_WELL",
      "enabled": true,
      "order": 9,
      "data": {
        "title": "מילה לאדם",
        "message": "ברכה קצרה ליום ההולדת."
      }
    },
    {
      "id": "rsvp",
      "type": "RSVP",
      "enabled": true,
      "order": 10,
      "data": {
        "kicker": "אישור",
        "heading": "מגיעים לבר?",
        "body": "אישור לדוגמה, בלי שמירה."
      }
    },
    {
      "id": "faq",
      "type": "FAQ",
      "enabled": true,
      "order": 11,
      "data": {
        "kicker": "שאלות",
        "heading": "לפני שיוצאים",
        "items": [
          {
            "q": "מה לובשים?",
            "a": "ערב, נוח. המארח יכול לדייק."
          },
          {
            "q": "יש חניה?",
            "a": "חניון באזור, לפי מה שיתמלא."
          },
          {
            "q": "עד מתי?",
            "a": "הבר נסגר לפי שעת המקום. לא קבענו שעה בדויה."
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
