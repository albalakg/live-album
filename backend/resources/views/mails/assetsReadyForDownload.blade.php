@extends('mails.layouts.base')

@section('content')
    <h2>הקבצים שלך מוכנים להורדה!</h2>
    <p>שלום {{ $first_name }},</p>
    <p>הקבצים מהאירוע "{{ $event->name }}" מוכנים להורדה.</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>פרטי האירוע:</h3>
        <p><strong>שם האירוע:</strong> {{ $event->name }}</p>
        <p><strong>תאריך האירוע:</strong> {{ $event->date->format('d/m/Y') }}</p>
        <p><strong>מספר קבצים:</strong> {{ $event->assets_count }}</p>
    </div>

    <p>לחץ/י על הכפתור למטה כדי לצפות ולהוריד את הקבצים:</p>
    
    <div style="text-align: center;">
        <a href="{{ $download_url }}" class="button">הורדת קבצים</a>
    </div>

    <p>הקישור יהיה זמין למשך 7 ימים.</p>
    
    <p style="font-size: 12px; color: #666;">* גודל הקבצים עשוי להיות משמעותי. מומלץ להוריד בחיבור אינטרנט יציב.</p>
@endsection
