import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllAccounts,
  getAllTransactions,
  getTransactionsByAccount,
  getAccountBalances,
  getAllAccountBalances,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createBatchTransaction,
  createEuroExchange,
  getAllEuroExchanges,
  getSetting,
  setSetting,
  getAllSettings,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountsByType,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Accounting Features
  accounts: router({
    list: publicProcedure
      .input(z.object({}).optional())
      .query(async () => {
        return getAllAccounts();
      }),
  }),

  transactions: router({
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().optional(),
          offset: z.number().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return getAllTransactions(input?.limit, input?.offset);
      }),

    byAccount: publicProcedure
      .input(
        z.object({
          accountId: z.number(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        if (!input) return [];
        return getTransactionsByAccount(input.accountId, input.limit, input.offset);
      }),

    create: protectedProcedure
      .input(
        z.object({
          accountId: z.number(),
          amount: z.string(),
          currency: z.enum(["دولار", "يورو", "ليرة سورية", "آخر"]),
          description: z.string().optional(),
          type: z.enum(["لنا", "لهم"]),
          transactionDate: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        return createTransaction(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          amount: z.string().optional(),
          currency: z.enum(["دولار", "يورو", "ليرة سورية", "آخر"]).optional(),
          description: z.string().optional(),
          type: z.enum(["لنا", "لهم"]).optional(),
          transactionDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateTransaction(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteTransaction(input.id);
      }),
  }),

  balances: router({
    byAccount: publicProcedure
      .input(z.object({ accountId: z.number() }))
      .query(async ({ input }) => {
        return getAccountBalances(input.accountId);
      }),

    all: publicProcedure.query(async () => {
      return getAllAccountBalances();
    }),
  }),

  // Account Management
  accountManagement: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          accountType: z.enum(["زبون", "مكتب", "مندوب", "آخر"]),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createAccount(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          accountType: z.enum(["زبون", "مكتب", "مندوب", "آخر"]).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateAccount(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteAccount(input.id);
      }),

    getByType: publicProcedure
      .input(z.object({ accountType: z.enum(["زبون", "مكتب", "مندوب", "آخر"]) }))
      .query(async ({ input }) => {
        return getAccountsByType(input.accountType);
      }),
  }),

  // Batch Transactions
  batchTransactions: router({
    create: protectedProcedure
      .input(
        z.object({
          accountId: z.number(),
          amount: z.string(),
          currency: z.enum(["دولار", "يورو", "ليرة سورية", "آخر"]),
          description: z.string().optional(),
          type: z.enum(["لنا", "لهم"]),
          transactionDate: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        return createBatchTransaction(input);
      }),
  }),

  // Euro Exchange
  euroExchange: router({
    create: protectedProcedure
      .input(
        z.object({
          officeId: z.number(),
          euroAmount: z.string(),
          exchangeRate: z.string(),
          dollarAmount: z.string(),
          exchangeDate: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        return createEuroExchange(input);
      }),

    list: publicProcedure.query(async () => {
      return getAllEuroExchanges();
    }),
  }),

  // Settings
  settings: router({
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return getSetting(input.key);
      }),

    set: protectedProcedure
      .input(
        z.object({
          key: z.string(),
          value: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return setSetting(input.key, input.value, input.description);
      }),

    all: publicProcedure.query(async () => {
      return getAllSettings();
    }),
  }),
});

export type AppRouter = typeof appRouter;
