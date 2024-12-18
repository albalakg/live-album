@extends('mails.layouts.base')

@section('content')
    <h2>ברוכים הבאים!</h2>
    
    <p>שלום {{ $first_name }},</p>

    <div class="info-box">
        <h3>השלמת הרשמה</h3>
        <p>כדי להשלים את תהליך ההרשמה ולהתחיל להשתמש בשירות, אנא אמתו את כתובת האימייל שלך.</p>
    </div>
    
    <div class="button-container">
        <a href="{{ $verification_url }}" class="button">אימות כתובת אימייל</a>
    </div>

    <div class="warning">
        <p>אם לא ביקשת להירשם לשירות שלנו, אנא התעלמו מהודעה זו.</p>
    </div>

    <div class="success">
        <p>לאחר אימות האימייל תוכלו להמשיך לרכישת החבילה שלכם:</p>
        <a href="{{ $order_url }}" class="button">הזמנת החבילה</a>
    </div>
@endsection
