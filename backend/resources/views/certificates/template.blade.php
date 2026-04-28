<!DOCTYPE html>
<html>
<head>
    <title>Certificado de Finalización</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; text-align: center; padding: 50px; border: 10px solid #ccc; }
        h1 { font-size: 50px; }
        p { font-size: 20px; }
        .code { font-size: 12px; color: #777; margin-top: 50px; }
    </style>
</head>
<body>
    <h1>Certificado de Finalización</h1>
    <p>Este documento certifica que</p>
    <h2>{{ $user_name }}</h2>
    <p>ha completado satisfactoriamente el curso</p>
    <h3>{{ $course_title }}</h3>
    <p>Emitido el: {{ $issued_at }}</p>
    <div class="code">Código de Verificación: {{ $certificate_code }}</div>
</body>
</html>
