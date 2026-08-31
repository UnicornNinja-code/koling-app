/*
 *   Copyright (c) 2026 
 *   All rights reserved.
 *   socketManager.js (Singleton Socket.io Server Manager with JWT Handshake Auth & Room Control)
 */

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export class SocketManager {
  static instance = null;

  constructor() {
    if (SocketManager.instance) {
      return SocketManager.instance;
    }
    this.io = null;
    SocketManager.instance = this;
  }

  static getInstance() {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  /**
   * Initialize Socket.io Server on Express HTTP Server
   */
  init(httpServer, forceNew = false) {
    if (this.io && !forceNew) return this.io;
    if (this.io && forceNew) {
      try { this.io.close(); } catch (e) {}
    }

    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      pingTimeout: 10000,
      pingInterval: 5000,
    });

    // JWT Authentication Middleware for Socket.io Handshake
    this.io.use((socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace("Bearer ", "");

        if (!token) {
          return next(new Error("Authentication error: Token required"));
        }

        const decoded = jwt.verify(token, env.JWT_SECRET);
        socket.user = {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        };
        return next();
      } catch (err) {
        return next(new Error("Authentication error: Invalid or expired token"));
      }
    });

    // Connection Handler
    this.io.on("connection", (socket) => {
      const user = socket.user;
      console.log(`🔌 [SOCKET.IO CONNECTED] Socket ID: ${socket.id} | User: ${user.name} (${user.role})`);

      // Auto Join Rooms based on Role
      if (user.role === "SUPERADMIN" || user.role === "MANAGEMENT") {
        socket.join("management_room");
        socket.join("supervisors_room");
        console.log(` 👤 Executive User '${user.name}' bergabung ke rooms: management_room, supervisors_room`);
      } else if (user.role === "SUPERVISOR") {
        socket.join("supervisors_room");
        console.log(` 👤 Supervisor '${user.name}' bergabung ke room: supervisors_room`);
      } else if (user.role === "RIDER") {
        socket.join("riders_room");
        socket.join(`rider_${user.id}_room`);
        console.log(` 🚴 Rider '${user.name}' bergabung ke room: rider_${user.id}_room`);
      }

      // Disconnect Handler
      socket.on("disconnect", (reason) => {
        console.log(`🔌 [SOCKET.IO DISCONNECTED] Socket ID: ${socket.id} | User: ${user.name} | Reason: ${reason}`);
      });
    });

    console.log("⚡ Socket.io Real-Time Server initialized successfully!");
    return this.io;
  }

  /**
   * Broadcast event to Management Room (Superadmin & Management only)
   */
  broadcastToManagement(event, data) {
    if (this.io) {
      this.io.to("management_room").emit(event, data);
    }
  }

  /**
   * Broadcast event to Supervisors Room (Supervisor, Management, & Superadmin)
   */
  broadcastToSupervisors(event, data) {
    if (this.io) {
      this.io.to("supervisors_room").emit(event, data);
    }
  }

  /**
   * Send event to specific Rider Room
   */
  sendToRider(riderId, event, data) {
    if (this.io) {
      this.io.to(`rider_${riderId}_room`).emit(event, data);
    }
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcastAll(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

export const socketManager = SocketManager.getInstance();
