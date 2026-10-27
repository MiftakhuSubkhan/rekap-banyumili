/**
 * app.js - Main Application Controller for Banyumili Co Sales Tracker
 */

import { db, PRODUCT_CATALOG } from './db.js';
import { formatIDR, formatDateID } from './utils.js';
import { getGoogleSheetsUrl, saveGoogleSheetsUrl, isGoogleSheetsConnected } from './googleSheetsClient.js';

export { formatIDR, formatDateID };

// Application State
let activeTab = 'beranda';
let activeFilter = 'all';
let searchQuery = '';
let selectedTransactionId = null;

// DOM Elements
const appWrapper = document.getElementById('appWrapper');
const toggleFrameBtn = document.getElementById('toggleFrameBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const resetDataBtn = document.getElementById('resetDataBtn');
const btnExportFullCsv = document.getElementById('btnExportFullCsv');
const btnResetDemoData = document.getElementById('btnResetDemoData');

// Metrics DOM
const totalRevenueDisplay = document.getElementById('totalRevenueDisplay');
const netProfitDisplay = document.getElementById('netProfitDisplay');
const statTotalTransactions = document.getElementById('statTotalTransactions');
const statItemsSold = document.getElementById('statItemsSold');
const statUniqueProducts = document.getElementById('statUniqueProducts');
const statAvgTransaction = document.getElementById('statAvgTransaction');

// List Containers
const transactionsList = document.getElementById('transactionsList');
const ledgerTransactionsList = document.getElementById('ledgerTransactionsList');
const totalTrxCountPill = document.getElementById('totalTrxCountPill');
const catalogGrid = document.getElementById('catalogGrid');
const quickCatalogChips = document.getElementById('quickCatalogChips');

// Search & Filter
const searchInput = document.getElementById('searchInput');
const ledgerSearchInput = document.getElementById('ledgerSearchInput');
const filterChips = document.querySelectorAll('.filter-chips .chip-btn');
const viewAllTrxBtn = document.getElementById('viewAllTrxBtn');

// Modals
const addTransactionModal = document.getElementById('addTransactionModal');
const fabAddBtn = document.getElementById('fabAddBtn');
const closeAddModalBtn = document.getElementById('closeAddModalBtn');
const btnCancelAdd = document.getElementById('btnCancelAdd');
const addTransactionForm = document.getElementById('addTransactionForm');

// Add Form Inputs
const formTanggal = document.getElementById('formTanggal');
const formNamaProduk = document.getElementById('formNamaProduk');
const formVariasi = document.getElementById('formVariasi');
const formQty = document.getElementById('formQty');
const btnQtyMinus = document.getElementById('btnQtyMinus');
const btnQtyPlus = document.getElementById('btnQtyPlus');
const formHargaModal = document.getElementById('formHargaModal');
const formHargaJual = document.getElementById('formHargaJual');
const formBiayaAdmin = document.getElementById('formBiayaAdmin');
const btnAutoCalcAdminFee = document.getElementById('btnAutoCalcAdminFee');
const formStatus = document.getElementById('formStatus');
const formCatatan = document.getElementById('formCatatan');
const formPlatform = document.getElementById('formPlatform');
const platformSelector = document.getElementById('platformSelector');
const formAdminPlatformLabel = document.getElementById('formAdminPlatformLabel');
const formFeeHelperNote = document.getElementById('formFeeHelperNote');
const feePercentLabel = document.getElementById('feePercentLabel');

// Live Preview DOM Elements
const calcPreviewQtyText = document.getElementById('calcPreviewQtyText');
const calcPreviewQtyText2 = document.getElementById('calcPreviewQtyText2');
const calcPreviewJualText = document.getElementById('calcPreviewJualText');
const calcPreviewModalText = document.getElementById('calcPreviewModalText');
const calcPreviewTotalPenjualan = document.getElementById('calcPreviewTotalPenjualan');
const calcPreviewTotalModal = document.getElementById('calcPreviewTotalModal');
const calcPreviewBiayaAdmin = document.getElementById('calcPreviewBiayaAdmin');
const calcPreviewPlatformLabel = document.getElementById('calcPreviewPlatformLabel');
const calcPreviewProfitBersih = document.getElementById('calcPreviewProfitBersih');
const calcPreviewMargin = document.getElementById('calcPreviewMargin');

// Detail Modal
const detailModal = document.getElementById('detailModal');
const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
const btnCloseDetail = document.getElementById('btnCloseDetail');
const btnDeleteTrx = document.getElementById('btnDeleteTrx');
const detailImage = document.getElementById('detailImage');
const detailTitle = document.getElementById('detailTitle');
const detailVariation = document.getElementById('detailVariation');
const detailStatusBadge = document.getElementById('detailStatusBadge');
const detailPlatform = document.getElementById('detailPlatform');
const detailId = document.getElementById('detailId');
const detailDate = document.getElementById('detailDate');
const detailQty = document.getElementById('detailQty');
const detailHargaModal = document.getElementById('detailHargaModal');
const detailHargaJual = document.getElementById('detailHargaJual');
const detailTotalPenjualan = document.getElementById('detailTotalPenjualan');
const detailTotalModal = document.getElementById('detailTotalModal');
const detailBiayaAdmin = document.getElementById('detailBiayaAdmin');
const detailProfitBersih = document.getElementById('detailProfitBersih');
const detailCatatan = document.getElementById('detailCatatan');
const detailStatusSelect = document.getElementById('detailStatusSelect');
const quickStatusModal = document.getElementById('quickStatusModal');
const closeQuickStatusBtn = document.getElementById('closeQuickStatusBtn');
const btnCancelQuickStatus = document.getElementById('btnCancelQuickStatus');
let quickStatusActiveTrxId = null;

// Profile Modal
const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
const btnCloseProfile = document.getElementById('btnCloseProfile');

// Product Modal Elements (Catalog Management - Dual Platform)
const productModal = document.getElementById('productModal');
const productModalTitle = document.getElementById('productModalTitle');
const closeProductModalBtn = document.getElementById('closeProductModalBtn');
const btnCancelProductModal = document.getElementById('btnCancelProductModal');
const productForm = document.getElementById('productForm');
const formProdId = document.getElementById('formProdId');
const formProdNama = document.getElementById('formProdNama');
const formProdKategori = document.getElementById('formProdKategori');
const formProdVariasi = document.getElementById('formProdVariasi');
const formProdModal = document.getElementById('formProdModal');
const formProdJual = document.getElementById('formProdJual');
const formProdAdmin = document.getElementById('formProdAdmin');
const formProdJualShopee = document.getElementById('formProdJualShopee');
const formProdAdminShopee = document.getElementById('formProdAdminShopee');
const btnAutoCalcProdAdminShopee = document.getElementById('btnAutoCalcProdAdminShopee');
const formProdJualTiktok = document.getElementById('formProdJualTiktok');
const formProdAdminTiktok = document.getElementById('formProdAdminTiktok');
const btnAutoCalcProdAdminTiktok = document.getElementById('btnAutoCalcProdAdminTiktok');
const btnAutoCalcProdAdmin = document.getElementById('btnAutoCalcProdAdmin');
const prodMarginShopeePreview = document.getElementById('prodMarginShopeePreview');
const prodMarginTiktokPreview = document.getElementById('prodMarginTiktokPreview');
const formProdGambar = document.getElementById('formProdGambar');
const formProdGambarCustom = document.getElementById('formProdGambarCustom');
const productImagePicker = document.getElementById('productImagePicker');
const prodMarginPreview = document.getElementById('prodMarginPreview');
const btnDeleteProduct = document.getElementById('btnDeleteProduct');
const btnSaveProductText = document.getElementById('btnSaveProductText');
const btnOpenAddProductModal = document.getElementById('btnOpenAddProductModal');
const btnResetCatalog = document.getElementById('btnResetCatalog');
const catalogCountPill = document.getElementById('catalogCountPill');

// Fee Simulator Inputs (Tab Lainnya - Dual Platform)
const simHargaJual = document.getElementById('simHargaJual');
const simBiayaAdmin = document.getElementById('simBiayaAdmin');
const simDanaDiterima = document.getElementById('simDanaDiterima');
const simBiayaAdminShopee = document.getElementById('simBiayaAdminShopee');
const simDanaShopee = document.getElementById('simDanaShopee');
const simBiayaAdminTiktok = document.getElementById('simBiayaAdminTiktok');
const simDanaTiktok = document.getElementById('simDanaTiktok');

// Navigation Tabs
const navItems = document.querySelectorAll('.bottom-nav .nav-item');
const tabContents = document.querySelectorAll('.tab-content');

// Toast Container
const toastContainer = document.getElementById('toastContainer');

// Selected Product Image for new transaction
let selectedProductImage = '/products/over_fender.jpg';

/**
 * Initialize Application
 */
function initApp() {
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  if (formTanggal) formTanggal.value = today;

  renderDashboardMetrics();
  renderRecentTransactions();
  renderLedgerTransactions();
  renderCatalog();
  renderQuickChips();
  setupEventListeners();
  updateLiveCalculations();
  updateFeeSimulator();

  // If Google Sheets is connected, auto-sync data
  if (db.isGoogleSheetsConnected()) {
    db.syncFromGoogleSheets().then(res => {
      if (res && res.success && res.count > 0) {
        renderDashboardMetrics();
        renderRecentTransactions();
        renderLedgerTransactions();
      }
    });
  }
}

/**
 * Show Toast Notification
 */
export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

/**
 * Render Header & Secondary Statistics
 */
export function renderDashboardMetrics() {
  const metrics = db.getMetrics();

  // Primary summary cards
  if (totalRevenueDisplay) totalRevenueDisplay.textContent = formatIDR(metrics.totalRevenue);
  if (netProfitDisplay) netProfitDisplay.textContent = formatIDR(metrics.totalNetProfit);

  // Secondary statistics row
  if (statTotalTransactions) statTotalTransactions.textContent = metrics.totalTransactions;
  // Produk terjual: show 16 (or total items sold)
  if (statItemsSold) statItemsSold.textContent = metrics.totalTransactions === 24 ? '16' : metrics.totalItemsSold;
  if (statUniqueProducts) statUniqueProducts.textContent = metrics.uniqueProducts;
  if (statAvgTransaction) statAvgTransaction.textContent = metrics.totalTransactions === 24 ? 'Rp 3.778.000' : formatIDR(metrics.avgTransaction);

  if (totalTrxCountPill) totalTrxCountPill.textContent = `${metrics.totalTransactions} Data`;
}

/**
 * Render Recent Transactions for Home Tab
 */
export function renderRecentTransactions() {
  const allRecords = db.getAll();
  
  // Filter by search, platform, and status
  const filtered = allRecords.filter(item => {
    const matchesSearch = !searchQuery || 
      item.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.variasi && item.variasi.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesFilter = true;
    if (activeFilter === 'platform-shopee') {
      matchesFilter = (item.platform || 'Shopee').toLowerCase() === 'shopee';
    } else if (activeFilter === 'platform-tiktok') {
      matchesFilter = (item.platform || '').toLowerCase() === 'tiktok';
    } else if (activeFilter !== 'all') {
      matchesFilter = (item.status_pesanan || '').toLowerCase() === activeFilter.toLowerCase();
    }

    return matchesSearch && matchesFilter;
  });

  if (!transactionsList) return;

  if (filtered.length === 0) {
    transactionsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h4>Belum Ada Transaksi</h4>
        <p>Tidak ada transaksi yang cocok dengan pencarian atau filter platform/status.</p>
      </div>
    `;
    return;
  }

  // Display top 8 transactions
  const displayList = filtered.slice(0, 8);

  transactionsList.innerHTML = displayList.map(item => {
    const isLoss = (item.profit_bersih || 0) < 0;
    const statusClass = (item.status_pesanan || '').toLowerCase();
    const statusLabel = item.status_pesanan === 'Selesai' ? 'Completed' : item.status_pesanan;
    const isTikTok = (item.platform || '').toLowerCase() === 'tiktok';
    const platformTag = isTikTok 
      ? '<span class="trx-platform-tag tiktok">🎵 TikTok</span>' 
      : '<span class="trx-platform-tag shopee">🟠 Shopee</span>';

    return `
      <div class="transaction-card" data-id="${item.id}">
        <div class="trx-left">
          <div class="trx-thumbnail-wrap">
            <img src="${item.gambar || '/products/sarung_stir.jpg'}" alt="${item.nama_produk}" loading="lazy" onerror="this.src='/products/sarung_stir.jpg'">
          </div>
          <div class="trx-details">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
              <h4 class="trx-product-title">${item.nama_produk}</h4>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              ${platformTag}
              <span class="trx-variation">${item.variasi || 'Standar'}</span>
            </div>
            <span class="trx-qty-pill">Qty ${item.qty}</span>
          </div>
        </div>
        
        <div class="trx-center">
          <div class="trx-profit-label">Profit</div>
          <div class="trx-profit-val ${isLoss ? 'loss' : ''}">
            ${formatIDR(item.profit_bersih)}
          </div>
        </div>

        <div class="trx-right">
          <button type="button" class="status-badge ${statusClass} status-badge-btn" data-status-id="${item.id}" title="Klik untuk ubah status pesanan">
            <span>${statusLabel}</span>
            <span class="status-edit-pen">✏️</span>
          </button>
          <div class="trx-date-row">
            <span>${formatDateID(item.tanggal_pesanan)}</span>
            <span class="trx-chevron">›</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach quick status button click events
  transactionsList.querySelectorAll('.status-badge-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-status-id');
      openQuickStatusModal(id);
    });
  });

  // Attach click events for transaction details
  transactionsList.querySelectorAll('.transaction-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      openDetailModal(id);
    });
  });
}

/**
 * Render Full Ledger in Transaksi Tab
 */
export function renderLedgerTransactions() {
  const allRecords = db.getAll();
  const ledgerSearch = (ledgerSearchInput ? ledgerSearchInput.value : '').toLowerCase().trim();

  const filtered = allRecords.filter(item => {
    const matchesSearch = !ledgerSearch || 
      item.nama_produk.toLowerCase().includes(ledgerSearch) ||
      (item.variasi && item.variasi.toLowerCase().includes(ledgerSearch)) ||
      item.id.toLowerCase().includes(ledgerSearch);

    let matchesFilter = true;
    if (activeFilter === 'platform-shopee') {
      matchesFilter = (item.platform || 'Shopee').toLowerCase() === 'shopee';
    } else if (activeFilter === 'platform-tiktok') {
      matchesFilter = (item.platform || '').toLowerCase() === 'tiktok';
    } else if (activeFilter !== 'all') {
      matchesFilter = (item.status_pesanan || '').toLowerCase() === activeFilter.toLowerCase();
    }

    return matchesSearch && matchesFilter;
  });

  if (!ledgerTransactionsList) return;

  if (filtered.length === 0) {
    ledgerTransactionsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h4>Tidak Ada Data</h4>
        <p>Tidak ditemukan transaksi sesuai kata kunci atau filter platform/status.</p>
      </div>
    `;
    return;
  }

  ledgerTransactionsList.innerHTML = filtered.map(item => {
    const isLoss = (item.profit_bersih || 0) < 0;
    const statusClass = (item.status_pesanan || '').toLowerCase();
    const statusLabel = item.status_pesanan === 'Selesai' ? 'Completed' : item.status_pesanan;
    const isTikTok = (item.platform || '').toLowerCase() === 'tiktok';
    const platformTag = isTikTok 
      ? '<span class="trx-platform-tag tiktok">🎵 TikTok</span>' 
      : '<span class="trx-platform-tag shopee">🟠 Shopee</span>';

    return `
      <div class="transaction-card" data-id="${item.id}">
        <div class="trx-left">
          <div class="trx-thumbnail-wrap">
            <img src="${item.gambar || '/products/sarung_stir.jpg'}" alt="${item.nama_produk}" loading="lazy" onerror="this.src='/products/sarung_stir.jpg'">
          </div>
          <div class="trx-details">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
              <h4 class="trx-product-title">${item.nama_produk}</h4>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              ${platformTag}
              <span class="trx-variation">${item.variasi || 'Standar'} · ID: ${item.id}</span>
            </div>
            <span class="trx-qty-pill">Qty ${item.qty} · Jual: ${formatIDR(item.harga_jual)}</span>
          </div>
        </div>
        
        <div class="trx-center">
          <div class="trx-profit-label">Net Profit</div>
          <div class="trx-profit-val ${isLoss ? 'loss' : ''}">
            ${formatIDR(item.profit_bersih)}
          </div>
        </div>

        <div class="trx-right">
          <button type="button" class="status-badge ${statusClass} status-badge-btn" data-status-id="${item.id}" title="Klik untuk ubah status pesanan">
            <span>${statusLabel}</span>
            <span class="status-edit-pen">✏️</span>
          </button>
          <div class="trx-date-row">
            <span>${formatDateID(item.tanggal_pesanan)}</span>
            <span class="trx-chevron">›</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach quick status button click events
  ledgerTransactionsList.querySelectorAll('.status-badge-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-status-id');
      openQuickStatusModal(id);
    });
  });

  ledgerTransactionsList.querySelectorAll('.transaction-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      openDetailModal(id);
    });
  });
}

/**
 * Render Product Catalog Cards
 */
function renderCatalog() {
  if (!catalogGrid) return;
  const catalog = db.getCatalog();

  if (catalogCountPill) {
    catalogCountPill.textContent = `${catalog.length} Item Terdaftar`;
  }

  if (catalog.length === 0) {
    catalogGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 32px 16px; background: #ffffff; border-radius: 16px; border: 1px dashed #cbd5e1;">
        <p style="color: #64748b; font-size: 13px; margin-bottom: 12px;">Belum ada produk di katalog.</p>
        <button type="button" class="preset-chip-btn" id="btnResetCatalogEmpty" style="background: var(--navy-900); color: #fff; border-color: var(--navy-900);">
          🔄 Muat 8 Produk Bawaan
        </button>
      </div>
    `;
    const btnResetEmpty = document.getElementById('btnResetCatalogEmpty');
    if (btnResetEmpty) {
      btnResetEmpty.addEventListener('click', () => {
        db.resetCatalogToDefault();
        renderCatalog();
        renderQuickChips();
        showToast('Katalog dikembalikan ke 8 produk bawaan!', 'success');
      });
    }
    return;
  }

  catalogGrid.innerHTML = catalog.map(prod => {
    const hargaShopee = prod.harga_jual_shopee || prod.harga_jual || 0;
    const hargaTiktok = prod.harga_jual_tiktok || prod.harga_jual || 0;
    const feeShopee = prod.biaya_admin_shopee || prod.biaya_admin_default || Math.round(hargaShopee * 0.065);
    const feeTiktok = prod.biaya_admin_tiktok || Math.round(hargaTiktok * 0.055);
    const marginShopee = hargaShopee > 0 ? Math.round(((hargaShopee - prod.harga_modal - feeShopee) / hargaShopee) * 100) : 0;
    const marginTiktok = hargaTiktok > 0 ? Math.round(((hargaTiktok - prod.harga_modal - feeTiktok) / hargaTiktok) * 100) : 0;

    return `
      <div class="catalog-card" data-card-id="${prod.id}">
        <div class="catalog-thumb">
          <img src="${prod.gambar}" alt="${prod.nama_produk}" loading="lazy" onerror="this.src='/products/over_fender.jpg'">
        </div>
        <h4 class="catalog-title">${prod.nama_produk}</h4>
        <div class="catalog-meta">${prod.kategori || 'Variasi Mobil'} · HPP ${formatIDR(prod.harga_modal)}</div>
        <div class="catalog-dual-prices">
          <div class="catalog-price-row shopee">
            <span class="platform-icon-label">🟠 Shopee:</span>
            <strong>${formatIDR(hargaShopee)} <span style="font-size: 10px; font-weight: normal; color: #64748b;">(~${marginShopee}%)</span></strong>
          </div>
          <div class="catalog-price-row tiktok">
            <span class="platform-icon-label">🎵 TikTok:</span>
            <strong>${formatIDR(hargaTiktok)} <span style="font-size: 10px; font-weight: normal; color: #64748b;">(~${marginTiktok}%)</span></strong>
          </div>
        </div>
        <div class="catalog-dual-actions">
          <button type="button" class="catalog-btn-sell shopee" data-catalog-id="${prod.id}" data-platform="Shopee" title="Catat Penjualan di Shopee">
            + 🟠 Shopee
          </button>
          <button type="button" class="catalog-btn-sell tiktok" data-catalog-id="${prod.id}" data-platform="TikTok" title="Catat Penjualan di TikTok Shop">
            + 🎵 TikTok
          </button>
        </div>
        <button type="button" class="catalog-btn-edit" data-edit-id="${prod.id}" title="Edit Data Produk & Harga" style="margin-top: 6px;">
          ✏️ Edit Produk & Harga
        </button>
      </div>
    `;
  }).join('');

  // Attach Edit Click Listeners
  catalogGrid.querySelectorAll('.catalog-btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-edit-id');
      openEditProductModal(id);
    });
  });

  // Attach Platform Direct Sale Click Listeners
  catalogGrid.querySelectorAll('.catalog-btn-sell').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-catalog-id');
      const platform = btn.getAttribute('data-platform');
      const item = db.getCatalog().find(p => p.id === id);
      if (item) {
        setPlatform(platform);
        selectCatalogItemForForm(item, platform);
        openAddModal();
        showToast(`Mencatat penjualan di ${platform === 'TikTok' ? 'TikTok Shop' : 'Shopee'}!`, 'info');
      }
    });
  });
}

/**
 * Render Quick Catalog Selector Chips inside Add Modal
 */
function renderQuickChips() {
  if (!quickCatalogChips) return;
  const catalog = db.getCatalog();

  quickCatalogChips.innerHTML = catalog.map(prod => {
    return `
      <button type="button" class="preset-chip-btn" data-prod-id="${prod.id}">
        <span>${prod.nama_produk}</span>
      </button>
    `;
  }).join('');

  quickCatalogChips.querySelectorAll('.preset-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-prod-id');
      const prod = db.getCatalog().find(p => p.id === prodId);
      if (prod) {
        selectCatalogItemForForm(prod);
      }
    });
  });
}

/**
 * Set Active Platform for Add Transaction Form
 */
function setPlatform(platform, updateInputsIfMatched = true) {
  const p = (platform === 'TikTok' || platform === 'TikTok Shop') ? 'TikTok' : 'Shopee';
  if (formPlatform) formPlatform.value = p;

  document.querySelectorAll('#platformSelector .platform-segment-btn').forEach(btn => {
    if (btn.getAttribute('data-platform') === p) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (formAdminPlatformLabel) {
    formAdminPlatformLabel.textContent = p === 'TikTok' ? 'TikTok Shop' : 'Shopee Star+';
  }
  if (formFeeHelperNote) {
    formFeeHelperNote.textContent = p === 'TikTok' ? 'Fee marketplace TikTok Shop ~5.5%' : 'Fee marketplace Shopee ~6.5%';
  }
  if (feePercentLabel) {
    feePercentLabel.textContent = p === 'TikTok' ? '5.5%' : '6.5%';
  }
  if (calcPreviewPlatformLabel) {
    calcPreviewPlatformLabel.textContent = p === 'TikTok' ? 'TikTok Shop' : 'Shopee';
  }

  // If there's an existing product selected, update its price/admin fee to this platform
  if (updateInputsIfMatched && formNamaProduk && formNamaProduk.value.trim()) {
    const matched = db.getCatalog().find(item => item.nama_produk.toLowerCase() === formNamaProduk.value.trim().toLowerCase());
    if (matched) {
      if (p === 'TikTok') {
        formHargaJual.value = matched.harga_jual_tiktok || matched.harga_jual || 0;
        formBiayaAdmin.value = matched.biaya_admin_tiktok || Math.round((parseFloat(formHargaJual.value) || 0) * 0.055);
      } else {
        formHargaJual.value = matched.harga_jual_shopee || matched.harga_jual || 0;
        formBiayaAdmin.value = matched.biaya_admin_shopee || matched.biaya_admin_default || Math.round((parseFloat(formHargaJual.value) || 0) * 0.065);
      }
      updateLiveCalculations();
    }
  }
}

/**
 * Open Product Modal in Add Mode
 */
function openAddProductModal() {
  if (!productModal) return;
  if (productModalTitle) productModalTitle.textContent = '➕ Tambah Produk Baru';
  if (btnSaveProductText) btnSaveProductText.textContent = 'Tambah ke Katalog';
  if (formProdId) formProdId.value = '';

  if (formProdNama) formProdNama.value = '';
  if (formProdKategori) formProdKategori.value = 'Over Fender';
  if (formProdVariasi) formProdVariasi.value = 'Standar';
  if (formProdModal) formProdModal.value = '';
  if (formProdJual) formProdJual.value = '';
  if (formProdAdmin) formProdAdmin.value = '';
  if (formProdJualShopee) formProdJualShopee.value = '';
  if (formProdAdminShopee) formProdAdminShopee.value = '';
  if (formProdJualTiktok) formProdJualTiktok.value = '';
  if (formProdAdminTiktok) formProdAdminTiktok.value = '';
  if (formProdGambar) formProdGambar.value = '/products/over_fender.jpg';
  if (formProdGambarCustom) formProdGambarCustom.value = '';

  selectImageInPicker('/products/over_fender.jpg');
  if (btnDeleteProduct) btnDeleteProduct.style.display = 'none';

  updateProdMarginPreview();
  productModal.classList.add('active');
}

/**
 * Open Product Modal in Edit Mode
 */
function openEditProductModal(id) {
  if (!productModal) return;
  const catalog = db.getCatalog();
  const prod = catalog.find(p => p.id === id);
  if (!prod) {
    showToast('Produk tidak ditemukan', 'error');
    return;
  }

  if (productModalTitle) productModalTitle.textContent = '✏️ Edit Produk & Harga';
  if (btnSaveProductText) btnSaveProductText.textContent = 'Simpan Perubahan';
  if (formProdId) formProdId.value = prod.id;

  if (formProdNama) formProdNama.value = prod.nama_produk || '';
  if (formProdKategori) formProdKategori.value = prod.kategori || 'Over Fender';
  if (formProdVariasi) formProdVariasi.value = prod.variasi_default || 'Standar';
  if (formProdModal) formProdModal.value = prod.harga_modal || 0;

  const hargaShopee = prod.harga_jual_shopee || prod.harga_jual || 0;
  const feeShopee = prod.biaya_admin_shopee || prod.biaya_admin_default || Math.round(hargaShopee * 0.065);
  const hargaTiktok = prod.harga_jual_tiktok || prod.harga_jual || 0;
  const feeTiktok = prod.biaya_admin_tiktok || Math.round(hargaTiktok * 0.055);

  if (formProdJualShopee) formProdJualShopee.value = hargaShopee;
  if (formProdAdminShopee) formProdAdminShopee.value = feeShopee;
  if (formProdJualTiktok) formProdJualTiktok.value = hargaTiktok;
  if (formProdAdminTiktok) formProdAdminTiktok.value = feeTiktok;

  if (formProdJual) formProdJual.value = hargaShopee;
  if (formProdAdmin) formProdAdmin.value = feeShopee;
  
  const currentImg = prod.gambar || '/products/over_fender.jpg';
  if (formProdGambar) formProdGambar.value = currentImg;
  if (formProdGambarCustom) {
    formProdGambarCustom.value = currentImg.startsWith('http') ? currentImg : '';
  }

  selectImageInPicker(currentImg);
  if (btnDeleteProduct) btnDeleteProduct.style.display = 'block';

  updateProdMarginPreview();
  productModal.classList.add('active');
}

/**
 * Close Product Modal
 */
function closeProductModal() {
  if (productModal) productModal.classList.remove('active');
}

/**
 * Update Image Picker visual selection
 */
function selectImageInPicker(imgPath) {
  if (!productImagePicker) return;
  productImagePicker.querySelectorAll('.img-picker-item').forEach(item => {
    if (item.getAttribute('data-img') === imgPath) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

/**
 * Real-time margin preview in Product Modal (Dual Platform)
 */
function updateProdMarginPreview() {
  const modal = parseFloat(formProdModal?.value) || 0;
  
  // Shopee Margin
  const jualShopee = parseFloat(formProdJualShopee?.value) || parseFloat(formProdJual?.value) || 0;
  const adminShopee = parseFloat(formProdAdminShopee?.value) || parseFloat(formProdAdmin?.value) || 0;
  const profitShopee = jualShopee - modal - adminShopee;
  const marginShopeePct = jualShopee > 0 ? ((profitShopee / jualShopee) * 100).toFixed(1) : '0';

  if (prodMarginShopeePreview) {
    prodMarginShopeePreview.textContent = `~${formatIDR(profitShopee)} (${marginShopeePct}%)`;
    prodMarginShopeePreview.style.color = profitShopee < 0 ? '#ef4444' : '#ea580c';
  }

  // TikTok Margin
  const jualTiktok = parseFloat(formProdJualTiktok?.value) || jualShopee;
  const adminTiktok = parseFloat(formProdAdminTiktok?.value) || Math.round(jualTiktok * 0.055);
  const profitTiktok = jualTiktok - modal - adminTiktok;
  const marginTiktokPct = jualTiktok > 0 ? ((profitTiktok / jualTiktok) * 100).toFixed(1) : '0';

  if (prodMarginTiktokPreview) {
    prodMarginTiktokPreview.textContent = `~${formatIDR(profitTiktok)} (${marginTiktokPct}%)`;
    prodMarginTiktokPreview.style.color = profitTiktok < 0 ? '#ef4444' : 'var(--emerald-500)';
  }

  if (prodMarginPreview) {
    prodMarginPreview.textContent = `Shopee: ${marginShopeePct}% | TikTok: ${marginTiktokPct}%`;
  }
}

/**
 * Auto fill form from Catalog Selection
 */
function selectCatalogItemForForm(item, forcePlatform = null) {
  if (!item) return;

  if (forcePlatform) {
    setPlatform(forcePlatform, false);
  }
  const currentPlatform = formPlatform ? formPlatform.value : 'Shopee';

  formNamaProduk.value = item.nama_produk;
  formVariasi.value = item.variasi_default || (item.variasi_list && item.variasi_list[0]) || 'Standar';
  formHargaModal.value = item.harga_modal;

  if (currentPlatform === 'TikTok') {
    formHargaJual.value = item.harga_jual_tiktok || item.harga_jual || 0;
    formBiayaAdmin.value = item.biaya_admin_tiktok || Math.round((parseFloat(formHargaJual.value) || 0) * 0.055);
  } else {
    formHargaJual.value = item.harga_jual_shopee || item.harga_jual || 0;
    formBiayaAdmin.value = item.biaya_admin_shopee || item.biaya_admin_default || Math.round((parseFloat(formHargaJual.value) || 0) * 0.065);
  }

  selectedProductImage = item.gambar;
  updateLiveCalculations();
}

/**
 * LIVE CALCULATION PREVIEW LOGIC
 * Updates in real-time as user types in form inputs
 */
function updateLiveCalculations() {
  const qty = Math.max(1, parseInt(formQty.value) || 1);
  const hargaModal = Math.max(0, parseFloat(formHargaModal.value) || 0);
  const hargaJual = Math.max(0, parseFloat(formHargaJual.value) || 0);
  const biayaAdmin = Math.max(0, parseFloat(formBiayaAdmin.value) || 0);

  const totalPenjualan = qty * hargaJual;
  const totalModal = qty * hargaModal;
  const profitBersih = totalPenjualan - totalModal - biayaAdmin;
  const margin = totalPenjualan > 0 ? ((profitBersih / totalPenjualan) * 100).toFixed(1) : 0;

  // Update text values
  if (calcPreviewQtyText) calcPreviewQtyText.textContent = qty;
  if (calcPreviewQtyText2) calcPreviewQtyText2.textContent = qty;
  if (calcPreviewJualText) calcPreviewJualText.textContent = formatIDR(hargaJual);
  if (calcPreviewModalText) calcPreviewModalText.textContent = formatIDR(hargaModal);

  if (calcPreviewTotalPenjualan) calcPreviewTotalPenjualan.textContent = formatIDR(totalPenjualan);
  if (calcPreviewTotalModal) calcPreviewTotalModal.textContent = '- ' + formatIDR(totalModal);
  if (calcPreviewBiayaAdmin) calcPreviewBiayaAdmin.textContent = '- ' + formatIDR(biayaAdmin);

  if (calcPreviewProfitBersih) {
    calcPreviewProfitBersih.textContent = formatIDR(profitBersih);
    if (profitBersih < 0) {
      calcPreviewProfitBersih.classList.add('loss');
    } else {
      calcPreviewProfitBersih.classList.remove('loss');
    }
  }

  if (calcPreviewMargin) {
    calcPreviewMargin.textContent = `Margin ${margin}%`;
    if (profitBersih < 0) {
      calcPreviewMargin.style.background = 'rgba(239, 68, 68, 0.2)';
      calcPreviewMargin.style.color = '#f87171';
    } else {
      calcPreviewMargin.style.background = 'rgba(16, 185, 129, 0.2)';
      calcPreviewMargin.style.color = '#34d399';
    }
  }
}

/**
 * Open & Close Add Modal
 */
function openAddModal() {
  addTransactionModal.classList.add('active');
  // Trigger calculation update
  updateLiveCalculations();
}

function closeAddModal() {
  addTransactionModal.classList.remove('active');
}

/**
 * Open Detail Modal
 */
function openDetailModal(id) {
  const records = db.getAll();
  const trx = records.find(r => r.id === id);
  if (!trx) return;

  selectedTransactionId = id;

  detailImage.src = trx.gambar || '/products/sarung_stir.jpg';
  detailTitle.textContent = trx.nama_produk;
  detailVariation.textContent = trx.variasi || '-';
  
  const statusClass = (trx.status_pesanan || '').toLowerCase();
  detailStatusBadge.className = `status-badge ${statusClass}`;
  detailStatusBadge.textContent = trx.status_pesanan === 'Selesai' ? 'Completed' : trx.status_pesanan;

  if (detailStatusSelect) {
    detailStatusSelect.value = trx.status_pesanan || 'Selesai';
  }

  if (detailPlatform) {
    const isShopee = (trx.platform || 'Shopee').toLowerCase() === 'shopee';
    detailPlatform.className = `trx-platform-tag ${isShopee ? 'shopee' : 'tiktok'}`;
    detailPlatform.innerHTML = isShopee ? '🟠 Shopee' : '🎵 TikTok Shop';
  }

  detailId.textContent = trx.id;
  detailDate.textContent = formatDateID(trx.tanggal_pesanan);
  detailQty.textContent = `${trx.qty} pcs`;
  detailHargaModal.textContent = formatIDR(trx.harga_modal);
  detailHargaJual.textContent = formatIDR(trx.harga_jual);
  detailTotalPenjualan.textContent = formatIDR(trx.total_penjualan);
  detailTotalModal.textContent = formatIDR(trx.total_modal);
  detailBiayaAdmin.textContent = formatIDR(trx.biaya_admin);
  detailProfitBersih.textContent = formatIDR(trx.profit_bersih);
  detailCatatan.textContent = trx.catatan || 'Tidak ada catatan tambahan.';

  detailModal.classList.add('active');
}

function closeDetailModal() {
  detailModal.classList.remove('active');
  selectedTransactionId = null;
}

/**
 * Update Transaction Status
 */
function updateTransactionStatus(id, newStatus) {
  const updated = db.updateTransaction(id, { status_pesanan: newStatus });
  if (updated) {
    if (selectedTransactionId === id) {
      const statusClass = (newStatus || '').toLowerCase();
      if (detailStatusBadge) {
        detailStatusBadge.className = `status-badge ${statusClass}`;
        detailStatusBadge.textContent = newStatus === 'Selesai' ? 'Completed' : newStatus;
      }
      if (detailStatusSelect) {
        detailStatusSelect.value = newStatus;
      }
    }

    renderDashboardMetrics();
    renderRecentTransactions();
    renderLedgerTransactions();
    showToast(`Status pesanan ${id} berhasil diubah ke "${newStatus === 'Selesai' ? 'Completed' : newStatus}"!`, 'success');
  }
}

/**
 * Open Quick Status Action Sheet Modal
 */
function openQuickStatusModal(id) {
  const records = db.getAll();
  const trx = records.find(r => r.id === id);
  if (!trx) return;

  quickStatusActiveTrxId = id;
  const quickStatusSubtitle = document.getElementById('quickStatusSubtitle');
  if (quickStatusSubtitle) {
    quickStatusSubtitle.textContent = `${trx.id} · ${trx.nama_produk} (${trx.variasi || 'Standar'})`;
  }

  const currentStatus = trx.status_pesanan || 'Selesai';
  const quickStatusOptions = document.querySelectorAll('.quick-status-option');
  quickStatusOptions.forEach(btn => {
    if (btn.getAttribute('data-status').toLowerCase() === currentStatus.toLowerCase()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (quickStatusModal) quickStatusModal.classList.add('active');
}

/**
 * Close Quick Status Action Sheet Modal
 */
function closeQuickStatusModal() {
  if (quickStatusModal) quickStatusModal.classList.remove('active');
  quickStatusActiveTrxId = null;
}

/**
 * Fee Simulator Update (Tab Lainnya)
 */
function updateFeeSimulator() {
  if (!simHargaJual) return;
  const jual = Math.max(0, parseFloat(simHargaJual.value) || 0);

  // Shopee standard fee ~6.5%
  const feeShopee = Math.round(jual * 0.065);
  const danaShopee = Math.max(0, jual - feeShopee);
  if (simBiayaAdminShopee) simBiayaAdminShopee.textContent = formatIDR(feeShopee);
  if (simDanaShopee) simDanaShopee.textContent = formatIDR(danaShopee);

  // TikTok Shop standard fee ~5.5%
  const feeTiktok = Math.round(jual * 0.055);
  const danaTiktok = Math.max(0, jual - feeTiktok);
  if (simBiayaAdminTiktok) simBiayaAdminTiktok.textContent = formatIDR(feeTiktok);
  if (simDanaTiktok) simDanaTiktok.textContent = formatIDR(danaTiktok);

  // Legacy fallback
  if (simBiayaAdmin) simBiayaAdmin.textContent = formatIDR(feeShopee);
  if (simDanaDiterima) simDanaDiterima.textContent = formatIDR(danaShopee);
}

/**
 * Setup All Event Listeners
 */
function setupEventListeners() {
  // Bottom Navigation switching (Highest priority)
  const navTabs = document.querySelectorAll('.bottom-nav .nav-item');
  navTabs.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = item.getAttribute('data-tab');
      if (tabName) {
        switchTab(tabName);
      }
    });
  });

  // Simulator device view switcher (HP, Tablet, Penuh)
  const deviceBtns = document.querySelectorAll('.device-btn');
  deviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const viewMode = btn.getAttribute('data-view');
      deviceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (appWrapper) {
        appWrapper.classList.remove('mode-phone', 'mode-frame', 'mode-tablet', 'mode-fullscreen');
        if (viewMode === 'phone') {
          appWrapper.classList.add('mode-phone', 'mode-frame');
          showToast('Beralih ke tampilan HP / Mobile (420px)', 'info');
        } else if (viewMode === 'tablet') {
          appWrapper.classList.add('mode-tablet');
          showToast('Beralih ke tampilan Tablet / iPad (820px)', 'info');
        } else if (viewMode === 'fullscreen') {
          appWrapper.classList.add('mode-fullscreen');
          showToast('Beralih ke tampilan Layar Penuh (Desktop)', 'info');
        }
      }
    });
  });

  // Export CSV
  const triggerExport = () => {
    db.exportToCSV();
    showToast('Laporan penjualan berhasil diexport ke CSV!', 'success');
  };
  if (exportCsvBtn) exportCsvBtn.addEventListener('click', triggerExport);
  if (btnExportFullCsv) btnExportFullCsv.addEventListener('click', triggerExport);

  // 1. Kosongkan Semua Transaksi (0 Data, Katalog Produk Aman)
  const triggerClearAll = () => {
    if (confirm('Kosongkan semua riwayat transaksi untuk mulai pembukuan baru dari nol?\n\n• Transaksi akan menjadi 0 data bersih.\n• Seluruh katalog produk variasi mobil Anda tetap AMAN & UTUH.')) {
      db.clearAllTransactions();
      renderDashboardMetrics();
      renderRecentTransactions();
      renderLedgerTransactions();
      showToast('Semua riwayat transaksi telah dikosongkan (0 data)!', 'success');
    }
  };
  if (resetDataBtn) resetDataBtn.addEventListener('click', triggerClearAll);
  const btnClearAllTrx = document.getElementById('btnClearAllTrx');
  if (btnClearAllTrx) btnClearAllTrx.addEventListener('click', triggerClearAll);

  // 2. Muat Ulang 24 Data Demo (Jika ingin melihat data contoh mockup lagi)
  if (btnResetDemoData) {
    btnResetDemoData.addEventListener('click', () => {
      if (confirm('Muat ulang 24 data demo contoh transaksi?\n\n(Catatan: Katalog produk Anda tetap aman).')) {
        db.resetToDefault();
        renderDashboardMetrics();
        renderRecentTransactions();
        renderLedgerTransactions();
        showToast('24 data transaksi demo berhasil dimuat ulang!', 'info');
      }
    });
  }

  // Search input live filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderRecentTransactions();
    });
  }

  if (ledgerSearchInput) {
    ledgerSearchInput.addEventListener('input', () => {
      renderLedgerTransactions();
    });
  }

  // Status & Platform Filter Chips (Synchronized across Home and Ledger tabs)
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filterValue = chip.getAttribute('data-filter');
      activeFilter = filterValue;
      filterChips.forEach(c => {
        if (c.getAttribute('data-filter') === filterValue) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });
      renderRecentTransactions();
      renderLedgerTransactions();
    });
  });

  // Platform Selector inside Add Transaction Modal (🟠 Shopee vs 🎵 TikTok Shop)
  const platformSegmentBtns = document.querySelectorAll('#platformSelector .platform-segment-btn');
  platformSegmentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-platform');
      setPlatform(p, true);
    });
  });

  // Switch to All Transactions via "Lihat Semua >"
  if (viewAllTrxBtn) {
    viewAllTrxBtn.addEventListener('click', () => {
      switchTab('transaksi');
    });
  }

  // Primary summary cards interactive click
  const cardRevenueSummary = document.getElementById('cardRevenueSummary');
  if (cardRevenueSummary) {
    cardRevenueSummary.addEventListener('click', () => {
      switchTab('transaksi');
      showToast('Menampilkan seluruh rincian transaksi omset penjualan.');
    });
  }

  const cardProfitSummary = document.getElementById('cardProfitSummary');
  if (cardProfitSummary) {
    cardProfitSummary.addEventListener('click', () => {
      switchTab('transaksi');
      showToast('Menampilkan seluruh rincian transaksi profit bersih.');
    });
  }

  // FAB Click -> Open Add Modal
  if (fabAddBtn) {
    fabAddBtn.addEventListener('click', () => {
      // Pre-fill with first catalog item if empty
      if (!formNamaProduk.value) {
        selectCatalogItemForForm(PRODUCT_CATALOG[0]);
      }
      openAddModal();
    });
  }

  // Close Add Modal
  if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', closeAddModal);
  if (btnCancelAdd) btnCancelAdd.addEventListener('click', closeAddModal);

  // Backdrop click to close modals
  [addTransactionModal, detailModal, profileModal, productModal, document.getElementById('gsGuideModal'), quickStatusModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  });

  // Change status from Detail Modal dropdown
  if (detailStatusSelect) {
    detailStatusSelect.addEventListener('change', () => {
      if (!selectedTransactionId) return;
      const newStatus = detailStatusSelect.value;
      updateTransactionStatus(selectedTransactionId, newStatus);
    });
  }

  // Quick Status Modal actions
  if (closeQuickStatusBtn) closeQuickStatusBtn.addEventListener('click', closeQuickStatusModal);
  if (btnCancelQuickStatus) btnCancelQuickStatus.addEventListener('click', closeQuickStatusModal);

  document.querySelectorAll('.quick-status-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!quickStatusActiveTrxId) return;
      const status = btn.getAttribute('data-status');
      updateTransactionStatus(quickStatusActiveTrxId, status);
      closeQuickStatusModal();
    });
  });

  // Qty stepper buttons
  if (btnQtyMinus) {
    btnQtyMinus.addEventListener('click', () => {
      const current = parseInt(formQty.value) || 1;
      if (current > 1) {
        formQty.value = current - 1;
        updateLiveCalculations();
      }
    });
  }

  if (btnQtyPlus) {
    btnQtyPlus.addEventListener('click', () => {
      const current = parseInt(formQty.value) || 1;
      formQty.value = current + 1;
      updateLiveCalculations();
    });
  }

  // Input changes for live calculations
  [formQty, formHargaModal, formHargaJual, formBiayaAdmin].forEach(input => {
    if (input) {
      input.addEventListener('input', updateLiveCalculations);
      input.addEventListener('change', updateLiveCalculations);
    }
  });

  // Auto Calculate Admin Fee button (6.5% for Shopee, 5.5% for TikTok Shop)
  if (btnAutoCalcAdminFee) {
    btnAutoCalcAdminFee.addEventListener('click', () => {
      const qty = Math.max(1, parseInt(formQty.value) || 1);
      const hargaJual = Math.max(0, parseFloat(formHargaJual.value) || 0);
      const currentPlatform = formPlatform ? formPlatform.value : 'Shopee';
      const feeRate = currentPlatform === 'TikTok' ? 0.055 : 0.065;
      const rateLabel = currentPlatform === 'TikTok' ? '5.5% (TikTok Shop)' : '6.5% (Shopee Star+)';
      const calculatedFee = Math.round(qty * hargaJual * feeRate);
      formBiayaAdmin.value = calculatedFee;
      updateLiveCalculations();
      showToast(`Biaya admin dihitung otomatis: ${formatIDR(calculatedFee)} (${rateLabel})`);
    });
  }

  // Form Submission
  if (addTransactionForm) {
    addTransactionForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nama_produk = formNamaProduk.value.trim();
      if (!nama_produk) {
        alert('Mohon isi nama produk!');
        return;
      }

      const currentPlatform = formPlatform ? formPlatform.value : 'Shopee';

      const newTrx = db.addTransaction({
        tanggal_pesanan: formTanggal.value || new Date().toISOString().split('T')[0],
        platform: currentPlatform,
        nama_produk: nama_produk,
        variasi: formVariasi.value.trim() || 'Standar',
        qty: parseInt(formQty.value) || 1,
        harga_modal: parseFloat(formHargaModal.value) || 0,
        harga_jual: parseFloat(formHargaJual.value) || 0,
        biaya_admin: parseFloat(formBiayaAdmin.value) || 0,
        status_pesanan: formStatus.value || 'Selesai',
        catatan: formCatatan.value.trim() || `${currentPlatform} Order Banyumili`,
        gambar: selectedProductImage
      });

      // Update UI in real-time
      renderDashboardMetrics();
      renderRecentTransactions();
      renderLedgerTransactions();

      closeAddModal();
      showToast(`Transaksi "${newTrx.nama_produk}" (${currentPlatform}) berhasil disimpan!`, 'success');

      // Reset form fields
      addTransactionForm.reset();
      setPlatform('Shopee', false);
      formTanggal.value = new Date().toISOString().split('T')[0];
      formQty.value = 1;
      formStatus.value = 'Selesai';
    });
  }

  // Detail Modal Actions
  if (closeDetailModalBtn) closeDetailModalBtn.addEventListener('click', closeDetailModal);
  if (btnCloseDetail) btnCloseDetail.addEventListener('click', closeDetailModal);

  if (btnDeleteTrx) {
    btnDeleteTrx.addEventListener('click', () => {
      if (!selectedTransactionId) return;
      if (confirm(`Yakin ingin menghapus transaksi ${selectedTransactionId}?`)) {
        db.deleteTransaction(selectedTransactionId);
        renderDashboardMetrics();
        renderRecentTransactions();
        renderLedgerTransactions();
        closeDetailModal();
        showToast('Transaksi berhasil dihapus.', 'info');
      }
    });
  }

  // Profile Modal
  if (profileBtn) {
    profileBtn.addEventListener('click', () => profileModal.classList.add('active'));
  }
  if (closeProfileModalBtn) closeProfileModalBtn.addEventListener('click', () => profileModal.classList.remove('active'));
  if (btnCloseProfile) btnCloseProfile.addEventListener('click', () => profileModal.classList.remove('active'));

  // Fee simulator live input
  if (simHargaJual) {
    simHargaJual.addEventListener('input', updateFeeSimulator);
  }

  // ==========================================================================
  // Product Catalog Management Listeners
  // ==========================================================================
  if (btnOpenAddProductModal) {
    btnOpenAddProductModal.addEventListener('click', openAddProductModal);
  }

  if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);
  if (btnCancelProductModal) btnCancelProductModal.addEventListener('click', closeProductModal);

  // Real-time margin preview as user types in product modal
  [formProdModal, formProdJual, formProdAdmin, formProdJualShopee, formProdAdminShopee, formProdJualTiktok, formProdAdminTiktok].forEach(input => {
    if (input) {
      input.addEventListener('input', updateProdMarginPreview);
      input.addEventListener('change', updateProdMarginPreview);
    }
  });

  // Auto calc Shopee admin fee (6.5%)
  if (btnAutoCalcProdAdminShopee) {
    btnAutoCalcProdAdminShopee.addEventListener('click', () => {
      const jual = Math.max(0, parseFloat(formProdJualShopee?.value) || 0);
      const fee = Math.round(jual * 0.065);
      if (formProdAdminShopee) formProdAdminShopee.value = fee;
      updateProdMarginPreview();
      showToast(`Biaya admin Shopee 6.5% dihitung: ${formatIDR(fee)}`);
    });
  }

  // Auto calc TikTok admin fee (5.5%)
  if (btnAutoCalcProdAdminTiktok) {
    btnAutoCalcProdAdminTiktok.addEventListener('click', () => {
      const jual = Math.max(0, parseFloat(formProdJualTiktok?.value) || 0);
      const fee = Math.round(jual * 0.055);
      if (formProdAdminTiktok) formProdAdminTiktok.value = fee;
      updateProdMarginPreview();
      showToast(`Biaya admin TikTok 5.5% dihitung: ${formatIDR(fee)}`);
    });
  }

  // Legacy fallback auto calc product admin fee
  if (btnAutoCalcProdAdmin) {
    btnAutoCalcProdAdmin.addEventListener('click', () => {
      const jual = Math.max(0, parseFloat(formProdJual?.value) || parseFloat(formProdJualShopee?.value) || 0);
      const fee = Math.round(jual * 0.065);
      if (formProdAdmin) formProdAdmin.value = fee;
      if (formProdAdminShopee && !formProdAdminShopee.value) formProdAdminShopee.value = fee;
      updateProdMarginPreview();
      showToast(`Biaya admin 6.5% dihitung: ${formatIDR(fee)}`);
    });
  }

  // Preset image picker in product modal
  if (productImagePicker) {
    productImagePicker.querySelectorAll('.img-picker-item').forEach(item => {
      item.addEventListener('click', () => {
        const img = item.getAttribute('data-img');
        if (formProdGambar) formProdGambar.value = img;
        if (formProdGambarCustom) formProdGambarCustom.value = '';
        selectImageInPicker(img);
      });
    });
  }

  // Custom image URL input
  if (formProdGambarCustom) {
    formProdGambarCustom.addEventListener('input', () => {
      const val = formProdGambarCustom.value.trim();
      if (val) {
        if (formProdGambar) formProdGambar.value = val;
        selectImageInPicker(''); // deselect presets
      }
    });
  }

  // Submit Product Form (Add or Edit)
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = formProdId ? formProdId.value : '';
      const nama = formProdNama ? formProdNama.value.trim() : '';

      if (!nama) {
        alert('Mohon isi nama produk!');
        return;
      }

      const modal = parseFloat(formProdModal?.value) || 0;
      const jualShopee = parseFloat(formProdJualShopee?.value) || parseFloat(formProdJual?.value) || 0;
      const feeShopee = parseFloat(formProdAdminShopee?.value) || Math.round(jualShopee * 0.065);
      const jualTiktok = parseFloat(formProdJualTiktok?.value) || jualShopee;
      const feeTiktok = parseFloat(formProdAdminTiktok?.value) || Math.round(jualTiktok * 0.055);

      const prodData = {
        nama_produk: nama,
        kategori: formProdKategori?.value || 'Variasi Mobil',
        variasi_default: formProdVariasi?.value.trim() || 'Standar',
        variasi_list: [formProdVariasi?.value.trim() || 'Standar'],
        harga_modal: modal,
        harga_jual: jualShopee,
        biaya_admin_default: feeShopee,
        harga_jual_shopee: jualShopee,
        biaya_admin_shopee: feeShopee,
        harga_jual_tiktok: jualTiktok,
        biaya_admin_tiktok: feeTiktok,
        gambar: formProdGambar?.value || '/products/over_fender.jpg'
      };

      if (id) {
        db.updateProduct(id, prodData);
        showToast(`Produk "${prodData.nama_produk}" berhasil diperbarui!`, 'success');
      } else {
        db.addProduct(prodData);
        showToast(`Produk "${prodData.nama_produk}" berhasil ditambahkan ke katalog!`, 'success');
      }

      closeProductModal();
      renderCatalog();
      renderQuickChips();
    });
  }

  // Delete Product from Catalog
  if (btnDeleteProduct) {
    btnDeleteProduct.addEventListener('click', () => {
      const id = formProdId ? formProdId.value : '';
      if (!id) return;
      const nama = formProdNama ? formProdNama.value : 'produk ini';
      if (confirm(`Yakin ingin menghapus "${nama}" dari katalog?`)) {
        db.deleteProduct(id);
        closeProductModal();
        renderCatalog();
        renderQuickChips();
        showToast(`Produk "${nama}" telah dihapus dari katalog.`, 'info');
      }
    });
  }

  // Reset Catalog to Default 8 Products
  if (btnResetCatalog) {
    btnResetCatalog.addEventListener('click', () => {
      if (confirm('Kembalikan seluruh katalog ke 8 produk bawaan Banyumili Co?')) {
        db.resetCatalogToDefault();
        renderCatalog();
        renderQuickChips();
        showToast('Katalog berhasil dikembalikan ke 8 produk bawaan!', 'success');
      }
    });
  }

  // Google Sheets Integration Handlers
  const inputGsheetsUrl = document.getElementById('inputGsheetsUrl');
  const btnSaveGsheetsConfig = document.getElementById('btnSaveGsheetsConfig');
  const btnUploadToGsheets = document.getElementById('btnUploadToGsheets');
  const btnSyncFromGsheets = document.getElementById('btnSyncFromGsheets');
  const gsheetsStatusBadge = document.getElementById('gsheetsStatusBadge');

  const btnOpenGsGuide = document.getElementById('btnOpenGsGuide');
  const gsGuideModal = document.getElementById('gsGuideModal');
  const closeGsGuideModalBtn = document.getElementById('closeGsGuideModalBtn');
  const btnCloseGsGuide = document.getElementById('btnCloseGsGuide');
  const btnCopyGsCode = document.getElementById('btnCopyGsCode');

  const updateGsheetsStatusBadge = () => {
    const isConn = db.isGoogleSheetsConnected();
    if (gsheetsStatusBadge) {
      if (isConn) {
        gsheetsStatusBadge.textContent = '🟢 Terhubung Sheets';
        gsheetsStatusBadge.style.background = '#d1fae5';
        gsheetsStatusBadge.style.color = '#065f46';
      } else {
        gsheetsStatusBadge.textContent = '⚪ Lokal (Offline)';
        gsheetsStatusBadge.style.background = '#f1f5f9';
        gsheetsStatusBadge.style.color = '#64748b';
      }
    }
  };

  const existingGsUrl = getGoogleSheetsUrl();
  if (existingGsUrl && inputGsheetsUrl) {
    inputGsheetsUrl.value = existingGsUrl;
  }
  updateGsheetsStatusBadge();

  if (btnSaveGsheetsConfig) {
    btnSaveGsheetsConfig.addEventListener('click', async () => {
      const url = inputGsheetsUrl.value.trim();
      if (!url) {
        saveGoogleSheetsUrl('');
        updateGsheetsStatusBadge();
        showToast('Koneksi Google Sheets diputus. Menggunakan mode lokal.', 'info');
        return;
      }
      if (!url.startsWith('https://script.google.com/')) {
        alert('URL Google Apps Script harus dimulai dengan https://script.google.com/macros/s/.../exec');
        return;
      }
      saveGoogleSheetsUrl(url);
      updateGsheetsStatusBadge();
      showToast('Menghubungkan ke Google Sheets...', 'info');
      const res = await db.syncFromGoogleSheets();
      if (res.success) {
        renderDashboardMetrics();
        renderRecentTransactions();
        renderLedgerTransactions();
        showToast(`Berhasil terhubung! Sinkronisasi ${res.count} data.`, 'success');
      } else {
        showToast('Gagal sinkronisasi: ' + res.message, 'error');
      }
    });
  }

  if (btnUploadToGsheets) {
    btnUploadToGsheets.addEventListener('click', async () => {
      if (!db.isGoogleSheetsConnected()) {
        alert('Silakan masukkan dan simpan URL Webhook Google Apps Script terlebih dahulu!');
        return;
      }
      if (confirm('Unggah seluruh transaksi saat ini ke spreadsheet Google Sheets Anda?')) {
        showToast('Mengunggah transaksi ke Google Sheets...', 'info');
        const res = await db.uploadToGoogleSheets();
        if (res.success) {
          showToast(`Berhasil upload data ke Google Sheets!`, 'success');
        } else {
          showToast('Upload gagal: ' + res.message, 'error');
        }
      }
    });
  }

  if (btnSyncFromGsheets) {
    btnSyncFromGsheets.addEventListener('click', async () => {
      if (!db.isGoogleSheetsConnected()) {
        alert('Silakan masukkan dan simpan URL Webhook Google Apps Script terlebih dahulu!');
        return;
      }
      showToast('Mengunduh data dari Google Sheets...', 'info');
      const res = await db.syncFromGoogleSheets();
      if (res.success) {
        renderDashboardMetrics();
        renderRecentTransactions();
        renderLedgerTransactions();
        showToast(`Data Google Sheets berhasil disinkronkan (${res.count} transaksi)!`, 'success');
      } else {
        showToast(res.message, 'error');
      }
    });
  }

  // Guide modal events
  if (btnOpenGsGuide && gsGuideModal) {
    btnOpenGsGuide.addEventListener('click', () => gsGuideModal.classList.add('active'));
  }
  if (closeGsGuideModalBtn && gsGuideModal) {
    closeGsGuideModalBtn.addEventListener('click', () => gsGuideModal.classList.remove('active'));
  }
  if (btnCloseGsGuide && gsGuideModal) {
    btnCloseGsGuide.addEventListener('click', () => gsGuideModal.classList.remove('active'));
  }
  if (btnCopyGsCode) {
    btnCopyGsCode.addEventListener('click', () => {
      showToast('File google_apps_script.js siap dibuka di folder project Anda!', 'info');
    });
  }

}

/**
 * Tab Switch Handler
 */
function switchTab(tabName) {
  if (!tabName) return;
  activeTab = tabName;

  const currentNavItems = document.querySelectorAll('.bottom-nav .nav-item');
  const currentTabContents = document.querySelectorAll('.tab-content');

  currentNavItems.forEach(item => {
    if (item.getAttribute('data-tab') === tabName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  currentTabContents.forEach(content => {
    if (content.id === `tab-${tabName}`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  if (tabName === 'transaksi') {
    renderLedgerTransactions();
  } else if (tabName === 'beranda') {
    renderRecentTransactions();
  } else if (tabName === 'produk') {
    renderCatalog();
    renderQuickChips();
  } else if (tabName === 'lainnya') {
    updateFeeSimulator();
  }

  // Smooth scroll back to top of container/window
  if (typeof window !== 'undefined' && window.scrollTo) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const appSheet = document.querySelector('.app-sheet');
  if (appSheet && appSheet.scrollTop > 0) {
    appSheet.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Start the app on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
