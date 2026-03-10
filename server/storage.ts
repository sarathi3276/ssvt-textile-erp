import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  users, parties, receivedMeters, deliveryBags, deliveryBeams,
  salaries, advances, notes,
  type User, type Party, type ReceivedMeter, type DeliveryBag, type DeliveryBeam,
  type Salary, type Advance, type Note
} from "@shared/schema";
import { z } from "zod";
import { insertUserSchema, insertPartySchema, insertReceivedMeterSchema, insertDeliveryBagSchema, insertDeliveryBeamSchema, insertSalarySchema, insertAdvanceSchema, insertNoteSchema } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: z.infer<typeof insertUserSchema>): Promise<User>;

  // Parties
  getParties(): Promise<Party[]>;
  getParty(id: number): Promise<Party | undefined>;
  createParty(party: z.infer<typeof insertPartySchema>): Promise<Party>;
  updateParty(id: number, party: Partial<z.infer<typeof insertPartySchema>>): Promise<Party>;
  updateAdvanceBalance(partyId: number, amountChange: number): Promise<void>;

  // Received Meters
  getReceivedMeters(): Promise<ReceivedMeter[]>;
  createReceivedMeter(data: z.infer<typeof insertReceivedMeterSchema>): Promise<ReceivedMeter>;

  // Deliveries
  getDeliveryBags(): Promise<DeliveryBag[]>;
  createDeliveryBag(data: z.infer<typeof insertDeliveryBagSchema>): Promise<DeliveryBag>;
  getDeliveryBeams(): Promise<DeliveryBeam[]>;
  createDeliveryBeam(data: z.infer<typeof insertDeliveryBeamSchema>): Promise<DeliveryBeam>;

  // Salaries
  getSalaries(): Promise<Salary[]>;
  createSalary(data: z.infer<typeof insertSalarySchema>): Promise<Salary>;

  // Advances
  getAdvances(): Promise<Advance[]>;
  createAdvance(data: z.infer<typeof insertAdvanceSchema> & { balance: string }): Promise<Advance>;

  // Notes
  getNotes(): Promise<Note[]>;
  createNote(data: z.infer<typeof insertNoteSchema>): Promise<Note>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: z.infer<typeof insertUserSchema>): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getParties(): Promise<Party[]> {
    return await db.select().from(parties);
  }

  async getParty(id: number): Promise<Party | undefined> {
    const [party] = await db.select().from(parties).where(eq(parties.id, id));
    return party;
  }

  async createParty(party: z.infer<typeof insertPartySchema>): Promise<Party> {
    const [newParty] = await db.insert(parties).values(party).returning();
    return newParty;
  }

  async updateParty(id: number, updates: Partial<z.infer<typeof insertPartySchema>>): Promise<Party> {
    const [updatedParty] = await db.update(parties)
      .set(updates)
      .where(eq(parties.id, id))
      .returning();
    return updatedParty;
  }
async deleteParty(id: number): Promise<void> {

  // delete received meters
  await db.delete(receivedMeters).where(eq(receivedMeters.partyId, id));

  // delete bag deliveries
  await db.delete(deliveryBags).where(eq(deliveryBags.partyId, id));

  // delete beam deliveries
  await db.delete(deliveryBeams).where(eq(deliveryBeams.partyId, id));

  // delete salaries
  await db.delete(salaries).where(eq(salaries.partyId, id));

  // delete advances
  await db.delete(advances).where(eq(advances.partyId, id));

  // delete notes
  await db.delete(notes).where(eq(notes.partyId, id));

  // delete party login user
  await db.delete(users).where(eq(users.partyId, id));

  // finally delete the party
  await db.delete(parties).where(eq(parties.id, id));

}

  async updateAdvanceBalance(partyId: number, amountChange: number): Promise<void> {
    const party = await this.getParty(partyId);
    if (party) {
      const currentBalance = parseFloat(party.advanceBalance.toString());
      const newBalance = currentBalance + amountChange;
      await db.update(parties).set({ advanceBalance: newBalance.toString() }).where(eq(parties.id, partyId));
    }
  }

  async getReceivedMeters(): Promise<ReceivedMeter[]> {
    return await db.select().from(receivedMeters).orderBy(desc(receivedMeters.createdAt));
  }

  async createReceivedMeter(data: z.infer<typeof insertReceivedMeterSchema>): Promise<ReceivedMeter> {
    const [newItem] = await db.insert(receivedMeters).values({
        ...data,
        meter: String(data.meter) // Ensure it's passed as string to numeric
    }).returning();
    return newItem;
  }

  async getDeliveryBags(): Promise<DeliveryBag[]> {
    return await db.select().from(deliveryBags).orderBy(desc(deliveryBags.createdAt));
  }

  async createDeliveryBag(data: z.infer<typeof insertDeliveryBagSchema>): Promise<DeliveryBag> {
    const [newItem] = await db.insert(deliveryBags).values({
      ...data,
      weightPerBag: String(data.weightPerBag),
      totalWeight: String(data.totalWeight)
    }).returning();
    return newItem;
  }

  async getDeliveryBeams(): Promise<DeliveryBeam[]> {
    return await db.select().from(deliveryBeams).orderBy(desc(deliveryBeams.createdAt));
  }

  async createDeliveryBeam(data: z.infer<typeof insertDeliveryBeamSchema>): Promise<DeliveryBeam> {
    const [newItem] = await db.insert(deliveryBeams).values({
        ...data,
        beamMeter: String(data.beamMeter),
        totalMeter: String(data.totalMeter)
    }).returning();
    return newItem;
  }

  async getSalaries(): Promise<Salary[]> {
    return await db.select().from(salaries).orderBy(desc(salaries.createdAt));
  }

  async createSalary(data: z.infer<typeof insertSalarySchema>): Promise<Salary> {
    const [newItem] = await db.insert(salaries).values({
      ...data,
      totalMeter: String(data.totalMeter),
      pick: String(data.pick),
      salary: String(data.salary),
      rent: String(data.rent),
      finalSalary: String(data.finalSalary),
      cashPaid: String(data.cashPaid),
      balance: String(data.balance)
    }).returning();
    return newItem;
  }

  async getAdvances(): Promise<Advance[]> {
    return await db.select().from(advances).orderBy(desc(advances.createdAt));
  }

  async createAdvance(data: z.infer<typeof insertAdvanceSchema> & { balance: string }): Promise<Advance> {
    const [newItem] = await db.insert(advances).values({
      ...data,
      amount: String(data.amount),
      balance: data.balance
    }).returning();
    return newItem;
  }

  async getNotes(): Promise<Note[]> {
    return await db.select().from(notes).orderBy(desc(notes.createdAt));
  }

  async createNote(data: z.infer<typeof insertNoteSchema>): Promise<Note> {
    const [newItem] = await db.insert(notes).values(data).returning();
    return newItem;
  }
}

export const storage = new DatabaseStorage();
