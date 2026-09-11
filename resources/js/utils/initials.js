/**
 * Menghasilkan 2 huruf inisial dari nama pengguna atau pegawai.
 * Menghapus gelar di belakang koma (misal: "Kadek Purnamayasa, S.Kom" -> "KP").
 *
 * @param {string} name
 * @param {string} fallback
 * @returns {string}
 */
export function getInitials(name, fallback = 'U') {
    if (!name || typeof name !== 'string') return fallback;
    const cleanName = name.split(',')[0].trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length > 0) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return fallback;
}

/**
 * Membersihkan gelar akademik depan dan belakang dari nama.
 * Misal: "Sang Made Ari Jayadiputra, S.Pd, MM" -> "Sang Made Ari Jayadiputra"
 *
 * @param {string} name
 * @param {string} fallback
 * @returns {string}
 */
export function formatCleanName(name, fallback = '') {
    if (!name || typeof name !== 'string') return fallback;
    let clean = name.split(',')[0].trim();
    clean = clean.replace(/^(dr\.|drs\.|dra\.|ir\.|prof\.|h\.|hj\.)\s+/i, '').trim();
    return clean || fallback || name;
}
