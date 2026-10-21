import type { Metadata } from 'next';
import { Manrope, Unbounded } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

// Шрифты лендинга NutriOS: заголовки — Unbounded, текст — Manrope
const manrope = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-manrope' });
const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'], variable: '--font-unbounded' });

export const metadata: Metadata = {
  title: 'Ешь, гуляй и спи',
  description: 'Это станет вашим любимым приложением',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable}`}>
      <body>{children}</body>
    </html>
  );
}
