import {getTranslations} from 'next-intl/server';
import LoginForm from '@/components/LoginForm';

export default async function LoginPage() {
  const t = await getTranslations('auth');

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="mt-1 text-sm opacity-70">{t('subtitle')}</p>

        <div className="mt-4">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
