"use client";

import Link from "next/link";
import { Check } from "lucide-react";

export default function TokenShopPreview() {
  const packages = [
    {
      name: "Paket Pemula",
      coins: 5,
      price: "Rp 50.000",
      description: "Cocok untuk memberikan dukungan pertama Anda kepada kelas terfavorit.",
      features: [
        "Mendapatkan 5 Koin Voting",
        "Bebas vote di kategori mana saja",
        "Tanpa batas waktu (selama event)",
        "Struk transaksi digital otomatis"
      ],
      popular: false,
      emoji: "🥉"
    },
    {
      name: "Paket Antusias",
      coins: 15,
      price: "Rp 150.000",
      description: "Pilihan terbaik untuk mendukung berbagai anak dari kategori berbeda.",
      features: [
        "Mendapatkan 15 Koin Voting",
        "Bebas vote di kategori mana saja",
        "Tanpa batas waktu (selama event)",
        "Struk transaksi digital otomatis",
        "Dukungan prioritas dari sekretariat"
      ],
      popular: true,
      emoji: "🥈"
    },
    {
      name: "Paket Juara",
      coins: 30,
      price: "Rp 300.000",
      description: "Dukungan penuh untuk seluruh kategori agar festival semakin meriah!",
      features: [
        "Mendapatkan 30 Koin Voting",
        "Bebas vote di kategori mana saja",
        "Tanpa batas waktu (selama event)",
        "Struk transaksi digital otomatis",
        "Dukungan prioritas & Laporan Audit Vote"
      ],
      popular: false,
      emoji: "🥇"
    }
  ];

  return (
    <div style={{ marginTop: "24px" }}>
      <div className="coin-packages-grid">
        {packages.map((pkg, idx) => (
          <div key={idx} className={`coin-package-card ${pkg.popular ? "popular" : ""}`}>
            <div className="coin-package-icon">{pkg.emoji}</div>
            <h3 className="coin-package-name">{pkg.name}</h3>
            <p className="coin-package-desc">{pkg.description}</p>
            <div className="coin-package-price">
              {pkg.price}
              <span>/ {pkg.coins} Coin</span>
            </div>
            
            <ul className="coin-package-features">
              {pkg.features.map((feature, fIdx) => (
                <li key={fIdx} className="coin-package-feature-item">
                  <Check size={14} style={{ color: pkg.popular ? "var(--primary-light)" : "var(--secondary)", flexShrink: 0 }} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              href="/login" 
              className={`btn ${pkg.popular ? "btn-pulse-primary" : "btn-outline"}`}
              style={{ marginTop: "auto", width: "100%" }}
            >
              Beli Sekarang
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
