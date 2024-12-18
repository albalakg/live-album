@extends('mails.layouts.base')

@section('content')
    <h2>החבילה שלך שודרגה!</h2>
    <p>שלום {{ $first_name }},</p>
    <p>אנו שמחים לעדכן כי החבילה שלך ב-{{ config('app.name') }} שודרגה בהצלחה.</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>פרטי החבילה החדשה:</h3>
        <p><strong>שם החבילה:</strong> {{ $subscription->name }}</p>
        <p><strong>תאריך שדרוג:</strong> {{ now()->format('d/m/Y') }}</p>
        <p><strong>תאריך חידוש הבא:</strong> {{ $subscription->next_billing_date?->format('d/m/Y') }}</p>
        
        <h4 style="margin-top: 15px;">יתרונות החבילה:</h4>
        <ul style="list-style-type: disc; margin-right: 20px;">
            @foreach($subscription->features as $feature)
                <li>{{ $feature }}</li>
            @endforeach
        </ul>
    </div>

    <p>תוכל/י לנהל את החבילה שלך בכל עת דרך האזור האישי:</p>
    
    <div style="text-align: center;">
        <a href="{{ $manage_url }}" class="button">ניהול חבילה</a>
    </div>

    <p>תודה שבחרת לשדרג! אנחנו בטוחים שתיהנה/י מהיתרונות הנוספים.</p>
    
    <p style="font-size: 12px; color: #666;">* אם יש לך שאלות לגבי החבילה החדשה, אנחנו כאן לעזור.</p>
@endsection
