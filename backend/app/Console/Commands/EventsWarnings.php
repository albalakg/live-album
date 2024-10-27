<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Event;
use Illuminate\Console\Command;
use App\Services\Enums\StatusEnum;
use App\Services\Helpers\MailService;
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
    protected $description = 'Warn users 3 days ahead before the event is being disabled';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $mail_service = new MailService();

        $events = Event::where('finished_at', '<=', Carbon::now()->subDays(27))
            ->join('users', 'users.id', 'events.user_id')
            ->where('status', StatusEnum::ACTIVE)
            ->select('events.id', 'events.name', 'users.first_name', 'users.email')
            ->get();

        

        foreach ($events as $event) {
            $data = [
                'event_name' => $event->name,
                'first_name' => $event->first_name,
                'download_link' => config('app.CLIENT_URL') . "/events/{$event->id}/assets"
            ];
            $mail_service->send($event->email, WarningBeforeEventDisabledMail::class, $data);
            $this->info("Event ID {$event->id} has been warned before disabled.");
        }
    }
}
