import pkg from "bcrypt";

export const hashPassword = async (password: string) => {
  return await pkg.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  return await pkg.compare(password, hashedPassword);
};
