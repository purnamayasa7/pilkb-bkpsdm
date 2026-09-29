{{-- Cookie Consent Banner & Preferences Modal untuk Halaman Login PILKB --}}
<style>
    /* Styling Cookie Consent Banner - Diposisikan di Paling Kiri Bawah */
    #cookieConsentBanner {
        position: fixed;
        bottom: 24px;
        left: 24px;
        width: 480px;
        max-width: calc(100vw - 48px);
        margin: 0;
        z-index: 1045;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.05);
        padding: 1.25rem 1.35rem 1.15rem 1.35rem;
        font-family: 'Plus Jakarta Sans', sans-serif;
        transform: translateY(120%) scale(0.96);
        opacity: 0;
        visibility: hidden;
        transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease, visibility 0.55s;
    }

    #cookieConsentBanner.show {
        transform: translateY(0) scale(1);
        opacity: 1;
        visibility: visible;
    }

    .cookie-banner-text {
        font-size: 0.815rem;
        line-height: 1.55;
        color: #1f2937;
        margin-bottom: 1.1rem;
        text-align: left;
    }

    .cookie-banner-text a {
        color: #1f5b99;
        text-decoration: underline;
        font-weight: 600;
        cursor: pointer;
    }

    .cookie-banner-text a:hover {
        color: #174d86;
    }

    /* Tiga Tombol Aksi Sejajar */
    .cookie-banner-actions {
        display: flex;
        gap: 0.65rem;
        align-items: center;
        justify-content: space-between;
    }

    /* Tombol Preferensi (Outline Style) */
    .cookie-btn-pref {
        flex: 1;
        background-color: #ffffff;
        color: #1e293b;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 0.45rem 0.5rem;
        font-size: 0.825rem;
        font-weight: 600;
        text-align: center;
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .cookie-btn-pref:hover {
        background-color: #f8fafc;
        border-color: #1f5b99;
        color: #1f5b99;
    }

    /* Tombol Tolak (Secondary / Neutral Style) */
    .cookie-btn-secondary {
        flex: 1;
        background-color: #f1f5f9;
        color: #334155;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 0.45rem 0.5rem;
        font-size: 0.825rem;
        font-weight: 600;
        text-align: center;
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .cookie-btn-secondary:hover {
        background-color: #e2e8f0;
        border-color: #94a3b8;
        color: #0f172a;
    }

    /* Tombol Terima (Primary Blue PILKB) */
    .cookie-btn-primary {
        flex: 1;
        background: linear-gradient(135deg, #1f5b99 0%, #174d86 100%);
        color: #ffffff;
        border: 1px solid #174d86;
        border-radius: 6px;
        padding: 0.45rem 0.5rem;
        font-size: 0.825rem;
        font-weight: 600;
        text-align: center;
        transition: all 0.2s ease;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(31, 91, 153, 0.22);
    }

    .cookie-btn-primary:hover {
        background: linear-gradient(135deg, #256bb3 0%, #1a5696 100%);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(31, 91, 153, 0.32);
    }

    /* Modal Styling */
    .cookie-category-item {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 0.9rem;
        margin-bottom: 0.75rem;
    }

    .cookie-category-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.3rem;
    }

    .cookie-category-name {
        font-size: 0.875rem;
        font-weight: 700;
        color: #111827;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .cookie-category-desc {
        font-size: 0.79rem;
        color: #4b5563;
        line-height: 1.45;
        margin-bottom: 0;
    }

    @media (max-width: 576px) {
        #cookieConsentBanner {
            bottom: 12px;
            left: 12px;
            right: 12px;
            width: auto;
            max-width: none;
            padding: 1rem;
        }
        .cookie-banner-actions {
            flex-direction: row;
            gap: 0.4rem;
        }
        .cookie-btn-pref, .cookie-btn-amber {
            padding: 0.4rem 0.25rem;
            font-size: 0.775rem;
        }
    }
</style>

<!-- Floating Cookie Consent Banner (Posisi Paling Kiri Bawah) -->
<div id="cookieConsentBanner" role="region" aria-label="Persetujuan Cookie">
    <div class="cookie-banner-text">
        Kami menggunakan cookie esensial agar situs web kami dapat berfungsi dengan baik. Dengan persetujuan Anda, kami juga dapat menggunakan cookie non-esensial untuk meningkatkan pengalaman pengguna dan menganalisis lalu lintas situs web. Dengan mengklik <strong>“Terima”</strong>, Anda menyetujui penggunaan cookie kami sesuai dengan kebijakan layanan kami. Anda dapat mengubah pengaturan cookie kapan saja dengan mengklik <a href="javascript:void(0)" id="linkOpenCookieModal">“Preferensi”</a>.
    </div>
    <div class="cookie-banner-actions">
        <button type="button" class="cookie-btn-pref" id="btnOpenCookieModal">
            Preferensi
        </button>
        <button type="button" class="cookie-btn-secondary" id="btnRejectOptionalCookies">
            Tolak
        </button>
        <button type="button" class="cookie-btn-primary" id="btnAcceptAllCookies">
            Terima
        </button>
    </div>
</div>

<!-- Modal Preferensi Cookie Pengguna -->
<div class="modal fade" id="modalCookiePreferences" tabindex="-1" aria-labelledby="modalCookiePreferencesLabel" aria-hidden="true" style="font-family: 'Plus Jakarta Sans', sans-serif;">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-3 border-0 shadow-lg">
            <div class="modal-header border-bottom px-4 py-3 bg-light">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-sliders text-dark fs-5"></i>
                    <div>
                        <h5 class="modal-title fw-bold text-dark fs-6 mb-0" id="modalCookiePreferencesLabel">
                            Pusat Pengaturan Cookie &amp; Preferensi
                        </h5>
                        <small class="text-muted" style="font-size: 11.5px;">PILKB - BKPSDM Kabupaten Buleleng</small>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>

            <div class="modal-body px-4 py-3">
                <p class="text-muted small mb-3">
                    Kami menghargai privasi Anda. Cookie esensial diperlukan untuk menjaga sistem dapat berjalan dan aman. Anda bebas mengaktifkan atau menonaktifkan cookie non-esensial sesuai kebutuhan Anda.
                </p>

                <!-- Kategori 1: Cookie Esensial (Mutlak & Wajib Aktif) -->
                <div class="cookie-category-item">
                    <div class="cookie-category-header">
                        <span class="cookie-category-name">
                            <i class="bi bi-shield-lock-fill text-primary"></i>
                            Cookie Esensial (Wajib)
                        </span>
                        <div class="form-check form-switch mb-0">
                            <input class="form-check-input" type="checkbox" role="switch" checked disabled id="cookiePrefEssential">
                            <label class="form-check-label ms-1 badge bg-secondary text-white" for="cookiePrefEssential" style="font-size: 10.5px;">
                                Selalu Aktif
                            </label>
                        </div>
                    </div>
                    <p class="cookie-category-desc">
                        Cookie yang mutlak dibutuhkan agar situs web dapat beroperasi secara teknis, termasuk pengelolaan autentikasi login dan verifikasi token keamanan anti-pemalsuan formulir.
                    </p>
                </div>

                <!-- Kategori 2: Cookie Preferensi Antarmuka -->
                <div class="cookie-category-item">
                    <div class="cookie-category-header">
                        <span class="cookie-category-name">
                            <i class="bi bi-palette-fill text-warning"></i>
                            Cookie Preferensi &amp; Personalisasi
                        </span>
                        <div class="form-check form-switch mb-0">
                            <input class="form-check-input" type="checkbox" role="switch" id="cookiePrefPreferences">
                            <label class="form-check-label ms-1 small text-muted" for="cookiePrefPreferences">Aktifkan</label>
                        </div>
                    </div>
                    <p class="cookie-category-desc">
                        Memungkinkan situs web mengingat preferensi visual dan tata letak pilihan Anda (seperti mode tampilan gelap/terang dan preferensi antarmuka pengguna).
                    </p>
                </div>

                <!-- Kategori 3: Cookie Analitik & Lalu Lintas -->
                <div class="cookie-category-item">
                    <div class="cookie-category-header">
                        <span class="cookie-category-name">
                            <i class="bi bi-graph-up-arrow text-success"></i>
                            Cookie Analitik &amp; Performa
                        </span>
                        <div class="form-check form-switch mb-0">
                            <input class="form-check-input" type="checkbox" role="switch" id="cookiePrefAnalytics">
                            <label class="form-check-label ms-1 small text-muted" for="cookiePrefAnalytics">Aktifkan</label>
                        </div>
                    </div>
                    <p class="cookie-category-desc">
                        Membantu tim teknis menganalisis statistik kunjungan dan stabilitas halaman secara anonim untuk evaluasi dan peningkatan kualitas layanan publik.
                    </p>
                </div>

                <div class="p-2 rounded bg-light text-muted small d-flex align-items-center gap-2 border">
                    <i class="bi bi-info-circle flex-shrink-0 text-primary"></i>
                    <span style="font-size: 11px;">Pilihan Anda disimpan di browser perangkat ini dan dapat diperbarui kembali kapan saja melalui menu di footer.</span>
                </div>
            </div>

            <div class="modal-footer border-top px-4 py-3 d-flex justify-content-between align-items-center">
                <button type="button" class="btn btn-outline-secondary btn-sm px-3" id="btnModalRejectAll">
                    Tolak Non-Esensial
                </button>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-light btn-sm border px-3" data-bs-dismiss="modal">
                        Batal
                    </button>
                    <button type="button" class="cookie-btn-primary btn-sm px-4 fw-semibold border-0" id="btnModalSavePreferences">
                        Simpan Preferensi
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    (function () {
        const STORAGE_KEY = 'pilkb_cookie_consent';
        const banner = document.getElementById('cookieConsentBanner');
        const modalEl = document.getElementById('modalCookiePreferences');
        let bsModal = null;

        function getStoredConsent() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                return null;
            }
        }

        function saveConsent(preferences, analytics, status) {
            const consentData = {
                necessary: true,
                preferences: !!preferences,
                analytics: !!analytics,
                status: status || 'customized',
                updated_at: new Date().toISOString()
            };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
            } catch (e) {}

            // Sembunyikan banner
            if (banner) {
                banner.classList.remove('show');
            }

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
                detail: consentData
            }));

            // Sync form switches
            updateModalSwitches(consentData);
        }

        function updateModalSwitches(data) {
            const prefInput = document.getElementById('cookiePrefPreferences');
            const analInput = document.getElementById('cookiePrefAnalytics');
            if (prefInput) prefInput.checked = !!(data && data.preferences);
            if (analInput) analInput.checked = !!(data && data.analytics);
        }

        function openModal() {
            const current = getStoredConsent() || { preferences: false, analytics: false };
            updateModalSwitches(current);
            if (!bsModal && window.bootstrap && window.bootstrap.Modal) {
                bsModal = new bootstrap.Modal(modalEl);
            }
            if (bsModal) {
                bsModal.show();
            }
        }

        function closeModal() {
            if (bsModal) {
                bsModal.hide();
            }
        }

        // Tampilkan Banner HANYA SETELAH SEMUA KOMPONEN HALAMAN LOGIN SELESAI DIMUAT
        function initBannerAnimation() {
            const existingConsent = getStoredConsent();
            if (!existingConsent && banner) {
                // Tunggu sejenak setelah window.load agar transisi halaman login selesai stabil
                setTimeout(function () {
                    banner.classList.add('show');
                }, 600);
            } else if (existingConsent) {
                updateModalSwitches(existingConsent);
            }
        }

        if (document.readyState === 'complete') {
            initBannerAnimation();
        } else {
            window.addEventListener('load', initBannerAnimation);
        }

        document.addEventListener('DOMContentLoaded', function () {
            // Tombol "Terima" di Banner
            const btnAcceptAll = document.getElementById('btnAcceptAllCookies');
            if (btnAcceptAll) {
                btnAcceptAll.addEventListener('click', function () {
                    saveConsent(true, true, 'accepted_all');
                });
            }

            // Tombol "Tolak" di Banner (Tolak Non-Esensial)
            const btnRejectOptional = document.getElementById('btnRejectOptionalCookies');
            if (btnRejectOptional) {
                btnRejectOptional.addEventListener('click', function () {
                    saveConsent(false, false, 'rejected_all');
                });
            }

            // Tombol "Preferensi" di Banner
            const btnOpenModal = document.getElementById('btnOpenCookieModal');
            if (btnOpenModal) {
                btnOpenModal.addEventListener('click', function () {
                    openModal();
                });
            }

            // Tautan "Preferensi" pada teks banner
            const linkOpenModal = document.getElementById('linkOpenCookieModal');
            if (linkOpenModal) {
                linkOpenModal.addEventListener('click', function (e) {
                    e.preventDefault();
                    openModal();
                });
            }

            // Tombol "Simpan Preferensi" di Modal
            const btnSaveModal = document.getElementById('btnModalSavePreferences');
            if (btnSaveModal) {
                btnSaveModal.addEventListener('click', function () {
                    const prefVal = document.getElementById('cookiePrefPreferences')?.checked || false;
                    const analVal = document.getElementById('cookiePrefAnalytics')?.checked || false;
                    saveConsent(prefVal, analVal, 'customized');
                    closeModal();
                });
            }

            // Tombol "Tolak Non-Esensial" di Modal
            const btnRejectModal = document.getElementById('btnModalRejectAll');
            if (btnRejectModal) {
                btnRejectModal.addEventListener('click', function () {
                    saveConsent(false, false, 'rejected_all');
                    closeModal();
                });
            }

            // Listener tombol footer untuk membuka kembali modal kapan saja
            const btnFooterOpen = document.getElementById('btnOpenCookieSettings');
            if (btnFooterOpen) {
                btnFooterOpen.addEventListener('click', function (e) {
                    e.preventDefault();
                    openModal();
                });
            }
        });

        // Global helper
        window.pilkbCookie = {
            getConsent: getStoredConsent,
            openPreferences: openModal,
            saveConsent: saveConsent
        };
    })();
</script>
