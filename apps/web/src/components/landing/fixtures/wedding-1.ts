import type { HubConfig } from "../types";

const hubConfig: HubConfig = {
  "template_id": "wedding-1",
  "theme": {
    "palette_id": "default",
    "background_type": "LIGHT",
    "font_family": "Frank Ruhl Libre",
    "scale": "M",
    "cover": {
      "stock": "wedding-1/hero"
    },
    "colors": {
      "primary": "#B8894A",
      "secondary": "#B76E79",
      "accent": "#B76E79",
      "background": "#F4EDE3",
      "text": "#3A2A22"
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
        "event_date": "2027-06-10T19:00:00+03:00",
        "kicker": "החתונה של",
        "venue": "אולם הדוגמה",
        "city": "השרון",
        "welcome_heading": "האהובים שלנו",
        "welcome": "אנחנו מתרגשים לחגוג אתכם את היום הזה. העלו תמונות וסרטונים מהערב — בלי אפליקציה — והם יופיעו באלבום החי ובמסך באולם.",
        "date_he": "יום חמישי, 10 ביוני 2027",
        "time_he": "19:00",
        "cover": {
          "stock": "wedding-1/hero"
        }
      }
    },
    {
      "id": "story",
      "type": "STORY",
      "enabled": true,
      "order": 2,
      "data": {
        "kicker": "הסיפור שלנו",
        "heading": "איך הגענו עד כאן",
        "chapters": [
          {
            "title": "ההיכרות",
            "body": "כאן המארחים כותבים, בקצרה, איך עמית וגל נפגשו. במוק הזה זה מקום שמור — בלי ביוגרפיה בדויה."
          },
          {
            "title": "ההצעה",
            "body": "וכאן, אם ירצו, כמה מילים על הרגע שבו החליטו להתחתן. הטקסט מתחלף אצל המארח."
          }
        ],
        "image": {
          "stock": "art/fl-blush-bl"
        },
        "image_caption": "עיטור · דוגמה"
      }
    },
    {
      "id": "couple",
      "type": "PEOPLE",
      "enabled": true,
      "order": 3,
      "data": {
        "kicker": "הזוג",
        "heading": "עמית וגל",
        "note": "כרטיסי השמות הם חלק מהטמפלט. תמונות הזוג, אם יופיעו, הן מהאלבום האמיתי — לא דיוקנאות שנוצרו ב־AI.",
        "items": [
          {
            "initials": "ע",
            "name": "עמית",
            "role": "חתן"
          },
          {
            "initials": "ג",
            "name": "גל",
            "role": "כלה"
          }
        ],
        "photos": [
          {
            "image": {
              "stock": "wedding-1/album-1"
            },
            "caption": "עמית וגל"
          },
          {
            "image": {
              "stock": "wedding-1/album-2"
            },
            "caption": "עמית וגל"
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
        "heading": "חופה, קבלת פנים וריקודים",
        "kicker": "סדר הערב",
        "items": [
          {
            "time": "19:00",
            "label": "קבלת פנים",
            "description": "שתייה קלה וצילומים בגן"
          },
          {
            "time": "20:00",
            "label": "חופה",
            "description": "בחצר האולם"
          },
          {
            "time": "21:00",
            "label": "ארוחת חגיגה"
          },
          {
            "time": "22:30",
            "label": "ריקודים",
            "description": "ופתיחת האלבום החי על המסך"
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
            "title": "אלגנטי-חגיגי",
            "body": "המארחים ממלאים כאן את בקשת הלבוש. במוק: ערב חגיגי, בלי הנחיה מחייבת."
          },
          {
            "title": "מזג האוויר",
            "body": "החופה בחוץ. כדאי שכבה קלה לערב, לפי העונה."
          },
          {
            "title": "ילדים",
            "body": "המארחים מציינים כאן אם הערב פתוח לילדים, ואם יש פינת משחקים."
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
        "heading": "תמונות לדוגמה",
        "style": "masonry",
        "note": "פרחים ומרקמים מספרית ה־QR, ותמונות מאלבום עמית וגל. בלי אנשים שנוצרו ב־AI.",
        "images": [
          {
            "image": {
              "stock": "art/fl-rich1"
            },
            "caption": "פרחים · דוגמה"
          },
          {
            "image": {
              "stock": "wedding-1/album-1"
            },
            "caption": "עמית וגל"
          },
          {
            "image": {
              "stock": "art/fl-blush-bl"
            },
            "caption": "פרחים · דוגמה"
          },
          {
            "image": {
              "stock": "wedding-1/album-2"
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
              "stock": "wedding-1/album-3"
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
              "stock": "wedding-1/album-4"
            },
            "caption": "עמית וגל"
          },
          {
            "image": {
              "stock": "art/fl-bot-tl"
            },
            "caption": "עלה · דוגמה"
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
        "kicker": "איך מצטרפים",
        "heading": "שלושה צעדים, בלי אפליקציה",
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
        "album_text": "צפו באלבום החי"
      }
    },
    {
      "id": "arrive",
      "type": "MAP",
      "enabled": true,
      "order": 8,
      "data": {
        "kicker": "הגעה",
        "heading": "איך מגיעים",
        "location_name": "אולם הדוגמה",
        "city": "השרון",
        "note": "המפה כאן היא סקיצה לדוגמה, לא מפה חיה. ווייז וגוגל מפות יפתחו בקישור אמיתי אצל המארח."
      }
    },
    {
      "id": "wishes",
      "type": "WISHING_WELL",
      "enabled": true,
      "order": 9,
      "data": {
        "title": "ברכות לזוג",
        "message": "כתבו כמה מילים לעמית וגל. הברכות יופיעו כאן אחרי האישור.",
        "gift_label": "קופת מתנות לזוג (קישור לדוגמה)",
        "gift_note": "ביט, קופה או רשימה — המארח מדביק קישור."
      }
    },
    {
      "id": "rsvp",
      "type": "RSVP",
      "enabled": true,
      "order": 10,
      "data": {
        "kicker": "אישור הגעה",
        "heading": "מגיעים?",
        "body": "במוק הזה האישור לא נשמר בשרת. אצל המארח זה יושב על רשימת האורחים."
      }
    },
    {
      "id": "faq",
      "type": "FAQ",
      "enabled": true,
      "order": 11,
      "data": {
        "kicker": "כדאי לדעת",
        "heading": "שאלות קצרות",
        "items": [
          {
            "q": "יש חניה?",
            "a": "המארחים ממלאים כאן הוראות חניה. במוק: חניה במתחם, לפי שילוט האולם."
          },
          {
            "q": "מה לובשים?",
            "a": "ערב חגיגי. פירוט למעלה, בסעיף קוד הלבוש."
          },
          {
            "q": "אפשר להביא ילדים?",
            "a": "ההחלטה אצל המארח. כאן יופיע המשפט שהם יכתבו."
          },
          {
            "q": "איך מעבירים מתנה?",
            "a": "קישור לקופה או לביט, בסעיף הברכות. בלי מספר חשבון בדוי במוק."
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
