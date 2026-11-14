import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "festival-1",
  "theme": {
    "palette_id": "default",
    "background_type": "DARK",
    "font_family": "Rubik",
    "scale": "M",
    "cover": {
      "stock": "festival-1/hero"
    },
    "colors": {
      "primary": "#FF8A3A",
      "secondary": "#FFD080",
      "accent": "#FFD080",
      "background": "#1A0E0A",
      "text": "#F8EDE0"
    }
  },
  "blocks": [
    {
      "id": "hero",
      "type": "HERO_COUNTDOWN",
      "enabled": true,
      "order": 1,
      "data": {
        "title": "פסטיבל השקיעה",
        "event_date": "2027-07-15T16:00:00+03:00",
        "kicker": "סוף שבוע ב",
        "venue": "מתחם הדוגמה",
        "city": "הערבה",
        "welcome_heading": "ברוכים הבאים לשטח",
        "welcome": "במות, שקיעה, ואלבום חי אחד לכולם. מעלים מהטלפון — בלי אפליקציה — והתמונות עולות למסכים.",
        "date_he": "יום חמישי, 15 ביולי 2027",
        "time_he": "16:00",
        "cover": {
          "stock": "festival-1/hero"
        }
      }
    },
    {
      "id": "about",
      "type": "ABOUT",
      "enabled": true,
      "order": 2,
      "data": {
        "kicker": "השטח",
        "heading": "שקיעה, במות, אלבום אחד",
        "body": "כאן ההפקה כותבת מהו הסוף-שבוע. במוק אין מספרי קהל, אין מותרות בדויות, ואין שמות אמנים אמיתיים.",
        "layout": "wide"
      }
    },
    {
      "id": "stages",
      "type": "LINEUP",
      "enabled": true,
      "order": 3,
      "data": {
        "kicker": "לו״ז הבמות",
        "heading": "מי עולה, לדוגמה",
        "note": "הרכבים כלליים בלבד, מסומנים כדוגמה.",
        "items": [
          {
            "time": "16:00",
            "title": "פתיחת השערים",
            "body": "כניסה למתחם."
          },
          {
            "time": "17:30",
            "title": "במה קטנה · הרכב פתיחה (דוגמה)",
            "body": "שמות ההרכבים יופיעו כשיתמלאו."
          },
          {
            "time": "19:15",
            "title": "שקיעה על הבמה הראשית",
            "body": "הרכב לדוגמה."
          },
          {
            "time": "21:00",
            "title": "הרכב ראשי (דוגמה)",
            "body": "הבמה הראשית."
          },
          {
            "time": "23:30",
            "title": "סשן לילה (דוגמה)",
            "body": "המשך בשטח."
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
        "heading": "מפת השטח",
        "note": "תרשים לדוגמה, לא מפת מדידה.",
        "zones": [
          {
            "id": "gate",
            "label": "כניסה"
          },
          {
            "id": "main",
            "label": "במה ראשית"
          },
          {
            "id": "small",
            "label": "במה קטנה"
          },
          {
            "id": "food",
            "label": "אוכל"
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
      "id": "tickets",
      "type": "CARDS",
      "enabled": true,
      "order": 5,
      "data": {
        "kicker": "מידע",
        "heading": "כרטיסים וכניסה",
        "items": [
          {
            "title": "כרטיס",
            "body": "פרטי הכרטיס והשער יופיעו כאן. במוק אין מחיר בדוי."
          },
          {
            "title": "שעות",
            "body": "פתיחת שערים לפי הלו״ז. סגירה לפי ההפקה."
          },
          {
            "title": "נגישות",
            "body": "המארח מציין דרכי הגעה נגישות, אם יש."
          }
        ]
      }
    },
    {
      "id": "food",
      "type": "ZONES",
      "enabled": true,
      "order": 6,
      "data": {
        "kicker": "לשבת לאכול",
        "heading": "פינות אוכל",
        "note": "שמות כלליים, לא דוכנים אמיתיים.",
        "items": [
          {
            "title": "רחבת האוכל",
            "body": "דוכנים שיתמלאו בשמות אמיתיים."
          },
          {
            "title": "שתייה",
            "body": "עמדות מים ושתיה, לפי ההפקה."
          },
          {
            "title": "צל",
            "body": "אם יש רשת צל — היא תצוין כאן."
          }
        ]
      }
    },
    {
      "id": "rules",
      "type": "RULES",
      "enabled": true,
      "order": 7,
      "data": {
        "kicker": "בשטח",
        "heading": "כללים ואחריות",
        "items": [
          "לא משאירים זבל בשטח — פחים לפי המפה.",
          "אש רק במקומות שסומנו, אם סומנו.",
          "כבוד לקהילה ולשקט בשעות שיוגדרו.",
          "ההפקה ממלאת כאן כללי בטיחות, בלי תקנון בדוי ארוך."
        ]
      }
    },
    {
      "id": "gallery",
      "type": "GALLERY",
      "enabled": true,
      "order": 8,
      "data": {
        "kicker": "אור",
        "heading": "שקיעה לדוגמה",
        "style": "masonry",
        "note": "שמים, מדבר והילה — בלי קהל.",
        "images": [
          {
            "image": {
              "stock": "art/ss-rich"
            },
            "caption": "שקיעה · דוגמה"
          },
          {
            "image": {
              "stock": "art/ss-rich2"
            },
            "caption": "אור · דוגמה"
          },
          {
            "image": {
              "stock": "art/ss-sky"
            },
            "caption": "שמים · דוגמה"
          },
          {
            "image": {
              "stock": "art/ds-rich"
            },
            "caption": "מדבר · דוגמה"
          },
          {
            "image": {
              "stock": "art/ds-horizon"
            },
            "caption": "אופק · דוגמה"
          },
          {
            "image": {
              "stock": "art/bh-lights"
            },
            "caption": "אורות · דוגמה"
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
        "heading": "העלו מהשטח",
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
        "button_text": "העלו מהשטח",
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
        "heading": "מתחם הדוגמה",
        "location_name": "מתחם הדוגמה",
        "city": "הערבה",
        "note": "סקיצת הגעה לדוגמה, בנוסף למפת השטח."
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
            "q": "יש לינה?",
            "a": "אם כן, המארח מפרט. במוק אין מחירי קמפינג בדויים."
          },
          {
            "q": "מה מביאים?",
            "a": "רשימת ציוד, אם יש, תופיע כאן."
          },
          {
            "q": "מה עם רכב?",
            "a": "חניה לפי המפה, לפי הוראות ההפקה."
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
