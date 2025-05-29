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
): Promise<Omit<User, "passwordHash">> => {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
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

  const payload = {
    user: {
      id: user.id,
      email: user.email,
    },
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};
