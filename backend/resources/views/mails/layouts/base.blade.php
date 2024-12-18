<!DOCTYPE html>
<html dir="rtl" lang="he">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name') }}</title>
    <style>
        :root {
            --green: #79AE60;
            --lightGreen: #A3D18D;
            --pink: #F68589;
            --lightPink: #FFAEB1;
            --dark-gray: #686666;
            --gray: #EEEEEE;
            --dark: #222;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--dark);
            margin: 0;
            padding: 0;
            direction: rtl;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            text-align: center;
            padding: 30px 20px;
            background-color: var(--green);
            color: white;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }

        .content {
            padding: 30px;
            background-color: #ffffff;
        }

        .content h2 {
            color: var(--green);
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 20px;
        }

        .info-box {
            background-color: var(--gray);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .info-box h3 {
            color: var(--dark);
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 16px;
        }

        .info-box p {
            margin: 8px 0;
        }

        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: var(--green);
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
            text-align: center;
            transition: background-color 0.3s ease;
        }

        .button:hover {
            background-color: var(--lightGreen);
        }

        .button.secondary {
            background-color: var(--pink);
        }

        .button.secondary:hover {
            background-color: var(--lightPink);
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: var(--dark-gray);
            font-size: 12px;
            background-color: var(--gray);
            border-top: 1px solid #ddd;
        }

        .warning {
            background-color: var(--lightPink);
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            color: var(--dark);
        }

        .success {
            background-color: var(--lightGreen);
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            color: var(--dark);
        }

        .note {
            font-size: 12px;
            color: var(--dark-gray);
            margin-top: 15px;
            padding: 10px;
            border-right: 3px solid var(--dark-gray);
            background-color: var(--gray);
        }

        ul {
            list-style-position: inside;
            padding-right: 0;
        }

        li {
            margin-bottom: 8px;
        }

        strong {
            color: var(--dark);
        }

        .text-center {
            text-align: center;
        }

        .button-container {
            text-align: center;
            margin: 25px 0;
        }

        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }

            .content {
                padding: 20px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <a href="{{ config("app.client_url") }}">
                <h1>{{ config('app.name') }}</h1>
            </a>
        </div>

        <div class="content">
            @yield('content')
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} {{ config('app.name') }}. כל הזכויות שמורות.</p>
            <a href="{{ config("app.client_url") }}">
                <small>
                    קישור לעמוד הבית
                </small>
            </a>
        </div>
    </div>
</body>

</html>