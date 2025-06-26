// app/ui/fonts.ts

import { Inter, Lusitana } from 'next/font/google';

// Configure the 'Inter' font
export const inter = Inter({ subsets: ['latin'] });

// Configure the 'Lusitana' font
export const lusitana = Lusitana({
  weight: ['400', '700'],
  subsets: ['latin'],
});