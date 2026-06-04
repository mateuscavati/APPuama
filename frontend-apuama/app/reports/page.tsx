"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth, CreateReportFrontendDto, Report, BalanceData } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Trash2, Eye } from "lucide-react"

import { useToast } from "@/components/ui/use-toast"

export default function ReportsPage() {
  const { currentUser, cars, fetchCars, createReport, getCarReports, getCarLatestBalance, removeReport } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCarId, setSelectedCarId] = useState<number | string>("") // Car ID from backend is number
  const [carReports, setCarReports] = useState<Report[]>([]) // Now correctly typed
  const [lastBalance, setLastBalance] = useState<BalanceData | null>(null); // State for last balance
  const [showForm, setShowForm] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null) // Correctly typed

  // Define the fields that should be capped at 99
  const cappedFields = [
    "pressaoDEAntes", "pressaoDEDepois", "desgasteDEAntes", "desgasteDEDepois",
    "pressaoDDAntes", "pressaoDDDepois", "desgasteDDAntes", "desgasteDDDepois",
    "pressaoTEAntes", "pressaoTEDepois", "desgasteTEAntes", "desgasteTEDepois",
    "pressaoTDAntes", "pressaoTDDepois", "desgasteTDAntes", "desgasteTDDepois",
    "tamanhoMolaDE", "tamanhoMolaDD", "tamanhoMolaTE", "tamanhoMolaTD",
    "balanceFrontPercentage", "balanceRearPercentage", "balanceLeftPercentage", "balanceRightPercentage",
  ];

  const [formData, setFormData] = useState<CreateReportFrontendDto>({
    carroId: 0, // Will be set from selectedCarId
    usuarioId: 0, // Will be set from currentUser.id
    balanceamentoId: undefined, // Will be set from lastBalance.id
    pilotoNome: "",
    tipoSessao: "treino",
    dataTeste: new Date().toISOString().split("T")[0],
    horaInicio: "",
    horaFim: "",
    tempoTotal: "", // Calculated, string format "HH:MM"
    distanciaPercorrida: undefined,

    // Pneus - Pressão (using backend property names)
    pressaoDEAntes: undefined, pressaoDEDepois: undefined, desgasteDEAntes: undefined, desgasteDEDepois: undefined,
    pressaoDDAntes: undefined, pressaoDDDepois: undefined, desgasteDDAntes: undefined, desgasteDDDepois: undefined,
    pressaoTEAntes: undefined, pressaoTEDepois: undefined, desgasteTEAntes: undefined, desgasteTEDepois: undefined,
    pressaoTDAntes: undefined, pressaoTDDepois: undefined, desgasteTDAntes: undefined, desgasteTDDepois: undefined,

    // Molas (using backend property names)
    tamanhoMolaDE: undefined, tamanhoMolaDD: undefined, tamanhoMolaTE: undefined, tamanhoMolaTD: undefined,

    // Erros (using backend property names)
    errosMecanicos: undefined, errosHumanos: undefined,
    observacoesPiloto: "",
    // Balanceamento
    balanceFrontPercentage: undefined,
    balanceRearPercentage: undefined,
    balanceLeftPercentage: undefined,
    balanceRightPercentage: undefined,
    
  })

  // Initial data fetching when component mounts
  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
      return
    }
    fetchCars();
  }, [currentUser, router, fetchCars])

  // Set initial selected car and fetch last balance when cars are loaded
  useEffect(() => {
    if (cars.length > 0 && !selectedCarId) {
      setSelectedCarId(cars[0].id)
    }
  }, [cars, selectedCarId])

  // Fetch last balance and reports when selectedCarId changes
  useEffect(() => {
    if (selectedCarId) {
      const fetchLastBalanceAndReports = async () => {
        try {
          const balance = await getCarLatestBalance(Number(selectedCarId));
          setLastBalance(balance);

          const reports = await getCarReports(Number(selectedCarId));
          setCarReports(reports);
        } catch (error) {
          // console.error("Failed to fetch data for selected car:", error);
          setLastBalance(null);
          setCarReports([]);
        }
      }
      fetchLastBalanceAndReports();
    } else {
      setLastBalance(null);
      setCarReports([]);
    }
  }, [selectedCarId, getCarLatestBalance, getCarReports])


  // Set formData.carroId when showForm changes or selectedCarId changes
  useEffect(() => {
    if (showForm && selectedCarId) {
      setFormData(prev => ({
        ...prev,
        carroId: Number(selectedCarId),
      }));
    }
  }, [showForm, selectedCarId]);



  const handleInputChange = (field: string, value: any) => {
    let processedValue = value;

    // Handle number conversion for numerical fields, and cap if in cappedFields
    if (field === 'dataTeste') {
      processedValue = value; // Keep dataTeste as a string
    } else if (['horaInicio', 'horaFim'].includes(field)) {
      processedValue = value; // Keep time fields as strings
    } else if (typeof value === 'string' && value !== '') {
      const numValue = Number.parseFloat(value);
      if (!isNaN(numValue)) {
        processedValue = numValue;
        if (cappedFields.includes(field)) {
          processedValue = Math.min(processedValue, 99);
        }
      } else {
        // If it's a string but not a valid number, keep as is (e.g., for text fields)
        processedValue = value;
      }
    } else if (typeof value === 'number') {
      if (cappedFields.includes(field)) {
        processedValue = Math.min(value, 99);
      }
    } else if (value === '') {
      processedValue = undefined; // Treat empty string as undefined for number fields
    }
    
    console.log(`handleInputChange - field: ${field}, raw value: ${value}, converted value: ${processedValue}`);
    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));
  };

  const calculateTestDuration = () => {
    if (!formData.horaInicio || !formData.horaFim) return ""
    const [startHour, startMin] = formData.horaInicio.split(":").map(Number)
    const [endHour, endMin] = formData.horaFim.split(":").map(Number)
    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    
    if (durationMinutes < 0) return "Inválido";

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  const addReport = async () => { // Make it async
    if (!selectedCarId || !currentUser || !formData.pilotoNome.trim() || !formData.horaInicio || !formData.horaFim) {
      toast({
        title: "Erro de Validação",
        description: "Preencha todos os campos obrigatórios: Carro, Piloto, Hora Início e Hora Fim.",
        variant: "destructive",
      })
      return;
    }

    try {

      const dataTeste = formData.dataTeste;
      const horaInicio = dataTeste && formData.horaInicio ? `${dataTeste}T${formData.horaInicio}:00.000Z` : undefined;
      const horaFim = dataTeste && formData.horaFim ? `${dataTeste}T${formData.horaFim}:00.000Z` : undefined;

      await createReport({
        ...formData,
        carroId: Number(selectedCarId),
        usuarioId: currentUser.id,
        balanceamentoId: lastBalance?.id,
        horaInicio: horaInicio,
        horaFim: horaFim,
        tempoTotal: calculateTestDuration(),
      });

      toast({
        title: "Sucesso",
        description: "Report salvo com sucesso!",
      })
      setShowForm(false);
      resetForm();
      // Refresh reports list after successful creation
      if (selectedCarId) {
        const reports = await getCarReports(Number(selectedCarId));
        setCarReports(reports);
      }

    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: `Erro ao salvar report: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      carroId: 0,
      usuarioId: 0,
      balanceamentoId: undefined,
      pilotoNome: "",
      tipoSessao: "treino",
      dataTeste: new Date().toISOString().split("T")[0],
      horaInicio: "",
      horaFim: "",
      tempoTotal: "",
      distanciaPercorrida: undefined,

      pressaoDEAntes: undefined, pressaoDEDepois: undefined, desgasteDEAntes: undefined, desgasteDEDepois: undefined,
      pressaoDDAntes: undefined, pressaoDDDepois: undefined, desgasteDDAntes: undefined, desgasteDDDepois: undefined,
      pressaoTEAntes: undefined, pressaoTEDepois: undefined, desgasteTEAntes: undefined, desgasteTEDepois: undefined,
      pressaoTDAntes: undefined, pressaoTDDepois: undefined, desgasteTDAntes: undefined, desgasteTDDepois: undefined,
      tamanhoMolaDE: undefined, tamanhoMolaDD: undefined, tamanhoMolaTE: undefined, tamanhoMolaTD: undefined,

      errosMecanicos: undefined, errosHumanos: undefined,
      observacoesPiloto: "",
      // Balanceamento
      balanceFrontPercentage: undefined,
      balanceRearPercentage: undefined,
      balanceLeftPercentage: undefined,
      balanceRightPercentage: undefined,
    })
    
  }

  const deleteReport = async (id: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o report ${id}?`)) {
      try {
        await removeReport(id);
        toast({
          title: "Sucesso",
          description: `Report ${id} excluído com sucesso!`,
        })
        setCarReports(carReports.filter(report => report.id !== id));
      } catch (error) {
        toast({
          title: "Erro ao Excluir",
          description: `Erro ao excluir report: ${error.message || 'Erro desconhecido'}`,
          variant: "destructive",
        })
      }
    }
  }


  const downloadReport = (report: Report) => {
    const reportContent = `
      Relatório do Teste - ${new Date(report.dataTeste).toLocaleDateString()}
      ==================================================

      Informações Gerais
      --------------------------------------------------
      Piloto: ${report.pilotoNome}
      Sessão: ${report.tipoSessao}
      Data: ${new Date(report.dataTeste).toLocaleDateString()}
      Horário: ${new Date(report.horaInicio).toLocaleTimeString()} - ${new Date(report.horaFim).toLocaleTimeString()}
      Distância Percorrida: ${report.distanciaPercorrida} km

      Pressão dos Pneus (PSI)
      --------------------------------------------------
      Dianteiro Esquerdo: Antes: ${report.pressaoDEAntes}, Depois: ${report.pressaoDEDepois}
      Dianteiro Direito: Antes: ${report.pressaoDDAntes}, Depois: ${report.pressaoDDDepois}
      Traseiro Esquerdo: Antes: ${report.pressaoTEAntes}, Depois: ${report.pressaoTEDepois}
      Traseiro Direito: Antes: ${report.pressaoTDAntes}, Depois: ${report.pressaoTDDepois}

      Desgaste dos Pneus (mm)
      --------------------------------------------------
      Dianteiro Esquerdo: Antes: ${report.desgasteDEAntes}, Depois: ${report.desgasteDEDepois}
      Dianteiro Direito: Antes: ${report.desgasteDDAntes}, Depois: ${report.desgasteDDDepois}
      Traseiro Esquerdo: Antes: ${report.desgasteTEAntes}, Depois: ${report.desgasteTEDepois}
      Traseiro Direito: Antes: ${report.desgasteTDAntes}, Depois: ${report.desgasteTDDepois}

      Tamanho das Molas (mm)
      --------------------------------------------------
      Dianteira Esquerda: ${report.tamanhoMolaDE}
      Dianteira Direita: ${report.tamanhoMolaDD}
      Traseira Esquerda: ${report.tamanhoMolaTE}
      Traseira Direita: ${report.tamanhoMolaTD}

      Balanceamento (%)
      --------------------------------------------------
      Dianteira: ${report.balanceFrontPercentage}
      Traseira: ${report.balanceRearPercentage}
      Esquerda: ${report.balanceLeftPercentage}
      Direita: ${report.balanceRightPercentage}

      Erros
      --------------------------------------------------
      Mecânicos: ${report.errosMecanicos}
      Humanos: ${report.errosHumanos}

      Observações do Piloto
      --------------------------------------------------
      ${report.observacoesPiloto}

    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.pilotoNome}-${new Date(report.dataTeste).toLocaleDateString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-black">
            <Plus className="w-4 h-4 mr-2" />
            Novo Report
          </Button>
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
                    {car.nome} ({car.modelo} - {car.ano})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8 bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Criar Novo Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Básico */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Nome do Piloto *</label>
                  <input
                    type="text"
                    placeholder="Digite o nome"
                    value={formData.pilotoNome}
                    onChange={(e) => handleInputChange("pilotoNome", e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Tipo de Sessão</label>
                  <select
                    value={formData.tipoSessao}
                    onChange={(e) => handleInputChange("tipoSessao", e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="treino">Treino</option>
                    <option value="corrida">Corrida</option>
                    <option value="qualificação">Qualificação</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Data do Teste</label>
                  <input
                    type="date"
                    value={formData.dataTeste}
                    onChange={(e) => handleInputChange("dataTeste", e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Horários e Distância */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-background/30 rounded-lg border border-border">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Hora Início *</label>
                  <input
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => handleInputChange("horaInicio", e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Hora Fim *</label>
                  <input
                    type="time"
                    value={formData.horaFim}
                    onChange={(e) => handleInputChange("horaFim", e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Tempo Total</label>
                  <input
                    type="text"
                    disabled
                    value={calculateTestDuration()}
                    className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">horas</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Distância Total (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distanciaPercorrida}
                    onChange={(e) => handleInputChange("distanciaPercorrida", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Pneus - Pressão */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Pressão dos Pneus (PSI)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">D. Esq Antes</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.pressaoDEAntes}
                      onChange={(e) =>
                        handleInputChange("pressaoDEAntes", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">D. Esq Depois</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.pressaoDEDepois}
                      onChange={(e) =>
                        handleInputChange("pressaoDEDepois", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">D. Dir Antes</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.pressaoDDAntes}
                      onChange={(e) =>
                        handleInputChange("pressaoDDAntes", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">D. Dir Depois</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.pressaoDDDepois}
                      onChange={(e) =>
                        handleInputChange("pressaoDDDepois", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">T. Esq Antes</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.pressaoTEAntes}
                      onChange={(e) =>
                        handleInputChange("pressaoTEAntes", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">T. Esq Depois</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.pressaoTEDepois}
                      onChange={(e) =>
                        handleInputChange("pressaoTEDepois", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">T. Dir Antes</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.pressaoTDAntes}
                      onChange={(e) =>
                        handleInputChange("pressaoTDAntes", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">T. Dir Depois</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.pressaoTDDepois}
                      onChange={(e) =>
                        handleInputChange("pressaoTDDepois", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Pneus - Desgaste */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Desgaste de Pneus (mm)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">D. Esq Antes</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.desgasteDEAntes}
                      onChange={(e) =>
                        handleInputChange("desgasteDEAntes", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">D. Esq Depois</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.desgasteDEDepois}
                      onChange={(e) =>
                        handleInputChange("desgasteDEDepois", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">D. Dir Antes</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.desgasteDDAntes}
                      onChange={(e) =>
                        handleInputChange("desgasteDDAntes", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">D. Dir Depois</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.desgasteDDDepois}
                      onChange={(e) =>
                        handleInputChange("desgasteDDDepois", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">T. Esq Antes</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.desgasteTEAntes}
                      onChange={(e) =>
                        handleInputChange("desgasteTEAntes", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">T. Esq Depois</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.desgasteTEDepois}
                      onChange={(e) =>
                        handleInputChange("desgasteTEDepois", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">T. Dir Antes</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.desgasteTDAntes}
                      onChange={(e) =>
                        handleInputChange("desgasteTDAntes", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">T. Dir Depois</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.desgasteTDDepois}
                      onChange={(e) =>
                        handleInputChange("desgasteTDDepois", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Molas */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Tamanho das Molas (mm)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Mola D. Esq</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.tamanhoMolaDE}
                      onChange={(e) => handleInputChange("tamanhoMolaDE", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))}
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Mola D. Dir</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.tamanhoMolaDD}
                      onChange={(e) => handleInputChange("tamanhoMolaDD", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))}
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Mola T. Esq</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.tamanhoMolaTE}
                      onChange={(e) => handleInputChange("tamanhoMolaTE", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))}
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Mola T. Dir</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.tamanhoMolaTD}
                      onChange={(e) => handleInputChange("tamanhoMolaTD", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))}
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Balanceamento */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Distribuição de Balanceamento (%)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Dianteira %</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.balanceFrontPercentage}
                      onChange={(e) =>
                        handleInputChange("balanceFrontPercentage", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Traseira %</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.balanceRearPercentage}
                      onChange={(e) =>
                        handleInputChange("balanceRearPercentage", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Esquerda %</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.balanceLeftPercentage}
                      onChange={(e) =>
                        handleInputChange("balanceLeftPercentage", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Direita %</label>
                    <input
                      type="number"
                      step="0.1"
                      max="99"
                      value={formData.balanceRightPercentage}
                      onChange={(e) =>
                        handleInputChange("balanceRightPercentage", e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 bg-background border border-border text-foreground rounded text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Erros */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Erros Mecânicos</label>
                  <input
                    type="number"
                    value={formData.errosMecanicos}
                    onChange={(e) => handleInputChange("errosMecanicos", e.target.value === "" ? undefined : Number.parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Erros Humanos</label>
                  <input
                    type="number"
                    value={formData.errosHumanos}
                    onChange={(e) => handleInputChange("errosHumanos", e.target.value === "" ? undefined : Number.parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Observações do Piloto</label>
                <textarea
                  placeholder="Descreva como foi o teste, comportamento do carro, melhorias necessárias..."
                  value={formData.observacoesPiloto}
                  onChange={(e) => handleInputChange("observacoesPiloto", e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg resize-none h-20 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={addReport} className="bg-primary hover:bg-primary/90 text-black">
                  Salvar Report
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reports List */}
        <div className="space-y-4">
          {carReports.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="pt-6 text-center text-muted-foreground">
                Nenhum report para este carro
              </CardContent>
            </Card>
          ) : (
            carReports.map((report) => (
              <Card key={report.id} className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{report.pilotoNome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {report.tipoSessao} - {new Date(report.dataTeste).toISOString().split('T')[0]}
                      </p>
                      <div className="mt-2 flex gap-4 flex-wrap text-xs">
                        <div>
                          <span className="text-muted-foreground">Tempo:</span>{" "}
                          <span className="text-primary ml-1">
                            {report.horaInicio} - {report.horaFim}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Distância:</span>{" "}
                          <span className="text-primary ml-1">{report.distanciaPercorrida || 0} km</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Erros:</span>{" "}
                          <span className="text-accent ml-1">
                            {report.errosMecanicos}M / {report.errosHumanos}H
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => downloadReport(report)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteReport(report.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
