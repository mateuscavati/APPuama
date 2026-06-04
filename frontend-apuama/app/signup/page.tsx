"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignupPage() {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [matricula, setMatricula] = useState("")
  const [role, setRole] = useState<"trainee" | "membro" | "lider">("membro")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const { signup } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null;

  const handleNext = () => {
    if (step === 1) {
      if (!fullName || !email) {
        setError("Por favor, preencha todos os campos")
        return
      }
      if (!email.includes("@")) {
        setError("Email inválido")
        return
      }
      setError("")
      setStep(2)
    } else if (step === 2) {
      if (!matricula || !role) {
        setError("Por favor, preencha todos os campos")
        return
      }
      setError("")
      setStep(3)
    }
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password || !confirmPassword) {
      setError("Por favor, preencha todas as senhas")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem")
      return
    }

    if (password.length < 6) {
      setError("Senha deve ter no mínimo 6 caracteres")
      return
    }

    if (signup(email, fullName, matricula, role, password)) {
      router.push("/login")
    } else {
      setError("Esse email já está cadastrado")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary mb-2">APPuama Racing</CardTitle>
          <CardDescription className="text-base">Cadastro - Etapa {step} de 3</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={
              step === 3
                ? handleSignup
                : (e) => {
                    e.preventDefault()
                    handleNext()
                  }
            }
            className="space-y-4"
          >
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                    placeholder="Seu nome"
                  />
                </div>
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
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Matrícula</label>
                  <input
                    type="text"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                    placeholder="Ex: 001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Posição na Equipe</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as "trainee" | "membro" | "lider")}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="trainee">Trainee</option>
                    <option value="membro">Membro</option>
                    <option value="lider">Líder</option>
                  </select>
                </div>
              </>
            )}

            {step === 3 && (
              <>
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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Confirmar Senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="flex-1 border-border hover:bg-background/50"
                >
                  Voltar
                </Button>
              )}
              <Button
                type="submit"
                className={`${step === 1 ? "w-full" : "flex-1"} bg-primary hover:bg-primary/90 text-black font-semibold`}
              >
                {step === 3 ? "Cadastrar" : "Próximo"}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
