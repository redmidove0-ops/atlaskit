import '@/app/print.css';

export default function PrintLayout({children}: {children: React.ReactNode}) {
  return <div data-print-layout="">{children}</div>;
}
