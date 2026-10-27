# 🏎️ Banyumili Co - E-Commerce Reseller Sales Tracker

A modern, responsive, mobile-first web & hybrid application for tracking sales, costs, marketplace admin fees, and net profit for car accessories & automotive variation resellers on Shopee under the brand **"Banyumili Co"**.

---

## 📸 Fitur Utama & Visual Showcase

- **Fintech Luxury Dark Navy Aesthetic**: Header warna dark navy (`#070d1e` - `#0a1329`) dengan aksen emerald green (`#10b981`) untuk indikator profit dan status pesanan.
- **Dua Kartu Ringkasan Utama**:
  - **Total Revenue**: Otomatis format IDR (`Rp 5.760.000`), tren persentase harian, serta visual sparkline.
  - **Net Profit**: Kartu gradient emerald (`Rp 1.982.000`) dengan kalkulasi real-time.
- **Baris Statistik Sekunder**:
  - **Total Transaksi**: 24 Transaksi
  - **Produk Terjual**: 16 Produk
  - **Produk Unik**: 8 Produk Unik
  - **Rata-rata Transaksi**: `Rp 3.778.000`
- **Daftar Transaksi Terbaru (Recent Transactions)**:
  - Foto produk riil (Sarung Stir Mobil, Eyelid Calya/Sigra, Over Fender Strada, Airscoop Universal, Weldop Ring 16", Sling Bag Waterproof).
  - Variasi produk, label Qty, nilai profit hijau tebal, badge status *Completed / Selesai*, dan tanggal pesanan.
  - Modal rincian transaksi lengkap dengan opsi hapus/edit.
- **Floating Action Button (FAB)**:
  - Tombol melayang `+ Add Transaction` di pojok kanan bawah.
- **Modal Tambah Transaksi dengan LIVE CALCULATION PREVIEW**:
  - Auto-fill cepat dari katalog aksesoris mobil.
  - Stepper interaktif kuantitas (Qty `[-]` / `[+]`).
  - Input harga modal, harga jual, dan biaya admin Shopee.
  - Tombol bantuan `⚡ Auto Hitung Fee (6.5%)` khusus seller Shopee Star+.
  - **Live Preview Box**: Kalkulasi otomatis Total Penjualan, Total Modal, Biaya Admin, dan **Profit Bersih + Margin %** secara instan saat pengguna mengetik sebelum data disimpan ke database.
- **Simulator Chassis & Responsivitas**:
  - Mode **📱 Phone Frame** (tampilan bezel iPhone 16 Pro dengan Dynamic Island dan status bar).
  - Mode **💻 Expanded** (tampilan responsif lebar penuh).
- **Fitur Tambahan**:
  - Ekspor seluruh rekapan transaksi ke file format `.CSV` (kompatibel Excel & Google Sheets).
  - Tombol reset data contoh jika ingin mengembalikan ke state mockup awal.
  - Tab Katalog Produk & Kalkulator Fee Marketplace.

---

## 🗄️ Struktur Database (`RekapanPenjualan`)

| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | String / UUID | ID unik transaksi (e.g. `TRX-1024`) |
| `tanggal_pesanan` | Date (YYYY-MM-DD) | Tanggal order Shopee |
| `nama_produk` | String | Nama item aksesoris mobil |
| `variasi` | String | Varian warna/model (e.g. `Hitam - Universal`) |
| `qty` | Integer | Jumlah unit pesanan |
| `harga_modal` | Decimal (IDR) | Harga beli modal dari supplier per unit |
| `harga_jual` | Decimal (IDR) | Harga jual di etalase Shopee per unit |
| `biaya_admin` | Decimal (IDR) | Potongan admin fee Shopee marketplace |
| `total_penjualan` | Calculated Decimal | Rumus: `qty * harga_jual` |
| `total_modal` | Calculated Decimal | Rumus: `qty * harga_modal` |
| `profit_bersih` | Calculated Decimal | Rumus: `total_penjualan - total_modal - biaya_admin` |
| `status_pesanan` | Enum / String | `Selesai` / `Dikirim` / `Retur` |
| `catatan` | String | No. Resi kurir atau catatan internal |

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal

### 1. Jalankan Development Server:
```bash
npm run dev
```
Aplikasi dapat diakses di browser pada: `http://localhost:5173/`

### 2. Jalankan Automated Test Suite:
```bash
npm test
```

### 3. Build untuk Produksi:
```bash
npm run build
```
Hasil bundle yang dioptimalkan akan tersedia di folder `dist/`.

---

## 📁 Struktur Direktori

```
rekap-banyumili/
├── index.html              # Layout utama, phone chassis simulator, dan modal
├── package.json            # Konfigurasi project & script testing
├── vite.config.js          # Pengaturan Vite development server
├── test_suite.js           # Automated integration test suite
├── public/
│   └── products/           # Aset fotografi produk aksesoris mobil
│       ├── sarung_stir.jpg
│       ├── eyelid_lampu.jpg
│       ├── over_fender.jpg
│       ├── airscoop.jpg
│       ├── weldop_ring.jpg
│       └── sling_bag.jpg
└── src/
    ├── css/
    │   └── style.css       # Design tokens, dark navy fintech palette, micro-animations
    └── js/
        ├── utils.js        # Formatter mata uang Rupiah & tanggal Indonesia
        ├── db.js           # Persistent data store (localStorage + memory fallback)
        └── app.js          # State management, live calculation preview, tab & modal controller
```
