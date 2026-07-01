"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Trash2 } from "lucide-react"
import { db } from "@/lib/db"

interface WheelWeights {
  frontLeft: number
  frontRight: number
  rearLeft: number
  rearRight: number
}

export default function BalancePage() {
  const { cars, saveBalance, currentUser, fetchCars } = useAuth()
  const [selectedCarId, setSelectedCarId] = useState<number | string>("") // Change to number
  const [driverWeight, setDriverWeight] = useState(0)
  const [weights, setWeights] = useState<WheelWeights>({
    frontLeft: 0,
    frontRight: 0,
    rearLeft: 0,
    rearRight: 0,
  })
  const [balancesHistory, setBalancesHistory] = useState<any[]>([])

  useEffect(() => {
    fetchCars(); // Fetch cars when component mounts
  }, [fetchCars])

  useEffect(() => {
    if (cars.length > 0 && !selectedCarId) {
      setSelectedCarId(cars[0].id)
    }
  }, [cars, selectedCarId])

  // Cálculos
  const totalWheelWeight = weights.frontLeft + weights.frontRight + weights.rearLeft + weights.rearRight
  const carOnlyWeight = Math.max(0, totalWheelWeight - driverWeight)
  const totalCarWeight = carOnlyWeight + driverWeight 

  const frontWeight = weights.frontLeft + weights.frontRight
  const rearWeight = weights.rearLeft + weights.rearRight
  const leftWeight = weights.frontLeft + weights.rearLeft
  const rightWeight = weights.frontRight + weights.rearRight

  const diagonalFrontLeftRearRight = weights.frontLeft + weights.rearRight
  const diagonalFrontRightRearLeft = weights.frontRight + weights.rearLeft

  const frontPercentage = totalWheelWeight > 0 ? (frontWeight / totalWheelWeight) * 100 : 0
  const rearPercentage = totalWheelWeight > 0 ? (rearWeight / totalWheelWeight) * 100 : 0
  const leftPercentage = totalWheelWeight > 0 ? (leftWeight / totalWheelWeight) * 100 : 0
  const rightPercentage = totalWheelWeight > 0 ? (rightWeight / totalWheelWeight) * 100 : 0

  // CG Position em %
  const cgLongitudinal = (totalWheelWeight > 0 ? (frontWeight / totalWheelWeight) * 100 : 50)
  const cgLateral = totalWheelWeight > 0 ? (rightWeight / totalWheelWeight) * 100 : 50

  const handleWeightChange = (wheel: keyof WheelWeights, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [wheel]: value,
    }))
  }

  const reset = () => {
    setWeights({
      frontLeft: 0,
      frontRight: 0,
      rearLeft: 0,
      rearRight: 0,
    })
    setDriverWeight(0)
  }

  const fetchBalancesHistory = async () => {
    if (selectedCarId) {
      try {
        const history = await db.balances
          .where('carroId')
          .equals(Number(selectedCarId))
          .reverse()
          .sortBy('dataRegistro');
        setBalancesHistory(history);
      } catch (error) {
        console.error("Erro ao buscar histórico de balanceamento:", error);
      }
    } else {
      setBalancesHistory([]);
    }
  };

  const handleDeleteBalance = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este registro de balanceamento?")) {
      try {
        await db.balances.delete(id);
        fetchBalancesHistory();
      } catch (error) {
        alert("Erro ao excluir registro de balanceamento.");
      }
    }
  };

  const handleSaveBalance = async () => { // Make it async
    if (!selectedCarId || !currentUser) {
      alert("Por favor, selecione um carro e faça login."); // More user-friendly message
      return;
    }

    try {
      await saveBalance(Number(selectedCarId), { // Convert selectedCarId to number
        pesoPiloto: driverWeight,
        pesoRodaDianteiraE: weights.frontLeft,
        pesoRodaDianteiraD: weights.frontRight,
        pesoRodaTraseiraE: weights.rearLeft,
        pesoRodaTraseiraD: weights.rearRight,
        distDianteiraTraseira: frontPercentage, // Pass calculated value
        distEsquerdaDireita: leftPercentage, // Pass calculated value
        distDiagonal: diagonalFrontLeftRearRight, // This is one diagonal value. Backend DTO has only one `distDiagonal`. For now, I'll use diagonalFrontLeftRearRight.
        pesoTotalCarro: totalCarWeight, // Pass calculated value
      });
      alert("Balanceamento salvo com sucesso!");
      fetchBalancesHistory();
    } catch (error) {
      alert(`Erro ao salvar balanceamento: ${(error as any).message || 'Erro desconhecido'}`);
    }
  };

  useEffect(() => {
    fetchBalancesHistory();
  }, [selectedCarId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Balanceamento & CM</h1>
          <div />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <label className="text-sm text-muted-foreground block mb-3">Selecionar Carro</label>
              <select
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(e.target.value)}
                className="w-full px-4 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Escolha um carro</option>
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.nome} ({car.modelo} - {car.ano})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Entrada de Pesos */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Entrada de Pesos</CardTitle>
                <CardDescription>Insira o peso de cada roda em kg</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Peso do Piloto (kg)</label>
                  <input
                    type="number"
                    value={driverWeight}
                    onChange={(e) => setDriverWeight(Number.parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Front Left */}
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Dianteira Esquerda (kg)</label>
                      <input
                        type="number"
                        value={weights.frontLeft}
                        onChange={(e) => handleWeightChange("frontLeft", Number.parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Front Right */}
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Dianteira Direita (kg)</label>
                      <input
                        type="number"
                        value={weights.frontRight}
                        onChange={(e) => handleWeightChange("frontRight", Number.parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Rear Left */}
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Traseira Esquerda (kg)</label>
                      <input
                        type="number"
                        value={weights.rearLeft}
                        onChange={(e) => handleWeightChange("rearLeft", Number.parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Rear Right */}
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">Traseira Direita (kg)</label>
                      <input
                        type="number"
                        value={weights.rearRight}
                        onChange={(e) => handleWeightChange("rearRight", Number.parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={reset} variant="outline" className="flex-1 bg-transparent">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                  <Button onClick={handleSaveBalance} className="flex-1 bg-primary hover:bg-primary/90 text-black">
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visualizações */}
          <div className="lg:col-span-2 space-y-6">
            {/* CG Visualization */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Centro de Massa (CM)</CardTitle>
                <CardDescription>Visualização top-view do veículo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-80 bg-background/50 rounded-lg border border-border/50 flex items-center justify-center">
                  {/* Car representation */}
                  <svg className="w-full h-full" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet">
                    {/* Car outline */}
                    <rect
                      x="50"
                      y="30"
                      width="100"
                      height="240"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted-foreground"
                    />

                    {/* Wheels */}
                    <circle
                      cx="70"
                      cy="50"
                      r="8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted"
                    />
                    <circle
                      cx="130"
                      cy="50"
                      r="8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted"
                    />
                    <circle
                      cx="70"
                      cy="250"
                      r="8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted"
                    />
                    <circle
                      cx="130"
                      cy="250"
                      r="8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted"
                    />

                    {/* Weight indicators on wheels */}
                    <text x="70" y="45" textAnchor="middle" className="text-xs fill-blue-400 font-bold">
                      {weights.frontLeft.toFixed(0)}
                    </text>
                    <text x="130" y="45" textAnchor="middle" className="text-xs fill-cyan-400 font-bold">
                      {weights.frontRight.toFixed(0)}
                    </text>
                    <text x="70" y="265" textAnchor="middle" className="text-xs fill-purple-400 font-bold">
                      {weights.rearLeft.toFixed(0)}
                    </text>
                    <text x="130" y="265" textAnchor="middle" className="text-xs fill-green-400 font-bold">
                      {weights.rearRight.toFixed(0)}
                    </text>

                    {/* CG Position */}
                    <circle
                      cx={50 + (cgLateral / 100) * 100}
                      cy={30 + ((100 - cgLongitudinal) / 100) * 240}
                      r="6"
                      fill="currentColor"
                      className="text-red-500"
                    />
                    <text
                      x={50 + (cgLateral / 100) * 100}
                      y={30 + ((100 - cgLongitudinal) / 100) * 240 - 12}
                      textAnchor="middle"
                      className="text-xs fill-red-500 font-bold"
                    >
                      CM
                    </text>
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Front/Rear Distribution */}
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Distribuição Dianteira/Traseira</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Dianteira</span>
                      <span className="text-sm font-bold text-primary">{frontPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${frontPercentage}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{frontWeight.toFixed(1)} kg</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Traseira</span>
                      <span className="text-sm font-bold text-accent">{rearPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div className="bg-accent h-full" style={{ width: `${rearPercentage}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rearWeight.toFixed(1)} kg</p>
                  </div>
                </CardContent>
              </Card>

              {/* Left/Right Distribution */}
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Distribuição Esquerda/Direita</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Esquerda</span>
                      <span className="text-sm font-bold text-blue-400">{leftPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${leftPercentage}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{leftWeight.toFixed(1)} kg</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Direita</span>
                      <span className="text-sm font-bold text-cyan-400">{rightPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div className="bg-cyan-500 h-full" style={{ width: `${rightPercentage}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rightWeight.toFixed(1)} kg</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Distribuição Diagonal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Front-Left + Rear-Right</span>
                      <span className="text-sm font-bold text-purple-400">
                        {diagonalFrontLeftRearRight.toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Front-Right + Rear-Left</span>
                      <span className="text-sm font-bold text-orange-400">
                        {diagonalFrontRightRearLeft.toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Diferença:</p>
                    <p className="text-sm font-bold text-foreground">
                      {Math.abs(diagonalFrontLeftRearRight - diagonalFrontRightRearLeft).toFixed(1)} kg
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Peso Total do Carro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Peso Rodas</span>
                    <span className="text-sm font-semibold text-foreground">{carOnlyWeight.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Peso Piloto</span>
                    <span className="text-sm font-semibold text-foreground">{driverWeight.toFixed(1)} kg</span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between">
                    <span className="text-sm font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold text-primary">{totalCarWeight.toFixed(1)} kg</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Histórico de Balanceamento */}
        <div className="mt-12">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Histórico de Balanceamento</CardTitle>
              <CardDescription>Visualização dos registros de balanceamento anteriores para este carro</CardDescription>
            </CardHeader>
            <CardContent>
              {balancesHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum histórico encontrado para este carro.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-foreground">
                    <thead className="border-b border-border text-xs uppercase text-muted-foreground bg-muted/30">
                      <tr>
                        <th className="p-3">Data</th>
                        <th className="p-3">Piloto</th>
                        <th className="p-3">DE / DD (kg)</th>
                        <th className="p-3">TE / TD (kg)</th>
                        <th className="p-3">Carro Vazio</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Dianteira %</th>
                        <th className="p-3">Esquerda %</th>
                        <th className="p-3">Diagonal %</th>
                        <th className="p-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {balancesHistory.map((b) => {
                        const dateStr = b.dataRegistro ? new Date(b.dataRegistro).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "N/A";
                        
                        const de = b.pesoRodaDianteiraE || 0;
                        const dd = b.pesoRodaDianteiraD || 0;
                        const te = b.pesoRodaTraseiraE || 0;
                        const td = b.pesoRodaTraseiraD || 0;
                        const total = b.pesoTotalCarro || (de + dd + te + td);
                        const pilot = b.pesoPiloto || 0;
                        const carWeight = Math.max(0, total - pilot);
                        
                        const frontPct = total > 0 ? ((de + dd) / total) * 100 : 0;
                        const leftPct = total > 0 ? ((de + te) / total) * 100 : 0;
                        const diagPct = total > 0 ? ((de + td) / total) * 100 : 0;
                        
                        return (
                          <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                            <td className="p-3 font-medium whitespace-nowrap">{dateStr}</td>
                            <td className="p-3 whitespace-nowrap">{b.pesoPiloto ? `${pilot.toFixed(1)} kg` : "Sem piloto"}</td>
                            <td className="p-3 whitespace-nowrap">{de.toFixed(0)} / {dd.toFixed(0)}</td>
                            <td className="p-3 whitespace-nowrap">{te.toFixed(0)} / {td.toFixed(0)}</td>
                            <td className="p-3 font-semibold text-primary whitespace-nowrap">{carWeight.toFixed(1)} kg</td>
                            <td className="p-3 font-semibold whitespace-nowrap">{total.toFixed(1)} kg</td>
                            <td className="p-3 whitespace-nowrap">{frontPct.toFixed(1)}%</td>
                            <td className="p-3 whitespace-nowrap">{leftPct.toFixed(1)}%</td>
                            <td className="p-3 whitespace-nowrap">{diagPct.toFixed(1)}%</td>
                            <td className="p-3 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-500/10 p-2 h-auto"
                                onClick={() => handleDeleteBalance(b.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
