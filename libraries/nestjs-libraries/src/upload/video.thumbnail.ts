import { execFile } from 'child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function createVideoThumbnail(
  video: Buffer
): Promise<Buffer | null> {
  const directory = mkdtempSync(join(tmpdir(), 'postiz-video-thumbnail-'));
  const inputPath = join(directory, 'input.mp4');
  const outputPath = join(directory, 'thumbnail.jpg');

  try {
    writeFileSync(inputPath, video);
    await execFileAsync(
      'ffmpeg',
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-y',
        '-ss',
        '0',
        '-i',
        inputPath,
        '-frames:v',
        '1',
        '-vf',
        'scale=1280:-2,format=yuvj420p',
        '-q:v',
        '3',
        outputPath,
      ],
      { timeout: 30_000, maxBuffer: 1024 * 1024 }
    );

    return readFileSync(outputPath);
  } catch (error) {
    console.warn('Unable to generate a video thumbnail:', error);
    return null;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
