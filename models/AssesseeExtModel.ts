// get all data assessee extern
// get detail assessee extern
// update detail assessee (just nik)
// reset password assessee extern
// disable assessee extern
import { TRANSACTION } from "@/config/transaction.js";
import { ClientAction, updateQuery } from "@/helper/queryBuilder.js";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { Emailer } from "@/services/mail/Emailer.js";
import { emailTemplate, generateButton, generateTable } from "@/services/mail/emailTemplate.js";
import { hashPassword } from "@/helper/auth/password.js";
import moment from "moment";

type TokenResetPass = {
  user_id?: string;
  name?: string;
  email?: string;
};

const AssesseeExt = {
  GetAllDataAssesseeExt: async (qusername: string) => {
    return await ClientAction(async (client) => {
      try {
        let where = "";
        let whereval: string[] = [];
        if (qusername) {
          where = "where name like $1";
          whereval = [`%${qusername}%`];
        }
        const sql = `
        select id, name, email, gender, phone, education, institution, date_of_birth from mst_user_extern ${where}
        `;
        const { rows: assessee } = await client.query(sql, whereval);
        return assessee;
      } catch (error) {
        throw error;
      }
    });
  },
  GetAssesseeExtbyID: async (id: string) => {
    return await ClientAction(async (client) => {
      try {
        let where = "";
        let whereval: string[] = [];
        if (id) {
          where = "where id = $1";
          whereval = [id];
        }
        const sql = `select id, name, email, gender, phone, education, institution, date_of_birth, nik from mst_user_extern ${where}`;
        const { rows: data_assessee } = await client.query(sql, whereval);
        return data_assessee[0];
      } catch (error) {
        throw error;
      }
    });
  },
  UpdateNIKAssesseeExt: async (user_id: string, nik: string) => {
    return await ClientAction(async (client) => {
      try {
        const { rowCount } = await client.query(`select id from mst_user_extern where id = $1`, [user_id]);
        if (!rowCount) {
          throw new Error("User not found");
        }
        const [upque, upval] = updateQuery("mst_user_extern", { nik: nik }, { id: user_id });
        await client.query(TRANSACTION.BEGIN);
        await client.query(upque, upval);
        await client.query(TRANSACTION.COMMIT);
        return true;
      } catch (error) {
        await client.query(TRANSACTION.ROLLBACK);
        throw error;
      }
    });
  },

  EmailResetPassword: async (user_id: string, assignee: string) => {
    return await ClientAction(async (client) => {
      try {
        const { rows, rowCount } = await client.query(
          `select id, name, email, token_reset_pwd from mst_user_extern where id = $1 `,
          [user_id]
        );
        if (!rowCount) {
          throw new Error("User not found");
        }
        const data = rows[0];
        let token_reset_pwd = rows[0]?.token_reset_pwd;
        let jwtinvalid = false;
        if (token_reset_pwd) {
          //check token validity if exist
          jwt.verify(token_reset_pwd, process.env.SECRETJWT ?? "", (err: any, decoded: any) => {
            if (err && (err as JsonWebTokenError).name == "TokenExpiredError") {
              jwtinvalid = true;
            }
          });
          if (!jwtinvalid) {
            throw new Error("Token already assigned, please wait after 5 minutes");
          }
        }
        const encodejwt = jwt.sign(
          {
            user_id: user_id,
            name: rows[0].name,
            email: rows[0].email,
          },
          process.env.SECRETJWT ?? "",
          {
            expiresIn: "5m",
          }
        );
        await client.query(TRANSACTION.BEGIN);
        const [queup, valup] = updateQuery(
          "mst_user_extern",
          {
            token_reset_pwd: encodejwt,
            last_token_assigned: moment().utc().toISOString(),
            token_assigned_by: assignee,
          },
          {
            id: user_id,
          }
        );
        await client.query(queup, valup);

        //send email
        const Email = new Emailer();
        const { rows: data_contact } = await client.query(
          "select email_dt from mst_email_contact where is_active = true"
        );
        const emailcontact = data_contact[0].email_dt ?? "Assessmentcenter@kpn-corp.com";
        const html = emailTemplate(
          "Reset Password User Extern",
          `
          <p>Hello, ${data.name}</p>
                <p>If you receive this email, it means you're allowed to reset your password by Admin</p>
                <p>To make sure this is you, please verify this data :</p>
                ${generateTable([
                  { label: "Name", value: data.name },
                  { label: "Email", value: data.email },
                ])}
                <p>Reset password session expired until 5 minutes since this email received. Reset your password by click this button</p>
                ${generateButton(`${process.env.APP_URL}/reset-client/${encodejwt}`, "Reset", "primary")}
          `,
          emailcontact
        );
        await Email.sendEmail(data.email, "Email Reset Password User Extern", html);
        await client.query(TRANSACTION.COMMIT);
        return data.name;
      } catch (error) {
        throw error;
      }
    });
  },
  VerifyToken: async (token: string) => {
    return await ClientAction(async (client) => {
      try {
        await client.query(TRANSACTION.BEGIN);
        let jwtvalid = true;
        let decoded_token: TokenResetPass = {};
        jwt.verify(token, process.env.SECRETJWT ?? "", (err: any, decoded: any) => {
          console.log(err);
          if (err && (err as JsonWebTokenError).name == "TokenExpiredError") {
            jwtvalid = false;
          } else {
            decoded_token = decoded as TokenResetPass;
          }
        });
        if (!jwtvalid) {
          decoded_token = (await jwt.verify(token, process.env.SECRETJWT ?? "", {
            ignoreExpiration: true,
          })) as TokenResetPass;
          const [upque, upval] = updateQuery(
            "mst_user_extern",
            { token_reset_pwd: null },
            { id: decoded_token?.user_id }
          );
          await client.query(upque, upval);
          await client.query(TRANSACTION.COMMIT);
          return {
            status: false,
            user_id: "",
            email: "",
            name: "",
          };
        }
        const { rows, rowCount } = await client.query(`select email, name from mst_user_extern where id = $1`, [
          decoded_token.user_id,
        ]);
        if (!rowCount) {
          throw new Error("User not found");
        }
        return {
          status: true,
          user_id: decoded_token?.user_id,
          email: rows[0].email,
          name: rows[0].name,
        };
      } catch (error) {
        await client.query(TRANSACTION.ROLLBACK);
        throw error;
      }
    });
  },

  SetNewPassword: async (password: string, user_id: string) => {
    return await ClientAction(async (client) => {
      try {
        await client.query(TRANSACTION.BEGIN);
        const encodedpass = await hashPassword(password);
        const payload = {
          password: encodedpass,
          token_reset_pwd: null,
          update_at: moment().utc().toISOString(),
        };
        const [upque, upval] = updateQuery("mst_user_extern", payload, {
          id: user_id,
        });
        await client.query(upque, upval);
        await client.query(TRANSACTION.COMMIT);
        return true;
      } catch (error) {
        await client.query(TRANSACTION.ROLLBACK);
        throw error;
      }
    });
  },
};

export default AssesseeExt;
