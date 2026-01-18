"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { VerificationReviewModal } from "./verification-review-modal"
import { Eye, CheckCircle2 } from "lucide-react"

interface UserVerificationTableProps {
  clients: any[]
  interpreters: any[]
}

export function UserVerificationTable({ clients, interpreters }: UserVerificationTableProps) {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleReview = (user: any) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedUser(null), 300)
  }
  
  // Format clients
  const clientUsers = clients.map(c => ({ 
      ...c, 
      role: 'client', 
      sortDate: c.created_at,
      displayName: c.profiles?.full_name || 'Unnamed Client',
      displayEmail: c.profiles?.email,
      displayStatus: c.verification_status
  })).sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())

  // Format interpreters
  const interpreterUsers = interpreters.map(i => ({ 
      ...i, 
      role: 'interpreter', 
      sortDate: i.created_at,
      displayName: i.profiles?.full_name || 'Unnamed Interpreter',
      displayEmail: i.profiles?.email,
      displayStatus: i.verified ? 'verified' : (i.rejection_reason ? 'rejected' : 'pending')
  })).sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())

  const UsersTable = ({ data }: { data: any[] }) => {
      if (data.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg dashed border">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p>No records found.</p>
            </div>
        )
      }

      return (
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((user) => (
                <TableRow key={`${user.role}-${user.id}`}>
                    <TableCell>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-xs text-slate-500">{user.displayEmail}</div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                        {new Date(user.sortDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                        <StatusBadge role={user.role} status={user.displayStatus} />
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
      )
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
        <Tabs defaultValue="clients" className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                   <h2 className="text-2xl font-bold tracking-tight text-[var(--deep-navy)]">Verifications</h2>
                   <p className="text-muted-foreground">Manage ongoing verification requests.</p>
                </div>
                <TabsList className="bg-white border">
                    <TabsTrigger value="clients">Clients ({clientUsers.length})</TabsTrigger>
                    <TabsTrigger value="interpreters">Interpreters ({interpreterUsers.length})</TabsTrigger>
                </TabsList>
            </div>
            
            <Card className="border shadow-sm">
                <CardContent className="p-0">
                    <TabsContent value="clients" className="m-0 p-4">
                        <UsersTable data={clientUsers} />
                    </TabsContent>
                    <TabsContent value="interpreters" className="m-0 p-4">
                        <UsersTable data={interpreterUsers} />
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>

        <VerificationReviewModal 
            user={selectedUser} 
            isOpen={isModalOpen} 
            onClose={handleModalClose}
            onComplete={() => router.refresh()}
        />
    </Card>
  )
}

function StatusBadge({ role, status }: { role: string, status: string }) {
    if (status === 'verified') return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Verified</Badge>
    if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>
    if (status === 'pending_approval' || status === 'pending') return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">Pending Review</Badge>
    return <Badge variant="outline">{status}</Badge>
}
