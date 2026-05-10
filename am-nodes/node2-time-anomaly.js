var loginHour = parseInt(sharedState.get("sa_login_hour"));
var riskFlag = "low";

if (loginHour >= 0 && loginHour < 6) {
    riskFlag = "high";
} else if (loginHour >= 23 || loginHour < 8) {
    riskFlag = "medium";
}

sharedState.put("sa_time_risk", riskFlag);
sharedState.put("sa_login_hour_check", String(loginHour));

logger.message("SmartAuth Node2 Hour:" + loginHour + " Risk:" + riskFlag);

outcome = "true";