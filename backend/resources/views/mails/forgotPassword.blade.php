@extends('mails.layouts.base')

@section('content')
    <h2>איפוס סיסמה</h2>
    <p>שלום {{ $first_name }},</p>
    <p>קיבלנו בקשה לאיפוס הסיסמה שלך ב-{{ config('app.name') }}.</p>
    <p>לחץ/י על הכפתור למטה כדי לאפס את הסיסמה:</p>
    
    <div style="text-align: center;">
        <a href="{{ $reset_url }}" class="button">איפוס סיסמה</a>
    </div>

    <p>או על ידי העתקת הקישור הבא לדפדפן:</p>
    <p style="word-break: break-all;">{{ $reset_url }}</p>

    <p>קישור זה יהיה תקף למשך שעה אחת.</p>
    
    <p>אם לא ביקשת לאפס את הסיסמה שלך, אנא התעלם/י מהודעה זו.</p>
@endsection
