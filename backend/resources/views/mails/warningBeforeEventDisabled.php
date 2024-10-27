@include('mails.mailHeader')
<head>
    <style>
        body {
            direction: rtl;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 0;
            margin: 0;
        }

        table {
            width: 40%;
            margin: auto;
        }

        .content {
            position: relative;
            top: -200px;
            background-color: #fff;
            width: 94%;
            border-radius: 10px;
            box-shadow: 0 0 10px 2px #8885;
        }

        .content div {
            padding: 1px 10px;
            padding-bottom: 10px;
            text-align: right;
        }

        .content img {
            width: 60%;
        }

        .blue--text {
            color: #16588f;
        }

        button {
            background-color: #e6b260;
            padding: 10px 30px;
            border-radius: 25px;
            border: 1px solid #fff;
            box-shadow: 0 0 5px 1px #e6b26088;
            color: #fff;
            font-weight: bold;
            cursor: pointer;
        }

        .links {
            display: flex;
            justify-content: space-between;
            width: 50%;
            margin: auto;
        }

        @media only screen and (max-width: 600px) {
            table {
                width: 100%;
                border-spacing: unset;
            }
        }
    </style>
</head>

<body>
    <table dir="rtl">
        @include('mails.templates.header')
        <tbody>
            <tr>
                <td align="center">
                    <div class="content">
                        <div>
                            <h1>
                                היי {{ $data['first_name'] }}, <span class="blue--text">האירוע {{ $data['event_name']}} עומד להיסגר</span>
                            </h1>
                            <p>
                                בעוד 3 ימים האירוע ייסגר וכל קבצי האירוע יימחקו.
                                <br>
                                צירפנו לינק למטה להורדה
                                <br>
                                אנחנו ממליצים לכם להוריד אותם לפני שיימחקו כי לא יהיה ניתן לשחזר
                                <br>
                                <br>
                                בברכה,
                                <br>
                                צוות {{ config('app.name') }}.
                            </p>

                        </div>
                        <br>
                        <a href="{{ $data['download_link'] }}">
                            <button>
                                הורד את קבצי האירוע
                            </button>
                        </a>
                        <br>
                        <br>
                        <br>
                        <br>
                        <img src="{{ URL::to('/') }}/files/general/logo.png" />
                        <br>
                        <br>
                    </div>
                </td>
            </tr>
            @include('mails.templates.footer')
        </tbody>
    </table>
</body>

</html>