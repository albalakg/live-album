import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "corporate-2",
  "theme": {
    "palette_id": "default",
    "background_type": "DARK",
    "font_family": "Frank Ruhl Libre",
    "scale": "M",
    "cover": {
      "stock": "corporate-2/hero"
    },
    "colors": {
      "primary": "#D4AF37",
      "secondary": "#B8A88A",
      "accent": "#D4AF37",
      "background": "#0C0C0C",
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
        "title": "ערב הגאלה",
        "event_date": "2027-12-16T19:30:00+02:00",
        "kicker": "מזמינים אתכם ל",
        "venue": "אולם הדוגמה",
        "city": "תל אביב",
        "welcome_heading": "ערב של החברה",
        "welcome": "לבוש ערב. האלבום החי ירוץ על המסכים לאורך הלילה — פשוט מעלים מהטלפון.",
        "date_he": "יום חמישי, 16 בדצמבר 2027",
        "time_he": "19:30",
        "cover": {
          "stock": "corporate-2/hero"
        }
      }
    },
    {
      "id": "about",
      "type": "ABOUT",
      "enabled": true,
      "order": 2,
      "data": {
        "kicker": "הגאלה",
        "heading": "ערב של החברה",
        "body": "כאן נכתב למה מתכנסים. במוק אין הישגים שנתיים בדויים ואין רשימת מצטיינים.",
        "layout": "wide"
      }
    },
    {
      "id": "schedule",
      "type": "EVENT_TIMELINE",
      "enabled": true,
      "order": 3,
      "data": {
        "heading": "סדר הערב",
        "kicker": "לו״ז",
        "items": [
          {
            "time": "19:30",
            "label": "קבלת פנים"
          },
          {
            "time": "20:15",
            "label": "דברי ברכה"
          },
          {
            "time": "20:45",
            "label": "ארוחה"
          },
          {
            "time": "22:00",
            "label": "מופע וריקודים"
          }
        ]
      }
    },
    {
      "id": "speakers",
      "type": "SPEAKERS",
      "enabled": true,
      "order": 4,
      "data": {
        "heading": "על הבמה",
        "note": "שמות לדוגמה בלבד.",
        "items": [
          {
            "initials": "דכ",
            "name": "דנה כהן",
            "role": "מנכ״לית"
          },
          {
            "initials": "אע",
            "name": "אורח הערב",
            "role": "דובר אורח"
          }
        ]
      }
    },
    {
      "id": "dress",
      "type": "CARDS",
      "enabled": true,
      "order": 5,
      "data": {
        "kicker": "לפני שמגיעים",
        "heading": "קוד לבוש",
        "items": [
          {
            "title": "ערב",
            "body": "לבוש ערב. המארח יכול לדייק צבע או עניבה."
          },
          {
            "title": "צילום",
            "body": "יהיו מסכים ואלבום חי — מוזמנים להעלות מהטלפון."
          }
        ]
      }
    },
    {
      "id": "sponsors",
      "type": "SPONSORS",
      "enabled": true,
      "order": 6,
      "data": {
        "kicker": "תודה",
        "heading": "שותפים לדוגמה",
        "note": "סימנים כלליים, לא מותגים אמיתיים.",
        "items": [
          {
            "initials": "א",
            "name": "שותף א׳"
          },
          {
            "initials": "ב",
            "name": "שותף ב׳"
          },
          {
            "initials": "ג",
            "name": "שותף ג׳"
          }
        ]
      }
    },
    {
      "id": "tag",
      "type": "HASHTAG",
      "enabled": true,
      "order": 7,
      "data": {
        "tag": "#ערבגאלה2027",
        "body": "אשטאג לדוגמה, למי שרוצה לשתף גם בחוץ."
      }
    },
    {
      "id": "gallery",
      "type": "GALLERY",
      "enabled": true,
      "order": 8,
      "data": {
        "kicker": "אווירה",
        "heading": "שחור וזהב",
        "style": "masonry",
        "note": "ארט־דקו וחיל־הים, בלי קהל.",
        "images": [
          {
            "image": {
              "stock": "art/ga-corner"
            },
            "caption": "ארט־דקו · דוגמה"
          },
          {
            "image": {
              "stock": "art/ga-rich"
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
              "stock": "art/ye-rich"
            },
            "caption": "ערב · דוגמה"
          },
          {
            "image": {
              "stock": "art/cb-rich2"
            },
            "caption": "צורה · דוגמה"
          }
        ]
      }
    },
    {
      "id": "join",
      "type": "STEPS",
      "enabled": true,
      "order": 9,
      "data": {
        "kicker": "האלבום",
        "heading": "העלו מהערב",
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
      "id": "arrive",
      "type": "MAP",
      "enabled": true,
      "order": 10,
      "data": {
        "kicker": "הגעה",
        "heading": "אולם הדוגמה",
        "location_name": "אולם הדוגמה",
        "city": "תל אביב",
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
        "heading": "שומרים מקום",
        "body": "אישור הגעה לערב, בלי שמירה בשרת במוק."
      }
    },
    {
      "id": "faq",
      "type": "FAQ",
      "enabled": true,
      "order": 12,
      "data": {
        "kicker": "שאלות",
        "heading": "לקראת הערב",
        "items": [
          {
            "q": "מה לובשים?",
            "a": "לבוש ערב, לפי הסעיף למעלה."
          },
          {
            "q": "יש חניה?",
            "a": "חניון האולם, לפי ההוראות שיתמלאו."
          },
          {
            "q": "יש מלתחה?",
            "a": "אם המקום מציע — המארח יציין."
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
