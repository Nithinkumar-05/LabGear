

const errorMessage = (message) => {
    // message = message.splice()
    const start = message.indexOf("/") + 1;
    const end = message.indexOf(")");
    message = message.substring(start, end);
    // console.log(message)
    const errorMap = {
        "permission-denied": "You don't have permission to perform this action.",
        "unavailable": "Service is temporarily unavailable. Please try again later.",
        "not-found": "The requested document does not exist.",
        "already-exists": "This document already exists.",
        "deadline-exceeded": "The request took too long. Please try again.",
        "resource-exhausted": "You've exceeded your usage limit. Try again later.",
        "failed-precondition": "The operation could not be performed due to a system constraint.",
        "aborted": "The operation was aborted. Please retry.",
        "out-of-range": "The value is out of the allowed range.",
        "unauthenticated": "You must be logged in to perform this action.",
        "invalid-argument": "The provided data is invalid.",
        "internal": "An internal error occurred. Please try again later.",
        "data-loss": "Critical data loss detected. Contact support.",
        "invalid-credential": "Invalid email or password. Please try again.",
    };

    return errorMap[message] || "An unexpected error occurred. Please try again.";
};

export default errorMessage;
