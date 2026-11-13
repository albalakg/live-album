<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventAsset;
use App\Models\EventConfig;
use App\Models\Order;
use App\Models\User;
use App\Services\Enums\EventAssetTypeEnum;
use App\Services\Enums\EventGalleryTypeEnum;
use App\Services\Enums\RoleEnum;
use App\Services\Enums\StatusEnum;
use App\Services\Enums\SubscriptionEnum;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

/** Local host, empty account, and one classic event. Never run against production. */
class LocalHostSeeder extends Seeder
{
    public function run(): void
    {
        if (\App\Models\Role::count() === 0) {
            $this->call(RoleSeeder::class);
        }
        $this->call(SubscriptionPlanSeeder::class);

        $host = $this->activeUser('host@snapshare.test', 'עמית', 'גל');
        $this->activeUser('empty@snapshare.test', 'בדיקה', 'ריקה');

        if (Event::where('user_id', $host->id)->exists()) {
            $this->command?->info('Event already exists');
            return;
        }

        $order = new Order();
        $order->user_id = $host->id;
        $order->subscription_id = SubscriptionEnum::CLASSIC_ID;
        $order->order_number = 'LOC00000001';
        $order->status = StatusEnum::ACTIVE;
        $order->price = 200;
        $order->paid_at = now();
        $order->save();

        $event = new Event();
        $event->order_id = $order->id;
        $event->user_id = $host->id;
        $event->path = 'amit-gal';
        $event->name = 'החתונה של עמית וגל';
        $event->description = 'אירוע מקומי לבדיקה.';
        $event->status = StatusEnum::IN_PROGRESS;
        $event->starts_at = now()->subHour();
        $event->finished_at = now()->addMonths(6);
        $event->save();

        EventConfig::firstOrCreate(
            ['event_id' => $event->id],
            [
                'preview_site_display_image' => true,
                'preview_site_display_name' => true,
                'preview_site_display_date' => true,
                'preview_guests_assets_in_gallery' => true,
                'preview_owners_assets_in_gallery' => true,
                'preview_qr_in_gallery' => true,
                'displayed_gallery' => EventGalleryTypeEnum::SINGLE_GALLERY,
                'video_upload_enabled' => true,
                'preview_link_to_album_page_from_upload_page' => true,
            ]
        );

        $photos = array_filter(array_map('trim', explode(',', (string) getenv('SNAPSHARE_PHOTOS'))));
        foreach (array_values($photos) as $index => $source) {
            if (!is_file($source)) {
                $this->command?->warn("missing $source");
                continue;
            }
            $stored = "events/{$event->id}/gallery/".basename($source);
            Storage::disk('public')->put($stored, file_get_contents($source));
            $asset = new EventAsset();
            $asset->event_id = $event->id;
            $asset->asset_type = EventAssetTypeEnum::IMAGE_ID;
            $asset->path = $stored;
            $asset->status = $index === 0 ? StatusEnum::PENDING : StatusEnum::ACTIVE;
            $asset->is_displayed = true;
            $asset->user_agent = 'local-seed';
            $asset->ip = '127.0.0.1';
            $asset->created_by_guest = $index > 2;
            $asset->save();
        }

        $this->command?->info("Seeded event {$event->path} with ".count($photos).' photos');
    }

    private function activeUser(string $email, string $first, string $last): User
    {
        $user = User::firstOrNew(['email' => $email]);
        $user->role_id = RoleEnum::USER_ID;
        $user->first_name = $first;
        $user->last_name = $last;
        if (!$user->exists) {
            $user->password = 'Test1234!';
        }
        $user->status = StatusEnum::ACTIVE;
        $user->save();
        return $user;
    }
}
