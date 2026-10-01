/**
 * CloudFront Function — viewer request (cloudfront-js-1.0 or 2.0).
 * See docs/cloudfront-seo.md for where to attach it.
 *
 * Rewrites extensionless routes to real S3 objects (200, no trailing-slash
 * 302) and returns 404 for unknown HTML paths.
 */
function handler(event) {
  var request = event.request;
  var hostHeader = request.headers.host;
  var host = hostHeader && hostHeader.value ? hostHeader.value : "";

  if (host === "www.snapshare-live.com") {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: {
        location: {
          value:
            "https://snapshare-live.com" +
            request.uri +
            queryString(request.querystring),
        },
        "cache-control": { value: "public, max-age=300" },
      },
    };
  }

  var uri = request.uri || "/";

  // Real files: hashed bundles, images, sitemap, robots, favicon, spa.html, 404.html.
  if (/\.[a-zA-Z0-9]+$/.test(uri)) {
    return request;
  }

  var path = uri;
  if (path.length > 1 && path.charAt(path.length - 1) === "/") {
    path = path.slice(0, -1);
  }

  if (path.indexOf("/event/") === 0) {
    request.uri = "/spa.html";
    return request;
  }

  var directoryIndex = {
    "/": "/index.html",
    "/contact-us": "/contact-us/index.html",
    "/order": "/order/index.html",
    "/terms-and-conditions": "/terms-and-conditions/index.html",
    "/digital-wedding-album": "/digital-wedding-album/index.html",
    "/qr-photo-sharing": "/qr-photo-sharing/index.html",
    "/live-photo-wall": "/live-photo-wall/index.html",
    "/pricing": "/pricing/index.html",
    "/bar-bat-mitzvah-digital-album": "/bar-bat-mitzvah-digital-album/index.html",
    "/corporate-event-photo-sharing": "/corporate-event-photo-sharing/index.html",
    "/how-it-works": "/how-it-works/index.html",
    "/henna-engagement-birthday-album": "/henna-engagement-birthday-album/index.html",
    "/login": "/login/index.html",
    "/signup": "/signup/index.html",
    "/forgot-password": "/forgot-password/index.html",
    "/reset-password": "/reset-password/index.html",
    "/email-confirmation": "/email-confirmation/index.html",
    "/logout": "/logout/index.html",
    "/profile": "/profile/index.html",
    "/design": "/design/index.html",
    "/event": "/event/index.html",
    "/order/pay": "/order/pay/index.html",
    "/order/success": "/order/success/index.html",
    "/order/failure": "/order/failure/index.html",
    "/auth/google/callback": "/auth/google/callback/index.html",
  };

  if (directoryIndex[path]) {
    request.uri = directoryIndex[path];
    return request;
  }

  return {
    statusCode: 404,
    statusDescription: "Not Found",
    headers: {
      "content-type": { value: "text/html; charset=UTF-8" },
      "cache-control": { value: "no-store" },
      "x-robots-tag": { value: "noindex, nofollow" },
    },
    body:
      "<!DOCTYPE html><html lang=\"he\" dir=\"rtl\"><head><meta charset=\"utf-8\">" +
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
      "<meta name=\"robots\" content=\"noindex, nofollow\">" +
      "<title>העמוד לא נמצא | SnapShare</title></head><body>" +
      "<h1>העמוד לא נמצא</h1>" +
      "<p>הכתובת שחיפשתם לא קיימת ב-SnapShare.</p>" +
      "<p><a href=\"https://snapshare-live.com/\">חזרה לדף הבית</a></p>" +
      "</body></html>",
  };
}

function queryString(querystring) {
  if (!querystring) return "";
  var parts = [];
  for (var key in querystring) {
    if (!Object.prototype.hasOwnProperty.call(querystring, key)) continue;
    var entry = querystring[key];
    if (entry.multiValue && entry.multiValue.length) {
      for (var i = 0; i < entry.multiValue.length; i++) {
        parts.push(
          encodeURIComponent(key) +
            "=" +
            encodeURIComponent(entry.multiValue[i].value || "")
        );
      }
    } else if (entry.value) {
      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(entry.value));
    } else {
      parts.push(encodeURIComponent(key));
    }
  }
  return parts.length ? "?" + parts.join("&") : "";
}
