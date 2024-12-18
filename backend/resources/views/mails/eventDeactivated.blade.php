@extends('mails.layouts.base')

@section('content')
    <h2>האירוע הושבת</h2>
    <p>שלום {{ $first_name }},</p>
    <p>האירוע "{{ $event->name }}" הושבת.</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>פרטי האירוע:</h3>
        <p><strong>שם האירוע:</strong> {{ $event->name }}</p>
        <p><strong>תאריך האירוע:</strong> {{ $event->date->format('d/m/Y') }}</p>
        <p><strong>תאריך השבתה:</strong> {{ now()->format('d/m/Y') }}</p>
    </div>

    <p>משמעות ההשבתה:</p>
    <ul style="list-style-type: disc; margin-right: 20px;">
        <li>לא ניתן להעלות תמונות חדשות</li>
        <li>הגלריה אינה זמינה לצפייה</li>
        <li>כל הקבצים המשויכים לאירוע יימחקו בתוך 24 שעות</li>
    </ul>

    <p>אם ברצונך להפעיל מחדש את האירוע, אנא שדרג/י את החבילה שלך:</p>
    
    <div style="text-align: center;">
        <a href="{{ $upgrade_url }}" class="button">שדרוג חבילה</a>
    </div>

    <p style="font-size: 12px; color: #666;">* לאחר 24 שעות, לא תהיה אפשרות לשחזר את הקבצים.</p>
@endsection
