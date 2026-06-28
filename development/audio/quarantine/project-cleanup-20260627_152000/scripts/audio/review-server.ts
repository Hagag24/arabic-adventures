import http from "http";
import fs from "fs";
import path from "path";
import { z } from "zod";

const PORT = 4175;
const HOST = "127.0.0.1";

const CANDIDATES_DIR = path.resolve(
  process.cwd(),
  "artifacts/audio/candidates",
);
const REVIEW_DIR = path.resolve(process.cwd(), "artifacts/audio/review");
const CATALOG_PATH = path.join(REVIEW_DIR, "review-catalog.json");
const RESULT_PATH = path.join(REVIEW_DIR, "review-results.json");
const HTML_PATH = path.join(REVIEW_DIR, "index.html");

// Zod validation schemas matching CandidateReview type
const IssueSchema = z.object({
  pronunciation: z.boolean().default(false),
  clarity: z.boolean().default(false),
  speed: z.boolean().default(false),
  egyptianDelivery: z.boolean().default(false),
  extraWords: z.boolean().default(false),
  cutBeginning: z.boolean().default(false),
  cutEnding: z.boolean().default(false),
});

const CandidateReviewSchema = z.object({
  candidateId: z.string(),
  status: z.enum(["PENDING_HUMAN_REVIEW", "APPROVED", "REJECTED"]),
  favorite: z.boolean().default(false),
  issues: IssueSchema,
  notes: z.string().default(""),
  source: z.enum(["HUMAN", "AUTOMATED_TEST"]).default("HUMAN"),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

const ReviewsPayloadSchema = z.record(z.string(), CandidateReviewSchema);

const server = http.createServer((req, res) => {
  const url = req.url || "/";

  // Static HTML Serve
  if (url === "/" || url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    if (fs.existsSync(HTML_PATH)) {
      res.end(fs.readFileSync(HTML_PATH));
    } else {
      res.end(
        "<h1>Review site index.html is missing. Run pnpm audio:build-review first.</h1>",
      );
    }
    return;
  }

  // Audio files streaming under candidates folder
  if (url.startsWith("/candidates/")) {
    const relativeFilePath = url.replace("/candidates/", "");
    // Prevent directory traversal attacks
    const safePath = path
      .normalize(relativeFilePath)
      .replace(/^(\.\.[\/\\])+/, "");
    const fullPath = path.join(CANDIDATES_DIR, safePath);

    // Only allow serving files from the candidates directory, and do not allow directories
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const ext = path.extname(fullPath).toLowerCase();

      // Do not allow serving WAV master files via the review server if requested to block them
      if (ext === ".wav" && fullPath.includes("masters")) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("WAV master files are forbidden.");
        return;
      }

      const contentType = ext === ".mp3" ? "audio/mpeg" : "audio/wav";
      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(fullPath).pipe(res);
      return;
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Audio file not found.");
      return;
    }
  }

  // GET /api/candidates
  if (url === "/api/candidates" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    if (fs.existsSync(CATALOG_PATH)) {
      res.end(fs.readFileSync(CATALOG_PATH));
    } else {
      res.end(JSON.stringify({ version: 1, speechGroups: [], sfx: [] }));
    }
    return;
  }

  // GET /api/sfx
  if (url === "/api/sfx" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    if (fs.existsSync(CATALOG_PATH)) {
      try {
        const cat = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));
        res.end(JSON.stringify(cat.sfx || []));
      } catch {
        res.end(JSON.stringify([]));
      }
    } else {
      res.end(JSON.stringify([]));
    }
    return;
  }

  // POST /api/reviews
  if (url === "/api/reviews" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const payload = JSON.parse(body);

        // Zod validation
        const parsedPayload = ReviewsPayloadSchema.parse(payload);

        // Transaction-safe atomic file writing with fsync
        fs.mkdirSync(REVIEW_DIR, { recursive: true });
        const tempPath = `${RESULT_PATH}.tmp`;
        fs.writeFileSync(
          tempPath,
          JSON.stringify(parsedPayload, null, 2),
          "utf-8",
        );

        // fsync/close sequence
        const fd = fs.openSync(tempPath, "r+");
        fs.fsyncSync(fd);
        fs.closeSync(fd);

        // Atomically rename over review-results.json
        fs.renameSync(tempPath, RESULT_PATH);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success" }));
      } catch (err) {
        const error = err as Error;
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Invalid payload or validation failed: " + error.message,
          }),
        );
      }
    });
    return;
  }

  // GET /api/reviews
  if (url === "/api/reviews" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    if (fs.existsSync(RESULT_PATH)) {
      res.end(fs.readFileSync(RESULT_PATH, "utf-8"));
    } else {
      res.end(JSON.stringify({}));
    }
    return;
  }

  // Default 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, HOST, () => {
  console.log(`Review server running at http://${HOST}:${PORT}`);
});
