<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Event;
use Illuminate\Console\Command;
use App\Services\Enums\LogsEnum;
use App\Services\Enums\StatusEnum;
use App\Services\Helpers\LogService;
use App\Services\Helpers\MailService;
use App\Services\Enums\SubscriptionEnum;
use App\Mail\WarningBeforeEventDisabledMail;

class EventsWarnings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'event:warning';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Warn users when their event is close to being disabled based on subscription type';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $mail_service = new MailService();

        $events = Event::join('users', 'users.id', 'events.user_id')
            ->join('orders', 'orders.id', 'events.order_id')
            ->where('events.status', StatusEnum::ACTIVE)
            ->select('events.id', 'events.name', 'events.finished_at', 'users.first_name', 'users.email', 'events.status', 'orders.subscription_id')
            ->get();

        foreach ($events as $event) {
            $shouldWarn = false;
            $finishedAt = Carbon::parse($event->finished_at);

            if ($event->subscription_id === SubscriptionEnum::NORMAL_ID && 
                $finishedAt->diffInDays(Carbon::now()) === 11) {
                $shouldWarn = true;
            }

            if ($event->subscription_id === SubscriptionEnum::PREMIUM_ID && 
                $finishedAt->diffInDays(Carbon::now()) === 27) {
                $shouldWarn = true;
            }

            if ($shouldWarn) {
                $data = [
                    'event_name' => $event->name,
                    'first_name' => $event->first_name,
                    'download_link' => config('app.CLIENT_URL') . "/events/{$event->id}/assets"
                ];
                $mail_service->send($event->email, WarningBeforeEventDisabledMail::class, $data);
                LogService::init()->info(LogsEnum::EVENT_WARNED, ['id' => $event->id]);
            }
        }
    }
}
