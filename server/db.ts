import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, accounts, transactions, accountBalances, accountStatements, Account, Transaction, AccountBalance, batchTransactions, euroExchanges, settings, BatchTransaction, EuroExchange, Setting } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Accounting App Queries

export async function getAllAccounts(): Promise<Account[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accounts);
}

export async function getAccountById(id: number): Promise<Account | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTransactions(limit?: number, offset?: number): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];
  let query: any = db.select().from(transactions).orderBy(desc(transactions.transactionDate));
  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);
  return query;
}

export async function getTransactionsByAccount(accountId: number, limit?: number, offset?: number): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];
  let query: any = db.select().from(transactions).where(eq(transactions.accountId, accountId)).orderBy(desc(transactions.transactionDate));
  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);
  return query;
}

export async function getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).where(
    and(
      gte(transactions.transactionDate, startDate),
      lte(transactions.transactionDate, endDate)
    )
  ).orderBy(desc(transactions.transactionDate));
}

export async function getAccountBalances(accountId: number): Promise<AccountBalance[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accountBalances).where(eq(accountBalances.accountId, accountId));
}

export async function getAllAccountBalances(): Promise<(AccountBalance & { account: Account | null })[]> {
  const db = await getDb();
  if (!db) return [];
  
  const balances = await db.select().from(accountBalances);
  const result: (AccountBalance & { account: Account | null })[] = [];
  
  for (const balance of balances) {
    const account = await getAccountById(balance.accountId);
    result.push({
      ...balance,
      account: account || null,
    });
  }
  
  return result;
}

export async function createTransaction(data: {
  accountId: number;
  amount: string;
  currency: string;
  description?: string;
  type: string;
  transactionDate: Date;
}): Promise<Transaction> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(transactions).values({
    accountId: data.accountId,
    amount: data.amount,
    currency: data.currency as any,
    description: data.description,
    type: data.type as any,
    transactionDate: data.transactionDate,
  });
  
  const insertedId = result[0].insertId;
  const inserted = await db.select().from(transactions).where(eq(transactions.id, insertedId as number)).limit(1);
  return inserted[0];
}

export async function updateTransaction(id: number, data: Partial<{
  amount: string;
  currency: 'دولار' | 'يورو' | 'ليرة سورية' | 'آخر';
  description: string;
  type: 'لنا' | 'لهم';
  transactionDate: Date;
}>): Promise<Transaction | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const updateData: Record<string, any> = {};
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.transactionDate !== undefined) updateData.transactionDate = data.transactionDate;
  
  await db.update(transactions).set(updateData).where(eq(transactions.id, id));
  
  const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteTransaction(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(transactions).where(eq(transactions.id, id));
  return true;
}

// Batch Transactions
export async function createBatchTransaction(data: {
  accountId: number;
  amount: string;
  currency: string;
  description?: string;
  type: string;
  transactionDate: Date;
}): Promise<BatchTransaction> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(batchTransactions).values({
    accountId: data.accountId,
    amount: data.amount,
    currency: data.currency as any,
    description: data.description,
    type: data.type as any,
    transactionDate: data.transactionDate,
  });
  
  const insertedId = result[0].insertId;
  const inserted = await db.select().from(batchTransactions).where(eq(batchTransactions.id, insertedId as number)).limit(1);
  return inserted[0];
}

// Euro Exchanges
export async function createEuroExchange(data: {
  officeId: number;
  euroAmount: string;
  exchangeRate: string;
  dollarAmount: string;
  exchangeDate: Date;
}): Promise<EuroExchange> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(euroExchanges).values({
    officeId: data.officeId,
    euroAmount: data.euroAmount,
    exchangeRate: data.exchangeRate,
    dollarAmount: data.dollarAmount,
    exchangeDate: data.exchangeDate,
  });
  
  const insertedId = result[0].insertId;
  const inserted = await db.select().from(euroExchanges).where(eq(euroExchanges.id, insertedId as number)).limit(1);
  return inserted[0];
}

export async function getAllEuroExchanges(): Promise<EuroExchange[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(euroExchanges).orderBy(desc(euroExchanges.exchangeDate));
}

// Settings
export async function getSetting(key: string): Promise<Setting | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setSetting(key: string, value: string, description?: string): Promise<Setting> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSetting(key);
  
  if (existing) {
    await db.update(settings).set({ value, description }).where(eq(settings.key, key));
    const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return result[0];
  } else {
    const result = await db.insert(settings).values({ key, value, description });
    const insertedId = result[0].insertId;
    const inserted = await db.select().from(settings).where(eq(settings.id, insertedId as number)).limit(1);
    return inserted[0];
  }
}

export async function getAllSettings(): Promise<Setting[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(settings);
}

// Account Management
export async function createAccount(data: {
  name: string;
  accountType: 'زبون' | 'مكتب' | 'مندوب' | 'آخر';
  description?: string;
}): Promise<Account> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(accounts).values({
    name: data.name,
    accountType: data.accountType,
    description: data.description,
  });
  
  const insertedId = result[0].insertId;
  const inserted = await db.select().from(accounts).where(eq(accounts.id, insertedId as number)).limit(1);
  return inserted[0];
}

export async function updateAccount(id: number, data: Partial<{
  name: string;
  accountType: 'زبون' | 'مكتب' | 'مندوب' | 'آخر';
  description: string;
}>): Promise<Account | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.accountType !== undefined) updateData.accountType = data.accountType;
  if (data.description !== undefined) updateData.description = data.description;
  
  await db.update(accounts).set(updateData).where(eq(accounts.id, id));
  
  const result = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteAccount(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(accounts).where(eq(accounts.id, id));
  return true;
}

export async function getAccountsByType(accountType: 'زبون' | 'مكتب' | 'مندوب' | 'آخر'): Promise<Account[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accounts).where(eq(accounts.accountType, accountType));
}
