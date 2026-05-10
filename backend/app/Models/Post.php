<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'excerpt',
        'body',
        'featured_image',
        'status',
        'published_at',
        'views_count',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    protected $appends = ['reading_time'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->title);
            }
            if (empty($post->user_id)) {
                $post->user_id = auth()->id() ?? 1; // Fallback to 1 for seeder if needed
            }
            if ($post->status === 'published' && empty($post->published_at)) {
                $post->published_at = now();
            }
        });

        static::updating(function ($post) {
            if ($post->isDirty('title') && empty($post->slug)) {
                $post->slug = Str::slug($post->title);
            }
            if ($post->isDirty('status') && $post->status === 'published' && empty($post->published_at)) {
                $post->published_at = now();
            }
        });
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

    // Scopes
    public function scopePublished(Builder $query)
    {
        return $query->where('status', 'published');
    }

    public function scopeDraft(Builder $query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeArchived(Builder $query)
    {
        return $query->where('status', 'archived');
    }

    // Accessors
    public function getReadingTimeAttribute()
    {
        $wordCount = str_word_count(strip_tags($this->body));
        $minutes = ceil($wordCount / 200); // Assuming 200 words per minute
        return max(1, $minutes);
    }
}
