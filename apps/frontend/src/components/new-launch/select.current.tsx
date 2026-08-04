'use client';

import { FC, useCallback } from 'react';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import clsx from 'clsx';
import SafeImage from '@gitroom/react/helpers/safe.image';
import { useShallow } from 'zustand/react/shallow';
import { Integrations } from '@gitroom/frontend/components/launches/calendar.context';
import { useDecisionModal } from '@gitroom/frontend/components/layout/new-modal';

export const SelectCurrent: FC<{
  compact?: boolean;
  ariaLabel?: string;
}> = ({ compact = false, ariaLabel = 'Selected platforms' }) => {
  const modals = useDecisionModal();
  const {
    selectedIntegrations,
    current,
    setCurrent,
    locked,
    setHide,
    addOrRemoveSelectedIntegration,
  } = useLaunchStore(
    useShallow((state) => ({
      selectedIntegrations: state.selectedIntegrations,
      addOrRemoveSelectedIntegration: state.addOrRemoveSelectedIntegration,
      current: state.current,
      setCurrent: state.setCurrent,
      locked: state.locked,
      setHide: state.setHide,
    }))
  );

  const removeSocial = useCallback(
    (integration: Integrations) => async () => {
      const confirmed = await modals.open({
        title: 'Remove Social Account',
        description:
          'Are you sure you want to remove this social from scheduling?',
      });

      if (confirmed) {
        addOrRemoveSelectedIntegration(integration, {});
      }
    },
    [addOrRemoveSelectedIntegration, modals]
  );

  if (selectedIntegrations.length === 0) {
    return null;
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={clsx(
        'flex w-full gap-[8px] overflow-x-auto pb-[4px] scrollbar scrollbar-thumb-tableBorder scrollbar-track-secondary',
        locked && 'opacity-60'
      )}
    >
      {selectedIntegrations.map(({ integration }) => {
        const selected = current === integration.id;
        const platformName = integration.identifier.split('-')[0];
        const label = `${integration.name}, ${platformName}`;

        return (
          <div
            key={integration.id}
            className={clsx(
              'shrink-0 flex rounded-[8px] border bg-newBgLineColor',
              selected ? 'border-[#EF4444]' : 'border-transparent'
            )}
          >
            <button
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`Show ${label}`}
              disabled={locked}
              onClick={() => {
                setHide(true);
                setCurrent(integration.id);
              }}
              className={clsx(
                'min-h-[44px] min-w-[44px] px-[8px] flex items-center gap-[8px] rounded-[7px] outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] focus-visible:ring-inset disabled:cursor-not-allowed',
                selected ? 'text-[#EF4444]' : 'text-textColor'
              )}
            >
              <span className="relative shrink-0">
                <SafeImage
                  src={integration.picture || '/no-picture.jpg'}
                  className="rounded-full size-[26px] object-cover"
                  alt=""
                  width={26}
                  height={26}
                  onError={(event) => {
                    event.currentTarget.src = '/no-picture.jpg';
                    event.currentTarget.srcset = '/no-picture.jpg';
                  }}
                />
                <SafeImage
                  src={`/icons/platforms/${integration.identifier}.png`}
                  className="rounded-[3px] absolute z-10 -bottom-[2px] -end-[3px] size-[12px]"
                  alt=""
                  width={12}
                  height={12}
                />
              </span>
              <span
                className={clsx(
                  'max-w-[150px] truncate text-[13px] font-[600]',
                  compact && 'hidden sm:block'
                )}
              >
                {integration.name}
              </span>
              <IsGlobal id={integration.id} />
            </button>
            {!compact && (
              <button
                type="button"
                aria-label={`Remove ${label}`}
                disabled={locked}
                onClick={removeSocial(integration)}
                className="min-h-[44px] min-w-[36px] px-[8px] rounded-e-[7px] text-[#FF3F3F] outline-none hover:bg-newColColor focus-visible:ring-2 focus-visible:ring-[#EF4444] focus-visible:ring-inset disabled:cursor-not-allowed"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const IsGlobal: FC<{ id: string }> = ({ id }) => {
  const { isInternal } = useLaunchStore(
    useShallow((state) => ({
      isInternal: state.internal.some((item) => item.integration.id === id),
    }))
  );

  if (!isInternal) {
    return null;
  }

  return (
    <span
      className="size-[8px] shrink-0 rounded-full bg-[#EF4444]"
      aria-label="Customized content"
    />
  );
};
