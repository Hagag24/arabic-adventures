import fs from "fs";
import path from "path";

const RESULT_PATH = path.resolve(
  process.cwd(),
  "artifacts/audio/review/review-results.json",
);

export function approveVoices(): void {
  if (!fs.existsSync(RESULT_PATH)) {
    console.log(
      "No review decisions found yet. Complete voice audition review first.",
    );
    return;
  }

  const reviews = JSON.parse(fs.readFileSync(RESULT_PATH, "utf-8"));
  const approved = Object.entries(reviews).filter(([, val]) => {
    const item = val as { status: string };
    return item.status === "APPROVED";
  });

  console.log(`Found ${approved.length} approved voice candidate clips.`);
  approved.forEach(([key]) => {
    console.log(`- Approved: ${key}`);
  });
}

if (process.argv[1] && process.argv[1].endsWith("approve.ts")) {
  approveVoices();
}
