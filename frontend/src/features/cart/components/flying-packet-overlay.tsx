"use client";

import * as React from "react";
import Image from "next/image";
import { Package, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FlyingPacketInfo } from "../types";

export interface FlyingPacketOverlayProps {
  packets: FlyingPacketInfo[];
}

export function FlyingPacketOverlay({ packets }: FlyingPacketOverlayProps) {
  if (packets.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {packets.map((packet) => {
          // Midpoint for arched arc flight trajectory adapting to flight direction
          const isDownward = packet.endY > packet.startY;
          const isWithinBottomBar = Math.abs(packet.endY - packet.startY) < 70;
          const midX = (packet.startX + packet.endX) / 2 + (packet.startX > packet.endX ? -30 : 30);

          let midY: number;
          if (isWithinBottomBar) {
            // Clicked inside bottom bar: pop upward and settle into counter
            midY = packet.startY - 75;
          } else if (isDownward) {
            // Downward flight to bottom bar: arch slightly up, then swoop down
            midY = packet.startY - 50;
          } else {
            // Upward flight (desktop navbar)
            midY = Math.min(packet.startY, packet.endY) - 90;
          }

          return (
            <motion.div
              key={packet.id}
              initial={{
                left: packet.startX,
                top: packet.startY,
                x: "-50%",
                y: "-50%",
                scale: 0.5,
                opacity: 0,
              }}
              animate={{
                left: [packet.startX, midX, packet.endX],
                top: [packet.startY, midY, packet.endY],
                x: "-50%",
                y: "-50%",
                scale: [0.6, 1.25, 0.35],
                opacity: [0.2, 1, 1, 0.7],
                rotate: [0, -15, 20, 0],
              }}
              exit={{
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.72,
                ease: [0.22, 1, 0.36, 1],
                times: [0, 0.45, 1],
              }}
              className="fixed flex items-center justify-center pointer-events-none"
            >
              {/* Tech Data Packet / Flying Orb */}
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-orange-400 bg-neutral-950/95 p-1 shadow-[0_0_30px_6px_rgba(234,88,12,0.85),0_0_60px_rgba(249,115,22,0.5)] ring-2 ring-orange-500/40">
                {packet.productImage ? (
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <Image
                      src={packet.productImage}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <Package className="h-5 w-5 text-orange-400" />
                )}

                {/* Pulsing signal rings (Data Packet visual metaphor) */}
                <span className="absolute -inset-1 rounded-2xl animate-ping border border-orange-400 opacity-60" />
                <span className="absolute -inset-2 rounded-2xl border border-orange-500/30 opacity-40" />

                {/* Packet LED status */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
