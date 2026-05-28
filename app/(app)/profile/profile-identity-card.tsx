// ProfileIdentityCard — avatar, inline name editing, tier badge, XP bar.
// Manages its own name-edit state so ProfileView stays focused on data fetching.

import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { Check, Pencil, X } from "lucide-react";
import { TierBadge, type TierLevel } from "@/components/paave/tier-badge";
import { XPBar } from "@/components/paave/xp-bar";

export function ProfileIdentityCard({
  displayName,
  email,
  tier,
  xp,
  onNameSave,
}: {
  displayName: string;
  email: string;
  tier: TierLevel;
  xp: { value: number; max: number };
  /** Called with the new name after a successful Supabase auth.updateUser call */
  onNameSave: (newName: string) => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus the input as soon as edit mode opens
  useEffect(() => {
    if (editingName) {
      const t = setTimeout(() => nameInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [editingName]);

  function startEditingName() {
    setNameInput(displayName);
    setEditingName(true);
  }

  function cancelEditingName() {
    setEditingName(false);
    setNameInput("");
  }

  async function saveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === displayName) {
      cancelEditingName();
      return;
    }
    setNameSaving(true);
    try {
      const db = getBrowserClient();
      await db.auth.updateUser({ data: { full_name: trimmed } });
      onNameSave(trimmed);
    } catch {
      // Silent failure — keep the old name visible
    } finally {
      setNameSaving(false);
      setEditingName(false);
    }
  }

  const initial = displayName.charAt(0).toUpperCase() || "?";

  return (
    <section className="rounded-2xl bg-ink-violet-surface border border-border-neo px-5 py-5">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="shrink-0 grid size-16 place-items-center rounded-full text-[22px] font-bold text-ink-violet-base"
          style={{ background: "linear-gradient(135deg, #B5E82F, #7F77DD)" }}
        >
          {initial}
        </div>

        {/* Name + email + tier */}
        <div className="min-w-0 flex-1">
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                ref={nameInputRef}
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") cancelEditingName();
                }}
                maxLength={50}
                className="flex-1 min-w-0 bg-ink-violet-raised border border-lime-signal-400/60 rounded-lg px-2 py-1 font-display text-[15px] font-bold text-text-neo-primary outline-none"
                disabled={nameSaving}
              />
              <button
                onClick={saveName}
                disabled={nameSaving}
                aria-label="Lưu tên"
                className="grid size-7 place-items-center rounded-lg bg-lime-signal-400 text-ink-violet-base shrink-0"
              >
                <Check className="size-3.5" strokeWidth={3} />
              </button>
              <button
                onClick={cancelEditingName}
                aria-label="Huỷ"
                className="grid size-7 place-items-center rounded-lg bg-ink-violet-raised text-text-neo-tertiary hover:text-text-neo-primary shrink-0"
              >
                <X className="size-3.5" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditingName}
              className="group flex items-center gap-1.5 text-left max-w-full"
              aria-label="Chỉnh sửa tên"
            >
              <p className="font-display text-[17px] font-bold text-text-neo-primary truncate">
                {displayName}
              </p>
              <Pencil
                className="size-3.5 text-text-neo-tertiary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                strokeWidth={2}
              />
            </button>
          )}
          <p className="text-[12px] text-text-neo-tertiary truncate mt-0.5">{email}</p>
          <div className="mt-2">
            <TierBadge level={tier} showLocale="vi" />
          </div>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="mt-5 space-y-1.5">
        <div className="flex justify-between text-[11px] text-text-neo-tertiary">
          <span>Tiến độ lên Cấp {tier === 6 ? "MAX" : tier + 1}</span>
          <span>
            {tier === 6 ? "Huyền thoại 👑" : `${xp.value} / ${xp.max} lệnh`}
          </span>
        </div>
        <XPBar value={xp.value} max={xp.max} />
      </div>
    </section>
  );
}
