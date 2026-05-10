<?php

namespace App\Http\Controllers;

use App\Http\Requests\PostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    /**
     * PUBLIC: Display a paginated list of published posts.
     */
    public function index(Request $request)
    {
        $query = Post::published()->with(['user', 'category', 'tags']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        if ($request->has('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->has('tag')) {
            $query->whereHas('tags', function($q) use ($request) {
                $q->where('slug', $request->tag);
            });
        }

        $perPage = $request->input('per_page', 10);
        $posts = $query->latest('published_at')->paginate($perPage);

        return PostResource::collection($posts);
    }

    /**
     * PUBLIC: Display the specified post by slug.
     */
    public function show($slug)
    {
        $post = Post::published()->with(['user', 'category', 'tags'])->where('slug', $slug)->firstOrFail();
        
        // Increment views count
        $post->increment('views_count');

        return new PostResource($post);
    }

    /**
     * ADMIN: Display all posts (any status).
     */
    public function adminIndex(Request $request)
    {
        $query = Post::with(['category', 'user', 'tags']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->has('status') && $request->status !== 'All') {
            $query->where('status', strtolower($request->status));
        }

        $perPage = $request->input('per_page', 15);
        $posts = $query->latest()->paginate($perPage);

        return PostResource::collection($posts);
    }

    /**
     * ADMIN: Store a newly created post.
     */
    public function store(PostRequest $request)
    {
        $data = $request->validated();
        
        $post = Post::create($data);

        if ($request->has('tags')) {
            $post->tags()->sync($request->tags);
        }

        $post->load(['category', 'user', 'tags']);

        return response()->json(new PostResource($post), 201);
    }

    /**
     * ADMIN: Update the specified post.
     */
    public function update(PostRequest $request, $id)
    {
        $post = Post::findOrFail($id);
        $data = $request->validated();

        $post->update($data);

        if ($request->has('tags')) {
            $post->tags()->sync($request->tags);
        }

        $post->load(['category', 'user', 'tags']);

        return response()->json(new PostResource($post));
    }

    /**
     * ADMIN: Remove the specified post.
     */
    public function destroy($id)
    {
        $post = Post::findOrFail($id);
        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }
}
