import { eq, and, or, gte, lte, like, inArray, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  userSessions,
  activityLogs,
  categories,
  products,
  productImages,
  accounts,
  carts,
  orders,
  orderItems,
  coupons,
  favorites,
  wishlists,
  reviews,
  payments,
  paymentLogs,
  tickets,
  ticketMessages,
  ticketAttachments,
  notifications,
  pages,
  announcements,
  adminSettings,
  securityLogs,
  ipBlocklist,
  InsertUser,
  InsertActivityLog,
  InsertProduct,
  InsertAccount,
  InsertOrder,
  InsertOrderItem,
  InsertPayment,
  InsertTicket,
  InsertTicketMessage,
  InsertNotification,
  InsertSecurityLog,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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

// ============================================================================
// USER MANAGEMENT
// ============================================================================

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
      values.role = "admin";
      updateSet.role = "admin";
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
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserSecuritySettings(
  userId: number,
  settings: {
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string | null;
    passwordHash?: string | null;
  }
) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .update(users)
    .set({
      ...settings,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function blockUser(userId: number, reason: string) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .update(users)
    .set({
      isBlocked: true,
      blockedReason: reason,
      blockedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function unblockUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .update(users)
    .set({
      isBlocked: false,
      blockedReason: null,
      blockedAt: null,
    })
    .where(eq(users.id, userId));
}

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

export async function logActivity(log: InsertActivityLog) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(activityLogs).values(log);
}

export async function getUserActivityLogs(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy((t) => t.createdAt)
    .limit(limit);
}

// ============================================================================
// SECURITY LOGS
// ============================================================================

export async function logSecurityEvent(log: InsertSecurityLog) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(securityLogs).values(log);
}

export async function blockIpAddress(ipAddress: string, reason: string) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(ipBlocklist).values({
    ipAddress,
    reason,
  });
}

export async function isIpBlocked(ipAddress: string) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(ipBlocklist)
    .where(
      and(
        eq(ipBlocklist.ipAddress, ipAddress),
        or(
          isNull(ipBlocklist.expiresAt),
          gte(ipBlocklist.expiresAt, new Date())
        )
      )
    )
    .limit(1);

  return result.length > 0;
}

// ============================================================================
// PRODUCTS & CATALOG
// ============================================================================

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy((t) => t.displayOrder);
}

export async function getProductsByCategory(categoryId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.categoryId, categoryId),
        eq(products.isActive, true)
      )
    )
    .limit(limit);
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function searchProducts(query: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        or(
          like(products.name, `%${query}%`),
          like(products.description, `%${query}%`),
          like(products.platform, `%${query}%`)
        )
      )
    )
    .limit(limit);
}

export async function getProductImages(productId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy((t) => t.displayOrder);
}

// ============================================================================
// ACCOUNTS (Digital Credentials)
// ============================================================================

export async function getAvailableAccountForProduct(productId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.productId, productId),
        eq(accounts.status, "available")
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function markAccountAsSold(accountId: number) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .update(accounts)
    .set({
      status: "sold",
      soldAt: new Date(),
    })
    .where(eq(accounts.id, accountId));
}

export async function getProductAccountCount(productId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: accounts.id })
    .from(accounts)
    .where(
      and(
        eq(accounts.productId, productId),
        eq(accounts.status, "available")
      )
    );

  return result.length > 0 ? result[0].count : 0;
}

// ============================================================================
// CART MANAGEMENT
// ============================================================================

export async function addToCart(userId: number, productId: number, quantity = 1) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .insert(carts)
    .values({ userId, productId, quantity })
    .onDuplicateKeyUpdate({
      set: { quantity },
    });
}

export async function getUserCart(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId));
}

export async function removeFromCart(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .delete(carts)
    .where(
      and(
        eq(carts.userId, userId),
        eq(carts.productId, productId)
      )
    );
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.delete(carts).where(eq(carts.userId, userId));
}

// ============================================================================
// ORDERS
// ============================================================================

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(orders).values(order);
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy((t) => t.createdAt);
}

export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "paid" | "delivered" | "cancelled" | "refunded"
) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .update(orders)
    .set({
      status,
      deliveredAt: status === "delivered" ? new Date() : undefined,
    })
    .where(eq(orders.id, orderId));
}

// ============================================================================
// ORDER ITEMS
// ============================================================================

export async function createOrderItem(item: InsertOrderItem) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(orderItems).values(item);
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
}

// ============================================================================
// COUPONS
// ============================================================================

export async function getCouponByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(coupons)
    .where(
      and(
        eq(coupons.code, code),
        eq(coupons.isActive, true)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function validateCoupon(
  couponCode: string,
  productId?: number,
  categoryId?: number
) {
  const coupon = await getCouponByCode(couponCode);
  if (!coupon) return null;

  // Check expiration
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return null;
  }

  // Check max uses
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    return null;
  }

  // Check product/category scope
  if (productId && coupon.applicableProducts) {
    const applicableProducts = coupon.applicableProducts as number[];
    if (!applicableProducts.includes(productId)) {
      return null;
    }
  }

  if (categoryId && coupon.applicableCategories) {
    const applicableCategories = coupon.applicableCategories as number[];
    if (!applicableCategories.includes(categoryId)) {
      return null;
    }
  }

  return coupon;
}

export async function incrementCouponUsage(couponId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const coupon = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, couponId))
    .limit(1);

  if (!coupon || coupon.length === 0) return undefined;

  return await db
    .update(coupons)
    .set({
      currentUses: (coupon[0].currentUses || 0) + 1,
    })
    .where(eq(coupons.id, couponId));
}

// ============================================================================
// FAVORITES & WISHLIST
// ============================================================================

export async function addToFavorites(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .insert(favorites)
    .values({ userId, productId })
    .onDuplicateKeyUpdate({
      set: {},
    });
}

export async function removeFromFavorites(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.productId, productId)
      )
    );
}

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(favorites)
    .where(eq(favorites.userId, userId));
}

export async function addToWishlist(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .insert(wishlists)
    .values({ userId, productId })
    .onDuplicateKeyUpdate({
      set: {},
    });
}

export async function removeFromWishlist(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .delete(wishlists)
    .where(
      and(
        eq(wishlists.userId, userId),
        eq(wishlists.productId, productId)
      )
    );
}

export async function getUserWishlist(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.userId, userId));
}

// ============================================================================
// REVIEWS
// ============================================================================

export async function createReview(review: typeof reviews.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(reviews).values(review);
}

export async function getProductReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.productId, productId),
        eq(reviews.isApproved, true)
      )
    )
    .orderBy((t) => t.createdAt);
}

export async function getPendingReviews() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.isApproved, false))
    .orderBy((t) => t.createdAt);
}

export async function approveReview(reviewId: number) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .update(reviews)
    .set({
      isApproved: true,
      approvedAt: new Date(),
    })
    .where(eq(reviews.id, reviewId));
}

// ============================================================================
// PAYMENTS
// ============================================================================

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(payments).values(payment);
}

export async function getPaymentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderPayment(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentStatus(
  paymentId: number,
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded"
) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .update(payments)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(payments.id, paymentId));
}

export async function logPaymentEvent(log: typeof paymentLogs.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(paymentLogs).values(log);
}

// ============================================================================
// TICKETS
// ============================================================================

export async function createTicket(ticket: InsertTicket) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(tickets).values(ticket);
}

export async function getTicketById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserTickets(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tickets)
    .where(eq(tickets.userId, userId))
    .orderBy((t) => t.createdAt);
}

export async function updateTicketStatus(
  ticketId: number,
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed"
) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .update(tickets)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, ticketId));
}

// ============================================================================
// TICKET MESSAGES
// ============================================================================

export async function createTicketMessage(message: InsertTicketMessage) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(ticketMessages).values(message);
}

export async function getTicketMessages(ticketId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(ticketMessages)
    .where(eq(ticketMessages.ticketId, ticketId))
    .orderBy((t) => t.createdAt);
}

export async function createTicketAttachment(attachment: typeof ticketAttachments.$inferInsert) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(ticketAttachments).values(attachment);
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(notifications).values(notification);
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy((t) => t.createdAt);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(eq(notifications.id, notificationId));
}

// ============================================================================
// STATIC PAGES
// ============================================================================

export async function getPageBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.slug, slug),
        eq(pages.isPublished, true)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAnnouncements() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(announcements)
    .where(
      and(
        eq(announcements.isActive, true),
        or(
          isNull(announcements.expiresAt),
          gte(announcements.expiresAt, new Date())
        )
      )
    )
    .orderBy((t) => t.displayOrder);
}

// ============================================================================
// ADMIN SETTINGS
// ============================================================================

export async function getAdminSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(adminSettings)
    .where(eq(adminSettings.key, key))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function setAdminSetting(key: string, value: unknown) {
  const db = await getDb();
  if (!db) return undefined;

  return await db
    .insert(adminSettings)
    .values({ key, value })
    .onDuplicateKeyUpdate({
      set: { value },
    });
}
