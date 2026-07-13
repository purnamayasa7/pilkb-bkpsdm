<link rel="stylesheet" href="{{ asset('css/navbar.css') }}">

<nav class="topnav navbar navbar-expand shadow justify-content-between justify-content-sm-start navbar-light bg-white"
    id="sidenavAccordion">
    <!-- Sidenav Toggle Button-->
    <button class="btn btn-icon btn-transparent-dark order-1 order-lg-0 me-2 ms-lg-2 me-lg-0" id="sidebarToggle"><i
            data-feather="menu"></i></button>
    <!-- Navbar Brand-->
    <!-- * * Tip * * You can use text or an image for your navbar brand.-->
    <!-- * * * * * * When using an image, we recommend the SVG format.-->
    <!-- * * * * * * Dimensions: Maximum height: 32px, maximum width: 240px-->
    <a class="navbar-brand pe-3 ps-4 ps-lg-2 d-flex align-items-center" href="{{ route('dashboard') }}">

        <div class="p-1 bg-white rounded-circle shadow-sm me-2">
            <img src="{{ asset('images/KabBuleleng.png') }}" alt="logo"
                style="height: 32px; width: auto; object-fit: contain;">
        </div>

        <!-- <img src="{{ asset('images/NEW_PILKB.png') }}"
            alt="PILKB"
            style="height: 28px; width: auto; object-fit: contain;"> -->
        <span class="text-primary">
            PILKB
        </span>
    </a>
    <!-- Navbar Search Input-->
    <!-- * * Note: * * Visible only on and above the lg breakpoint-->
    <form class="form-inline me-auto d-none d-lg-block me-3 position-relative">

        <div class="input-group input-group-joined input-group-solid">

            <input
                id="ticketSearch"
                class="form-control pe-0"
                type="search"
                autocomplete="off"
                placeholder="Cari No Tiket atau NIP"
                aria-label="Cari Tiket">

            <div class="input-group-text">
                <i data-feather="search"></i>
            </div>

        </div>

        <div id="ticketSearchDropdown"
            class="ticket-search-dropdown d-none">

        </div>

    </form>
    <!-- Navbar Items-->
    <ul class="navbar-nav align-items-center ms-auto">
        <!-- Documentation Dropdown-->
        <li class="nav-item dropdown no-caret d-none d-md-block me-3">
            <a class="nav-link dropdown-toggle" id="navbarDropdownDocs" href="javascript:void(0);" role="button"
                data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <div class="fw-500">Dokumentasi</div>
                <i class="fas fa-chevron-right dropdown-arrow"></i>
            </a>
            <div class="dropdown-menu dropdown-menu-end py-0 me-sm-n15 me-lg-0 o-hidden animated--fade-in-up"
                aria-labelledby="navbarDropdownDocs">
                <a class="dropdown-item py-3" href="https://docs.startbootstrap.com/sb-admin-pro" target="_blank">
                    <div class="icon-stack bg-primary-soft text-primary me-4"><i data-feather="book"></i></div>
                    <div>
                        <div class="small text-gray-500">Dokumentasi</div>
                        Admin OPD
                    </div>
                </a>
                <div class="dropdown-divider m-0"></div>
                <a class="dropdown-item py-3" href="https://docs.startbootstrap.com/sb-admin-pro/components"
                    target="_blank">
                    <div class="icon-stack bg-primary-soft text-primary me-4"><i data-feather="book"></i></div>
                    <div>
                        <div class="small text-gray-500">Dokumentasi</div>
                        Admin Bidang
                    </div>
                </a>
                <div class="dropdown-divider m-0"></div>
                <a class="dropdown-item py-3" href="https://docs.startbootstrap.com/sb-admin-pro/changelog"
                    target="_blank">
                    <div class="icon-stack bg-primary-soft text-primary me-4"><i data-feather="file-text"></i></div>
                    <div>
                        <div class="small text-gray-500">Changelog</div>
                        Updates and changes
                    </div>
                </a>
            </div>
        </li>
        <!-- Navbar Search Dropdown-->
        <!-- * * Note: * * Visible only below the lg breakpoint-->
        <li class="nav-item dropdown no-caret me-3 d-lg-none">
            <a class="btn btn-icon btn-transparent-dark dropdown-toggle" id="searchDropdown" href="#"
                role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i
                    data-feather="search"></i></a>
            <!-- Dropdown - Search-->
            <div class="dropdown-menu dropdown-menu-end p-3 shadow animated--fade-in-up"
                aria-labelledby="searchDropdown">
                <form class="form-inline me-auto w-100">
                    <div class="input-group input-group-joined input-group-solid">
                        <input class="form-control pe-0" type="text" placeholder="Search for..." aria-label="Search"
                            aria-describedby="basic-addon2" />
                        <div class="input-group-text"><i data-feather="search"></i></div>
                    </div>
                </form>
            </div>
        </li>
        <!-- Alerts Dropdown-->
        <li class="nav-item dropdown no-caret d-none d-sm-block me-3 dropdown-notifications">

            <a class="btn btn-icon btn-transparent-dark dropdown-toggle position-relative"
                id="navbarDropdownAlerts"
                href="#"
                role="button"
                data-bs-toggle="dropdown">

                <i data-feather="bell"></i>

                <!-- @if($unreadCount > 0)
                <span class="badge bg-danger notification-badge">
                    {{ $unreadCount > 99 ? '99+' : $unreadCount }}
                </span>
                @endif -->

                @if($unreadCount > 0)
                <span class="notification-dot"></span>
                @endif

            </a>

            <div class="dropdown-menu dropdown-menu-end border-0 shadow animated--fade-in-up">

                <h6 class="dropdown-header dropdown-notifications-header">
                    <i class="me-2" data-feather="bell"></i>
                    Notifikasi
                </h6>

                @forelse($notifications as $notification)

                @php

                $notificationTypes = [
                'usulan_baru' => [
                'class' => 'bg-success',
                'icon' => 'file-text'
                ],

                'berkas_diterima' => [
                'class' => 'bg-primary',
                'icon' => 'check'
                ],

                'berkas_tidak_lengkap' => [
                'class' => 'bg-warning',
                'icon' => 'alert-triangle'
                ],

                'review_perbaikan' => [
                'class' => 'bg-info',
                'icon' => 'edit'
                ],

                'status_update' => [
                'class' => 'bg-info',
                'icon' => 'refresh-cw'
                ],

                'pengambilan' => [
                'class' => 'bg-dark',
                'icon' => 'archive'
                ],

                'pindah_layanan' => [
                'class' => 'bg-secondary',
                'icon' => 'shuffle'
                ],

                'selesai' => [
                'class' => 'bg-success',
                'icon' => 'check'
                ]
                ];

                $type = $notification->data['type'] ?? 'default';

                $bgClass = $notificationTypes[$type]['class'] ?? 'bg-secondary';
                $icon = $notificationTypes[$type]['icon'] ?? 'bell';

                @endphp
                <a class="dropdown-item dropdown-notifications-item"
                    href="{{ route('notifications.read', $notification->id) }}">

                    <div class="dropdown-notifications-item-icon {{ $bgClass }}">
                        <i data-feather="{{ $icon }}"></i>
                    </div>

                    <div class="dropdown-notifications-item-content">
                        <div class="dropdown-notifications-item-content-details d-flex align-items-center"
                            style="font-size: 0.72rem;">

                            {{ $notification->created_at->diffForHumans() }}

                            @if(is_null($notification->read_at))
                            <span class="ms-2 rounded-circle bg-danger"
                                style="width:8px;height:8px;display:inline-block;">
                            </span>
                            @endif

                        </div>

                        <div class="dropdown-notifications-item-content-text"
                            style="font-size: 0.80rem; line-height: 1.25;">
                            <strong
                                class="{{ is_null($notification->read_at) ? 'fw-bold' : 'fw-normal' }}"
                                style="font-size: 0.90rem;">
                                {{ $notification->data['title'] ?? '-' }}
                            </strong>
                            <br>
                            {{ $notification->data['message'] ?? '-' }}
                        </div>
                    </div>
                </a>

                @empty

                <div class="dropdown-item text-center text-muted py-3">
                    Tidak ada notifikasi
                </div>

                @endforelse

                <a class="dropdown-item dropdown-notifications-footer"
                    href="{{ route('notifications.index') }}">
                    Lihat Semua
                </a>
            </div>
        </li>
        <!-- Messages Dropdown-->
        <!-- <li class="nav-item dropdown no-caret d-none d-sm-block me-3 dropdown-notifications">
            <a class="btn btn-icon btn-transparent-dark dropdown-toggle" id="navbarDropdownMessages"
                href="javascript:void(0);" role="button" data-bs-toggle="dropdown" aria-haspopup="true"
                aria-expanded="false"><i data-feather="mail"></i></a>
            <div class="dropdown-menu dropdown-menu-end border-0 shadow animated--fade-in-up"
                aria-labelledby="navbarDropdownMessages">
                <h6 class="dropdown-header dropdown-notifications-header">
                    <i class="me-2" data-feather="mail"></i>
                    Message Center
                </h6>

                <a class="dropdown-item dropdown-notifications-item" href="#!">
                    <img class="dropdown-notifications-item-img"
                        src="{{ asset('templatepro/assets/img/illustrations/profiles/profile-2.png') }}" />
                    <div class="dropdown-notifications-item-content">
                        <div class="dropdown-notifications-item-content-text">Lorem ipsum dolor sit amet,
                            consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                            aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                            aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                            velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
                        <div class="dropdown-notifications-item-content-details">Thomas Wilcox · 58m</div>
                    </div>
                </a>

                <a class="dropdown-item dropdown-notifications-item" href="#!">
                    <img class="dropdown-notifications-item-img"
                        src="{{ asset('templatepro/assets/img/illustrations/profiles/profile-3.png') }}" />
                    <div class="dropdown-notifications-item-content">
                        <div class="dropdown-notifications-item-content-text">Lorem ipsum dolor sit amet,
                            consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                            aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                            aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                            velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
                        <div class="dropdown-notifications-item-content-details">Emily Fowler · 2d</div>
                    </div>
                </a>

                <a class="dropdown-item dropdown-notifications-item" href="#!">
                    <img class="dropdown-notifications-item-img"
                        src="{{ asset('templatepro/assets/img/illustrations/profiles/profile-4.png') }}" />
                    <div class="dropdown-notifications-item-content">
                        <div class="dropdown-notifications-item-content-text">Lorem ipsum dolor sit amet,
                            consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                            aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                            aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                            velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
                        <div class="dropdown-notifications-item-content-details">Marshall Rosencrantz · 3d</div>
                    </div>
                </a>

                <a class="dropdown-item dropdown-notifications-item" href="#!">
                    <img class="dropdown-notifications-item-img"
                        src="{{ asset('templatepro/assets/img/illustrations/profiles/profile-5.png') }}" />
                    <div class="dropdown-notifications-item-content">
                        <div class="dropdown-notifications-item-content-text">Lorem ipsum dolor sit amet,
                            consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                            aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                            aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                            velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
                        <div class="dropdown-notifications-item-content-details">Colby Newton · 3d</div>
                    </div>
                </a>

                <a class="dropdown-item dropdown-notifications-footer" href="#!">Read All Messages</a>
            </div>
        </li> -->
        <!-- User Dropdown-->
        @auth
        @php
        $namaParts = explode(' ', trim(auth()->user()->nama));

        $first = strtoupper(substr($namaParts[0], 0, 1));

        if (count($namaParts) > 1) {
        $last = strtoupper(substr(end($namaParts), 0, 1));
        $inisial = $first . $last;
        } else {
        $inisial = $first;
        }

        $colors = [
        'bg-primary',
        'bg-success',
        'bg-danger',
        'bg-warning',
        'bg-info',
        'bg-dark',
        ];

        $randomColor = $colors[crc32(auth()->user()->nama) % count($colors)];

        @endphp
        <li class="nav-item dropdown no-caret dropdown-user me-3 me-lg-4">
            <a class="btn btn-icon btn-transparent-dark dropdown-toggle p-0"
                id="navbarDropdownUserImage"
                href="javascript:void(0);"
                role="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false">

                <div class="rounded-circle {{ $randomColor }} d-flex align-items-center justify-content-center text-white fw-bold"
                    style="width: 40px; height: 40px; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); flex-shrink: 0;">
                    {{ $inisial }}
                </div>

            </a>
            <div class="dropdown-menu dropdown-menu-end border-0 shadow animated--fade-in-up"
                aria-labelledby="navbarDropdownUserImage">
                <h6 class="dropdown-header d-flex align-items-center">
                    <div class="rounded-circle {{ $randomColor }} me-3 d-flex align-items-center justify-content-center text-white fw-bold"
                        style="width: 40px; height: 40px; font-size: 14px; flex-shrink: 0;">
                        {{ $inisial }}
                    </div>
                    <div class="dropdown-user-details">
                        <div class="dropdown-user-details-name">{{ auth()->user()->nama }}</div>
                        <div class="dropdown-user-details-email">{{ auth()->user()->username }}</div>
                    </div>
                </h6>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="{{ route('profile') }}">
                    <div class="dropdown-item-icon"><i data-feather="settings"></i></div>
                    Profil
                </a>
                <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#logoutModal">
                    <div class="dropdown-item-icon"><i data-feather="log-out"></i></div>
                    Logout
                </a>

                {{-- <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#logoutModal">
                    <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                    Logout
                </a> --}}
            </div>
        </li>
        @endauth
    </ul>
</nav>

<!-- Modal Detail Tiket -->
<div class="modal fade" id="ticketDetailModal" tabindex="-1">

    <div class="modal-dialog modal-dialog-centered modal-lg">

        <div class="modal-content">

            <div class="modal-header">

                <h5 class="modal-title">
                    Detail Tiket
                </h5>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal">
                </button>

            </div>

            <div class="modal-body">

                <!-- Ringkasan -->
                <div class="border rounded p-3 mb-4">

                    <div class="text-muted small">
                        Nomor Tiket
                    </div>

                    <div class="d-flex align-items-center mb-3">

                        <h4
                            class="fw-bold text-primary mb-0 me-2"
                            id="detailNavNoTiket">
                            -
                        </h4>

                        <button
                            type="button"
                            id="btnCopyTicket"
                            class="btn btn-outline-primary btn-sm"
                            data-bs-toggle="tooltip"
                            title="Salin Nomor Tiket">

                            <i data-feather="copy"></i>

                        </button>

                    </div>

                    <div class="text-muted small">
                        Status Terakhir
                    </div>

                    <div class="fw-semibold"
                        id="detailNavStatus">
                        -
                    </div>

                </div>

                <!-- Informasi -->
                <div class="row gy-3">

                    <div class="col-md-6">

                        <div class="text-muted small">
                            NIP
                        </div>

                        <div class="fw-semibold"
                            id="detailNavNip">
                            -
                        </div>

                    </div>

                    <div class="col-md-6">

                        <div class="text-muted small">
                            Nama Pengusul
                        </div>

                        <div class="fw-semibold"
                            id="detailNavNama">
                            -
                        </div>

                    </div>

                    <div class="col-md-6">

                        <div class="text-muted small">
                            Tanggal Pengajuan
                        </div>

                        <div id="detailNavTanggal">
                            -
                        </div>

                    </div>

                    <div class="col-md-6">

                        <div class="text-muted small">
                            Bidang
                        </div>

                        <div id="detailNavBidang">
                            -
                        </div>

                    </div>

                    <div class="col-12">

                        <div class="text-muted small">
                            Layanan
                        </div>

                        <div class="fw-semibold"
                            id="detailNavLayanan">
                            -
                        </div>

                    </div>

                </div>

            </div>

            <div class="modal-footer">

                <a
                    id="btnPrintTicket"
                    href="#"
                    target="_blank"
                    class="btn btn-outline-warning">

                    <i data-feather="printer" class="me-1"></i>
                    Cetak

                </a>

                <button
                    id="btnReviewTicket"
                    class="btn btn-primary">

                    <i data-feather="arrow-right" class="me-1"></i>
                    Review

                </button>

            </div>

        </div>

    </div>

</div>

<script src="{{ asset('js/navbar.js') }}"></script>