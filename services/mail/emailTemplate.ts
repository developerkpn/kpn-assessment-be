// SEND BODY TO THIS FUNCTION PARAMETER
import moment from "moment";

export function emailTemplate(title: string, body: string, email_contact: string) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>KPN Online Assessment Platform - ${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f8f9fa; /* --bs-bg-light */
          font-family: Arial, sans-serif;
        }

        h1 {
          color: #b91f27;
        }

        .container {
          width: 100%;
          max-width: 600px;
          margin: auto;
          background-color: #ffffff; /* White background for content area */
          border: 1px solid #e9ecef; /* --bs-footer-bg */
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
          background-color: #b91f27;
          color: #f8f9fa;
          padding: 10px 20px;
          border-radius: 8px 8px 0 0;
        }

        .body {
          padding: 10px 20px;
          color: #212529; /* --bs-body-color */

          font-size: 16px;
        }

        .footer {
          background-color: #e9ecef; /* --bs-footer-bg */
          color: #343a40; /* --bs-bg-dark */
          text-align: center;
          padding: 10px;
          font-size: 14px;
          padding-bottom: 20px;
        }

        .btn {
          display: inline-block;
          padding: 10px 20px;
          margin: 10px 0;
          margin-right: 20px;
          font-size: 16px;
          text-align: center;
          text-decoration: none;
          border-radius: 5px;
        }

        .btn-primary {
          background-color: #b91f27;
          color: #ffffff !important;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: #ffffff !important;
        }

        .btn-danger {
          background-color: #5d0f0f;
          color: #ffffff !important;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>KPN Assessment</h2>
        </div>
        <div class="body">
          <h1>${title}</h1>
          ${body}
        </div>
        <div class="footer">
          <p>&copy; ${moment().format("YYYY")} KPN Corp. All Rights Reserved.</p>
          <a href="mailto:${email_contact}" style="color: #343a40">Contact Us</a>
        </div>
      </div>
    </body>
  </html>

  `;
}

export function generateTable(rows: { label: string; value: string }[]): string {
  const tableRows = rows
    .map(
      (row) => `
        <tr>
          <td style="width:25%">${row.label}</td>
          <td>${row.value}</td>
        </tr>
      `
    )
    .join("");

  return `
    <table style="width: 100%">
      ${tableRows}
    </table>
  `;
}

export function generateButton(
  href: string,
  title: string,
  variant: "primary" | "secondary" | "danger" = "secondary"
): string {
  const buttonClass = `btn btn-${variant}`;
  return `<a href="${href}" class="${buttonClass}">${title}</a>`;
}
