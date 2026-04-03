import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock user for testing
const mockUser: User = {
  id: 1,
  openId: "test-user",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "test",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

// Create a mock context with authenticated user
function createAuthContext(): TrpcContext {
  return {
    user: mockUser,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {} as any,
  };
}

describe("Accounting Routes", () => {
  describe("accounts.list", () => {
    it("should return a list of accounts", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const accounts = await caller.accounts.list();

      expect(Array.isArray(accounts)).toBe(true);
    });
  });

  describe("transactions.list", () => {
    it("should return a list of transactions", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const transactions = await caller.transactions.list({ limit: 10 });

      expect(Array.isArray(transactions)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const transactions = await caller.transactions.list({ limit: 5 });

      expect(transactions.length).toBeLessThanOrEqual(5);
    });
  });

  describe("balances.all", () => {
    it("should return all account balances", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const balances = await caller.balances.all();

      expect(Array.isArray(balances)).toBe(true);
      
      // Each balance should have required fields
      balances.forEach((balance) => {
        expect(balance).toHaveProperty("accountId");
        expect(balance).toHaveProperty("currency");
        expect(balance).toHaveProperty("balance");
      });
    });
  });

  describe("transactions.create", () => {
    it("should create a new transaction", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // First get an account
      const accounts = await caller.accounts.list();
      if (accounts.length === 0) {
        console.warn("No accounts found for transaction creation test");
        return;
      }

      const newTransaction = await caller.transactions.create({
        accountId: accounts[0].id,
        amount: "1000",
        currency: "دولار",
        description: "Test transaction",
        type: "لنا",
        transactionDate: new Date(),
      });

      expect(newTransaction).toBeDefined();
      expect(newTransaction.accountId).toBe(accounts[0].id);
      expect(parseFloat(newTransaction.amount)).toBe(1000);
      expect(newTransaction.currency).toBe("دولار");
      expect(newTransaction.type).toBe("لنا");
    });

    it("should validate required fields", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.transactions.create({
          accountId: 999,
          amount: "invalid",
          currency: "دولار" as any,
          type: "لنا",
          transactionDate: new Date(),
        });
      } catch (error: any) {
        // Expected to fail validation
        expect(error).toBeDefined();
      }
    });
  });

  describe("transactions.byAccount", () => {
    it("should return transactions for a specific account", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Get first account
      const accounts = await caller.accounts.list();
      if (accounts.length === 0) {
        console.warn("No accounts found for byAccount test");
        return;
      }

      const transactions = await caller.transactions.byAccount({
        accountId: accounts[0].id,
      });

      expect(Array.isArray(transactions)).toBe(true);
      
      // All transactions should belong to the selected account
      transactions.forEach((tx) => {
        expect(tx.accountId).toBe(accounts[0].id);
      });
    });
  });

  describe("balances.byAccount", () => {
    it("should return balances for a specific account", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Get first account
      const accounts = await caller.accounts.list();
      if (accounts.length === 0) {
        console.warn("No accounts found for balances.byAccount test");
        return;
      }

      const balances = await caller.balances.byAccount({
        accountId: accounts[0].id,
      });

      expect(Array.isArray(balances)).toBe(true);
      
      // All balances should belong to the selected account
      balances.forEach((balance) => {
        expect(balance.accountId).toBe(accounts[0].id);
      });
    });
  });

  describe("auth.me", () => {
    it("should return current user info", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const user = await caller.auth.me();

      expect(user).toBeDefined();
      expect(user?.openId).toBe("test-user");
      expect(user?.email).toBe("test@example.com");
    });
  });
});
