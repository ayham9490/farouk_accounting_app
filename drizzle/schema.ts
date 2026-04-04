import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Accounts table - يحتوي على قائمة الحسابات (العملاء، المكاتب، المندوبين)
 */
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  accountType: mysqlEnum("accountType", ["زبون", "مكتب", "مندوب", "آخر"]).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

/**
 * Transactions table - يحتوي على المعاملات اليومية
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: mysqlEnum("currency", ["دولار", "يورو", "ليرة سورية", "آخر"]).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["لنا", "لهم"]).notNull(),
  transactionDate: timestamp("transactionDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Account Balances table - يحتوي على الأرصدة النهائية للحسابات
 */
export const accountBalances = mysqlTable("accountBalances", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  currency: mysqlEnum("currency", ["دولار", "يورو", "ليرة سورية", "آخر"]).notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AccountBalance = typeof accountBalances.$inferSelect;
export type InsertAccountBalance = typeof accountBalances.$inferInsert;

/**
 * Account Statements table - يحتوي على كشوفات الحسابات
 */
export const accountStatements = mysqlTable("accountStatements", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  transactionId: int("transactionId").notNull(),
  debit: decimal("debit", { precision: 15, scale: 2 }).notNull().default("0"),
  credit: decimal("credit", { precision: 15, scale: 2 }).notNull().default("0"),
  runningBalance: decimal("runningBalance", { precision: 15, scale: 2 }).notNull().default("0"),
  description: text("description"),
  statementDate: timestamp("statementDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AccountStatement = typeof accountStatements.$inferSelect;
export type InsertAccountStatement = typeof accountStatements.$inferInsert;

/**
 * Inventory table - ورقة الجرد
 */
export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  unitPrice: decimal("unitPrice", { precision: 15, scale: 2 }),
  totalValue: decimal("totalValue", { precision: 15, scale: 2 }),
  notes: text("notes"),
  inventoryDate: timestamp("inventoryDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;


/**
 * Batch Transactions table - معاملات دفعية
 */
export const batchTransactions = mysqlTable("batchTransactions", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: mysqlEnum("currency", ["دولار", "يورو", "ليرة سورية", "آخر"]).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["لنا", "لهم"]).notNull(),
  transactionDate: timestamp("transactionDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BatchTransaction = typeof batchTransactions.$inferSelect;
export type InsertBatchTransaction = typeof batchTransactions.$inferInsert;

/**
 * Euro Exchange table - قص اليورو
 */
export const euroExchanges = mysqlTable("euroExchanges", {
  id: int("id").autoincrement().primaryKey(),
  officeId: int("officeId").notNull(),
  euroAmount: decimal("euroAmount", { precision: 15, scale: 2 }).notNull(),
  exchangeRate: decimal("exchangeRate", { precision: 15, scale: 4 }).notNull(),
  dollarAmount: decimal("dollarAmount", { precision: 15, scale: 2 }).notNull(),
  exchangeDate: timestamp("exchangeDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EuroExchange = typeof euroExchanges.$inferSelect;
export type InsertEuroExchange = typeof euroExchanges.$inferInsert;

/**
 * Settings table - الإعدادات
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
