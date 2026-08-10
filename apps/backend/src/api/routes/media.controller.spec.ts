jest.mock('@gitroom/nestjs-libraries/upload/video.thumbnail', () => ({
  createVideoThumbnail: jest.fn(),
}));
jest.mock(
  '@gitroom/nestjs-libraries/database/prisma/media/media.service',
  () => ({ MediaService: class {} })
);
jest.mock(
  '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service',
  () => ({ SubscriptionService: class {} })
);
jest.mock('@gitroom/nestjs-libraries/upload/upload.factory', () => ({
  UploadFactory: { createStorage: jest.fn(() => ({})) },
}));
jest.mock('@gitroom/nestjs-libraries/upload/custom.upload.validation', () => ({
  CustomFileValidationPipe: class {
    transform(value: unknown) {
      return value;
    }
  },
}));
jest.mock('@gitroom/nestjs-libraries/upload/r2.uploader', () => ({
  default: jest.fn(),
}));

import { MediaController } from './media.controller';
import { createVideoThumbnail } from '@gitroom/nestjs-libraries/upload/video.thumbnail';

describe('MediaController video upload compatibility', () => {
  const saveFile = jest.fn().mockResolvedValue({ id: 'media-id' });
  const storage = {
    uploadFile: jest.fn().mockResolvedValue({
      originalname: 'hevc-upload.mp4',
      path: 'https://uploads.test/hevc-upload.mp4',
      size: 123,
    }),
    uploadSimple: jest
      .fn()
      .mockResolvedValue({ path: 'https://uploads.test/hevc-upload.jpg' }),
  };
  let controller: MediaController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new MediaController({ saveFile } as any, {} as any);
    (controller as any).storage = storage;
    (createVideoThumbnail as jest.Mock).mockResolvedValue(
      Buffer.from([0xff, 0xd8, 0xff])
    );
  });

  it('stores a generated poster alongside a newly uploaded video', async () => {
    const file = {
      buffer: Buffer.from('hevc-video'),
      mimetype: 'video/mp4',
      originalname: 'hevc-upload.mp4',
    } as Express.Multer.File;

    await controller.uploadServer({ id: 'org-id' } as any, file);

    expect(createVideoThumbnail).toHaveBeenCalledWith(file.buffer);
    expect(storage.uploadSimple).toHaveBeenCalledWith(
      `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 0xff]).toString(
        'base64'
      )}`
    );
    expect(saveFile).toHaveBeenCalledWith(
      'org-id',
      'hevc-upload.mp4',
      'https://uploads.test/hevc-upload.mp4',
      123,
      'hevc-upload.mp4',
      'https://uploads.test/hevc-upload.jpg'
    );
  });
});
