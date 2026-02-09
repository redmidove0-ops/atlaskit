'use client';

import {useEffect} from 'react';

export default function HtmlLangDir({locale}: {locale: string}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  return null;
}
