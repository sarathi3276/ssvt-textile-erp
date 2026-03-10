import type { Express } from "express";
import type { Server } from "http";
import { eq } from "drizzle-orm";
import { 
  parties,
  receivedMeters,
  deliveryBags,
  deliveryBeams,
  salaries,
  advances
} from "@shared/schema";

import { db } from "./db";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "@shared/schema";
import MemoryStore from "memorystore";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  const SessionStore = MemoryStore(session);

  app.use(session({
    secret: process.env.SESSION_SECRET || "ssvt-textile-secret",
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

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()){ return res.status(401).json({ message: "Unauthorized" });}
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  /* ---------------- LOGIN ---------------- */

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) 
      res.json(req.user);
    else res.redirect("/");
  });
 

  /* ---------------- PARTIES ---------------- */

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

      await storage.createUser({
        username: party.partyName,
        password: `${party.partyName}${party.powerLoom}`,
        role: "party",
        partyId: party.id
      });

      res.status(201).json(party);

    } catch (err) {

      if (err instanceof z.ZodError)
        res.status(400).json({ message: err.errors[0].message });
      else
        res.status(500).json({ message: "Internal Error" });

    }

  });
   /* DELETE PARTY */

  app.delete("/api/parties/:id", requireAdmin, async (req, res) => {

    const id = Number(req.params.id);

    try {

      await storage.deleteParty(id);

      res.json({ message: "Party deleted successfully" });

    } catch (error) {

      res.status(500).json({ message: "Delete failed" });

    }

  });
  

  /* ---------------- RECEIVED METERS ---------------- */

  app.get(api.receivedMeters.list.path, requireAuth, async (req, res) => {

    let meters = await storage.getReceivedMeters();

    if (req.user && (req.user as User).role === "party") {
      meters = meters.filter(m => m.partyId === (req.user as User).partyId);
    }

    res.json(meters);

  });

  app.post(api.receivedMeters.create.path, requireAdmin, async (req, res) => {

    try {
      const input = api.receivedMeters.create.input.parse(req.body);
      const item = await storage.createReceivedMeter(input);
      res.status(201).json(item);
    } catch {
      res.status(400).json({ message: "Invalid input" });
    }

  });

  /* ---------------- DELIVERY BAGS ---------------- */

  app.get(api.deliveryBags.list.path, requireAuth, async (req, res) => {

    let bags = await storage.getDeliveryBags();

    if (req.user && (req.user as User).role === "party") {
      bags = bags.filter(b => b.partyId === (req.user as User).partyId);
    }

    res.json(bags);

  });

  app.post(api.deliveryBags.create.path, requireAdmin, async (req, res) => {

    try {
      const input = api.deliveryBags.create.input.parse(req.body);
      const item = await storage.createDeliveryBag(input);
      res.status(201).json(item);
    } catch {
      res.status(400).json({ message: "Invalid input" });
    }

  });

  /* ---------------- DELIVERY BEAMS ---------------- */

  app.get(api.deliveryBeams.list.path, requireAuth, async (req, res) => {

    let beams = await storage.getDeliveryBeams();

    if (req.user && (req.user as User).role === "party") {
      beams = beams.filter(b => b.partyId === (req.user as User).partyId);
    }

    res.json(beams);

  });

  app.post(api.deliveryBeams.create.path, requireAdmin, async (req, res) => {

    try {
      const input = api.deliveryBeams.create.input.parse(req.body);
      const item = await storage.createDeliveryBeam(input);
      res.status(201).json(item);
    } catch {
      res.status(400).json({ message: "Invalid input" });
    }

  });

  /* ---------------- SALARY ---------------- */

  app.get(api.salaries.list.path, requireAuth, async (req, res) => {

    let salaries = await storage.getSalaries();

    if (req.user && (req.user as User).role === "party") {
      salaries = salaries.filter(s => s.partyId === (req.user as User).partyId);
    }

    res.json(salaries);

  });

  app.post(api.salaries.create.path, requireAdmin, async (req, res) => {

    try {

      const input = api.salaries.create.input.parse(req.body);

      const diff = Number(input.cashPaid) - Number(input.finalSalary);

      await storage.updateAdvanceBalance(input.partyId, diff);

      const item = await storage.createSalary({
        ...input,
        balance: String(diff)
      });

      res.status(201).json(item);

    } catch {

      res.status(400).json({ message: "Invalid input" });

    }

  });

  /* ---------------- ADVANCES ---------------- */

  app.get(api.advances.list.path, requireAuth, async (req, res) => {

    let advances = await storage.getAdvances();

    if (req.user && (req.user as User).role === "party") {
      advances = advances.filter(a => a.partyId === (req.user as User).partyId);
    }

    res.json(advances);

  });

  app.post(api.advances.create.path, requireAdmin, async (req, res) => {

    try {

      const input = api.advances.create.input.parse(req.body);

      const party = await storage.getParty(input.partyId);

      const newBalance = Number(party.advanceBalance) + Number(input.amount);

      await storage.updateAdvanceBalance(input.partyId, Number(input.amount));

      const item = await storage.createAdvance({
        ...input,
        balance: String(newBalance)
      });

      res.status(201).json(item);

    } catch {

      res.status(400).json({ message: "Invalid input" });

    }

  });
  /* ---------------- WEEKLY REPORT ---------------- */

app.get("/api/reports/weekly", requireAuth, async (req, res) => {

  const salaries = await storage.getSalaries();
  const parties = await storage.getParties();

  const report = parties.map(p => {

    const weeks = [0,0,0,0];

    salaries
      .filter(s => s.partyId === p.id)
      .forEach(s => {

        const day = new Date(s.createdAt).getDate();
        const week = Math.ceil(day / 7);

        if (week >=1 && week <=4) {
          weeks[week-1] += Number(s.finalSalary);
        }

      });

    return {
      partyName: p.partyName,
      week1: weeks[0],
      week2: weeks[1],
      week3: weeks[2],
      week4: weeks[3],
      total: weeks.reduce((a,b)=>a+b,0)
    };

  });

  res.json(report);

});
/* -------- DELETE RECEIVED METER -------- */

app.delete("/api/received-meter/:id", requireAdmin, async (req, res) => {

  const id = Number(req.params.id);

  await db.delete(receivedMeters).where(eq(receivedMeters.id, id));

  res.json({ message: "Deleted" });

});


/* -------- DELETE BAG DELIVERY -------- */

app.delete("/api/bag-delivery/:id", requireAdmin, async (req, res) => {

  const id = Number(req.params.id);

  await db.delete(deliveryBags).where(eq(deliveryBags.id, id));

  res.json({ message: "Deleted" });

});


/* -------- DELETE BEAM DELIVERY -------- */

app.delete("/api/beam-delivery/:id", requireAdmin, async (req, res) => {

  const id = Number(req.params.id);

  await db.delete(deliveryBeams).where(eq(deliveryBeams.id, id));

  res.json({ message: "Deleted" });

});


/* -------- DELETE SALARY -------- */

app.delete("/api/salary/:id", requireAdmin, async (req, res) => {

  const id = Number(req.params.id);

  await db.delete(salaries).where(eq(salaries.id, id));

  res.json({ message: "Deleted" });

});


/* -------- DELETE ADVANCE -------- */

app.delete("/api/advance/:id", requireAdmin, async (req, res) => {

  const id = Number(req.params.id);

  await db.delete(advances).where(eq(advances.id, id));

  res.json({ message: "Deleted" });

});
/* ---------------- MONTHLY REPORT ---------------- */

app.get("/api/reports/monthly", requireAuth, async (req, res) => {

  const salaries = await storage.getSalaries();
  const parties = await storage.getParties();
  const advances = await storage.getAdvances();

  const report = parties.map(p => {

    const partySalaries = salaries.filter(s => s.partyId === p.id);
    const partyAdv = advances.filter(a => a.partyId === p.id);

    const totalMeter = partySalaries.reduce((a,b)=>a+Number(b.totalMeter),0);
    const salary = partySalaries.reduce((a,b)=>a+Number(b.salary),0);
    const rent = partySalaries.reduce((a,b)=>a+Number(b.rent),0);
    const advance = partyAdv.reduce((a,b)=>a+Number(b.amount),0);
    const paid = partySalaries.reduce((a,b)=>a+Number(b.cashPaid),0);

    return {
      partyName: p.partyName,
      totalMeter,
      salary,
      rent,
      advance,
      paid
    };

  });

  res.json(report);

});
  /* ---------------- STATEMENT ---------------- */

  app.get("/api/statement/:partyId", requireAuth, async (req, res) => {

    const partyId = parseInt(req.params.partyId);

    const meters = await storage.getReceivedMeters();
    const bags = await storage.getDeliveryBags();
    const beams = await storage.getDeliveryBeams();
    const salaries = await storage.getSalaries();
    const advances = await storage.getAdvances();

    const statement: any[] = [];

    meters.filter(m => m.partyId === partyId).forEach(m => {
      statement.push({
        date: m.createdAt,
        description: "Received Meter",
        meter: m.meter,
        cash: null
      });
    });

    bags.filter(b => b.partyId === partyId).forEach(b => {
      statement.push({
        date: b.createdAt,
        description: `Bag Delivery (${b.numberOfBags})`,
        meter: null,
        cash: null
      });
    });

    beams.filter(b => b.partyId === partyId).forEach(b => {
      statement.push({
        date: b.createdAt,
        description: `Beam Delivery (${b.beamCount})`,
        meter: b.totalMeter,
        cash: null
      });
    });

    salaries.filter(s => s.partyId === partyId).forEach(s => {
      statement.push({
        date: s.createdAt,
        description: "Salary Paid",
        meter: null,
        cash: s.cashPaid
      });
    });

    advances.filter(a => a.partyId === partyId).forEach(a => {
      statement.push({
        date: a.createdAt,
        description: `Advance - ${a.reason}`,
        meter: null,
        cash: a.amount
      });
    });

    statement.sort((a,b)=> new Date(a.date).getTime()-new Date(b.date).getTime());

    res.json(statement);

  });
  /* ---------------- DASHBOARD STATS ---------------- */

app.get("/api/dashboard/stats", requireAuth, async (req, res) => {

  const parties = await storage.getParties();
  const meters = await storage.getReceivedMeters();
  const salaries = await storage.getSalaries();
  const advances = await storage.getAdvances();

  const today = new Date().toDateString();

  const todayReceivedMeter = meters
    .filter(m => new Date(m.createdAt).toDateString() === today)
    .reduce((a,b)=>a+Number(b.meter),0);

  const weeklyMeterTotal = meters
    .slice(0,7)
    .reduce((a,b)=>a+Number(b.meter),0);

  const totalParties = parties.length;

  const pendingSalary = salaries
    .filter(s => Number(s.balance) > 0)
    .reduce((a,b)=>a+Number(b.balance),0);

  const totalAdvance = advances
    .reduce((a,b)=>a+Number(b.amount),0);

  const weeklyChart = meters.slice(0,7).map((m,i)=>({
    name:`Day ${i+1}`,
    meters:Number(m.meter)
  }));

  const recentActivity = meters.slice(0,10).map(m=>({
    partyName:"Party",
    activity:"Received Meter",
    amount:Number(m.meter),
    date:m.createdAt
  }));

  res.json({
    todayReceivedMeter,
    weeklyMeterTotal,
    totalParties,
    pendingSalary,
    totalAdvance,
    weeklyChart,
    recentActivity
  });

});

  seedDatabase();
 
  return httpServer;

}

async function seedDatabase() {

  const admin = await storage.getUserByUsername("admin");

  if (!admin) {

    await storage.createUser({
      username: "admin",
      password: "admin000",
      role: "admin",
      partyId: null
    });

  }

}