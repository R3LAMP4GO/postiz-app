import { execFile } from 'child_process';
import { mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';
import { createVideoThumbnail } from './video.thumbnail';

const execFileAsync = promisify(execFile);

describe('createVideoThumbnail', () => {
  let directory: string;
  let hevcVideo: Buffer;

  beforeAll(async () => {
    directory = mkdtempSync(join(tmpdir(), 'postiz-hevc-test-'));
    const videoPath = join(directory, 'hevc.mp4');
    await execFileAsync('ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-f',
      'lavfi',
      '-i',
      'color=c=red:s=320x240:d=1',
      '-c:v',
      'libx265',
      '-x265-params',
      'log-level=error',
      '-pix_fmt',
      'yuv420p',
      '-frames:v',
      '25',
      videoPath,
    ]);
    hevcVideo = readFileSync(videoPath);
  });

  afterAll(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  it('creates a browser-displayable JPEG from an HEVC MP4', async () => {
    const thumbnail = await createVideoThumbnail(hevcVideo);

    expect(thumbnail).not.toBeNull();
    expect(thumbnail?.subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
  });
});
