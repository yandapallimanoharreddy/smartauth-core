var failedAttempts = 0;

try {
    var username = sharedState.get("username");
    if (username !== null) {
        var attrs = idRepository.getAttribute(String(username), "loginFailure");
        if (attrs !== null && attrs.size() > 0) {
            failedAttempts = parseInt(String(attrs.iterator().next())) || 0;
        }
    }
} catch(e) {}

sharedState.put("sa_failed_attempts", String(failedAttempts));

outcome = "true";