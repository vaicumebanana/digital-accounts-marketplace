import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { pixRouter, paypalRouter, cryptoRouter, paymentMethodsRouter } from "./routers/payments";
import { ticketsRouter, adminTicketsRouter } from "./routers/tickets";

// ============================================================================
// PRODUCT ROUTER
// ============================================================================

const productRouter = router({
  getCategories: publicProcedure.query(async () => {
    return await db.getCategories();
  }),

  getProductsByCategory: publicProcedure
    .input(z.object({ categoryId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return await db.getProductsByCategory(input.categoryId, input.limit);
    }),

  getProductBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const product = await db.getProductBySlug(input.slug);
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      const images = await db.getProductImages(product.id);
      const reviews = await db.getProductReviews(product.id);

      return {
        ...product,
        images,
        reviews,
      };
    }),

  search: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return await db.searchProducts(input.query, input.limit);
    }),

  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().default(12) }))
    .query(async ({ input }) => {
      // This would need a query helper for featured products
      // For now, returning empty array
      return [];
    }),
});

// ============================================================================
// CART ROUTER
// ============================================================================

const cartRouter = router({
  getCart: protectedProcedure.query(async ({ ctx }) => {
    const cartItems = await db.getUserCart(ctx.user.id);
    // Enrich with product details
    const enriched = await Promise.all(
      cartItems.map(async (item) => {
        const product = await db.getProductById(item.productId);
        return { ...item, product };
      })
    );
    return enriched;
  }),

  addToCart: protectedProcedure
    .input(z.object({ productId: z.number(), quantity: z.number().default(1) }))
    .mutation(async ({ input, ctx }) => {
      const product = await db.getProductById(input.productId);
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      if (product.availableStock < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient stock",
        });
      }

      await db.addToCart(ctx.user.id, input.productId, input.quantity);

      return { success: true };
    }),

  removeFromCart: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.removeFromCart(ctx.user.id, input.productId);
      return { success: true };
    }),

  clearCart: protectedProcedure.mutation(async ({ ctx }) => {
    await db.clearCart(ctx.user.id);
    return { success: true };
  }),
});

// ============================================================================
// FAVORITES & WISHLIST ROUTER
// ============================================================================

const favoritesRouter = router({
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserFavorites(ctx.user.id);
  }),

  addToFavorites: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.addToFavorites(ctx.user.id, input.productId);
      return { success: true };
    }),

  removeFromFavorites: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.removeFromFavorites(ctx.user.id, input.productId);
      return { success: true };
    }),

  getWishlist: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserWishlist(ctx.user.id);
  }),

  addToWishlist: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.addToWishlist(ctx.user.id, input.productId);
      return { success: true };
    }),

  removeFromWishlist: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.removeFromWishlist(ctx.user.id, input.productId);
      return { success: true };
    }),
});

// ============================================================================
// ORDERS ROUTER
// ============================================================================

const ordersRouter = router({
  getOrders: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserOrders(ctx.user.id);
  }),

  getOrderDetails: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input, ctx }) => {
      const order = await db.getOrderById(input.orderId);
      if (!order || order.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const items = await db.getOrderItems(input.orderId);
      const payment = await db.getOrderPayment(input.orderId);

      return { order, items, payment };
    }),

  createOrder: protectedProcedure
    .input(
      z.object({
        couponCode: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get cart items
      const cartItems = await db.getUserCart(ctx.user.id);
      if (cartItems.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      // Calculate totals
      let subtotal = 0;
      const enrichedItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = await db.getProductById(item.productId);
          if (!product) throw new Error("Product not found");
          const itemTotal = parseFloat(product.finalPrice.toString()) * item.quantity;
          subtotal += itemTotal;
          return { ...item, product };
        })
      );

      // Validate and apply coupon
      let discountAmount = 0;
      let couponId: number | undefined;

      if (input.couponCode) {
        const coupon = await db.validateCoupon(input.couponCode);
        if (!coupon) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired coupon",
          });
        }

        if (coupon.discountType === "percentage") {
          discountAmount = (subtotal * parseFloat(coupon.discountValue.toString())) / 100;
        } else {
          discountAmount = parseFloat(coupon.discountValue.toString());
        }

        couponId = coupon.id;
      }

      const totalAmount = Math.max(0, subtotal - discountAmount);

      // Create order
      const orderNumber = `ORD-${Date.now()}-${nanoid(6)}`;
      const order = await db.createOrder({
        userId: ctx.user.id,
        orderNumber,
        subtotal: subtotal.toString(),
        discountAmount: discountAmount.toString(),
        totalAmount: totalAmount.toString(),
        couponId,
        couponCode: input.couponCode,
        status: "pending",
      });

      // Get the inserted order ID
      const orders = await db.getUserOrders(ctx.user.id);
      const newOrder = orders[orders.length - 1];

      // Create order items
      for (const item of enrichedItems) {
        await db.createOrderItem({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.product.finalPrice.toString(),
        });
      }

      // Clear cart
      await db.clearCart(ctx.user.id);

      return { orderId: newOrder.id, orderNumber };
    }),
});

// ============================================================================
// REVIEWS ROUTER
// ============================================================================

const reviewsRouter = router({
  createReview: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        orderId: z.number().optional(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.createReview({
        productId: input.productId,
        userId: ctx.user.id,
        orderId: input.orderId,
        rating: input.rating,
        comment: input.comment,
        isApproved: false,
      });

      return { success: true };
    }),

  getProductReviews: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      return await db.getProductReviews(input.productId);
    }),
});

// ============================================================================
// NOTIFICATIONS ROUTER
// ============================================================================

const notificationsRouter = router({
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserNotifications(ctx.user.id);
  }),

  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      await db.markNotificationAsRead(input.notificationId);
      return { success: true };
    }),
});

// ============================================================================
// PAGES ROUTER
// ============================================================================

const pagesRouter = router({
  getPage: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await db.getPageBySlug(input.slug);
    }),

  getAnnouncements: publicProcedure.query(async () => {
    return await db.getAnnouncements();
  }),
});

// ============================================================================
// AUTH ROUTER
// ============================================================================

const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),
});

// ============================================================================
// MAIN ROUTER
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  products: productRouter,
  cart: cartRouter,
  favorites: favoritesRouter,
  orders: ordersRouter,
  reviews: reviewsRouter,
  notifications: notificationsRouter,
  pages: pagesRouter,
  payments: router({
    methods: paymentMethodsRouter,
    pix: pixRouter,
    paypal: paypalRouter,
    crypto: cryptoRouter,
  }),
  tickets: ticketsRouter,
  adminTickets: adminTicketsRouter,
});

export type AppRouter = typeof appRouter;
