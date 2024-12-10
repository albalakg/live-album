<?php

namespace App\Http\Controllers;

use Exception;
use App\Services\Events\EventService;
use App\Http\Requests\UploadFileRequest;
use App\Http\Requests\CreateEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Services\Enums\MessagesEnum;
use App\Services\Enums\StatusEnum;
use App\Services\Orders\OrderService;
use App\Services\Users\UserService;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    public function find(int $event_id)
    {
        try {
            $event_service = new EventService();
            $response = $event_service->find($event_id);
            return $this->successResponse(MessagesEnum::EVENT_FOUND_SUCCESS, $response);
        } catch (Exception $ex) {
            return $this->errorResponse($ex);
        }
    }

    public function uploadFile(int $event_id, UploadFileRequest $request)
    {
        try {
            $event_service = new EventService(
                new UserService(),
                new OrderService()
            );
            $response = $event_service->uploadFile($event_id, $request);
            return $this->successResponse(MessagesEnum::EVENT_FILE_UPLOADED_SUCCESS, $response);

        } catch (Exception $ex) {
            return $this->errorResponse($ex);
        }
    }

    public function createByAdmin(CreateEventRequest $request)
    {
        try {
            $event_service = new EventService();
            $response = $event_service->createByAdmin($request->validated());
            return $this->successResponse(MessagesEnum::EVENT_CREATED_SUCCESS, $response);

        } catch (Exception $ex) {
            return $this->errorResponse($ex);
        }
    }

    public function assets(int $event_id)
    {
        try {
            $event_service = new EventService(new UserService());
            $response = $event_service->getEventAssets($event_id, Auth::user()->id);
            return $this->successResponse(MessagesEnum::EVENT_FOUND_SUCCESS, $response);
        } catch (Exception $ex) {
            return $this->errorResponse($ex);
        }
    }

    public function getBaseInfo(string $event_path)
    {
        try {
            $event_service = new EventService();
            $response = $event_service->getBaseInfo($event_path);
            return $this->successResponse(MessagesEnum::EVENT_FOUND_SUCCESS, $response);
        } catch (Exception $ex) {
            return $this->errorResponse($ex);
        }
    }

    public function update(int $event_id, UpdateEventRequest $request)
    {
        try {
            $event_service = new EventService(
                new UserService()
            );
            $response = $event_service->update($event_id, $request->validated(), Auth::user()->id);
            return $this->successResponse(MessagesEnum::EVENT_UPDATED_SUCCESS, $response);
        } catch (Exception $ex) {
            return $this->errorResponse($ex);
        }
    }

    public function ready(int $event_id)
    {
        try {
            $event_service = new EventService();
            $response = $event_service->updateStatus(StatusEnum::READY, $event_id);
            return $this->successResponse(MessagesEnum::EVENT_UPDATED_SUCCESS, $response);
        } catch (Exception $ex) {
            return $this->errorResponse($ex);
        }
    }

    public function pending(int $event_id)
    {
        try {
            $event_service = new EventService();
            $response = $event_service->updateStatus(StatusEnum::PENDING, $event_id);
            return $this->successResponse(MessagesEnum::EVENT_UPDATED_SUCCESS, $response);
        } catch (Exception $ex) {
            return $this->errorResponse($ex);
        }
    }

    public function delete(int $event_id)
    {
        try {
            $event_service = new EventService(
                new UserService()
            );
            $event_service->delete($event_id, Auth::user()->id);
            return response()->json(['message' => MessagesEnum::EVENT_DELETED_SUCCESS]);
        } catch (Exception $ex) {
            return $this->errorResponse($ex);
        }
    }
}
