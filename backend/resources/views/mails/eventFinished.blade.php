@extends('mails.layouts.base')

@section('content')
    <h2>האירוע שלך הסתיים!</h2>
    <p>שלום {{ $first_name }},</p>
    <p>האירוע "{{ $event->name }}" הסתיים בהצלחה.</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>סיכום האירוע:</h3>
        <p><strong>שם האירוע:</strong> {{ $event->name }}</p>
        <p><strong>תאריך:</strong> {{ $event->date->format('d/m/Y') }}</p>
        <p><strong>מספר תמונות שהועלו:</strong> {{ $event->assets_count }}</p>
        <p><strong>מספר משתתפים:</strong> {{ $participants_count }}</p>
    </div>

    <p>אנחנו כעת מעבדים את כל התמונות והסרטונים שהועלו לאירוע. נשלח לך הודעה נוספת כאשר הקבצים יהיו מוכנים להורדה.</p>
    
    <div style="text-align: center;">
        <a href="{{ $event_url }}" class="button">צפייה בגלריית האירוע</a>
    </div>

    <p>תודה שבחרת בשירות שלנו לאירוע שלך!</p>
    
    <p style="font-size: 12px; color: #666;">* עיבוד הקבצים עשוי לקחת מספר שעות, בהתאם לכמות החומרים שהועלו.</p>
@endsection
