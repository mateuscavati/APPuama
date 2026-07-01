"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth, Report, BalanceData } from "@/contexts/auth-context" // Import Report and BalanceData
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const getReportDurationHours = (r: Report): number => {
  if (r.tempoTotal) {
    const parts = r.tempoTotal.split(":");
    if (parts.length === 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (!isNaN(hours) && !isNaN(minutes)) {
        return hours + minutes / 60;
      }
    }
  }
  
  if (r.horaInicio && r.horaFim) {
    try {
      const start = new Date(r.horaInicio);
      const end = new Date(r.horaFim);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffMs = end.getTime() - start.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours >= 0 ? diffHours : 0;
      }
    } catch (e) {
      // ignore
    }
  }
  return 0;
};

export default function DashboardPage() {
  const { cars, fetchCars, getCarReports, getCarLatestBalance } = useAuth()
  const [selectedCarId, setSelectedCarId] = useState("")
  const [carReports, setCarReports] = useState<Report[]>([])
  const [carBalance, setCarBalance] = useState<BalanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCars()
      .then(() => setLoading(false))
      .catch((err) => {
        setError("Failed to fetch cars.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (cars.length > 0 && !selectedCarId) {
      setSelectedCarId(cars[0].id)
    }
  }, [cars, selectedCarId])

  useEffect(() => {
    const loadCarSpecificData = async () => {
      if (selectedCarId) {
        setLoading(true);
        setError(null);
        try {
          const reportsData = await getCarReports(Number(selectedCarId));
          setCarReports(reportsData);
          const balanceData = await getCarLatestBalance(Number(selectedCarId));
          setCarBalance(balanceData);
        } catch (err) {
          setError("Failed to fetch car data.");
          // console.error(err); // Keep commented for now, will remove all logs in a later step
        } finally {
          setLoading(false);
        }
      } else {
        setCarReports([]);
        setCarBalance(null);
        setLoading(false);
      }
    };

    loadCarSpecificData();
  }, [selectedCarId]);

  const lastReport = carReports.length > 0 ? carReports[carReports.length - 1] : null;
  const lastTestDate = (() => {
    if (lastReport?.dataTeste) {
      const date = new Date(lastReport.dataTeste);
      if (!isNaN(date.getTime())) { // Check if date is valid
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
      } else {
        return 'Data Inválida';
      }
    }
    return "N/A";
  })();
  const totalReports = carReports.length
  const totalDistance = carReports.reduce((sum, r) => sum + (r.distanciaPercorrida || 0), 0)
  const totalTestTime = carReports.reduce((sum, r) => sum + getReportDurationHours(r), 0);
  
  const last5Reports = carReports.slice(-5)

  const errorsData = last5Reports.map((r, i) => ({
    date: `Report ${i + 1}`,
    mecanicos: r.errosMecanicos || 0,
    humanos: r.errosHumanos || 0,
  }))

  const performanceData = last5Reports.map((r, i) => ({
    date: `Report ${i + 1}`,
    kmPercorridos: r.distanciaPercorrida || 0,
    tempoTeste: getReportDurationHours(r),
  }))

  const tireWearData = lastReport
    ? [
        { name: "D.Esq", valor: lastReport.desgasteDEDepois || 0 },
        { name: "D.Dir", valor: lastReport.desgasteDDDepois || 0 },
        { name: "T.Esq", valor: lastReport.desgasteTEDepois || 0 },
        { name: "T.Dir", valor: lastReport.desgasteTDDepois || 0 },
      ]
    : []

  if (!cars.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Dashboard de Testes</h1>
            <div />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhum carro disponível. Adicione carros no dashboard de admin.
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Dashboard de Testes</h1>
          <div />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <label className="text-sm text-muted-foreground block mb-3">Selecionar Carro para Análise</label>
              <select
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(e.target.value)}
                className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Escolha um carro</option>
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {(car.nome || '')} ({(car.modelo || '')} - {(car.ano || '')})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Último Teste</p>
                <p className="text-3xl font-bold text-primary">{lastTestDate}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {carReports.length > 0 ? "Report mais recente" : "Sem reports"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Testes Realizados</p>
                <p className="text-3xl font-bold text-cyan-400">{totalReports}</p>
                <p className="text-xs text-muted-foreground mt-1">Reports salvos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Distância Total</p>
                <p className="text-3xl font-bold text-purple-400">{totalDistance.toFixed(1)} km</p>
                <p className="text-xs text-muted-foreground mt-1">Em todos os testes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Total em Testes</p>
                <p className="text-3xl font-bold text-green-400">{totalTestTime.toFixed(1)} h</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Operacional
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Erros - Últimos 5 Reports</CardTitle>
              <CardDescription>Erros mecânicos e humanos</CardDescription>
            </CardHeader>
            <CardContent>
              {errorsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={errorsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--color-muted-foreground))" />
                    <YAxis stroke="hsl(var(--color-muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--color-card))",
                        border: "1px solid hsl(var(--color-border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="mecanicos"
                      stroke="hsl(264 100% 50%)"
                      name="Erros Mecânicos"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="humanos"
                      stroke="hsl(25 100% 50%)"
                      name="Erros Humanos"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">Sem dados disponíveis</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Performance - Últimos 5 Reports</CardTitle>
              <CardDescription>KM percorridos e tempo de teste</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--color-muted-foreground))" />
                    <YAxis yAxisId="left" stroke="hsl(var(--color-muted-foreground))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--color-muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--color-card))",
                        border: "1px solid hsl(var(--color-border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(150 100% 50%)" }}
                      itemStyle={{ color: "hsl(150 100% 50%)" }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="kmPercorridos"
                      stroke="hsl(150 100% 50%)"
                      name="KM Percorridos"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="tempoTeste"
                      stroke="hsl(190 100% 50%)"
                      name="Tempo Teste (h)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">Sem dados disponíveis</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tire Wear and Balance */}
        {lastReport && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Desgaste de Pneus (Último Report)</CardTitle>
                <CardDescription>Valores em mm após teste</CardDescription>
              </CardHeader>
              <CardContent>
                {tireWearData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tireWearData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--color-muted-foreground))" />
                      <YAxis stroke="hsl(var(--color-muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--color-card))",
                          border: "1px solid hsl(var(--color-border))",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "hsl(150 100% 50%)" }}
                        itemStyle={{ color: "hsl(150 100% 50%)" }}
                      />
                      <Bar dataKey="valor" fill="hsl(150 10% 50%)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">Sem dados disponíveis</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Distribuição de Balanceamento</CardTitle>
                <CardDescription>Último report registrado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Dianteira/Traseira</span>
                      <span className="text-sm font-bold text-primary">
                        {lastReport.balanceFrontPercentage?.toFixed(1)}% /{" "}
                        {lastReport.balanceRearPercentage?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-primary h-full"
                        style={{ width: `${lastReport.balanceFrontPercentage || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Esquerda/Direita</span>
                      <span className="text-sm font-bold text-cyan-400">
                        {lastReport.balanceLeftPercentage?.toFixed(1)}% /{" "}
                        {lastReport.balanceRightPercentage?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full"
                        style={{ width: `${lastReport.balanceLeftPercentage || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
