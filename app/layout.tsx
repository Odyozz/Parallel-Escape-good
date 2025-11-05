// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import WebOptimizedBanner from '../components/common/WebOptimizedBanner'; // Import de la bannière

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Parallel Escape',
  description: 'Échappez-vous ensemble, en ligne.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.className}>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <WebOptimizedBanner /> {/* Ajout de la bannière ici */}
      </body>
    </html>
  );
}
