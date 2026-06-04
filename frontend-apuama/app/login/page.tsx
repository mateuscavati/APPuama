"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ReloadIcon } from "@radix-ui/react-icons" // Import ReloadIcon

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false) // Add loading state
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null;

  const handleLogin = async (e: React.FormEvent) => { // Make function async
    e.preventDefault()
    setError("")
    setIsLoading(true) // Set loading to true

    if (!email || !password) {
      setError("Por favor, preencha todos os campos")
      setIsLoading(false) // Set loading to false
      return
    }

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/") 
      } else {
        setError("Email ou senha incorretos, ou usuário não aprovado")
      }
    } catch (err) {
      setError("Ocorreu um erro ao tentar fazer login. Tente novamente.")
      // console.error(err)
    } finally {
      setIsLoading(false) // Set loading to false regardless of success or failure
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary mb-2">APPuama Racing</CardTitle>
          <CardDescription className="text-base">Plataforma de Análise</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-black font-semibold" disabled={isLoading}>
              {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>

        

          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem uma conta?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
