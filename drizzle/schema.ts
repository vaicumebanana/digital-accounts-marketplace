import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  longtext,
  datetime,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    email: varchar("email", { length: 320 }).unique(),
    name: text("name"),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    
    // Security
    twoFactorEnabled: boolean("twoFactorEnabled").default(false).notNull(),
    twoFactorSecret: varchar("twoFactorSecret", { length: 255 }),
    passwordHash: varchar("passwordHash", { length: 255 }),
    
    // Account status
    isActive: boolean("isActive").default(true).notNull(),
    isBlocked: boolean("isBlocked").default(false).notNull(),
    blockedReason: text("blockedReason"),
    blockedAt: timestamp("blockedAt"),
    
    // Metadata
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
    lastIpAddress: varchar("lastIpAddress", { length: 45 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    openIdIdx: index("openId_idx").on(table.openId),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// User sessions for activity tracking
export const userSessions = mysqlTable(
  "user_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    sessionToken: varchar("sessionToken", { length: 255 }).unique().notNull(),
    ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
    userAgent: text("userAgent"),
    isActive: boolean("isActive").default(true).notNull(),
    lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userSessions_userId_idx").on(table.userId),
    sessionTokenIdx: index("sessionToken_idx").on(table.sessionToken),
  })
);

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

// Activity logs for security auditing
export const activityLogs = mysqlTable(
  "activity_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entityType", { length: 50 }),
    entityId: int("entityId"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    details: json("details"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("activityLogs_userId_idx").on(table.userId),
    actionIdx: index("action_idx").on(table.action),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// ============================================================================
// PRODUCTS & CATALOG
// ============================================================================

export const categories = mysqlTable(
  "categories",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    imageUrl: varchar("imageUrl", { length: 500 }),
    displayOrder: int("displayOrder").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    slugIdx: index("categories_slug_idx").on(table.slug),
  })
);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("categoryId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: longtext("description"),
    platform: varchar("platform", { length: 100 }).notNull(), // e.g., "Netflix", "Spotify"
    language: varchar("language", { length: 10 }).notNull(), // e.g., "pt-BR", "en", "es"
    
    // Pricing
    basePrice: decimal("basePrice", { precision: 10, scale: 2 }).notNull(),
    discountPercentage: decimal("discountPercentage", { precision: 5, scale: 2 }).default("0"),
    finalPrice: decimal("finalPrice", { precision: 10, scale: 2 }).notNull(),
    
    // Inventory
    totalStock: int("totalStock").notNull(),
    availableStock: int("availableStock").notNull(),
    
    // Metadata
    warranty: varchar("warranty", { length: 100 }), // e.g., "30 days", "1 year"
    type: mysqlEnum("type", ["account", "key", "gift_card", "license", "subscription"]).notNull(),
    tags: json("tags"), // Array of tags
    
    // SEO & Display
    metaDescription: varchar("metaDescription", { length: 160 }),
    metaKeywords: varchar("metaKeywords", { length: 255 }),
    
    // Status
    isActive: boolean("isActive").default(true).notNull(),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    
    // Tracking
    totalSold: int("totalSold").default(0).notNull(),
    averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0"),
    reviewCount: int("reviewCount").default(0).notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    categoryIdIdx: index("products_categoryId_idx").on(table.categoryId),
    slugIdx: index("products_slug_idx").on(table.slug),
    platformIdx: index("platform_idx").on(table.platform),
    languageIdx: index("language_idx").on(table.language),
    isActiveIdx: index("products_isActive_idx").on(table.isActive),
    isFeaturedIdx: index("isFeatured_idx").on(table.isFeatured),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const productImages = mysqlTable(
  "product_images",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
    altText: varchar("altText", { length: 255 }),
    displayOrder: int("displayOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    productIdIdx: index("productImages_productId_idx").on(table.productId),
  })
);

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;

// ============================================================================
// ACCOUNTS (Digital Credentials)
// ============================================================================

export const accounts = mysqlTable(
  "accounts",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    login: varchar("login", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }),
    emailPassword: varchar("emailPassword", { length: 255 }),
    notes: text("notes"),
    
    // Status
    status: mysqlEnum("status", ["available", "sold", "reserved"]).default("available").notNull(),
    soldAt: timestamp("soldAt"),
    
    // Tracking
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    productIdIdx: index("accounts_productId_idx").on(table.productId),
    statusIdx: index("accounts_status_idx").on(table.status),
  })
);

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

// ============================================================================
// SHOPPING & ORDERS
// ============================================================================

export const carts = mysqlTable(
  "carts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    productId: int("productId").notNull(),
    quantity: int("quantity").default(1).notNull(),
    addedAt: timestamp("addedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("carts_userId_idx").on(table.userId),
    userProductIdx: uniqueIndex("carts_userId_productId_idx").on(table.userId, table.productId),
  })
);

export type Cart = typeof carts.$inferSelect;
export type InsertCart = typeof carts.$inferInsert;

export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    orderNumber: varchar("orderNumber", { length: 50 }).unique().notNull(),
    
    // Pricing
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0"),
    totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
    
    // Coupon
    couponId: int("couponId"),
    couponCode: varchar("couponCode", { length: 50 }),
    
    // Status
    status: mysqlEnum("status", ["pending", "paid", "delivered", "cancelled", "refunded"]).default("pending").notNull(),
    
    // Delivery
    deliveredAt: timestamp("deliveredAt"),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("orders_userId_idx").on(table.userId),
    orderNumberIdx: index("orderNumber_idx").on(table.orderNumber),
    statusIdx: index("orders_status_idx").on(table.status),
    createdAtIdx: index("orders_createdAt_idx").on(table.createdAt),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const orderItems = mysqlTable(
  "order_items",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    productId: int("productId").notNull(),
    accountId: int("accountId"),
    quantity: int("quantity").default(1).notNull(),
    priceAtPurchase: decimal("priceAtPurchase", { precision: 10, scale: 2 }).notNull(),
    
    // Account delivery
    login: varchar("login", { length: 255 }),
    password: varchar("password", { length: 255 }),
    email: varchar("email", { length: 320 }),
    emailPassword: varchar("emailPassword", { length: 255 }),
    warranty: varchar("warranty", { length: 100 }),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("orderItems_orderId_idx").on(table.orderId),
    productIdIdx: index("orderItems_productId_idx").on(table.productId),
  })
);

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ============================================================================
// COUPONS & DISCOUNTS
// ============================================================================

export const coupons = mysqlTable(
  "coupons",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 50 }).unique().notNull(),
    
    // Discount type
    discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
    discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
    
    // Restrictions
    maxUses: int("maxUses"),
    currentUses: int("currentUses").default(0).notNull(),
    isOneTimeUse: boolean("isOneTimeUse").default(false).notNull(),
    
    // Scope
    applicableCategories: json("applicableCategories"), // Array of category IDs or null for all
    applicableProducts: json("applicableProducts"), // Array of product IDs or null for all
    
    // Validity
    expiresAt: timestamp("expiresAt"),
    
    // Status
    isActive: boolean("isActive").default(true).notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIdx: index("coupons_code_idx").on(table.code),
    isActiveIdx: index("coupons_isActive_idx").on(table.isActive),
  })
);

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

// ============================================================================
// FAVORITES & WISHLIST
// ============================================================================

export const favorites = mysqlTable(
  "favorites",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    productId: int("productId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userProductIdx: uniqueIndex("favorites_userId_productId_idx").on(table.userId, table.productId),
    userIdIdx: index("favorites_userId_idx").on(table.userId),
  })
);

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

export const wishlists = mysqlTable(
  "wishlists",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    productId: int("productId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userProductIdx: uniqueIndex("wishlists_userId_productId_idx").on(table.userId, table.productId),
    userIdIdx: index("wishlists_userId_idx").on(table.userId),
  })
);

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;

// ============================================================================
// REVIEWS & RATINGS
// ============================================================================

export const reviews = mysqlTable(
  "reviews",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    userId: int("userId").notNull(),
    orderId: int("orderId"),
    
    rating: int("rating").notNull(), // 1-5
    comment: text("comment"),
    
    // Moderation
    isApproved: boolean("isApproved").default(false).notNull(),
    approvedAt: timestamp("approvedAt"),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    productIdIdx: index("reviews_productId_idx").on(table.productId),
    userIdIdx: index("reviews_userId_idx").on(table.userId),
    isApprovedIdx: index("reviews_isApproved_idx").on(table.isApproved),
  })
);

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ============================================================================
// PAYMENTS
// ============================================================================

export const paymentMethods = mysqlTable(
  "payment_methods",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    type: mysqlEnum("type", ["pix", "paypal", "crypto", "other"]).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    config: json("config"), // Gateway-specific configuration
    displayOrder: int("displayOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

export const payments = mysqlTable(
  "payments",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    userId: int("userId").notNull(),
    paymentMethodId: int("paymentMethodId").notNull(),
    
    // Payment details
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
    
    // External reference
    externalTransactionId: varchar("externalTransactionId", { length: 255 }).unique(),
    
    // Status
    status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled", "refunded"]).default("pending").notNull(),
    
    // Metadata
    metadata: json("metadata"),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("payments_orderId_idx").on(table.orderId),
    userIdIdx: index("payments_userId_idx").on(table.userId),
    statusIdx: index("payments_status_idx").on(table.status),
    externalTransactionIdIdx: index("externalTransactionId_idx").on(table.externalTransactionId),
  })
);

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export const paymentLogs = mysqlTable(
  "payment_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    paymentId: int("paymentId").notNull(),
    event: varchar("event", { length: 100 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    details: json("details"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    paymentIdIdx: index("paymentLogs_paymentId_idx").on(table.paymentId),
    eventIdx: index("event_idx").on(table.event),
  })
);

export type PaymentLog = typeof paymentLogs.$inferSelect;
export type InsertPaymentLog = typeof paymentLogs.$inferInsert;

// ============================================================================
// SUPPORT TICKETS
// ============================================================================

export const tickets = mysqlTable(
  "tickets",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    ticketNumber: varchar("ticketNumber", { length: 50 }).unique().notNull(),
    
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description").notNull(),
    
    // Categorization
    category: varchar("category", { length: 50 }).notNull(),
    priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
    
    // Assignment
    assignedToAdminId: int("assignedToAdminId"),
    
    // Status
    status: mysqlEnum("status", ["open", "in_progress", "waiting_customer", "resolved", "closed"]).default("open").notNull(),
    
    // Metadata
    internalNotes: text("internalNotes"),
    
    resolvedAt: timestamp("resolvedAt"),
    closedAt: timestamp("closedAt"),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("tickets_userId_idx").on(table.userId),
    ticketNumberIdx: index("ticketNumber_idx").on(table.ticketNumber),
    statusIdx: index("tickets_status_idx").on(table.status),
    priorityIdx: index("priority_idx").on(table.priority),
  })
);

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

export const ticketMessages = mysqlTable(
  "ticket_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    ticketId: int("ticketId").notNull(),
    userId: int("userId").notNull(),
    message: longtext("message").notNull(),
    
    // Sender type
    senderType: mysqlEnum("senderType", ["customer", "admin"]).notNull(),
    
    // Internal notes (only visible to admins)
    isInternalNote: boolean("isInternalNote").default(false).notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    ticketIdIdx: index("ticketMessages_ticketId_idx").on(table.ticketId),
    userIdIdx: index("ticketMessages_userId_idx").on(table.userId),
  })
);

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = typeof ticketMessages.$inferInsert;

export const ticketAttachments = mysqlTable(
  "ticket_attachments",
  {
    id: int("id").autoincrement().primaryKey(),
    messageId: int("messageId").notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
    fileSize: int("fileSize"),
    mimeType: varchar("mimeType", { length: 100 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    messageIdIdx: index("ticketAttachments_messageId_idx").on(table.messageId),
  })
);

export type TicketAttachment = typeof ticketAttachments.$inferSelect;
export type InsertTicketAttachment = typeof ticketAttachments.$inferInsert;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    
    type: varchar("type", { length: 50 }).notNull(), // e.g., "payment_confirmed", "order_delivered", "ticket_reply"
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message"),
    
    // Link to related entity
    relatedEntityType: varchar("relatedEntityType", { length: 50 }),
    relatedEntityId: int("relatedEntityId"),
    
    // Status
    isRead: boolean("isRead").default(false).notNull(),
    readAt: timestamp("readAt"),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notifications_userId_idx").on(table.userId),
    isReadIdx: index("notifications_isRead_idx").on(table.isRead),
    createdAtIdx: index("notifications_createdAt_idx").on(table.createdAt),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================================================
// STATIC CONTENT & SETTINGS
// ============================================================================

export const pages = mysqlTable(
  "pages",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: longtext("content").notNull(),
    metaDescription: varchar("metaDescription", { length: 160 }),
    metaKeywords: varchar("metaKeywords", { length: 255 }),
    isPublished: boolean("isPublished").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    slugIdx: index("pages_slug_idx").on(table.slug),
  })
);

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

export const announcements = mysqlTable(
  "announcements",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    backgroundColor: varchar("backgroundColor", { length: 7 }).default("#FF6B6B"),
    textColor: varchar("textColor", { length: 7 }).default("#FFFFFF"),
    isActive: boolean("isActive").default(true).notNull(),
    displayOrder: int("displayOrder").default(0).notNull(),
    expiresAt: timestamp("expiresAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    isActiveIdx: index("announcements_isActive_idx").on(table.isActive),
  })
);

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

export const adminSettings = mysqlTable(
  "admin_settings",
  {
    id: int("id").autoincrement().primaryKey(),
    key: varchar("key", { length: 100 }).unique().notNull(),
    value: json("value"),
    description: text("description"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = typeof adminSettings.$inferInsert;

// ============================================================================
// SECURITY & AUDIT
// ============================================================================

export const securityLogs = mysqlTable(
  "security_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    eventType: varchar("eventType", { length: 100 }).notNull(), // e.g., "login_failed", "2fa_enabled", "password_changed"
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    details: json("details"),
    severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("securityLogs_userId_idx").on(table.userId),
    eventTypeIdx: index("eventType_idx").on(table.eventType),
    severityIdx: index("severity_idx").on(table.severity),
    createdAtIdx: index("securityLogs_createdAt_idx").on(table.createdAt),
  })
);

export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSecurityLog = typeof securityLogs.$inferInsert;

export const ipBlocklist = mysqlTable(
  "ip_blocklist",
  {
    id: int("id").autoincrement().primaryKey(),
    ipAddress: varchar("ipAddress", { length: 45 }).unique().notNull(),
    reason: text("reason"),
    blockedAt: timestamp("blockedAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt"),
  },
  (table) => ({
    ipAddressIdx: index("ipBlocklist_ipAddress_idx").on(table.ipAddress),
  })
);

export type IpBlocklist = typeof ipBlocklist.$inferSelect;
export type InsertIpBlocklist = typeof ipBlocklist.$inferInsert;
