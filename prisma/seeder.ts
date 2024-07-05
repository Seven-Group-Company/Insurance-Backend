import { prisma } from "../src/utils/context";
import { hashPassword } from "../src/utils/hashPasswords";
import * as dotenv from "dotenv";
dotenv.config();

const seedUser = async () => {
  await prisma.users.create({
    data: {
      name: "John Doe",
      email: process.env.USER_SEED_EMAIL,
      password: await hashPassword(process.env.USER_PASSWORD),
    },
  });
  return "seed successful";
};

seedUser();
