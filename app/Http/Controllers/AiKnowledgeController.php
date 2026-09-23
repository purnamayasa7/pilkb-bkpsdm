<?php

namespace App\Http\Controllers;

use App\Models\AiKnowledge;
use App\Services\ActivityLogService;
use App\Services\KepegawaianAiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AiKnowledgeController extends Controller
{
    
    public function index()
    {
        $allData = AiKnowledge::with('createdBy')
            ->orderByDesc('hit_count')
            ->orderByDesc('updated_at')
            ->get()
            ->map(function ($item) {
                return [
                    'id'                  => $item->id,
                    'kategori'            => $item->kategori,
                    'kategori_label'      => $item->kategori_label,
                    'topik'               => $item->topik,
                    'kata_kunci'          => $item->getKataKunciArray(),
                    'konten_jawaban'      => $item->konten_jawaban,
                    'nomor_referensi'     => $item->nomor_referensi,
                    'file_path'           => $item->file_path,
                    'file_original_name'  => $item->file_original_name,
                    'saran_pertanyaan'    => $item->getSaranArray(),
                    'is_active'           => $item->is_active,
                    'hit_count'           => $item->hit_count,
                    'created_by_nama'     => $item->createdBy?->nama ?? '-',
                    'created_at_formatted'=> $item->created_at
                        ? $item->created_at->isoFormat('D MMMM Y, HH:mm') . ' WITA' : '-',
                    'updated_at_formatted'=> $item->updated_at
                        ? $item->updated_at->isoFormat('D MMMM Y, HH:mm') . ' WITA' : '-',
                    'time_ago'            => $item->updated_at
                        ? $item->updated_at->diffForHumans() : '',
                ];
            });

        $stats = [
            'total'           => $allData->count(),
            'aktif'           => $allData->where('is_active', true)->count(),
            'nonaktif'        => $allData->where('is_active', false)->count(),
            'hit_total'       => $allData->sum('hit_count'),
            'top_materi'      => $allData->first()?->topik ?? '-',
        ];

        return inertia('Root/AiKnowledge/Index', [
            'knowledgeList'   => $allData,
            'stats'           => $stats,
            'kategoriOptions' => AiKnowledge::getKategoriOptions(),
        ]);
    }

    // ─── Create ────────────────────────────────────────────────────────────────

    public function create()
    {
        return inertia('Root/AiKnowledge/Create', [
            'kategoriOptions' => AiKnowledge::getKategoriOptions(),
        ]);
    }

    // ─── Store ─────────────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori'         => 'required|in:regulasi,se_bupati,disiplin,cuti,pangkat,pensiun,pns_pppk,asn_umum,lainnya',
            'topik'            => 'required|string|max:255',
            'kata_kunci'       => 'required',
            'konten_jawaban'   => 'required|string|max:5000', // FIX #4: Batas token Gemini
            'nomor_referensi'  => 'nullable|string|max:200',
            'saran_pertanyaan' => 'nullable',
            'is_active'        => 'nullable|boolean',
            'file_pdf'         => 'nullable|file|mimes:pdf|max:10240',
        ]);

        // Normalisasi kata kunci → JSON array
        $kataKunci = $this->parseKataKunci($validated['kata_kunci']);

        // Normalisasi saran pertanyaan → JSON array
        $saranPertanyaan = $this->parseSaranPertanyaan($validated['saran_pertanyaan'] ?? null);

        $filePath     = null;
        $fileOrigName = null;

        // Upload PDF jika ada
        if ($request->hasFile('file_pdf') && $request->file('file_pdf')->isValid()) {
            $file         = $request->file('file_pdf');
            $fileOrigName = $file->getClientOriginalName();
            $stored       = $file->store('ai-knowledge', 'public');
            $filePath     = $stored;
        }

        $record = AiKnowledge::create([
            'kategori'          => $validated['kategori'],
            'topik'             => $validated['topik'],
            'kata_kunci'        => json_encode($kataKunci),
            'konten_jawaban'    => $validated['konten_jawaban'],
            'nomor_referensi'   => $validated['nomor_referensi'] ?? null,
            'file_path'         => $filePath,
            'file_original_name'=> $fileOrigName,
            'saran_pertanyaan'  => $saranPertanyaan ? json_encode($saranPertanyaan) : null,
            'is_active'         => filter_var($validated['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'created_by'        => Auth::id(),
        ]);

        // Invalidate cache LILI AI
        Cache::forget('ai_knowledge_active');

        ActivityLogService::log(
            'LILI AI Knowledge Base',
            'CREATE',
            'Menambah Materi Pengetahuan LILI AI',
            [],
            ['id' => $record->id, 'topik' => $record->topik, 'kategori' => $record->kategori]
        );

        return redirect()
            ->route('root.ai-knowledge.index')
            ->with('success', 'Materi pengetahuan LILI berhasil ditambahkan.');
    }

    // ─── Edit ──────────────────────────────────────────────────────────────────

    public function edit($id)
    {
        $item = AiKnowledge::findOrFail($id);

        return inertia('Root/AiKnowledge/Edit', [
            'knowledge' => [
                'id'                  => $item->id,
                'kategori'            => $item->kategori,
                'topik'               => $item->topik,
                'kata_kunci'          => $item->getKataKunciArray(),
                'konten_jawaban'      => $item->konten_jawaban,
                'nomor_referensi'     => $item->nomor_referensi,
                'file_path'           => $item->file_path,
                'file_original_name'  => $item->file_original_name,
                'file_url'            => $item->file_path
                    ? Storage::disk('public')->url($item->file_path)
                    : null,
                'saran_pertanyaan'    => $item->getSaranArray(),
                'is_active'           => $item->is_active,
                'hit_count'           => $item->hit_count,
                'created_at_formatted'=> $item->created_at
                    ? $item->created_at->isoFormat('D MMMM Y, HH:mm') . ' WITA' : '-',
                'updated_at_formatted'=> $item->updated_at
                    ? $item->updated_at->isoFormat('D MMMM Y, HH:mm') . ' WITA' : '-',
            ],
            'kategoriOptions' => AiKnowledge::getKategoriOptions(),
        ]);
    }

    // ─── Update ────────────────────────────────────────────────────────────────

    public function update(Request $request, $id)
    {
        $item = AiKnowledge::findOrFail($id);

        $validated = $request->validate([
            'kategori'         => 'required|in:regulasi,se_bupati,disiplin,cuti,pangkat,pensiun,pns_pppk,asn_umum,lainnya',
            'topik'            => 'required|string|max:255',
            'kata_kunci'       => 'required',
            'konten_jawaban'   => 'required|string|max:5000', // FIX #4: Batas token Gemini
            'nomor_referensi'  => 'nullable|string|max:200',
            'saran_pertanyaan' => 'nullable',
            'is_active'        => 'nullable|boolean',
            'file_pdf'         => 'nullable|file|mimes:pdf|max:10240',
            'hapus_file'       => 'nullable|boolean',
        ]);

        $oldData = [
            'topik'    => $item->topik,
            'kategori' => $item->kategori,
        ];

        $kataKunci       = $this->parseKataKunci($validated['kata_kunci']);
        $saranPertanyaan = $this->parseSaranPertanyaan($validated['saran_pertanyaan'] ?? null);

        $filePath     = $item->file_path;
        $fileOrigName = $item->file_original_name;

        // Hapus file jika diminta atau diganti
        if (filter_var($request->input('hapus_file'), FILTER_VALIDATE_BOOLEAN)) {
            $this->deleteFileIfExists($item->file_path);
            $filePath     = null;
            $fileOrigName = null;
        }

        // Upload file baru
        if ($request->hasFile('file_pdf') && $request->file('file_pdf')->isValid()) {
            // Hapus file lama terlebih dahulu
            $this->deleteFileIfExists($item->file_path);

            $file         = $request->file('file_pdf');
            $fileOrigName = $file->getClientOriginalName();
            $stored       = $file->store('ai-knowledge', 'public');
            $filePath     = $stored;
        }

        $item->update([
            'kategori'          => $validated['kategori'],
            'topik'             => $validated['topik'],
            'kata_kunci'        => json_encode($kataKunci),
            'konten_jawaban'    => $validated['konten_jawaban'],
            'nomor_referensi'   => $validated['nomor_referensi'] ?? null,
            'file_path'         => $filePath,
            'file_original_name'=> $fileOrigName,
            'saran_pertanyaan'  => $saranPertanyaan ? json_encode($saranPertanyaan) : null,
            'is_active'         => filter_var($validated['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
        ]);

        // Invalidate cache LILI AI
        Cache::forget('ai_knowledge_active');

        ActivityLogService::log(
            'LILI AI Knowledge Base',
            'UPDATE',
            'Mengubah Materi Pengetahuan LILI AI',
            $oldData,
            ['topik' => $item->topik, 'kategori' => $item->kategori]
        );

        return redirect()
            ->route('root.ai-knowledge.index')
            ->with('success', 'Materi pengetahuan LILI berhasil diperbarui.');
    }

    // ─── Destroy ───────────────────────────────────────────────────────────────

    public function destroy($id)
    {
        $item = AiKnowledge::findOrFail($id);

        $oldData = [
            'id'       => $item->id,
            'topik'    => $item->topik,
            'kategori' => $item->kategori,
        ];

        // Hapus file PDF jika ada
        $this->deleteFileIfExists($item->file_path);

        $item->delete();

        // Invalidate cache LILI AI
        Cache::forget('ai_knowledge_active');

        ActivityLogService::log(
            'LILI AI Knowledge Base',
            'DELETE',
            'Menghapus Materi Pengetahuan LILI AI',
            $oldData,
            []
        );

        return redirect()
            ->route('root.ai-knowledge.index')
            ->with('success', 'Materi pengetahuan LILI berhasil dihapus.');
    }

    // ─── Toggle Aktif (AJAX) ──────────────────────────────────────────────────

    public function toggleAktif($id)
    {
        $item             = AiKnowledge::findOrFail($id);
        $item->is_active  = ! $item->is_active;
        $item->save();

        // Invalidate cache LILI AI
        Cache::forget('ai_knowledge_active');

        return response()->json([
            'success'   => true,
            'is_active' => $item->is_active,
            'message'   => $item->is_active
                ? 'Materi berhasil diaktifkan.'
                : 'Materi berhasil dinonaktifkan.',
        ]);
    }

    // ─── Download / View PDF ──────────────────────────────────────────────────

    public function downloadPdf($id)
    {
        $item = AiKnowledge::findOrFail($id);

        abort_if(! $item->file_path, 404, 'Tidak ada file PDF untuk materi ini.');

        $fullPath = Storage::disk('public')->path($item->file_path);
        abort_if(! file_exists($fullPath), 404, 'File tidak ditemukan.');

        $fileName = $item->file_original_name ?: basename($item->file_path);

        return response()->file($fullPath, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
        ]);
    }

    // ─── Simulator Sandbox LILI ───────────────────────────────────────────────

    public function testSimulator(Request $request)
    {
        $validated = $request->validate([
            'pertanyaan' => 'required|string|min:3|max:1000',
        ]);

        $service = app(KepegawaianAiService::class);

        $startMs = microtime(true);

        $result = $service->ask(
            $validated['pertanyaan'],
            [],
            [
                'name'       => Auth::user()?->nama ?? 'Admin Root',
                'unit_kerja' => 'BKPSDM Kabupaten Buleleng',
            ]
        );

        $durationMs = round((microtime(true) - $startMs) * 1000);

        return response()->json([
            'success'     => $result['success'] ?? true,
            'reply'       => $result['reply'] ?? $result['message'] ?? 'Tidak ada jawaban.',
            'actions'     => $result['actions'] ?? [],
            'source'      => $result['source'] ?? 'unknown',
            'duration_ms' => $durationMs,
        ]);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    /**
     * Normalisasi input kata kunci → array string bersih.
     * Menerima: JSON string, array, atau teks dipisah koma/baris.
     */
    private function parseKataKunci(mixed $input): array
    {
        if (is_array($input)) {
            return array_values(array_filter(array_map('trim', $input)));
        }

        if (is_string($input)) {
            // Coba decode JSON terlebih dahulu
            $decoded = json_decode($input, true);
            if (is_array($decoded)) {
                return array_values(array_filter(array_map('trim', $decoded)));
            }
            // Fallback: split koma / baris
            $parts = preg_split('/[,\n]+/', $input);
            return array_values(array_filter(array_map('trim', $parts)));
        }

        return [];
    }

    /**
     * Normalisasi saran pertanyaan → array string bersih (maks 4).
     */
    private function parseSaranPertanyaan(mixed $input): array
    {
        if (is_null($input)) return [];

        if (is_array($input)) {
            return array_slice(array_values(array_filter(array_map('trim', $input))), 0, 4);
        }

        if (is_string($input)) {
            $decoded = json_decode($input, true);
            if (is_array($decoded)) {
                return array_slice(array_values(array_filter(array_map('trim', $decoded))), 0, 4);
            }
        }

        return [];
    }

    /**
     * Hapus file dari storage public jika ada.
     */
    private function deleteFileIfExists(?string $filePath): void
    {
        if ($filePath && Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }
    }
}
