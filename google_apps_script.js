/**
 * ==============================================================================
 * BANYUMILI CO - GOOGLE APPS SCRIPT WEBHOOK UNTUK REKAP PENJUALAN SHOPEE
 * ==============================================================================
 * 
 * CARA MEMASANG:
 * 1. Buka Google Sheets baru di https://sheets.new
 * 2. Beri nama file: "Rekap Penjualan Banyumili Co"
 * 3. Klik menu: Ekstensi (Extensions) -> Apps Script
 * 4. Hapus semua kode default di Apps Script, lalu SALIN & TEMPEL seluruh kode di bawah ini.
 * 5. Klik ikon Simpan (Save).
 * 6. Klik tombol "Terapkan" (Deploy) -> "Penerapan baru" (New deployment).
 * 7. Pada jenis penerapan (ikon gerigi), pilih: "Aplikasi Web" (Web App).
 * 8. Konfigurasi:
 *    - Deskripsi: Webhook Rekap Banyumili
 *    - Jalankan sebagai: Saya (Email Anda)
 *    - Yang memiliki akses: Siapa saja (Anyone) -> PENTING!
 * 9. Klik "Terapkan" (Deploy), lalu izinkan izin akses Google (Authorize).
 * 10. Salin "URL Aplikasi Web" (contoh: https://script.google.com/macros/s/AKfycb.../exec)
 * 11. Tempel URL tersebut ke menu Pengaturan di Aplikasi Web Banyumili Co Anda!
 * ==============================================================================
 */

const SHEET_NAME = 'RekapanPenjualan';

// Header kolom spreadsheet
const HEADERS = [
  'ID Transaksi',
  'Tanggal Pesanan',
  'Platform',
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
  'Catatan',
  'Gambar URL',
  'Waktu Dibuat'
];

/**
 * Mendapatkan sheet target atau membuatnya otomatis jika belum ada
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Tulis header dan beri styling
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#0b152d');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}

/**
 * Endpoint GET: Mengambil seluruh riwayat transaksi
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return responseJSON({ success: true, count: 0, data: [] });
    }

    const hasPlatformCol = data[0] && String(data[0][2]).toLowerCase().includes('platform');
    const rows = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Lewati baris kosong
      
      let tgl = row[1];
      if (tgl instanceof Date) {
        tgl = Utilities.formatDate(tgl, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }

      if (hasPlatformCol) {
        rows.push({
          id: String(row[0]),
          tanggal_pesanan: String(tgl),
          platform: String(row[2] || 'Shopee'),
          nama_produk: String(row[3]),
          variasi: String(row[4] || 'Standar'),
          qty: Number(row[5]) || 1,
          harga_modal: Number(row[6]) || 0,
          harga_jual: Number(row[7]) || 0,
          biaya_admin: Number(row[8]) || 0,
          total_penjualan: Number(row[9]) || (Number(row[5]) * Number(row[7])),
          total_modal: Number(row[10]) || (Number(row[5]) * Number(row[6])),
          profit_bersih: Number(row[11]) || 0,
          status_pesanan: String(row[12] || 'Selesai'),
          catatan: String(row[13] || ''),
          gambar: String(row[14] || '/products/over_fender.jpg'),
          created_at: String(row[15] || '')
        });
      } else {
        // Fallback backward compatibility format 15 kolom
        rows.push({
          id: String(row[0]),
          tanggal_pesanan: String(tgl),
          platform: 'Shopee',
          nama_produk: String(row[2]),
          variasi: String(row[3] || 'Standar'),
          qty: Number(row[4]) || 1,
          harga_modal: Number(row[5]) || 0,
          harga_jual: Number(row[6]) || 0,
          biaya_admin: Number(row[7]) || 0,
          total_penjualan: Number(row[8]) || (Number(row[4]) * Number(row[6])),
          total_modal: Number(row[9]) || (Number(row[4]) * Number(row[5])),
          profit_bersih: Number(row[10]) || 0,
          status_pesanan: String(row[11] || 'Selesai'),
          catatan: String(row[12] || ''),
          gambar: String(row[13] || '/products/over_fender.jpg'),
          created_at: String(row[14] || '')
        });
      }
    }

    return responseJSON({ success: true, count: rows.length, data: rows });
  } catch (error) {
    return responseJSON({ success: false, error: error.toString() });
  }
}

/**
 * Endpoint POST: Menambah transaksi, bulk upload, atau hapus
 */
function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    let body;

    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else {
      body = e.parameter;
    }

    const action = body.action || 'add';

    // 1. TAMBAH 1 TRANSAKSI BARU
    if (action === 'add') {
      const item = body.data || body;
      const qty = Number(item.qty) || 1;
      const modal = Number(item.harga_modal) || 0;
      const jual = Number(item.harga_jual) || 0;
      const admin = Number(item.biaya_admin) || 0;
      const totJual = qty * jual;
      const totModal = qty * modal;
      const netProfit = totJual - totModal - admin;

      const newRow = [
        item.id || ('TRX-' + Math.floor(1000 + Math.random() * 9000)),
        item.tanggal_pesanan || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        item.platform || 'Shopee',
        item.nama_produk || 'Aksesoris Mobil',
        item.variasi || 'Standar',
        qty,
        modal,
        jual,
        admin,
        totJual,
        totModal,
        netProfit,
        item.status_pesanan || 'Selesai',
        item.catatan || '',
        item.gambar || '/products/over_fender.jpg',
        new Date().toISOString()
      ];

      sheet.appendRow(newRow);
      return responseJSON({ success: true, message: 'Transaksi berhasil ditambahkan ke Google Sheets', data: item });
    }

    // 2. BULK UPLOAD SELURUH DATA LOKAL (MIGRASI DATA)
    if (action === 'bulk_insert') {
      const items = body.data || [];
      if (!Array.isArray(items) || items.length === 0) {
        return responseJSON({ success: false, message: 'Tidak ada data untuk diupload' });
      }

      // Bersihkan data lama kecuali header
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }

      const rowsToAppend = items.map(item => {
        const qty = Number(item.qty) || 1;
        const modal = Number(item.harga_modal) || 0;
        const jual = Number(item.harga_jual) || 0;
        const admin = Number(item.biaya_admin) || 0;
        const totJual = qty * jual;
        const totModal = qty * modal;
        const netProfit = totJual - totModal - admin;

        return [
          item.id || ('TRX-' + Math.floor(1000 + Math.random() * 9000)),
          item.tanggal_pesanan || '',
          item.platform || 'Shopee',
          item.nama_produk || '',
          item.variasi || '',
          qty,
          modal,
          jual,
          admin,
          totJual,
          totModal,
          netProfit,
          item.status_pesanan || 'Selesai',
          item.catatan || '',
          item.gambar || '/products/over_fender.jpg',
          new Date().toISOString()
        ];
      });

      if (rowsToAppend.length > 0) {
        sheet.getRange(2, 1, rowsToAppend.length, HEADERS.length).setValues(rowsToAppend);
      }

      return responseJSON({ success: true, count: rowsToAppend.length, message: 'Berhasil upload data ke Google Sheets' });
    }

    // 3. HAPUS TRANSAKSI BERDASARKAN ID
    if (action === 'delete') {
      const idToDelete = body.id;
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(idToDelete)) {
          sheet.deleteRow(i + 1);
          return responseJSON({ success: true, message: 'Transaksi ' + idToDelete + ' berhasil dihapus dari Google Sheets' });
        }
      }
      return responseJSON({ success: false, message: 'ID transaksi tidak ditemukan' });
    }

    // 4. UPDATE TRANSAKSI / STATUS BERDASARKAN ID
    if (action === 'update') {
      const item = body.data || body;
      const idToUpdate = item.id;
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(idToUpdate)) {
          if (item.status_pesanan) sheet.getRange(i + 1, 13).setValue(item.status_pesanan);
          if (item.catatan !== undefined) sheet.getRange(i + 1, 14).setValue(item.catatan);
          if (item.qty !== undefined) sheet.getRange(i + 1, 6).setValue(item.qty);
          if (item.harga_modal !== undefined) sheet.getRange(i + 1, 7).setValue(item.harga_modal);
          if (item.harga_jual !== undefined) sheet.getRange(i + 1, 8).setValue(item.harga_jual);
          if (item.biaya_admin !== undefined) sheet.getRange(i + 1, 9).setValue(item.biaya_admin);
          if (item.total_penjualan !== undefined) sheet.getRange(i + 1, 10).setValue(item.total_penjualan);
          if (item.total_modal !== undefined) sheet.getRange(i + 1, 11).setValue(item.total_modal);
          if (item.profit_bersih !== undefined) sheet.getRange(i + 1, 12).setValue(item.profit_bersih);
          return responseJSON({ success: true, message: 'Transaksi ' + idToUpdate + ' berhasil diperbarui di Google Sheets' });
        }
      }
      return responseJSON({ success: false, message: 'ID transaksi tidak ditemukan' });
    }

    return responseJSON({ success: false, message: 'Aksi tidak dikenal' });
  } catch (error) {
    return responseJSON({ success: false, error: error.toString() });
  }
}

/**
 * Format output JSON dengan CORS enabled
 */
function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
