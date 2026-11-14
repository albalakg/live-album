import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "party-1",
  "theme": {
    "palette_id": "default",
    "background_type": "DARK",
    "font_family": "Rubik",
    "scale": "M",
    "cover": {
      "stock": "party-1/hero"
    },
    "colors": {
      "primary": "#FF2E9A",
      "secondary": "#41F3FF",
      "accent": "#41F3FF",
      "background": "#070614",
      "text": "#F4EEFF"
    }
  },
  "blocks": [
    {
      "id": "hero",
      "type": "HERO_COUNTDOWN",
      "enabled": true,
      "order": 1,
      "data": {
        "title": "אדם",
        "event_date": "2027-06-03T21:00:00+03:00",
        "kicker": "הרווקים של",
        "venue": "מועדון הדוגמה",
        "city": "תל אביב",
        "welcome_heading": "הלילה הזה",
        "welcome": "בלי אפליקציה ובלי קבוצת וואטסאפ מתה. מעלים לכאן, רואים על המסך, וממשיכים לרקוד.",
        "date_he": "יום חמישי, 3 ביוני 2027",
        "time_he": "21:00",
        "cover": {
          "stock": "party-1/hero"
        }
      }
    },
    {
      "id": "about",
      "type": "ABOUT",
      "enabled": true,
      "order": 2,
      "data": {
        "kicker": "הלילה",
        "heading": "הרווקים של אדם",
        "body": "מסיבה, לא כנס. כאן כותבים מה צפוי ומה מבקשים מהאורחים. במוק אין סיפור בדוי על החברותא.",
        "layout": "wide"
      }
    },
    {
      "id": "lineup",
      "type": "LINEUP",
      "enabled": true,
      "order": 3,
      "data": {
        "kicker": "על הבמה",
        "heading": "ליינאפ לדוגמה",
        "note": "שמות כלליים בלבד, לא אמנים אמיתיים.",
        "items": [
          {
            "time": "21:00",
            "title": "פתיחת דלתות",
            "body": "כניסה והאלבום נפתח."
          },
          {
            "time": "22:00",
            "title": "די־ג׳יי א׳ (דוגמה)",
            "body": "הרחבה מתחילה."
          },
          {
            "time": "00:00",
            "title": "די־ג׳יי ב׳ (דוגמה)",
            "body": "המשך הלילה."
          }
        ]
      }
    },
    {
      "id": "dress",
      "type": "CARDS",
      "enabled": true,
      "order": 4,
      "data": {
        "kicker": "מה לובשים",
        "heading": "ניאון, שחור, נוח לרחבה",
        "items": [
          {
            "title": "הנושא",
            "body": "לילה. המארח יכול לבקש צבע או נעל מסוימת."
          },
          {
            "title": "נוחות",
            "body": "רחבה ארוכה — נעליים שאפשר לרקוד בהן."
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
        "heading": "הפלייליסט",
        "note": "רשימה לדוגמה, לא פלייליסט אמיתי.",
        "tracks": [
          {
            "song": "פתיחה",
            "art": "די־ג׳יי הערב",
            "dur": "3:12"
          },
          {
            "song": "רחבה",
            "art": "די־ג׳יי הערב",
            "dur": "4:01"
          },
          {
            "song": "בלדה קצרה",
            "art": "די־ג׳יי הערב",
            "dur": "3:40"
          },
          {
            "song": "סיום",
            "art": "די־ג׳יי הערב",
            "dur": "3:28"
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
        "kicker": "אור",
        "heading": "ניאון לדוגמה",
        "style": "carousel",
        "note": "הילה וניאון, בלי תמונות קהל.",
        "images": [
          {
            "image": {
              "stock": "art/cf-rich"
            },
            "caption": "קונפטי · דוגמה"
          },
          {
            "image": {
              "stock": "art/nn-edge"
            },
            "caption": "ניאון · דוגמה"
          },
          {
            "image": {
              "stock": "art/nn-rich"
            },
            "caption": "הילה · דוגמה"
          },
          {
            "image": {
              "stock": "art/cf-rich2"
            },
            "caption": "צבע · דוגמה"
          },
          {
            "image": {
              "stock": "art/bl-rich1"
            },
            "caption": "בלון · דוגמה"
          }
        ]
      }
    },
    {
      "id": "been",
      "type": "BEEN_THERE",
      "enabled": true,
      "order": 7,
      "data": {
        "heading": "הייתי שם",
        "body": "ראיתם מישהו בתמונה ורוצים לומר שלום? לוחצים על הרגע באלבום. פרטי קשר רק אם שני הצדדים מסכימים. הפיצ׳ר כבוי בברירת המחדל אצל המארח — כאן הוא מוצג כדוגמה."
      }
    },
    {
      "id": "join",
      "type": "STEPS",
      "enabled": true,
      "order": 8,
      "data": {
        "kicker": "האלבום",
        "heading": "מעלים מהרחבה",
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
        "album_text": "האלבום החי"
      }
    },
    {
      "id": "arrive",
      "type": "MAP",
      "enabled": true,
      "order": 9,
      "data": {
        "kicker": "הגעה",
        "heading": "מועדון הדוגמה",
        "location_name": "מועדון הדוגמה",
        "city": "תל אביב",
        "note": "סקיצת מפה לדוגמה."
      }
    },
    {
      "id": "faq",
      "type": "FAQ",
      "enabled": true,
      "order": 10,
      "data": {
        "kicker": "שאלות",
        "heading": "לפני הלילה",
        "items": [
          {
            "q": "יש רשימה בכניסה?",
            "a": "אם כן, המארח מציין. במוק אין רשימה בדויה."
          },
          {
            "q": "מה לובשים?",
            "a": "לפי סעיף הלבוש למעלה."
          },
          {
            "q": "יש מלתחה?",
            "a": "לפי המועדון. יצוין כאן."
          }
        ]
      }
    },
    {
      "id": "snapshare_cta",
      "type": "SNAPSHARE_CTA",
      "enabled": true,
      "order": 11,
      "data": {
        "button_text": "העלו תמונות",
        "subtitle": "בלי אפליקציה"
      }
    },
    {
      "id": "footer",
      "type": "FOOTER",
      "enabled": true,
      "order": 12,
      "data": {
        "note": "העמוד הזה נוצר ב־SnapShare. האורחים מעלים בלי אפליקציה, והתמונות מופיעות באלבום החי."
      }
    }
  ]
};

export default hubConfig;
