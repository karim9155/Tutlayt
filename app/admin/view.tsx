"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useRef } from "react"
import { uploadDocument, deleteDocument } from "./actions"
import { toast } from "sonner"
import { FileText, Trash2, Download, Upload, Loader2, ExternalLink } from "lucide-react"

type Doc = {
    name: string
    id: string
    publicUrl: string
    bucket: string
    created_at: string
    metadata?: any
}

interface AdminViewProps {
    interpreters: Doc[]
    translators: Doc[]
    clients: Doc[]
}

export function AdminView({ interpreters, translators, clients }: AdminViewProps) {
    return (
        <Tabs defaultValue="interpreter" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
                <TabsTrigger value="interpreter">Interpreters</TabsTrigger>
                <TabsTrigger value="translator">Sworn Translators</TabsTrigger>
                <TabsTrigger value="client">Clients</TabsTrigger>
            </TabsList>
            <TabsContent value="interpreter" className="space-y-4">
                <DocumentSection title="Interpreter Documents" bucket="interpreter-documents" files={interpreters} />
            </TabsContent>
            <TabsContent value="translator" className="space-y-4">
                <DocumentSection title="Sworn Translator Documents" bucket="sworn-translator-documents" files={translators} />
            </TabsContent>
            <TabsContent value="client" className="space-y-4">
                <DocumentSection title="Client Documents" bucket="client-documents" files={clients} />
            </TabsContent>
        </Tabs>
    )
}

function DocumentSection({ title, bucket, files }: { title: string, bucket: string, files: Doc[] }) {
    const [uploading, setUploading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault()
        const file = fileInputRef.current?.files?.[0]
        if (!file) return
        
        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        
        try {
            const res = await uploadDocument(bucket, formData)
            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success("Uploaded successfully")
                if (fileInputRef.current) fileInputRef.current.value = ""
            }
        } catch (err) {
            toast.error("Upload failed")
        } finally {
            setUploading(false)
        }
    }

    async function handleDelete(fileName: string, id: string) {
        if (!confirm("Are you sure you want to delete this file?")) return

        setDeletingId(id)
        try {
            const res = await deleteDocument(bucket, fileName)
            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success("Deleted successfully")
            }
        } catch (err) {
            toast.error("Deletion failed")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Upload to {title}</CardTitle>
                    <CardDescription>Select a file to upload to the {bucket} bucket.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="flex gap-4 items-end">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor={`file-${bucket}`}>Document</Label>
                            <Input id={`file-${bucket}`} type="file" ref={fileInputRef} disabled={uploading} />
                        </div>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Upload
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {files.length === 0 ? (
                    <div className="col-span-full text-center p-8 text-muted-foreground border rounded-lg border-dashed">
                        No documents found in this bucket.
                    </div>
                ) : (
                    files.map((file) => (
                        <Card key={file.id} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="truncate">
                                            <p className="font-medium text-sm truncate" title={file.name}>
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(file.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <a href={file.publicUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-3 w-3" />
                                            View
                                        </a>
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        className="h-8 w-8 shrink-0"
                                        disabled={deletingId === file.id}
                                        onClick={() => handleDelete(file.name, file.id)}
                                    >
                                        {deletingId === file.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
