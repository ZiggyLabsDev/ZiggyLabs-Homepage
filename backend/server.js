const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

function getTrimmedString(value) {
    return typeof value === "string" ? value.trim() : "";
}

function validatePlanRequest(body) {
    if (!body || typeof body !== "object") {
        return "Request body is required.";
    }

    const planId = getTrimmedString(body.plan?.id);
    const questionnaire = body.questionnaire;
    const name = getTrimmedString(questionnaire?.name);
    const email = getTrimmedString(questionnaire?.email);
    const projectDetails = getTrimmedString(questionnaire?.projectDetails);

    if (!planId) {
        return "A plan id is required.";
    }

    if (!name || !email || !projectDetails) {
        return "Name, email, and project details are required.";
    }

    return null;
}

// Allows JSON to be received
app.use(express.json());

// Allow frontend requests from local file/static hosts.
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

const frontendRoot = path.join(__dirname, "..");
app.use(express.static(frontendRoot));

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendRoot, "index.html"));
});

// Test route
app.get("/api/test", (req, res) => {
    res.json({
        message: "Backend is working!"
    });
});

// Contact form route
app.post("/api/contact", (req, res) => {
    console.log(req.body);

    res.json({
        success: true,
        message: "Contact form received!"
    });
});

// Plan questionnaire route
app.post("/api/plan-request", (req, res) => {
    const validationError = validatePlanRequest(req.body);
    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        });
    }

    console.log("New plan request received:");
    console.log(JSON.stringify(req.body, null, 2));

    res.json({
        success: true,
        message: "Plan request received!"
    });
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});