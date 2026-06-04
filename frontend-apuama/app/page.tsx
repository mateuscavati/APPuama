"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Gauge, FileText, BarChart3, LogOut, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { currentUser, logout, getLatestReport, carChecklistOverallStatus, cars } = useAuth()
  const router = useRouter()
  const [lastReportDate, setLastReportDate] = useState<string | null>(null);

  const getFormattedCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    // Only redirect if currentUser is explicitly null (authentication failed or no token)
    if (currentUser === null) {
      router.push("/login")
    }
  }, [currentUser, router])

  useEffect(() => {
    const fetchLatestReportDate = async () => {
      if (currentUser) {
        try {
          const latestReport = await getLatestReport();
          if (latestReport) {
            const date = new Date(latestReport.dataTeste);
            if (!isNaN(date.getTime())) { // Check if date is valid
              const day = String(date.getUTCDate()).padStart(2, '0');
              const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
              const year = date.getUTCFullYear();
              setLastReportDate(`${day}/${month}/${year}`);
            } else {
              setLastReportDate('Data Inválida');
            }
          } else {
            setLastReportDate('Nenhum Report');
          }
        } catch (error) {
          setLastReportDate('Erro ao Carregar');
        }
      }
    };
    fetchLatestReportDate();
  }, [currentUser, getLatestReport]);


  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const modules = [
    {
      title: "Checklist do Carro",
      description: "Verifique todos os componentes e sistemas do veículo",
      icon: CheckCircle2,
      href: "/checklist",
      color: "text-yellow-400",
    },
    {
      title: "Balanceamento & CG",
      description: "Calcule peso das rodas e centro de gravidade",
      icon: Gauge,
      href: "/balance",
      color: "text-yellow-400",
    },
    {
      title: "Reports",
      description: "Registre pressão, temperatura e observações",
      icon: FileText,
      href: "/reports",
      color: "text-yellow-400",
    },
    {
      title: "Dashboard de Testes",
      description: "Visualize dados e performance dos testes",
      icon: BarChart3,
      href: "/dashboard",
      color: "text-yellow-400",
    },
  ]

  // Determine car status display
  let statusText: string;
  let statusColor: string;

  if (carChecklistOverallStatus === 'operational') {
    statusText = 'Operacional';
    statusColor = 'text-green-500';
  } else if (carChecklistOverallStatus === 'pending') {
    statusText = 'Pendente';
    statusColor = 'text-red-500';
  } else {
    // If carChecklistOverallStatus is null (loading or error)
    if (currentUser && cars.length === 0) {
      statusText = 'Sem Carro';
      statusColor = 'text-muted-foreground';
    } else {
      statusText = 'Operacional';
      statusColor = 'text-green-500';
    }
  }

  // If currentUser is undefined, it means authentication state is still loading
  if (currentUser === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Carregando autenticação...</p>
        </div>
      </div>
    )
  }

  // If currentUser is null, it means authentication check is complete and no user is logged in
  if (currentUser === null) {
    return null; // The useEffect will handle the push to /login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">APPuama Racing</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {currentUser.nomeCompleto} <span className="text-primary">({currentUser.posicaoEquipe})</span>
            </div>
            {(currentUser.isAdmin || currentUser.posicaoEquipe === "admin" || currentUser.posicaoEquipe === "lider") && (
              <Link href="/admin">
                <Button size="sm" variant="outline" className="border-primary/50 hover:bg-primary/10 bg-transparent">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="border-red-500/50 hover:bg-red-500/10 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Plataforma de Análise
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Apuama</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistema integrado para checklist, balanceamento, reports e análise de performance do veículo
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Link key={module.href} href={module.href}>
                <Card className="h-full hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20 cursor-pointer bg-card/50 backdrop-blur border-border/50">
                  <CardHeader>
                    <Icon className={`w-8 h-8 mb-2 ${module.color}`} />
                    <CardTitle className="text-foreground">{module.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{module.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Informações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Último Teste</p>
                <p className="text-2xl font-bold text-foreground">{lastReportDate || '--:--'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status do Carro</p>
                <p className={`text-2xl font-bold ${statusColor}`}>{statusText}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso Total</p>
                <p className="text-2xl font-bold text-foreground">219 kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dia de hoje</p>
                <p className="text-2xl font-bold text-foreground">{getFormattedCurrentDate()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
