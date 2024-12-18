@extends('mails.layouts.base')

@section('content')
    <h2>חשבונך נמחק בהצלחה</h2>
    <p>שלום {{ $first_name }},</p>
    <p>אנו מאשרים כי חשבונך ב-{{ config('app.name') }} נמחק בהצלחה.</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>פרטי המחיקה:</h3>
        <p><strong>תאריך מחיקה:</strong> {{ now()->format('d/m/Y H:i') }}</p>
        <p><strong>כתובת אימייל:</strong> {{ $first_email }}</p>
    </div>

    <p>כל המידע האישי שלך, כולל:</p>
    <ul style="list-style-type: disc; margin-right: 20px;">
        <li>פרטי החשבון</li>
        <li>היסטוריית הזמנות</li>
        <li>אירועים ותמונות</li>
        <li>העדפות אישיות</li>
    </ul>
    <p>נמחק לצמיתות ממערכותינו.</p>

    <p>אנו מצטערים לראות אותך עוזב/ת. אם תרצה/י לחזור בעתיד, תוכל/י ליצור חשבון חדש בכל עת.</p>
    
    <div style="text-align: center;">
        <a href="{{ $register_url }}" class="button">יצירת חשבון חדש</a>
    </div>

    <p>תודה שהשתמשת בשירותינו!</p>
    
    <p style="font-size: 12px; color: #666;">* בהתאם לחוקי הגנת הפרטיות, חלק מהמידע עשוי להישמר לתקופה מוגבלת למטרות משפטיות ורגולטוריות.</p>
@endsection
