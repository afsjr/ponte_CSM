'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getTurmas, getQuadroHorarioTurma, getProfessoresTurma, getDisciplinas, getTodosProfessores } from '@/actions/pedagogico'
import { getEstudantesTurma, getPeriodosAvaliativos } from '@/actions/diario'
import { getAnosLetivos } from '@/actions/secretaria'

type ToastType = { message: string; type: 'success' | 'error' } | null;

interface DiarioContextType {
  // Base Data
  turmas: any[];
  allDisciplinas: any[];
  allProfessores: any[];
  anosLetivos: any[];
  periodos: any[];
  
  // Loading States
  loading: boolean;
  loadingContext: boolean;
  
  // Selections
  selectedTurma: string;
  setSelectedTurma: (val: string) => void;
  selectedDisciplina: string;
  setSelectedDisciplina: (val: string) => void;
  selectedDocente: string;
  setSelectedDocente: (val: string) => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  selectedPeriodo: string;
  setSelectedPeriodo: (val: string) => void;
  
  // Turma Context Data
  professoresAlocados: any[];
  quadroHorario: any[];
  estudantes: any[];
  
  // View Control
  activeView: 'frequencia' | 'notas';
  setActiveView: (val: 'frequencia' | 'notas') => void;
  
  // Utility
  toast: ToastType;
  showToast: (message: string, type?: 'success' | 'error') => void;
  handleDisciplinaChange: (discId: string) => void;
  disciplinaAtiva: any;
  matchingSchedule: any;
  aulasSugeridas: number | null;
}

const DiarioContext = createContext<DiarioContextType | undefined>(undefined);

export function DiarioProvider({ children }: { children: React.ReactNode }) {
  // Base Data
  const [turmas, setTurmas] = useState<any[]>([])
  const [allDisciplinas, setAllDisciplinas] = useState<any[]>([])
  const [allProfessores, setAllProfessores] = useState<any[]>([])
  const [anosLetivos, setAnosLetivos] = useState<any[]>([])
  const [periodos, setPeriodos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Selections
  const [selectedTurma, setSelectedTurma] = useState('')
  const [selectedDisciplina, setSelectedDisciplina] = useState('')
  const [selectedDocente, setSelectedDocente] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedPeriodo, setSelectedPeriodo] = useState('')

  // Turma Context Data
  const [professoresAlocados, setProfessoresAlocados] = useState<any[]>([])
  const [quadroHorario, setQuadroHorario] = useState<any[]>([])
  const [estudantes, setEstudantes] = useState<any[]>([])
  const [loadingContext, setLoadingContext] = useState(false)

  // View Control
  const [activeView, setActiveView] = useState<'frequencia' | 'notas'>('frequencia')

  // Utility
  const [toast, setToast] = useState<ToastType>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Load Base Data
  useEffect(() => {
    async function loadBaseData() {
      try {
        const [resTurmas, resDisc, resProf, resAnos] = await Promise.all([
          getTurmas(),
          getDisciplinas(),
          getTodosProfessores(),
          getAnosLetivos()
        ])

        if (resTurmas.success && resTurmas.data) setTurmas(resTurmas.data)
        if (resDisc.success && resDisc.data) setAllDisciplinas(resDisc.data)
        if (resProf.success && resProf.data) setAllProfessores(resProf.data)
        setAnosLetivos(resAnos)

        if (resAnos.length > 0) {
          const ativo = resAnos.find((a: any) => a.ativo) || resAnos[0]
          loadPeriodos(ativo.id)
        }
      } catch (error) {
        console.error('Erro no carregamento inicial:', error)
      } finally {
        setLoading(false)
      }
    }
    loadBaseData()
  }, [])

  async function loadPeriodos(anoId: string) {
    const resPeriodos = await getPeriodosAvaliativos(anoId)
    setPeriodos(resPeriodos)
    if (resPeriodos.length > 0) {
      setSelectedPeriodo(resPeriodos[0].id)
    }
  }

  // Load Turma Context
  useEffect(() => {
    if (!selectedTurma) {
      setEstudantes([])
      setProfessoresAlocados([])
      setQuadroHorario([])
      setSelectedDisciplina('')
      setSelectedDocente('')
      return
    }

    async function loadTurmaContext() {
      setLoadingContext(true)
      try {
        const [resEstudantes, resAlocacoes, resQuadro] = await Promise.all([
          getEstudantesTurma(selectedTurma),
          getProfessoresTurma(selectedTurma),
          getQuadroHorarioTurma(selectedTurma)
        ])

        if (resEstudantes.success && resEstudantes.data) {
          setEstudantes(resEstudantes.data)
        }
        if (resAlocacoes.success && resAlocacoes.data) {
          setProfessoresAlocados(resAlocacoes.data)
          if (resAlocacoes.data.length > 0) {
            setSelectedDisciplina(resAlocacoes.data[0].disciplina.id)
            setSelectedDocente(resAlocacoes.data[0].professor.id)
          } else {
            setSelectedDisciplina('')
            setSelectedDocente('')
          }
        }
        if (resQuadro.success && resQuadro.data) {
          setQuadroHorario(resQuadro.data)
        }
      } catch (error) {
        console.error('Erro ao carregar contexto da turma:', error)
      } finally {
        setLoadingContext(false)
      }
    }

    loadTurmaContext()
  }, [selectedTurma])

  // Helpers
  function handleDisciplinaChange(discId: string) {
    setSelectedDisciplina(discId)
    const alocacao = professoresAlocados.find(p => p.disciplina.id === discId)
    if (alocacao) {
      setSelectedDocente(alocacao.professor.id)
    } else {
      setSelectedDocente('')
    }
  }

  const getDiaSemana = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr + 'T12:00:00')
    const dayIndex = date.getDay()
    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
    return dias[dayIndex]
  }

  const currentDiaSemana = getDiaSemana(selectedDate)
  const matchingSchedule = quadroHorario.find(
    q => q.diaSemana === currentDiaSemana && q.disciplinaId === selectedDisciplina
  )
  const aulasSugeridas = matchingSchedule ? matchingSchedule.quantidadeAulas : null
  const disciplinaAtiva = allDisciplinas.find(d => d.id === selectedDisciplina)

  return (
    <DiarioContext.Provider
      value={{
        turmas,
        allDisciplinas,
        allProfessores,
        anosLetivos,
        periodos,
        loading,
        loadingContext,
        selectedTurma,
        setSelectedTurma,
        selectedDisciplina,
        setSelectedDisciplina,
        selectedDocente,
        setSelectedDocente,
        selectedDate,
        setSelectedDate,
        selectedPeriodo,
        setSelectedPeriodo,
        professoresAlocados,
        quadroHorario,
        estudantes,
        activeView,
        setActiveView,
        toast,
        showToast,
        handleDisciplinaChange,
        disciplinaAtiva,
        matchingSchedule,
        aulasSugeridas
      }}
    >
      {children}
    </DiarioContext.Provider>
  )
}

export function useDiario() {
  const context = useContext(DiarioContext)
  if (context === undefined) {
    throw new Error('useDiario must be used within a DiarioProvider')
  }
  return context
}
