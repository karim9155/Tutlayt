"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState } from "react"
import { VerificationReviewModal } from "./verification-review-modal"
import { Eye, CheckCircle2, AlertCircle } from "lucide-react"

interface UserVerificationTableProps {
  clients: any[]
  interpreters: any[]
}

export function UserVerificationTable({ clients, interpreters }: UserVerificationTableProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Merge and sort users by submission date (or creation date if submission date logic is complex)
  // Ideally use document signed_at timestamps, but created_at is a safe fallback for order
  const allUsers = [
    ...clients.map(c => ({ 
        ...c, 
        role: 'client', 
        sortDate: c.created_at, // Fallback
        displayName: c.profiles?.full_name || 'Unnamed Client',
        displayEmail: c.profiles?.email
    })),
    ...interpreters.map(i => ({ 
        ...i, 
        role: 'interpreter', 
        sortDate: i.created_at,
        displayName: i.profiles?.full_name || 'Unnamed Interpreter',
        displayEmail: i.profiles?.email
    }))
  ].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())

  const handleReview = (user: any) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedUser(null), 300)
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>Review and approve user documentation.</CardDescription>
        </CardHeader>
        <CardContent>
            {allUsers.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg dashed border">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p> All caught up! No pending verifications.</p>
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allUsers.map((user) => (
                    <TableRow key={`${user.role}-${user.id}`}>
                        <TableCell>
                            <div className="font-medium">{user.displayName}</div>
                            <div className="text-xs text-slate-500">{user.displayEmail}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={user.role === 'client' ? 'secondary' : 'default'} className="capitalize">
                                {user.role}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                            {new Date(user.sortDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                            <StatusBadge role={user.role} status={user.role === 'client' ? user.verification_status : (user.verified ? 'verified' : 'pending')} />
                        </TableCell>
                        <TableCell className="text-right">
                            <Button size="sm" onClick={() => handleReview(user)}>
                                <Eye className="w-4 h-4 mr-1" /> Review
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
        </CardContent>

        <VerificationReviewModal 
            user={selectedUser} 
            isOpen={isModalOpen} 
            onClose={handleModalClose}
            onComplete={() => {
                // In a real generic table, we might filter locally, but Server Actions + revalidatePath handles refresh.
                // We assume the parent component refreshes or strict mode handles it.
            }}
        />
    </Card>
  )
}

function StatusBadge({ role, status }: { role: string, status: string }) {
    if (status === 'verified') return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Verified</Badge>
    if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>
    if (status === 'pending_approval' || status === 'pending') return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Pending Review</Badge>
    return <Badge variant="outline">{status}</Badge>
}
