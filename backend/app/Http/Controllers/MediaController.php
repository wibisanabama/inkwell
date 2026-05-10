<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class MediaController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->file('image')) {
            $file = $request->file('image');
            $path = $file->store('uploads', 'public');
            
            return response()->json([
                'url' => Storage::disk('public')->url($path),
                'path' => $path,
            ], 201);
        }

        throw ValidationException::withMessages([
            'image' => 'Failed to upload image.',
        ]);
    }
}
