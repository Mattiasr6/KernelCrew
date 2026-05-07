<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Certificado de Finalización - KernelLearn</title>
    <style>
        @page { margin: 0; size: A4 landscape; }
        body {
            margin: 0;
            padding: 0;
            width: 297mm;
            height: 210mm;
            font-family: 'Times New Roman', Times, serif;
            color: #1a1a2e;
            background: #faf9f6;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
        }

        /* Gold top/bottom bars */
        .gold-bar-top {
            position: absolute; top: 0; left: 0; right: 0;
            height: 7mm; background: #b8860b; z-index: 2;
        }
        .gold-bar-bottom {
            position: absolute; bottom: 0; left: 0; right: 0;
            height: 3mm; background: #d4af37; z-index: 2;
        }

        /* Outer frame */
        .outer-frame {
            position: absolute; top: 10mm; left: 10mm; right: 10mm; bottom: 10mm;
            border: 2.5px solid #b8860b; z-index: 1; pointer-events: none;
        }
        .inner-frame {
            position: absolute; top: 14mm; left: 14mm; right: 14mm; bottom: 14mm;
            border: 1px solid #d4af37; z-index: 1; pointer-events: none;
        }

        /* Corner ornaments */
        .corner {
            position: absolute; width: 28mm; height: 28mm; z-index: 2;
        }
        .corner-tl { top: 8.5mm; left: 8.5mm; border-top: 3px solid #b8860b; border-left: 3px solid #b8860b; }
        .corner-tr { top: 8.5mm; right: 8.5mm; border-top: 3px solid #b8860b; border-right: 3px solid #b8860b; }
        .corner-bl { bottom: 8.5mm; left: 8.5mm; border-bottom: 3px solid #b8860b; border-left: 3px solid #b8860b; }
        .corner-br { bottom: 8.5mm; right: 8.5mm; border-bottom: 3px solid #b8860b; border-right: 3px solid #b8860b; }

        /* Centered content using table (DOMPDF-safe) */
        .content-table {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            width: 100%; height: 100%;
            display: table;
            z-index: 3;
            pointer-events: none;
        }
        .content-cell {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            padding: 30mm 22mm 18mm 22mm;
            pointer-events: auto;
        }

        .logo {
            font-size: 30px; font-weight: 700; color: #b8860b;
            letter-spacing: 4px; text-transform: uppercase;
        }
        .logo span { color: #1a1a2e; font-weight: 300; }

        .divider {
            width: 100px; height: 1.5px; background: #d4af37;
            margin: 14px auto;
        }

        .cert-title {
            font-size: 14px; font-weight: 400; color: #6b5b3e;
            letter-spacing: 5px; text-transform: uppercase;
            margin-bottom: 18px;
        }

        .body-text { font-size: 14px; color: #4a4a4a; }

        .student-name {
            font-size: 40px; font-weight: 700; color: #1a1a2e;
            margin: 10px 0; letter-spacing: 1px;
        }

        .course-name {
            font-size: 20px; font-weight: 600; color: #b8860b;
            margin: 6px 0 12px 0; font-style: italic;
        }

        .details {
            font-size: 11px; color: #6b5b3e;
        }

        /* Signatures table */
        .signatures {
            margin: 24px auto 0 auto;
            text-align: center;
        }
        .signatures table { margin: 0 auto; border-collapse: separate; border-spacing: 40px 0; }
        .signatures td { width: 150px; text-align: center; }
        .sig-line {
            width: 100%; border-top: 1.5px solid #1a1a2e;
            margin-bottom: 4px; padding-top: 2px;
        }
        .sig-label { font-size: 10px; color: #6b5b3e; letter-spacing: 1px; text-transform: uppercase; }
        .sig-name { font-size: 12px; color: #1a1a2e; font-weight: 600; }

        /* Footer */
        .footer {
            position: absolute; bottom: 16mm; left: 0; right: 0;
            text-align: center; z-index: 4;
            font-size: 8px; color: #8a8a8a;
        }
        .footer .code { color: #b8860b; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 1px; }

        /* Seal badge */
        .seal {
            position: absolute; bottom: 26mm; right: 24mm; z-index: 4;
            width: 44px; height: 44px;
            border: 2px solid #d4af37; border-radius: 50%;
            text-align: center;
            font-size: 6.5px; color: #b8860b; font-weight: 700;
            line-height: 1.2; padding: 3px; box-sizing: border-box;
        }

        /* Watermark overlay positioned with negative margins so it stays inside page */
        .watermark {
            position: fixed; top: 50%; left: 50%;
            margin-left: -80mm; margin-top: -20mm;
            font-size: 120px; font-weight: 900;
            color: rgba(184, 134, 11, 0.04);
            letter-spacing: 10px; text-transform: uppercase;
            white-space: nowrap; z-index: 0;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div class="watermark">KERNEL LEARN</div>

    <div class="gold-bar-top"></div>
    <div class="gold-bar-bottom"></div>

    <div class="outer-frame"></div>
    <div class="inner-frame"></div>

    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="content-table">
        <div class="content-cell">
            <div class="logo">Kernel<span>Learn</span></div>
            <div class="divider"></div>
            <div class="cert-title">Certificado de Finalización</div>
            <div class="body-text">Se otorga el presente certificado a</div>
            <div class="student-name">{{ $user_name }}</div>
            <div class="body-text">por haber completado satisfactoriamente el curso</div>
            <div class="course-name">{{ $course_title }}</div>
            <div class="details">
                Duración: {{ $course_duration ?? '—' }} horas &nbsp;&bull;&nbsp; Emitido: {{ $issued_at }}
            </div>

            <div class="signatures">
                <table>
                    <tr>
                        <td>
                            <div class="sig-line"></div>
                            <div class="sig-label">Director Académico</div>
                            <div class="sig-name">{{ $instructor_name ?? 'KernelLearn' }}</div>
                        </td>
                        <td>
                            <div class="sig-line"></div>
                            <div class="sig-label">Instructor del Curso</div>
                            <div class="sig-name">{{ $instructor_name ?? '—' }}</div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>

    <div class="footer">
        Código de verificación: <span class="code">{{ $certificate_code }}</span>
        &nbsp;&bull;&nbsp; Valide en: https://kernellearn.com/verify/{{ $certificate_code }}
    </div>

    <div class="seal">
        {{ substr($certificate_code, 0, 8) }}
    </div>
</body>
</html>
