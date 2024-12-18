@extends('mails.layouts.base')

@section('content')
    <h2>האירוע שלך התחיל!</h2>
    <p>שלום {{ $first_name }},</p>
    <p>האירוע "{{ $event->name }}" התחיל כעת.</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>פרטי האירוע:</h3>
        <p><strong>שם האירוע:</strong> {{ $event->name }}</p>
        <p><strong>תאריך:</strong> {{ $event->date->format('d/m/Y') }}</p>
        <p><strong>שעת התחלה:</strong> {{ $event->start_time->format('H:i') }}</p>
        <p><strong>שעת סיום:</strong> {{ $event->end_time->format('H:i') }}</p>
    </div>

    <p>האורחים יכולים כעת להתחיל להעלות תמונות וסרטונים לאירוע.</p>
    
    <div style="text-align: center;">
        <a href="{{ $event_url }}" class="button">צפייה באירוע</a>
    </div>

    <p>אנו מאחלים לך אירוע מוצלח ומהנה!</p>
    
    <p style="font-size: 12px; color: #666;">* תוכל/י לנהל את האירוע ולצפות בתמונות המועלות בזמן אמת דרך לוח הבקרה.</p>
@endsection
