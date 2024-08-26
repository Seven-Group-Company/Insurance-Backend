import { prisma } from "../src/utils/context";
import speakeasy from "speakeasy";
import { generateQR } from "../src/utils/qr-codeGenerator";

const seedUser = async () => {
  try {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `SGC-Insurance (admin@admin.com)`,
      issuer: "SGC-Insurance",
    });

    await prisma.users.create({
      data: {
        id: 1,
        email: "admin@admin.com",
        name: "Seven Group Company",
        userType: "admin",
        createdBy: 1,
        mfa: {
          create: {
            mfaSecret: secret.base32,
            mfaQrCode: await generateQR(secret.otpauth_url),
            mfaEnabled: false,
          },
        },
        employeeInfo: {
          create: {
            id: 1,
            firstName: "Super",
            lastName: "Admin",
          },
        },
      },
    });
  } catch (error) {
    return error;
  }
};

seedUser()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
