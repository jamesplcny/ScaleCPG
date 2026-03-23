"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface CategoriesTagsInputProps {
  value: string[];
  onChange: (categories: string[]) => void;
}

export function CategoriesTagsInput({ value, onChange }: CategoriesTagsInputProps) {
  const [input, setInput] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    if (tag.length > 40) return;
    if (value.includes(tag)) {
      setInput("");
      return;
    }
    onChange([...value, tag]);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && input === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div>
      <div className="w-full px-4 py-2 border border-border rounded-lg bg-transparent transition-colors focus-within:border-accent-rose flex flex-wrap gap-1.5 items-center min-h-[42px]">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-accent-teal/10 text-accent-teal text-xs rounded-full font-sans"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="p-0 border-none bg-transparent cursor-pointer text-accent-teal/60 hover:text-accent-teal"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={value.length === 0 ? "Type a category and press Enter..." : ""}
          className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm font-sans text-text-primary placeholder:text-text-muted p-0"
        />
      </div>
      <p className="text-[11px] text-text-muted mt-1.5">Press Enter or comma to add. Backspace to remove last.</p>
    </div>
  );
}
