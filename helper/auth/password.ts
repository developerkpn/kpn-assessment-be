import bcryptjs from "bcryptjs";
const { compareSync, hash } = bcryptjs;
export async function hashPassword(password: string) {
  const saltRounds = 10;

  const hashedPassword = new Promise((resolve, reject) => {
    hash(password, saltRounds, function (error, hash) {
      if (error) reject(error);
      resolve(hash);
    });
  });

  return hashedPassword;
}

export async function validatePassword(password: string, hashed: string) {
  return compareSync(password, hashed);
}
