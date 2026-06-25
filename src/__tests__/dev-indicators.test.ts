import { describe, test, expect } from "vitest";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

describe("Next.js DevIndicators Configuration Tests", () => {
  const evaluateConfig = (
    showDevtoolsValue?: string,
  ): Record<string, unknown> => {
    const env = { ...process.env };
    if (showDevtoolsValue === undefined) {
      delete env.SHOW_NEXT_DEVTOOLS;
    } else {
      env.SHOW_NEXT_DEVTOOLS = showDevtoolsValue;
    }

    const tempFile = path.resolve(
      process.cwd(),
      `temp-test-indicators-${Date.now()}.ts`,
    );
    const code = `
import nextConfig from "./next.config";
console.log(JSON.stringify({ devIndicators: nextConfig.devIndicators }));
`;

    fs.writeFileSync(tempFile, code, "utf-8");

    try {
      const output = execSync(`npx tsx ${JSON.stringify(tempFile)}`, {
        env,
      }).toString();
      fs.unlinkSync(tempFile);
      return JSON.parse(output);
    } catch (e) {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      console.error(e);
      throw e;
    }
  };

  test("default devIndicators: should be false when environment variable is absent", () => {
    const config = evaluateConfig(undefined);
    expect(config.devIndicators).toBe(false);
  });

  test("disabled devIndicators: should be false when environment variable is false", () => {
    const config = evaluateConfig("false");
    expect(config.devIndicators).toBe(false);
  });

  test("enabled devIndicators: should be null/undefined when environment variable is true", () => {
    const config = evaluateConfig("true");
    // If enabled, devIndicators is undefined (which JSON.stringify omits, resulting in {})
    expect(config.devIndicators).toBeUndefined();
  });
});
