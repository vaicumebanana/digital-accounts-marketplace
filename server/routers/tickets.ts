import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

// ============================================================================
// TICKETS ROUTER
// ============================================================================

export const ticketsRouter = router({
  // Create a new support ticket
  createTicket: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(5).max(255),
        description: z.string().min(10),
        category: z.string().min(3).max(50),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ticketNumber = `TKT-${Date.now()}-${nanoid(6)}`;

      const result = await db.createTicket({
        userId: ctx.user.id,
        ticketNumber,
        subject: input.subject,
        description: input.description,
        category: input.category,
        priority: input.priority,
        status: "open",
      });

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create ticket",
        });
      }

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "ticket_created",
        entityType: "ticket",
        details: {
          ticketNumber,
          category: input.category,
          priority: input.priority,
        },
      });

      return { ticketNumber, success: true };
    }),

  // Get user's tickets
  getTickets: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserTickets(ctx.user.id);
  }),

  // Get ticket details with messages
  getTicketDetails: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ input, ctx }) => {
      const ticket = await db.getTicketById(input.ticketId);

      if (!ticket || ticket.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      const messages = await db.getTicketMessages(input.ticketId);

      return {
        ticket,
        messages,
      };
    }),

  // Add message to ticket
  addMessage: protectedProcedure
    .input(
      z.object({
        ticketId: z.number(),
        message: z.string().min(1).max(5000),
        isInternalNote: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ticket = await db.getTicketById(input.ticketId);

      if (!ticket || ticket.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      // Only admins can add internal notes
      if (input.isInternalNote && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can add internal notes",
        });
      }

      await db.createTicketMessage({
        ticketId: input.ticketId,
        userId: ctx.user.id,
        message: input.message,
        senderType: ctx.user.role === "admin" ? "admin" : "customer",
        isInternalNote: input.isInternalNote,
      });

      // Update ticket status if needed
      if (ticket.status === "waiting_customer") {
        await db.updateTicketStatus(input.ticketId, "in_progress");
      }

      // Notify admin if customer message
      if (!input.isInternalNote && ctx.user.role !== "admin") {
        // In production, this would send a real-time notification to admins
        // via WebSocket or push notification service
      }

      return { success: true };
    }),

  // Upload attachment to ticket message
  uploadAttachment: protectedProcedure
    .input(
      z.object({
        messageId: z.number(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.createTicketAttachment({
        messageId: input.messageId,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
      });

      return { success: true };
    }),

  // Update ticket status
  updateTicketStatus: protectedProcedure
    .input(
      z.object({
        ticketId: z.number(),
        status: z.enum(["open", "in_progress", "waiting_customer", "resolved", "closed"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ticket = await db.getTicketById(input.ticketId);

      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      // Only admins or ticket owner can update status
      if (ctx.user.role !== "admin" && ticket.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this ticket",
        });
      }

      await db.updateTicketStatus(input.ticketId, input.status);

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "ticket_status_updated",
        entityType: "ticket",
        entityId: input.ticketId,
        details: {
          newStatus: input.status,
        },
      });

      // Notify user if status changed
      if (input.status === "resolved" || input.status === "closed") {
        await db.createNotification({
          userId: ticket.userId,
          type: "ticket_resolved",
          title: "Ticket Resolvido",
          message: `Seu ticket #${ticket.ticketNumber} foi ${input.status === "resolved" ? "resolvido" : "fechado"}.`,
          relatedEntityType: "ticket",
          relatedEntityId: input.ticketId,
        });
      }

      return { success: true };
    }),

  // Close ticket
  closeTicket: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const ticket = await db.getTicketById(input.ticketId);

      if (!ticket || (ticket.userId !== ctx.user.id && ctx.user.role !== "admin")) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      await db.updateTicketStatus(input.ticketId, "closed");

      return { success: true };
    }),

  // Reopen ticket
  reopenTicket: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const ticket = await db.getTicketById(input.ticketId);

      if (!ticket || (ticket.userId !== ctx.user.id && ctx.user.role !== "admin")) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      await db.updateTicketStatus(input.ticketId, "open");

      return { success: true };
    }),
});

// ============================================================================
// ADMIN TICKETS ROUTER
// ============================================================================

export const adminTicketsRouter = router({
  // Get all tickets (admin only)
  getAllTickets: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view all tickets",
      });
    }

    // In production, this would fetch all tickets from database
    // For now, returning empty array
    return [];
  }),

  // Assign ticket to admin
  assignTicket: protectedProcedure
    .input(
      z.object({
        ticketId: z.number(),
        adminId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can assign tickets",
        });
      }

      const ticket = await db.getTicketById(input.ticketId);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      // Update ticket assignment in database
      // This would require a database update function

      return { success: true };
    }),

  // Add internal note to ticket
  addInternalNote: protectedProcedure
    .input(
      z.object({
        ticketId: z.number(),
        note: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can add internal notes",
        });
      }

      const ticket = await db.getTicketById(input.ticketId);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      await db.createTicketMessage({
        ticketId: input.ticketId,
        userId: ctx.user.id,
        message: input.note,
        senderType: "admin",
        isInternalNote: true,
      });

      return { success: true };
    }),

  // Get ticket statistics
  getTicketStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view ticket statistics",
      });
    }

    // In production, this would calculate stats from database
    return {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      avgResolutionTime: 0,
    };
  }),
});
