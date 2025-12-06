/**
 * Prisma Client singleton for database access.
 *
 * This module implements the singleton pattern to prevent multiple
 * PrismaClient instances in development mode due to Next.js hot reloading.
 *
 * In development: Client is cached on `globalThis` to survive hot reloads
 * In production: New client per process (normal behavior)
 *
 * @module prisma
 * @see {@link https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices}
 *
 * @example
 * import { prisma } from "@/lib/prisma";
 *
 * // Query all members
 * const members = await prisma.member.findMany();
 *
 * // Find hospital by code
 * const hospital = await prisma.hospital.findUnique({
 *   where: { code: "H001" }
 * });
 */
import { PrismaClient } from "@prisma/client";

/**
 * Global type augmentation for Prisma singleton pattern.
 * Extends globalThis to store the Prisma client instance.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Shared Prisma Client instance.
 * Use this for all database operations throughout the application.
 *
 * @type {PrismaClient}
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Cache the client in development to prevent multiple instances during hot reload
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
