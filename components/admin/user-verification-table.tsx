"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
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
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock,
  MoreHorizontal
} from "lucide-react"
import { VerificationReviewModal } from "./verification-review-modal"

interface UserVerificationTableProps {
  clients: any[]
  interpreters: any[]
  totalClients?: number
  totalInterpreters?: number
  page?: number
  totalPages?: number
}

const ITEMS_PER_PAGE = 10

export function UserVerificationTable({ 
  clients, 
  interpreters,
}: UserVerificationTableProps) {
  const router = useRouter()
  
  // State
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 1. Normalize Data
  const allUsers = useMemo(() => {
    const formattedClients = clients.map(c => ({ 
      ...c, 
      role: 'client', 
      sortDate: c.created_at,
      displayName: c.company_name || 'Unnamed Client',
      displayEmail: c.profiles?.email || c.email,
      displayStatus: c.verification_status || 'pending'
    }))

    const formattedInterpreters = interpreters.map(i => ({ 
      ...i, 
      role: 'interpreter', 
      sortDate: i.created_at,
      displayName: i.profiles?.full_name || [i.profiles?.first_name, i.profiles?.last_name].filter(Boolean).join(' ') || 'Unnamed Interpreter',
      displayEmail: i.profiles?.email || i.email,
      displayStatus: i.verified ? 'verified' : (i.rejection_reason ? 'rejected' : 'pending')
    }))

    return [...formattedClients, ...formattedInterpreters].sort((a, b) => 
      new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
    )
  }, [clients, interpreters])

  // 2. Filter Data
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      // Tab Filtering
      const matchesTab = 
        (activeTab === "all") ||
        (activeTab === "clients" && user.role === 'client') ||
        (activeTab === "interpreters" && user.role === 'interpreter') ||
        (activeTab === "pending" && user.displayStatus === 'pending') ||
        (activeTab === "rejected" && user.displayStatus === 'rejected')

      // Search Filtering
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        user.displayName.toLowerCase().includes(query) || 
        user.displayEmail?.toLowerCase().includes(query)

      return matchesTab && matchesSearch
    })
  }, [allUsers, activeTab, searchQuery])

  // 3. Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredUsers, currentPage])

  // Handlers
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleReview = (user: any) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setSelectedUser(null)
      router.refresh()
    }, 300)
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--deep-navy)]">Verifications</h2>
          <p className="text-muted-foreground">Manage user verification requests.</p>
        </div>
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8 bg-white"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-white border w-full justify-start overflow-x-auto p-1">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="interpreters">Interpreters</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <Card className="mt-4 border shadow-sm bg-white">
          <CardContent className="p-0">
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
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                       <div className="flex flex-col items-center justify-center">
                         <Search className="h-8 w-8 mb-2 opacity-20" />
                         <p>No users found matching your criteria.</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={`${user.role}-${user.id}`}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-[var(--deep-navy)]">{user.displayName}</span>
                          <span className="text-xs text-muted-foreground">{user.displayEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize text-xs font-normal">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(user.sortDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.displayStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleReview(user)}
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Open menu</span>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          
          {/* Footer Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Tabs>

      <VerificationReviewModal 
        user={selectedUser} 
        isOpen={isModalOpen} 
        onClose={handleModalClose}
        onComplete={() => {
          handleModalClose()
          router.refresh() 
        }}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'verified') {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 flex w-fit items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Verified
      </Badge>
    )
  }
  if (status === 'rejected') {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 flex w-fit items-center gap-1">
        <XCircle className="h-3 w-3" />
        Rejected
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 flex w-fit items-center gap-1">
      <Clock className="h-3 w-3" />
      Pending
    </Badge>
  )
}

