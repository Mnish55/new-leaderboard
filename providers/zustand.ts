import { create } from 'zustand';

type CounterPropsTeam1 = {
  counterTeam1: number;
  setCounterTeam1: (value: number) => void;
  increaseCounterTeam1: () => void;
};

type ScorePropsTeam1 = {
  scoreTeam1: number;
  setScoreTeam1: (value: number) => void;
  increaseScoreTeam1: () => void;
  
};

export const useCounterTeam1 = create<CounterPropsTeam1>((set) => ({
  counterTeam1: 0,
  setCounterTeam1: (value: number) => set({ counterTeam1: value }),
  increaseCounterTeam1: () => set((state) => ({ counterTeam1: state.counterTeam1 + 1 })),
}));

export const useScoreTeam1 = create<ScorePropsTeam1>((set) => ({
  scoreTeam1: 0,
  setScoreTeam1: (value: number) => set({ scoreTeam1: value }),
  increaseScoreTeam1: () => set((state) => ({ scoreTeam1: state.scoreTeam1 + 1 })),
}));

// Students store for optimistic updates and cross-component sync
export type Student = { id: string; name: string; marks: number[] };

type StudentsStore = {
  students: Student[];
  setStudents: (s: Student[]) => void;
  addStudent: (s: Student) => void;
  updateStudent: (s: Student) => void;
  removeStudent: (id: string) => void;
};

export const useStudents = create<StudentsStore>((set) => ({
  students: [],
  setStudents: (s: Student[]) => set({ students: s }),
  addStudent: (s: Student) => set((state) => ({ students: [...state.students, s] })),
  updateStudent: (s: Student) =>
    set((state) => ({ students: state.students.map((st) => (st.id === s.id ? s : st)) })),
  removeStudent: (id: string) => set((state) => ({ students: state.students.filter((st) => st.id !== id) })),
}));