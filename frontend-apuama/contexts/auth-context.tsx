"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { db, ensureAdminUser } from "@/lib/db"

// Helper
const isOnline = () => typeof window !== "undefined" && window.navigator.onLine;

// Interface definitions
export interface User {
  id: number
  nomeCompleto: string
  email: string
  matricula: string
  posicaoEquipe: string
  isAdmin: boolean
  isAprovado: boolean
}

export interface Car {
  id: string
  nome: string
  modelo: string
  ano: number
  entreEixo: number
  distanciaRodas: number
  createdAt: string
}

export interface BalanceData {
  id: string
  userId: string
  carId: number 
  pesoPiloto?: number 
  pesoRodaDianteiraE: number
  pesoRodaDianteiraD: number
  pesoRodaTraseiraE: number
  pesoRodaTraseiraD: number
  distDianteiraTraseira?: number;
  distEsquerdaDireita?: number;
  distDiagonal?: number;
  pesoTotalCarro?: number;
  createdAt: string
}

export interface Report {
  id: string
  userId: string
  carroId: number
  pilotoNome: string
  tipoSessao: "treino" | "corrida" | "qualificação"
  dataTeste: string
  horaInicio: string
  horaFim: string
  tempoTotal?: string 
  distanciaPercorrida: number 
  pressaoDEAntes: number
  pressaoDDAntes: number
  pressaoTEAntes: number
  pressaoTDAntes: number
  pressaoDEDepois: number
  pressaoDDDepois: number
  pressaoTEDepois: number
  pressaoTDDepois: number
  desgasteDEAntes: number
  desgasteDDAntes: number
  desgasteTEAntes: number
  desgasteTDAntes: number
  desgasteDEDepois: number
  desgasteDDDepois: number
  desgasteTEDepois: number
  desgasteTDDepois: number
  tamanhoMolaDE: number
  tamanhoMolaDD: number
  tamanhoMolaTE: number
  tamanhoMolaTD: number
  balanceFrontPercentage: number
  balanceRearPercentage: number
  balanceLeftPercentage: number
  balanceRightPercentage: number
  errosMecanicos: number
  errosHumanos: number
  observacoesPiloto: string
  checklistData?: Array<{ id: string; category: string; description: string; completed: boolean }>
  createdAt: string
}

export interface CreateReportFrontendDto {
  carroId: number;
  usuarioId: number;
  balanceamentoId?: number;
  pilotoNome?: string;
  tipoSessao?: string;
  dataTeste?: string; 
  horaInicio?: string; 
  horaFim?: string; 
  tempoTotal?: string; 
  distanciaPercorrida?: number;
  errosMecanicos?: number;
  errosHumanos?: number;
  observacoesPiloto?: string;
  balanceFrontPercentage?: number;
  balanceRearPercentage?: number;
  balanceLeftPercentage?: number;
  balanceRightPercentage?: number;
  pressaoDEAntes?: number;
  pressaoDEDepois?: number;
  desgasteDEAntes?: number;
  desgasteDEDepois?: number;
  pressaoDDAntes?: number;
  pressaoDDDepois?: number;
  desgasteDDAntes?: number;
  desgasteDDDepois?: number;
  pressaoTEAntes?: number;
  pressaoTEDepois?: number;
  desgasteTEAntes?: number;
  desgasteTEDepois?: number;
  pressaoTDAntes?: number;
  pressaoTDDepois?: number;
  desgasteTDAntes?: number;
  desgasteTDDepois?: number;
  tamanhoMolaDE?: number;
  tamanhoMolaDD?: number;
  tamanhoMolaTE?: number;
  tamanhoMolaTD?: number;
  checklistItems?: { checklistItemId: string; status: boolean; }[]; 
}

export interface ChecklistItem {
  id: string; 
  area: string;
  descricaoItem: string;
}

interface AuthContextType {
  currentUser: User | null | undefined
  users: User[]
  cars: Car[]
  balanceData: BalanceData[]
  reports: Report[]
  checklistItems: ChecklistItem[]
  setChecklistItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>
  fetchChecklistItems: () => Promise<void>;
  addChecklistItem: (area: string, descricaoItem: string) => Promise<void>;
  removeChecklistItem: (id: string) => Promise<void>;
  createReport: (reportData: CreateReportFrontendDto) => Promise<void>; 
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  signup: (email: string, fullName: string, matricula: string, role: string, password: string) => Promise<boolean>
  approveUser: (userId: number) => void
  rejectUser: (userId: number) => void
  deleteUser: (userId: number) => void
  addCar: (nome: string, modelo: string, ano: number, entreEixo: number, distanciaRodas: number) => void
  removeCar: (carId: string) => void
  addUser: (email: string, fullName: string, matricula: string, role: string, password: string) => void
  saveBalance: (carroId: number, data: any) => Promise<void>
  getCarReports: (carroId: number) => Promise<Report[]>;
  getCarLatestBalance: (carroId: number) => Promise<BalanceData | null>;
  getLatestReport: () => Promise<Report | null>; 
  removeReport: (id: string) => Promise<void>; 
  fetchUsers: () => Promise<void>
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  fetchCars: () => Promise<void>
  setCars: React.Dispatch<React.SetStateAction<Car[]>>
  fetchReports: () => Promise<void>
  setReports: React.Dispatch<React.SetStateAction<Report[]>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(null)
  const [users, setUsers] = useState<User[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [balanceData, setBalanceData] = useState<BalanceData[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      await ensureAdminUser();
      const user = await db.users.where('email').equals(email).first();
      if (user) {
        if ((email === 'teste@apuama.com' && password === 'admin123') || user.isAprovado) {
          const userData = { id: user.id!, nomeCompleto: user.nomeCompleto, email: user.email, matricula: user.matricula, posicaoEquipe: user.posicaoEquipe, isAdmin: user.isAdmin, isAprovado: user.isAprovado };
          setCurrentUser(userData);
          localStorage.setItem("offline_user", JSON.stringify(userData));
          return true;
        }
      }
      return false
    } catch (error) { return false; }
  }, []);

  const signup = useCallback(async (email: string, fullName: string, matricula: string, role: string, password: string): Promise<boolean> => {
    try {
      await db.users.add({ email, nomeCompleto: fullName, matricula, posicaoEquipe: role, isAdmin: role === 'admin', isAprovado: true, synced: true });
      return true;
    } catch (error) { return false; }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem("offline_user")
  }, []);

  const fetchUsers = useCallback(async () => {
    const localUsers = await db.users.toArray();
    setUsers(localUsers as any);
  }, []);

  const fetchCars = useCallback(async () => {
    const localCars = await db.cars.toArray();
    setCars(localCars.map(c => ({ ...c, id: String(c.id) })) as any);
  }, []);

  const fetchChecklistItems = useCallback(async () => {
    const localItems = await db.checklistItems.toArray();
    setChecklistItems(localItems.map(i => ({ ...i, id: String(i.id) })) as any);
  }, []);

  const fetchReports = useCallback(async () => {
    const localReports = await db.reports.toArray();
    setReports(localReports.map(r => ({ ...r, id: String(r.id), dataTeste: r.dataTeste?.toISOString() })) as any);
  }, []);

  const approveUser = useCallback(async (userId: number) => {
    await db.users.update(userId, { isAprovado: true });
    fetchUsers();
  }, [fetchUsers]);

  const rejectUser = useCallback(async (userId: number) => {
    await db.users.delete(userId);
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: number) => {
    await db.users.delete(userId);
    fetchUsers();
  }, [fetchUsers]);

  const addCar = useCallback(async (nome: string, modelo: string, ano: number, entreEixo: number, distanciaRodas: number) => {
    await db.cars.add({ nome, modelo, ano, entreEixo, distanciaRodas, synced: true });
    fetchCars();
  }, [fetchCars]);

  const removeCar = useCallback(async (carId: string) => {
    await db.cars.delete(Number(carId));
    fetchCars();
  }, [fetchCars]);

  const addUser = useCallback(async (email: string, fullName: string, matricula: string, role: string, password: string) => {
    await db.users.add({ email, nomeCompleto: fullName, matricula, posicaoEquipe: role, isAdmin: role === "admin", isAprovado: true, synced: true });
    fetchUsers();
  }, [fetchUsers]);

  const saveBalance = useCallback(async (carroId: number, data: any) => {
    await db.balances.add({ carroId, dataRegistro: new Date(), ...data, synced: true });
  }, []);

  const createReport = useCallback(async (reportData: CreateReportFrontendDto) => {
    await db.reports.add({ ...reportData, dataTeste: reportData.dataTeste ? new Date(reportData.dataTeste) : new Date(), synced: true, errosMecanicos: reportData.errosMecanicos || 0, errosHumanos: reportData.errosHumanos || 0 } as any);
    fetchReports();
  }, [fetchReports]);

  const getCarLatestBalance = useCallback(async (carroId: number): Promise<BalanceData | null> => {
    const localBalance = await db.balances.where('carroId').equals(carroId).reverse().sortBy('dataRegistro');
    if (localBalance.length > 0) {
      const b = localBalance[0];
      return { ...b, id: String(b.id), createdAt: b.dataRegistro.toISOString() } as any;
    }
    return null;
  }, []);

  const getCarReports = useCallback(async (carroId: number): Promise<Report[]> => {
    const localReports = await db.reports.where('carroId').equals(carroId).toArray();
    return localReports.map(r => ({ ...r, id: String(r.id), dataTeste: r.dataTeste?.toISOString() })) as any;
  }, []);

  const removeReport = useCallback(async (id: string) => {
    await db.reports.delete(Number(id));
    fetchReports();
  }, [fetchReports]);

  const addChecklistItem = useCallback(async (area: string, descricaoItem: string) => {
    await db.checklistItems.add({ area, descricaoItem, synced: true });
    fetchChecklistItems();
  }, [fetchChecklistItems]);

  const removeChecklistItem = useCallback(async (id: string) => {
    await db.checklistItems.delete(Number(id));
    fetchChecklistItems();
  }, [fetchChecklistItems]);

  const getLatestReport = useCallback(async (): Promise<Report | null> => {
    const localReports = await db.reports.reverse().sortBy('dataTeste');
    if (localReports.length > 0) {
      const r = localReports[0];
      return { ...r, id: String(r.id), dataTeste: r.dataTeste?.toISOString() } as any;
    }
    return null;
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        ensureAdminUser().catch(() => {});
        const savedUser = localStorage.getItem("offline_user");
        if (savedUser) setCurrentUser(JSON.parse(savedUser));
        else setCurrentUser(null);
      } catch (e) { setCurrentUser(null); }
    };
    init();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchCars();
      fetchChecklistItems();
      fetchReports();
    }
  }, [currentUser, fetchCars, fetchChecklistItems, fetchReports]);

  return (
    <AuthContext.Provider value={{
      currentUser, users, setUsers, cars, setCars, checklistItems, setChecklistItems,
      balanceData, reports, setReports, login, logout, signup, approveUser, rejectUser, deleteUser,
      addCar, removeCar, addUser, saveBalance, createReport, getCarReports, getCarLatestBalance,
      fetchUsers, fetchCars, fetchChecklistItems, fetchReports, getLatestReport, removeReport,
      addChecklistItem, removeChecklistItem,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
