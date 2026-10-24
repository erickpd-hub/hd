"use client";

import React from "react";

interface SectionSkeletonProps {
  tab: "tickets" | "ticket_registry" | "simulator" | "analytics" | "documents" | "topology" | "ingestion_logs" | "models_cost" | "users" | string;
}

export default function SectionSkeleton({ tab }: SectionSkeletonProps) {
  if (tab === "tickets") {
    return (
      <div className="flex-1 flex overflow-hidden animate-pulse">
        {/* LEFT: Tickets list skeleton */}
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-neutral-800 bg-black p-3 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800/60">
            <div className="w-28 h-4 bg-neutral-800 rounded" />
            <div className="w-8 h-4 bg-neutral-800 rounded" />
          </div>
          <div className="w-full h-8 bg-neutral-900 border border-neutral-800 rounded-lg" />
          <div className="flex gap-1.5">
            <div className="w-14 h-6 bg-neutral-900 border border-neutral-800/80 rounded" />
            <div className="w-16 h-6 bg-neutral-900 border border-neutral-800/80 rounded" />
            <div className="w-14 h-6 bg-neutral-900 border border-neutral-800/80 rounded" />
          </div>
          <div className="space-y-2 pt-1 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/70 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="w-16 h-3.5 bg-neutral-800 rounded" />
                  <div className="w-12 h-3.5 bg-neutral-800 rounded" />
                </div>
                <div className="w-4/5 h-3 bg-neutral-700/80 rounded" />
                <div className="w-full h-2.5 bg-neutral-800/60 rounded" />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-neutral-800" />
                    <div className="w-20 h-2.5 bg-neutral-800 rounded" />
                  </div>
                  <div className="w-10 h-2 bg-neutral-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE: Chat thread skeleton */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="h-14 border-b border-neutral-800 px-5 flex items-center justify-between bg-neutral-950/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-800" />
              <div className="space-y-1.5">
                <div className="w-36 h-3.5 bg-neutral-800 rounded" />
                <div className="w-48 h-2.5 bg-neutral-800/70 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-7 bg-neutral-900 border border-neutral-800 rounded-lg" />
              <div className="w-20 h-7 bg-neutral-900 border border-neutral-800 rounded-lg" />
            </div>
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-hidden">
            {/* Customer bubble skeleton */}
            <div className="flex items-start gap-3 max-w-lg">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex-shrink-0" />
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/70 w-full space-y-2">
                <div className="w-1/3 h-2.5 bg-neutral-700 rounded" />
                <div className="w-full h-3 bg-neutral-800 rounded" />
                <div className="w-4/5 h-3 bg-neutral-800 rounded" />
              </div>
            </div>
            {/* Agent response skeleton */}
            <div className="flex items-start gap-3 max-w-lg ml-auto flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex-shrink-0" />
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 w-full space-y-2.5">
                <div className="w-1/4 h-2.5 bg-neutral-700 rounded" />
                <div className="w-full h-3 bg-neutral-800 rounded" />
                <div className="w-11/12 h-3 bg-neutral-800 rounded" />
                <div className="w-2/3 h-3 bg-neutral-800 rounded" />
                <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/50 mt-2 space-y-1">
                  <div className="w-28 h-2 bg-neutral-700 rounded" />
                  <div className="w-full h-2 bg-neutral-800 rounded" />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/40">
            <div className="h-11 rounded-xl bg-neutral-900 border border-neutral-800" />
          </div>
        </div>

        {/* RIGHT: Triage panel skeleton */}
        <div className="w-80 border-l border-neutral-800 bg-black p-4 space-y-4 flex-shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="w-28 h-3.5 bg-neutral-800 rounded" />
            <div className="w-6 h-6 rounded bg-neutral-800" />
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
            <div className="w-24 h-3 bg-neutral-800 rounded" />
            <div className="w-full h-2.5 bg-neutral-700/60 rounded" />
            <div className="w-5/6 h-2.5 bg-neutral-700/60 rounded" />
            <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden mt-2">
              <div className="w-3/4 h-full bg-neutral-700" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-24 h-3 bg-neutral-800 rounded" />
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5">
              <div className="w-3/4 h-2.5 bg-neutral-800 rounded" />
              <div className="w-full h-2 bg-neutral-850 rounded" />
            </div>
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5">
              <div className="w-3/4 h-2.5 bg-neutral-800 rounded" />
              <div className="w-full h-2 bg-neutral-850 rounded" />
            </div>
          </div>
          <div className="pt-2 space-y-2">
            <div className="w-full h-9 rounded-lg bg-neutral-900 border border-neutral-800" />
            <div className="w-full h-9 rounded-lg bg-neutral-900 border border-neutral-800" />
          </div>
        </div>
      </div>
    );
  }

  if (tab === "analytics") {
    return (
      <div className="p-6 space-y-6 flex-1 overflow-y-auto animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="space-y-1.5">
            <div className="w-48 h-5 bg-neutral-800 rounded" />
            <div className="w-72 h-3 bg-neutral-850 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="w-28 h-8 rounded-lg bg-neutral-900 border border-neutral-800" />
            <div className="w-24 h-8 rounded-lg bg-neutral-800" />
          </div>
        </div>

        {/* 4 KPI cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
              <div className="flex justify-between items-center">
                <div className="w-24 h-3 bg-neutral-800 rounded" />
                <div className="w-5 h-5 rounded bg-neutral-800" />
              </div>
              <div className="w-20 h-7 bg-neutral-700/80 rounded" />
              <div className="w-32 h-2.5 bg-neutral-850 rounded" />
            </div>
          ))}
        </div>

        {/* 2 Big Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex justify-between">
              <div className="w-36 h-4 bg-neutral-800 rounded" />
              <div className="w-20 h-3 bg-neutral-800 rounded" />
            </div>
            <div className="h-64 rounded-lg bg-neutral-900/60 border border-neutral-800/40 flex items-end p-4 gap-3">
              {[40, 65, 55, 80, 70, 90, 85, 95].map((h, idx) => (
                <div key={idx} className="flex-1 bg-neutral-800/60 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex justify-between">
              <div className="w-36 h-4 bg-neutral-800 rounded" />
              <div className="w-20 h-3 bg-neutral-800 rounded" />
            </div>
            <div className="h-64 rounded-lg bg-neutral-900/60 border border-neutral-800/40 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border-8 border-neutral-800 border-t-neutral-700" />
            </div>
          </div>
        </div>

        {/* Bottom SLA Table Skeleton */}
        <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
          <div className="w-40 h-4 bg-neutral-800 rounded" />
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-900">
                <div className="w-32 h-3 bg-neutral-800 rounded" />
                <div className="w-20 h-3 bg-neutral-800 rounded" />
                <div className="w-16 h-3 bg-neutral-800 rounded" />
                <div className="w-12 h-3 bg-neutral-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tab === "users" || tab === "ticket_registry") {
    return (
      <div className="p-6 space-y-6 flex-1 overflow-y-auto animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="space-y-1.5">
            <div className="w-48 h-5 bg-neutral-800 rounded" />
            <div className="w-64 h-3 bg-neutral-850 rounded" />
          </div>
          <div className="w-36 h-9 rounded-lg bg-neutral-800" />
        </div>

        {/* 5 KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex justify-between">
                <div className="w-20 h-3 bg-neutral-800 rounded" />
                <div className="w-4 h-4 rounded bg-neutral-800" />
              </div>
              <div className="w-14 h-7 bg-neutral-700/80 rounded" />
              <div className="w-24 h-2 bg-neutral-850 rounded" />
            </div>
          ))}
        </div>

        {/* Filters bar */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex gap-3">
          <div className="flex-1 h-9 bg-neutral-900 border border-neutral-800 rounded-lg" />
          <div className="w-36 h-9 bg-neutral-900 border border-neutral-800 rounded-lg" />
          <div className="w-32 h-9 bg-neutral-900 border border-neutral-800 rounded-lg" />
          <div className="w-28 h-9 bg-neutral-900 border border-neutral-800 rounded-lg" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
          <div className="p-3 border-b border-neutral-800 bg-neutral-900/60 flex justify-between">
            <div className="w-32 h-3 bg-neutral-700 rounded" />
            <div className="w-24 h-3 bg-neutral-700 rounded" />
            <div className="w-24 h-3 bg-neutral-700 rounded" />
            <div className="w-20 h-3 bg-neutral-700 rounded" />
          </div>
          <div className="divide-y divide-neutral-900 p-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="py-3 px-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800" />
                  <div className="space-y-1">
                    <div className="w-28 h-3.5 bg-neutral-700 rounded" />
                    <div className="w-44 h-2.5 bg-neutral-850 rounded" />
                  </div>
                </div>
                <div className="w-24 h-6 rounded bg-neutral-900 border border-neutral-800" />
                <div className="w-20 h-5 rounded bg-neutral-900" />
                <div className="w-16 h-5 rounded bg-neutral-900" />
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded bg-neutral-900" />
                  <div className="w-7 h-7 rounded bg-neutral-900" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tab === "documents") {
    return (
      <div className="p-6 space-y-6 flex-1 overflow-y-auto animate-pulse">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="space-y-1.5">
            <div className="w-44 h-5 bg-neutral-800 rounded" />
            <div className="w-64 h-3 bg-neutral-850 rounded" />
          </div>
          <div className="w-32 h-9 rounded-lg bg-neutral-800" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-9 bg-neutral-900 border border-neutral-800 rounded-lg" />
          <div className="w-36 h-9 bg-neutral-900 border border-neutral-800 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded bg-neutral-900" />
                <div className="w-14 h-4 rounded bg-neutral-900" />
              </div>
              <div className="w-3/4 h-3.5 bg-neutral-700 rounded" />
              <div className="w-full h-2 bg-neutral-850 rounded" />
              <div className="flex justify-between pt-2 border-t border-neutral-900">
                <div className="w-20 h-2.5 bg-neutral-800 rounded" />
                <div className="w-16 h-2.5 bg-neutral-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "topology") {
    return (
      <div className="p-6 space-y-6 flex-1 overflow-y-auto animate-pulse">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="space-y-1.5">
            <div className="w-52 h-5 bg-neutral-800 rounded" />
            <div className="w-72 h-3 bg-neutral-850 rounded" />
          </div>
          <div className="w-28 h-8 rounded-lg bg-neutral-900 border border-neutral-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="w-24 h-3 bg-neutral-800 rounded" />
              <div className="w-16 h-6 bg-neutral-700 rounded" />
            </div>
          ))}
        </div>
        <div className="p-8 rounded-xl bg-neutral-950 border border-neutral-800 h-96 flex flex-col justify-center items-center space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-24 h-16 rounded-xl bg-neutral-900 border border-neutral-800" />
            <div className="w-12 h-1 bg-neutral-800" />
            <div className="w-24 h-16 rounded-xl bg-neutral-900 border border-neutral-800" />
            <div className="w-12 h-1 bg-neutral-800" />
            <div className="w-24 h-16 rounded-xl bg-neutral-900 border border-neutral-800" />
          </div>
          <div className="w-48 h-3 bg-neutral-800 rounded mt-4" />
        </div>
      </div>
    );
  }

  if (tab === "ingestion_logs") {
    return (
      <div className="p-6 space-y-4 flex-1 overflow-y-auto animate-pulse font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="space-y-1.5">
            <div className="w-48 h-5 bg-neutral-800 rounded" />
            <div className="w-64 h-3 bg-neutral-850 rounded" />
          </div>
          <div className="w-28 h-8 rounded-lg bg-neutral-900 border border-neutral-800" />
        </div>
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-16 h-3 bg-neutral-800 rounded" />
              <div className="w-12 h-4 bg-neutral-900 border border-neutral-800 rounded" />
              <div className="w-20 h-3 bg-neutral-800 rounded" />
              <div className="flex-1 h-3 bg-neutral-850 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "models_cost") {
    return (
      <div className="p-6 space-y-6 flex-1 overflow-y-auto animate-pulse">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="space-y-1.5">
            <div className="w-48 h-5 bg-neutral-800 rounded" />
            <div className="w-64 h-3 bg-neutral-850 rounded" />
          </div>
          <div className="w-24 h-8 rounded-lg bg-neutral-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="w-24 h-3 bg-neutral-800 rounded" />
              <div className="w-20 h-7 bg-neutral-700 rounded" />
              <div className="w-16 h-2 bg-neutral-850 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 rounded-xl bg-neutral-950 border border-neutral-800 p-4 space-y-3">
            <div className="w-32 h-4 bg-neutral-800 rounded" />
            <div className="h-44 bg-neutral-900/60 rounded" />
          </div>
          <div className="h-64 rounded-xl bg-neutral-950 border border-neutral-800 p-4 space-y-3">
            <div className="w-32 h-4 bg-neutral-800 rounded" />
            <div className="h-44 bg-neutral-900/60 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // simulator tab skeleton
  return (
    <div className="flex-1 flex overflow-hidden animate-pulse">
      <div className="flex-1 flex flex-col border-r border-neutral-800 bg-black p-5 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
          <div className="space-y-1">
            <div className="w-36 h-4 bg-neutral-800 rounded" />
            <div className="w-48 h-2.5 bg-neutral-850 rounded" />
          </div>
          <div className="w-20 h-6 bg-neutral-900 rounded" />
        </div>
        <div className="flex-1 p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
          <div className="w-1/3 h-3 bg-neutral-700 rounded" />
          <div className="w-full h-3 bg-neutral-800 rounded" />
          <div className="w-4/5 h-3 bg-neutral-800 rounded" />
        </div>
        <div className="h-12 rounded-xl bg-neutral-900 border border-neutral-800" />
      </div>

      <div className="w-96 flex-shrink-0 bg-neutral-950 p-5 space-y-4">
        <div className="w-32 h-4 bg-neutral-800 rounded" />
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="w-24 h-3 bg-neutral-700 rounded" />
          <div className="w-full h-2.5 bg-neutral-800 rounded" />
          <div className="w-3/4 h-2.5 bg-neutral-800 rounded" />
        </div>
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="w-24 h-3 bg-neutral-700 rounded" />
          <div className="w-full h-2.5 bg-neutral-800 rounded" />
        </div>
      </div>
    </div>
  );
}
