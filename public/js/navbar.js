document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById('ticketSearch');
    const dropdown = document.getElementById('ticketSearchDropdown');

    let timer = null;
    let ticketCache = {};

    if (!searchInput || !dropdown) {
        return;
    }

    async function searchTicket(keyword) {

        if (keyword.length < 3) {
            dropdown.innerHTML = '';
            dropdown.classList.add('d-none');
            return;
        }

        try {
            dropdown.innerHTML = `
    <div class="ticket-search-item text-center text-muted">

        <div class="spinner-border spinner-border-sm me-2"></div>

        Mencari tiket...

    </div>
`;

            dropdown.classList.remove('d-none');

            const response = await fetch(
                `/search-ticket?q=${encodeURIComponent(keyword)}`
            );
            const data = await response.json();
            renderDropdown(data);
        } catch (error) {

            console.error(error);

            dropdown.innerHTML = `
        <div class="ticket-search-item text-danger text-center">
            Terjadi kesalahan saat mengambil data.
        </div>
    `;

            dropdown.classList.remove('d-none');

        }
    }

    function renderDropdown(data) {

        dropdown.innerHTML = '';

        if (data.length === 0) {

            dropdown.innerHTML = `
            <div class="ticket-search-item text-center text-muted">
                Data tiket tidak ditemukan
            </div>
        `;

            dropdown.classList.remove('d-none');
            return;
        }

        data.forEach(item => {

            dropdown.innerHTML += `
            <div class="ticket-search-item"
                 data-ticket="${item.no_tiket}">

                <div class="ticket-search-number">
                    ${item.no_tiket}
                </div>

                <div class="ticket-search-service">
                    ${item.layanan ?? '-'}
                </div>

                <div class="ticket-search-status">
                    ${item.status ?? '-'}
                </div>

            </div>
        `;

        });

        dropdown.classList.remove('d-none');

        dropdown.querySelectorAll('.ticket-search-item')
            .forEach(item => {

                item.addEventListener('click', function () {

                    loadTicketDetail(
                        this.dataset.ticket
                    );

                });

            });

    }

    searchInput.addEventListener('input', function () {

        clearTimeout(timer);

        timer = setTimeout(() => {

            searchTicket(this.value.trim());

        }, 300);

    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.form-inline')) {

            dropdown.classList.add('d-none');

        }
    });

    dropdown.addEventListener('click', function (e) {

        const item = e.target.closest('.ticket-search-item');

        if (!item || !item.dataset.ticket) {
            return;
        }

        const noTiket = item.dataset.ticket;

        searchInput.value = noTiket;

        dropdown.classList.add('d-none');

        console.log(noTiket);

    });

    async function loadTicketDetail(noTiket) {

        // Jika sudah pernah dibuka, gunakan cache
        if (ticketCache[noTiket]) {

            showTicketModal(ticketCache[noTiket]);

            return;
        }

        try {

            const response = await fetch(
                `/ticket/detail/${noTiket}`
            );

            if (!response.ok) {
                throw new Error('Gagal mengambil detail tiket');
            }

            const data = await response.json();

            const btnPrint = document.getElementById('btnPrintTicket');

            btnPrint.href = data.print_url;

            document.getElementById('detailNavNoTiket').textContent =
                data.no_tiket ?? '-';

            document.getElementById('detailNavNip').textContent =
                data.nip ?? '-';

            document.getElementById('detailNavNama').textContent =
                data.nama ?? '-';

            document.getElementById('detailNavTanggal').textContent =
                data.tanggal ?? '-';

            document.getElementById('detailNavLayanan').textContent =
                data.layanan ?? '-';

            document.getElementById('detailNavBidang').textContent =
                data.bidang ?? '-';

            document.getElementById('detailNavStatus').textContent =
                data.status ?? '-';

            const btnReview = document.getElementById('btnReviewTicket');

            if (data.can_review) {

                btnReview.classList.remove('d-none');

                btnReview.onclick = function () {
                    window.location.href = data.review_url;
                };

            } else {

                btnReview.classList.add('d-none');

                btnReview.onclick = null;
            }

            const modal = new bootstrap.Modal(
                document.getElementById('ticketDetailModal')
            );

            modal.show();

        } catch (error) {

            console.error(error);

        }

    }

    $(document).on('click', '#btnCopyTicket', async function () {

        const nomor = $('#detailNavNoTiket').text().trim();

        if (!nomor || nomor === '-') {
            return;
        }

        try {

            await navigator.clipboard.writeText(nomor);

            const btn = $(this);

            btn.html('<i data-feather="check"></i>');

            feather.replace();

            setTimeout(() => {

                btn.html('<i data-feather="copy"></i>');

                feather.replace();

            }, 1500);

        } catch (e) {

            alert('Gagal menyalin nomor tiket.');

        }

    });

});

