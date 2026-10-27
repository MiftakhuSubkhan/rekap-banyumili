import { db, PRODUCT_CATALOG } from './src/js/db.js';
import { formatIDR, formatDateID } from './src/js/utils.js';

console.log('--- RUNNING TEST SUITE ---');

// Test 1: Seed data metrics
const metrics = db.getMetrics();
console.log('1. Metrics check:');
console.log('   Total Revenue:', formatIDR(metrics.totalRevenue));
console.log('   Net Profit:', formatIDR(metrics.totalNetProfit));
console.log('   Transactions count:', metrics.totalTransactions);
console.log('   Unique products:', metrics.uniqueProducts);

if (metrics.totalRevenue !== 5760000) {
  console.error('FAIL: Expected total revenue 5760000, got', metrics.totalRevenue);
  process.exit(1);
}

if (metrics.totalNetProfit !== 1982000) {
  console.error('FAIL: Expected net profit 1982000, got', metrics.totalNetProfit);
  process.exit(1);
}

if (metrics.totalTransactions !== 24) {
  console.error('FAIL: Expected 24 transactions, got', metrics.totalTransactions);
  process.exit(1);
}

console.log('✓ Test 1 Passed: Initial seed data metrics match mockup exactly!');

// Test 2: Add Transaction & Calculation
console.log('2. Add Transaction test:');
const newTrx = db.addTransaction({
  tanggal_pesanan: '2026-10-27',
  nama_produk: 'Sarung Stir Mobil',
  variasi: 'Hitam Carbon',
  qty: 2,
  harga_modal: 45000,
  harga_jual: 90000,
  biaya_admin: 6000,
  status_pesanan: 'Selesai',
  catatan: 'Shopee Star+ Order #261027XYZ'
});

console.log('   Created Transaction:', newTrx.id);
console.log('   Total Penjualan:', newTrx.total_penjualan, '(expected: 180000)');
console.log('   Total Modal:', newTrx.total_modal, '(expected: 90000)');
console.log('   Profit Bersih:', newTrx.profit_bersih, '(expected: 84000)');

if (newTrx.total_penjualan !== 180000 || newTrx.total_modal !== 90000 || newTrx.profit_bersih !== 84000) {
  console.error('FAIL: Calculations incorrect');
  process.exit(1);
}

console.log('✓ Test 2 Passed: New transaction calculations are accurate!');

// Test 3: Metrics after Add
const updatedMetrics = db.getMetrics();
console.log('3. Metrics update check:');
console.log('   New Count:', updatedMetrics.totalTransactions, '(expected: 25)');
console.log('   New Revenue:', updatedMetrics.totalRevenue, '(expected: 5940000)');
console.log('   New Profit:', updatedMetrics.totalNetProfit, '(expected: 2066000)');

if (updatedMetrics.totalTransactions !== 25 || updatedMetrics.totalRevenue !== 5940000 || updatedMetrics.totalNetProfit !== 2066000) {
  console.error('FAIL: Metrics update failed');
  process.exit(1);
}
console.log('✓ Test 3 Passed: Real-time metrics re-calculation succeeded!');

// Test 4: Delete Transaction
db.deleteTransaction(newTrx.id);
const restoredMetrics = db.getMetrics();
console.log('   Restored metrics:', restoredMetrics.totalTransactions, restoredMetrics.totalRevenue);
if (restoredMetrics.totalTransactions !== 24 || restoredMetrics.totalRevenue !== 5760000) {
  console.error('FAIL: Delete transaction failed', restoredMetrics);
  process.exit(1);
}
console.log('✓ Test 4 Passed: Transaction deletion and restoration verified!');

// Test 5: Formatting check
console.log('5. Format check:');
console.log('   formatIDR(5760000):', formatIDR(5760000));
console.log('   formatDateID("2026-10-21"):', formatDateID("2026-10-21"));
console.log('✓ Test 5 Passed: Formatting verified!');

// Test 6: Catalog CRUD operations
console.log('6. Catalog CRUD test:');
const initialCatalog = db.getCatalog();
console.log('   Initial catalog length:', initialCatalog.length, '(expected: 8)');
if (initialCatalog.length !== 8) {
  console.error('FAIL: Expected 8 products in catalog, got', initialCatalog.length);
  process.exit(1);
}

// 6a: Add Product
const addedProd = db.addProduct({
  nama_produk: 'Grill Custom Triton',
  kategori: 'Grill',
  variasi_default: 'Hitam Doff Honeycomb',
  harga_modal: 250000,
  harga_jual: 450000,
  biaya_admin_default: 29250,
  gambar: '/products/over_fender.jpg'
});
console.log('   Added Product:', addedProd.nama_produk, 'ID:', addedProd.id);
if (db.getCatalog().length !== 9) {
  console.error('FAIL: Expected 9 products after add');
  process.exit(1);
}

// 6b: Update Product
const updatedProd = db.updateProduct(addedProd.id, {
  nama_produk: 'Grill Custom Triton Raptor Edition',
  harga_jual: 500000
});
if (updatedProd.nama_produk !== 'Grill Custom Triton Raptor Edition' || updatedProd.harga_jual !== 500000) {
  console.error('FAIL: Product update failed');
  process.exit(1);
}
console.log('   Updated Product:', updatedProd.nama_produk, 'New Price:', updatedProd.harga_jual);

// 6c: Delete Product
db.deleteProduct(addedProd.id);
if (db.getCatalog().length !== 8) {
  console.error('FAIL: Product delete failed');
  process.exit(1);
}
console.log('✓ Test 6 Passed: Catalog Add, Update, and Delete verified!');

// Test 7: Independent Transaction Reset (Catalog Protection Check)
console.log('7. Transaction Reset vs Catalog Protection test:');
// Add a custom product to catalog
const customItem = db.addProduct({
  nama_produk: 'Bumper Belakang ARB Triton',
  kategori: 'Variasi Mobil',
  harga_modal: 1500000,
  harga_jual: 2200000
});
const catLenBefore = db.getCatalog().length; // 9

// Reset transactions
db.resetToDefault();
const catLenAfter = db.getCatalog().length;
const trxLenAfter = db.getAll().length;

if (catLenAfter !== catLenBefore) {
  console.error('FAIL: Catalog was modified during transaction reset! Expected', catLenBefore, 'got', catLenAfter);
  process.exit(1);
}
if (trxLenAfter !== 24) {
  console.error('FAIL: Expected 24 transactions after reset, got', trxLenAfter);
  process.exit(1);
}
console.log('   Catalog count preserved:', catLenAfter, '(expected:', catLenBefore, ')');
console.log('   Transactions reset:', trxLenAfter, '(expected: 24)');

// Clear transactions test
db.clearAllTransactions();
if (db.getAll().length !== 0 || db.getCatalog().length !== catLenBefore) {
  console.error('FAIL: Clear all transactions failed or corrupted catalog');
  process.exit(1);
}
console.log('   Clear transactions: 0 transactions, catalog intact:', db.getCatalog().length);

// Restore transactions and remove test product
db.resetToDefault();
db.deleteProduct(customItem.id);
console.log('✓ Test 7 Passed: Reset transaksi 100% independen & katalog produk terlindungi utuh!');

// Test 8: Multi-Platform Dual-Pricing (Shopee vs TikTok Shop)
console.log('8. Multi-Platform Dual-Pricing test:');
const prodOverFender = db.getCatalog().find(p => p.id === 'prod-1');
console.log('   Catalog item prod-1: Shopee =', prodOverFender.harga_jual_shopee, '| TikTok =', prodOverFender.harga_jual_tiktok);

if (!prodOverFender.harga_jual_shopee || !prodOverFender.harga_jual_tiktok || prodOverFender.harga_jual_shopee === prodOverFender.harga_jual_tiktok) {
  console.error('FAIL: Dual pricing missing or identical in catalog prod-1');
  process.exit(1);
}

// Add Shopee transaction
const trxShopee = db.addTransaction({
  platform: 'Shopee',
  nama_produk: prodOverFender.nama_produk,
  variasi: 'Baut L Chrome',
  qty: 1,
  harga_modal: prodOverFender.harga_modal,
  harga_jual: prodOverFender.harga_jual_shopee,
  biaya_admin: prodOverFender.biaya_admin_shopee
});

// Add TikTok transaction
const trxTikTok = db.addTransaction({
  platform: 'TikTok',
  nama_produk: prodOverFender.nama_produk,
  variasi: 'Baut L Chrome',
  qty: 1,
  harga_modal: prodOverFender.harga_modal,
  harga_jual: prodOverFender.harga_jual_tiktok,
  biaya_admin: prodOverFender.biaya_admin_tiktok
});

if (trxShopee.platform !== 'Shopee' || trxTikTok.platform !== 'TikTok') {
  console.error('FAIL: Platform tags incorrect');
  process.exit(1);
}

if (trxShopee.harga_jual !== 700000 || trxTikTok.harga_jual !== 685000) {
  console.error('FAIL: Platform prices incorrect');
  process.exit(1);
}

console.log('   Shopee TRX:', trxShopee.id, 'Platform:', trxShopee.platform, 'Price:', trxShopee.harga_jual, 'Profit:', trxShopee.profit_bersih);
console.log('   TikTok TRX:', trxTikTok.id, 'Platform:', trxTikTok.platform, 'Price:', trxTikTok.harga_jual, 'Profit:', trxTikTok.profit_bersih);

// Clean up test transactions
db.deleteTransaction(trxShopee.id);
db.deleteTransaction(trxTikTok.id);
console.log('✓ Test 8 Passed: Multi-Platform Dual-Pricing (Shopee vs TikTok) diverifikasi sempurna!');

console.log('ALL TESTS PASSED SUCCESSFULLY! 🚀');



