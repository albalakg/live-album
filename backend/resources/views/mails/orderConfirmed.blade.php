@extends('mails.layouts.base')

@section('content')
    <h2>הזמנתך אושרה!</h2>
    <p>שלום {{ $first_name }},</p>
    <p>תודה על הזמנתך ב-{{ config('app.name') }}.</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>פרטי ההזמנה:</h3>
        <p><strong>מספר הזמנה:</strong> {{ $order->id }}</p>
        <p><strong>סכום:</strong> ₪{{ number_format($order->amount, 2) }}</p>
        <p><strong>תאריך:</strong> {{ $order->created_at->format('d/m/Y H:i') }}</p>
        @if($order->subscription)
            <p><strong>חבילה:</strong> {{ $order->subscription->name }}</p>
        @endif
    </div>

    <p>תוכל/י לצפות בפרטי ההזמנה המלאים באזור האישי באתר:</p>
    
    <div style="text-align: center;">
        <a href="{{ $order_url }}" class="button">צפייה בהזמנה</a>
    </div>

    <p>תודה שבחרת בנו!</p>
@endsection
