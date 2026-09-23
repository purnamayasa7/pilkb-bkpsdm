<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiKnowledge extends Model
{
    protected $table = 'tb_ai_knowledge';

    protected $fillable = [
        'kategori',
        'topik',
        'kata_kunci',
        'konten_jawaban',
        'nomor_referensi',
        'file_path',
        'file_original_name',
        'saran_pertanyaan',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'kata_kunci'       => 'array',
        'saran_pertanyaan' => 'array',
        'is_active'        => 'boolean',
        'hit_count'        => 'integer',
    ];

    // ─── Scopes ───────────────────────────────────────────────────────────────

    /**
     * Hanya materi yang aktif.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Filter berdasarkan kategori.
     */
    public function scopeByKategori($query, string $kategori)
    {
        return $query->where('kategori', $kategori);
    }

    // ─── Relasi ───────────────────────────────────────────────────────────────

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Kembalikan kata_kunci sebagai array (toleran null / string biasa).
     */
    public function getKataKunciArray(): array
    {
        $kk = $this->kata_kunci;
        if (is_array($kk)) {
            return array_filter($kk);
        }
        if (is_string($kk)) {
            $decoded = json_decode($kk, true);
            return is_array($decoded) ? array_filter($decoded) : array_filter([$kk]);
        }
        return [];
    }

    /**
     * Kembalikan saran pertanyaan sebagai array (toleran null).
     */
    public function getSaranArray(): array
    {
        $saran = $this->saran_pertanyaan;
        if (is_array($saran)) {
            return array_values(array_filter($saran));
        }
        if (is_string($saran)) {
            $decoded = json_decode($saran, true);
            return is_array($decoded) ? array_values(array_filter($decoded)) : [];
        }
        return [];
    }

    /**
     * Daftar kategori beserta label & warna (untuk UI).
     */
    public static function getKategoriOptions(): array
    {
        return [
            'regulasi'  => ['label' => 'Regulasi / UU', 'color' => 'blue'],
            'se_bupati' => ['label' => 'SE Bupati', 'color' => 'violet'],
            'disiplin'  => ['label' => 'Disiplin ASN', 'color' => 'rose'],
            'cuti'      => ['label' => 'Cuti ASN', 'color' => 'amber'],
            'pangkat'   => ['label' => 'Kenaikan Pangkat', 'color' => 'emerald'],
            'pensiun'   => ['label' => 'Pensiun', 'color' => 'slate'],
            'pns_pppk'  => ['label' => 'PNS & PPPK', 'color' => 'indigo'],
            'asn_umum'  => ['label' => 'ASN Umum', 'color' => 'teal'],
            'lainnya'   => ['label' => 'Lainnya', 'color' => 'gray'],
        ];
    }

    /**
     * Label kategori yang mudah dibaca.
     */
    public function getKategoriLabelAttribute(): string
    {
        return self::getKategoriOptions()[$this->kategori]['label'] ?? ucfirst($this->kategori);
    }
}
