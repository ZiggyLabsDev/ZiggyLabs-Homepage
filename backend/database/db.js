const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "database.json");

function nowIso() {
    return new Date().toISOString();
}

function toDateOnly(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
}

function createInitialState() {
    return {
        meta: {
            nextClientId: 1,
            nextBugReportId: 1
        },
        clients: [],
        bugReports: []
    };
}

function ensureStateShape(state) {
    if (!state || typeof state !== "object") return createInitialState();

    if (!state.meta || typeof state.meta !== "object") {
        state.meta = { nextClientId: 1, nextBugReportId: 1 };
    }

    state.meta.nextClientId = Number.isInteger(state.meta.nextClientId) && state.meta.nextClientId > 0
        ? state.meta.nextClientId
        : 1;

    state.meta.nextBugReportId = Number.isInteger(state.meta.nextBugReportId) && state.meta.nextBugReportId > 0
        ? state.meta.nextBugReportId
        : 1;

    if (!Array.isArray(state.clients)) state.clients = [];
    if (!Array.isArray(state.bugReports)) state.bugReports = [];

    return state;
}

function loadState() {
    if (!fs.existsSync(DATA_PATH)) {
        const initial = createInitialState();
        fs.writeFileSync(DATA_PATH, JSON.stringify(initial, null, 2));
        return initial;
    }

    try {
        const raw = fs.readFileSync(DATA_PATH, "utf8");
        const parsed = JSON.parse(raw);
        return ensureStateShape(parsed);
    } catch {
        const fallback = createInitialState();
        fs.writeFileSync(DATA_PATH, JSON.stringify(fallback, null, 2));
        return fallback;
    }
}

function saveState(state) {
    const normalized = ensureStateShape(state);
    const tempPath = `${DATA_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(normalized, null, 2));
    fs.renameSync(tempPath, DATA_PATH);
}

const state = loadState();

function selectAllClients() {
    return [...state.clients]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((client) => ({
            ...client,
            date: toDateOnly(client.createdAt)
        }));
}

function selectClientById(id) {
    const client = state.clients.find((item) => item.id === id);
    if (!client) return undefined;

    return {
        ...client,
        date: toDateOnly(client.createdAt)
    };
}

function insertClient(values) {
    const [
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
    ] = values;

    const id = state.meta.nextClientId++;
    const row = {
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
        addons,
        status,
        paymentStatus,
        submittedAt,
        createdAt: nowIso()
    };

    state.clients.push(row);
    saveState(state);

    return { lastInsertRowid: id };
}

function updateClientFromSql(sql, values) {
    const match = sql.match(/UPDATE\s+clients\s+SET\s+(.+)\s+WHERE\s+id\s*=\s*\?/i);
    if (!match) {
        throw new Error("Unsupported UPDATE statement");
    }

    const assignments = match[1]
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
            const fieldMatch = part.match(/^([a-zA-Z0-9_]+)\s*=\s*\?$/);
            if (!fieldMatch) {
                throw new Error(`Unsupported assignment expression: ${part}`);
            }
            return fieldMatch[1];
        });

    if (!assignments.length) {
        throw new Error("No assignment fields provided");
    }

    const id = Number(values[values.length - 1]);
    const client = state.clients.find((item) => item.id === id);
    if (!client) {
        return { changes: 0 };
    }

    assignments.forEach((field, index) => {
        client[field] = values[index];
    });

    saveState(state);
    return { changes: 1 };
}

function deleteClientById(id) {
    const index = state.clients.findIndex((item) => item.id === id);
    if (index === -1) return { changes: 0 };

    state.clients.splice(index, 1);
    saveState(state);
    return { changes: 1 };
}

function insertBugReport(values) {
    const [name, email, pageUrl, summary, details] = values;
    const id = state.meta.nextBugReportId++;

    state.bugReports.push({
        id,
        name,
        email,
        pageUrl,
        summary,
        details,
        createdAt: nowIso()
    });

    saveState(state);
    return { lastInsertRowid: id };
}

function selectAllBugReports() {
    return [...state.bugReports]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((report) => ({
            ...report,
            date: toDateOnly(report.createdAt)
        }));
}

function selectBugReportById(id) {
    const report = state.bugReports.find((item) => item.id === id);
    if (!report) return undefined;

    return {
        ...report,
        date: toDateOnly(report.createdAt)
    };
}

function deleteBugReportById(id) {
    const index = state.bugReports.findIndex((item) => item.id === id);
    if (index === -1) return { changes: 0 };

    state.bugReports.splice(index, 1);
    saveState(state);
    return { changes: 1 };
}

function prepare(sql) {
    const compact = sql.replace(/\s+/g, " ").trim().toUpperCase();

    if (compact.startsWith("INSERT INTO CLIENTS")) {
        return {
            run: (...values) => insertClient(values)
        };
    }

    if (compact.startsWith("SELECT") && compact.includes("FROM CLIENTS") && compact.includes("WHERE ID = ?")) {
        return {
            get: (id) => selectClientById(Number(id))
        };
    }

    if (compact.startsWith("SELECT") && compact.includes("FROM CLIENTS") && !compact.includes("WHERE ID = ?")) {
        return {
            all: () => selectAllClients()
        };
    }

    if (compact.startsWith("DELETE FROM CLIENTS")) {
        return {
            run: (id) => deleteClientById(Number(id))
        };
    }

    if (/^UPDATE\s+CLIENTS\s+SET\s+/i.test(sql.trim())) {
        return {
            run: (...values) => updateClientFromSql(sql, values)
        };
    }

    if (compact.startsWith("INSERT INTO BUG_REPORTS")) {
        return {
            run: (...values) => insertBugReport(values)
        };
    }

    if (compact.startsWith("SELECT") && compact.includes("FROM BUG_REPORTS") && compact.includes("WHERE ID = ?")) {
        return {
            get: (id) => selectBugReportById(Number(id))
        };
    }

    if (compact.startsWith("SELECT") && compact.includes("FROM BUG_REPORTS") && !compact.includes("WHERE ID = ?")) {
        return {
            all: () => selectAllBugReports()
        };
    }

    if (compact.startsWith("DELETE FROM BUG_REPORTS")) {
        return {
            run: (id) => deleteBugReportById(Number(id))
        };
    }

    throw new Error(`Unsupported SQL statement: ${sql}`);
}

module.exports = {
    prepare
};
