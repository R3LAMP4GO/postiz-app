'use client';
import { FC, useEffect, useState } from 'react';
import { useTranslationSettings } from '@gitroom/react/translation/get.transation.service.client';

const getDirection = (language?: string) =>
  ['he', 'ar'].includes((language || '').split('-')[0]) ? 'rtl' : 'ltr';

export const HtmlComponent: FC = () => {
  const settings = useTranslationSettings();
  const [dir, setDir] = useState(() =>
    getDirection(settings.resolvedLanguage || settings.language)
  );

  useEffect(() => {
    const handleLanguageChange = (language: string) => {
      setDir(getDirection(language));
    };

    settings.on('languageChanged', handleLanguageChange);
    return () => {
      settings.off('languageChanged', handleLanguageChange);
    };
  }, [settings]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
  }, [dir]);

  return null;
};
