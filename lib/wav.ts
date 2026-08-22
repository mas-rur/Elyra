/**
 * Gemini's TTS models return raw 16-bit signed little-endian PCM at 24kHz
 * mono, base64-encoded, with no container. Browsers can't play that directly
 * via <audio>, so we wrap it in a minimal WAV header server-side.
 */
export function pcmBase64ToWavBuffer(
  base64Pcm: string,
  sampleRate = 24000,
  channels = 1,
  bitsPerSample = 16
): Buffer {
  const pcm = Buffer.from(base64Pcm, "base64");
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // audio format = PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

/** Parses "audio/L16;rate=24000" style mime types Gemini returns for PCM audio. */
export function parseSampleRate(mimeType: string): number {
  const match = mimeType.match(/rate=(\d+)/);
  return match ? parseInt(match[1], 10) : 24000;
}
