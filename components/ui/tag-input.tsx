"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TagInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  defaultTags?: string[]
  onTagsChange?: (tags: string[]) => void
}

export function TagInput({ className, defaultTags = [], onTagsChange, name, ...props }: TagInputProps) {
  // Deduplicate defaultTags to prevent key collisions
  const [tags, setTags] = React.useState<string[]>(Array.from(new Set(defaultTags)))
  const [inputValue, setInputValue] = React.useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault()
      const newTag = inputValue.trim()
      if (newTag && !tags.includes(newTag)) {
        const newTags = [...tags, newTag]
        setTags(newTags)
        onTagsChange?.(newTags)
        setInputValue("")
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      const newTags = tags.slice(0, -1)
      setTags(newTags)
      onTagsChange?.(newTags)
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(newTags)
    onTagsChange?.(newTags)
  }

  return (
    <div className={cn("flex flex-wrap gap-2 p-2 border border-gray-200 rounded-lg bg-[var(--azureish-white)]/50 focus-within:border-[var(--teal)] focus-within:ring-[var(--teal)] focus-within:ring-1", className)}>
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1 bg-[var(--teal)] text-white hover:bg-[var(--teal)]/90">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {tag}</span>
          </button>
        </Badge>
      ))}
      <Input
        {...props}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 border-none shadow-none focus-visible:ring-0 p-0 h-auto min-w-[120px] bg-transparent"
      />
      {/* Hidden input to submit the values as a comma-separated string */}
      <input type="hidden" name={name} value={tags.join(",")} />
    </div>
  )
}
