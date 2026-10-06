"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Award,
  Mail,
  Users,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { TEAM_MEMBERS } from "../mock-data/about-data";

export function AboutTeam() {
  return (
    <section className="py-12 sm:py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="space-y-1.5 text-right">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400">
              <Users className="h-3.5 w-3.5" />
              <span>تخصص و سرمایه انسانی</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              تیم رهبری و متخصصان ارشد زیرساخت
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md text-right leading-relaxed">
            ترکیبی از بالاترین مدارک بین‌المللی شبکه (CCIE، CCNP) و بیش از یک دهه تجربه عملی در
            بزرگ‌ترین پروژه‌های دیتاسنتر و مخابراتی کشور.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM_MEMBERS.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.35,
                delay: index * 0.05,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="group rounded-3xl border border-neutral-800/90 bg-neutral-900/40 p-6 text-right hover:border-neutral-700 hover:bg-neutral-900/80 transition-all flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-orange-500/5"
            >
              <div className="space-y-4">
                {/* Header: Avatar & Experience */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black text-base shadow-md shadow-orange-600/20 group-hover:scale-105 transition-transform">
                      {member.avatarInitials}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-orange-300 transition-colors">
                        {member.name}
                      </h3>
                      <div className="text-xs text-neutral-400 font-medium">
                        {member.role}
                      </div>
                    </div>
                  </div>

                  <span className="rounded-full bg-neutral-800/90 border border-neutral-700/60 px-2.5 py-1 text-[10px] font-semibold text-neutral-300">
                    {member.experience}
                  </span>
                </div>

                {/* Certification Badge */}
                {member.certification && (
                  <div className="flex items-center gap-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 text-xs font-mono text-orange-300">
                    <Award className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                    <span className="truncate">{member.certification}</span>
                  </div>
                )}

                {/* Bio */}
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {member.bio}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-400">
                  {member.department}
                </span>

                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>ارتباط مستقیم</span>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
