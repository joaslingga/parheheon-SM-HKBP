import "./globals.css";

export const metadata = {
  title: "Parheheon Sekolah Minggu HKBP Ciputat 2026",
  description: "Aplikasi Resmi Reservasi Tiket & Voting Online Festival Parheheon Sekolah Minggu HKBP Ciputat",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
