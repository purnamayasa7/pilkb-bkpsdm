@php
    $menus = config('menu');
    $roleId = auth()->user()->role_id ?? null;
    $menuItems = $menus[$roleId] ?? [];

    $hasUnreadChat = false;
    if (auth()->check()) {
        $userId = auth()->id();
        $participants = \App\Models\ChatParticipant::where('user_id', $userId)->get(['conversation_id', 'last_read_message_id']);
        foreach ($participants as $p) {
            if (\App\Models\ChatMessage::where('conversation_id', $p->conversation_id)
                ->where('id', '>', $p->last_read_message_id ?? 0)
                ->where(function ($q) use ($userId) {
                    $q->whereNull('sender_user_id')
                        ->orWhere('sender_user_id', '!=', $userId);
                })->exists()) {
                $hasUnreadChat = true;
                break;
            }
        }
    }
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
                            href="{{ !empty($menu['path']) ? url($menu['path']) . ($menu['path'] === 'log-viewer' ? '' : '?menu=' . ($menu['active_key'] ?? '')) : 'javascript:void(0);' }}"
                            {!! !empty($menu['target']) ? 'target="' . e($menu['target']) . '"' : '' !!}>

                            <div class="nav-link-icon">
                                <i data-feather="{{ $menu['icon'] }}"></i>
                            </div>
                            {{ $menu['title'] }}

                            @if (($menu['path'] ?? '') === 'chat' && $hasUnreadChat)
                                <span class="badge bg-warning-soft text-warning ms-auto" style="font-size: 0.65rem; font-weight: 700; padding: 0.25rem 0.45rem; letter-spacing: 0.3px;">
                                    New
                                </span>
                            @endif
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
                                    return (!empty($child['path']) && request()->is($child['path'])) ||
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
                                    <a class="nav-link {{ (!empty($child['path']) && request()->is($child['path'])) ? 'active' : '' }}"
                                        href="{{ !empty($child['path']) ? url($child['path']) . '?menu=' . ($child['active_key'] ?? '') : 'javascript:void(0);' }}">
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
                        <span>Admin Bidang</span>
                    @else
                        <span>Pimpinan</span>
                    @endif
                </div>
            </div>

        </div>
    </nav>
</div>
