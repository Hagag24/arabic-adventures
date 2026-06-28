import fs from "fs";

export function writePcmAsWav(
  pcmBuffer: Buffer,
  outputPath: string,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16,
): void {
  const header = Buffer.alloc(44);

  // 1. "RIFF"
  header.write("RIFF", 0);

  // 2. ChunkSize: 36 + Subchunk2Size
  const subchunk2Size = pcmBuffer.length;
  header.writeUInt32LE(36 + subchunk2Size, 4);

  // 3. "WAVE"
  header.write("WAVE", 8);

  // 4. "fmt "
  header.write("fmt ", 12);

  // 5. Subchunk1Size: 16 (for PCM)
  header.writeUInt32LE(16, 16);

  // 6. AudioFormat: 1 (PCM)
  header.writeUInt16LE(1, 20);

  // 7. NumChannels: 1
  header.writeUInt16LE(numChannels, 22);

  // 8. SampleRate
  header.writeUInt32LE(sampleRate, 24);

  // 9. ByteRate: SampleRate * NumChannels * BitsPerSample / 8
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  header.writeUInt32LE(byteRate, 28);

  // 10. BlockAlign: NumChannels * BitsPerSample / 8
  const blockAlign = (numChannels * bitsPerSample) / 8;
  header.writeUInt16LE(blockAlign, 32);

  // 11. BitsPerSample: 16
  header.writeUInt16LE(bitsPerSample, 34);

  // 12. "data"
  header.write("data", 36);

  // 13. Subchunk2Size
  header.writeUInt32LE(subchunk2Size, 40);

  // Combine header and PCM buffer
  const wavBuffer = Buffer.concat([header, pcmBuffer]);

  // Write to disk
  fs.writeFileSync(outputPath, wavBuffer);
}
