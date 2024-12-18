@extends('mails.layouts.base')

@section('content')
    <h2>פנייתכם התקבלה</h2>
    
    <p>שלום {{ $first_name }},</p>
    <p>תודה שפניתם אלינו. הודעתך התקבלה בהצלחה ותטופל בהקדם.</p>

    <div class="info-box">
        <h3>פרטי הפנייה:</h3>
        <p><strong>נושא הפנייה:</strong> {{ $subject }}</p>
        <p><strong>תאריך קבלה:</strong> {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <div class="success">
        <h3>מה הלאה?</h3>
        <ul>
            <li>צוות התמיכה שלנו יבחן את פנייתכם</li>
            <li>נחזור אליכם בהקדם האפשרי</li>
        </ul>
    </div>

    <div class="success">
        <p>אנו מודים לכם על הסבלנות ומבטיחים לטפל בפנייתכם במהירות האפשרית.</p>
    </div>
@endsection
