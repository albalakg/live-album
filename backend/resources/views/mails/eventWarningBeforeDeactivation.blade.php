@extends('mails.layouts.base')

@section('content')
    <h2>התראה: האירוע שלך עומד להיות מושבת</h2>
    <p>שלום {{ $first_name }},</p>
    <p>אנו מתריעים כי האירוע "{{ $event->name }}" עומד להיות מושבת בקרוב.</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>פרטי האירוע:</h3>
        <p><strong>שם האירוע:</strong> {{ $event->name }}</p>
        <p><strong>תאריך האירוע:</strong> {{ $event->date->format('d/m/Y') }}</p>
        <p><strong>תאריך השבתה:</strong> {{ $deactivation_date->format('d/m/Y') }}</p>
        <p><strong>ימים שנותרו:</strong> {{ $days_remaining }}</p>
    </div>

    <p>לאחר השבתת האירוע:</p>
    <ul style="list-style-type: disc; margin-right: 20px;">
        <li>לא ניתן יהיה להעלות תמונות חדשות</li>
        <li>הגלריה לא תהיה זמינה לצפייה</li>
        <li>כל הקבצים המשויכים לאירוע יימחקו</li>
    </ul>

    <p>אם ברצונך להאריך את משך האירוע, אנא בצע/י שדרוג לחבילה מתאימה:</p>
    
    <div style="text-align: center;">
        <a href="{{ $upgrade_url }}" class="button">שדרוג חבילה</a>
    </div>

    <p>או הורד/י את כל הקבצים לפני מועד ההשבתה:</p>
    
    <div style="text-align: center;">
        <a href="{{ $download_url }}" class="button">הורדת קבצים</a>
    </div>

    <p style="font-size: 12px; color: #666;">* לאחר השבתת האירוע, לא תהיה אפשרות לשחזר את הקבצים.</p>
@endsection
