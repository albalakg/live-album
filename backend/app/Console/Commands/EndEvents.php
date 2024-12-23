<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Event;
use Illuminate\Console\Command;
use App\Services\Enums\LogsEnum;
use App\Services\Enums\MailEnum;
use App\Services\Enums\StatusEnum;
use App\Services\Helpers\LogService;
use App\Services\Events\EventService;
use App\Services\Helpers\MailService;

class EndEvents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'event:end';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for events that need to end and update their status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $mail_service = new MailService();
        $event_service = new EventService();

        $events = Event::where('finished_at', '<=', Carbon::now()->endOfDay())
            ->where('status', StatusEnum::IN_PROGRESS)
            ->withCount('assets')
            ->get();

        foreach ($events as $event) {
            $event_service->updateStatus(StatusEnum::ACTIVE, $event->id);
            $data = [
                'event' => $event,
                'first_name' => $event->first_name ?? '',
                'event_url' => config('app.CLIENT_URL') . '/events',
            ];
            $mail_service->send('gal.blacky@gmail.com', MailEnum::EVENT_FINISHED, $data);
            LogService::init()->info(LogsEnum::EVENT_WARNED, ['id' => $event->id]);
        }
    }
}
