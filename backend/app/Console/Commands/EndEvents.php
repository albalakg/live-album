<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Event;
use Illuminate\Console\Command;
use App\Services\Enums\LogsEnum;
use App\Services\Enums\StatusEnum;
use App\Services\Helpers\LogService;
use App\Services\Events\EventService;

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
        $event_service = new EventService();
        $events = Event::where('finished_at', '<=', Carbon::now())
            ->where('status', StatusEnum::IN_PROGRESS)
            ->get();

        foreach ($events as $event) {
            $event_service->updateStatus(StatusEnum::ACTIVE, $event->id);
            $event->save();
            LogService::init()->info(LogsEnum::EVENT_SET_ACTIVE, ['id' => $event->id]);
        }
    }
}
