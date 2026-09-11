<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;

class FaQController extends Controller
{
    public function index()
    {
        $faqs = Faq::orderBy('id', 'desc')->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'pertanyaan' => $item->pertanyaan,
                'jawaban' => $item->jawaban,
                'created_at_formatted' => $item->created_at ? $item->created_at->isoFormat('D MMMM Y, HH:mm') . ' WITA' : '-',
                'time_ago' => $item->created_at ? $item->created_at->diffForHumans() : '',
                'created_at' => $item->created_at ? $item->created_at->toIso8601String() : null,
            ];
        });

        return inertia('Root/Faq/Index', [
            'faqs' => $faqs,
        ]);
    }

    public function create()
    {
        return inertia('Root/Faq/Create');
    }

    public function edit($id)
    {
        $faq = Faq::findOrFail($id);

        return inertia('Root/Faq/Edit', [
            'faq' => $faq,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'pertanyaan' => 'required',
            'jawaban' => 'required'
        ]);

        $faq = Faq::create([
            'pertanyaan' => $request->pertanyaan,
            'jawaban' => $request->jawaban,
        ]);

        ActivityLogService::log(
            'Master Data FAQ',
            'CREATE',
            'Menambah FAQ Baru',
            [],
            $faq->toArray()
        );

        return redirect()->route('root.faq.index')->with('success', 'Berhasil menambah data');
    }

    public function update(Request $request, $id)
    {
        $faq = Faq::findOrFail($id);

        $validated = $request->validate([
            'pertanyaan' => 'required',
            'jawaban' => 'required'
        ]);

        $oldData = [
            'pertanyaan' => $faq->pertanyaan,
            'jawaban' => $faq->jawaban,
        ];

        $faq->update([
            'pertanyaan' => $validated['pertanyaan'],
            'jawaban' => $validated['jawaban'],
        ]);

        $newData = [
            'pertanyaan' => $faq->fresh()->pertanyaan,
            'jawaban' => $faq->fresh()->jawaban,
        ];

        ActivityLogService::log(
            'Master Data FAQ',
            'UPDATE',
            'Mengubah Data FAQ',
            $oldData,
            $newData
        );

        return redirect()->route('root.faq.index')->with('success', 'FAQ Berhasil diupdate');
    }

    public function destroy($id)
    {
        $faq = Faq::findOrFail($id);

        $oldData = [
            'id' => $faq->id,
            'pertanyaan' => $faq->pertanyaan,
            'jawaban' => $faq->jawaban,
        ];

        $faq->delete();

        ActivityLogService::log(
            'Master Data FAQ',
            'DELETE',
            'Menghapus FAQ',
            $oldData,
            []
        );

        return redirect()->route('root.faq.index')->with('success', 'FAQ berhasil dihapus');
    }
}
