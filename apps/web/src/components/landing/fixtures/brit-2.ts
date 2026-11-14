import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "brit-2",
  "theme": {
    "palette_id": "default",
    "background_type": "LIGHT",
    "font_family": "Frank Ruhl Libre",
    "scale": "M",
    "cover": {
      "stock": "brit-2/hero"
    },
    "colors": {
      "primary": "#C4896A",
      "secondary": "#E8B8A0",
      "accent": "#E8B8A0",
      "background": "#F8EFE6",
      "text": "#5A3228"
    }
  },
  "blocks": [
    {
      "id": "hero",
      "type": "HERO_COUNTDOWN",
      "enabled": true,
      "order": 1,
      "data": {
        "title": "הבריתה של נועה",
        "event_date": "2027-07-08T11:00:00+03:00",
        "kicker": "מזל טוב",
        "venue": "גן הדוגמה",
        "city": "נס ציונה",
        "welcome_heading": "שלום לנועה",
        "welcome": "יום רך ושמח. צלמו מה שתרצו, והעלו לכאן — המשפחה כולה תראה את הרגעים באלבום אחד.",
        "date_he": "יום חמישי, 8 ביולי 2027",
        "time_he": "11:00",
        "cover": {
          "stock": "brit-2/hero"
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
        "heading": "נועה",
        "body": "אם המשפחה רוצה, כאן נכתבת משמעות השם. «נועה» קשורה לתנועה ולנעימות — משפט שאפשר להשאיר או להחליף. לא כתבנו סיפור משפחתי בדוי.",
        "image": {
          "stock": "art/pc-flower"
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
        "heading": "מחכים לכם",
        "note": "תפקידים לדוגמה, בלי תמונות.",
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
            "name": "סבתות",
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
        "kicker": "הבריתה",
        "heading": "פרטי היום",
        "items": [
          {
            "title": "הטקס",
            "body": "בגן, אחרי קבלת הפנים. המארח מפרט."
          },
          {
            "title": "כיבוד",
            "body": "יופיע כאן, בלי תפריט בדוי."
          },
          {
            "title": "צילום",
            "body": "מוזמנים לצלם ולהעלות לאלבום המשותף."
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
        "kicker": "חמים",
        "heading": "חדר מלא אור",
        "style": "grid",
        "note": "חבל כביסה, דובי, מתנות וסוס נדנדה — איורים בלבד, בלי תמונות תינוקות.",
        "images": [
          {
            "image": {
              "stock": "art/cl-rich"
            },
            "caption": "חבל כביסה · דוגמה"
          },
          {
            "image": {
              "stock": "art/td-gifts"
            },
            "caption": "מתנות · דוגמה"
          },
          {
            "image": {
              "stock": "art/td-rich"
            },
            "caption": "דובי · דוגמה"
          },
          {
            "image": {
              "stock": "art/pc-rich1"
            },
            "caption": "אפרסק · דוגמה"
          },
          {
            "image": {
              "stock": "art/pc-rich2"
            },
            "caption": "פרח · דוגמה"
          },
          {
            "image": {
              "stock": "art/bb-rich"
            },
            "caption": "קוביות · דוגמה"
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
        "heading": "סדר היום",
        "kicker": "לו״ז",
        "items": [
          {
            "time": "11:00",
            "label": "קבלת פנים"
          },
          {
            "time": "11:30",
            "label": "הבריתה"
          },
          {
            "time": "12:00",
            "label": "כיבוד וברכות"
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
        "heading": "גן הדוגמה",
        "location_name": "גן הדוגמה",
        "city": "נס ציונה",
        "note": "סקיצת מפה לדוגמה."
      }
    },
    {
      "id": "wishes",
      "type": "WISHING_WELL",
      "enabled": true,
      "order": 9,
      "data": {
        "title": "ברכות לנועה",
        "message": "מילה למשפחה."
      }
    },
    {
      "id": "rsvp",
      "type": "RSVP",
      "enabled": true,
      "order": 10,
      "data": {
        "kicker": "אישור",
        "heading": "מגיעים?",
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
        "heading": "לפני שיוצאים",
        "items": [
          {
            "q": "יש חניה?",
            "a": "ליד הגן, לפי ההוראות שיתמלאו."
          },
          {
            "q": "מה לובשים?",
            "a": "חגיגי ונוח, מתאים לגן בקיץ."
          },
          {
            "q": "האם יש צל?",
            "a": "המארח מציין. במוק לא תיארנו מתחם בדוי."
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
