import { Mona_Sans } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next/types';
import { Toaster } from 'sonner';


const monaSans = Mona_Sans({
  variable: '--font-mona-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PrepWise',
  description: 'An AI-powered platform for preparing for mocks interviews',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-lt-installed="true" suppressHydrationWarning>
      <body className={`${monaSans.className} antialiased pattern`}>
        {children}
        <Toaster richColors={true} />
      </body>
    </html>
  );
}
