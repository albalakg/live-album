<?php

namespace App\Http\Controllers;

use Exception;
use App\Services\Users\UserService;
use Illuminate\Support\Facades\Auth;
use App\Services\Enums\MessagesEnum;
use App\Services\Helpers\MailService;
use App\Services\Orders\OrderService;
use App\Services\Orders\PaymentService;
use App\Http\Requests\CreateOrderRequest;
use App\Services\Orders\SubscriptionService;

class OrderController extends Controller
{
    public function get()
    {
        try {
            $order_service = new OrderService();
            $response = $order_service->get();
            return $this->successResponse(MessagesEnum::ORDER_CREATED_SUCCESS, $response);
        } catch (Exception $ex) {
            return $this->errorResponse($ex);
        }
    }

    public function create(CreateOrderRequest $request)
    {
        try {
            $order_service = new OrderService(
                new PaymentService,
                new MailService,
                new SubscriptionService,
                new UserService
            );
            $response = $order_service->create($request->validated(), Auth::user()->id);
            return $this->successResponse(MessagesEnum::ORDER_CREATED_SUCCESS, $response);
        } catch (Exception $ex) {
            return $this->errorResponse($ex);
        }
    }
}
