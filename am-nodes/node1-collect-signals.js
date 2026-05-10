var ua = "unknown";
var ip = "unknown";
var browser = "unknown";
var os = "unknown";
var fp = "0";

try {
    var uaVal = requestHeaders.get("user-agent");
    if (uaVal !== null) {
        ua = String(uaVal.toArray()[0]);
    }
} catch(e) {}

try {
    var ipVal = requestHeaders.get("x-forwarded-for");
    if (ipVal !== null) {
        ip = String(ipVal.toArray()[0]);
    }
} catch(e) {}

if (ua.indexOf("Chrome") > -1) browser = "Chrome";
else if (ua.indexOf("Firefox") > -1) browser = "Firefox";
else if (ua.indexOf("Safari") > -1) browser = "Safari";
else if (ua.indexOf("Edge") > -1) browser = "Edge";

if (ua.indexOf("Windows") > -1) os = "Windows";
else if (ua.indexOf("Mac") > -1) os = "MacOS";
else if (ua.indexOf("Linux") > -1) os = "Linux";
else if (ua.indexOf("Android") > -1) os = "Android";
else if (ua.indexOf("iPhone") > -1) os = "iOS";

var hash = 0;
for (var i = 0; i < ua.length; i++) {
    var c = ua.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash = hash & hash;
}
fp = String(Math.abs(hash).toString(16));

logger.error("SmartAuth FP DEBUG:" + fp + " BR:" + browser + " OS:" + os);

sharedState.put("sa_user_agent", ua);
sharedState.put("sa_ip_address", ip);
sharedState.put("sa_browser", browser);
sharedState.put("sa_os", os);
sharedState.put("sa_device_fingerprint", fp);
sharedState.put("sa_login_hour", String(new Date().getHours()));

var pwd = sharedState.get("password");
if (pwd !== null) {
    sharedState.put("password", pwd);
}

outcome = "true";