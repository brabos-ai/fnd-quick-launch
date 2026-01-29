"use client"

import { useState, useRef, useEffect } from "react"
import { Check, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { CreateWorkspaceDialog } from "./create-workspace-dialog"
import { useAuthStore } from "@/stores/auth-store"
import { EmptyState } from "@/components/ui/empty-state"

interface WorkspaceSwitcherModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkspaceSwitcherModal({
  open,
  onOpenChange,
}: WorkspaceSwitcherModalProps) {
  const [search, setSearch] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const workspaceList = useAuthStore((state) => state.workspaceList)
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const switchWorkspace = useAuthStore((state) => state.switchWorkspace)
  const user = useAuthStore((state) => state.user)

  // Check if user can create workspace
  const canCreateWorkspace =
    user?.role && ["super-admin", "owner", "admin"].includes(user.role)

  // Add index to workspaces (1-based)
  const indexedWorkspaces = workspaceList.map((workspace, idx) => ({
    ...workspace,
    index: idx + 1,
  }))

  // Filter workspaces by search (by name OR by position number)
  const filteredWorkspaces = indexedWorkspaces.filter((workspace) => {
    if (!search) return true

    const searchLower = search.toLowerCase().trim()
    const searchNumber = parseInt(search, 10)

    // Match by name (contains search text)
    const matchesByName = workspace.name.toLowerCase().includes(searchLower)

    // Match by position (if search is a valid number)
    const matchesByPosition = !isNaN(searchNumber) && workspace.index === searchNumber

    // Also match if name contains the number as text
    const matchesByNumberInName = !isNaN(searchNumber) && workspace.name.includes(search)

    return matchesByName || matchesByPosition || matchesByNumberInName
  })

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Proprietário"
      case "admin":
        return "Administrador"
      default:
        return "Membro"
    }
  }

  const handleWorkspaceClick = (workspace: typeof workspaceList[0]) => {
    if (workspace.id !== currentWorkspace?.id) {
      switchWorkspace(workspace)
    }
    onOpenChange(false)
  }

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    // The CreateWorkspaceDialog already handles adding to the store
  }

  // Track scroll state for visual indicators
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = useState(false)

  // Check if content is scrollable
  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
        setCanScrollDown(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight - 10)
      }
    }

    // Check on mount and when filtered list changes
    setTimeout(checkScroll, 100)
  }, [filteredWorkspaces, open])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    setCanScrollDown(scrollTop < scrollHeight - clientHeight - 10)
  }

  // Count text
  const totalCount = workspaceList.length
  const showingCount = filteredWorkspaces.length
  const countText = search
    ? `${showingCount} de ${totalCount} workspaces`
    : `${totalCount} ${totalCount === 1 ? 'workspace' : 'workspaces'}`

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Trocar Workspace</DialogTitle>
            <DialogDescription>{countText}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou número..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-base"
              />
            </div>

            {/* Workspace List */}
            {filteredWorkspaces.length > 0 ? (
              <div className="relative">
                <ScrollArea className="h-[280px]">
                  <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="space-y-1 pr-3"
                  >
                    {filteredWorkspaces.map((workspace) => {
                      const isActive = workspace.id === currentWorkspace?.id
                      return (
                        <div
                          key={workspace.id}
                          onClick={() => handleWorkspaceClick(workspace)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                            isActive
                              ? "bg-primary/[0.08]"
                              : "hover:bg-muted"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Position number */}
                            <span className="text-xs text-muted-foreground font-mono w-5 shrink-0 text-right">
                              {workspace.index}
                            </span>
                            <div className="min-w-0">
                              <p
                                className={cn(
                                  "font-medium truncate",
                                  isActive && "text-primary"
                                )}
                              >
                                {workspace.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {getRoleLabel(workspace.role)}
                              </p>
                            </div>
                          </div>
                          {/* Check indicator on the right */}
                          {isActive && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
                {/* Scroll indicator - fade at bottom */}
                {canScrollDown && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                )}
              </div>
            ) : (
              <div className="py-8">
                <EmptyState
                  icon={Search}
                  title="Nenhum workspace encontrado"
                  description="Tente outro termo de busca"
                  action={
                    canCreateWorkspace ? (
                      <Button
                        className="gap-2"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Criar Workspace
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            )}

            {/* Footer: Create New Workspace Button */}
            {canCreateWorkspace && filteredWorkspaces.length > 0 && (
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Criar novo workspace
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Workspace Dialog - controlled externally */}
      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        hideDefaultTrigger
      />
    </>
  )
}

WorkspaceSwitcherModal.displayName = "WorkspaceSwitcherModal"
