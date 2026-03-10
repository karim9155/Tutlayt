"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { generateOneTimeCode, revokeOneTimeAccess, deleteOneTimeCode } from "@/app/admin/actions"
import { toast } from "sonner"
import { Copy, Check, Loader2, KeyRound, Trash2, Ban } from "lucide-react"

type AccessCode = {
  id: string
  code: string
  description: string | null
  used: boolean
  used_by_email: string | null
  used_by_name: string | null
  used_by_user_id: string | null
  used_at: string | null
  created_at: string
}

interface AccessCodesViewProps {
  accessCodes: AccessCode[]
}

export function AccessCodesView({ accessCodes: initialCodes }: AccessCodesViewProps) {
  const [codes, setCodes] = useState<AccessCode[]>(initialCodes)
  const [description, setDescription] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleGenerate() {
    setGenerating(true)
    setGeneratedCode(null)
    try {
      const res = await generateOneTimeCode(description.trim() || undefined)
      if (res?.error) {
        toast.error(res.error)
      } else if (res?.code) {
        setGeneratedCode(res.code)
        setDescription("")
        // Optimistically add to the list
        setCodes((prev) => [
          {
            id: res.id!,
            code: res.code!,
            description: description.trim() || null,
            used: false,
            used_by_email: null,
            used_by_name: null,
            used_by_user_id: null,
            used_at: null,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ])
        toast.success("Code generated successfully")
      }
    } catch {
      toast.error("Failed to generate code")
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy(code: string) {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRevoke(userId: string, codeId: string) {
    if (!confirm("Revoke this client's access? They will no longer be able to use the platform.")) return
    setLoadingId(codeId)
    try {
      const res = await revokeOneTimeAccess(userId)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Access revoked")
      }
    } catch {
      toast.error("Failed to revoke access")
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this unused code?")) return
    setLoadingId(id)
    try {
      const res = await deleteOneTimeCode(id)
      if (res?.error) {
        toast.error(res.error)
      } else {
        setCodes((prev) => prev.filter((c) => c.id !== id))
        toast.success("Code deleted")
      }
    } catch {
      toast.error("Failed to delete code")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Generate Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[var(--teal)]" />
            Generate One-Time Access Code
          </CardTitle>
          <CardDescription>
            Create a short code to give a guest client single-use access to the platform. The code is
            valid until it is used once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="code-description">Description (optional)</Label>
              <Input
                id="code-description"
                placeholder="e.g. Client name or service type"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={generating}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-[var(--teal)] hover:bg-[var(--teal-blue)] text-white font-semibold shrink-0"
            >
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              Generate Code
            </Button>
          </div>

          {/* Newly generated code display */}
          {generatedCode && (
            <div className="flex items-center gap-3 rounded-lg border-2 border-[var(--teal)] bg-[var(--teal)]/5 px-4 py-3">
              <span className="font-mono text-2xl font-bold tracking-widest text-[var(--deep-navy)] select-all">
                {generatedCode}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto shrink-0 text-[var(--teal)] hover:text-[var(--deep-navy)]"
                onClick={() => handleCopy(generatedCode)}
                title="Copy to clipboard"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Access Codes</CardTitle>
          <CardDescription>{codes.length} code{codes.length !== 1 ? "s" : ""} total</CardDescription>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
              No codes generated yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Code</th>
                    <th className="pb-2 pr-4 font-medium">Description</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Used By</th>
                    <th className="pb-2 pr-4 font-medium">Used At</th>
                    <th className="pb-2 font-medium">Created</th>
                    <th className="pb-2 pl-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((row) => (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4">
                        <span className="font-mono font-semibold tracking-wider text-[var(--deep-navy)]">
                          {row.code}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground max-w-[160px] truncate">
                        {row.description || "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {row.used ? (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">Used</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Available</Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {row.used_by_name ? (
                          <div>
                            <p className="font-medium">{row.used_by_name}</p>
                            <p className="text-xs text-muted-foreground">{row.used_by_email}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {row.used_at ? new Date(row.used_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 pl-4 text-right">
                        {row.used && row.used_by_user_id ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={loadingId === row.id}
                            onClick={() => handleRevoke(row.used_by_user_id!, row.id)}
                          >
                            {loadingId === row.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Ban className="h-3 w-3 mr-1" />
                            )}
                            Revoke
                          </Button>
                        ) : !row.used ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={loadingId === row.id}
                            onClick={() => handleDelete(row.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            {loadingId === row.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3 mr-1" />
                            )}
                            Delete
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
