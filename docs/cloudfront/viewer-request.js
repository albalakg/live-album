/**
 * Proposed CloudFront viewer-request function. Not deployed.
 * Runtime: cloudfront-js-2.0. Associate with the default behavior.
 *
 * Marketing HTML is the Astro build. The Vue app is uploaded as /spa.html
 * plus its /js, /css and /assets. See docs/routing-and-deploy.md.
 */
function handler(event) {
  var request = event.request;
  var host = request.headers.host && request.headers.host.value;
  var uri = request.uri || "/";

  if (host === "www.snapshare-live.com") {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: {
        location: { value: "https://snapshare-live.com" + uri + queryString(request) },
      },
    };
  }

  if (hasExtension(uri)) {
    return request;
  }

  if (isAppPath(uri)) {
    request.uri = "/spa.html";
    return request;
  }

  if (uri === "/" || uri === "") {
    request.uri = "/index.html";
    return request;
  }

  var clean = uri.replace(/\/+$/, "");
  request.uri = clean + "/index.html";
  return request;
}

function queryString(request) {
  var qs = request.querystring || {};
  var keys = Object.keys(qs);
  if (!keys.length) return "";
  var parts = keys.map(function (key) {
    var item = qs[key];
    if (item.multiValue) {
      return item.multiValue
        .map(function (value) {
          return encodeURIComponent(key) + "=" + encodeURIComponent(value.value);
        })
        .join("&");
    }
    return encodeURIComponent(key) + "=" + encodeURIComponent(item.value || "");
  });
  return "?" + parts.join("&");
}

function hasExtension(uri) {
  var last = uri.split("/").pop() || "";
  return last.indexOf(".") !== -1;
}

function isAppPath(uri) {
  var path = uri.replace(/\/+$/, "") || "/";
  var prefixes = [
    "/login",
    "/logout",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/email-confirmation",
    "/auth",
    "/contact-us",
    "/order",
    "/terms-and-conditions",
    "/event",
    "/profile",
    "/admin",
    "/design",
    "/qr-cards",
    "/preview",
  ];
  for (var i = 0; i < prefixes.length; i++) {
    var prefix = prefixes[i];
    if (path === prefix || path.indexOf(prefix + "/") === 0) return true;
  }
  return false;
}
