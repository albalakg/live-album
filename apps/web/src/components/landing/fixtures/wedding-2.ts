import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "wedding-2",
  "theme": {
    "palette_id": "default",
    "background_type": "DARK",
    "font_family": "Heebo",
    "scale": "M",
    "cover": {
      "stock": "wedding-2/hero"
    },
    "colors": {
      "primary": "#C9A36A",
      "secondary": "#B4A89A",
      "accent": "#C9A36A",
      "background": "#14110F",
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
        "title": "עמית וגל",
        "event_date": "2027-06-10T19:30:00+03:00",
        "kicker": "החתונה של",
        "venue": "גלריה הדוגמה",
        "city": "תל אביב",
        "welcome_heading": "ברוכים הבאים",
        "welcome": "הערב הזה שייך גם לכם. סרקו, צלמו, והעלו — התמונות עולות למסך בזמן אמת. בלי אפליקציה.",
        "date_he": "יום חמישי, 10 ביוני 2027",
        "time_he": "19:30",
        "cover": {
          "stock": "wedding-2/hero"
        }
      }
    },
    {
      "id": "quote",
      "type": "QUOTE",
      "enabled": true,
      "order": 2,
      "data": {
        "text": "הערב הזה שייך גם לכם.",
        "credit": "עמית וגל"
      }
    },
    {
      "id": "story",
      "type": "ABOUT",
      "enabled": true,
      "order": 3,
      "data": {
        "kicker": "הסיפור",
        "heading": "עכשיו מתחילים",
        "body": "עמוד כהה, אותיות גדולות, פחות קישוט. כאן המארחים כותבים פסקה אחת על הערב — בלי ביוגרפיה שמומצאת בשביל המוק.",
        "layout": "wide"
      }
    },
    {
      "id": "gallery",
      "type": "GALLERY",
      "enabled": true,
      "order": 4,
      "data": {
        "kicker": "על הסרט",
        "heading": "רגעים לדוגמה",
        "style": "filmstrip",
        "note": "תמונות מאלבום עמית וגל, לצד מרקם כהה וזהב. בלי אנשים שנוצרו ב־AI.",
        "images": [
          {
            "image": {
              "stock": "wedding-2/album-1"
            },
            "caption": "עמית וגל"
          },
          {
            "image": {
              "stock": "art/fl-rich2"
            },
            "caption": "פרחים · דוגמה"
          },
          {
            "image": {
              "stock": "wedding-2/album-2"
            },
            "caption": "עמית וגל"
          },
          {
            "image": {
              "stock": "art/tx-crumple"
            },
            "caption": "זהב · דוגמה"
          },
          {
            "image": {
              "stock": "wedding-2/album-3"
            },
            "caption": "עמית וגל"
          },
          {
            "image": {
              "stock": "wedding-2/album-4"
            },
            "caption": "עמית וגל"
          },
          {
            "image": {
              "stock": "art/fl-blush-bl"
            },
            "caption": "פרחים · דוגמה"
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
        "heading": "הערב",
        "kicker": "לו״ז",
        "items": [
          {
            "time": "19:30",
            "label": "קבלת פנים"
          },
          {
            "time": "20:15",
            "label": "חופה"
          },
          {
            "time": "21:00",
            "label": "שולחנות"
          },
          {
            "time": "22:30",
            "label": "רחבה"
          }
        ]
      }
    },
    {
      "id": "dress",
      "type": "CARDS",
      "enabled": true,
      "order": 6,
      "data": {
        "kicker": "לבוש",
        "heading": "שחור, זהב, פשוט",
        "items": [
          {
            "title": "קוד לבוש",
            "body": "ערב. המארחים יכולים לצמצם או להרחיב את הבקשה."
          },
          {
            "title": "המקום",
            "body": "גלריה. נעליים נוחות להליכה בין האולמות."
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
        "heading": "מעלים, וזה על המסך",
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
        "button_text": "העלו עכשיו",
        "album_text": "לאלבום החי"
      }
    },
    {
      "id": "arrive",
      "type": "MAP",
      "enabled": true,
      "order": 8,
      "data": {
        "kicker": "הגעה",
        "heading": "גלריה הדוגמה",
        "location_name": "גלריה הדוגמה",
        "city": "תל אביב",
        "note": "סקיצת מפה לדוגמה, לא ניווט חי."
      }
    },
    {
      "id": "wishes",
      "type": "WISHING_WELL",
      "enabled": true,
      "order": 9,
      "data": {
        "title": "מילה לזוג",
        "message": "השאירו ברכה קצרה.",
        "gift_label": "מתנה (קישור לדוגמה)"
      }
    },
    {
      "id": "faq",
      "type": "FAQ",
      "enabled": true,
      "order": 10,
      "data": {
        "kicker": "שאלות",
        "heading": "בקצרה",
        "items": [
          {
            "q": "איפה חונים?",
            "a": "המארח ממלא. במוק: לפי הוראות הגלריה."
          },
          {
            "q": "יש מלתחה?",
            "a": "כן, אם המקום מציע — המשפט הזה מתחלף."
          },
          {
            "q": "מתי נפתח האלבום?",
            "a": "מהרגע שההעלאות נפתחות, בערך שמונה שעות לפני תחילת האירוע."
          }
        ]
      }
    },
    {
      "id": "trivia",
      "type": "TRIVIA_CTA",
      "enabled": true,
      "order": 11,
      "data": {
        "title": "כמה אתם מכירים את עמית וגל",
        "body": "מצטרפים מהטלפון, התוצאות על המסך."
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
