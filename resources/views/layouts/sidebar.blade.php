@php
    $menus = config('menu');
    $roleId = auth()->user()->role_id ?? null;
    $menuItems = $menus[$roleId] ?? [];
@endphp

<div id="layoutSidenav_nav">
    <nav class="sidenav shadow-right sidenav-light">
        <div class="sidenav-menu">
            <div class="nav accordion" id="accordionSidenav">

                @foreach ($menuItems as $menu)
                    {{-- ITEM --}}
                    @if (($menu['type'] ?? '') === 'item')
                        @php
                            $isActive = request()->is($menu['path']) || request()->get('menu') === $menu['active_key'];
                        @endphp

                        <a class="nav-link {{ $isActive ? 'active' : '' }}"
                            href="{{ url($menu['path']) }}?menu={{ $menu['active_key'] }}">

                            <div class="nav-link-icon">
                                <i data-feather="{{ $menu['icon'] }}"></i>
                            </div>
                            {{ $menu['title'] }}
                        </a>

                        {{-- DIVIDER --}}
                    @elseif (($menu['type'] ?? '') === 'divider')
                        <hr class="sidenav-divider">

                        {{-- HEADING --}}
                    @elseif (($menu['type'] ?? '') === 'heading')
                        <div class="sidenav-menu-heading">
                            {{ $menu['title'] }}
                        </div>

                        {{-- COLLAPSE --}}
                    @elseif (($menu['type'] ?? '') === 'collapse')
                        @php
                            $isParentActive =
                                request()->get('menu') === $menu['active_key'] ||
                                collect($menu['children'] ?? [])->contains(function ($child) {
                                    return request()->is($child['path']) ||
                                        request()->get('menu') === $child['active_key'];
                                });
                        @endphp

                        <a class="nav-link {{ $isParentActive ? '' : 'collapsed' }}" href="javascript:void(0);"
                            data-bs-toggle="collapse" data-bs-target="#{{ $menu['target'] }}">

                            <div class="nav-link-icon">
                                <i data-feather="{{ $menu['icon'] }}"></i>
                            </div>

                            {{ $menu['title'] }}

                            <div class="sidenav-collapse-arrow">
                                <i class="fas fa-angle-down"></i>
                            </div>
                        </a>

                        <div class="collapse {{ $isParentActive ? 'show' : '' }}" id="{{ $menu['target'] }}"
                            data-bs-parent="#accordionSidenav">

                            <nav class="sidenav-menu-nested nav">
                                @foreach ($menu['children'] ?? [] as $child)
                                    <a class="nav-link {{ request()->is($child['path']) ? 'active' : '' }}"
                                        href="{{ url($child['path']) }}?menu={{ $child['active_key'] }}">
                                        {{ $child['title'] }}
                                    </a>
                                @endforeach
                            </nav>
                        </div>
                    @endif
                @endforeach

            </div>
        </div>

        {{-- FOOTER --}}
        <div class="sidenav-footer">
            <div class="sidenav-footer-content">
                <div class="sidenav-footer-subtitle">Login sebagai:</div>
                <div class="sidenav-footer-title">
                    @if (auth()->user()->role->name === 'root')
                        <span>Root</span>
                    @elseif (auth()->user()->role->name === 'admin_bawah')
                        <span>Admin Bawah</span>
                    @elseif (auth()->user()->role->name === 'admin_opd')
                        <span>Admin OPD</span>
                    @elseif (auth()->user()->role->name === 'bidang')
                        <span>Bidang</span>
                    @else
                        <span>Pimpinan</span>
                    @endif
                </div>
            </div>

        </div>
    </nav>
</div>
