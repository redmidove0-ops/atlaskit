import '@/app/print.css';

export default function PrintPreviewLayout({children}: {children: React.ReactNode}) {
  return <div data-print-layout="">{children}</div>;
}
