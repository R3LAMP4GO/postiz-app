'use client';

import { FC } from 'react';
import clsx from 'clsx';
import SafeImage from '@gitroom/react/helpers/safe.image';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import { useShallow } from 'zustand/react/shallow';
import { useExistingData } from '@gitroom/frontend/components/launches/helpers/use.existing.data';
import ImageWithFallback from '@gitroom/react/helpers/image.with.fallback';

export const PicksSocialsComponent: FC<{ toolTip?: boolean }> = ({
  toolTip,
}) => {
  const existing = useExistingData();
  const {
    locked,
    addOrRemoveSelectedIntegration,
    integrations,
    selectedIntegrations,
  } = useLaunchStore(
    useShallow((state) => ({
      integrations: state.integrations,
      selectedIntegrations: state.selectedIntegrations,
      addOrRemoveSelectedIntegration: state.addOrRemoveSelectedIntegration,
      locked: state.locked,
    }))
  );

  return (
    <div
      className="flex flex-wrap gap-[10px]"
      role="group"
      aria-label="Destinations"
    >
      {integrations
        .filter((integration) => {
          if (existing.integration) {
            return integration.id === existing.integration;
          }
          return !integration.inBetweenSteps && !integration.disabled;
        })
        .map((integration) => {
          const selected = selectedIntegrations.some(
            (item) => item.integration.id === integration.id
          );
          const platformName = integration.identifier.split('-')[0];
          const accessibleName = `${integration.name}, ${platformName}`;

          return (
            <button
              type="button"
              key={integration.id}
              aria-pressed={selected}
              aria-label={`${selected ? 'Remove' : 'Add'} ${accessibleName}`}
              disabled={locked || Boolean(existing.integration)}
              onClick={() => addOrRemoveSelectedIntegration(integration, {})}
              className={clsx(
                'min-h-[44px] max-w-full rounded-[8px] border px-[10px] py-[5px] flex items-center gap-[10px] text-start outline-none transition-[border-color,background-color,color] duration-200 focus-visible:ring-2 focus-visible:ring-[#EF4444] focus-visible:ring-offset-2 focus-visible:ring-offset-newBgColor disabled:cursor-not-allowed disabled:opacity-60',
                selected
                  ? 'border-[#EF4444] bg-newBgLineColor text-textColor'
                  : 'border-newBorder bg-newBgColorInner text-[#A3A3A3] hover:border-[#A3A3A3]'
              )}
              {...(toolTip && {
                'data-tooltip-id': 'tooltip',
                'data-tooltip-content': accessibleName,
              })}
            >
              <span className="relative shrink-0">
                <ImageWithFallback
                  fallbackSrc="/no-picture.jpg"
                  src={integration.picture || '/no-picture.jpg'}
                  className="rounded-full size-[32px] object-cover"
                  alt=""
                  width={32}
                  height={32}
                />
                {integration.identifier === 'youtube' ? (
                  <img
                    src="/icons/platforms/youtube.svg"
                    className="absolute z-10 -bottom-[2px] -end-[4px] size-[14px]"
                    width={14}
                    height={14}
                    alt=""
                  />
                ) : (
                  <SafeImage
                    src={`/icons/platforms/${integration.identifier}.png`}
                    className="rounded-[3px] absolute z-10 -bottom-[2px] -end-[4px] size-[14px]"
                    alt=""
                    width={14}
                    height={14}
                  />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-[600]">
                  {integration.name}
                </span>
                <span className="block text-[11px] capitalize text-[#A3A3A3]">
                  {platformName}
                </span>
              </span>
              <span className="sr-only">
                {selected ? 'Selected' : 'Not selected'}
              </span>
            </button>
          );
        })}
    </div>
  );
};
