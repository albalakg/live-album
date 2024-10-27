<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Event;
use App\Mail\EventDisabledMail;
use Illuminate\Console\Command;
use App\Services\Enums\StatusEnum;
use App\Services\Users\UserService;
use App\Services\Events\EventService;
use App\Services\Helpers\MailService;

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
        $user_service = new UserService();
        $admin_user = $user_service->getAdminUser();

        $events = Event::where('finished_at', '<=', Carbon::now()->subDays(30))
            ->where('status', StatusEnum::ACTIVE)
            ->get();

        foreach ($events as $event) {
            $event_service->disable($event->id, $admin_user->id);
            $data = [
                'first_name' => $event->first_name,
                'event_name' => $event->name,
            ];
            $mail_service->send($event->email, EventDisabledMail::class, $data);
            $this->info("Event ID {$event->id} has been disabled.");
        }
    }
}
