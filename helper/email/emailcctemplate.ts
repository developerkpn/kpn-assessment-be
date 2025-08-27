export const emailCCTemplate = `
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Notification</title>
    <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap"
            rel="stylesheet"
    />
    <style>
        html,
        body {
            margin: 0 auto !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
            background: #f1f1f1;
        }

        /* What it does: Stops email clients resizing small text. */
        * {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }

        /* What it does: Centers email on Android 4.4 */
        div[style*="margin: 16px 0"] {
            margin: 0 !important;
        }

        /* What it does: Stops Outlook from adding extra spacing to tables. */
        table,
        td {
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }

        .detail {
            font-size: 14px !important;
        }

        .title {
            font-size: 24px !important;
            font-weight: bold;
        }

        .section-detail {
            font-size: 16px !important;
            font-weight: bold;
        }

        .body-content {
            word-wrap: break-word;
            white-space: normal
        }

        .section-detail > td {
            padding: 0.5em 2.5em !important;
        }

        /* What it does: Fixes webkit padding issue. */
        table {
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            margin: 0 auto !important;
        }

        /* What it does: Uses a better rendering method when resizing images in IE. */
        img {
            -ms-interpolation-mode: bicubic;
            max-width: 100% !important;
            height: auto !important;
        }

        /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
        a {
            text-decoration: none;
        }

        /* What it does: A work-around for email clients meddling in triggered links. */
        *[x-apple-data-detectors],  /* iOS */
        .unstyle-auto-detected-links *,
        .aBn {
            border-bottom: 0 !important;
            cursor: default !important;
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
        .a6S {
            display: none !important;
            opacity: 0.01 !important;
        }

        /* What it does: Prevents Gmail from changing the text color in conversation threads. */
        .im {
            color: inherit !important;
        }

        /* If the above doesn't work, add a .g-img class to any image in question. */
        img.g-img + div {
            display: none !important;
        }

        #tabledet {
            width: 100%;
            overflow: scroll;
            background-color: #f2f2f2;
        }

        #tabledet th {
            padding: 12px 10px !important;
            text-align: left;
            font-size: 12px !important;
            background-color: #800000;
            color: white;
        }

        #tabledet td {
            font-size: 12px !important;
            padding: 1rem !important;
            font-weight: 800;
            color: rgb(0, 0, 0);
            border: 1px solid white;
            background-color: #ffd1d1;
            border-collapse: collapse;
        }

        #tabledet tr {
            background-color: #f2f2f2;
        }

        /* iOS Mail specific fixes */
        @media only screen and (max-device-width: 480px) {
            .email-container {
                width: 100% !important;
                max-width: 100% !important;
            }
            
            .detail {
                font-size: 16px !important;
            }
            
            .title {
                font-size: 28px !important;
            }
            
            .section-detail {
                font-size: 18px !important;
            }
            
            .section-detail > td {
                padding: 0.8em 1.5em !important;
            }
            
            table[class="bg_white"] {
                width: 100% !important;
            }
            
            td[style*="padding: 0.1em 2.5em"] {
                padding: 0.5em 1.5em !important;
            }
        }

        /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
        @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
            u ~ div .email-container {
                min-width: 320px !important;
                width: 100% !important;
            }
        }
        /* iPhone 6, 6S, 7, 8, and X */
        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
            u ~ div .email-container {
                min-width: 375px !important;
                width: 100% !important;
            }
        }
        /* iPhone 6+, 7+, and 8+ */
        @media only screen and (min-device-width: 414px) {
            u ~ div .email-container {
                min-width: 414px !important;
                width: 100% !important;
            }
        }
        
        /* Additional iOS fixes */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                max-width: 100% !important;
            }
            
            table[role="presentation"] {
                width: 100% !important;
            }
            
            .logo img {
                width: 60% !important;
                max-width: 200px !important;
            }
            
            .detail td {
                font-size: 14px !important;
                padding: 0.5em 1em !important;
            }
            
            .body-content {
                font-size: 16px !important;
                line-height: 1.6 !important;
            }
        }
    </style>

    <!-- CSS Reset : END -->

    <!-- Progressive Enhancements : BEGIN -->
    <style>
        .primary {
            background: #2f89fc;
        }
        .bg_white {
            background: #ffffff;
        }
        .bg_light {
            background: #fafafa;
        }
        .bg_black {
            background: #000000;
        }
        .bg_dark {
            background: rgba(0, 0, 0, 0.8);
        }
        .email-section {
            padding: 2.5em;
        }

        /*BUTTON*/
        .btn {
            padding: 5px 15px;
            display: inline-block;
        }
        .btn.btn-primary {
            border-radius: 5px;
            background: #2f89fc;
            color: #ffffff;
        }
        .btn.btn-primary:hover {
            border-radius: 5px;
            background: #509cff;
            color: #ffffff;
        }
        .btn.btn-white {
            border-radius: 5px;
            background: #ffffff;
            color: #000000;
        }
        .btn.btn-white-outline {
            border-radius: 5px;
            background: transparent;
            border: 1px solid #fff;
            color: #fff;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            font-family: "Montserrat", sans-serif;
            color: #000000;
            margin-top: 0;
            font-weight: 400;
        }

        body {
            font-family: "Montserrat", sans-serif;
            font-weight: 400;
            font-size: 15px;
            line-height: 1.8;
            color: #000000;
        }

        a {
            color: #2f89fc;
        }

        table {
        }
        /*LOGO*/

        .logo h1 {
            margin: 0;
        }
        .logo h1 a {
            color: #000000;
            font-size: 20px;
            font-weight: 700;
            text-transform: uppercase;
            font-family: "Montserrat", sans-serif;
        }

        .navigation {
            padding: 0;
        }
        .navigation li {
            list-style: none;
            display: inline-block;
            margin-left: 5px;
            font-size: 13px;
            font-weight: 500;
        }
        .navigation li a {
            color: rgba(0, 0, 0, 0.4);
        }

        /*HERO*/
        .hero {
            position: relative;
            z-index: 0;
        }

        .hero .text {
            color: rgba(0, 0, 0, 0.3);
        }
        .hero .text h2 {
            color: #000;
            font-size: 30px;
            margin-bottom: 0;
            font-weight: 300;
        }
        .hero .text h2 span {
            font-weight: 600;
            color: #2f89fc;
        }

        /*HEADING SECTION*/
        .heading-section {
        }
        .heading-section h2 {
            color: #000000;
            font-size: 28px;
            margin-top: 0;
            line-height: 1.4;
            font-weight: 400;
        }
        .heading-section .subheading {
            margin-bottom: 20px !important;
            display: inline-block;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: rgba(0, 0, 0, 0.4);
            position: relative;
        }
        .heading-section .subheading::after {
            position: absolute;
            left: 0;
            right: 0;
            bottom: -10px;
            content: "";
            width: 100%;
            height: 2px;
            background: #2f89fc;
            margin: 0 auto;
        }

        .heading-section-white {
            color: rgba(255, 255, 255, 0.8);
        }
        .heading-section-white h2 {
            line-height: 1;
            padding-bottom: 0;
        }
        .heading-section-white h2 {
            color: #ffffff;
        }
        .heading-section-white .subheading {
            margin-bottom: 0;
            display: inline-block;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: rgba(255, 255, 255, 0.4);
        }

        /*FOOTER*/

        .footer {
            color: rgba(255, 255, 255, 0.5);
        }
        .footer .heading {
            color: #ffffff;
            font-size: 20px;
        }
        .footer ul {
            margin: 0;
            padding: 0;
        }
        .footer ul li {
            list-style: none;
            margin-bottom: 10px;
        }
        .footer ul li a {
            color: rgba(255, 255, 255, 1);
        }

        @media screen and (max-width: 500px) {
            .email-section {
                padding: 1.5em !important;
            }
        }
    </style>
</head>
<body
        width="100%"
        style="
            margin: 0;
            padding: 0 !important;
            mso-line-height-rule: exactly;
            background-color: #f1f1f1;
        "
>
<center style="width: 100%; background-color: #f1f1f1">
    <div
            style="max-width: 600px; margin: 0 auto; width: 100%;"
            class="email-container"
    >
        <table
                align="center"
                role="presentation"
                cellspacing="0"
                cellpadding="0"
                border="0"
                width="100%"
                style="margin: auto"
                class="bg_white"
        >
            <tr>
                <td
                        valign="top"
                        class="bg_white"
                        style="padding: 1em 2.5em"
                >
                    <table
                            role="presentation"
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            width="100%"
                    >
                        <tr>
                            <td class="logo" style="text-align: left">
                                <img
                                        width="40%"
                                        style="max-width: 200px; height: auto; display: block;"
                                        src="${process.env.APP_URL}/api/static/kpn-logo-2.png"
                                        alt="KPN Corp Logo"
                                />
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td
                        valign="top"
                        class="body-content bg_white"
                        style="padding: 1em 2.5em"
                >
                    <h1 class="title" style="margin: 0 0 1em 0; font-size: 24px; font-weight: bold;">Assessment's Published</h1>
                    <p style="word-wrap: break-word; white-space: normal; font-size: 15px; line-height: 1.6; margin: 0 0 1em 0;">Dear HR Team,</p>
                    <p style="word-wrap: break-word; white-space: normal; font-size: 15px; line-height: 1.6; margin: 0 0 1em 0;">We would like to inform you that batch with details below is already published. Please check Assessment Website to see more details.</p>
                </td>
            </tr>
            <tr>
                <td class="bg_white" style="padding: 0;">
                    <table class="bg_white" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr class="section-detail">
                            <td style="padding: 0.5em 2.5em; font-size: 16px; font-weight: bold;">Assessment Details</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class="bg_white" style="padding: 0;">
                    <table class="bg_white" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr class="detail">
                            <td style="padding: 0.5em 2.5em; font-size: 14px; width: 35%; vertical-align: top;">
                                Batch Name
                            </td>
                            <td style="padding: 0.5em 0.5em; font-size: 14px; width: 2%; vertical-align: top;">
                                :
                            </td>
                            <td style="padding: 0.5em 2.5em 0.5em 0; font-size: 14px; vertical-align: top;">
                                {{batch_name}}
                            </td>
                        </tr>
                        <tr class="detail">
                            <td style="padding: 0.5em 2.5em; font-size: 14px; width: 35%; vertical-align: top;">
                                Batch Code
                            </td>
                            <td style="padding: 0.5em 0.5em; font-size: 14px; width: 2%; vertical-align: top;">
                                :
                            </td>
                            <td style="padding: 0.5em 2.5em 0.5em 0; font-size: 14px; vertical-align: top;">
                                {{batch_code}}
                            </td>
                        </tr>
                        <tr class="detail">
                            <td style="padding: 0.5em 2.5em; font-size: 14px; width: 35%; vertical-align: top;">
                                Business Unit
                            </td>
                            <td style="padding: 0.5em 0.5em; font-size: 14px; width: 2%; vertical-align: top;">
                                :
                            </td>
                            <td style="padding: 0.5em 2.5em 0.5em 0; font-size: 14px; vertical-align: top;">
                                {{bu_name}}
                            </td>
                        </tr>
                        <tr class="detail">
                            <td style="padding: 0.5em 2.5em; font-size: 14px; width: 35%; vertical-align: top;">
                                Purpose
                            </td>
                            <td style="padding: 0.5em 0.5em; font-size: 14px; width: 2%; vertical-align: top;">
                                :
                            </td>
                            <td style="padding: 0.5em 2.5em 0.5em 0; font-size: 14px; vertical-align: top;">
                                {{fm_name}}
                            </td>
                        </tr>
                        <tr class="detail">
                            <td style="padding: 0.5em 2.5em; font-size: 14px; width: 35%; vertical-align: top;">
                                Start Period
                            </td>
                            <td style="padding: 0.5em 0.5em; font-size: 14px; width: 2%; vertical-align: top;">
                                :
                            </td>
                            <td style="padding: 0.5em 2.5em 0.5em 0; font-size: 14px; vertical-align: top;">
                                {{start_period}}
                            </td>
                        </tr>
                        <tr class="detail">
                            <td style="padding: 0.5em 2.5em; font-size: 14px; width: 35%; vertical-align: top;">
                                End Period
                            </td>
                            <td style="padding: 0.5em 0.5em; font-size: 14px; width: 2%; vertical-align: top;">
                                :
                            </td>
                            <td style="padding: 0.5em 2.5em 0.5em 0; font-size: 14px; vertical-align: top;">
                                {{end_period}}
                            </td>
                        </tr>
                        <tr class="detail">
                            <td style="padding: 0.5em 2.5em; font-size: 14px; width: 35%; vertical-align: top;">
                                Total of Assessees
                            </td>
                            <td style="padding: 0.5em 0.5em; font-size: 14px; width: 2%; vertical-align: top;">
                                :
                            </td>
                            <td style="padding: 0.5em 2.5em 0.5em 0; font-size: 14px; vertical-align: top;">
                                {{total_assessee}}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top: 1rem" colspan="3"></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td
                        valign="top"
                        class="bg_white"
                        style="padding: 1em 2.5em">
                    <p style="word-wrap: break-word; white-space: normal; font-size: 15px; line-height: 1.6; margin: 0;">Thank you!</p>
                </td>
            </tr>
        </table>
        <table
                align="center"
                role="presentation"
                cellspacing="0"
                cellpadding="0"
                border="0"
                width="100%"
                style="margin: auto"
        >
            <tr>
                <td
                        valign="middle"
                        class="bg_black footer email-section"
                        style="padding: 2.5em; text-align: center;"
                >
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="color: rgba(255, 255, 255, 0.8); font-size: 14px; text-align: center;">
                                KPN Corp Copyright 2025
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</center>
</body>
</html>
`;
