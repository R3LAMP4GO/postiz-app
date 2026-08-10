import { MediaRepository } from './media.repository';

describe('MediaRepository', () => {
  it('persists the uploaded byte count with the media record', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'media-id' });
    const repository = new MediaRepository({
      model: {
        media: { create },
      },
    } as any);

    await repository.saveFile(
      'organization-id',
      'video.mp4',
      'https://staging.example.test/uploads/2026/08/07/video.mp4',
      144345115,
      'staging-composer-upload.mp4',
      'https://staging.example.test/uploads/2026/08/07/video.mp4.jpg'
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fileSize: 144345115,
          originalName: 'staging-composer-upload.mp4',
          path: 'https://staging.example.test/uploads/2026/08/07/video.mp4',
          thumbnail:
            'https://staging.example.test/uploads/2026/08/07/video.mp4.jpg',
        }),
      })
    );
  });
});
