import { z } from 'zod';
import { 
  insertUserSchema, users,
  insertPartySchema, parties,
  insertReceivedMeterSchema, receivedMeters,
  insertDeliveryBagSchema, deliveryBags,
  insertDeliveryBeamSchema, deliveryBeams,
  insertSalarySchema, salaries,
  insertAdvanceSchema, advances,
  insertNoteSchema, notes
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: { 200: z.object({ message: z.string() }) }
    },
    me: {
      method: 'GET' as const,
      path: '/api/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  parties: {
    list: {
      method: 'GET' as const,
      path: '/api/parties' as const,
      responses: { 200: z.array(z.custom<typeof parties.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/parties' as const,
      input: insertPartySchema,
      responses: { 201: z.custom<typeof parties.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/parties/:id' as const,
      input: insertPartySchema.partial(),
      responses: { 200: z.custom<typeof parties.$inferSelect>(), 404: errorSchemas.notFound }
    }
  },
  receivedMeters: {
    list: {
      method: 'GET' as const,
      path: '/api/received-meters' as const,
      responses: { 200: z.array(z.custom<typeof receivedMeters.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/received-meters' as const,
      input: insertReceivedMeterSchema,
      responses: { 201: z.custom<typeof receivedMeters.$inferSelect>(), 400: errorSchemas.validation }
    }
  },
  deliveryBags: {
    list: {
      method: 'GET' as const,
      path: '/api/delivery-bags' as const,
      responses: { 200: z.array(z.custom<typeof deliveryBags.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/delivery-bags' as const,
      input: insertDeliveryBagSchema,
      responses: { 201: z.custom<typeof deliveryBags.$inferSelect>(), 400: errorSchemas.validation }
    }
  },
  deliveryBeams: {
    list: {
      method: 'GET' as const,
      path: '/api/delivery-beams' as const,
      responses: { 200: z.array(z.custom<typeof deliveryBeams.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/delivery-beams' as const,
      input: insertDeliveryBeamSchema,
      responses: { 201: z.custom<typeof deliveryBeams.$inferSelect>(), 400: errorSchemas.validation }
    }
  },
  salaries: {
    list: {
      method: 'GET' as const,
      path: '/api/salaries' as const,
      responses: { 200: z.array(z.custom<typeof salaries.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/salaries' as const,
      input: insertSalarySchema,
      responses: { 201: z.custom<typeof salaries.$inferSelect>(), 400: errorSchemas.validation }
    }
  },
  advances: {
    list: {
      method: 'GET' as const,
      path: '/api/advances' as const,
      responses: { 200: z.array(z.custom<typeof advances.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/advances' as const,
      input: insertAdvanceSchema,
      responses: { 201: z.custom<typeof advances.$inferSelect>(), 400: errorSchemas.validation }
    }
  },
  notes: {
    list: {
      method: 'GET' as const,
      path: '/api/notes' as const,
      responses: { 200: z.array(z.custom<typeof notes.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/notes' as const,
      input: insertNoteSchema,
      responses: { 201: z.custom<typeof notes.$inferSelect>(), 400: errorSchemas.validation }
    }
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats' as const,
      responses: {
        200: z.object({
          todayReceivedMeter: z.number(),
          weeklyMeterTotal: z.number(),
          totalParties: z.number(),
          totalAdvance: z.number(),
          pendingSalary: z.number(),
          weeklyChart: z.array(z.object({ name: z.string(), meters: z.number() })),
          recentActivity: z.array(z.object({
            id: z.string(),
            date: z.string(),
            partyName: z.string(),
            activity: z.string(),
            amount: z.number()
          }))
        })
      }
    }
  },
  statement: {
    get: {
      method: 'GET' as const,
      path: '/api/statement/:partyId' as const,
      responses: {
        200: z.array(z.object({
          id: z.string(),
          date: z.string(),
          description: z.string(),
          meter: z.number().nullable(),
          cash: z.number().nullable()
        }))
      }
    }
  },
  reports: {
    weekly: {
      method: 'GET' as const,
      path: '/api/reports/weekly' as const,
      responses: {
        200: z.array(z.object({
          partyName: z.string(),
          week1: z.number(),
          week2: z.number(),
          week3: z.number(),
          week4: z.number(),
          total: z.number()
        }))
      }
    },
    monthly: {
      method: 'GET' as const,
      path: '/api/reports/monthly' as const,
      responses: {
        200: z.array(z.object({
          partyName: z.string(),
          totalMeter: z.number(),
          salary: z.number(),
          rent: z.number(),
          advance: z.number(),
          paid: z.number()
        }))
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
