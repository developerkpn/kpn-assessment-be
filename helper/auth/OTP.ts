import { db } from "@/config/connection.js";
import bcrypt from "bcryptjs"; // ✅

const { compareSync, genSaltSync, hashSync } = bcrypt;
import { generate } from "otp-generator";
import { deleteQuery } from "../queryBuilder.js";

export const createOTP = () => {
  try {
    const OTP = generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    let validUntil = new Date();
    validUntil.setMinutes(validUntil.getMinutes() + 5);
    const salt = genSaltSync(10);
    const encodedOTP = hashSync(OTP, salt);
    return [OTP, encodedOTP, validUntil];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const validateOTP = async (otpInput: string, email: string) => {
  const client = await db.connect();
  try {
    const getOTP = await client.query("SELECT * from otp_trans where email = $1", [email]);
    const data = getOTP.rows;
    if (data.length === 0) {
      throw new Error("Please register first");
    }
    const otpHashed = data[0].otp_code;
    const otpTimeLimit = new Date(data[0].valid_until);
    const now = new Date();
    console.log(otpTimeLimit, now);
    if (now > otpTimeLimit) {
      const [cleanOtp, otpValue] = deleteQuery("otp_trans", { email: email });
      await client.query(cleanOtp, otpValue);
      throw new Error("OTP Expired: Please request again");
    }
    const compareOTP = compareSync(otpInput, otpHashed);
    if (!compareOTP) {
      throw new Error("OTP not valid");
    }
    return compareOTP;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

const validateToken = async (otpInput: string, email: string) => {
  const client = await db.connect();
  try {
    const getOTP = await client.query("SELECT * from otp_trans where email = $1", [email]);
    const data = getOTP.rows;
    if (data.length === 0) {
      throw new Error("Please register first");
    }
    const otpHashed = data[0].otp_code;
    const compareOTP = compareSync(otpInput, otpHashed);
    if (!compareOTP) {
      throw new Error("OTP not valid");
    }
    return compareOTP;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};
