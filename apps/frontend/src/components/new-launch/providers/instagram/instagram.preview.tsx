import { useIntegration } from '@gitroom/frontend/components/launches/helpers/use.integration';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import { useMediaDirectory } from '@gitroom/react/helpers/use.media.directory';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';
import { textSlicer } from '@gitroom/helpers/utils/count.length';
import { FC, ReactNode } from 'react';
import { VideoOrImage } from '@gitroom/react/helpers/video.or.image';
import { SliderComponent } from '@gitroom/frontend/components/third-parties/slider.component';
import { hasExtension } from '@gitroom/helpers/utils/has.extension';

const ReelAction: FC<{
  label: string;
  count?: string;
  children: ReactNode;
}> = ({ label, count, children }) => (
  <div
    className="flex flex-col items-center gap-[3px] text-white"
    aria-hidden="true"
  >
    <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{children}</span>
    {count && <span className="text-[11px] font-[600]">{count}</span>}
    <span className="sr-only">{label}</span>
  </div>
);

const InstagramReelPreview: FC<{
  media: { path: string; thumbnail?: string };
  caption: string;
  integration?: { name?: string; picture?: string };
  mediaDir: ReturnType<typeof useMediaDirectory>;
}> = ({ media, caption, integration, mediaDir }) => (
  <div className="flex justify-center">
    <div className="relative h-[min(540px,calc(100dvh-260px))] aspect-[9/16] max-w-full overflow-hidden rounded-[10px] bg-[#272727] shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
      <a
        href={mediaDir.set(media.path)}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0"
      >
        <VideoOrImage
          autoplay={false}
          interactive
          src={mediaDir.set(media.path)}
          thumbnail={media.thumbnail}
          imageClassName="object-cover"
          videoClassName="object-cover"
        />
      </a>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/75" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-[14px] text-white">
        <span className="rounded-full bg-black/35 px-[9px] py-[5px] text-[11px] font-[700] tracking-[0.08em]">
          IG REEL
        </span>
        <span className="text-[20px] leading-none" aria-hidden="true">
          ⋮
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-[82px] end-[12px] flex flex-col gap-[14px]">
        <ReelAction label="Like" count="121">
          <svg
            viewBox="0 0 24 24"
            className="h-[26px] w-[26px] fill-none stroke-current"
            strokeWidth="1.8"
          >
            <path d="M20.8 8.7c0 5.4-8.8 10.1-8.8 10.1S3.2 14.1 3.2 8.7a4.7 4.7 0 0 1 8.8-2.3 4.7 4.7 0 0 1 8.8 2.3Z" />
          </svg>
        </ReelAction>
        <ReelAction label="Comments" count="32">
          <svg
            viewBox="0 0 24 24"
            className="h-[26px] w-[26px] fill-none stroke-current"
            strokeWidth="1.8"
          >
            <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.2-.6L4 20l1.5-3.7A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />
          </svg>
        </ReelAction>
        <ReelAction label="Share">
          <svg
            viewBox="0 0 24 24"
            className="h-[26px] w-[26px] fill-none stroke-current"
            strokeWidth="1.8"
          >
            <path d="m21 3-7.2 18-3.2-7.6L3 10.2 21 3Z" />
            <path d="m10.6 13.4 4.2-4.2" />
          </svg>
        </ReelAction>
        <ReelAction label="More actions">
          <svg viewBox="0 0 24 24" className="h-[26px] w-[26px] fill-current">
            <circle cx="12" cy="5" r="1.4" />
            <circle cx="12" cy="12" r="1.4" />
            <circle cx="12" cy="19" r="1.4" />
          </svg>
        </ReelAction>
      </div>
      <div className="pointer-events-none absolute inset-x-[14px] bottom-[14px] pe-[42px] text-white">
        <div className="flex items-center gap-[8px]">
          <img
            src={integration?.picture || '/no-picture.jpg'}
            alt=""
            className="h-[30px] w-[30px] rounded-full border border-white/80 object-cover"
          />
          <span className="text-[13px] font-[700]">{integration?.name}</span>
        </div>
        <div
          className="mt-[8px] line-clamp-2 text-[12px] leading-[16px]"
          dangerouslySetInnerHTML={{ __html: caption }}
        />
        <div className="mt-[5px] text-[10px] opacity-85">Original audio</div>
      </div>
    </div>
  </div>
);

export const InstagramPreview: FC<{
  maximumCharacters?: number;
}> = (props) => {
  const { value: topValue, integration } = useIntegration();
  const current = useLaunchStore((state) => state.current);
  const mediaDir = useMediaDirectory();

  const renderContent = topValue.map((p) => {
    const newContent = stripHtmlValidation(
      'normal',
      p.content.replace(
        /<span.*?data-mention-id="([.\s\S]*?)"[.\s\S]*?>([.\s\S]*?)<\/span>/gi,
        (match, match1, match2) => {
          return `[[[${match2}]]]`;
        }
      ),
      true
    );

    const { start, end } = textSlicer(
      integration?.identifier || '',
      props.maximumCharacters || 10000,
      newContent
    );

    const finalValue =
      `<strong class="text-[15px] font-[600]">${integration?.name} </strong>` +
      newContent
        .slice(start, end)
        .replace(/\[\[\[([.\s\S]*?)]]]/, (match, match1) => {
          return `<span class="font-bold font-[arial]" style="color: #ae8afc">${match1}</span>`;
        }) +
      `<mark class="bg-red-500" data-tooltip-id="tooltip" data-tooltip-content="This text will be cropped">` +
      newContent.slice(end).replace(/\[\[\[([.\s\S]*?)]]]/, (match, match1) => {
        return `<span class="font-bold font-[arial]" style="color: #ae8afc">${match1}</span>`;
      }) +
      `</mark>`;

    return { text: finalValue, images: p.image };
  });
  const media = renderContent?.[0]?.images || [];
  const isReel = media.length === 1 && hasExtension(media[0]?.path, 'mp4');
  return (
    <div className="py-[10px] flex flex-col px-[15px] w-full gap-[10px] bg-bgInstagram rounded-[12px]">
      <div className="flex gap-[10px] items-center">
        <div className="w-[36px] h-[36px]">
          <img
            src={integration?.picture || '/no-picture.jpg'}
            alt="social"
            className="rounded-full relative z-[2] w-[36px] h-[36px]"
          />
        </div>
        <div className="flex flex-col leading-[18px]">
          <div className="text-[15px] font-[600]">{integration?.name}</div>
        </div>
      </div>
      {isReel ? (
        <InstagramReelPreview
          media={media[0]}
          caption={renderContent?.[0]?.text || ''}
          integration={integration}
          mediaDir={mediaDir}
        />
      ) : media.length ? (
        <SliderComponent
          className="aspect-[4/5] max-h-[585px] rounded-[8px] overflow-hidden"
          list={media.map((image, index) => (
            <a
              key={`${image.path}-${index}`}
              className="flex-1"
              href={mediaDir.set(image.path)}
              target="_blank"
              rel="noreferrer"
            >
              <VideoOrImage
                autoplay={false}
                interactive
                src={mediaDir.set(image.path)}
                thumbnail={image.thumbnail}
              />
            </a>
          ))}
        />
      ) : (
        <div
          style={{ background: 'url(/no-video-youtube.png)' }}
          className="!bg-cover w-full aspect-[calc(16/9)] rounded-[8px] overflow-hidden"
        />
      )}
      <div
        className={
          isReel ? 'hidden' : 'text-[14px] font-[400] whitespace-pre-line'
        }
        dangerouslySetInnerHTML={{
          __html: renderContent?.[0]?.text,
        }}
      />
      <div
        className={
          isReel
            ? 'hidden'
            : 'py-[8px] text-textColor flex text-[14px] font-[700] gap-[10.5px]'
        }
      >
        <div className="flex gap-[4px] items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="20"
            viewBox="0 0 22 20"
            fill="none"
          >
            <path
              d="M10.7232 18.2722C10.7232 18.2722 0.792969 12.7112 0.792969 5.95866C0.792969 4.76493 1.20656 3.60807 1.96337 2.68491C2.72018 1.76175 3.77346 1.12932 4.94401 0.895206C6.11455 0.661097 7.33006 0.839776 8.38371 1.40084C9.43737 1.96191 10.2641 2.87071 10.7232 3.97261V3.97261C11.1823 2.87071 12.0091 1.96191 13.0627 1.40084C14.1164 0.839776 15.3319 0.661097 16.5024 0.895206C17.673 1.12932 18.7263 1.76175 19.4831 2.68491C20.2399 3.60807 20.6535 4.76493 20.6535 5.95866C20.6535 12.7112 10.7232 18.2722 10.7232 18.2722Z"
              stroke="currentColor"
              strokeWidth="1.58884"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>121</div>
        </div>
        <div className="flex gap-[4px] items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
          >
            <path
              d="M4.5067 17.576C3.3239 15.5805 2.91017 13.2218 3.34318 10.9428C3.7762 8.66377 5.02618 6.6212 6.85846 5.1985C8.69075 3.7758 10.9793 3.07083 13.2946 3.21592C15.6098 3.36102 17.7924 4.34621 19.4328 5.98653C21.0731 7.62686 22.0583 9.80951 22.2034 12.1247C22.3485 14.44 21.6435 16.7285 20.2208 18.5608C18.7981 20.3931 16.7555 21.6431 14.4765 22.0761C12.1975 22.5091 9.83884 22.0954 7.84327 20.9126V20.9126L4.54642 21.846C4.41135 21.8855 4.26814 21.888 4.13179 21.8531C3.99545 21.8182 3.871 21.7473 3.77149 21.6478C3.67197 21.5483 3.60106 21.4238 3.56619 21.2875C3.53131 21.1512 3.53375 21.0079 3.57326 20.8729L4.5067 17.576Z"
              stroke="currentColor"
              strokeWidth="1.58884"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>32</div>
        </div>
        <div className="flex gap-[4px] items-center flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
          >
            <path
              d="M20.884 3.56475L2.37397 8.77813C2.21641 8.82121 2.07595 8.91181 1.97174 9.0376C1.86752 9.16339 1.80462 9.31824 1.79159 9.48107C1.77857 9.6439 1.81605 9.80679 1.89894 9.94754C1.98183 10.0883 2.1061 10.2001 2.25481 10.2677L10.7551 14.2894C10.9216 14.3665 11.0553 14.5003 11.1325 14.6668L15.1542 23.1671C15.2218 23.3158 15.3336 23.44 15.4743 23.5229C15.6151 23.6058 15.778 23.6433 15.9408 23.6303C16.1036 23.6172 16.2585 23.5543 16.3843 23.4501C16.5101 23.3459 16.6007 23.2055 16.6437 23.0479L21.8571 4.53791C21.8966 4.40284 21.8991 4.25962 21.8642 4.12328C21.8293 3.98694 21.7584 3.86249 21.6589 3.76297C21.5594 3.66346 21.4349 3.59255 21.2986 3.55767C21.1622 3.5228 21.019 3.52524 20.884 3.56475V3.56475Z"
              stroke="currentColor"
              strokeWidth="1.58884"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.0117 14.4084L15.5002 9.91992"
              stroke="currentColor"
              strokeWidth="1.58884"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex gap-[4px] items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
          >
            <path
              d="M19.0662 22.2443L12.7108 18.2722L6.35547 22.2443V4.76708C6.35547 4.55638 6.43917 4.35432 6.58815 4.20534C6.73713 4.05635 6.9392 3.97266 7.14989 3.97266H18.2718C18.4825 3.97266 18.6845 4.05635 18.8335 4.20534C18.9825 4.35432 19.0662 4.55638 19.0662 4.76708V22.2443Z"
              stroke="currentColor"
              strokeWidth="1.58884"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {renderContent.length > 1 && (
        <>
          {renderContent.slice(1).map((value, index) => (
            <div key={index} className="flex flex-col gap-[12px]">
              <div className="flex gap-[10px] leading-[17px]">
                <div className="h-[34px]">
                  <img
                    src={integration?.picture || '/no-picture.jpg'}
                    alt="social"
                    className="rounded-full relative z-[2] h-[34px] w-[34px]"
                  />
                </div>
                <div className="flex flex-col gap-[6px] flex-1">
                  <div className="flex gap-[4px] py-[8px]">
                    <div
                      className="whitespace-pre-line text-[14px] font-[400] flex-1"
                      dangerouslySetInnerHTML={{
                        __html: value.text,
                      }}
                    />
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M10 16.875C10 16.875 2.1875 12.5 2.1875 7.18751C2.1875 6.24836 2.51289 5.33821 3.1083 4.61193C3.70371 3.88564 4.53236 3.38808 5.45328 3.2039C6.37419 3.01971 7.33047 3.16029 8.15943 3.6017C8.98838 4.04311 9.63879 4.7581 10 5.62501V5.62501C10.3612 4.7581 11.0116 4.04311 11.8406 3.6017C12.6695 3.16029 13.6258 3.01971 14.5467 3.2039C15.4676 3.38808 16.2963 3.88564 16.8917 4.61193C17.4871 5.33821 17.8125 6.24836 17.8125 7.18751C17.8125 12.5 10 16.875 10 16.875Z"
                          stroke="currentColor"
                          strokeWidth="1.58884"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex font-[400] text-[12px] text-textLinkedin items-center">
                    <div className="flex gap-[16px] flex-1">
                      <div className="font-[700]">30m</div>
                      <div className="font-[700]">8 Likes</div>
                      <div className="font-[700]">Reply</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
