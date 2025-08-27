import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, `./${process.env.NODE_ENV}.env`) });

export const emailTemplateHTML = `
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
                font-size: 10pt;
            }

            .title {
                font-size: 24pt;
                font-weight: bold;
            }

            .section-detail {
                font-size: 12pt;
                font-weight: bold;
            }

            .body-content {
                word-wrap: break-word;
                white-space: normal;
            }

            .section-detail > td {
                padding: 0.1em 2.5em;
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
            *[x-apple-data-detectors],
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
                padding-top: 12px;
                padding-bottom: 12px;
                padding-left: 10px;
                padding-right: 10px;
                text-align: left;
                font-size: 8pt;
                background-color: #800000;
                color: white;
            }

            #tabledet td {
                font-size: 8pt;
                padding: 1rem;
                font-weight: 800;
                color: rgb(0, 0, 0);
                width: 100px;
                border: 1px solid white;
                background-color: #ffd1d1;
                border-collapse: collapse;
            }

            #tabledet tr {
                background-color: #f2f2f2;
            }

            /* iOS specific fixes */
            @media only screen and (max-width: 600px) {
                .email-container {
                    width: 100% !important;
                    max-width: 100% !important;
                }
                
                .responsive-table {
                    width: 100% !important;
                }
                
                .responsive-td {
                    display: block !important;
                    width: 100% !important;
                    text-align: left !important;
                    padding: 0.5em 1em !important;
                }
                
                .detail-row {
                    display: block !important;
                    width: 100% !important;
                }
                
                .detail-label {
                    display: block !important;
                    width: 100% !important;
                    font-weight: bold !important;
                    margin-bottom: 0.2em !important;
                }
                
                .detail-separator {
                    display: none !important;
                }
                
                .detail-value {
                    display: block !important;
                    width: 100% !important;
                    margin-bottom: 1em !important;
                }
                
                .title {
                    font-size: 18pt !important;
                }
                
                .section-detail {
                    font-size: 14pt !important;
                }
                
                .detail {
                    font-size: 12pt !important;
                }
            }

            /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
            @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
                u ~ div .email-container {
                    min-width: 320px !important;
                }
            }
            /* iPhone 6, 6S, 7, 8, and X */
            @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
                u ~ div .email-container {
                    min-width: 375px !important;
                }
            }
            /* iPhone 6+, 7+, and 8+ */
            @media only screen and (min-device-width: 414px) {
                u ~ div .email-container {
                    min-width: 414px !important;
                }
            }
        </style>

        <!-- Progressive Enhancements -->
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
                <!-- Main Content Table -->
                <table
                    align="center"
                    role="presentation"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    width="100%"
                    style="margin: auto; width: 100%;"
                    class="bg_white responsive-table"
                >
                    <!-- Logo Section -->
                    <tr>
                        <td
                            valign="top"
                            class="bg_white"
                            style="padding: 1em 2.5em; width: 100%;"
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
                                            src="${process.env.APP_URL}/api/static/kpn-logo-2.png"
                                            style="max-width: 200px; height: auto;"
                                        />
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Body Content -->
                    <tr>
                        <td
                            valign="top"
                            class="body-content bg_white responsive-td"
                            style="padding: 1em 2.5em; width: 100%;"
                        >
                            <h1 class="title">{{title}}</h1>
                            <p style="word-wrap: break-word; white-space: normal;">{{{header}}}</p>
                            <p style="word-wrap: break-word; white-space: normal;">{{{body}}}</p>
                        </td>
                    </tr>
                    
                    <!-- Assessment Details Header -->
                    <tr>
                        <td class="bg_white" style="width: 100%;">
                            <table class="bg_white responsive-table" width="100%">
                                <tr class="section-detail">
                                    <td style="padding: 0.5em 2.5em;">Assessment Details</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Assessment Details Content -->
                    <tr>
                        <td class="bg_white" style="width: 100%;">
                            <table class="bg_white responsive-table" width="100%">
                                <tr class="detail detail-row">
                                    <td class="detail-label" style="padding: 0.1em 2.5em; width: 20%;">
                                        Batch Name
                                    </td>
                                    <td class="detail-separator" style="padding: 0.1em 0.5em; width: 1%;">
                                        :
                                    </td>
                                    <td class="detail-value" style="padding: 0.1em 2.5em;">
                                        {{batch_name}}
                                    </td>
                                </tr>
                                <tr class="detail detail-row">
                                    <td class="detail-label" style="padding: 0.1em 2.5em; width: 20%;">
                                        Batch Code
                                    </td>
                                    <td class="detail-separator" style="padding: 0.1em 0.5em; width: 1%;">
                                        :
                                    </td>
                                    <td class="detail-value" style="padding: 0.1em 2.5em;">
                                        {{batch_code}}
                                    </td>
                                </tr>
                                <tr class="detail detail-row">
                                    <td class="detail-label" style="padding: 0.1em 2.5em; width: 20%;">
                                        Business Unit
                                    </td>
                                    <td class="detail-separator" style="padding: 0.1em 0.5em; width: 1%;">
                                        :
                                    </td>
                                    <td class="detail-value" style="padding: 0.1em 2.5em;">
                                        {{bu_name}}
                                    </td>
                                </tr>
                                <tr class="detail detail-row">
                                    <td class="detail-label" style="padding: 0.1em 2.5em; width: 20%;">
                                        Purpose
                                    </td>
                                    <td class="detail-separator" style="padding: 0.1em 0.5em; width: 1%;">
                                        :
                                    </td>
                                    <td class="detail-value" style="padding: 0.1em 2.5em;">
                                        {{fm_name}}
                                    </td>
                                </tr>
                                <tr class="detail detail-row">
                                    <td class="detail-label" style="padding: 0.1em 2.5em; width: 20%;">
                                        Start Period
                                    </td>
                                    <td class="detail-separator" style="padding: 0.1em 0.5em; width: 1%;">
                                        :
                                    </td>
                                    <td class="detail-value" style="padding: 0.1em 2.5em;">
                                        {{start_period}}
                                    </td>
                                </tr>
                                <tr class="detail detail-row">
                                    <td class="detail-label" style="padding: 0.1em 2.5em; width: 20%;">
                                        End Period
                                    </td>
                                    <td class="detail-separator" style="padding: 0.1em 0.5em; width: 1%;">
                                        :
                                    </td>
                                    <td class="detail-value" style="padding: 0.1em 2.5em;">
                                        {{end_period}}
                                    </td>
                                </tr>
                                <tr class="detail detail-row">
                                    <td class="detail-label" style="padding: 0.1em 2.5em; width: 20%;">
                                        Link
                                    </td>
                                    <td class="detail-separator" style="padding: 0.1em 0.5em; width: 1%;">
                                        :
                                    </td>
                                    <td class="detail-value" style="padding: 0.1em 2.5em;">
                                        <a href="{{batch_link}}" style="color: #2f89fc; text-decoration: none;">Click this link</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="3" style="padding-top: 1rem;"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer Content -->
                    <tr>
                        <td
                            valign="top"
                            class="bg_white responsive-td"
                            style="padding: 1em 2.5em; width: 100%;"
                        >
                            <p style="word-wrap: break-word; white-space: normal;">{{{footer}}}</p>
                        </td>
                    </tr>
                </table>
                
                <!-- Copyright Footer -->
                <table
                    align="center"
                    role="presentation"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    width="100%"
                    style="margin: auto; width: 100%;"
                    class="responsive-table"
                >
                    <tr>
                        <td
                            valign="middle"
                            class="bg_black footer email-section"
                            style="color: rgba(255, 255, 255, 0.5); text-align: center; padding: 1.5em;"
                        >
                            <table width="100%">
                                <tr>
                                    <td style="text-align: center; color: rgba(255, 255, 255, 0.5);">
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
