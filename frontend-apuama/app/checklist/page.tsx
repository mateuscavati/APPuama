"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth, ChecklistItem } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"

interface ChecklistItemWithCompletion extends ChecklistItem {
  completed: boolean
}

export default function ChecklistPage() {
  const { currentUser, checklistItems, fetchChecklistItems } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<ChecklistItemWithCompletion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
      return
    }
    fetchChecklistItems().finally(() => setLoading(false))
  }, [currentUser, router, fetchChecklistItems])

  useEffect(() => {
    if (checklistItems && currentUser) {
      const userChecklistKey = `checklist_${currentUser.id}`
      const userCompletionState = JSON.parse(localStorage.getItem(userChecklistKey) || "{}")

      setItems(checklistItems.map(item => ({
        ...item,
        completed: userCompletionState[item.id] || false,
      })))
    }
  }, [checklistItems, currentUser])

  const toggleItem = (id: string) => {
    setItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );

      // Persist completion state to localStorage
      if (currentUser) {
        const userChecklistKey = `checklist_${currentUser.id}`
        const completionState = updatedItems.reduce(
          (acc, item) => {
            acc[item.id] = item.completed
            return acc
          },
          {} as Record<string, boolean>,
        )
        localStorage.setItem(userChecklistKey, JSON.stringify(completionState))
      }
      return updatedItems
    })
  }

  const categories = Array.from(new Set(items.map((item) => item.area))).sort()
  const completedCount = items.filter((item) => item.completed).length
  const totalCount = items.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  if (loading || !currentUser)
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Checklist do Carro</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <Card className="mb-8 bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Progresso</CardTitle>
            <CardDescription>
              {completedCount} de {totalCount} itens completados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% concluído</p>
          </CardContent>
        </Card>

        {/* Checklist Items by Category */}
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryItems = items.filter((item) => item.area === category)
            const categoryCompleted = categoryItems.filter((item) => item.completed).length

            return (
              <Card key={category} className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground">{category}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {categoryCompleted}/{categoryItems.length}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{
                        width: `${categoryItems.length > 0 ? (categoryCompleted / categoryItems.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => toggleItem(item.id)}
                          className="w-5 h-5"
                        />
                        <span
                          className={`flex-1 ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                        >
                          {item.descricaoItem}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
