import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "brit-1",
  "theme": {
    "palette_id": "default",
    "background_type": "LIGHT",
    "font_family": "Frank Ruhl Libre",
    "scale": "M",
    "cover": {
      "stock": "brit-1/hero"
    },
    "colors": {
      "primary": "#6B7F5A",
      "secondary": "#C4A882",
      "accent": "#C4A882",
      "background": "#F3F0E8",
      "text": "#2C3828"
    }
  },
  "blocks": [
    {
      "id": "hero",
      "type": "HERO_COUNTDOWN",
      "enabled": true,
      "order": 1,
      "data": {
        "title": "הברית של ארי",
        "event_date": "2027-02-11T10:00:00+02:00",
        "kicker": "מזל טוב",
        "venue": "אולם הדוגמה",
        "city": "גבעתיים",
        "welcome_heading": "ברוכים הבאים",
        "welcome": "שמחים לארח אתכם ביום השמחה של ארי ושל המשפחה. אתם מוזמנים לצלם רגעים קטנים ולהעלות לאלבום המשותף.",
        "date_he": "יום חמישי, 11 בפברואר 2027",
        "time_he": "10:00",
        "cover": {
          "stock": "brit-1/hero"
        }
      }
    },
    {
      "id": "name",
      "type": "ABOUT",
      "enabled": true,
      "order": 2,
      "data": {
        "kicker": "השם",
        "heading": "ארי",
        "body": "משמעות השם, אם המשפחה רוצה לשתף, תופיע כאן. «ארי» קשור לאריה — משפט שהמארח יכול להשאיר, להרחיב או להחליף. במוק זה טקסט לדוגמה, לא סיפור משפחתי בדוי.",
        "image": {
          "stock": "art/ol-leaf"
        },
        "layout": "split"
      }
    },
    {
      "id": "family",
      "type": "PEOPLE",
      "enabled": true,
      "order": 3,
      "data": {
        "kicker": "המשפחה",
        "heading": "מי מחכה לכם",
        "note": "תפקידים לדוגמה, בלי שמות מלאים ובלי תמונות.",
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
            "name": "סבים",
            "role": "אם ירצו"
          }
        ]
      }
    },
    {
      "id": "ceremony",
      "type": "CARDS",
      "enabled": true,
      "order": 4,
      "data": {
        "kicker": "הברית",
        "heading": "פרטי הטקס",
        "items": [
          {
            "title": "מתי",
            "body": "בבוקר, לפי הלו״ז למטה."
          },
          {
            "title": "איפה",
            "body": "באולם, אחרי קבלת הפנים."
          },
          {
            "title": "מה להביא",
            "body": "את עצמכם. בקשות מיוחדות המארח יוסיף."
          }
        ]
      }
    },
    {
      "id": "gallery",
      "type": "GALLERY",
      "enabled": true,
      "order": 5,
      "data": {
        "kicker": "רך",
        "heading": "גלריה עדינה",
        "style": "masonry",
        "note": "איורי תינוקות מספרית ה־QR: עלים, עננים, סוס נדנדה. בלי תמונות של תינוקות.",
        "images": [
          {
            "image": {
              "stock": "art/ol-rich"
            },
            "caption": "זית · דוגמה"
          },
          {
            "image": {
              "stock": "art/hs-rich"
            },
            "caption": "סוס נדנדה · דוגמה"
          },
          {
            "image": {
              "stock": "art/hs-c"
            },
            "caption": "סוס · דוגמה"
          },
          {
            "image": {
              "stock": "art/sk-rich"
            },
            "caption": "שמים · דוגמה"
          },
          {
            "image": {
              "stock": "art/bb-rattle"
            },
            "caption": "רעשן · דוגמה"
          },
          {
            "image": {
              "stock": "art/ol-leaf"
            },
            "caption": "עלה · דוגמה"
          }
        ]
      }
    },
    {
      "id": "schedule",
      "type": "EVENT_TIMELINE",
      "enabled": true,
      "order": 6,
      "data": {
        "heading": "סדר הבוקר",
        "kicker": "לו״ז",
        "items": [
          {
            "time": "10:00",
            "label": "קבלת פנים"
          },
          {
            "time": "10:30",
            "label": "הברית"
          },
          {
            "time": "11:00",
            "label": "סעודה וברכות"
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
        "heading": "רגעים קטנים, באלבום אחד",
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
        "heading": "אולם הדוגמה",
        "location_name": "אולם הדוגמה",
        "city": "גבעתיים",
        "note": "סקיצת מפה לדוגמה."
      }
    },
    {
      "id": "wishes",
      "type": "WISHING_WELL",
      "enabled": true,
      "order": 9,
      "data": {
        "title": "ברכות למשפחה",
        "message": "מילה לארי ולהורים."
      }
    },
    {
      "id": "rsvp",
      "type": "RSVP",
      "enabled": true,
      "order": 10,
      "data": {
        "kicker": "אישור",
        "heading": "מגיעים בבוקר?",
        "body": "אישור לדוגמה."
      }
    },
    {
      "id": "faq",
      "type": "FAQ",
      "enabled": true,
      "order": 11,
      "data": {
        "kicker": "שאלות",
        "heading": "כדאי לדעת",
        "items": [
          {
            "q": "יש חניה?",
            "a": "ליד האולם, לפי השילוט."
          },
          {
            "q": "האם מתאים לילדים?",
            "a": "כן, זו שמחה משפחתית. המארח יכול לפרט."
          },
          {
            "q": "מה לובשים?",
            "a": "חגיגי ונוח לבוקר."
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
