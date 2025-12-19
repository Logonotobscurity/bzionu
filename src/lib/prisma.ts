/**
 * This file is now a re-exporter for the canonical prisma client instance.
 * All application code should import prisma from this module.
 * This ensures that all parts of the application share the same prisma client instance.
 */

import { prisma } from './db';

export default prisma;
