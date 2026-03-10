import "./globals.css";

export const metadata = {
  title: "Regime Risk Engine",
  description: "Institutional portfolio regime risk analysis in a single Next.js app.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
