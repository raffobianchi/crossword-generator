import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'enigmistica.ai — Cruciverba Italiano Quotidiano',
    template: '%s | enigmistica.ai',
  },
  description:
    "Risolvi il cruciverba italiano del giorno, generato ogni mattina dall'intelligenza artificiale. Oppure crea il tuo cruciverba personalizzato.",
  keywords: ['cruciverba', 'italiano', 'enigmistica', 'puzzle', 'gioco', 'quotidiano', 'AI'],
  metadataBase: new URL('https://enigmistica.ai'),
  openGraph: {
    title: 'enigmistica.ai',
    description: 'Cruciverba italiano quotidiano generato dall\'AI',
    siteName: 'enigmistica.ai',
    locale: 'it_IT',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${playfair.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
