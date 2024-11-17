<?php

namespace App\Services\Orders;

use Exception;
use App\Models\Order;
use App\Services\Enums\MailEnum;
use App\Services\Enums\StatusEnum;
use App\Services\Users\UserService;
use App\Services\Enums\MessagesEnum;
use App\Services\Events\EventService;
use App\Services\Helpers\MailService;
use App\Services\Orders\SubscriptionService;
use Illuminate\Database\Eloquent\Collection;

class OrderService
{
    public function __construct(
        private ?PaymentService $payment_service = null,
        private ?MailService $mail_service = null,
        private ?SubscriptionService $subscription_service = null,
        private ?UserService $user_service = null,
        private ?EventService $event_service = null,
    ) {}

    /**
     * @param int $order_id
     * @return Order
     */
    public function find(int $order_id): Order
    {
        return Order::with('subscription')->find($order_id);
    }

    /**
     * @return Collection
     */
    public function get(): Collection
    {
        return Order::get();
    }

    /**
     * @param array $data
     * @param int $user_id
     * @return Order
     */
    public function create(array $data, int $user_id): Order
    {
        $subscription = $this->subscription_service->find($data['subscription_id']);
        $new_order = new Order();
        $new_order->user_id = $user_id;
        $new_order->subscription_id = $data['subscription_id'];
        $new_order->price = $subscription['price'];
        $new_order->status = StatusEnum::PENDING;
        $new_order->order_number = $this->generateOrderNumber();
        $new_order->save();

        $this->payment_service->start($new_order);
        return $new_order;
    }

    /**
     * @param int $order_id
     * @return Order
     */
    public function orderConfirmed(int $order_id): Order
    {
        if (!$order = $this->find($order_id)) {
            throw new Exception(MessagesEnum::ORDER_NOT_FOUND);
        }

        if (!$user = $this->user_service->find($order->user_id)) {
            throw new Exception(MessagesEnum::USER_NOT_FOUND);
        }

        $this->updateStatus(StatusEnum::ACTIVE, $order_id);
        $this->mail_service->send($user->email, MailEnum::ORDER_CONFIRMED, [
            'order' => $order,
            'first_name' => $user->first_name
        ]);

        foreach ($order->subscription->events_allowed ?? 1 as $event) {
            $this->event_service->create($order);
        }
        return $order;
    }

    /**
     * @param int $order_id
     * @return Order
     */
    public function orderFailed(int $order_id): Order
    {
        if (!$order = $this->find($order_id)) {
            throw new Exception(MessagesEnum::ORDER_NOT_FOUND);
        }

        if (!$user = $this->user_service->find($order->user_id)) {
            throw new Exception(MessagesEnum::USER_NOT_FOUND);
        }

        $this->updateStatus(StatusEnum::INACTIVE, $order_id);
        $this->mail_service->send($user->email, MailEnum::ORDER_FAILED, [
            'order' => $order,
            'first_name' => $user->first_name
    ]);

        return $order;
    }

    /**
     * @param int $status
     * @param int $order_id
     * @return bool
     */
    public function updateStatus(int $status, int $order_id): bool
    {
        return Order::where('id', $order_id)->update([
            'status' => $status
        ]);
    }

    /**
     * Generating a unique order number
     *
     * @return string
     */
    private function generateOrderNumber(): string
    {
        $order_number = 'ON_' . random_int(00000000, 99999999);
        if (Order::where('order_number', $order_number)->exists()) {
            return $this->generateOrderNumber();
        }
        return $order_number;
    }
}
