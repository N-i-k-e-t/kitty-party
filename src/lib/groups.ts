import { get, set } from "idb-keyval";
import type { VibeTag } from "@/lib/types";
import { loadPlans, savePlans } from "@/lib/memory";
import { createId } from "@/lib/id";
import { newEmptyPlan } from "@/store/plans";
import type { SavedPlan } from "@/lib/types";

const BUNDLE_KEY = "saheli/groups-bundle/v1";

export type RsvpStatus = "going" | "maybe" | "declined";

export interface CircleMember {
  id: string;
  name: string;
  avatarEmoji: string;
}

export interface Circle {
  id: string;
  name: string;
  coverImage?: string;
  typeLabel: string;
  vibes: VibeTag[];
  memberIds: string[];
  nextEventAt?: number;
  createdAt: number;
}

export interface CirclePlanRef {
  planId: string;
  title: string;
  updatedAt: number;
}

export interface RsvpRow {
  memberId: string;
  status: RsvpStatus;
}

export interface VotePoll {
  id: string;
  question: string;
  options: [string, string];
  votes: Record<string, string>;
}

export interface ActivityItem {
  id: string;
  at: number;
  message: string;
  actorName: string;
}

/** Tracks monthly fund recipient rotation for kitty parties */
export interface KittyFund {
  circleId: string;
  enabled: boolean;
  amountPerMember: number; // INR amount each member contributes monthly
  startMonth: number; // timestamp of first month
  durationMonths: number; // total months the kitty runs (6 or 12)
  recipients: Array<{
    month: number; // 1-indexed month (1-6 or 1-12)
    memberId: string;
    receivedAt: number;
    amount: number;
  }>;
  skippedMembers: Array<{
    month: number;
    memberId: string; // member didn't participate this month
  }>;
}

export interface GroupsBundle {
  circles: Circle[];
  membersByCircle: Record<string, CircleMember[]>;
  planRefsByCircle: Record<string, CirclePlanRef[]>;
  rsvpsByCircle: Record<string, RsvpRow[]>;
  votesByCircle: Record<string, VotePoll[]>;
  activityByCircle: Record<string, ActivityItem[]>;
  kittyFundsByCircle: Record<string, KittyFund>;
}

const emptyBundle = (): GroupsBundle => ({
  circles: [],
  membersByCircle: {},
  planRefsByCircle: {},
  rsvpsByCircle: {},
  votesByCircle: {},
  activityByCircle: {},
  kittyFundsByCircle: {},
});

export async function loadGroupsBundle(): Promise<GroupsBundle> {
  const v = await get<GroupsBundle>(BUNDLE_KEY);
  if (!v) return emptyBundle();
  return {
    ...emptyBundle(),
    ...v,
    circles: v.circles ?? [],
    membersByCircle: v.membersByCircle ?? {},
    planRefsByCircle: v.planRefsByCircle ?? {},
    rsvpsByCircle: v.rsvpsByCircle ?? {},
    votesByCircle: v.votesByCircle ?? {},
    activityByCircle: v.activityByCircle ?? {},
    kittyFundsByCircle: v.kittyFundsByCircle ?? {},
  };
}

export async function saveGroupsBundle(b: GroupsBundle): Promise<void> {
  await set(BUNDLE_KEY, b);
}

function member(id: string, name: string, emoji: string): CircleMember {
  return { id, name, avatarEmoji: emoji };
}

/** Seeds two demo circles and a sample plan when the bundle is empty. */
export async function ensureGroupsSeeded(): Promise<void> {
  let bundle = await loadGroupsBundle();
  if (bundle.circles.length > 0) return;

  let plans = await loadPlans();
  let seedPlan: SavedPlan;
  if (plans.length === 0) {
    seedPlan = newEmptyPlan({ title: "Lavender Sunday circle", city: "Mumbai" });
    seedPlan = {
      ...seedPlan,
      workspace: { ...seedPlan.workspace, themeId: "floral-brunch", venueIds: [] },
      updatedAt: Date.now(),
    };
    plans = [seedPlan];
    await savePlans(plans);
  } else {
    seedPlan = plans[0];
  }

  const g1: Circle = {
    id: createId("grp"),
    name: "Bandra Brunch Collective",
    typeLabel: "Kitty circle",
    vibes: ["cozy", "glam"],
    memberIds: ["m1", "m2", "m3", "m4"],
    nextEventAt: Date.now() + 1000 * 60 * 60 * 24 * 9,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
  };
  const g2: Circle = {
    id: createId("grp"),
    name: "Monsoon Garden Friends",
    typeLabel: "Seasonal circle",
    vibes: ["traditional", "playful"],
    memberIds: ["m5", "m6", "m7"],
    nextEventAt: Date.now() + 1000 * 60 * 60 * 24 * 16,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  };

  bundle = {
    circles: [g1, g2],
    membersByCircle: {
      [g1.id]: [
        member("m1", "Priya", "P"),
        member("m2", "Naina", "N"),
        member("m3", "Aditi", "A"),
        member("m4", "Kiran", "K"),
      ],
      [g2.id]: [member("m5", "Meera", "M"), member("m6", "Sana", "S"), member("m7", "Riya", "R")],
    },
    planRefsByCircle: {
      [g1.id]: [{ planId: seedPlan.id, title: seedPlan.title, updatedAt: seedPlan.updatedAt }],
      [g2.id]: [],
    },
    rsvpsByCircle: {
      [g1.id]: [
        { memberId: "m1", status: "going" },
        { memberId: "m2", status: "going" },
        { memberId: "m3", status: "maybe" },
        { memberId: "m4", status: "going" },
      ],
      [g2.id]: [
        { memberId: "m5", status: "maybe" },
        { memberId: "m6", status: "going" },
        { memberId: "m7", status: "declined" },
      ],
    },
    votesByCircle: {
      [g1.id]: [
        {
          id: createId("vote"),
          question: "Saturday vs Sunday",
          options: ["Saturday", "Sunday"],
          votes: { m1: "Saturday", m2: "Sunday", m3: "Saturday", m4: "Saturday" },
        },
        {
          id: createId("vote"),
          question: "Floral Brunch vs Royal Maharani",
          options: ["Floral Brunch", "Royal Maharani"],
          votes: { m1: "Floral Brunch", m2: "Royal Maharani", m3: "Floral Brunch", m4: "Floral Brunch" },
        },
      ],
      [g2.id]: [
        {
          id: createId("vote"),
          question: "Indoor cafe vs Rooftop",
          options: ["Indoor cafe", "Rooftop"],
          votes: { m5: "Indoor cafe", m6: "Rooftop", m7: "Indoor cafe" },
        },
      ],
    },
    activityByCircle: {
      [g1.id]: [
        {
          id: createId("act"),
          at: Date.now() - 1000 * 60 * 60 * 2,
          actorName: "Priya",
          message: "added a venue to the shortlist",
        },
        {
          id: createId("act"),
          at: Date.now() - 1000 * 60 * 60 * 26,
          actorName: "Naina",
          message: "voted Saturday",
        },
      ],
      [g2.id]: [
        {
          id: createId("act"),
          at: Date.now() - 1000 * 60 * 45,
          actorName: "Meera",
          message: "shared a monsoon theme idea",
        },
      ],
    },
  };

  await saveGroupsBundle(bundle);
}

export async function addCircle(c: Omit<Circle, "id" | "createdAt"> & { id?: string }): Promise<Circle> {
  const bundle = await loadGroupsBundle();
  const circle: Circle = {
    ...c,
    id: c.id ?? createId("grp"),
    createdAt: Date.now(),
  };
  bundle.circles = [circle, ...bundle.circles];
  bundle.membersByCircle[circle.id] = [];
  bundle.planRefsByCircle[circle.id] = [];
  bundle.rsvpsByCircle[circle.id] = [];
  bundle.votesByCircle[circle.id] = [];
  bundle.activityByCircle[circle.id] = [];
  bundle.kittyFundsByCircle[circle.id] = {
    circleId: circle.id,
    enabled: false,
    amountPerMember: 0,
    startMonth: 0,
    durationMonths: 6,
    recipients: [],
    skippedMembers: [],
  };
  await saveGroupsBundle(bundle);
  return circle;
}

export async function patchRsvp(circleId: string, memberId: string, status: RsvpStatus): Promise<void> {
  const bundle = await loadGroupsBundle();
  const rows = bundle.rsvpsByCircle[circleId] ?? [];
  const idx = rows.findIndex((r) => r.memberId === memberId);
  const next = idx === -1 ? [...rows, { memberId, status }] : rows.map((r, i) => (i === idx ? { ...r, status } : r));
  bundle.rsvpsByCircle[circleId] = next;
  await saveGroupsBundle(bundle);
}

export async function bumpVote(circleId: string, pollId: string, memberId: string, option: string): Promise<void> {
  const bundle = await loadGroupsBundle();
  const polls = bundle.votesByCircle[circleId] ?? [];
  const poll = polls.find((p) => p.id === pollId);
  if (!poll) return;
  poll.votes = { ...poll.votes, [memberId]: option };
  await saveGroupsBundle(bundle);
}

/** Initialize or update kitty fund settings for a circle */
export async function initializeKittyFund(
  circleId: string,
  amountPerMember: number,
  durationMonths: number,
): Promise<KittyFund> {
  const bundle = await loadGroupsBundle();
  const kittyFund = bundle.kittyFundsByCircle[circleId] || {
    circleId,
    enabled: false,
    amountPerMember: 0,
    startMonth: 0,
    durationMonths: 6,
    recipients: [],
    skippedMembers: [],
  };

  kittyFund.enabled = true;
  kittyFund.amountPerMember = amountPerMember;
  kittyFund.durationMonths = durationMonths;
  if (kittyFund.startMonth === 0) {
    kittyFund.startMonth = Date.now();
  }

  bundle.kittyFundsByCircle[circleId] = kittyFund;
  await saveGroupsBundle(bundle);
  return kittyFund;
}

/** Get eligible members for current spin (excluding those who already received money and skipped ones) */
export function getEligibleMembers(
  members: CircleMember[],
  kittyFund: KittyFund,
): CircleMember[] {
  if (!kittyFund.enabled) return members;

  const currentMonth = getCurrentMonth(kittyFund);
  const alreadyRecipients = new Set(kittyFund.recipients.map((r) => r.memberId));
  const skippedThisMonth = new Set(
    kittyFund.skippedMembers
      .filter((s) => s.month === currentMonth)
      .map((s) => s.memberId),
  );

  return members.filter((m) => !alreadyRecipients.has(m.id) && !skippedThisMonth.has(m.id));
}

/** Get current month (1-indexed within the kitty duration) */
export function getCurrentMonth(kittyFund: KittyFund): number {
  const monthsElapsed = Math.floor((Date.now() - kittyFund.startMonth) / (1000 * 60 * 60 * 24 * 30));
  return Math.min(Math.max(monthsElapsed + 1, 1), kittyFund.durationMonths);
}

/** Record a spin result - member receives the kitty fund this month */
export async function recordKittyRecipient(
  circleId: string,
  memberId: string,
  amount: number,
): Promise<KittyFund> {
  const bundle = await loadGroupsBundle();
  const kittyFund = bundle.kittyFundsByCircle[circleId];
  if (!kittyFund) throw new Error("Kitty fund not found");

  const currentMonth = getCurrentMonth(kittyFund);
  const existing = kittyFund.recipients.find((r) => r.month === currentMonth);

  if (!existing) {
    kittyFund.recipients.push({
      month: currentMonth,
      memberId,
      receivedAt: Date.now(),
      amount,
    });
  }

  bundle.kittyFundsByCircle[circleId] = kittyFund;
  await saveGroupsBundle(bundle);
  return kittyFund;
}

/** Mark a member as skipped for current month */
export async function skipMemberForMonth(circleId: string, memberId: string): Promise<KittyFund> {
  const bundle = await loadGroupsBundle();
  const kittyFund = bundle.kittyFundsByCircle[circleId];
  if (!kittyFund) throw new Error("Kitty fund not found");

  const currentMonth = getCurrentMonth(kittyFund);
  const already = kittyFund.skippedMembers.find((s) => s.month === currentMonth && s.memberId === memberId);

  if (!already) {
    kittyFund.skippedMembers.push({ month: currentMonth, memberId });
  }

  bundle.kittyFundsByCircle[circleId] = kittyFund;
  await saveGroupsBundle(bundle);
  return kittyFund;
}

/** Get recipient history for the kitty fund */
export function getRecipientHistory(kittyFund: KittyFund, members: CircleMember[]): Array<{ month: number; member: CircleMember; amount: number; date: string }> {
  return kittyFund.recipients.map((r) => ({
    month: r.month,
    member: members.find((m) => m.id === r.memberId) || { id: r.memberId, name: "Unknown", avatarEmoji: "?" },
    amount: r.amount,
    date: new Date(r.receivedAt).toLocaleDateString(),
  }));
}
