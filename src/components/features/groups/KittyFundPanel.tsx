"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KittyFundWheel } from "@/components/features/groups/KittyFundWheel";
import { fadeUpSoft, staggerChildrenPreset, withReducedMotion } from "@/lib/motion";
import type { CircleMember, KittyFund } from "@/lib/groups";
import {
  initializeKittyFund,
  recordKittyRecipient,
  getRecipientHistory,
  getCurrentMonth,
} from "@/lib/groups";
import { Calendar, RotateCw, TrendingUp } from "lucide-react";

interface KittyFundPanelProps {
  circleId: string;
  members: CircleMember[];
  kittyFund: KittyFund | undefined;
  onRefresh: () => void;
}

export function KittyFundPanel({
  circleId,
  members,
  kittyFund,
  onRefresh,
}: KittyFundPanelProps) {
  const [amount, setAmount] = useState<string>(kittyFund?.amountPerMember.toString() ?? "5000");
  const [duration, setDuration] = useState<string>(kittyFund?.durationMonths.toString() ?? "6");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"setup" | "wheel" | "history">(
    kittyFund?.enabled ? "wheel" : "setup",
  );

  const handleInitialize = async () => {
    setLoading(true);
    try {
      await initializeKittyFund(
        circleId,
        parseInt(amount, 10),
        parseInt(duration, 10),
      );
      setView("wheel");
      onRefresh();
    } catch (error) {
      console.error("Failed to initialize kitty fund:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async (memberId: string) => {
    setLoading(true);
    try {
      if (!kittyFund) return;
      await recordKittyRecipient(
        circleId,
        memberId,
        kittyFund.amountPerMember * members.length,
      );
      onRefresh();
    } catch (error) {
      console.error("Failed to record recipient:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!kittyFund) {
    return (
      <div className="text-center py-saheli-40">
        <p className="body-sm text-ink-muted">Loading kitty fund...</p>
      </div>
    );
  }

  const currentMonth = kittyFund.enabled ? getCurrentMonth(kittyFund) : 0;
  const totalPool = kittyFund.amountPerMember * members.length;
  const history = getRecipientHistory(kittyFund, members);

  return (
    <motion.div
      variants={withReducedMotion(staggerChildrenPreset)}
      initial="hidden"
      animate="show"
      className="space-y-saheli-24"
    >
      {/* Tabs */}
      <motion.div
        variants={withReducedMotion(fadeUpSoft)}
        className="flex gap-saheli-8 border-b border-stroke-subtle"
      >
        {[
          { id: "setup" as const, label: "Setup", icon: "⚙️" },
          { id: "wheel" as const, label: "Spin Wheel", icon: "🎡" },
          { id: "history" as const, label: "History", icon: "📜" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            disabled={tab.id !== "setup" && !kittyFund.enabled}
            className={`flex items-center gap-2 px-saheli-12 py-saheli-8 border-b-2 transition-colors text-sm font-medium ${
              view === tab.id
                ? "border-champagne-500 text-ink-strong"
                : `border-transparent text-ink-muted ${
                    tab.id !== "setup" && !kittyFund.enabled ? "opacity-50 cursor-not-allowed" : ""
                  }`
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      {view === "setup" ? (
        <motion.div variants={withReducedMotion(fadeUpSoft)} className="space-y-saheli-16">
          <Card variant="glass" padding="lg" className="space-y-saheli-12">
            <div>
              <label className="block caption font-medium text-ink-muted mb-saheli-4">
                Amount per member (₹)
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                disabled={kittyFund.enabled}
              />
              <p className="caption text-ink-muted mt-saheli-4">
                Total pool: ₹{(parseInt(amount, 10) || 0) * members.length}
              </p>
            </div>

            <div>
              <label className="block caption font-medium text-ink-muted mb-saheli-4">
                Duration (months)
              </label>
              <div className="flex gap-saheli-8">
                {[6, 12].map((m) => (
                  <button
                    key={m}
                    onClick={() => setDuration(m.toString())}
                    disabled={kittyFund.enabled}
                    className={`flex-1 rounded-lg border-2 py-saheli-8 font-medium transition-colors ${
                      duration === m.toString()
                        ? "border-champagne-500 bg-champagne-200/50 text-ink-strong"
                        : "border-stroke-subtle bg-white/30 text-ink-body hover:border-champagne-300"
                    } ${kittyFund.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {m} months
                  </button>
                ))}
              </div>
            </div>

            {kittyFund.enabled ? (
              <Card variant="raised" padding="md" className="space-y-saheli-8 bg-success-50 border-success-200">
                <p className="title text-success-700 flex items-center gap-2">
                  <span>✓</span> Kitty Fund Active
                </p>
                <p className="caption text-success-600">
                  Month {currentMonth} of {kittyFund.durationMonths}
                </p>
              </Card>
            ) : (
              <Button
                onClick={handleInitialize}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Setting up..." : "Start Kitty Fund"}
              </Button>
            )}
          </Card>

          {kittyFund.enabled && (
            <Card variant="flat" padding="md" className="space-y-saheli-8">
              <p className="title text-ink-strong">Fund Overview</p>
              <div className="grid grid-cols-2 gap-saheli-8">
                <div className="rounded-lg bg-champagne-50 p-saheli-12">
                  <p className="caption text-ink-muted">Total Pool</p>
                  <p className="h-3 text-champagne-700 mt-2">₹{totalPool}</p>
                </div>
                <div className="rounded-lg bg-rose-50 p-saheli-12">
                  <p className="caption text-ink-muted">Recipients</p>
                  <p className="h-3 text-rose-700 mt-2">{history.length}/{members.length}</p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      ) : view === "wheel" ? (
        <motion.div variants={withReducedMotion(fadeUpSoft)}>
          <KittyFundWheel
            members={members}
            kittyFund={kittyFund}
            onSpin={handleSpin}
            isSpinning={loading}
          />
        </motion.div>
      ) : (
        <motion.div
          variants={withReducedMotion(fadeUpSoft)}
          className="space-y-saheli-12"
        >
          {history.length === 0 ? (
            <Card variant="glass" padding="lg" className="text-center">
              <p className="body-sm text-ink-muted">No recipients yet. Start spinning!</p>
            </Card>
          ) : (
            <div className="space-y-saheli-8">
              {history.map((item, idx) => (
                <Card key={idx} variant="raised" padding="md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-saheli-8">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-champagne-100">
                        <span className="text-lg">{item.member.avatarEmoji}</span>
                      </div>
                      <div>
                        <p className="title text-ink-strong">{item.member.name}</p>
                        <p className="caption text-ink-muted">Month {item.month}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="title text-champagne-700">₹{item.amount}</p>
                      <p className="caption text-ink-muted">{item.date}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
