<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'body' => $this->body,
            'featured_image' => $this->featured_image ? url($this->featured_image) : null,
            'status' => $this->status,
            'category_id' => $this->category_id,
            'published_at' => $this->published_at,
            'views_count' => $this->views_count,
            'reading_time' => $this->reading_time,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relations
            'author' => [
                'id' => $this->user->id ?? null,
                'name' => $this->user->name ?? null,
                'avatar' => $this->user->avatar ?? null,
            ],
            'category' => [
                'id' => $this->category->id ?? null,
                'name' => $this->category->name ?? null,
                'slug' => $this->category->slug ?? null,
            ],
            'tags' => $this->tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                ];
            }),
        ];
    }
}
