var outcome = "low";

try {
    var username = String(sharedState.get("username") || "unknown");
    var fp = String(sharedState.get("sa_device_fingerprint") || "unknown");
    var browser = String(sharedState.get("sa_browser") || "unknown");
    var os = String(sharedState.get("sa_os") || "unknown");
    var ip = String(sharedState.get("sa_ip_address") || "unknown");
    var hour = String(sharedState.get("sa_login_hour") || "0");
    var failed = String(sharedState.get("sa_failed_attempts") || "0");
    var timeRisk = String(sharedState.get("sa_time_risk") || "low");

    var payload = "{" +
        "\"user_id\":\"" + username + "\"," +
        "\"ip_address\":\"" + ip + "\"," +
        "\"user_agent\":\"" + browser + "\"," +
        "\"device_fingerprint\":\"" + fp + "\"," +
        "\"login_hour\":" + hour + "," +
        "\"failed_attempts_24h\":" + failed +
    "}";

    var request = new org.forgerock.http.protocol.Request();
    request.setMethod("POST");
    request.setUri("http://localhost:8000/risk-score");
    request.getHeaders().add("Content-Type", "application/json");
    request.setEntity(payload);

    var response = httpClient.send(request).get();
    var responseBody = response.getEntity().getString();

    var score = 0.1;
    var action = "low";

    if (responseBody.indexOf("\"action\"") > -1) {
        if (responseBody.indexOf("\"block\"") > -1) {
            action = "high";
        } else if (responseBody.indexOf("\"stepup\"") > -1) {
            action = "medium";
        } else {
            action = "low";
        }
    }

    sharedState.put("sa_risk_score", responseBody);
    sharedState.put("sa_risk_action", action);

    outcome = action;

} catch(e) {
    sharedState.put("sa_risk_error", String(e));
    outcome = "low";
}