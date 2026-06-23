"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CircleMember, KittyFund } from "@/lib/groups";
import { softSpring } from "@/lib/motion";

interface KittyFundWheelProps {
  members: CircleMember[];
  kittyFund: KittyFund;
  onSpin: (memberId: string) => Promise<void>;
  isSpinning?: boolean;
}

export function KittyFundWheel({
  members,
  kittyFund,
  onSpin,
  isSpinning = false,
}: KittyFundWheelProps) {
  const [selectedMember, setSelectedMember] = useState<CircleMember | null>(null);
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  // Get eligible members (excluding those who already received)
  const alreadyRecipients = new Set(kittyFund.recipients.map((r) => r.memberId));
  const eligibleMembers = members.filter((m) => !alreadyRecipients.has(m.id));

  if (eligibleMembers.length === 0) {
    return (
      <Card variant="gradient" padding="lg" className="text-center">
        <p className="h-3 text-ink-strong">Kitty fund complete! 🎉</p>
        <p className="body-sm mt-saheli-8 text-ink-muted">All members have received their turn.</p>
      </Card>
    );
  }

  const handleSpin = async () => {
    if (spinning || eligibleMembers.length === 0) return;

    setSpinning(true);
    const spinDuration = 3000;
    const finalSpins = 8 + Math.random() * 4;
    const selectedIndex = Math.floor(Math.random() * eligibleMembers.length);
    const selectedMem = eligibleMembers[selectedIndex];

    // Calculate final rotation
    const segmentAngle = 360 / eligibleMembers.length;
    const finalRotation = rotation + finalSpins * 360 + selectedIndex * segmentAngle;

    setRotation(finalRotation);

    // Animate
    await new Promise((resolve) => setTimeout(resolve, spinDuration));

    setSelectedMember(selectedMem);
    setSpinning(false);
  };

  const handleConfirm = async () => {
    if (!selectedMember) return;
    try {
      await onSpin(selectedMember.id);
      setSelectedMember(null);
      setRotation(0);
    } catch (error) {
      console.error("Failed to record recipient:", error);
    }
  };

  const segmentAngle = 360 / eligibleMembers.length;
  const centerX = 200;
  const centerY = 200;
  const radius = 160;

  return (
    <div className="space-y-saheli-20">
      {/* Wheel */}
      <div className="relative mx-auto flex h-96 w-96 items-center justify-center overflow-hidden rounded-full border-4 border-champagne-300 bg-gradient-to-br from-ivory to-champagne-50 shadow-elev-3">
        {/* Needle/pointer */}
        <div className="absolute top-0 left-1/2 z-20 -translate-x-1/2 translate-y-2">
          <div className="h-0 w-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-rose-400" />
        </div>

        {/* Spinning wheel SVG */}
        <motion.svg
          ref={wheelRef}
          width="400"
          height="400"
          viewBox="0 0 400 400"
          className="absolute"
          animate={{ rotate: spinning ? 360 : 0 }}
          transition={{
            duration: spinning ? 3 : 0,
            ease: "easeOut",
          }}
          style={{
            rotate: rotation,
            transformOrigin: "center",
          }}
        >
          {eligibleMembers.map((member, index) => {
            const startAngle = (index * segmentAngle * Math.PI) / 180;
            const endAngle = ((index + 1) * segmentAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const largeArc = segmentAngle > 180 ? 1 : 0;

            const colors = [
              "#f0b0b0", // rose
              "#e8d4b0", // champagne
              "#e4d6ef", // lavender
              "#d9eede", // success
              "#ffefc8", // warning
            ];
            const color = colors[index % colors.length];

            const labelAngle = (startAngle + endAngle) / 2;
            const labelRadius = radius * 0.65;
            const labelX = centerX + labelRadius * Math.cos(labelAngle);
            const labelY = centerY + labelRadius * Math.sin(labelAngle);

            return (
              <g key={member.id}>
                {/* Segment */}
                <path
                  d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="2"
                />

                {/* Member label */}
                <g>
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="18"
                    fontWeight="bold"
                    fill="#2a1518"
                    className="select-none"
                  >
                    {member.avatarEmoji}
                  </text>
                  <text
                    x={labelX}
                    y={labelY + 20}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#2a1518"
                    className="select-none"
                  >
                    {member.name.split(" ")[0]}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Center circle */}
          <circle cx={centerX} cy={centerY} r="20" fill="#faf1e4" stroke="#d4af6a" strokeWidth="2" />
          <circle cx={centerX} cy={centerY} r="8" fill="#d4af6a" />
        </motion.svg>
      </div>

      {/* Controls */}
      <div className="space-y-saheli-12 text-center">
        <AnimatePresence>
          {selectedMember ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-saheli-12"
            >
              <Card variant="raised" padding="lg" className="space-y-saheli-12">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-champagne-500" />
                  <p className="title text-ink-strong">This month's lucky member! 🎊</p>
                </div>
                <div className="flex items-center justify-center gap-saheli-12">
                  <span className="text-4xl">{selectedMember.avatarEmoji}</span>
                  <p className="h-2 text-ink-strong">{selectedMember.name}</p>
                </div>
                <p className="caption text-ink-muted">
                  {selectedMember.name} will receive ₹{kittyFund.amountPerMember * members.length} this month
                </p>
              </Card>
              <div className="flex gap-saheli-12">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedMember(null)}
                  className="flex-1"
                  disabled={isSpinning}
                >
                  Re-spin
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1"
                  disabled={isSpinning}
                >
                  Confirm ✓
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleSpin}
              disabled={spinning || isSpinning}
              className={cn(
                "mx-auto block rounded-full px-saheli-32 py-saheli-16 font-bold text-lg transition-all",
                spinning || isSpinning
                  ? "cursor-not-allowed bg-champagne-300 text-ink-muted"
                  : "animate-pulse bg-gradient-to-r from-champagne to-champagne-deep text-ink shadow-lift hover:brightness-110",
              )}
            >
              🎡 SPIN THE WHEEL
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Remaining members */}
      <div className="rounded-xl border border-stroke-subtle bg-surface-raised p-saheli-12">
        <p className="caption font-medium text-ink-muted mb-saheli-8">
          {eligibleMembers.length} member{eligibleMembers.length !== 1 ? "s" : ""} remaining
        </p>
        <div className="flex flex-wrap gap-saheli-8">
          {eligibleMembers.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-saheli-6 rounded-full bg-white/50 px-saheli-12 py-saheli-6"
            >
              <span>{m.avatarEmoji}</span>
              <span className="text-xs font-medium text-ink-body">{m.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
