import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "party-2",
  "theme": {
    "palette_id": "default",
    "background_type": "LIGHT",
    "font_family": "Secular One",
    "scale": "M",
    "cover": {
      "stock": "party-2/hero"
    },
    "colors": {
      "primary": "#D06018",
      "secondary": "#E8A030",
      "accent": "#E8A030",
      "background": "#F8EED8",
      "text": "#4A2818"
    }
  },
  "blocks": [
    {
      "id": "hero",
      "type": "HERO_COUNTDOWN",
      "enabled": true,
      "order": 1,
      "data": {
        "title": "מסיבת קיץ",
        "event_date": "2027-08-12T19:00:00+03:00",
        "kicker": "מוזמנים ל",
        "venue": "גינת הדוגמה",
        "city": "חולון",
        "welcome_heading": "אור, מוזיקה וחברים",
        "welcome": "מסיבה פתוחה בגינה. העלו תמונות בלי אפליקציה, והן יצטרפו לאלבום המשותף.",
        "date_he": "יום חמישי, 12 באוגוסט 2027",
        "time_he": "19:00",
        "cover": {
          "stock": "party-2/hero"
        }
      }
    },
    {
      "id": "about",
      "type": "ABOUT",
      "enabled": true,
      "order": 2,
      "data": {
        "kicker": "קיץ",
        "heading": "אור, מוזיקה וחברים",
        "body": "מסיבה בגינה, באוויר הפתוח. כאן המארחים כותבים מה להביא ומה מחכה. בלי סיפור בדוי.",
        "image": {
          "stock": "art/rt-sun"
        },
        "layout": "split"
      }
    },
    {
      "id": "lineup",
      "type": "LINEUP",
      "enabled": true,
      "order": 3,
      "data": {
        "kicker": "הבמה",
        "heading": "מי מנגן, לדוגמה",
        "note": "שמות כלליים, לא אמנים אמיתיים.",
        "items": [
          {
            "time": "19:00",
            "title": "פתיחת השער",
            "body": "כניסה חופשית לפי הזמנת המארח."
          },
          {
            "time": "20:00",
            "title": "הרכב א׳ (דוגמה)",
            "body": "במה בגינה."
          },
          {
            "time": "21:30",
            "title": "די־ג׳יי (דוגמה)",
            "body": "רחבה עד סגירה."
          }
        ]
      }
    },
    {
      "id": "playlist",
      "type": "PLAYLIST",
      "enabled": true,
      "order": 4,
      "data": {
        "heading": "מה שומעים",
        "note": "רשימה לדוגמה.",
        "tracks": [
          {
            "song": "פתיחת שער",
            "art": "רשימת הבית",
            "dur": "3:20"
          },
          {
            "song": "ריקוד ראשון",
            "art": "רשימת הבית",
            "dur": "3:55"
          },
          {
            "song": "שקט באמצע",
            "art": "רשימת הבית",
            "dur": "4:10"
          },
          {
            "song": "סיום חם",
            "art": "רשימת הבית",
            "dur": "3:44"
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
        "kicker": "לבוש",
        "heading": "קיץ, צבע, יחפים אם בא לכם",
        "items": [
          {
            "title": "הנושא",
            "body": "רטרו-קיץ. המארח יכול לבקש הדפס או צבע."
          },
          {
            "title": "הגינה",
            "body": "דשא. נעליים שמתאימות לחצר, או בלי."
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
        "kicker": "צבע",
        "heading": "שמשות לדוגמה",
        "style": "masonry",
        "note": "רטרו, שמש וגלים — בלי קהל.",
        "images": [
          {
            "image": {
              "stock": "art/rt-rich"
            },
            "caption": "שמש · דוגמה"
          },
          {
            "image": {
              "stock": "art/rt-rich2"
            },
            "caption": "גל · דוגמה"
          },
          {
            "image": {
              "stock": "art/rt-sun"
            },
            "caption": "רטרו · דוגמה"
          },
          {
            "image": {
              "stock": "art/cf-rich"
            },
            "caption": "קונפטי · דוגמה"
          },
          {
            "image": {
              "stock": "art/ds-rich"
            },
            "caption": "אופק · דוגמה"
          },
          {
            "image": {
              "stock": "art/ad-ribbon"
            },
            "caption": "סרט · דוגמה"
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
        "heading": "גינת הדוגמה",
        "location_name": "גינת הדוגמה",
        "city": "חולון",
        "note": "סקיצת מפה לדוגמה."
      }
    },
    {
      "id": "rsvp",
      "type": "RSVP",
      "enabled": true,
      "order": 9,
      "data": {
        "kicker": "אישור",
        "heading": "מגיעים לגינה?",
        "body": "אישור לדוגמה."
      }
    },
    {
      "id": "faq",
      "type": "FAQ",
      "enabled": true,
      "order": 10,
      "data": {
        "kicker": "שאלות",
        "heading": "לפני הקיץ",
        "items": [
          {
            "q": "מה אם יורד גשם?",
            "a": "תוכנית הגיבוי של המארח תופיע כאן."
          },
          {
            "q": "אפשר להביא משהו?",
            "a": "אם מבקשים תרומה לכיבוד — זה המקום, בלי רשימת קניות בדויה."
          },
          {
            "q": "יש חניה?",
            "a": "ליד הגינה, לפי ההוראות."
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
