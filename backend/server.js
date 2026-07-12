const crypto = require("crypto");
const express = require("express");
const cors = require('cors');
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const db = require("./database/db");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const frontendRoot = resolveFrontendRoot();
const pagesRoot = path.join(frontendRoot, "pages");
const scriptsRoot = path.join(frontendRoot, "scripts");
const assetsRoot = path.join(frontendRoot, "assets");
const supportRoot = path.join(frontendRoot, "support");
const ADMIN_SESSION_COOKIE = "ziggylabs_admin_session";
const ADMIN_SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 12;
const ADMIN_PASSWORD_HASH = requireEnv("ADMIN_PASSWORD_HASH");
const ADMIN_SESSION_SECRET = requireEnv("ADMIN_SESSION_SECRET");

// Allows JSON to be received
app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://ziggylabs.dev', 
    'https://support.ziggylabs.dev' // FIX: Ensure this is your support subdomain link!
  ],
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

const PLAN_NAME_BY_ID = {
    "starter-website": "Starter",
    "standard-website": "Standard",
    "professional-website": "Professional",
    "enterprise-website": "Enterprise",
    "fix-site-plan": "Fix Site Plan",
    "not-sure-plan": "Not Sure Which Option Is Right"
};

const WEBSITE_GOAL_LABELS = {
    landing: "Landing page",
    business: "Business site",
    shop: "Online store",
    portfolio: "Portfolio"
};

const TIMELINE_LABELS = {
    asap: "ASAP",
    "2-4-weeks": "2-4 weeks",
    "1-2-months": "1-2 months"
};

const ALLOWED_STATUS = new Set(["new", "in-progress", "finished"]);
const ALLOWED_PAYMENT_STATUS = new Set(["waiting", "paid"]);
const ALLOWED_CORS_ORIGINS = new Set([
    "https://ziggylabs.dev",
    "https://support.ziggylabs.dev"
]);

function resolveFrontendRoot() {
    const configured = process.env.FRONTEND_ROOT ? path.resolve(process.env.FRONTEND_ROOT) : null;
    if (configured) {
        if (fsExists(path.join(configured, "index.html"))) {
            return configured;
        }

        const configuredPublic = path.join(configured, "public");
        if (fsExists(path.join(configuredPublic, "index.html"))) {
            return configuredPublic;
        }
    }

    const parent = path.join(__dirname, "..");
    const parentPublicHtml = path.join(parent, "public_html");
    if (fsExists(path.join(parentPublicHtml, "index.html"))) {
        return parentPublicHtml;
    }

    const parentPublic = path.join(parent, "public");
    if (fsExists(path.join(parentPublic, "index.html"))) {
        return parentPublic;
    }

    if (fsExists(path.join(parent, "index.html"))) {
        return parent;
    }

    return __dirname;
}

function fsExists(filePath) {
    try {
        return require("fs").existsSync(filePath);
    } catch {
        return false;
    }
}

function requireEnv(name) {
    const value = process.env[name];

    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value.trim();
}

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function goalLabel(value) {
    const goal = getTrimmedString(value);
    return WEBSITE_GOAL_LABELS[goal] || goal;
}

function timelineLabel(value) {
    const timeline = getTrimmedString(value);
    return TIMELINE_LABELS[timeline] || timeline;
}

function safeParseAddons(value) {
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function sanitizeAddons(rawAddons) {
    if (!Array.isArray(rawAddons)) return [];

    return rawAddons
        .map((addon) => {
            const name = getTrimmedString(addon?.name);
            const unitPrice = toNumber(addon?.unitPrice, toNumber(addon?.price, 0));
            const quantity = Math.max(1, Math.floor(toNumber(addon?.quantity, 1)));
            const totalPrice = toNumber(addon?.totalPrice, unitPrice * quantity);
            const type = getTrimmedString(addon?.type) || null;
            const key = getTrimmedString(addon?.key) || null;
            const details = addon?.details && typeof addon.details === "object" ? addon.details : null;

            if (!name) return null;

            return {
                name,
                type,
                key,
                quantity,
                unitPrice,
                totalPrice,
                details
            };
        })
        .filter(Boolean);
}

function sumAddonTotals(addons) {
    return addons.reduce((sum, addon) => sum + toNumber(addon.totalPrice, 0), 0);
}

function normalizeClientRow(row) {
    const addons = Array.isArray(row.addons) ? row.addons : safeParseAddons(row.addons);
    const planPrice = toNumber(row.planPrice, 0);
    const maintenancePrice = toNumber(row.maintenancePrice, 0);
    const computedTotal = planPrice + maintenancePrice + sumAddonTotals(addons);
    const total = toNumber(row.total, computedTotal);

    return {
        id: row.id,
        name: getTrimmedString(row.name),
        email: getTrimmedString(row.email),
        phone: getTrimmedString(row.phone),
        plan: getTrimmedString(row.plan) || "Unknown",
        planId: getTrimmedString(row.planId) || null,
        planPrice,
        maintenance: getTrimmedString(row.maintenance) || null,
        maintenanceId: getTrimmedString(row.maintenanceId) || null,
        maintenancePrice,
        websiteGoal: getTrimmedString(row.websiteGoal),
        timeline: getTrimmedString(row.timeline),
        projectDetails: getTrimmedString(row.projectDetails),
        notes: getTrimmedString(row.notes),
        status: ALLOWED_STATUS.has(row.status) ? row.status : "new",
        paymentStatus: ALLOWED_PAYMENT_STATUS.has(row.paymentStatus) ? row.paymentStatus : "waiting",
        addons,
        total,
        date: getTrimmedString(row.date),
        createdAt: row.createdAt,
        submittedAt: row.submittedAt || null
    };
}

function normalizeBugReportRow(row) {
    return {
        id: row.id,
        name: getTrimmedString(row.name) || "Anonymous",
        email: getTrimmedString(row.email) || null,
        pageUrl: getTrimmedString(row.pageUrl) || null,
        summary: getTrimmedString(row.summary),
        details: getTrimmedString(row.details),
        createdAt: row.createdAt,
        date: getTrimmedString(row.date)
    };
}

const insertPlanRequestStatement = db.prepare(`
INSERT INTO clients (
    name,
    email,
    phone,
    plan,
    planId,
    planPrice,
    maintenance,
    maintenanceId,
    maintenancePrice,
    websiteGoal,
    timeline,
    projectDetails,
    notes,
    total,
    addons,
    status,
    paymentStatus,
    submittedAt
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const selectAllClientsStatement = db.prepare(`
SELECT
    id,
    name,
    email,
    phone,
    plan,
    planId,
    planPrice,
    maintenance,
    maintenanceId,
    maintenancePrice,
    websiteGoal,
    timeline,
    projectDetails,
    notes,
    total,
    status,
    paymentStatus,
    addons,
    submittedAt,
    createdAt,
    DATE(createdAt) AS date
FROM clients
ORDER BY DATETIME(createdAt) DESC
`);

const selectClientByIdStatement = db.prepare(`
SELECT
    id,
    name,
    email,
    phone,
    plan,
    planId,
    planPrice,
    maintenance,
    maintenanceId,
    maintenancePrice,
    websiteGoal,
    timeline,
    projectDetails,
    notes,
    total,
    status,
    paymentStatus,
    addons,
    submittedAt,
    createdAt,
    DATE(createdAt) AS date
FROM clients
WHERE id = ?
`);

const deleteClientStatement = db.prepare(`
DELETE FROM clients
WHERE id = ?
`);

const insertBugReportStatement = db.prepare(`
INSERT INTO bug_reports (
    name,
    email,
    pageUrl,
    summary,
    details
)
VALUES (?, ?, ?, ?, ?)
`);

const selectAllBugReportsStatement = db.prepare(`
SELECT
    id,
    name,
    email,
    pageUrl,
    summary,
    details,
    createdAt,
    DATE(createdAt) AS date
FROM bug_reports
ORDER BY DATETIME(createdAt) DESC
`);

const selectBugReportByIdStatement = db.prepare(`
SELECT
    id,
    name,
    email,
    pageUrl,
    summary,
    details,
    createdAt,
    DATE(createdAt) AS date
FROM bug_reports
WHERE id = ?
`);

const deleteBugReportStatement = db.prepare(`
DELETE FROM bug_reports
WHERE id = ?
`);

function getTrimmedString(value) {
    return typeof value === "string" ? value.trim() : "";
}

function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};

    return cookieHeader.split(";").reduce((cookies, part) => {
        const separatorIndex = part.indexOf("=");
        if (separatorIndex === -1) return cookies;

        const key = part.slice(0, separatorIndex).trim();
        const value = part.slice(separatorIndex + 1).trim();

        if (!key) return cookies;

        cookies[key] = decodeURIComponent(value);
        return cookies;
    }, {});
}

function toBase64Url(value) {
    return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value) {
    return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value) {
    return crypto.createHmac("sha256", ADMIN_SESSION_SECRET).update(value).digest("base64url");
}

function createAdminSessionToken() {
    const payload = {
        role: "admin",
        exp: Date.now() + ADMIN_SESSION_MAX_AGE_MS
    };
    const encodedPayload = toBase64Url(JSON.stringify(payload));
    const signature = signValue(encodedPayload);

    return `${encodedPayload}.${signature}`;
}

function readAdminSession(req) {
    const token = parseCookies(req.headers.cookie)[ADMIN_SESSION_COOKIE];
    if (!token) return null;

    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    const expectedSignature = signValue(encodedPayload);
    const providedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (providedBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) return null;

    try {
        const payload = JSON.parse(fromBase64Url(encodedPayload));
        if (payload.role !== "admin" || !Number.isFinite(payload.exp) || payload.exp <= Date.now()) {
            return null;
        }
        return payload;
    } catch {
        return null;
    }
}

function buildCookieAttributes(req, maxAgeMs) {
    const attributes = [
        `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(createAdminSessionToken())}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Strict",
        `Max-Age=${Math.floor(maxAgeMs / 1000)}`
    ];

    if (req.secure || req.headers["x-forwarded-proto"] === "https") {
        attributes.push("Secure");
    }

    return attributes.join("; ");
}

function setAdminSessionCookie(req, res) {
    res.setHeader("Set-Cookie", buildCookieAttributes(req, ADMIN_SESSION_MAX_AGE_MS));
}

function clearAdminSessionCookie(req, res) {
    const attributes = [
        `${ADMIN_SESSION_COOKIE}=`,
        "Path=/",
        "HttpOnly",
        "SameSite=Strict",
        "Max-Age=0"
    ];

    if (req.secure || req.headers["x-forwarded-proto"] === "https") {
        attributes.push("Secure");
    }

    res.setHeader("Set-Cookie", attributes.join("; "));
}

function isValidAdminPassword(input) {
    const password = getTrimmedString(input);
    const [salt, expectedHash] = ADMIN_PASSWORD_HASH.split(":");
    if (!password || !salt || !expectedHash) return false;

    const candidateHash = crypto.scryptSync(password, salt, 64).toString("hex");
    const candidateBuffer = Buffer.from(candidateHash, "hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");

    return candidateBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
}

function requireAdminAuth(req, res, next) {
    const session = readAdminSession(req);
    if (!session) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    req.adminSession = session;
    next();
}

function requireAdminPage(fileName) {
    return (req, res) => {
        if (!readAdminSession(req)) {
            return res.redirect("/admin/login");
        }

        res.sendFile(path.join(frontendRoot, "pages", fileName));
    };
}

function sendPage(fileName) {
    return (req, res) => {
        res.sendFile(path.join(frontendRoot, "pages", fileName));
    };
}

function sendSupportPage(fileName) {
    return (req, res) => {
        res.sendFile(path.join(frontendRoot, "support", fileName));
    };
}

function getRequestHost(req) {
    const rawHost = (req.headers["x-forwarded-host"] || req.headers.host || "").toString().trim().toLowerCase();
    return rawHost.replace(/:\d+$/, "");
}

function isSupportSubdomainRequest(req) {
    const host = getRequestHost(req);
    return host === "support.ziggylabs.dev" || host.startsWith("support.");
}

function getSiteBaseUrl(req) {
    const proto = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.get("host");
    return `${proto}://${host}`;
}

const publicStaticOptions = {
    dotfiles: "deny",
    fallthrough: false,
    index: false,
    redirect: false
};

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

function validateBugReport(body) {
    if (!body || typeof body !== "object") {
        return "Request body is required.";
    }

    const summary = getTrimmedString(body.summary);
    const details = getTrimmedString(body.details);

    if (!summary || !details) {
        return "Summary and details are required.";
    }

    if (summary.length > 180) {
        return "Summary must be 180 characters or fewer.";
    }

    if (details.length > 4000) {
        return "Details must be 4000 characters or fewer.";
    }

    return null;
}

// Allow frontend requests from local file/static hosts and the production domains.
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const normalizedOrigin = typeof origin === "string" ? origin.trim().toLowerCase() : "";
    const isLocalOrigin = normalizedOrigin === "null" || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);
    const isAllowedOrigin = isLocalOrigin || ALLOWED_CORS_ORIGINS.has(normalizedOrigin);

    if (isAllowedOrigin && origin) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Vary", "Origin");
    }

    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use((req, res, next) => {
    if (req.path === "/backend" || req.path.startsWith("/backend/")) {
        return res.status(404).send("Not found");
    }

    next();
});

app.get("/", (req, res) => {
    if (isSupportSubdomainRequest(req)) {
        return sendSupportPage("index.html")(req, res);
    }

    res.sendFile(path.join(frontendRoot, "index.html"));
});

app.get("/index.html", (req, res) => {
    res.redirect(301, "/");
});

app.get("/style.css", (req, res) => {
    res.sendFile(path.join(frontendRoot, "style.css"));
});

app.get("/dictionary.json", (req, res) => {
    res.sendFile(path.join(frontendRoot, "dictionary.json"));
});

app.get("/robots.txt", (req, res) => {
    const baseUrl = getSiteBaseUrl(req);

    res.type("text/plain").send([
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /admin/",
        "Disallow: /pages/admin",
        "Disallow: /pages/admin/",
        "Disallow: /api/admin",
        "Disallow: /pages/",
        `Sitemap: ${baseUrl}/sitemap.xml`
    ].join("\n"));
});

app.get("/sitemap.xml", (req, res) => {
    const baseUrl = getSiteBaseUrl(req);
    const lastModified = new Date().toISOString();
    const publicPages = [
        "/",
        "/about",
        "/pricing",
        "/terms-of-service",
        "/privacy-policy"
    ];

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...publicPages.map((pagePath, index) => [
            "  <url>",
            `    <loc>${baseUrl}${pagePath}</loc>`,
            `    <lastmod>${lastModified}</lastmod>`,
            "    <changefreq>weekly</changefreq>",
            `    <priority>${index === 0 ? "1.0" : "0.6"}</priority>`,
            "  </url>"
        ].join("\n")),
        "</urlset>"
    ].join("\n");

    res.type("application/xml").send(xml);
});

app.get("/client", (req, res) => {
    if (isSupportSubdomainRequest(req)) {
        return sendSupportPage("client/index.html")(req, res);
    }

    res.redirect(301, "https://support.ziggylabs.dev/client");
});

app.get("/bug-style.css", (req, res, next) => {
    if (!isSupportSubdomainRequest(req)) {
        return next();
    }

    res.sendFile(path.join(supportRoot, "bug-style.css"));
});

app.get("/bug-script.js", (req, res, next) => {
    if (!isSupportSubdomainRequest(req)) {
        return next();
    }

    res.sendFile(path.join(supportRoot, "bug-script.js"));
});

app.get("/report-bug.html", (req, res) => {
    if (isSupportSubdomainRequest(req)) {
        return res.redirect(301, "/");
    }

    res.redirect(301, "https://support.ziggylabs.dev/");
});

app.get("/client-report-bug.html", (req, res) => {
    if (isSupportSubdomainRequest(req)) {
        return res.redirect(301, "/client");
    }

    res.redirect(301, "https://support.ziggylabs.dev/client");
});

app.get("/report-bug", (req, res) => {
    if (isSupportSubdomainRequest(req)) {
        return res.redirect(301, "/");
    }

    res.redirect(301, "https://support.ziggylabs.dev/");
});

app.get("/pages/report-bug.html", (req, res) => {
    if (isSupportSubdomainRequest(req)) {
        return res.redirect(301, "/");
    }

    res.redirect(301, "https://support.ziggylabs.dev/");
});

app.get("/pages/client-report-bug.html", (req, res) => {
    if (isSupportSubdomainRequest(req)) {
        return res.redirect(301, "/client");
    }

    res.redirect(301, "https://support.ziggylabs.dev/client");
});


app.get(["/about", "/about/"], sendPage("about.html"));
app.get(["/pricing", "/pricing/"], sendPage("pricing.html"));
app.get(["/terms-of-service", "/terms-of-service/"], sendPage("terms-of-service.html"));
app.get(["/privacy-policy", "/privacy-policy/"], sendPage("privacy-policy.html"));
app.get("/admin/login", sendPage("admin-login.html"));
app.get("/admin", requireAdminPage("admin.html"));
app.get("/admin/client", requireAdminPage("admin-client.html"));
app.get("/admin/bugs", requireAdminPage("admin-bugs.html"));

// Support legacy page URLs alongside clean URLs.
app.get("/pages/about.html", (req, res) => res.redirect(301, "/about"));
app.get("/pages/pricing.html", (req, res) => res.redirect(301, "/pricing"));
app.get("/pages/terms-of-service.html", (req, res) => res.redirect(301, "/terms-of-service"));
app.get("/pages/privacy-policy.html", (req, res) => res.redirect(301, "/privacy-policy"));
app.get("/pages/admin-login.html", sendPage("admin-login.html"));
app.get("/pages/admin.html", requireAdminPage("admin.html"));
app.get("/pages/admin-client.html", requireAdminPage("admin-client.html"));
app.get("/pages/admin-bugs.html", requireAdminPage("admin-bugs.html"));

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

    const selectedAddons = sanitizeAddons(req.body.addons);
    const addonTotal = sumAddonTotals(selectedAddons);
    const planId = getTrimmedString(req.body.plan?.id);
    const planName = PLAN_NAME_BY_ID[planId] || planId || "Unknown";
    const planPrice = toNumber(req.body.plan?.basePrice, 0);
    const maintenancePrice = toNumber(req.body.maintenance?.price, 0);
    const fallbackTotal = planPrice + maintenancePrice + addonTotal;
    const total = toNumber(req.body.plan?.finalTotal, fallbackTotal);

    const insertResult = insertPlanRequestStatement.run(
        getTrimmedString(req.body.questionnaire?.name),
        getTrimmedString(req.body.questionnaire?.email),
        getTrimmedString(req.body.questionnaire?.phone),
        planName,
        planId,
        planPrice,
        getTrimmedString(req.body.maintenance?.name),
        getTrimmedString(req.body.maintenance?.id),
        maintenancePrice,
        goalLabel(req.body.questionnaire?.websiteGoal),
        timelineLabel(req.body.questionnaire?.timeline),
        getTrimmedString(req.body.questionnaire?.projectDetails),
        "",
        total,
        JSON.stringify(selectedAddons),
        "new",
        "waiting",
        getTrimmedString(req.body.submittedAt) || new Date().toISOString()
    );

    res.json({
        success: true,
        id: insertResult.lastInsertRowid,
        message: "Plan request received!"
    });
});

app.post("/api/bug-reports", (req, res) => {
    const validationError = validateBugReport(req.body);
    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        });
    }

    const insertResult = insertBugReportStatement.run(
        getTrimmedString(req.body.name),
        getTrimmedString(req.body.email),
        getTrimmedString(req.body.pageUrl),
        getTrimmedString(req.body.summary),
        getTrimmedString(req.body.details)
    );

    res.status(201).json({
        success: true,
        id: insertResult.lastInsertRowid,
        message: "Bug report received."
    });
});

app.get("/api/admin/session", (req, res) => {
    const session = readAdminSession(req);

    res.json({
        success: true,
        authenticated: Boolean(session)
    });
});

app.post("/api/admin/login", (req, res) => {
    if (!isValidAdminPassword(req.body?.password)) {
        clearAdminSessionCookie(req, res);
        return res.status(401).json({
            success: false,
            message: "Invalid password."
        });
    }

    setAdminSessionCookie(req, res);
    res.json({
        success: true
    });
});

app.post("/api/admin/logout", (req, res) => {
    clearAdminSessionCookie(req, res);
    res.json({
        success: true
    });
});

app.get("/api/admin/bug-reports", requireAdminAuth, (req, res) => {
    const reports = selectAllBugReportsStatement.all().map(normalizeBugReportRow);

    res.json({
        success: true,
        reports
    });
});

app.delete("/api/admin/bug-reports/:id", requireAdminAuth, (req, res) => {
    const reportId = parseInt(req.params.id, 10);
    if (!Number.isInteger(reportId) || reportId <= 0) {
        return res.status(400).json({ success: false, message: "Invalid bug report id." });
    }

    const report = selectBugReportByIdStatement.get(reportId);
    if (!report) {
        return res.status(404).json({ success: false, message: "Bug report not found." });
    }

    deleteBugReportStatement.run(reportId);

    res.json({
        success: true,
        message: "Bug report deleted."
    });
});

app.get("/api/admin/clients", requireAdminAuth, (req, res) => {
    const rows = selectAllClientsStatement.all();
    const clients = rows.map(normalizeClientRow);

    res.json({
        success: true,
        clients
    });
});

app.get("/api/admin/clients/:id", requireAdminAuth, (req, res) => {
    const clientId = parseInt(req.params.id, 10);
    if (!Number.isInteger(clientId) || clientId <= 0) {
        return res.status(400).json({ success: false, message: "Invalid client id." });
    }

    const row = selectClientByIdStatement.get(clientId);
    if (!row) {
        return res.status(404).json({ success: false, message: "Client not found." });
    }

    res.json({
        success: true,
        client: normalizeClientRow(row)
    });
});

app.patch("/api/admin/clients/:id", requireAdminAuth, (req, res) => {
    const clientId = parseInt(req.params.id, 10);
    if (!Number.isInteger(clientId) || clientId <= 0) {
        return res.status(400).json({ success: false, message: "Invalid client id." });
    }

    const row = selectClientByIdStatement.get(clientId);
    if (!row) {
        return res.status(404).json({ success: false, message: "Client not found." });
    }

    const updates = [];
    const values = [];
    let nextPlanPrice = toNumber(row.planPrice, 0);
    let nextMaintenancePrice = toNumber(row.maintenancePrice, 0);
    let nextAddons = safeParseAddons(row.addons);

    if (Object.prototype.hasOwnProperty.call(req.body, "status")) {
        const status = getTrimmedString(req.body.status);
        if (!ALLOWED_STATUS.has(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value." });
        }
        updates.push("status = ?");
        values.push(status);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "paymentStatus")) {
        const paymentStatus = getTrimmedString(req.body.paymentStatus);
        if (!ALLOWED_PAYMENT_STATUS.has(paymentStatus)) {
            return res.status(400).json({ success: false, message: "Invalid paymentStatus value." });
        }
        updates.push("paymentStatus = ?");
        values.push(paymentStatus);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "notes")) {
        if (typeof req.body.notes !== "string") {
            return res.status(400).json({ success: false, message: "Notes must be a string." });
        }
        updates.push("notes = ?");
        values.push(req.body.notes.trim());
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "planPrice")) {
        const planPrice = Number(req.body.planPrice);
        if (!Number.isFinite(planPrice) || planPrice < 0) {
            return res.status(400).json({ success: false, message: "planPrice must be a non-negative number." });
        }

        nextPlanPrice = planPrice;
        updates.push("planPrice = ?");
        values.push(planPrice);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "maintenancePrice")) {
        const maintenancePrice = Number(req.body.maintenancePrice);
        if (!Number.isFinite(maintenancePrice) || maintenancePrice < 0) {
            return res.status(400).json({ success: false, message: "maintenancePrice must be a non-negative number." });
        }

        nextMaintenancePrice = maintenancePrice;
        updates.push("maintenancePrice = ?");
        values.push(maintenancePrice);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "addons")) {
        nextAddons = sanitizeAddons(req.body.addons);

        updates.push("addons = ?");
        values.push(JSON.stringify(nextAddons));
    }

    if (
        Object.prototype.hasOwnProperty.call(req.body, "planPrice") ||
        Object.prototype.hasOwnProperty.call(req.body, "maintenancePrice") ||
        Object.prototype.hasOwnProperty.call(req.body, "addons")
    ) {
        const recalculatedTotal = nextPlanPrice + nextMaintenancePrice + sumAddonTotals(nextAddons);
        updates.push("total = ?");
        values.push(recalculatedTotal);
    }

    if (!updates.length) {
        return res.status(400).json({ success: false, message: "No valid fields provided for update." });
    }

    values.push(clientId);
    db.prepare(`UPDATE clients SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    const updatedRow = selectClientByIdStatement.get(clientId);

    res.json({
        success: true,
        client: normalizeClientRow(updatedRow)
    });
});

app.delete("/api/admin/clients/:id", requireAdminAuth, (req, res) => {
    const clientId = parseInt(req.params.id, 10);
    if (!Number.isInteger(clientId) || clientId <= 0) {
        return res.status(400).json({ success: false, message: "Invalid client id." });
    }

    const row = selectClientByIdStatement.get(clientId);
    if (!row) {
        return res.status(404).json({ success: false, message: "Client not found." });
    }

    deleteClientStatement.run(clientId);

    res.json({
        success: true,
        message: "Client deleted."
    });
});

app.use(express.static(frontendRoot, publicStaticOptions));

app.use("/scripts", express.static(scriptsRoot, publicStaticOptions));
app.use("/assets", express.static(assetsRoot, publicStaticOptions));
app.use("/Assets", express.static(assetsRoot, publicStaticOptions));
app.use("/support", express.static(supportRoot, publicStaticOptions));

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});