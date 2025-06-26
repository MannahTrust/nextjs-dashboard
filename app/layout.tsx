// app/layout.tsx

import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts'; // <-- 1. Import the font

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 2. Apply the font className to the body */}
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
