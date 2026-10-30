"use client";

import { Download, Link, LoaderCircle, X } from "lucide-react";
import type { Ref } from "react";
import { buttonStyles, cn } from "./ui";

interface UrlBarProps {
  value: string;
  loading: boolean;
  inputRef: Ref<HTMLInputElement>;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export function UrlBar({ value, loading, inputRef, onChange, onSubmit }: UrlBarProps) {
  return (
    <form
      className="mt-9 lg:mt-8.75"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
    >
      <div
        data-loading={loading || undefined}
        className={cn(
          "gradient-ring relative rounded-[1.5rem] p-3 transition-shadow duration-500 sm:p-4.5",
          "bg-[linear-gradient(180deg,rgb(15_28_52/0.78),rgb(9_17_33/0.78))] shadow-[0_0_70px_-24px_rgb(91_92_255/0.6)] backdrop-blur-sm",
          "[--ring:linear-gradient(90deg,rgb(30_175_255/0.9)_0%,rgb(50_80_200/0.35)_24%,rgb(132_80_255/0.95)_50%,rgb(50_80_200/0.35)_76%,rgb(30_175_255/0.65)_100%)]",
          "data-loading:shadow-[0_0_90px_-18px_rgb(91_92_255/0.95)]",
        )}
      >
        <span
          aria-hidden
          className="absolute top-0 left-1/2 h-px w-2/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#a678ff] to-transparent shadow-[0_0_18px_3px_rgb(140_90_255/0.55)]"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3.5">
          <label className="relative flex h-15 w-full items-center rounded-[1rem] border border-[#1d2944] bg-[#0f182b]/80 transition-colors focus-within:border-[#3a4f86] sm:h-17.5 sm:flex-1">
            <span className="sr-only">Video link</span>
            {loading && <span aria-hidden className="input-scan pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" />}
            <Link className="pointer-events-none absolute left-5 size-5.5 text-[#a3abc6] sm:left-6 sm:size-6.5" strokeWidth={1.9} aria-hidden />
            <input
              ref={inputRef}
              type="text"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Paste video link here..."
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className="relative size-full rounded-[1rem] bg-transparent pr-14 pl-14 text-dp-17 text-fg outline-none placeholder:text-[#7a83a3] sm:pl-17 sm:text-dp-19"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Clear link"
              className="absolute right-3 grid size-10 place-items-center rounded-full text-[#9aa3bd] transition-colors hover:bg-white/5 hover:text-fg sm:right-4"
            >
              <X className="size-6" strokeWidth={1.8} />
            </button>
          </label>
          <button
            type="submit"
            disabled={loading}
            className={cn(buttonStyles.primary, "h-15 shrink-0 rounded-[1rem] text-dp-18 sm:h-17.5 sm:w-59.25 sm:text-dp-19")}
          >
            {loading ? (
              <LoaderCircle className="size-6 animate-spin" aria-hidden />
            ) : (
              <Download className="size-6.5" strokeWidth={2.2} aria-hidden />
            )}
            {loading ? "Fetching…" : "Download"}
          </button>
        </div>
      </div>
    </form>
  );
}
