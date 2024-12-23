<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Event;
use App\Mail\EventDisabledMail;
use Illuminate\Console\Command;
use App\Services\Enums\LogsEnum;
use App\Services\Enums\MailEnum;
use App\Services\Enums\StatusEnum;
use App\Services\Users\UserService;
use App\Services\Helpers\LogService;
use App\Services\Events\EventService;
use App\Services\Helpers\MailService;
use App\Services\Enums\SubscriptionEnum;

class DisableEvents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'event:disable';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Disable events that are older than 30 days and still active';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $event_service = new EventService();
        $mail_service = new MailService();

        $events = Event::join('users', 'users.id', 'events.user_id')
            ->where('finished_at', '<=', Carbon::now()->subDays(14)->endOfDay())
            ->where('status', StatusEnum::ACTIVE)
            ->select('events.id', 'events.name', 'events.finished_at', 'users.first_name', 'users.email', 'events.status')
            ->get();

        foreach ($events as $event) {
            $event_service->disable($event->id);
            
            $shouldWarn = false;
            $finishedAt = Carbon::parse($event->finished_at);
            $days_diff = $finishedAt->diffInDays(Carbon::now()->endOfDay());
            if ($event->subscription_id === SubscriptionEnum::NORMAL_ID) {
                $shouldWarn = true;
            }
            else if (
                $event->subscription_id === SubscriptionEnum::PREMIUM_ID &&
                $days_diff === 27
            ) {
                $shouldWarn = true;
            }

            if ($shouldWarn) {
                $data = [
                    'event' => $event,
                    'first_name' => $event->first_name ?? '',
                ];
                $mail_service->send($event->email, MailEnum::EVENT_DISABLED, $data);
                LogService::init()->info(LogsEnum::EVENT_WARNED, ['id' => $event->id]);
            }
        }
    }
}
