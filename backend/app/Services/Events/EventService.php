<?php

namespace App\Services\Events;

use Exception;
use App\Models\Event;
use App\Models\Order;
use App\Models\EventAsset;
use App\Services\Enums\LogsEnum;
use App\Services\Enums\StatusEnum;
use App\Services\Users\UserService;
use App\Services\Enums\MessagesEnum;
use App\Services\Helpers\LogService;
use App\Services\Helpers\FileService;
use App\Services\Orders\OrderService;
use App\Http\Requests\UploadFileRequest;
use App\Services\Enums\EventAssetTypeEnum;
use Illuminate\Database\Eloquent\Collection;

/**
 * Event Life Cycle:
 * Pending -> Ready -> Active -> Inactive
 * 
 * 1. Creates automatically with pending status while creating an order
 * 2. User moves the status for ready before the start date
 * 3. When the event starts the status turns to active via a job
 * 4. After 30 days the event becomes disabled and all assets are removed
*/
class EventService
{
    public function __construct(
        private ?UserService $user_service = null,
        private ?OrderService $order_service = null
    ) {}

    /**
     * @return Collection
     */
    public function get(): Collection
    {
        return Event::with('user')->get();
    }

    /**
     * @param int $id
     * @return ?Event
     */
    public function find(int $id): ?Event
    {
        $event = Event::with('assets')->first($id);
        if (!$event) {
            return null;
        }

        if(!$event->isActive()) {
            throw new Exception(MessagesEnum::EVENT_NOT_AUTHORIZED);
        }

        return $event;
    }

    /**
     * @param int $user_id
     * @return ?Event
     */
    public function getEventByUser(int $user_id): ?Event
    {
        $event = Event::where('user_id', $user_id)->select('id', 'order_id', 'name', 'description', 'status', 'starts_at', 'finished_at')->first();
        if (!$event) {
            return null;
        }

        if(!$event->isActive()) {
            throw new Exception(MessagesEnum::EVENT_NOT_AUTHORIZED);
        }

        return $event;
    }

    /**
     * @param int $id
     * @return ?Event
     */
    public function getEventAssets(int $id): ?Event
    {
        $event = EventAsset::where('event_id', $id)->get();
        if (!$event) {
            return null;
        }

        if(!$event->isActive()) {
            throw new Exception(MessagesEnum::EVENT_NOT_AUTHORIZED);
        }

        return $event;
    }

    /**
     * Created automatically with the order
     * 
     * @param Order $order
     * @return ?Event
     */
    public function create(Order $order): ?Event
    {
        $event = new Event;
        $event->order_id = $order->id;
        $event->user_id = $order->user_id;
        $event->status = StatusEnum::PENDING;
        $event->save();
        return $event;
    }

    /**
     * 
     * @param array $data
     * @return ?Event
     */
    public function createByAdmin(array $data): ?Event
    {
        $event = new Event;
        $event->status = $data['status'] ?? StatusEnum::PENDING;
        $event->order_id = $data['order_id'] ?? null;
        $event->user_id = $data['user_id'];
        $event->name = $data['name'];
        $event->description = $data['description'];
        $event->starts_at = $data['starts_at'];
        if (!empty($data['starts_at'])) {
            $event->finished_at = $this->getEventFinishTime($event->starts_at);
        }
        $event->save();
        return $event;
    }

    /**
     * @param int $event_id
     * @param array $data
     * @param int $user_id
     * @return ?Event
     */
    public function update(int $event_id, array $data, int $user_id): ?Event
    {
        $event = Event::find($event_id);
        if (!$event) {
            throw new Exception(MessagesEnum::EVENT_NOT_FOUND);
        }

        if (!$this->isAuthorizedToModifyEvent($event, $user_id)) {
            throw new Exception(MessagesEnum::EVENT_NOT_AUTHORIZED);
        }

        $event->name = $data['name'] ?? $event->name;
        $event->image = FileService::create($data['image'], 'events', FileService::S3_DISK);
        $event->description = $data['description'] ?? $event->description;
        $event->starts_at = $data['starts_at'] ?? $event->starts_at;
        if (!empty($data['starts_at'])) {
            $event->finished_at = $this->getEventFinishTime($event->starts_at);
        }

        $event->save();
        return $event;
    }

    /**
     * @param int $event_id
     * @param array $data
     * @return ?Event
     */
    public function updateByAdmin(int $event_id, array $data): ?Event
    {
        $event = Event::find($event_id);
        if (!$event) {
            throw new Exception(MessagesEnum::EVENT_NOT_FOUND);
        }

        $event->name = $data['name'] ?? $event->name;
        $event->image = FileService::create($data['image'], 'events', FileService::S3_DISK);
        $event->description = $data['description'] ?? $event->description;
        $event->starts_at = $data['starts_at'] ?? $event->starts_at;
        $event->status = $data['status'] ?? $event->status;
        if (!empty($data['starts_at'])) {
            $event->finished_at = $this->getEventFinishTime($event->starts_at);
        }

        $event->save();
        return $event;
    }

    /**
     * @param int $status
     * @param int $event_id
     * @return bool
     */
    public function updateStatus(int $status, int $event_id): bool
    {
        if (!$event = Event::find($event_id)) {
            throw new Exception(MessagesEnum::EVENT_NOT_FOUND);
        }
        return $event->update(['status' => $status]);
    }

    /**
     * @param int $event_id
     * @param int $user_id
     * @return bool
     */
    public function disable(int $event_id, int $user_id): bool
    {
        $event = Event::find($event_id);
        if (!$event) {
            throw new Exception(MessagesEnum::EVENT_NOT_FOUND);
        }

        if (!$this->isAuthorizedToModifyEvent($event, $user_id)) {
            throw new Exception(MessagesEnum::EVENT_NOT_AUTHORIZED);
        }

        $this->deleteEventAssets($event_id);
        return $this->updateStatus(StatusEnum::INACTIVE, $event->id);
    }

    /**
     * @param int $event_id
     * @param int $user_id
     * @return bool
     */
    public function delete(int $event_id, int $user_id): bool
    {
        $event = Event::find($event_id);
        if (!$event) {
            throw new Exception(MessagesEnum::EVENT_NOT_FOUND);
        }

        if (!$this->isAuthorizedToModifyEvent($event, $user_id)) {
            throw new Exception(MessagesEnum::EVENT_NOT_AUTHORIZED);
        }

        return $event->delete();
    }

    /**
     * @param int $event_id
     * @param UploadFileRequest $request
     * @return EventAsset
     */
    public function uploadFile(int $event_id, UploadFileRequest $request): EventAsset
    {
        $event = Event::find($event_id);
        if (!$event) {
            throw new Exception(MessagesEnum::EVENT_NOT_FOUND);
        }

        if (!$this->isAuthorizedToUploadAsset($event)) {
            throw new Exception(MessagesEnum::EVENT_NOT_AUTHORIZED);
        }

        $event_asset = new EventAsset;
        $event_asset->path = FileService::create($request['file'], 'files', FileService::S3_DISK);
        $event_asset->event_id = $request->event_id;
        $event_asset->type = $this->getFileType($request);
        $event_asset->status = StatusEnum::ACTIVE;
        $event_asset->save();

        return $event_asset;
    }

    /**
     * @param string $starts_at
     * @return string
     */
    private function getEventFinishTime(string $starts_at): string
    {
        $startDateTime = new \DateTime($starts_at);
        $startDateTime->add(new \DateInterval('P1D')); // Add 24 hours to the start time
        return $startDateTime->format('Y-m-d H:i:s');
    }

    /**
     * @param int $event_id
     * @return void
     */
    private function deleteEventAssets(int $event_id): void
    {
        $event_assets = EventAsset::where('event_id', $event_id)
                        ->select('id', 'path')
                        ->get();

        foreach($event_assets AS $event_asset) {
            try {
                FileService::create($event_asset->path, 'files', FileService::S3_DISK);
            } catch (Exception $ex) {
                LogService::init()->error($ex, ['error' => LogsEnum::FAILED_TO_DELETE_EVENT_ASSET]);
            }
        }

        EventAsset::where('event_id', $event_id)->delete();
    }

    /**
     * @param Event $event
     * @param int $user_id
     * @return bool
     */
    private function isAuthorizedToModifyEvent(Event $event, int $user_id): bool
    {
        $user = $this->user_service->find($user_id);
        return $event->user_id === $user->id || $user->isAdmin();
    }

    /**
     * @param Event $event
     * @return bool
     */
    private function isAuthorizedToUploadAsset(Event $event): bool
    {
        $order = $this->order_service->find($event->order_id);
        return $event->isActive() && $this->getEventTotalAssets($event->id) < $order->subscription->files_allowed;
    }

    /**
     * @param int $event_id
     * @return int
     */
    private function getEventTotalAssets(int $event_id): int
    {
        return EventAsset::where('event_id', $event_id)->count();
    }
    
    /**
     * @param UploadFileRequest $request
     * @return int
    */
    private function getFileType(UploadFileRequest $request): int
    {
        $extension = strtolower($request->file('file')->getClientOriginalExtension());
        return in_array($extension, ['mp4', 'mov', 'avi']) ? EventAssetTypeEnum::VIDEO : EventAssetTypeEnum::IMAGE;
    }
}
