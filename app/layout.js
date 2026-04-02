import "./globals.css";

export const metadata = {
  title: "UKB Data Dictionary",
  description: "Search the UK Biobank data dictionary from a Postgres database running behind a Vercel deployment."
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

