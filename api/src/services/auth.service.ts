import { PrismaClient, User } from "../../generated/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterDto, LoginDto } from "../dtos/auth.dto";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

export const registerUser = async (
  data: RegisterDto
): Promise<{ token: string; user: Omit<User, "passwordHash"> }> => {
  const { email, password } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  const { passwordHash: _, ...userWithoutPassword } = newUser;

  const token = generateToken(userWithoutPassword);

  return { token, user: userWithoutPassword };
};

const generateToken = (user: Omit<User, "passwordHash">) => {
  const payload = {
    user: {
      id: user.id,
      email: user.email,
    },
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};

export const loginUser = async (
  data: LoginDto
): Promise<{ token: string; user: Omit<User, "passwordHash"> }> => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};
