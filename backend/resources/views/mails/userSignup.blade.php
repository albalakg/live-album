@extends('mails.layouts.base')

@section('content')
    <h2>ברוכים הבאים!</h2>
    <p>שלום {{ $first_name }},</p>
    <p>תודה שנרשמת ל-{{ config('app.name') }}.</p>
    <p>כדי להשלים את תהליך ההרשמה, אנא אמת/י את כתובת האימייל שלך על ידי לחיצה על הכפתור למטה:</p>
    
    <div style="text-align: center;">
        <a href="{{ $verification_url }}" class="button">אימות כתובת אימייל</a>
    </div>

    <p>או על ידי העתקת הקישור הבא לדפדפן:</p>
    <p style="word-break: break-all;">{{ $verification_url }}</p>

    <p>קישור זה יהיה תקף למשך 24 שעות.</p>
    
    <p>אם לא ביקשת להירשם לשירות שלנו, אנא התעלם/י מהודעה זו.</p>
@endsection
