@extends('mails.layouts.base')

@section('content')
    <h2>פנייתך התקבלה</h2>
    <p>שלום {{ $first_name }},</p>
    <p>תודה שפנית אלינו. הודעתך בנושא "{{ $subject }}" התקבלה בהצלחה.</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p>צוות התמיכה שלנו יבחן את פנייתך ויחזור אליך בהקדם האפשרי.</p>
        <p>זמן התגובה הממוצע שלנו הוא עד 24 שעות בימי עסקים.</p>
    </div>

    <p>בינתיים, תוכל/י למצוא תשובות לשאלות נפוצות במרכז העזרה שלנו:</p>
    
    <div style="text-align: center;">
        <a href="{{ config('app.url') }}/help" class="button">מרכז עזרה</a>
    </div>

    <p>אנו מודים לך על הסבלנות ומבטיחים לטפל בפנייתך במהירות האפשרית.</p>
    
    <p style="font-size: 12px; color: #666;">* אם יש לך שאלה דחופה או מידע נוסף להוסיף, תוכל/י להשיב להודעה זו ישירות.</p>
@endsection
