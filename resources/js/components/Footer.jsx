import React from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 transition-colors">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                {/* Sisi Kiri: Info Hak Cipta & Instansi */}
                <div className="flex items-center gap-1.5 text-center sm:text-left">
                    <span>&copy; {currentYear}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">PILKB</span>
                    <span>-</span>
                    <a
                        href="https://bkpsdm.bulelengkab.go.id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                        title="BKPSDM Kabupaten Buleleng"
                    >
                        BKPSDM Kabupaten Buleleng
                    </a>
                </div>

                {/* Sisi Kanan: Developer Info */}
                <div className="flex items-center gap-1 text-center sm:text-right">
                    <span>Developed by</span>
                    <a
                        href="https://www.linkedin.com/in/kadek-purnamayasa-bba44a16b"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                        title="Kadek Purnamayasa"
                    >
                        Prakom PPI
                    </a>
                </div>
            </div>
        </footer>
    );
}
