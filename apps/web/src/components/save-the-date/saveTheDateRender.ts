/* Port of save-the-date-mock/js/std-render.js — one renderer for public page, preview and thumbs. */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { hubFullUrl } from "@/components/landing/builder/hubPublicUrl";
import { BASE_SHOW, defaultsFor, styleById } from "./saveTheDateCatalog";

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/** True when white text on this accent would fail WCAG AA for normal text (4.5:1). */
function accentIsLight(hex) {
  const h = String(hex || "").trim().replace("#", "");
  if (h.length < 6) return false;
  const lin = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = lin(parseInt(h.slice(0, 2), 16));
  const g = lin(parseInt(h.slice(2, 4), 16));
  const b = lin(parseInt(h.slice(4, 6), 16));
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (1.05) / (L + 0.05) < 4.5;
}
const RM = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- dates (Asia/Jerusalem) ---------- */
function tzDate(d, t) {
  const guess = new Date(`${d}T${t || "19:00"}:00Z`);
  if (isNaN(guess)) return new Date();
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jerusalem", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(guess).map(x => [x.type, x.value]));
  const asLocal = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
  return new Date(guess.getTime() - (asLocal - guess.getTime()));
}
function gem(n) {
  const L = [[400, "ת"], [300, "ש"], [200, "ר"], [100, "ק"], [90, "צ"], [80, "פ"], [70, "ע"], [60, "ס"], [50, "נ"], [40, "מ"], [30, "ל"], [20, "כ"], [10, "י"], [9, "ט"], [8, "ח"], [7, "ז"], [6, "ו"], [5, "ה"], [4, "ד"], [3, "ג"], [2, "ב"], [1, "א"]];
  let s = "";
  while (n > 0) { if (n % 100 === 15) { s += "טו"; n -= 15; continue; } if (n % 100 === 16) { s += "טז"; n -= 16; continue; } for (const [v, ch] of L) if (n >= v) { s += ch; n -= v; break; } }
  return s.length > 1 ? s.slice(0, -1) + "״" + s.slice(-1) : s + "׳";
}
function dateInfo(c) {
  const [y, m, d] = (c.date || "2027-06-18").split("-").map(Number);
  const local = new Date(y, m - 1, d, 12);
  const f = o => new Intl.DateTimeFormat("he-IL", o).format(local);
  let heb = "";
  try {
    const hp = Object.fromEntries(new Intl.DateTimeFormat("he-IL-u-ca-hebrew", { day: "numeric", month: "long", year: "numeric" }).formatToParts(local).map(x => [x.type, x.value]));
    heb = `${gem(+hp.day)} ב${hp.month} ${gem(+hp.year % 1000)}`;
  } catch { /* Hebrew calendar may be unavailable */ }
  const first = new Date(y, m - 1, 1).getDay(), days = new Date(y, m, 0).getDate();
  return {
    y, m, d, dd: String(d).padStart(2, "0"), mm: String(m).padStart(2, "0"), yy: String(y).slice(2),
    dow: f({ weekday: "long" }), mon: f({ month: "long" }), long: f({ day: "numeric", month: "long", year: "numeric" }),
    monEn: new Intl.DateTimeFormat("en-US", { month: "short" }).format(local).toUpperCase(),
    heb, time: c.time || "", first, days, start: tzDate(c.date, c.time)
  };
}
const titleOf = c => c.kind === "wedding" ? `${c.a || "…"} & ${c.b || "…"}` : (c.title || "האירוע שלנו");
const placeOf = (c) => [c.venue, c.city].filter(Boolean).join(", ");
const utc = dt => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
function gcalUrl(c, slug) {
  const s = tzDate(c.date, c.time), e = new Date(s.getTime() + 5 * 3600e3);
  const p = new URLSearchParams({ action: "TEMPLATE", text: (c.kind === "wedding" ? "החתונה של " : "") + titleOf(c), dates: `${utc(s)}/${utc(e)}`,
    details: `שמרו את התאריך! ${c.line || ""}\n${hubFullUrl(slug || "save-the-date")}`, location: placeOf(c), ctz: "Asia/Jerusalem" });
  return "https://calendar.google.com/calendar/render?" + p.toString();
}
function icsText(c, slug) {
  const s = tzDate(c.date, c.time), e = new Date(s.getTime() + 5 * 3600e3), x = v => String(v || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const url = hubFullUrl(slug || "save-the-date");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SnapShare//Save the Date//HE", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    `UID:std-${slug || "demo"}-${c.date}@snapshare-live.com`, `DTSTAMP:${utc(new Date())}`, `DTSTART:${utc(s)}`, `DTEND:${utc(e)}`,
    `SUMMARY:${x((c.kind === "wedding" ? "החתונה של " : "") + titleOf(c))}`, `LOCATION:${x(placeOf(c))}`,
    `DESCRIPTION:${x("שמרו את התאריך! " + (c.line || "") + "\n" + url)}`, `URL:${url}`,
    "BEGIN:VALARM", "TRIGGER:-P7D", "ACTION:DISPLAY", "DESCRIPTION:שבוע לאירוע!", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}
const waUrl = (c, slug) => "https://wa.me/?text=" + encodeURIComponent(`שמרו את התאריך! ${titleOf(c)} · ${dateInfo(c).long}${c.time ? " · " + c.time : ""} 🎉\n${hubFullUrl(slug || "save-the-date")}`);

/* ---------- icons ---------- */
const I = {
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.8l5.1-1.3A9.7 9.7 0 1 0 12 2.2zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.5-.3z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  plane: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 15.5v-2l-8-5V3.8a1.5 1.5 0 0 0-3 0v4.7l-8 5v2l8-2.5v5l-2 1.5v1.5l3.5-1 3.5 1v-1.5l-2-1.5v-5z"/></svg>',
  g: '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z"/></svg>',
  apple: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.4 2-3.5 2-3.6a4.3 4.3 0 0 0-3.4-1.8c-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8a4.5 4.5 0 0 0-3.8 2.3c-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3a10 10 0 0 0 1.3-2.6 4 4 0 0 1-2.5-3.6zM14.1 5.6A4 4 0 0 0 15 2.7a4.1 4.1 0 0 0-2.7 1.4 3.8 3.8 0 0 0-1 2.8 3.4 3.4 0 0 0 2.8-1.3z"/></svg>'
};

/* ---------- shared pieces ---------- */
function namesHtml(c, cls) {
  if (c.kind === "wedding") return `<h1 class="nm ${cls || ""}" data-edit="names"><span class="n1">${esc(c.a || "…")}</span><span class="amp">&amp;</span><span class="n2">${esc(c.b || "…")}</span></h1>`;
  return `<h1 class="nm solo ${cls || ""}" data-edit="names">${c.sub ? `<span class="nsub">${esc(c.sub)}</span>` : ""}<span class="n1">${esc(c.title || "האירוע שלנו")}</span></h1>`;
}
const kicker = (he) => `<p class="kick" data-edit="kicker"><span class="en">Save the Date</span>${he === false ? "" : `<span class="he">${esc(he || "שמרו את התאריך")}</span>`}</p>`;
function countdownHtml(D, show) {
  if (!show.countdown) return "";
  return `<div class="cd" dir="ltr" data-cd="${D.start.toISOString()}" data-edit="countdown" aria-label="ספירה לאחור">${[["d", "ימים"], ["h", "שעות"], ["m", "דקות"], ["s", "שניות"]].map(([u, he]) => `<span class="cu"><b data-u="${u}">00</b><i dir="rtl">${he}</i></span>`).join("")}</div>`;
}
function actionsHtml(c, show, slug) {
  if (!show.calendar && !show.whatsapp) return "";
  return `<div class="acts">${show.calendar ? `<div class="calw" data-edit="calendar"><button type="button" class="btn b1" data-calbtn>${I.cal}<span>הוסיפו ליומן</span></button>
    <div class="calmenu" role="menu"><a role="menuitem" href="${esc(gcalUrl(c, slug))}" target="_blank" rel="noopener">${I.g}Google Calendar</a><a role="menuitem" href="#" data-ics>${I.apple}אפל / אאוטלוק (‎.ics)</a></div></div>` : ""}
    ${show.whatsapp ? `<a class="btn b2" data-edit="whatsapp" href="${esc(waUrl(c, slug))}" target="_blank" rel="noopener" aria-label="שיתוף בוואטסאפ">${I.wa}<span>שיתוף</span></a>` : ""}</div>`;
}
const lineHtml = (c, show) => show.line && c.line ? `<p class="line" data-edit="line">${esc(c.line)}</p>` : "";
const footHtml = show => show.footer ? `<p class="foot"><i></i>SnapShare</p>` : "";
const venueHtml = (c, show, pin) => show.venue && (c.venue || c.city) ? `<p class="venue" data-edit="venue">${pin ? I.pin : ""}<span>${esc(placeOf(c))}</span></p>` : "";

/* ---------- styles ---------- */
const R = {};
R.envelope = (c, D, sh, o, slug) => {
  const ini = c.kind === "wedding" ? `${(c.a || "?")[0]}${(c.b || "?")[0]}` : (c.title || "?")[0];
  return `
  <div class="env-wrap" data-open>
    <div class="env ${o.liner ? "liner" : ""}">
      <div class="env-back"></div><div class="env-peek"></div>
      <div class="env-l"></div><div class="env-r"></div><div class="env-b"><span class="to">${esc(titleOf(c))}</span></div>
      <div class="env-flap"></div>
      <button type="button" class="seal" aria-label="פתיחת המעטפה"><span>${esc(ini)}</span></button>
    </div>
    <p class="env-hint">לחצו על החותם לפתיחה</p>
  </div>
  <div class="ecard"><div class="ec-in">
    ${kicker()}
    ${namesHtml(c)}
    <div class="orn"><i></i><span>✦</span><i></i></div>
    <p class="edate" data-edit="date"><span class="dnum">${D.dd}<em>·</em>${D.mm}<em>·</em>${D.y}</span><span class="dsub">${esc(D.dow)}${D.time ? ` · ${esc(D.time)}` : ""}${sh.hebdate && D.heb ? ` · ${esc(D.heb)}` : ""}</span></p>
    ${venueHtml(c, sh)}
    ${countdownHtml(D, sh)}
    ${actionsHtml(c, sh, slug)}
    ${lineHtml(c, sh)}
  </div></div>
  ${footHtml(sh)}`;
};
R.calendar = (c, D, sh, o, slug) => {
  const today = new Date();
  const grid = () => {
    let h = ["א", "ב", "ג", "ד", "ה", "ו", "ש"].map(x => `<b>${x}</b>`).join("");
    for (let i = 0; i < D.first; i++) h += "<span></span>";
    for (let i = 1; i <= D.days; i++) h += `<span class="${i === D.d ? "on" : ""}">${i}${i === D.d ? circle() : ""}</span>`;
    return `<div class="mgrid">${h}</div>`;
  };
  const circle = () => `<svg class="circ" viewBox="0 0 120 100" preserveAspectRatio="none"><path pathLength="1" d="M70 8C40 4 10 20 9 48c-1 30 30 46 60 44 30-2 46-22 44-44C111 22 86 6 56 9 44 10 32 15 26 20"/></svg>`;
  const calHeb = sh.hebdate && D.heb ? `<span class="cal-heb">${esc(D.heb)}</span>` : "";
  return `
  <div class="cal-col">
    <div class="cal ${o.grid ? "has-grid" : ""}" data-edit="date">
      <div class="rings">${"<i></i>".repeat(6)}</div>
      <div class="page prev"><div class="ph"><span>היום</span></div><div class="pb"><b>${today.getDate()}</b><span>${new Intl.DateTimeFormat("he-IL", { weekday: "long" }).format(today)}</span></div></div>
      <div class="page cur"><div class="ph"><span>${esc(D.mon)} ${D.y}</span></div>
        <div class="pb">${o.grid ? `${grid()}${calHeb}` : `<b class="big">${D.d}${circle()}</b><span class="dw">${esc(D.dow)}</span>${calHeb}`}</div></div>
      <div class="page under"></div>
    </div>
  </div>
  <div class="txt-col">
    ${kicker("שמרו את התאריך")}
    ${namesHtml(c)}
    <p class="cmeta" data-edit="date"><b>${esc(D.dow)}, ${esc(D.long)}</b>${D.time ? `<span>בשעה ${esc(D.time)}</span>` : ""}</p>
    ${venueHtml(c, sh, true)}
    ${countdownHtml(D, sh)}
    ${actionsHtml(c, sh, slug)}
    ${lineHtml(c, sh)}
    ${footHtml(sh)}
  </div>`;
};
R.minimal = (c, D, sh, o, slug) => `
  <header class="mtop">${namesHtml(c)}<p class="kick" data-edit="kicker"><span class="en">Save the Date</span></p></header>
  <div class="nums" data-edit="date" dir="ltr"><span class="nl"><span>${D.dd}</span></span><i class="dot">.</i><span class="nl"><span>${D.mm}</span></span><i class="dot">.</i><span class="nl"><span>${D.yy}</span></span></div>
  <footer class="mbot">
    <div class="mdet"><b>${esc(D.dow)}${D.time ? ` · ${esc(D.time)}` : ""}</b>${venueHtml(c, sh)}${sh.hebdate && D.heb ? `<span class="heb">${esc(D.heb)}</span>` : ""}</div>
    ${countdownHtml(D, sh)}
    <div class="mact">${actionsHtml(c, sh, slug)}${lineHtml(c, sh)}</div>
  </footer>
  ${footHtml(sh)}`;
R.polaroid = (c, D, sh, o, slug) => `
  <div class="pol-col">
    <div class="pol-stack" data-edit="photo">
      <div class="pol back"></div>
      <div class="pol front">
        <i class="tape"></i>
        <div class="pimg">${o.photo && c.photo ? `<img src="${esc(c.photo)}" alt="">` : `<div class="pnophoto"><b>${D.d}.${D.m}</b><span>♥</span></div>`}</div>
        <p class="pcap" data-edit="date">${o.photo ? `${D.d}.${D.m}.${D.yy} <span>♥</span>` : esc(titleOf(c))}</p>
      </div>
    </div>
  </div>
  <div class="txt-col">
    <p class="kick hand" data-edit="kicker"><span class="he">שמרו את התאריך!</span></p>
    ${namesHtml(c)}
    <p class="pmeta" data-edit="date">${esc(D.dow)}, ${esc(D.long)}${D.time ? ` · ${esc(D.time)}` : ""}</p>
    ${venueHtml(c, sh, true)}
    ${countdownHtml(D, sh)}
    ${actionsHtml(c, sh, slug)}
    ${lineHtml(c, sh)}
    ${footHtml(sh)}
  </div>`;
R.neon = (c, D, sh, o, slug) => `
  <div class="neo-col">
    <p class="kick neo-s" data-edit="kicker"><span class="en">Save the Date</span><span class="he">שמרו את התאריך</span></p>
    ${namesHtml(c, "neo-t")}
    <div class="neo-date" data-edit="date"><span dir="ltr">${D.dd}.${D.mm}.${D.yy}</span></div>
    <p class="neo-meta" data-edit="date">${esc(D.dow)}${D.time ? ` · ${esc(D.time)}` : ""}${sh.venue && (c.venue || c.city) ? ` · <span data-edit="venue">${esc(placeOf(c))}</span>` : ""}</p>
    ${countdownHtml(D, sh)}
    ${actionsHtml(c, sh, slug)}
    ${lineHtml(c, sh)}
    ${footHtml(sh)}
  </div>`;
R.botanical = (c, D, sh, o, slug) => `
  ${o.petals ? `<div class="petals" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div>` : ""}
  <img class="fc tr" src="/save-the-date/floral-corner.webp" alt=""><img class="fc bl" src="/save-the-date/floral-corner.webp" alt="">
  <div class="bcol">
    ${kicker("שמרו את התאריך")}
    ${namesHtml(c)}
    <p class="bdate" data-edit="date"><span class="dnum">${D.dd}.${D.mm}.${D.y}</span><span class="dsub">${esc(D.dow)}${D.time ? ` · ${esc(D.time)}` : ""}${sh.hebdate && D.heb ? ` · ${esc(D.heb)}` : ""}</span></p>
    ${venueHtml(c, sh)}
    ${countdownHtml(D, sh)}
    ${actionsHtml(c, sh, slug)}
    ${lineHtml(c, sh)}
    ${footHtml(sh)}
  </div>`;
R.scratch = (c, D, sh, o, slug) => `
  <div class="scard">
    ${namesHtml(c)}
    <p class="shint" data-edit="kicker"><span class="pre">יש לנו תאריך! גרדו כדי לגלות 👇</span><span class="post">שמרו את התאריך! 🎉</span></p>
    <div class="ticket" data-edit="date">
      <div class="tk-in"><span class="tk-dow">${esc(D.dow)}</span><b class="tk-d" dir="ltr">${D.dd}.${D.mm}.${D.yy}</b><span class="tk-t">${D.time ? `בשעה ${esc(D.time)}` : ""}</span></div>
      <canvas class="foil" aria-label="גרדו כאן"></canvas><div class="foil-css"><span>גרדו כאן ✨</span></div>
    </div>
    ${venueHtml(c, sh, true)}
    ${countdownHtml(D, sh)}
    ${actionsHtml(c, sh, slug)}
    ${lineHtml(c, sh)}
  </div>
  ${footHtml(sh)}`;
R.boarding = (c, D, sh, o, slug) => {
  const wed = c.kind === "wedding";
  return `
  ${o.photo && c.photo ? `<div class="bp-bg" style="background-image:url('${esc(c.photo)}')"></div>` : `<div class="bp-bg plain"></div>`}
  <div class="bp-col">
    ${kicker("שמרו את התאריך")}
    <div class="bp">
      <div class="bp-h"><span class="air">${I.plane} SnapShare Air</span><span class="bpt">כרטיס עלייה למטוס<span class="en"> · Boarding Pass</span></span></div>
      <div class="bp-main">
        <div class="route" data-edit="venue">
          <div class="ap"><b>TLV</b><small>יוצאים מ: הבית</small></div>
          <div class="fl"><i></i><span class="pl">${I.plane}</span></div>
          <div class="ap to"><b>${wed ? "LOVE" : "PRTY"}</b><small>${esc(c.city || "היעד")}</small></div>
        </div>
        <div class="fields">
          <div class="f wide" data-edit="names"><small>${wed ? "נוסעים" : "חוגגים"}</small><b>${esc(titleOf(c))}</b></div>
          <div class="f" data-edit="date"><small>תאריך</small><b dir="ltr">${D.dd} ${D.monEn} ${D.y}</b></div>
          <div class="f" data-edit="date"><small>עלייה למטוס</small><b dir="ltr">${esc(D.time || "--:--")}</b></div>
          <div class="f" data-edit="venue"><small>שער</small><b>${esc(c.venue || "בקרוב")}</b></div>
          <div class="f"><small>מושב</small><b>ליד הרחבה</b></div>
        </div>
      </div>
      <div class="bp-stub">
        <small>המראה בעוד</small>
        ${countdownHtml(D, sh) || `<b class="stub-d" dir="ltr">${D.dd}.${D.mm}</b>`}
        <div class="barcode" aria-hidden="true"></div><span class="flt" dir="ltr">SS ${D.dd}${D.mm}</span>
      </div>
    </div>
    ${actionsHtml(c, sh, slug)}
    ${lineHtml(c, sh)}
    ${footHtml(sh)}
  </div>`;
};

/* ---------- render ---------- */
function render(cfg, opts) {
  opts = opts || {};
  const st = styleById(cfg.style), o = Object.assign(defaultsFor(st.id), cfg.styleOpts || {});
  const acc = st.accents.find(a => a.id === o.accent) || st.accents[0];
  const sh = Object.assign({}, BASE_SHOW, cfg.show || {});
  const c = cfg.content, D = dateInfo(c);
  const cls = ["std", "s-" + st.id, "k-" + c.kind, opts.mode || "public"];
  Object.keys(o).forEach(k => { if (o[k] === true) cls.push("o-" + k); });
  if (opts.state === "open" || opts.mode === "thumb") cls.push("is-open", "revealed");
  if (opts.still) cls.push("still");
  const foil = acc.foil ? `--foil1:${acc.foil[0]};--foil2:${acc.foil[1]};` : "";
  const accTone = accentIsLight(acc.acc) ? "acc-light" : "acc-dark";
  return `<div class="${cls.join(" ")} ${accTone}" style="--acc:${acc.acc};--bg:${acc.bg};--bg2:${acc.bg2};${foil}--fh:'${st.fonts[0]}';--fb:'${st.fonts[1] || st.fonts[0]}'" data-style="${st.id}">
    <div class="sx">${R[st.id](c, D, sh, o, cfg.slug)}</div><canvas class="confetti" aria-hidden="true"></canvas></div>`;
}

/* ---------- confetti ---------- */
function confetti(root, colors) {
  if (RM()) return;
  const cv = root.querySelector("canvas.confetti"); if (!cv) return;
  cv.width = root.offsetWidth; cv.height = root.offsetHeight; const x = cv.getContext("2d");
  const W = cv.width, H = cv.height, ps = Array.from({ length: 140 }, () => ({
    x: W / 2 + (Math.random() - .5) * W * .2, y: H * .45, vx: (Math.random() - .5) * W * .028, vy: -Math.random() * H * .022 - H * .006,
    s: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: colors[(Math.random() * colors.length) | 0]
  }));
  let t = 0; (function f() {
    x.clearRect(0, 0, W, H); t++;
    ps.forEach(p => { p.vy += H * .0007; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); });
    if (t < 200) requestAnimationFrame(f); else x.clearRect(0, 0, W, H);
  })();
}

/* ---------- behaviour ---------- */
function wire(host, cfg, opts) {
  opts = opts || {};
  const root = host.querySelector(".std"); if (!root) return function unwire() { /* no root */ };
  const c = cfg.content, accColor = getComputedStyle(root).getPropertyValue("--acc").trim();
  const palette = [accColor, "#FFD166", "#EF476F", "#06D6A0", "#FFFFFF", "#118AB2"];
  const timers = [];
  // countdown
  const cd = root.querySelector(".cd");
  if (cd) {
    const t0 = new Date(cd.dataset.cd).getTime();
    const tick = () => {
      const s = Math.max(0, Math.floor((t0 - Date.now()) / 1000));
      const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
      cd.querySelectorAll("[data-u]").forEach(b => { const n = v[b.dataset.u]; b.textContent = b.dataset.u === "d" ? n : String(n).padStart(2, "0"); });
    };
    tick(); if (!opts.still) timers.push(setInterval(tick, 1000));
  }
  // calendar menu + ics
  const cb = root.querySelector("[data-calbtn]");
  if (cb) cb.addEventListener("click", e => { if (opts.builder) return; e.stopPropagation(); cb.parentNode.classList.toggle("open"); });
  root.addEventListener("click", e => { if (!e.target.closest(".calw")) root.querySelectorAll(".calw.open").forEach(w => w.classList.remove("open")); });
  const ics = root.querySelector("[data-ics]");
  if (ics) ics.addEventListener("click", e => {
    e.preventDefault(); if (opts.builder) return;
    const blob = new Blob([icsText(c, cfg.slug)], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `save-the-date-${cfg.slug || "snapshare"}.ics`; document.body.appendChild(a); a.click(); a.remove();
  });
  if (opts.builder) root.querySelectorAll("a[href]").forEach(a => a.addEventListener("click", e => e.preventDefault()));
  // envelope
  if (root.classList.contains("s-envelope")) {
    const open = () => { if (root.classList.contains("is-open")) return; root.classList.add("is-open"); if (root.classList.contains("o-confetti")) timers.push(setTimeout(() => confetti(root, palette), 1150)); };
    root.querySelector(".env-wrap").addEventListener("click", open);
    if (RM()) root.classList.add("is-open");
    root._replay = () => { root.classList.remove("is-open"); };
  }
  // calendar: re-flip on tap
  if (root.classList.contains("s-calendar")) {
    const cal = root.querySelector(".cal");
    root._replay = () => { root.classList.remove("flipped"); void cal.offsetWidth; root.classList.add("replay"); setTimeout(() => root.classList.remove("replay"), 20); };
  }
  // polaroid develop on tap
  if (root.classList.contains("s-polaroid")) {
    const p = root.querySelector(".pol.front");
    const dev = () => { p.classList.remove("dev"); void p.offsetWidth; p.classList.add("dev"); };
    if (!opts.builder) p.addEventListener("click", dev);
    root._replay = dev;
  }
  // neon: tap to flicker
  if (root.classList.contains("s-neon")) {
    const t = root.querySelector(".neo-col");
    const fl = () => { root.classList.remove("zap"); void root.offsetWidth; root.classList.add("zap"); };
    if (!opts.builder) t.addEventListener("click", e => { if (!e.target.closest(".acts")) fl(); });
    root._replay = fl;
  }
  // scratch
  if (root.classList.contains("s-scratch")) {
    const cv = root.querySelector("canvas.foil"), tk = root.querySelector(".ticket");
    const reveal = () => { if (root.classList.contains("revealed")) return; root.classList.add("revealed"); if (root.classList.contains("o-confetti")) confetti(root, palette); };
    const setup = () => {
      if (root.classList.contains("revealed")) return;
      const w = tk.offsetWidth, h = tk.offsetHeight;
      if (!w || !h) {
        if ((setup._tries = (setup._tries || 0) + 1) < 40) requestAnimationFrame(setup);
        return;
      }
      cv.width = w; cv.height = h; const x = cv.getContext("2d");
      const cs = getComputedStyle(root), g = x.createLinearGradient(0, 0, w, h);
      const f1 = cs.getPropertyValue("--foil1").trim() || "#ddd", f2 = cs.getPropertyValue("--foil2").trim() || "#999";
      g.addColorStop(0, f1); g.addColorStop(.5, f2); g.addColorStop(1, f1); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * .35})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      x.fillStyle = "rgba(255,255,255,.95)"; x.font = `700 ${Math.round(h * .2)}px 'Secular One', Rubik, sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.direction = "rtl";
      x.fillText("גרדו כאן ✨", w / 2, h / 2);
      x.globalCompositeOperation = "destination-out"; cv.classList.add("ready");
      let down = false, moves = 0;
      const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * w / r.width, (e.clientY - r.top) * h / r.height]; };
      const draw = e => { const [px, py] = pt(e); x.beginPath(); x.arc(px, py, Math.max(18, h * .2, w * .045), 0, 7); x.fill(); if (++moves % 8 === 0) check(); };
      const check = () => { const d = x.getImageData(0, 0, w, h).data; let cl = 0, n = 0; for (let i = 3; i < d.length; i += 4 * 37) { n++; if (d[i] === 0) cl++; } if (cl / n > .32) reveal(); };
      cv.addEventListener("pointerdown", e => { down = true; cv.setPointerCapture(e.pointerId); draw(e); });
      cv.addEventListener("pointermove", e => { if (down) draw(e); });
      cv.addEventListener("pointerup", () => { down = false; check(); });
      tk.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") reveal(); });
    };
    tk.tabIndex = 0; tk.setAttribute("role", "button"); tk.setAttribute("aria-label", "גרדו או לחצו Enter לגילוי התאריך");
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setup); else setup();
    root._replay = () => { root.classList.remove("revealed"); cv.classList.remove("ready"); setup(); };
    root._reveal = reveal;
  }
  return () => timers.forEach(t => { clearInterval(t); clearTimeout(t); });
}

export { render, wire, esc, dateInfo, titleOf, gcalUrl, icsText, waUrl, confetti, tzDate };
