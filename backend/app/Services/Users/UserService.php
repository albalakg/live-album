<?php

namespace App\Services\Users;

use Exception;
use App\Models\User;
use Illuminate\Support\Carbon;
use App\Services\Enums\MailEnum;
use App\Services\Enums\RoleEnum;
use App\Models\UserResetPassword;
use App\Services\Enums\StatusEnum;
use Illuminate\Support\Facades\Hash;
use App\Models\UserEmailConfirmation;
use App\Services\Enums\MessagesEnum;
use App\Services\Events\EventService;
use App\Services\Helpers\MailService;
use App\Services\Helpers\TokenService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Auth\Authenticatable;
use Symfony\Component\Mailer\Event\MessageEvent;

class UserService
{
    public function __construct(
        private ?MailService $mail_service = null,
        private ?EventService $eventService = null
    ) {}

    /**
     * @param array $data
     * @return User
     */
    public function signup(array $data): User
    {
        $new_user = new User();
        $new_user->role_id = RoleEnum::USER_ID;
        $new_user->first_name = $data['first_name'];
        $new_user->last_name = $data['last_name'];
        $new_user->email = $data['email'];
        $new_user->password = $data['password'];
        $new_user->status = StatusEnum::PENDING;
        $new_user->save();

        $this->sendEmailConfirmation($new_user);

        return $new_user;
    }

    /**
     * @param string $email
     * @param string $token
     * @param Authenticatable $user
     * @return bool
     */
    public function confirmEmail(string $email, string $token): bool
    {
        $user_email_confirmation = UserEmailConfirmation::where('email', $email)
            ->where('token', $token)
            ->first();

        if (!$user_email_confirmation) {
            return false;
        }

        $user_email_confirmation->update(['verified_at' => now()]);
        $this->updateStatus(StatusEnum::ACTIVE, $user_email_confirmation->user_id);
    }

    /**
     * @param string $email
     * @return void
     */
    public function forgotPassword(string $email): void
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            throw new Exception(MessagesEnum::USER_NOT_FOUND);
        }

        // TODO: rest of forgot pass..
    }

    /**
     * @param string $email
     * @param string $token
     * @param string $password
     * @return void
     */
    public function resetPassword(string $email, string $token, string $password)
    {
        $reset_password_request = UserResetPassword::where('email', $email)
            ->where('token', $token)
            ->where('status', StatusEnum::PENDING)
            ->where('created_at', '>=', Carbon::now()->subDay()->toDateTimeString())
            ->first();

        if (!$reset_password_request) {
            throw new Exception('Reset Password request not found');
        }

        $user = User::where('email', $email)->exists();
        if (!$user) {
            throw new Exception(MessagesEnum::USER_NOT_FOUND);
        }

        $this->updatePassword($user, $password);

        $reset_password_request->update([
            'status' => StatusEnum::ACTIVE,
            'verified_at' => now()
        ]);
    }

    /**
     * @param User $user
     * @param string $password
     * @return bool
     */
    public function updatePassword(User $user, string $password): bool
    {
        if ($this->isNewPasswordMatchesOldPassword($user->password, $password)) {
            throw new Exception(MessagesEnum::USER_NEW_PASSWORD_MATCH_OLD);
        }

        // TODO: send email confirmation
        return $user->update(['password' => $password]);
    }

    /**
     * @return User
     */
    public function getAdminUser(): User
    {
        return User::where('role_id', RoleEnum::ADMIN_ID)->first();
    }

    /**
     * @param int $status
     * @param int $user_id
     * @return bool
     */
    public function updateStatus(int $status, int $user_id): bool
    {
        if (!$user = $this->find($user_id)) {
            throw new Exception(MessagesEnum::USER_NOT_FOUND);
        }
        return $user->update(['status' => $status]);
    }

    /**
     * @param array $data
     * @param int $user_id
     * @return User
     */
    public function update(array $data, int $user_id): User
    {
        if (!$user = $this->find($user_id)) {
            throw new Exception(MessagesEnum::USER_NOT_FOUND);
        }

        $user->first_name = $data['first_name'];
        $user->last_name = $data['last_name'];
        $user->save();

        return $user;
    }

    /**
     * @return Collection
     */
    public function get(): Collection
    {
        return User::with('event')->get();
    }

    /**
     * @param int $user_id
     * @return User
     */
    public function find(int $user_id): ?User
    {
        return User::find($user_id);
    }

    /**
     * @param int $deleted_user_id
     * @param int $deleting_user_id
     * @return bool
     */
    public function delete(int $deleted_user_id, int $deleting_user_id): bool
    {
        if (!$this->canDeleteUser($deleted_user_id, $deleting_user_id)) {
            throw new Exception(MessagesEnum::USER_NOT_AUTHORIZED_TO_DELETE);
        }

        $deleted_user = User::where('id', $deleted_user_id)
            ->with('events')
            ->select('id')
            ->first();

        if(!$deleted_user) {
            throw new Exception(MessagesEnum::USER_NOT_FOUND);
        }

        foreach ($deleted_user->events as $event) {
            try {
                $this->eventService->delete($event->id, $deleting_user_id);
            } catch (Exception $ex) {
                // TODO:: add log here
            }
        }

        return $deleted_user->delete();
    }

    /**
     * @param User $user
     * @return void
     */
    private function sendEmailConfirmation(User $user)
    {
        $mail_data = [
            'token' => TokenService::generate(),
            'email' => $user->email,
            'first_name' => $user->first_name,
        ];

        $this->mail_service->send($user->email, MailEnum::USER_SIGNUP, $mail_data);
        $this->createEmailConfirmation($user, $mail_data['token']);
    }

    /**
     * @param User $user
     * @param string $token
     * @return UserEmailConfirmation
     */
    private function createEmailConfirmation(User $user, string $token): UserEmailConfirmation
    {
        $email_confirmation = new UserEmailConfirmation;
        $email_confirmation->user_id = $user->user_id;
        $email_confirmation->email = $user->email;
        $email_confirmation->token = $token;
        $email_confirmation->save();

        return $email_confirmation;
    }


    /**
     * @param string $current_password
     * @param string $new_password
     * @return bool
     */
    private function isNewPasswordMatchesOldPassword(string $current_password, string $new_password): bool
    {
        return Hash::check($new_password, $current_password);
    }

    /**
     * @param int $deleted_user_id
     * @param int $deleting_user_id
     * @return bool
     */
    public function canDeleteUser(int $deleted_user_id, int $deleting_user_id): bool
    {
        return $deleted_user_id === $deleting_user_id || $this->find($deleted_user_id)->isAdmin();
    }
}
