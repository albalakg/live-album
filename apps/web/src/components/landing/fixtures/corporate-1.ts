import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "corporate-1",
  "theme": {
    "palette_id": "default",
    "background_type": "LIGHT",
    "font_family": "Heebo",
    "scale": "M",
    "cover": {
      "stock": "corporate-1/hero"
    },
    "colors": {
      "primary": "#3D6A80",
      "secondary": "#8AA0AC",
      "accent": "#8AA0AC",
      "background": "#EEF1F3",
      "text": "#1A2830"
    }
  },
  "blocks": [
    {
      "id": "hero",
      "type": "HERO_COUNTDOWN",
      "enabled": true,
      "order": 1,
      "data": {
        "title": "כנס החברה 2027",
        "event_date": "2027-11-03T09:00:00+02:00",
        "kicker": "כנס שנתי",
        "venue": "מרכז הכנסים הדוגמה",
        "city": "רמת גן",
        "welcome_heading": "ברוכים הבאים לכנס",
        "welcome": "לוח הזמנים, הדוברים והאלבום החי — באותו עמוד. העלו תמונות מהיום, בלי אפליקציה.",
        "date_he": "יום רביעי, 3 בנובמבר 2027",
        "time_he": "09:00",
        "cover": {
          "stock": "corporate-1/hero"
        }
      }
    },
    {
      "id": "about",
      "type": "ABOUT",
      "enabled": true,
      "order": 2,
      "data": {
        "kicker": "הכנס",
        "heading": "יום אחד, תכנית אחת",
        "body": "כאן החברה כותבת מה מצפים מהיום. במוק אין יעדי הכנס בדויים ואין מספרי משתתפים.",
        "layout": "wide"
      }
    },
    {
      "id": "schedule",
      "type": "EVENT_TIMELINE",
      "enabled": true,
      "order": 3,
      "data": {
        "heading": "לוח הזמנים",
        "kicker": "סדר היום",
        "items": [
          {
            "time": "09:00",
            "label": "התכנסות וקפה"
          },
          {
            "time": "09:45",
            "label": "פתיחה",
            "description": "דברי ברכה"
          },
          {
            "time": "10:15",
            "label": "מושב ראשון"
          },
          {
            "time": "12:30",
            "label": "הפסקת צהריים"
          },
          {
            "time": "13:30",
            "label": "מושב אחר הצהריים"
          },
          {
            "time": "16:00",
            "label": "סיכום וקבלת פנים"
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
        "heading": "דוברים",
        "note": "שמות לדוגמה בלבד, בלי תמונות.",
        "items": [
          {
            "initials": "דכ",
            "name": "דנה כהן",
            "role": "מנכ״לית"
          },
          {
            "initials": "עמ",
            "name": "עמית מזרחי",
            "role": "סמנכ״ל מוצר"
          },
          {
            "initials": "יל",
            "name": "יונתן לוי",
            "role": "אורח"
          }
        ]
      }
    },
    {
      "id": "sponsors",
      "type": "SPONSORS",
      "enabled": true,
      "order": 5,
      "data": {
        "kicker": "תודה",
        "heading": "שותפים לדוגמה",
        "note": "סימנים כלליים בלבד, לא לוגו של חברות אמיתיות.",
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
          },
          {
            "initials": "ד",
            "name": "שותף ד׳"
          }
        ]
      }
    },
    {
      "id": "venue",
      "type": "MAP",
      "enabled": true,
      "order": 6,
      "data": {
        "kicker": "המקום",
        "heading": "מרכז הכנסים הדוגמה",
        "location_name": "מרכז הכנסים הדוגמה",
        "city": "רמת גן",
        "note": "סקיצת מפה לדוגמה. הוראות כניסה והתמצאות המארח ממלא."
      }
    },
    {
      "id": "network",
      "type": "NETWORKING",
      "enabled": true,
      "order": 7,
      "data": {
        "kicker": "חיבור",
        "heading": "להכיר, לא רק לשמוע",
        "body": "אם החברה מפעילה פינת היכרות או «הייתי שם» — זה המקום להסביר, באופט־אין. במוק אין רשת בדויה ואין שמות משתתפים."
      }
    },
    {
      "id": "tag",
      "type": "HASHTAG",
      "enabled": true,
      "order": 8,
      "data": {
        "tag": "#כנסהחברה2027",
        "body": "האשטאג לדוגמה. התמונות עצמן עולות לאלבום החי, לא חייבות לעבור ברשתות."
      }
    },
    {
      "id": "gallery",
      "type": "GALLERY",
      "enabled": true,
      "order": 9,
      "data": {
        "kicker": "המקום",
        "heading": "תמונות לדוגמה",
        "style": "grid",
        "note": "זכוכית, אבן וצבע — בלי תמונות של קהל.",
        "images": [
          {
            "image": {
              "stock": "art/cb-rich1"
            },
            "caption": "צבע · דוגמה"
          },
          {
            "image": {
              "stock": "art/cb-rich2"
            },
            "caption": "גיאומטריה · דוגמה"
          },
          {
            "image": {
              "stock": "art/ar-rich"
            },
            "caption": "מבנה · דוגמה"
          },
          {
            "image": {
              "stock": "art/ye-rich"
            },
            "caption": "זהב · דוגמה"
          },
          {
            "image": {
              "stock": "art/ga-corner"
            },
            "caption": "ארט־דקו · דוגמה"
          },
          {
            "image": {
              "stock": "art/tx-crumple"
            },
            "caption": "מתכת · דוגמה"
          }
        ]
      }
    },
    {
      "id": "join",
      "type": "STEPS",
      "enabled": true,
      "order": 10,
      "data": {
        "kicker": "האלבום",
        "heading": "העלו מהכנס",
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
        "button_text": "העלו תמונות מהכנס",
        "album_text": "האלבום החי"
      }
    },
    {
      "id": "faq",
      "type": "FAQ",
      "enabled": true,
      "order": 11,
      "data": {
        "kicker": "שאלות",
        "heading": "למשתתפים",
        "items": [
          {
            "q": "יש חניה?",
            "a": "בחניון המרכז, לפי השילוט שיתמלא."
          },
          {
            "q": "מה קוד הלבוש?",
            "a": "עסקי-נוח, אלא אם המארח יבקש אחרת."
          },
          {
            "q": "יש וויי־פיי?",
            "a": "פרטי הרשת יופיעו כאן, בלי סיסמה בדויה במוק."
          },
          {
            "q": "איך מקבלים מצגות?",
            "a": "קישור אחרי היום, אם החברה בוחרת לשתף."
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
