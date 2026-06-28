import fs from "fs";
import { writePcmAsWav } from "./pcm-wave-writer";

export function decodeAndSaveAudio(
  base64Data: string,
  outputPath: string,
  sampleRate = 24000,
): void {
  const buffer = Buffer.from(base64Data, "base64");

  // Check if buffer already starts with a RIFF header (WAV format)
  // ASCII values for "RIFF" are [82, 73, 70, 70]
  if (
    buffer.length >= 4 &&
    buffer[0] === 82 &&
    buffer[1] === 73 &&
    buffer[2] === 70 &&
    buffer[3] === 70
  ) {
    // Already has WAV header, save directly
    fs.writeFileSync(outputPath, buffer);
  } else {
    // Raw PCM data, prepend header
    writePcmAsWav(buffer, outputPath, sampleRate);
  }
}
