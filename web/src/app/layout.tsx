import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ReviewMate AI',
  description: 'AI-powered code reviews in your GitHub PRs with measurable quality feedback.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="app-shell">{children}</main>
      </body>
    </html>
  );
}
