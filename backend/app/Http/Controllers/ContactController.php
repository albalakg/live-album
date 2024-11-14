<?php

namespace App\Http\Controllers;

use Exception;
use App\Services\Enums\MessagesEnum;
use App\Services\Support\SupportService;
use App\Http\Requests\CreateSupportTicketRequest;
use App\Services\Users\UserService;

class ContactController extends Controller
{
    public function create(CreateSupportTicketRequest $request)
    {
        try {
            $support_service = new SupportService();
            $response = $support_service->create($request->validated());
            return $this->successResponse(MessagesEnum::SUPPORT_TICKET_CREATED_SUCCESS, $response);
        } catch (Exception $ex) {
            return $this->errorResponse($ex);
        }
    }
}
