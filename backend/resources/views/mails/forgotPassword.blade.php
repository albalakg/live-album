@extends('mails.layouts.base')

@section('content')
    <h2>איפוס סיסמה</h2>
    
    <p>שלום {{ $first_name }},</p>

    <div class="info-box">
        <h3>איפוס סיסמה</h3>
        <p>כדי לאפס את הסיסמה שלכם, לחצו על הכפתור למטה:</p>
    </div>
    
    <div class="button-container">
        <a href="{{ $reset_url }}" class="button">איפוס סיסמה</a>
    </div>

    <div class="warning">
        <h3>מידע חשוב</h3>
        <ul>
            <li>קישור זה יהיה תקף למשך שעה אחת בלבד</li>
            <li>לאחר איפוס הסיסמה, תועברו למסך התחברות</li>
            <li>יש להשתמש בקישור זה פעם אחת בלבד</li>
        </ul>
    </div>

    <div class="note">
        <p>אם לא ביקשת לאפס את הסיסמה שלכם:</p>
        <ul>
            <li>הסיסמה הנוכחית שלכם תישאר ללא שינוי</li>
            <li>ממליצים לשנות את הסיסמה באזור האישי מטעמי אבטחה</li>
        </ul>
    </div>
@endsection
