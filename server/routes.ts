import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "@shared/schema";
import MemoryStore from "memorystore";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session setup
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'ssvt-textile-secret',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({ checkPeriod: 86400000 }),
    cookie: { maxAge: 86400000 }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) return done(null, false);
      if (user.password !== password) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Check auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  // Auth routes
  app.post(api.auth.login.path, passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Parties
  app.get(api.parties.list.path, requireAuth, async (req, res) => {
    const parties = await storage.getParties();
    res.json(parties);
  });

  app.post(api.parties.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.parties.create.input.parse(req.body);
      const party = await storage.createParty({
        ...input,
        pick: String(input.pick),
        reed: String(input.reed)
      });
      // create user for party automatically
      await storage.createUser({
        username: party.partyName,
        password: `${party.partyName}${party.powerLoom}`,
        role: 'party',
        partyId: party.id
      });
      res.status(201).json(party);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else res.status(500).json({ message: "Internal Error" });
    }
  });

  app.put(api.parties.update.path, requireAdmin, async (req, res) => {
    try {
      const input = api.parties.update.input.parse(req.body);
      const party = await storage.updateParty(Number(req.params.id), {
        ...input,
        ...(input.pick && { pick: String(input.pick) }),
        ...(input.reed && { reed: String(input.reed) })
      });
      res.json(party);
    } catch (err) {
       res.status(400).json({ message: "Invalid input" });
    }
  });

  // Received Meters
  app.get(api.receivedMeters.list.path, requireAuth, async (req, res) => {
    let meters = await storage.getReceivedMeters();
    if (req.user && (req.user as User).role === 'party') {
      meters = meters.filter(m => m.partyId === (req.user as User).partyId);
    }
    res.json(meters);
  });

  app.post(api.receivedMeters.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.receivedMeters.create.input.parse(req.body);
      const item = await storage.createReceivedMeter(input);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Delivery Bags
  app.get(api.deliveryBags.list.path, requireAuth, async (req, res) => {
    let bags = await storage.getDeliveryBags();
    if (req.user && (req.user as User).role === 'party') {
      bags = bags.filter(m => m.partyId === (req.user as User).partyId);
    }
    res.json(bags);
  });

  app.post(api.deliveryBags.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.deliveryBags.create.input.parse(req.body);
      const item = await storage.createDeliveryBag(input);
      res.status(201).json(item);
    } catch(e) { res.status(400).json({ message: "Invalid input" }) }
  });

  // Delivery Beams
  app.get(api.deliveryBeams.list.path, requireAuth, async (req, res) => {
    let beams = await storage.getDeliveryBeams();
    if (req.user && (req.user as User).role === 'party') {
      beams = beams.filter(m => m.partyId === (req.user as User).partyId);
    }
    res.json(beams);
  });

  app.post(api.deliveryBeams.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.deliveryBeams.create.input.parse(req.body);
      const item = await storage.createDeliveryBeam(input);
      res.status(201).json(item);
    } catch(e) { res.status(400).json({ message: "Invalid input" }) }
  });

  // Salaries
  app.get(api.salaries.list.path, requireAuth, async (req, res) => {
    let salaries = await storage.getSalaries();
    if (req.user && (req.user as User).role === 'party') {
      salaries = salaries.filter(m => m.partyId === (req.user as User).partyId);
    }
    res.json(salaries);
  });

  app.post(api.salaries.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.salaries.create.input.parse(req.body);
      
      // Calculate balance logic. CashPaid vs FinalSalary
      const diff = Number(input.cashPaid) - Number(input.finalSalary);
      // diff > 0 means extra cash paid, add to advance.
      // diff < 0 means less cash paid, deduct from advance (advance increases negatively or debt increases)
      
      await storage.updateAdvanceBalance(input.partyId, diff);
      const item = await storage.createSalary({
          ...input,
          balance: String(diff)
      });
      res.status(201).json(item);
    } catch(e) { res.status(400).json({ message: "Invalid input" }) }
  });

  // Advances
  app.get(api.advances.list.path, requireAuth, async (req, res) => {
    let advances = await storage.getAdvances();
    if (req.user && (req.user as User).role === 'party') {
      advances = advances.filter(m => m.partyId === (req.user as User).partyId);
    }
    res.json(advances);
  });

  app.post(api.advances.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.advances.create.input.parse(req.body);
      const party = await storage.getParty(input.partyId);
      if (!party) return res.status(404).json({ message: "Party not found" });

      const newBalance = Number(party.advanceBalance) + Number(input.amount);
      await storage.updateAdvanceBalance(input.partyId, Number(input.amount));
      
      const item = await storage.createAdvance({
        ...input,
        balance: String(newBalance)
      });
      res.status(201).json(item);
    } catch(e) { res.status(400).json({ message: "Invalid input" }) }
  });

  // Notes
  app.get(api.notes.list.path, requireAdmin, async (req, res) => {
    const notesList = await storage.getNotes();
    res.json(notesList);
  });

  app.post(api.notes.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.notes.create.input.parse(req.body);
      const item = await storage.createNote(input);
      res.status(201).json(item);
    } catch(e) { res.status(400).json({ message: "Invalid input" }) }
  });

  // Dashboard Stats
  app.get(api.dashboard.stats.path, requireAuth, async (req, res) => {
    // For simplicity, just return aggregated mock/real stats
    const meters = await storage.getReceivedMeters();
    const parties = await storage.getParties();
    const advances = await storage.getAdvances();
    const salaries = await storage.getSalaries();

    // Summing logic (basic implementation)
    const todayReceivedMeter = meters.reduce((sum, m) => sum + Number(m.meter), 0); // Need actual date filtering for prod
    const weeklyMeterTotal = todayReceivedMeter * 7; 
    const totalParties = parties.length;
    const totalAdvance = parties.reduce((sum, p) => sum + Number(p.advanceBalance), 0);
    const pendingSalary = salaries.reduce((sum, s) => sum + Number(s.finalSalary), 0);

    const activity = [
      ...meters.map(m => ({ id: `m-${m.id}`, date: m.createdAt.toISOString(), partyName: "Party "+m.partyId, activity: "Received", amount: Number(m.meter) })),
      ...salaries.map(s => ({ id: `s-${s.id}`, date: s.createdAt.toISOString(), partyName: "Party "+s.partyId, activity: "Salary", amount: Number(s.finalSalary) }))
    ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    res.json({
      todayReceivedMeter,
      weeklyMeterTotal,
      totalParties,
      totalAdvance,
      pendingSalary,
      weeklyChart: [
        { name: 'Mon', meters: 4000 },
        { name: 'Tue', meters: 3000 },
        { name: 'Wed', meters: 2000 },
        { name: 'Thu', meters: 2780 },
        { name: 'Fri', meters: 1890 },
        { name: 'Sat', meters: 2390 },
        { name: 'Sun', meters: 3490 },
      ],
      recentActivity: activity
    });
  });

  app.get('/api/statement/:partyId', requireAuth, async (req, res) => {
    const partyId = parseInt(req.params.partyId);
    
    // Authorization check
    if ((req.user as User).role === 'party' && (req.user as User).partyId !== partyId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const meters = await storage.getReceivedMeters();
    const bBags = await storage.getDeliveryBags();
    const bBeams = await storage.getDeliveryBeams();
    const sals = await storage.getSalaries();
    const advs = await storage.getAdvances();

    const statement: any[] = [];
    
    meters.filter(m => m.partyId === partyId).forEach(m => {
      statement.push({ id: `rm-${m.id}`, date: m.createdAt.toISOString(), description: 'Received Meter', meter: Number(m.meter), cash: null });
    });
    
    bBeams.filter(b => b.partyId === partyId).forEach(b => {
      statement.push({ id: `db-${b.id}`, date: b.createdAt.toISOString(), description: `Beam Delivery (${b.beamCount})`, meter: Number(b.totalMeter), cash: null });
    });

    sals.filter(s => s.partyId === partyId).forEach(s => {
      statement.push({ id: `s-${s.id}`, date: s.createdAt.toISOString(), description: 'Salary Paid', meter: null, cash: Number(s.cashPaid) });
    });
    
    advs.filter(a => a.partyId === partyId).forEach(a => {
      statement.push({ id: `a-${a.id}`, date: a.createdAt.toISOString(), description: `Advance: ${a.reason}`, meter: null, cash: Number(a.amount) });
    });

    statement.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    res.json(statement);
  });

  app.get(api.reports.weekly.path, requireAdmin, async (req, res) => {
    res.json([{ partyName: "Mock Party", week1: 1000, week2: 1200, week3: 900, week4: 1500, total: 4600 }]);
  });

  app.get(api.reports.monthly.path, requireAdmin, async (req, res) => {
    res.json([{ partyName: "Mock Party", totalMeter: 4600, salary: 50000, rent: 2000, advance: 500, paid: 47500 }]);
  });

  // Initialization Seed
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const admin = await storage.getUserByUsername('admin');
  if (!admin) {
    await storage.createUser({
      username: 'admin',
      password: 'admin000',
      role: 'admin',
      partyId: null
    });
  }
}
