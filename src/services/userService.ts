import { Request, Response } from "express";
import { prisma } from "../utils/context";
import JWT from "jsonwebtoken";
import speakeasy from "speakeasy";
import { sendEmail } from "../utils/emailService";
import {
  UserInterface,
  UserResponse,
} from "../utils/Interfaces/userInterfaces";
import { userSchema } from "../utils/Validators/userValidator";
import { stringify } from "querystring";
import { otpTemplate } from "../utils/emailTemplates/OTPTemplate";
import { generateQR } from "../utils/qr-codeGenerator";
import { userTemplate } from "../utils/emailTemplates/createUserTemplate";
import uploadFile from "../utils/upload";
import { findPolicyWithLeastObjects } from "../utils/findAvailableAgent";

const selectQuery = {
  id: true,
  active: true,
  email: true,
  name: true,
  userType: true,
  photo: true,
  employeeInfo: true,
  accessLevel: {
    select: {
      id: true,
      name: true,
      permissions: true,
    },
  },
  position: {
    select: {
      id: true,
      name: true,
    },
  },
  mfa: {
    select: {
      mfaEnabled: true,
      mfaSecret: true,
    },
  },
};

export class UserService {
  createUser = async (req: any, res: Response) => {
    try {
      const {
        email,
        userType,
        firstName,
        lastName,
        otherName,
        dateOfBirth,
        gender,
        maritalStatus,
        nationality,
        phone,
        photo,
        address,
        accessLevelId,
        positionId,
      }: UserInterface = req.body;
      const checkExistance = await prisma.users.findUnique({
        where: {
          email,
        },
      });

      if (checkExistance) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "User Already Exists",
          data: null,
        });
      }

      const secret = speakeasy.generateSecret({
        length: 20,
        name: `SGC-Insurance (${email})`,
        issuer: "SGC-Insurance",
      });
      const user = await prisma.users.create({
        data: {
          email,
          name: `${firstName} ${otherName} ${lastName}`,
          createdBy: Number(req?.user.id),
          userType,
          photo,
          positionId: Number(positionId),
          accessLevelId: Number(accessLevelId),
          employeeInfo: {
            create: {
              firstName,
              lastName,
              otherName,
              address,
              dateOfBirth,
              gender,
              maritalStatus,
              nationality,
              phone,
            },
          },
          mfa: {
            create: {
              mfaSecret: secret.base32,
              mfaQrCode: await generateQR(secret.otpauth_url),
              mfaEnabled: false,
            },
          },
        },
        select: {
          employeeInfo: true,
        },
      });
      const emailData = {
        name: `${firstName}`,
      };

      // Send OTP to user
      await sendEmail(userTemplate(emailData), email, "OTP");
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "User Created successfully",
        data: user,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        data: null,
        error: error.message,
      });
    }
  };

  createTempUser = async (req: any, res: Response) => {
    try {
      const {
        email,
        firstName,
        lastName,
        otherName,
        dateOfBirth,
        gender,
        maritalStatus,
        phone,
        policyId,
      }: UserInterface = req.body;
      const checkExistance = await prisma.users.findUnique({
        where: {
          email,
        },
      });

      const checkPolicyExistance = await prisma.client_policy.findFirst({
        where: {
          AND: {
            policy_id: policyId,
            client_email: email,
          },
        },
      });

      const checkPolicyID = await prisma.policy.findFirst({
        where: {
          id: Number(policyId),
        },
      });

      if (!checkPolicyID) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Policy ID not Found",
          data: null,
        });
      }

      if (checkExistance && checkPolicyExistance) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Client Already Subscribed to Policy",
          data: checkPolicyExistance,
        });
      }

      if (!checkExistance) {
        const secret = speakeasy.generateSecret({
          length: 20,
          name: `SGC-Insurance (${email})`,
          issuer: "SGC-Insurance",
        });
        const user = await prisma.users.create({
          data: {
            email,
            name: `${firstName} ${otherName} ${lastName}`,
            createdBy: 1,
            userType: "client",
            clientInfo: {
              create: {
                firstName,
                lastName,
                otherName,
                dateOfBirth,
                gender,
                maritalStatus,
                phone,
              },
            },
            mfa: {
              create: {
                mfaSecret: secret.base32,
                mfaQrCode: await generateQR(secret.otpauth_url),
                mfaEnabled: false,
              },
            },
            client_policy: {
              create: {
                policy_id: policyId,
                client_email: email,
              },
            },
          },
          select: {
            id: true,
            clientInfo: true,
            client_policy: {
              select: {
                id: true,
                client_email: true,
                policy_id: true,
                date_enrolled: true,
                status: true,
              },
            },
          },
        });
        await prisma.client_policy.update({
          where: {
            id: user.client_policy[0].id,
          },
          data: {
            agent_id: await findPolicyWithLeastObjects(),
          },
        });
        // Send OTP to user
        await sendEmail(
          userTemplate({
            name: `${firstName}`,
          }),
          email,
          "OTP"
        );
        return res.status(200).json({
          success: true,
          statusCode: 200,
          message: "Client Created successfully",
          data: user,
        });
      }

      await prisma.client_policy.create({
        data: {
          client_email: email,
          policy_id: policyId,
          agent_id: await findPolicyWithLeastObjects(),
        },
      });

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Client subscribed to policy successfully",
        data: null,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        data: null,
        error: error.message,
      });
    }
  };

  updateUser = async (req: any, res: Response) => {
    try {
      const {
        email,
        userType,
        firstName,
        lastName,
        otherName,
        dateOfBirth,
        gender,
        maritalStatus,
        nationality,
        phone,
        photo,
        address,
        accessLevelId,
        positionId,
        isAgent,
      }: UserInterface = req.body;
      const existance = await prisma.users.findUnique({
        where: {
          email,
        },
        select: selectQuery,
      });
      const user = await prisma.users.update({
        where: {
          email,
        },
        data: {
          email,
          name: `${firstName} ${otherName} ${lastName}`,
          userType,
          photo,
          accessLevelId: accessLevelId
            ? Number(accessLevelId)
            : existance.accessLevel.id,
          positionId: positionId ? Number(positionId) : existance.position.id,
          updatedBy: Number(req?.user.id),
          updatedAt: new Date(),
          employeeInfo: {
            update: {
              firstName,
              lastName,
              otherName,
              address: address ? address : existance.employeeInfo.address,
              dateOfBirth: dateOfBirth
                ? dateOfBirth
                : existance.employeeInfo.dateOfBirth,

              gender: gender ? gender : existance.employeeInfo.gender,
              maritalStatus: maritalStatus
                ? maritalStatus
                : existance.employeeInfo.maritalStatus,
              nationality: nationality
                ? nationality
                : existance.employeeInfo.nationality,
              phone: phone ? phone : existance.employeeInfo.phone,
              isAgent: isAgent ? isAgent : existance.employeeInfo.isAgent,
            },
          },
        },
        select: selectQuery,
      });
      const token = await this.generateToken(user);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "User updated successfully",
        data: { token },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        data: null,
        error: error.message,
      });
    }
  };
  deleteUser = async (req: any, res: Response) => {
    try {
      const { email, updatedBy }: UserInterface = req.body;
      const user = await prisma.users.update({
        where: {
          email,
          updatedAt: new Date(),
          updatedBy: Number(req?.user.id),
        },
        data: {
          active: false,
        },
        include: {
          employeeInfo: true,
        },
      });
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "User archived successfully",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        data: null,
        error: error.message,
      });
    }
  };

  toggleUserStatus = async (req: any, res: Response) => {
    try {
      const { email }: any = req.query;
      const existingUser = await prisma.users.findUnique({
        where: {
          email: String(email),
        },
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "No User Found",
          data: null,
        });
      }

      const user = await prisma.users.update({
        where: {
          email,
        },
        data: {
          active: !existingUser.active,
          updatedAt: new Date(),
          updatedBy: Number(req?.user.id),
        },
        include: {
          employeeInfo: true,
        },
      });

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "User archived successfully",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        data: null,
        error: error.message,
      });
    }
  };
  toggleAgent = async (req: any, res: Response) => {
    try {
      const { email }: any = req.query;
      const existingUser = await prisma.users.findUnique({
        where: {
          email: String(email),
        },
        select: {
          id: true,
          employeeInfo: {
            select: {
              isAgent: true,
            },
          },
        },
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "No User Found",
          data: null,
        });
      }

      const user = await prisma.users.update({
        where: {
          email,
        },
        data: {
          updatedAt: new Date(),
          updatedBy: Number(req?.user.id),
          employeeInfo: {
            update: {
              isAgent: !existingUser.employeeInfo.isAgent,
            },
          },
        },
        include: {
          employeeInfo: true,
        },
      });

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "User archived successfully",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        data: null,
        error: error.message,
      });
    }
  };

  loginUser = async (req: Request, res: Response) => {
    const { email }: UserInterface = req.body;
    try {
      const existance: { id: number; name: string; email: string } =
        await prisma.users.findUnique({
          where: {
            email,
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });
      if (!existance) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Invalid Email",
          data: null,
        });
      }
      const otpExistance = await prisma.otp.findUnique({
        where: {
          email,
        },
      });

      if (otpExistance) {
        let otp = speakeasy.totp({
          secret: otpExistance.otp,
          encoding: "base32",
        });

        const emailData = {
          name: existance.name,
          otp,
        };

        // Send OTP to user
        sendEmail(otpTemplate(emailData), email, "OTP");
        return res.status(200).json({
          success: true,
          statusCode: 200,
          message: "OTP sent successfully",
          data: null,
        });
      }

      // Create OPT Secret
      const createSecret = await prisma.otp.create({
        data: {
          email,
          otp: speakeasy.generateSecret({ length: 20 }).base32,
        },
        select: {
          id: true,
          otp: true,
        },
      });

      // Generate OTP
      const otp = speakeasy.totp({
        secret: createSecret.otp,
        encoding: "base32",
      });
      const emailData = {
        name: existance.name,
        otp,
      };
      console.log(otp);
      // Send OTP to user
      sendEmail(otpTemplate(emailData), email, "OTP");
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "OTP sent successfully",
        data: null,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        data: null,
        error: error.message,
      });
    }
  };

  verifyOTP = async (req: Request, res: Response) => {
    const OTP_EXPIRATION_TIME = 300;
    const { email, otp }: { email: string; otp: string | number } = req.body;
    try {
      const existance: any = await prisma.otp.findUnique({
        where: {
          email,
        },
        select: {
          otp: true,
          user: {
            select: {
              id: true,
              active: true,
              email: true,
              name: true,
              userType: true,
              photo: true,
              accessLevel: {
                select: {
                  id: true,
                  name: true,
                  permissions: true,
                },
              },
              mfa: {
                select: {
                  mfaQrCode: true,
                  mfaEnabled: true,
                },
              },
            },
          },
        },
      });

      if (!existance) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Invalid Email",
          data: null,
        });
      }
      const currentTime = Date.now();
      if (currentTime - existance.createdAt > OTP_EXPIRATION_TIME * 1000) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "OTP expired",
          data: null,
        });
      }

      const verified = speakeasy.totp.verify({
        secret: existance.otp,
        encoding: "base32",
        token: otp,
        window: 1, // Accepts OTPs generated up to one time step before or after the current time
      });

      if (verified) {
        await prisma.otp.delete({
          where: {
            email,
          },
        });

        return res.status(200).json({
          success: true,
          statusCode: 200,
          message: "Login Successfull",
          data: {
            mfaQrCode: existance.user?.mfa?.mfaQrCode,
            mfaEnabled: existance.user?.mfa?.mfaEnabled,
          },
        });
      } else {
        res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Invalid OTP",
          data: null,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        data: null,
        error: error.message,
      });
    }
  };

  verifyMFA = async (req: Request, res: Response) => {
    const { email, token } = req.body;

    const existance: any = await prisma.users.findUnique({
      where: {
        email,
      },
      select: selectQuery,
    });

    if (email === existance.email) {
      const verified = speakeasy.totp.verify({
        secret: existance.mfa.mfaSecret,
        encoding: "base32",
        token: token,
        window: 1, // Accepts OTPs generated up to one time step before or after the current time
      });

      if (verified) {
        const token = await this.generateToken(existance);

        await prisma.mfa.update({
          where: {
            email,
          },
          data: {
            mfaEnabled: true,
          },
        });
        res.json({
          success: true,
          statusCode: 200,
          message: "MFA verified successfully",
          data: { token: token },
        });
      } else {
        res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Invalid Verification Code",
          data: null,
        });
      }
    } else {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Invalid Email",
        data: null,
      });
    }
  };

  getUser = async (req: Request, res: Response) => {
    const { email }: any = req.query;
    try {
      const existance: any = await prisma.users.findUnique({
        where: {
          email: email,
        },
        include: {
          employeeInfo: true,
        },
      });
      if (!existance) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "No User Found",
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Operation Successful",
        data: existance,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        data: null,
        error: error.message,
      });
    }
  };

  listUsers = async (req: Request, res: Response) => {
    try {
      const { userType }: any = req.query;

      const existance: any = await prisma.users.findMany({
        where: {
          userType: userType,
          id: {
            not: 1,
          },
        },
        orderBy: {
          id: "desc",
        },
        include: {
          employeeInfo: true,
        },
      });
      if (!existance) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "No User Found",
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Operation Successful",
        data: existance,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        data: null,
        error: error.message,
      });
    }
  };

  listAgent = async (req: Request, res: Response) => {
    try {
      const existance: any = await prisma.users.findMany({
        where: {
          employeeInfo: {
            isAgent: true,
          },
        },
        orderBy: {
          name: "asc",
        },
        include: {
          employeeInfo: true,
        },
      });
      if (!existance) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "No Agents Found",
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Operation Successful",
        data: existance,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        data: null,
        error: error.message,
      });
    }
  };

  uploadProfile = async (req: any, res: Response) => {
    try {
      const file: any = req?.file.path;
      const { email } = req.query;
      const existance: { id: number } = await prisma.users.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      });

      if (!existance) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "No User Found",
          data: null,
        });
      }
      const user = await prisma.users.update({
        where: {
          email,
        },
        data: {
          photo: await uploadFile(file, "profile/images"),
          updatedBy: Number(req?.user.id),
          updatedAt: new Date(),
        },
        select: selectQuery,
      });

      const token = await this.generateToken(user);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Operation Successfull",
        data: { token },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
        data: null,
        error: error.message,
      });
    }
  };

  private generateToken = async (data) => {
    let onboarding = false;
    if (data.userType === "admin") {
      onboarding = false;
    } else {
      if (
        data.employeeInfo.dateOfBirth === "null" ||
        data.employeeInfo.dateOfBirth === null ||
        data.employeeInfo.dateOfBirth === ""
      ) {
        onboarding = true;
      }
    }

    return await JWT.sign(
      {
        id: data.id,
        name: data.name,
        email: data.email,
        photo: data.photo,
        userType: data.userType,
        isAgent: data?.employeeInfo?.isAgent,
        accessLevel: data.accessLevel,
        position: data.userType === "admin" ? "admin" : data.position?.name,
        onboarding,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
  };
}
