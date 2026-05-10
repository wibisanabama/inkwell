<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('post_tag', function (Blueprint $table) {
            // we use constrained but since posts doesn't exist yet, 
            // we will just define foreignId without constrained check, 
            // or we just define standard bigInteger for now.
            // Laravel 12 allows constrained without immediate schema checking if not checking fk constraints right away,
            // but safer to just use foreignId() and add constrained() later, or define standard.
            $table->foreignId('post_id'); 
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            
            // Primary key is the combination of both
            $table->primary(['post_id', 'tag_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_tag');
    }
};
