<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    public function index()
    {
        $total_users = User::count();
        
        $total_posts = Schema::hasTable('posts') ? DB::table('posts')->count() : 0;
        $total_comments = Schema::hasTable('comments') ? DB::table('comments')->count() : 0;
        $total_views = Schema::hasTable('posts') ? (int) DB::table('posts')->sum('views_count') : 0;
        
        // Ensure recent_posts and recent_comments are arrays/collections even if tables don't exist
        $recent_posts = Schema::hasTable('posts') 
            ? DB::table('posts')->orderBy('created_at', 'desc')->take(5)->get() 
            : [];
            
        $recent_comments = Schema::hasTable('comments') 
            ? DB::table('comments')->orderBy('created_at', 'desc')->take(5)->get() 
            : [];

        return response()->json([
            'total_posts' => $total_posts,
            'total_comments' => $total_comments,
            'total_views' => $total_views,
            'total_users' => $total_users,
            'recent_posts' => $recent_posts,
            'recent_comments' => $recent_comments,
        ]);
    }
}
