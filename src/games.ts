import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export interface Game {
  id: string
  title: string
  summary: string
  tags: string[]
  icon: string
  component: LazyExoticComponent<ComponentType>
}

export const games: Game[] = [
  {
    id: 'sudoku',
    title: 'Sudoku',
    summary: 'Playable sudoku with a generator, solver and an optional 3D view.',
    tags: ['React', 'three.js'],
    icon: './icons/sudoku.svg',
    component: lazy(() => import('./games/Sudoku/Sudoku.jsx')),
  },
  {
    id: 'str8ts',
    title: 'Str8ts',
    summary: 'The number puzzle with black cells and straights, with a 3D view.',
    tags: ['React', 'three.js'],
    icon: './icons/str8ts.svg',
    component: lazy(() => import('./games/Str8ts/Str8ts.jsx')),
  },
  {
    id: 'wordle',
    title: 'Wordle',
    summary: 'Word guessing, keyboard included.',
    tags: ['React'],
    icon: './icons/wordle.svg',
    component: lazy(() => import('./games/Wordle/Wordle.jsx')),
  },
]
