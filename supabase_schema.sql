-- ==============================================================================
-- SKEMA DATABASE SUPABASE: BANYUMILI CO SALES TRACKER
-- Tabel: rekapan_penjualan
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda (Database -> SQL Editor)
-- ==============================================================================

-- 1. Buat Tabel RekapanPenjualan
create table if not exists public.rekapan_penjualan (
    id uuid default gen_random_uuid() primary key,
    tanggal_pesanan date not null default current_date,
    nama_produk text not null,
    variasi text default 'Standar',
    gambar text default '/products/over_fender.jpg',
    qty integer not null default 1 check (qty > 0),
    harga_modal numeric(15, 2) not null default 0 check (harga_modal >= 0),
    harga_jual numeric(15, 2) not null default 0 check (harga_jual >= 0),
    biaya_admin numeric(15, 2) not null default 0 check (biaya_admin >= 0),
    
    -- Kolom terhitung otomatis (Generated Columns) di PostgreSQL / Supabase
    total_penjualan numeric(15, 2) generated always as (qty * harga_jual) stored,
    total_modal numeric(15, 2) generated always as (qty * harga_modal) stored,
    profit_bersih numeric(15, 2) generated always as ((qty * harga_jual) - (qty * harga_modal) - biaya_admin) stored,
    
    status_pesanan text not null default 'Selesai' check (status_pesanan in ('Selesai', 'Dikirim', 'Retur')),
    catatan text,
    created_at timestamptz not null default timezone('utc'::text, now())
);

-- 2. Buat Index untuk performa query pencarian dan pengurutan tanggal
create index if not exists idx_rekapan_tanggal on public.rekapan_penjualan (tanggal_pesanan desc);
create index if not exists idx_rekapan_status on public.rekapan_penjualan (status_pesanan);
create index if not exists idx_rekapan_produk on public.rekapan_penjualan (nama_produk);

-- 3. Aktifkan Row Level Security (RLS)
alter table public.rekapan_penjualan enable row level security;

-- 4. Buat Kebijakan Akses (Policy)
create policy "Izinkan akses publik penuh untuk aplikasi reseller"
on public.rekapan_penjualan
for all
using (true)
with check (true);

-- 5. Aktifkan Supabase Realtime agar dashboard HP/Laptop terupdate otomatis tanpa refresh
alter publication supabase_realtime add table public.rekapan_penjualan;

-- ==============================================================================
-- 6. DATA CONTOH AWAL (24 Transaksi Real Banyumili Co)
-- Total Revenue: Rp 5.760.000 | Net Profit: Rp 1.982.000
-- Kategori: Over Fender, Eyelid, Airscoop, Cover Mesin DI-D
-- ==============================================================================

insert into public.rekapan_penjualan 
(tanggal_pesanan, nama_produk, variasi, qty, harga_modal, harga_jual, biaya_admin, status_pesanan, gambar, catatan)
values
('2026-10-21', 'Over Fender Triton 2015–2019', 'Set Lengkap Baut L', 1, 400000, 700000, 52000, 'Selesai', '/products/over_fender.jpg', 'Shopee Star+ Pesanan #261021A938'),
('2026-10-21', 'Eyelid Calya / Sigra', 'Hitam Glossy', 1, 50000, 100000, 8000, 'Selesai', '/products/eyelid_lampu.jpg', 'Shopee Instant Kurir'),
('2026-10-20', 'Over Fender Triton 2015–2019', 'Depan Kanan Kiri', 1, 110000, 200000, 16000, 'Selesai', '/products/over_fender.jpg', 'Kirim via J&T Cargo'),
('2026-10-19', 'Airscoop Universal', 'Fiberglass + 3M Tape', 2, 58000, 110000, 16000, 'Selesai', '/products/airscoop.jpg', 'Free bubble wrap tebal'),
('2026-10-18', 'Cover Mesin Triton & Pajero Sport', 'DI-D Hitam Doff', 1, 170000, 300000, 22000, 'Selesai', '/products/cover_mesin.jpg', 'Paking kardus ganda'),
('2026-10-17', 'Eyelid New Agya / Ayla', 'Hitam Doff', 2, 50000, 100000, 14000, 'Selesai', '/products/eyelid_agya.jpg', 'Promo Bundling 2 Pcs'),
('2026-10-16', 'Over Fender Universal', 'Hitam Baut L', 1, 120000, 210000, 15000, 'Selesai', '/products/over_fender.jpg', 'Set 4 Roda'),
('2026-10-15', 'Airscoop airflow universal turbo', 'Universal Turbo', 1, 48000, 90000, 7000, 'Selesai', '/products/airscoop.jpg', 'Pesanan Reseller'),
('2026-10-14', 'Cover Mesin Triton & Pajero Sport', 'DI-D Pajero Sport', 1, 170000, 300000, 22000, 'Selesai', '/products/cover_mesin.jpg', 'Komplit Baut'),
('2026-10-13', 'Eyelid Calya / Sigra', 'Hitam Glossy', 2, 50000, 100000, 15000, 'Selesai', '/products/eyelid_lampu.jpg', 'Shopee COD'),
('2026-10-12', 'Over Fender Triton 2015–2019', 'Depan Kanan Kiri', 1, 110000, 200000, 16000, 'Selesai', '/products/over_fender.jpg', 'Triton 2017'),
('2026-10-11', 'Over Fender Universal', 'Hitam Baut L', 1, 120000, 210000, 17000, 'Selesai', '/products/over_fender.jpg', 'Perekat 3M Asli'),
('2026-10-10', 'Airscoop Universal', 'Carbon Look', 2, 58000, 110000, 16000, 'Selesai', '/products/airscoop.jpg', 'SiCepat Halu'),
('2026-10-09', 'Airscoop airflow universal turbo', 'Universal Turbo', 2, 48000, 90000, 14000, 'Selesai', '/products/airscoop.jpg', 'Shopee PayLater'),
('2026-10-08', 'Eyelid New Agya / Ayla', 'Hitam Doff', 2, 50000, 100000, 15000, 'Selesai', '/products/eyelid_agya.jpg', 'Agya GR Sport'),
('2026-10-07', 'Cover Mesin Triton & Pajero Sport', 'DI-D Hitam Doff', 1, 170000, 300000, 22000, 'Selesai', '/products/cover_mesin.jpg', 'Ekspedisi Baraka'),
('2026-10-06', 'Over Fender Triton 2015–2019', 'Set Lengkap Baut L', 1, 400000, 700000, 251000, 'Selesai', '/products/over_fender.jpg', 'Pesanan Regular'),
('2026-10-05', 'Eyelid Calya / Sigra', 'Hitam Glossy', 2, 50000, 100000, 15000, 'Selesai', '/products/eyelid_lampu.jpg', 'Pelanggan Repeat'),
('2026-10-04', 'Airscoop Universal', 'Fiberglass Hitam', 2, 58000, 110000, 16000, 'Selesai', '/products/airscoop.jpg', 'J&T Express'),
('2026-10-03', 'Over Fender Universal', 'Hitam Baut L', 1, 120000, 210000, 16000, 'Dikirim', '/products/over_fender.jpg', 'Dalam Perjalanan Kurir'),
('2026-10-02', 'Airscoop airflow universal turbo', 'Universal Turbo', 2, 48000, 90000, 14000, 'Dikirim', '/products/airscoop.jpg', 'Resi SPXID0482910'),
('2026-10-01', 'Eyelid New Agya / Ayla', 'Hitam Doff', 1, 50000, 100000, 8000, 'Selesai', '/products/eyelid_agya.jpg', 'Bintang 5 Ulasan'),
('2026-09-30', 'Over Fender Triton 2015–2019', 'Depan Kanan Kiri', 1, 110000, 200000, 16000, 'Selesai', '/products/over_fender.jpg', 'Shopee Promo Gajian'),
('2026-09-29', 'Airscoop Universal', 'Fiberglass + 3M Tape', 1, 58000, 120000, 9000, 'Retur', '/products/airscoop.jpg', 'Retur salah pilih variasi warna');
