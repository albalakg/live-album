<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Event;
use App\Services\Enums\StatusEnum;
use Carbon\Carbon;

class StartEvents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'event:start';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for events that need to start and update their status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $events = Event::where('starts_at', '<=', Carbon::now())
            ->where('status', StatusEnum::READY)
            ->get();

        foreach ($events as $event) {
            $event->status = StatusEnum::IN_PROGRESS;
            $event->save();
            $this->info("Event ID {$event->id} has been started.");
            // TODO:: add log here
        }
    }
}
