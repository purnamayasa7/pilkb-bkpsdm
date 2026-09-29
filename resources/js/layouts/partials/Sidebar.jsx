import React from "react";
import { Link } from "@inertiajs/react";
import { X } from "lucide-react";
import MenuIcon from "../../components/MenuIcon";
import { getInitials } from "@/utils/initials";

const Sidebar = React.memo(function Sidebar({
    menu,
    user,
    currentUrl,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
}) {
    return (
        <aside
            className={`sidebar-container fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
        >
            <div className={`h-16 flex items-center ${sidebarCollapsed ? "lg:justify-center lg:px-2 px-5 justify-between" : "justify-between px-5"} flex-shrink-0 transition-all duration-300`}>
                <Link href="/dashboard" className="flex items-center gap-3.5 group overflow-hidden">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50/70 dark:bg-slate-800 border border-blue-100/70 dark:border-slate-700/60 p-1 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0">
                        <img src="/images/KabBuleleng.png" alt="Logo Buleleng" className="w-full h-full object-contain" />
                    </div>
                    <div className={`${sidebarCollapsed ? "lg:hidden" : "block"} transition-opacity duration-200 whitespace-nowrap`}>
                        <h1 className="font-extrabold text-base leading-tight tracking-tight text-slate-900 dark:text-white">PILKB</h1>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none mt-0.5">BKPSDM BULELENG</p>
                    </div>
                </Link>
                <button type="button" onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className={`flex-1 overflow-y-auto sidebar-scroll ${sidebarCollapsed ? "lg:px-2.5 px-3.5" : "px-3.5"} pt-1 pb-4 space-y-1 transition-all duration-300`}>
                {(() => {
                    const allMenuHrefs = menu.filter((i) => i.type !== "heading" && i.path).map((i) => (i.path.startsWith("http") || i.path.startsWith("/") ? i.path : `/${i.path}`));
                    const exactMatchExists = allMenuHrefs.includes(currentUrl);
                    return menu.map((item, idx) => {
                        if (item.type === "heading") {
                            if (sidebarCollapsed) return <div key={idx} className="hidden lg:block my-2 mx-1 border-t border-slate-100 dark:border-slate-800/80" title={item.title} />;
                            return <div key={idx} className={`${idx === 0 ? "pt-1.5 pb-2" : "pt-5 pb-2"} px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500`}>{item.title}</div>;
                        }
                        const href = item.path?.startsWith("http") || item.path?.startsWith("/") ? item.path : `/${item.path}`;
                        let isActive = false;
                        if (exactMatchExists) { isActive = currentUrl === href; } else {
                            const matchingPrefixes = allMenuHrefs.filter((h) => h !== "/" && (currentUrl === h || currentUrl.startsWith(`${h}/`)));
                            const bestMatch = matchingPrefixes.sort((a, b) => b.length - a.length)[0];
                            isActive = href === bestMatch;
                        }
                        const isHighlight = !isActive && (item.icon === "file-plus" || item.active_key === "register");
                        const hasBadge = Boolean(item.badge_count && Number(item.badge_count) > 0);
                        const isBtlWarning = hasBadge && (item.badge_variant === "warning" || (!item.badge_variant && item.title && item.title.toLowerCase().includes("perbaikan")));
                        const isPermintaanBlue = hasBadge && (item.badge_variant === "info" || item.badge_variant === "primary" || item.badge_variant === "blue" || (item.title && item.title.toLowerCase().includes("permintaan")));
                        const isWarning = !isActive && isBtlWarning;
                        const isBlueBadge = !isActive && isPermintaanBlue;
                        const tooltipText = sidebarCollapsed ? (hasBadge ? (isBtlWarning ? `${item.title} (${item.badge_count} usulan perlu perbaikan)` : `${item.title} (${item.badge_count} usulan bulan ini)`) : item.title) : undefined;
                        const badgeTitle = isBtlWarning ? `${item.badge_count} usulan perlu perbaikan` : `${item.badge_count} usulan masuk bulan ini`;
                        return (
                            <Link key={idx} href={href} target={item.target || undefined} onClick={() => setSidebarOpen(false)} title={tooltipText}
                                className={`flex items-center ${sidebarCollapsed ? "lg:justify-center lg:px-2 px-3.5 gap-3" : "gap-3 px-3.5"} py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    isActive ? "bg-blue-600 text-white shadow-xs font-semibold"
                                    : isWarning ? "bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-100/60 dark:hover:bg-rose-900/40"
                                    : (isHighlight || isBlueBadge) ? "bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-100/60 dark:hover:bg-blue-900/40"
                                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"}`}>
                                <MenuIcon name={isWarning ? "alert-circle" : item.icon} className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-white" : isWarning ? "text-rose-500 dark:text-rose-400" : (isHighlight || isBlueBadge) ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"}`} />
                                <span className={`truncate flex-1 ${sidebarCollapsed ? "lg:hidden" : "block"}`}>{item.title}</span>
                                {hasBadge && (
                                    <span className={`px-1.5 py-0.5 min-w-[20px] h-5 rounded-full ${isActive ? "bg-white text-blue-600 font-bold" : isBtlWarning ? "bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold" : "bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold"} text-[11px] flex items-center justify-center flex-shrink-0 ${sidebarCollapsed ? "lg:hidden" : "flex"}`} title={badgeTitle}>{item.badge_count}</span>
                                )}
                            </Link>
                        );
                    });
                })()}
            </nav>

            <div className={`border-t border-slate-100 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900 transition-all duration-300 ${sidebarCollapsed ? "lg:p-3 p-5 lg:flex lg:justify-center" : "p-5"}`}>
                {sidebarCollapsed ? (
                    <>
                        <div className="hidden lg:flex w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 items-center justify-center font-bold text-xs shadow-2xs cursor-default" title={`${user?.nama || "Petugas"} (${user?.role ? user.role.replace("_", " ") : "Petugas"})`}>{getInitials(user?.nama, "P")}</div>
                        <div className="lg:hidden">
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-normal leading-none">Login sebagai:</p>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize mt-1.5 tracking-tight">{user?.role ? user.role.replace("_", " ") : "Petugas"}</h4>
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{user?.nama || "-"}</p>
                        </div>
                    </>
                ) : (
                    <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-normal leading-none">Login sebagai:</p>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize mt-1.5 tracking-tight">{user?.role ? user.role.replace("_", " ") : "Petugas"}</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{user?.nama || "-"}</p>
                    </div>
                )}
            </div>
        </aside>
    );
});

export default Sidebar;