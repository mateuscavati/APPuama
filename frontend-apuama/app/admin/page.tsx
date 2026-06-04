"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, X, Plus, Trash2 } from "lucide-react"

export default function AdminPage() {
  const { 
    currentUser, users, cars, approveUser, rejectUser, deleteUser, 
    addCar, removeCar, addUser, fetchUsers, fetchCars, 
    checklistItems, fetchChecklistItems, addChecklistItem, removeChecklistItem 
  } = useAuth()
  
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"users" | "cars" | "checklist">("users")
  
  const [showAddCar, setShowAddCar] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddChecklistItem, setShowAddChecklistItem] = useState(false)
  
  const [newCar, setNewCar] = useState({
    name: "",
    model: "",
    year: new Date().getFullYear().toString(),
    wheelbase: "",
    trackWidth: "",
  })
  
  const [newUser, setNewUser] = useState({
    email: "",
    fullName: "",
    matricula: "",
    role: "membro" as const,
    password: "",
  })
  
  const [newChecklistItem, setNewChecklistItem] = useState({ category: "", description: "" })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return;
    if (!currentUser || (!currentUser.isAdmin && currentUser.posicaoEquipe !== "Admin" && currentUser.posicaoEquipe !== "lider")) {
      router.push("/")
      return;
    }
    fetchUsers();
    fetchCars();
    fetchChecklistItems();
  }, [currentUser, router, fetchUsers, fetchCars, fetchChecklistItems, mounted])

  const handleAddCar = async () => {
    if (newCar.name.trim() && newCar.model.trim() && newCar.wheelbase && newCar.trackWidth) {
      await addCar(newCar.name, newCar.model, Number(newCar.year), Number(newCar.wheelbase), Number(newCar.trackWidth))
      setNewCar({ name: "", model: "", year: new Date().getFullYear().toString(), wheelbase: "", trackWidth: "" })
      setShowAddCar(false)
      fetchCars();
    }
  }

  const handleAddUser = async () => {
    if (newUser.email.trim() && newUser.fullName.trim() && newUser.matricula.trim() && newUser.password.trim()) {
      await addUser(newUser.email, newUser.fullName, newUser.matricula, newUser.role, newUser.password)
      setNewUser({ email: "", fullName: "", matricula: "", role: "membro", password: "" })
      setShowAddUser(false)
      fetchUsers();
    }
  }

  const handleAddChecklistItem = async () => {
    if (newChecklistItem.category.trim() && newChecklistItem.description.trim()) {
      await addChecklistItem(newChecklistItem.category, newChecklistItem.description)
      setNewChecklistItem({ category: "", description: "" })
      setShowAddChecklistItem(false)
      fetchChecklistItems();
    }
  }

  const handleDeleteChecklistItem = async (itemId: string) => {
    await removeChecklistItem(itemId);
    fetchChecklistItems();
  }

  if (!mounted) return null;

  if (!currentUser || (!currentUser.isAdmin && currentUser.posicaoEquipe !== "Admin" && currentUser.posicaoEquipe !== "lider")) {
    return null
  }

  const pendingUsers = users.filter((u) => !u.isAprovado && u.posicaoEquipe !== "Admin")
  const approvedUsers = users.filter((u) => u.isAprovado || u.posicaoEquipe === "Admin")

  const checklistByCategory = checklistItems.reduce(
    (acc, item) => {
      const category = acc.find((c) => c.category === item.area)
      if (category) {
        category.items.push(item)
      } else {
        acc.push({ category: item.area, items: [item] })
      }
      return acc
    },
    [] as Array<{ category: string; items: typeof checklistItems }>,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Dashboard de Administrador</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Usuários ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("cars")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "cars"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Carros ({cars.length})
          </button>
          <button
            onClick={() => setActiveTab("checklist")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "checklist"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Checklist Padrão ({checklistItems.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Adicionar Novo Usuário</h2>
                <Button
                  onClick={() => setShowAddUser(!showAddUser)}
                  className="bg-primary hover:bg-primary/90 text-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Usuário
                </Button>
              </div>

              {showAddUser && (
                <Card className="bg-card/50 backdrop-blur border-border/50 mb-6">
                  <CardHeader>
                    <CardTitle>Adicionar Novo Usuário</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="px-4 py-2 bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="Nome Completo"
                        value={newUser.fullName}
                        onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                        className="px-4 py-2 bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="Matrícula"
                        value={newUser.matricula}
                        onChange={(e) => setNewUser({ ...newUser, matricula: e.target.value })}
                        className="px-4 py-2 bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                      />
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                        className="px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:border-primary"
                      >
                        <option value="trainee">Trainee</option>
                        <option value="membro">Membro</option>
                        <option value="lider">Líder</option>
                        <option value="admin">Admin</option>
                      </select>
                      <input
                        type="password"
                        placeholder="Senha"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="px-4 py-2 bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg focus:outline-none focus:border-primary col-span-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddUser} className="bg-primary hover:bg-primary/90 text-black">
                        Adicionar
                      </Button>
                      <Button onClick={() => setShowAddUser(false)} variant="outline">
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Aprovação de Cadastros</h2>
              {pendingUsers.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="pt-6 text-center text-muted-foreground">Nenhum cadastro pendente</CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingUsers.map((u) => (
                    <Card key={u.id} className="bg-card/50 backdrop-blur border-border/50">
                      <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{u.nomeCompleto}</p>
                          <p className="text-sm text-muted-foreground">
                            {u.email} • Matrícula: {u.matricula} • {u.posicaoEquipe}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={async () => { await approveUser(u.id); fetchUsers(); }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => { await rejectUser(u.id); fetchUsers(); }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Usuários Aprovados</h2>
              <div className="space-y-2">
                {approvedUsers.map((u) => (
                  <Card key={u.id} className="bg-card/50 backdrop-blur border-border/50">
                    <CardContent className="pt-6 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{u.nomeCompleto}</p>
                        <p className="text-sm text-muted-foreground">
                          {u.email} • Matrícula: {u.matricula}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full">{u.posicaoEquipe}</span>
                        {u.posicaoEquipe !== "Admin" && (
                          <Button size="sm" variant="destructive" onClick={async () => { await deleteUser(u.id); fetchUsers(); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cars Tab */}
        {activeTab === "cars" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Gerenciar Carros</h2>
              <Button onClick={() => setShowAddCar(!showAddCar)} className="bg-primary hover:bg-primary/90 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Carro
              </Button>
            </div>

            {showAddCar && (
              <Card className="bg-card/50 backdrop-blur border-border/50 mb-6">
                <CardHeader>
                  <CardTitle>Adicionar Novo Carro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome"
                      value={newCar.name}
                      onChange={(e) => setNewCar({ ...newCar, name: e.target.value })}
                      className="px-4 py-2 bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Modelo"
                      value={newCar.model}
                      onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                      className="px-4 py-2 bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Ano"
                      value={newCar.year}
                      onChange={(e) => setNewCar({ ...newCar, year: e.target.value })}
                      className="px-4 py-2 bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      placeholder="Entre-eixos (mm)"
                      value={newCar.wheelbase}
                      onChange={(e) => setNewCar({ ...newCar, wheelbase: e.target.value })}
                      className="px-4 py-2 bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      placeholder="Distância entre rodas (mm)"
                      value={newCar.trackWidth}
                      onChange={(e) => setNewCar({ ...newCar, trackWidth: e.target.value })}
                      className="px-4 py-2 bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddCar} className="bg-primary hover:bg-primary/90 text-black">
                      Adicionar
                    </Button>
                    <Button onClick={() => setShowAddCar(false)} variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {cars.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="pt-6 text-center text-muted-foreground">Nenhum carro adicionado</CardContent>
                </Card>
              ) : (
                cars.map((car) => (
                  <Card key={car.id} className="bg-card/50 backdrop-blur border-border/50">
                    <CardContent className="pt-6 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{car.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {car.modelo} • {car.ano} • Entre-eixos: {car.entreEixo}mm • Track: {car.distanciaRodas}mm
                        </p>
                      </div>
                      <Button size="sm" variant="destructive" onClick={async () => { await removeCar(car.id); fetchCars(); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === "checklist" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Checklist Padrão</h2>
              <Button
                onClick={() => setShowAddChecklistItem(!showAddChecklistItem)}
                className="bg-primary hover:bg-primary/90 text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {showAddChecklistItem && (
              <Card className="bg-card/50 backdrop-blur border-border/50 mb-6">
                <CardHeader>
                  <CardTitle>Adicionar Item ao Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Categoria"
                      value={newChecklistItem.category}
                      onChange={(e) => setNewChecklistItem({ ...newChecklistItem, category: e.target.value })}
                      className="px-4 py-2 bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="Descrição"
                      value={newChecklistItem.description}
                      onChange={(e) => setNewChecklistItem({ ...newChecklistItem, description: e.target.value })}
                      className="px-4 py-2 bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg focus:outline-none focus:border-primary col-span-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddChecklistItem} className="bg-primary hover:bg-primary/90 text-black">
                      Adicionar
                    </Button>
                    <Button onClick={() => setShowAddChecklistItem(false)} variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-6">
              {checklistByCategory.map((group) => (
                <div key={group.category}>
                  <h3 className="text-lg font-semibold text-foreground mb-3 border-l-4 border-primary pl-3">
                    {group.category}
                  </h3>
                  <div className="space-y-2 pl-4">
                    {group.items.map((item) => (
                      <Card key={item.id} className="bg-card/50 backdrop-blur border-border/50">
                        <CardContent className="pt-6 flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">{item.descricaoItem}</p>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteChecklistItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}

              {checklistItems.length === 0 && (
                <Card className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="pt-6 text-center text-muted-foreground">Nenhum item no checklist</CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
