import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("party"),
  partyId: integer("party_id"),
});

export const parties = pgTable("parties", {
  id: serial("id").primaryKey(),
  partyName: text("party_name").notNull().unique(),
  powerLoom: integer("power_loom").notNull(),
  pick: numeric("pick").notNull(),
  reed: numeric("reed").notNull(),
  advanceBalance: numeric("advance_balance").notNull().default("0"),
});

export const receivedMeters = pgTable("received_meters", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull(),
  meter: numeric("meter").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deliveryBags = pgTable("delivery_bags", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull(),
  bagType: text("bag_type").notNull(),
  numberOfBags: integer("number_of_bags").notNull(),
  weightPerBag: numeric("weight_per_bag").notNull(),
  totalWeight: numeric("total_weight").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deliveryBeams = pgTable("delivery_beams", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull(),
  beamCount: integer("beam_count").notNull(),
  beamMeter: numeric("beam_meter").notNull(),
  totalMeter: numeric("total_meter").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salaries = pgTable("salaries", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull(),
  totalMeter: numeric("total_meter").notNull(),
  pick: numeric("pick").notNull(),
  salary: numeric("salary").notNull(),
  rent: numeric("rent").notNull(),
  finalSalary: numeric("final_salary").notNull(),
  cashPaid: numeric("cash_paid").notNull(),
  balance: numeric("balance").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const advances = pgTable("advances", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull(),
  amount: numeric("amount").notNull(),
  reason: text("reason").notNull(),
  balance: numeric("balance").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id"),
  note: text("note").notNull(),
  attachment: text("attachment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ---------------- INSERT SCHEMAS ---------------- */

export const insertUserSchema = createInsertSchema(users).omit({ id: true });

export const insertPartySchema = createInsertSchema(parties)
  .omit({ id: true, advanceBalance: true })
  .extend({
    powerLoom: z.coerce.number(),
    pick: z.coerce.number(),
    reed: z.coerce.number(),
  });

export const insertReceivedMeterSchema = createInsertSchema(receivedMeters)
  .omit({ id: true, createdAt: true })
  .extend({
    meter: z.coerce.number(),
  });

export const insertDeliveryBagSchema = createInsertSchema(deliveryBags)
  .omit({ id: true, createdAt: true })
  .extend({
    numberOfBags: z.coerce.number(),
    weightPerBag: z.coerce.number(),
    totalWeight: z.coerce.number(),
  });

export const insertDeliveryBeamSchema = createInsertSchema(deliveryBeams)
  .omit({ id: true, createdAt: true })
  .extend({
    beamCount: z.coerce.number(),
    beamMeter: z.coerce.number(),
    totalMeter: z.coerce.number(),
  });

export const insertSalarySchema = createInsertSchema(salaries)
  .omit({ id: true, createdAt: true })
  .extend({
    totalMeter: z.coerce.number(),
    pick: z.coerce.number(),
    salary: z.coerce.number(),
    rent: z.coerce.number(),
    finalSalary: z.coerce.number(),
    cashPaid: z.coerce.number(),
    balance: z.coerce.number(),
  });

export const insertAdvanceSchema = createInsertSchema(advances)
  .omit({ id: true, createdAt: true, balance: true })
  .extend({
    amount: z.coerce.number(),
  });

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
});

/* ---------------- TYPES ---------------- */

export type User = typeof users.$inferSelect;
export type Party = typeof parties.$inferSelect;
export type ReceivedMeter = typeof receivedMeters.$inferSelect;
export type DeliveryBag = typeof deliveryBags.$inferSelect;
export type DeliveryBeam = typeof deliveryBeams.$inferSelect;
export type Salary = typeof salaries.$inferSelect;
export type Advance = typeof advances.$inferSelect;
export type Note = typeof notes.$inferSelect;