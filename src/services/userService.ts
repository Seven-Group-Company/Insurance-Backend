import { Request, Response } from "express";
import { prisma } from "../utils/context";
import JWT from "jsonwebtoken";
import speakeasy from "speakeasy";
import { comparePassword, hashPassword } from "../utils/hashPasswords";
import { sendEmail } from "../utils/emailService";

const JWT_SECRET: any = process.env.JWT_SECRET;

export class UserService {
  createUser = async (req: Request, res: Response) => {
    try {
      const {
        email,
        createdBy,
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
      } = req.body;
      const user = await prisma.users.create({
        data: {
          email,
          name: `${firstName} ${otherName} ${lastName}`,
          createdBy: Number(createdBy),
          userType,
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
              photo,
            },
          },
        },
      });
      return res.status(201).json({ msg: "User created successfully", user });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const {
        email,
        createdBy,
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
      } = req.body;
      const user = await prisma.users.update({
        where: {
          email,
        },
        data: {
          email,
          name: `${firstName} ${otherName} ${lastName}`,
          createdBy: Number(createdBy),
          userType,
          employeeInfo: {
            update: {
              firstName,
              lastName,
              otherName,
              address,
              dateOfBirth,
              gender,
              maritalStatus,
              nationality,
              phone,
              photo,
            },
          },
        },
      });
      return res.status(201).json({ msg: "User created successfully", user });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  loginUser = async (req: Request, res: Response) => {
    const { email } = req.body;
    const { resendOTP } = req.query;
    try {
      const existance: any = await prisma.users.findUnique({
        where: {
          email,
        },
      });

      if (!existance) {
        return res.status(404).json({ message: "Invalid Email", data: null });
      }

      if (Boolean(resendOTP)) {
        await prisma.otp.delete({
          where: {
            email,
          },
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

      // Send OTP to user
      sendEmail(`Your OTP ${otp}`, email, "OTP");
      res.status(200).json({ status: "OTP sent Successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  verifyOTP = async (req: Request, res: Response) => {
    const OTP_EXPIRATION_TIME = 300;
    const { email, otp } = req.body;
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
            },
          },
        },
      });

      if (!existance) {
        return res.status(404).json({ message: "Invalid Email", data: null });
      }
      const currentTime = Date.now();
      if (currentTime - existance.createdAt > OTP_EXPIRATION_TIME * 1000) {
        return res.status(400).send("OTP has expired");
      }
      const verified = speakeasy.totp.verify({
        secret: existance.otp,
        encoding: "base32",
        token: Number(otp),
        window: 1, // Accepts OTPs generated up to one time step before or after the current time
      });

      if (verified) {
        const token = JWT.sign(
          {
            id: existance.user.id,
            name: existance.user.name,
            email: existance.user.email,
            userType: existance.user.userType,
          },
          JWT_SECRET,
          {
            expiresIn: "12h",
          }
        );

        await prisma.otp.delete({
          where: {
            email,
          },
        });

        return res
          .status(200)
          .json({ status: "Login Successfully", token: token });
      } else {
        res.status(400).send("Invalid OTP");
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
  getUser = async (req: Request, res: Response) => {
    const { email }: any = req.query;
    try {
      const existance: any = await prisma.users.findUnique({
        where: {
          email: email,
        },
        select: {
          name: true,
          email: true,
          id: true,
        },
      });
      if (!existance) {
        return res.status(404).json({ message: "User Not Found", data: null });
      }
      return res
        .status(200)
        .json({ message: "Operation Successful", data: existance });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
}
