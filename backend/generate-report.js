require("dotenv").config();

const mysql = require("mysql2/promise");
const fs = require("fs");

const REPORT_FILE = "mela-note-report.txt";
const CHECK_INTERVAL = 120000;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing from .env");
  process.exit(1);
}

const dbUrl = new URL(databaseUrl);

const pool = mysql.createPool({
  host: dbUrl.hostname,
  port: Number(dbUrl.port || 3306),
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace("/", ""),
  waitForConnections: true,
  connectionLimit: 2,
});

const queries = [
  {
    title: "REGISTERED USERS",
    sql: `SELECT id, name, email, createdAt
          FROM User ORDER BY createdAt DESC`,
  },
  {
    title: "TOTAL REGISTERED USERS",
    sql: `SELECT COUNT(*) AS total_registered_users FROM User`,
  },
  {
    title: "NOTES",
    sql: `SELECT id, title, LEFT(content, 100) AS content_preview,
          type, status, color, isPinned, createdAt, updatedAt,
          archivedAt, trashedAt, userId, isFavorite
          FROM Note ORDER BY createdAt DESC`,
  },
  {
    title: "NOTES BY USER",
    sql: `SELECT u.name AS user_name, u.email, n.id AS note_id,
          n.title, n.type, n.status, n.isPinned, n.createdAt
          FROM User u LEFT JOIN Note n ON n.userId = u.id
          ORDER BY n.createdAt DESC`,
  },
  {
    title: "TOTAL NOTES",
    sql: `SELECT COUNT(*) AS total_notes FROM Note`,
  },
  {
    title: "NOTES BY STATUS",
    sql: `SELECT status, COUNT(*) AS total
          FROM Note GROUP BY status`,
  },
  {
    title: "ARCHIVED NOTES",
    sql: `SELECT id, title, userId, archivedAt
          FROM Note WHERE status = 'ARCHIVED'`,
  },
  {
    title: "TRASHED NOTES",
    sql: `SELECT id, title, userId, trashedAt
          FROM Note WHERE status = 'TRASHED'`,
  },
  {
    title: "ATTACHMENTS",
    sql: `SELECT id, fileName, mimeType, sizeBytes,
          storageKey, createdAt, noteId
          FROM Attachment ORDER BY createdAt DESC`,
  },
  {
    title: "TOTAL ATTACHMENTS",
    sql: `SELECT COUNT(*) AS total_attachments FROM Attachment`,
  },
];

function formatTable(rows) {
  if (!rows.length) return "(No records)\n";

  const columns = Object.keys(rows[0]);
  const values = rows.map(row =>
    columns.map(column => {
      const value = row[column];
      return value === null || value === undefined
        ? "NULL"
        : String(value).replace(/\r?\n/g, " ");
    })
  );

  const widths = columns.map((column, index) =>
    Math.max(
      column.length,
      ...values.map(row => Math.min(row[index].length, 80))
    )
  );

  const border = "+" + widths.map(width => "-".repeat(width + 2)).join("+") + "+";

  const line = row =>
    "| " + row.map((value, index) =>
      value.slice(0, 80).padEnd(widths[index])
    ).join(" | ") + " |";

  return [
    border,
    line(columns),
    border,
    ...values.map(line),
    border,
    "",
  ].join("\n");
}

let previousReport = "";

async function updateReport() {
  try {
    let report = "MELA NOTE DATABASE REPORT\n";
    report += "Generated: " + new Date().toLocaleString() + "\n";
    report += "=".repeat(80) + "\n\n";

    for (const query of queries) {
      const [rows] = await pool.query(query.sql);
      report += query.title + "\n";
      report += "-".repeat(query.title.length) + "\n";
      report += formatTable(rows);
      report += "\n";
    }

    if (report !== previousReport) {
      fs.writeFileSync(REPORT_FILE, report, "utf8");
      previousReport = report;
      console.log("Report updated:", new Date().toLocaleTimeString());
    }
  } catch (error) {
    console.error("Report update failed:", error.message);
  }
}

async function startWatcher() {
  console.log("Mela Note report watcher started.");
  console.log("Checking database every 3 seconds.");
  console.log("Report file:", REPORT_FILE);

  await updateReport();

  setInterval(updateReport, CHECK_INTERVAL);
}

process.on("SIGINT", async () => {
  console.log("\nStopping report watcher...");
  await pool.end();
  process.exit(0);
});

startWatcher();
