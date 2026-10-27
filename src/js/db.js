/**
 * db.js - Persistent Data Store for Banyumili Co Sales Tracker
 * Table: RekapanPenjualan
 * Tailored for Authentic Car Variations: Over Fender, Eyelid, Airscoop, Cover Mesin
 */

import { isGoogleSheetsConnected, fetchTransactionsFromSheets, sendToGoogleSheets } from './googleSheetsClient.js';

const STORAGE_KEY = 'banyumili_rekapan_penjualan_v2';
const CATALOG_STORAGE_KEY = 'banyumili_product_catalog_v2';

// Authentic Product Catalog from Banyumili Co Official Store (Dual-Platform Pricing)
export const PRODUCT_CATALOG = [
  {
    id: 'prod-1',
    nama_produk: 'Over Fender Triton 2015–2019',
    variasi_default: 'Set Lengkap Baut L',
    variasi_list: ['Set Lengkap Baut L', 'Baut L Hitam Doff', 'Model Baut Chrome'],
    harga_modal: 400000,
    harga_jual: 700000,
    harga_jual_shopee: 700000,
    harga_jual_tiktok: 685000,
    biaya_admin_default: 45500,
    biaya_admin_shopee: 45500,
    biaya_admin_tiktok: 37675,
    gambar: '/products/over_fender.jpg',
    kategori: 'Over Fender'
  },
  {
    id: 'prod-2',
    nama_produk: 'Over Fender Triton (Depan)',
    variasi_default: 'Bagian Depan Kanan Kiri',
    variasi_list: ['Bagian Depan Kanan Kiri', 'Depan Kanan Saja', 'Depan Kiri Saja'],
    harga_modal: 110000,
    harga_jual: 200000,
    harga_jual_shopee: 200000,
    harga_jual_tiktok: 195000,
    biaya_admin_default: 13000,
    biaya_admin_shopee: 13000,
    biaya_admin_tiktok: 10725,
    gambar: '/products/over_fender.jpg',
    kategori: 'Over Fender'
  },
  {
    id: 'prod-3',
    nama_produk: 'Eyelid New Agya / Ayla',
    variasi_default: 'Hitam Doff',
    variasi_list: ['Hitam Doff', 'Hitam Glossy', 'Mentah Belum Cat'],
    harga_modal: 50000,
    harga_jual: 100000,
    harga_jual_shopee: 100000,
    harga_jual_tiktok: 95000,
    biaya_admin_default: 6500,
    biaya_admin_shopee: 6500,
    biaya_admin_tiktok: 5225,
    gambar: '/products/eyelid_agya.jpg',
    kategori: 'Eyelid'
  },
  {
    id: 'prod-4',
    nama_produk: 'Eyelid Calya / Sigra',
    variasi_default: 'Hitam Glossy',
    variasi_list: ['Hitam Glossy', 'Hitam Doff', 'Putih'],
    harga_modal: 50000,
    harga_jual: 100000,
    harga_jual_shopee: 100000,
    harga_jual_tiktok: 95000,
    biaya_admin_default: 6500,
    biaya_admin_shopee: 6500,
    biaya_admin_tiktok: 5225,
    gambar: '/products/eyelid_lampu.jpg',
    kategori: 'Eyelid'
  },
  {
    id: 'prod-5',
    nama_produk: 'Over Fender Universal',
    variasi_default: 'Universal Baut L (4 Pcs)',
    variasi_list: ['Universal Baut L (4 Pcs)', 'Universal Slim', 'Universal Lebar 5cm'],
    harga_modal: 120000,
    harga_jual: 210000,
    harga_jual_shopee: 210000,
    harga_jual_tiktok: 205000,
    biaya_admin_default: 13650,
    biaya_admin_shopee: 13650,
    biaya_admin_tiktok: 11275,
    gambar: '/products/over_fender.jpg',
    kategori: 'Over Fender'
  },
  {
    id: 'prod-6',
    nama_produk: 'Airscoop Universal',
    variasi_default: 'Fiberglass + 3M Tape',
    variasi_list: ['Fiberglass + 3M Tape', 'Hitam Doff', 'Carbon Look'],
    harga_modal: 58000,
    harga_jual: 110000,
    harga_jual_shopee: 110000,
    harga_jual_tiktok: 105000,
    biaya_admin_default: 7150,
    biaya_admin_shopee: 7150,
    biaya_admin_tiktok: 5775,
    gambar: '/products/airscoop.jpg',
    kategori: 'Airscoop'
  },
  {
    id: 'prod-7',
    nama_produk: 'Cover Mesin Triton & Pajero Sport',
    variasi_default: 'DI-D Hitam Doff',
    variasi_list: ['DI-D Hitam Doff', 'DI-D Carbon Hydrographic'],
    harga_modal: 170000,
    harga_jual: 300000,
    harga_jual_shopee: 300000,
    harga_jual_tiktok: 290000,
    biaya_admin_default: 19500,
    biaya_admin_shopee: 19500,
    biaya_admin_tiktok: 15950,
    gambar: '/products/cover_mesin.jpg',
    kategori: 'Cover Mesin'
  },
  {
    id: 'prod-8',
    nama_produk: 'Airscoop airflow universal turbo',
    variasi_default: 'Universal Turbo',
    variasi_list: ['Universal Turbo Hitam', 'Universal Turbo Carbon'],
    harga_modal: 48000,
    harga_jual: 90000,
    harga_jual_shopee: 90000,
    harga_jual_tiktok: 85000,
    biaya_admin_default: 5850,
    biaya_admin_shopee: 5850,
    biaya_admin_tiktok: 4675,
    gambar: '/products/airscoop.jpg',
    kategori: 'Airscoop'
  }
];

// Seed initial 24 transactions with REAL Banyumili Co products
// Total Revenue: Rp 5.760.000 | Net Profit: Rp 1.982.000
const INITIAL_TRANSACTIONS = [
  {
    "id": "TRX-1024",
    "tanggal_pesanan": "2026-10-21",
    "platform": "Shopee",
    "nama_produk": "Over Fender Triton 2015–2019",
    "variasi": "Set Lengkap Baut L",
    "qty": 1,
    "harga_modal": 400000,
    "harga_jual": 700000,
    "biaya_admin": 52000,
    "total_penjualan": 700000,
    "total_modal": 400000,
    "profit_bersih": 248000,
    "status_pesanan": "Selesai",
    "gambar": "/products/over_fender.jpg",
    "catatan": "Shopee Star+ Pesanan #261021A938"
  },
  {
    "id": "TRX-1023",
    "tanggal_pesanan": "2026-10-21",
    "platform": "Shopee",
    "nama_produk": "Eyelid Calya / Sigra",
    "variasi": "Hitam Glossy",
    "qty": 1,
    "harga_modal": 50000,
    "harga_jual": 100000,
    "biaya_admin": 8000,
    "total_penjualan": 100000,
    "total_modal": 50000,
    "profit_bersih": 42000,
    "status_pesanan": "Selesai",
    "gambar": "/products/eyelid_lampu.jpg",
    "catatan": "Shopee Instant Kurir"
  },
  {
    "id": "TRX-1022",
    "tanggal_pesanan": "2026-10-20",
    "platform": "Shopee",
    "nama_produk": "Over Fender Triton 2015–2019",
    "variasi": "Depan Kanan Kiri",
    "qty": 1,
    "harga_modal": 110000,
    "harga_jual": 200000,
    "biaya_admin": 16000,
    "total_penjualan": 200000,
    "total_modal": 110000,
    "profit_bersih": 74000,
    "status_pesanan": "Selesai",
    "gambar": "/products/over_fender.jpg",
    "catatan": "Kirim via J&T Cargo"
  },
  {
    "id": "TRX-1021",
    "tanggal_pesanan": "2026-10-19",
    "platform": "TikTok",
    "nama_produk": "Airscoop Universal",
    "variasi": "Fiberglass + 3M Tape",
    "qty": 2,
    "harga_modal": 58000,
    "harga_jual": 110000,
    "biaya_admin": 16000,
    "total_penjualan": 220000,
    "total_modal": 116000,
    "profit_bersih": 88000,
    "status_pesanan": "Selesai",
    "gambar": "/products/airscoop.jpg",
    "catatan": "TikTok Shop Flash Sale"
  },
  {
    "id": "TRX-1020",
    "tanggal_pesanan": "2026-10-18",
    "platform": "Shopee",
    "nama_produk": "Cover Mesin Triton & Pajero Sport",
    "variasi": "DI-D Hitam Doff",
    "qty": 1,
    "harga_modal": 170000,
    "harga_jual": 300000,
    "biaya_admin": 22000,
    "total_penjualan": 300000,
    "total_modal": 170000,
    "profit_bersih": 108000,
    "status_pesanan": "Selesai",
    "gambar": "/products/cover_mesin.jpg",
    "catatan": "Paking kardus ganda"
  },
  {
    "id": "TRX-1019",
    "tanggal_pesanan": "2026-10-17",
    "platform": "TikTok",
    "nama_produk": "Eyelid New Agya / Ayla",
    "variasi": "Hitam Doff",
    "qty": 2,
    "harga_modal": 50000,
    "harga_jual": 100000,
    "biaya_admin": 14000,
    "total_penjualan": 200000,
    "total_modal": 100000,
    "profit_bersih": 86000,
    "status_pesanan": "Selesai",
    "gambar": "/products/eyelid_agya.jpg",
    "catatan": "TikTok Shop Bundling 2 Pcs"
  },
  {
    "id": "TRX-1018",
    "tanggal_pesanan": "2026-10-16",
    "platform": "Shopee",
    "nama_produk": "Over Fender Universal",
    "variasi": "Hitam Baut L",
    "qty": 1,
    "harga_modal": 120000,
    "harga_jual": 210000,
    "biaya_admin": 15000,
    "total_penjualan": 210000,
    "total_modal": 120000,
    "profit_bersih": 75000,
    "status_pesanan": "Selesai",
    "gambar": "/products/over_fender.jpg",
    "catatan": "Set 4 Roda"
  },
  {
    "id": "TRX-1017",
    "tanggal_pesanan": "2026-10-15",
    "platform": "TikTok",
    "nama_produk": "Airscoop airflow universal turbo",
    "variasi": "Universal Turbo",
    "qty": 1,
    "harga_modal": 48000,
    "harga_jual": 90000,
    "biaya_admin": 7000,
    "total_penjualan": 90000,
    "total_modal": 48000,
    "profit_bersih": 35000,
    "status_pesanan": "Selesai",
    "gambar": "/products/airscoop.jpg",
    "catatan": "TikTok Shop Creator Affiliate"
  },
  {
    "id": "TRX-1016",
    "tanggal_pesanan": "2026-10-14",
    "platform": "Shopee",
    "nama_produk": "Cover Mesin Triton & Pajero Sport",
    "variasi": "DI-D Pajero Sport",
    "qty": 1,
    "harga_modal": 170000,
    "harga_jual": 300000,
    "biaya_admin": 22000,
    "total_penjualan": 300000,
    "total_modal": 170000,
    "profit_bersih": 108000,
    "status_pesanan": "Selesai",
    "gambar": "/products/cover_mesin.jpg",
    "catatan": "Komplit Baut"
  },
  {
    "id": "TRX-1015",
    "tanggal_pesanan": "2026-10-13",
    "platform": "Shopee",
    "nama_produk": "Eyelid Calya / Sigra",
    "variasi": "Hitam Glossy",
    "qty": 2,
    "harga_modal": 50000,
    "harga_jual": 100000,
    "biaya_admin": 15000,
    "total_penjualan": 200000,
    "total_modal": 100000,
    "profit_bersih": 85000,
    "status_pesanan": "Selesai",
    "gambar": "/products/eyelid_lampu.jpg",
    "catatan": "Shopee COD"
  },
  {
    "id": "TRX-1014",
    "tanggal_pesanan": "2026-10-12",
    "platform": "TikTok",
    "nama_produk": "Over Fender Triton 2015–2019",
    "variasi": "Depan Kanan Kiri",
    "qty": 1,
    "harga_modal": 110000,
    "harga_jual": 200000,
    "biaya_admin": 16000,
    "total_penjualan": 200000,
    "total_modal": 110000,
    "profit_bersih": 74000,
    "status_pesanan": "Selesai",
    "gambar": "/products/over_fender.jpg",
    "catatan": "TikTok Shop Live Streaming"
  },
  {
    "id": "TRX-1013",
    "tanggal_pesanan": "2026-10-11",
    "platform": "Shopee",
    "nama_produk": "Over Fender Universal",
    "variasi": "Hitam Baut L",
    "qty": 1,
    "harga_modal": 120000,
    "harga_jual": 210000,
    "biaya_admin": 17000,
    "total_penjualan": 210000,
    "total_modal": 120000,
    "profit_bersih": 73000,
    "status_pesanan": "Selesai",
    "gambar": "/products/over_fender.jpg",
    "catatan": "Perekat 3M Asli"
  },
  {
    "id": "TRX-1012",
    "tanggal_pesanan": "2026-10-10",
    "platform": "TikTok",
    "nama_produk": "Airscoop Universal",
    "variasi": "Carbon Look",
    "qty": 2,
    "harga_modal": 58000,
    "harga_jual": 110000,
    "biaya_admin": 16000,
    "total_penjualan": 220000,
    "total_modal": 116000,
    "profit_bersih": 88000,
    "status_pesanan": "Selesai",
    "gambar": "/products/airscoop.jpg",
    "catatan": "TikTok Shop Keranjang Kuning"
  },
  {
    "id": "TRX-1011",
    "tanggal_pesanan": "2026-10-09",
    "platform": "Shopee",
    "nama_produk": "Airscoop airflow universal turbo",
    "variasi": "Universal Turbo",
    "qty": 2,
    "harga_modal": 48000,
    "harga_jual": 90000,
    "biaya_admin": 14000,
    "total_penjualan": 180000,
    "total_modal": 96000,
    "profit_bersih": 70000,
    "status_pesanan": "Selesai",
    "gambar": "/products/airscoop.jpg",
    "catatan": "Shopee PayLater"
  },
  {
    "id": "TRX-1010",
    "tanggal_pesanan": "2026-10-08",
    "platform": "Shopee",
    "nama_produk": "Eyelid New Agya / Ayla",
    "variasi": "Hitam Doff",
    "qty": 2,
    "harga_modal": 50000,
    "harga_jual": 100000,
    "biaya_admin": 15000,
    "total_penjualan": 200000,
    "total_modal": 100000,
    "profit_bersih": 85000,
    "status_pesanan": "Selesai",
    "gambar": "/products/eyelid_agya.jpg",
    "catatan": "Agya GR Sport"
  },
  {
    "id": "TRX-1009",
    "tanggal_pesanan": "2026-10-07",
    "platform": "TikTok",
    "nama_produk": "Cover Mesin Triton & Pajero Sport",
    "variasi": "DI-D Hitam Doff",
    "qty": 1,
    "harga_modal": 170000,
    "harga_jual": 300000,
    "biaya_admin": 22000,
    "total_penjualan": 300000,
    "total_modal": 170000,
    "profit_bersih": 108000,
    "status_pesanan": "Selesai",
    "gambar": "/products/cover_mesin.jpg",
    "catatan": "TikTok Shop Live Host"
  },
  {
    "id": "TRX-1008",
    "tanggal_pesanan": "2026-10-06",
    "platform": "Shopee",
    "nama_produk": "Over Fender Triton 2015–2019",
    "variasi": "Set Lengkap Baut L",
    "qty": 1,
    "harga_modal": 400000,
    "harga_jual": 700000,
    "biaya_admin": 251000,
    "total_penjualan": 700000,
    "total_modal": 400000,
    "profit_bersih": 49000,
    "status_pesanan": "Selesai",
    "gambar": "/products/over_fender.jpg",
    "catatan": "Pesanan Regular Shopee"
  },
  {
    "id": "TRX-1007",
    "tanggal_pesanan": "2026-10-05",
    "platform": "TikTok",
    "nama_produk": "Eyelid Calya / Sigra",
    "variasi": "Hitam Glossy",
    "qty": 2,
    "harga_modal": 50000,
    "harga_jual": 100000,
    "biaya_admin": 15000,
    "total_penjualan": 200000,
    "total_modal": 100000,
    "profit_bersih": 85000,
    "status_pesanan": "Selesai",
    "gambar": "/products/eyelid_lampu.jpg",
    "catatan": "TikTok Shop Diskon Extra"
  },
  {
    "id": "TRX-1006",
    "tanggal_pesanan": "2026-10-04",
    "platform": "Shopee",
    "nama_produk": "Airscoop Universal",
    "variasi": "Fiberglass Hitam",
    "qty": 2,
    "harga_modal": 58000,
    "harga_jual": 110000,
    "biaya_admin": 16000,
    "total_penjualan": 220000,
    "total_modal": 116000,
    "profit_bersih": 88000,
    "status_pesanan": "Selesai",
    "gambar": "/products/airscoop.jpg",
    "catatan": "J&T Express"
  },
  {
    "id": "TRX-1005",
    "tanggal_pesanan": "2026-10-03",
    "platform": "Shopee",
    "nama_produk": "Over Fender Universal",
    "variasi": "Hitam Baut L",
    "qty": 1,
    "harga_modal": 120000,
    "harga_jual": 210000,
    "biaya_admin": 16000,
    "total_penjualan": 210000,
    "total_modal": 120000,
    "profit_bersih": 74000,
    "status_pesanan": "Dikirim",
    "gambar": "/products/over_fender.jpg",
    "catatan": "Dalam Perjalanan Kurir"
  },
  {
    "id": "TRX-1004",
    "tanggal_pesanan": "2026-10-02",
    "platform": "Shopee",
    "nama_produk": "Airscoop airflow universal turbo",
    "variasi": "Universal Turbo",
    "qty": 2,
    "harga_modal": 48000,
    "harga_jual": 90000,
    "biaya_admin": 14000,
    "total_penjualan": 180000,
    "total_modal": 96000,
    "profit_bersih": 70000,
    "status_pesanan": "Dikirim",
    "gambar": "/products/airscoop.jpg",
    "catatan": "Resi SPXID0482910"
  },
  {
    "id": "TRX-1003",
    "tanggal_pesanan": "2026-10-01",
    "platform": "TikTok",
    "nama_produk": "Eyelid New Agya / Ayla",
    "variasi": "Hitam Doff",
    "qty": 1,
    "harga_modal": 50000,
    "harga_jual": 100000,
    "biaya_admin": 8000,
    "total_penjualan": 100000,
    "total_modal": 50000,
    "profit_bersih": 42000,
    "status_pesanan": "Selesai",
    "gambar": "/products/eyelid_agya.jpg",
    "catatan": "TikTok Shop Review FYP"
  },
  {
    "id": "TRX-1002",
    "tanggal_pesanan": "2026-09-30",
    "platform": "Shopee",
    "nama_produk": "Over Fender Triton 2015–2019",
    "variasi": "Depan Kanan Kiri",
    "qty": 1,
    "harga_modal": 110000,
    "harga_jual": 200000,
    "biaya_admin": 16000,
    "total_penjualan": 200000,
    "total_modal": 110000,
    "profit_bersih": 74000,
    "status_pesanan": "Selesai",
    "gambar": "/products/over_fender.jpg",
    "catatan": "Shopee Promo Gajian"
  },
  {
    "id": "TRX-1001",
    "tanggal_pesanan": "2026-09-29",
    "platform": "Shopee",
    "nama_produk": "Airscoop Universal",
    "variasi": "Fiberglass + 3M Tape",
    "qty": 1,
    "harga_modal": 58000,
    "harga_jual": 120000,
    "biaya_admin": 9000,
    "total_penjualan": 120000,
    "total_modal": 58000,
    "profit_bersih": 53000,
    "status_pesanan": "Retur",
    "gambar": "/products/airscoop.jpg",
    "catatan": "Retur salah pilih variasi warna"
  }
];

export class SalesDatabase {
  constructor() {
    this.storageKey = STORAGE_KEY;
    this.init();
  }

  init() {
    if (typeof localStorage !== 'undefined') {
      const existing = localStorage.getItem(this.storageKey);
      if (!existing) {
        this.saveAll(INITIAL_TRANSACTIONS);
      }
      const existingCat = localStorage.getItem(CATALOG_STORAGE_KEY);
      if (!existingCat) {
        this.saveCatalog(PRODUCT_CATALOG);
      }
    }
  }

  getCatalog() {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(CATALOG_STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(item => ({
              ...item,
              harga_jual_shopee: item.harga_jual_shopee !== undefined ? item.harga_jual_shopee : (item.harga_jual || 0),
              harga_jual_tiktok: item.harga_jual_tiktok !== undefined ? item.harga_jual_tiktok : (item.harga_jual || 0),
              biaya_admin_shopee: item.biaya_admin_shopee !== undefined ? item.biaya_admin_shopee : (item.biaya_admin_default || Math.round((item.harga_jual || 0) * 0.065)),
              biaya_admin_tiktok: item.biaya_admin_tiktok !== undefined ? item.biaya_admin_tiktok : Math.round((item.harga_jual_tiktok || item.harga_jual || 0) * 0.055)
            }));
          }
        }
      }
      if (!this.memoryCatalog) {
        this.memoryCatalog = JSON.parse(JSON.stringify(PRODUCT_CATALOG));
      }
      return this.memoryCatalog;
    } catch (e) {
      console.error('Failed to parse stored catalog', e);
      return PRODUCT_CATALOG;
    }
  }

  saveCatalog(catalog) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog));
      } else {
        this.memoryCatalog = [...catalog];
      }
      return true;
    } catch (e) {
      console.error('Failed to save catalog to localStorage', e);
      return false;
    }
  }

  addProduct(prod) {
    const catalog = this.getCatalog();
    const harga_jual_shopee = prod.harga_jual_shopee !== undefined ? parseFloat(prod.harga_jual_shopee) : (parseFloat(prod.harga_jual) || 0);
    const harga_jual_tiktok = prod.harga_jual_tiktok !== undefined ? parseFloat(prod.harga_jual_tiktok) : harga_jual_shopee;
    const biaya_admin_shopee = prod.biaya_admin_shopee !== undefined 
      ? parseFloat(prod.biaya_admin_shopee) 
      : (prod.biaya_admin_default !== undefined ? parseFloat(prod.biaya_admin_default) : Math.round(harga_jual_shopee * 0.065));
    const biaya_admin_tiktok = prod.biaya_admin_tiktok !== undefined 
      ? parseFloat(prod.biaya_admin_tiktok) 
      : Math.round(harga_jual_tiktok * 0.055);

    const newProd = {
      id: 'prod-' + Date.now(),
      nama_produk: prod.nama_produk.trim(),
      variasi_default: prod.variasi_default ? prod.variasi_default.trim() : 'Standar',
      variasi_list: prod.variasi_list || [prod.variasi_default || 'Standar'],
      harga_modal: parseFloat(prod.harga_modal) || 0,
      harga_jual: harga_jual_shopee,
      harga_jual_shopee: harga_jual_shopee,
      harga_jual_tiktok: harga_jual_tiktok,
      biaya_admin_default: biaya_admin_shopee,
      biaya_admin_shopee: biaya_admin_shopee,
      biaya_admin_tiktok: biaya_admin_tiktok,
      gambar: prod.gambar || '/products/over_fender.jpg',
      kategori: prod.kategori || 'Variasi Mobil'
    };
    catalog.unshift(newProd);
    this.saveCatalog(catalog);
    return newProd;
  }

  updateProduct(id, updatedData) {
    const catalog = this.getCatalog();
    const index = catalog.findIndex(p => p.id === id);
    if (index === -1) return null;

    const existing = catalog[index];
    const harga_jual_shopee = updatedData.harga_jual_shopee !== undefined 
      ? parseFloat(updatedData.harga_jual_shopee) 
      : (updatedData.harga_jual !== undefined ? parseFloat(updatedData.harga_jual) : (existing.harga_jual_shopee || existing.harga_jual || 0));

    const harga_jual_tiktok = updatedData.harga_jual_tiktok !== undefined 
      ? parseFloat(updatedData.harga_jual_tiktok) 
      : (existing.harga_jual_tiktok || harga_jual_shopee);

    const biaya_admin_shopee = updatedData.biaya_admin_shopee !== undefined 
      ? parseFloat(updatedData.biaya_admin_shopee) 
      : (updatedData.biaya_admin_default !== undefined ? parseFloat(updatedData.biaya_admin_default) : (existing.biaya_admin_shopee || existing.biaya_admin_default || Math.round(harga_jual_shopee * 0.065)));

    const biaya_admin_tiktok = updatedData.biaya_admin_tiktok !== undefined 
      ? parseFloat(updatedData.biaya_admin_tiktok) 
      : (existing.biaya_admin_tiktok || Math.round(harga_jual_tiktok * 0.055));

    catalog[index] = {
      ...existing,
      ...updatedData,
      nama_produk: updatedData.nama_produk ? updatedData.nama_produk.trim() : existing.nama_produk,
      variasi_default: updatedData.variasi_default ? updatedData.variasi_default.trim() : existing.variasi_default,
      harga_modal: updatedData.harga_modal !== undefined ? parseFloat(updatedData.harga_modal) : existing.harga_modal,
      harga_jual: harga_jual_shopee,
      harga_jual_shopee: harga_jual_shopee,
      harga_jual_tiktok: harga_jual_tiktok,
      biaya_admin_default: biaya_admin_shopee,
      biaya_admin_shopee: biaya_admin_shopee,
      biaya_admin_tiktok: biaya_admin_tiktok,
      gambar: updatedData.gambar || existing.gambar,
      kategori: updatedData.kategori || existing.kategori
    };

    this.saveCatalog(catalog);
    return catalog[index];
  }

  deleteProduct(id) {
    const catalog = this.getCatalog();
    const filtered = catalog.filter(p => p.id !== id);
    this.saveCatalog(filtered);
    return filtered;
  }

  resetCatalogToDefault() {
    this.saveCatalog(PRODUCT_CATALOG);
    return PRODUCT_CATALOG;
  }

  getAll() {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(this.storageKey);
        if (data === null || data === undefined) return INITIAL_TRANSACTIONS;
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map(item => ({
            ...item,
            platform: item.platform || (item.catatan && item.catatan.toLowerCase().includes('tiktok') ? 'TikTok' : 'Shopee')
          }));
        }
        return INITIAL_TRANSACTIONS;
      }
      if (this.memoryStore === null || this.memoryStore === undefined) {
        this.memoryStore = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
      }
      return this.memoryStore;
    } catch (e) {
      console.error('Failed to parse stored sales data', e);
      return INITIAL_TRANSACTIONS;
    }
  }

  saveAll(records) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(records));
      } else {
        this.memoryStore = [...records];
      }
      return true;
    } catch (e) {
      console.error('Failed to save to localStorage', e);
      return false;
    }
  }

  addTransaction(data) {
    const records = this.getAll();
    const qty = parseInt(data.qty) || 1;
    const harga_modal = parseFloat(data.harga_modal) || 0;
    const harga_jual = parseFloat(data.harga_jual) || 0;
    const biaya_admin = parseFloat(data.biaya_admin) || 0;
    const platform = (data.platform === 'TikTok' || data.platform === 'TikTok Shop') ? 'TikTok' : 'Shopee';

    const total_penjualan = qty * harga_jual;
    const total_modal = qty * harga_modal;
    const profit_bersih = total_penjualan - total_modal - biaya_admin;

    // Pick matching image from catalog if available
    let gambar = data.gambar;
    if (!gambar) {
      const catalogItem = this.getCatalog().find(p => p.nama_produk.toLowerCase() === (data.nama_produk || '').toLowerCase());
      gambar = catalogItem ? catalogItem.gambar : '/products/over_fender.jpg';
    }

    const newRecord = {
      id: 'TRX-' + (Math.floor(1000 + Math.random() * 9000)),
      tanggal_pesanan: data.tanggal_pesanan || new Date().toISOString().split('T')[0],
      platform: platform,
      nama_produk: data.nama_produk.trim(),
      variasi: data.variasi ? data.variasi.trim() : 'Standar',
      qty: qty,
      harga_modal: harga_modal,
      harga_jual: harga_jual,
      biaya_admin: biaya_admin,
      total_penjualan: total_penjualan,
      total_modal: total_modal,
      profit_bersih: profit_bersih,
      status_pesanan: data.status_pesanan || 'Selesai',
      gambar: gambar,
      catatan: data.catatan ? data.catatan.trim() : `Pesanan ${platform === 'TikTok' ? 'TikTok Shop' : 'Shopee'} Banyumili`
    };

    records.unshift(newRecord);
    this.saveAll(records);

    // Asynchronously push to Google Sheets if connected
    if (isGoogleSheetsConnected()) {
      sendToGoogleSheets('add', newRecord).catch(err => console.warn('Google Sheets add sync warning:', err));
    }

    return newRecord;
  }

  updateTransaction(id, data) {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;

    const qty = parseInt(data.qty) || records[index].qty;
    const harga_modal = parseFloat(data.harga_modal) !== undefined ? parseFloat(data.harga_modal) : records[index].harga_modal;
    const harga_jual = parseFloat(data.harga_jual) !== undefined ? parseFloat(data.harga_jual) : records[index].harga_jual;
    const biaya_admin = parseFloat(data.biaya_admin) !== undefined ? parseFloat(data.biaya_admin) : records[index].biaya_admin;
    const platform = data.platform !== undefined 
      ? ((data.platform === 'TikTok' || data.platform === 'TikTok Shop') ? 'TikTok' : 'Shopee')
      : (records[index].platform || 'Shopee');

    const total_penjualan = qty * harga_jual;
    const total_modal = qty * harga_modal;
    const profit_bersih = total_penjualan - total_modal - biaya_admin;

    records[index] = {
      ...records[index],
      ...data,
      platform,
      qty,
      harga_modal,
      harga_jual,
      biaya_admin,
      total_penjualan,
      total_modal,
      profit_bersih
    };

    this.saveAll(records);

    // Asynchronously push update to Google Sheets if connected
    if (isGoogleSheetsConnected()) {
      sendToGoogleSheets('update', records[index]).catch(err => console.warn('Google Sheets update sync warning:', err));
    }

    return records[index];
  }

  deleteTransaction(id) {
    const records = this.getAll();
    const filtered = records.filter(r => r.id !== id);
    this.saveAll(filtered);

    // Asynchronously delete from Google Sheets if connected
    if (isGoogleSheetsConnected()) {
      sendToGoogleSheets('delete', { id }).catch(err => console.warn('Google Sheets delete sync warning:', err));
    }

    return filtered;
  }

  resetToDefault() {
    this.saveAll(INITIAL_TRANSACTIONS);
    return INITIAL_TRANSACTIONS;
  }

  clearAllTransactions() {
    this.memoryStore = [];
    this.saveAll([]);
    return [];
  }

  isGoogleSheetsConnected() {
    return isGoogleSheetsConnected();
  }

  /**
   * Sync all transactions from Google Sheets into local store
   */
  async syncFromGoogleSheets() {
    if (!isGoogleSheetsConnected()) return { success: false, message: 'URL Google Sheets belum diatur' };

    try {
      const res = await fetchTransactionsFromSheets();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        this.saveAll(res.data);
        return { success: true, count: res.data.length };
      }
      return { success: true, count: 0, message: 'Spreadsheet masih kosong' };
    } catch (err) {
      console.error('Error syncFromGoogleSheets:', err);
      return { success: false, message: err.message };
    }
  }

  /**
   * Bulk upload all local records to Google Sheets
   */
  async uploadToGoogleSheets() {
    if (!isGoogleSheetsConnected()) return { success: false, message: 'URL Google Sheets belum diatur' };

    try {
      const records = this.getAll();
      const res = await sendToGoogleSheets('bulk_insert', records);
      return res;
    } catch (err) {
      console.error('Error uploadToGoogleSheets:', err);
      return { success: false, message: err.message };
    }
  }

  getMetrics() {
    const records = this.getAll();
    
    const totalRevenue = records.reduce((sum, r) => sum + (r.total_penjualan || 0), 0);
    const totalNetProfit = records.reduce((sum, r) => sum + (r.profit_bersih || 0), 0);
    const totalTransactions = records.length;
    const totalItemsSold = records.reduce((sum, r) => sum + (r.qty || 0), 0);
    
    const uniqueProducts = new Set(records.map(r => r.nama_produk.trim().toLowerCase())).size;
    const avgTransaction = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

    return {
      totalRevenue,
      totalNetProfit,
      totalTransactions,
      totalItemsSold,
      uniqueProducts,
      avgTransaction,
      recentTransactions: records.slice(0, 10)
    };
  }

  exportToCSV() {
    const records = this.getAll();
    const headers = [
      'ID Pesanan',
      'Platform',
      'Tanggal',
      'Nama Produk',
      'Variasi',
      'Qty',
      'Harga Modal (Rp)',
      'Harga Jual (Rp)',
      'Biaya Admin (Rp)',
      'Total Penjualan (Rp)',
      'Total Modal (Rp)',
      'Profit Bersih (Rp)',
      'Status Pesanan',
      'Catatan'
    ];

    const rows = records.map(r => [
      `"${r.id}"`,
      `"${r.platform || 'Shopee'}"`,
      `"${r.tanggal_pesanan}"`,
      `"${(r.nama_produk || '').replace(/"/g, '""')}"`,
      `"${(r.variasi || '').replace(/"/g, '""')}"`,
      r.qty,
      r.harga_modal,
      r.harga_jual,
      r.biaya_admin,
      r.total_penjualan,
      r.total_modal,
      r.profit_bersih,
      `"${r.status_pesanan}"`,
      `"${(r.catatan || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Penjualan_Banyumili_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const db = new SalesDatabase();
