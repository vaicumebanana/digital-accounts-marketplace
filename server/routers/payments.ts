import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

// ============================================================================
// PAYMENT METHODS ROUTER
// ============================================================================

export const paymentMethodsRouter = router({
  getAvailableMethods: protectedProcedure.query(async () => {
    return [
      {
        id: 1,
        name: "PIX",
        type: "pix",
        isActive: true,
        displayOrder: 1,
      },
      {
        id: 2,
        name: "PayPal",
        type: "paypal",
        isActive: true,
        displayOrder: 2,
      },
      {
        id: 3,
        name: "Cryptocurrency",
        type: "crypto",
        isActive: true,
        displayOrder: 3,
      },
    ];
  }),
});

// ============================================================================
// PIX PAYMENT ROUTER
// ============================================================================

export const pixRouter = router({
  initiatePix: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        amount: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const order = await db.getOrderById(input.orderId);
      if (!order || order.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      // Create payment record
      await db.createPayment({
        orderId: input.orderId,
        userId: ctx.user.id,
        paymentMethodId: 1,
        amount: input.amount.toString(),
        currency: "BRL",
        status: "pending",
      });

      // Get the created payment
      const payment = await db.getOrderPayment(input.orderId);
      if (!payment) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create payment" });
      }

      // Log payment event
      await db.logPaymentEvent({
        paymentId: payment.id,
        event: "pix_initiated",
        status: "pending",
        details: {
          orderId: input.orderId,
          amount: input.amount,
        },
      });

      const pixKey = `${nanoid(32)}`;
      const transactionId = `PIX-${Date.now()}-${nanoid(8)}`;

      return {
        paymentId: payment.id,
        pixKey,
        transactionId,
        amount: input.amount,
        expiresIn: 3600,
      };
    }),

  confirmPix: protectedProcedure
    .input(
      z.object({
        paymentId: z.number(),
        transactionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const payment = await db.getPaymentById(input.paymentId);
      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
      }

      await db.updatePaymentStatus(input.paymentId, "completed");

      await db.logPaymentEvent({
        paymentId: input.paymentId,
        event: "pix_confirmed",
        status: "completed",
        details: {
          transactionId: input.transactionId,
        },
      });

      await db.updateOrderStatus(payment.orderId, "paid");
      await deliverAccountsForOrder(payment.orderId);

      await db.createNotification({
        userId: payment.userId,
        type: "payment_confirmed",
        title: "Pagamento Confirmado",
        message: "Seu pagamento foi confirmado e as contas foram entregues.",
        relatedEntityType: "order",
        relatedEntityId: payment.orderId,
      });

      return { success: true };
    }),
});

// ============================================================================
// PAYPAL PAYMENT ROUTER
// ============================================================================

export const paypalRouter = router({
  initiatePaypal: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        amount: z.number(),
        currency: z.enum(["USD", "EUR", "BRL"]).default("USD"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const order = await db.getOrderById(input.orderId);
      if (!order || order.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      await db.createPayment({
        orderId: input.orderId,
        userId: ctx.user.id,
        paymentMethodId: 2,
        amount: input.amount.toString(),
        currency: input.currency,
        status: "pending",
      });

      const payment = await db.getOrderPayment(input.orderId);
      if (!payment) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create payment" });
      }

      await db.logPaymentEvent({
        paymentId: payment.id,
        event: "paypal_initiated",
        status: "pending",
        details: {
          orderId: input.orderId,
          amount: input.amount,
          currency: input.currency,
        },
      });

      const paypalOrderId = `PAYPAL-${Date.now()}-${nanoid(8)}`;

      return {
        paymentId: payment.id,
        paypalOrderId,
        redirectUrl: `https://sandbox.paypal.com/checkoutnow?token=${paypalOrderId}`,
      };
    }),

  confirmPaypal: protectedProcedure
    .input(
      z.object({
        paymentId: z.number(),
        paypalOrderId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const payment = await db.getPaymentById(input.paymentId);
      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
      }

      await db.updatePaymentStatus(input.paymentId, "completed");

      await db.logPaymentEvent({
        paymentId: input.paymentId,
        event: "paypal_confirmed",
        status: "completed",
        details: {
          paypalOrderId: input.paypalOrderId,
        },
      });

      await db.updateOrderStatus(payment.orderId, "paid");
      await deliverAccountsForOrder(payment.orderId);

      await db.createNotification({
        userId: payment.userId,
        type: "payment_confirmed",
        title: "Pagamento Confirmado",
        message: "Seu pagamento via PayPal foi confirmado e as contas foram entregues.",
        relatedEntityType: "order",
        relatedEntityId: payment.orderId,
      });

      return { success: true };
    }),
});

// ============================================================================
// CRYPTO PAYMENT ROUTER
// ============================================================================

export const cryptoRouter = router({
  initiateCrypto: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        amount: z.number(),
        cryptocurrency: z.enum(["BTC", "ETH", "USDT"]).default("BTC"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const order = await db.getOrderById(input.orderId);
      if (!order || order.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      await db.createPayment({
        orderId: input.orderId,
        userId: ctx.user.id,
        paymentMethodId: 3,
        amount: input.amount.toString(),
        currency: input.cryptocurrency,
        status: "pending",
        metadata: {
          cryptocurrency: input.cryptocurrency,
        },
      });

      const payment = await db.getOrderPayment(input.orderId);
      if (!payment) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create payment" });
      }

      await db.logPaymentEvent({
        paymentId: payment.id,
        event: "crypto_initiated",
        status: "pending",
        details: {
          orderId: input.orderId,
          amount: input.amount,
          cryptocurrency: input.cryptocurrency,
        },
      });

      const walletAddress = `0x${nanoid(40)}`;
      const transactionId = `CRYPTO-${Date.now()}-${nanoid(8)}`;

      return {
        paymentId: payment.id,
        walletAddress,
        transactionId,
        amount: input.amount,
        cryptocurrency: input.cryptocurrency,
        confirmationsRequired: 3,
      };
    }),

  confirmCrypto: protectedProcedure
    .input(
      z.object({
        paymentId: z.number(),
        transactionHash: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const payment = await db.getPaymentById(input.paymentId);
      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
      }

      await db.updatePaymentStatus(input.paymentId, "completed");

      await db.logPaymentEvent({
        paymentId: input.paymentId,
        event: "crypto_confirmed",
        status: "completed",
        details: {
          transactionHash: input.transactionHash,
        },
      });

      await db.updateOrderStatus(payment.orderId, "paid");
      await deliverAccountsForOrder(payment.orderId);

      await db.createNotification({
        userId: payment.userId,
        type: "payment_confirmed",
        title: "Pagamento Confirmado",
        message: "Seu pagamento em criptomoeda foi confirmado e as contas foram entregues.",
        relatedEntityType: "order",
        relatedEntityId: payment.orderId,
      });

      return { success: true };
    }),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function deliverAccountsForOrder(orderId: number) {
  try {
    const orderItems = await db.getOrderItems(orderId);

    for (const item of orderItems) {
      const account = await db.getAvailableAccountForProduct(item.productId);

      if (account) {
        await db.markAccountAsSold(account.id);

        const order = await db.getOrderById(orderId);
        if (order) {
          await db.createNotification({
            userId: order.userId,
            type: "account_delivered",
            title: "Conta Entregue",
            message: `Sua conta para o produto #${item.productId} foi entregue com sucesso.`,
            relatedEntityType: "order_item",
            relatedEntityId: item.id,
          });
        }
      }
    }
  } catch (error) {
    console.error("[Payment] Error delivering accounts:", error);
  }
}
