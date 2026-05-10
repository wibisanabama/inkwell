<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * PUBLIC: Display comments tree for a specific post.
     */
    public function index($slug)
    {
        $post = Post::where('slug', $slug)->firstOrFail();

        $comments = Comment::where('post_id', $post->id)
            ->whereNull('parent_id')
            ->approved()
            ->with(['user', 'replies' => function ($query) {
                $query->approved()->with('user');
            }])
            ->latest()
            ->get();

        return response()->json($comments);
    }

    /**
     * PUBLIC: Store a newly created comment for a specific post.
     */
    public function store(Request $request, $slug)
    {
        $post = Post::where('slug', $slug)->firstOrFail();

        $request->validate([
            'body' => 'required|string',
            'parent_id' => 'nullable|exists:comments,id',
            'guest_name' => 'nullable|string|max:255|required_without:user_id',
            'guest_email' => 'nullable|email|max:255|required_without:user_id',
        ]);

        $data = [
            'post_id' => $post->id,
            'body' => $request->body,
            'parent_id' => $request->parent_id,
            'is_approved' => false, // Default needs approval
        ];

        if (auth('sanctum')->check()) {
            $data['user_id'] = auth('sanctum')->id();
            // Automatically approve auth user's comments if desired, but sticking to default false for now
        } else {
            $data['guest_name'] = $request->guest_name;
            $data['guest_email'] = $request->guest_email;
        }

        $comment = Comment::create($data);

        return response()->json($comment, 201);
    }

    /**
     * ADMIN: Update comment status (approve/reject).
     */
    public function update(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);

        $request->validate([
            'is_approved' => 'required|boolean',
        ]);

        $comment->update([
            'is_approved' => $request->is_approved,
        ]);

        return response()->json($comment);
    }

    /**
     * ADMIN: Remove the specified comment.
     */
    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }

    /**
     * ADMIN: Get all comments (pending, approved) for admin dashboard.
     * Implementing this helper method although not explicitly requested, 
     * it's essential for the admin comments page.
     */
    public function adminIndex(Request $request)
    {
        $query = Comment::with(['post', 'user']);

        if ($request->has('status') && strtolower($request->status) !== 'all') {
            $isApproved = strtolower($request->status) === 'approved';
            $query->where('is_approved', $isApproved);
        }

        $perPage = $request->input('per_page', 15);
        $comments = $query->latest()->paginate($perPage);

        return response()->json($comments);
    }
}
