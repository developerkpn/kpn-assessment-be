import { createTransport, Transporter } from "nodemailer";
import { emailTemplate, generateButton, generateTable } from "./emailTemplate.js";
import { ClientAction } from "@/helper/queryBuilder.js";

type newAccountData = {
  fullname: string;
  username: string;
  password: string;
  role: string;
};

export class Emailer {
  private tp: Transporter;

  constructor() {
    this.tp = createTransport({
      name: "kpndomain.com",
      host: process.env.SMTP_HOST,
      secure: true,
      port: Number(process.env.SMPT_PORT) || 0,
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
      auth: {
        user: `${process.env.SMTP_USERNAME}`,
        pass: `${process.env.SMTP_PASSWORD}`,
      },
      pool: true,
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    const setup = {
      from: process.env.SMTP_USERNAME,
      to,
      subject,
      html,
    };

    try {
      const send = await this.tp.sendMail(setup);
      console.log(send);
      return to;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  generateSubject(title: string): string {
    return `KPN Online Assessment Platform - ${title}`;
  }

  // EMAILER METHODS
  async newAccount(data: newAccountData, emailTarget: string) {
    const title = "Welcome!";
    //get email contact
    const emailcontact = await ClientAction(async (client) => {
      try {
        const { rows: data_contact } = await client.query(
          "select email_dt from mst_email_contact where is_active = true"
        );
        return data_contact[0].email_dt ?? "Assessmentcenter@kpn-corp.com";
      } catch (error) {
        throw error;
      }
    });
    const html = emailTemplate(
      title,
      `
      <p>Hello, ${data.fullname}</p>
      <p>Your user credential have created to access KPN Online Assessment Platform as an Admin</p>
      <p>Here's your credential:</p>
      ${generateTable([
        { label: "Full Name", value: data.fullname },
        { label: "Username", value: data.username },
        { label: "Email", value: emailTarget },
        { label: "Password", value: data.password },
        { label: "Role", value: data.role },
      ])}
      <p>Please contact the Talent Management Corp Team in case you forget your password</p>

      ${generateButton(`${process.env.APP_URL}/admin-login`, "Login", "primary")}
      `,
      emailcontact
    );

    const subject = this.generateSubject(title);
    return this.sendEmail(emailTarget, subject, html);
  }

  async otpResetPass(otpCode: string | Date, emailTarget: string) {
    const title = "Reset Password Request";
    const emailcontact = await ClientAction(async (client) => {
      try {
        const { rows: data_contact } = await client.query(
          "select email_dt from mst_email_contact where is_active = true"
        );
        return data_contact[0].email_dt ?? "Assessmentcenter@kpn-corp.com";
      } catch (error) {
        throw error;
      }
    });
    const html = emailTemplate(
      title,
      `
      <p>This is your OTP Code:</p>
      <h2>${otpCode}</h2>
      <p>This code will expire after 5 minutes. Please insert the code before expiry time.</p>
      <p>Ignore this email if you didn't request to change password.</p>
      `,
      emailcontact
    );

    const subject = this.generateSubject(title);
    return this.sendEmail(emailTarget, subject, html);
  }
}
