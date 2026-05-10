<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Add posts count if needed, but simple list works for now
        // Return all categories
        $categories = Category::withCount('posts')->get();
        return response()->json($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CategoryRequest $request)
    {
        $data = $request->validated();
        
        // Ensure slug is generated if not explicitly provided
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
            // Handle uniqueness manually if needed, but model handles basic saving
        }

        $category = Category::create($data);

        return response()->json($category, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return response()->json($category);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CategoryRequest $request, Category $category)
    {
        $data = $request->validated();

        if (isset($data['name']) && $category->name !== $data['name']) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return response()->json($category);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Check if category has posts
        if ($category->posts()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category with existing posts.'
            ], 400);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
