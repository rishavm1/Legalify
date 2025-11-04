"use client"

import { useState, useEffect, useCallback, useRef } from "react"

const TETRIS_PIECES = [
  { shape: [[1, 1, 1, 1]], color: 'bg-white dark:bg-white' },
  { shape: [[1, 1], [1, 1]], color: 'bg-white dark:bg-white' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-white dark:bg-white' },
  { shape: [[1, 0], [1, 0], [1, 1]], color: 'bg-white dark:bg-white' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-white dark:bg-white' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-white dark:bg-white' },
  { shape: [[0, 1], [0, 1], [1, 1]], color: 'bg-white dark:bg-white' },
]

interface Cell {
  filled: boolean
  color: string
}

interface FallingPiece {
  shape: number[][]
  color: string
  x: number
  y: number
  id: string
}

export interface TetrisLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  speed?: 'slow' | 'normal' | 'fast'
  showLoadingText?: boolean
  loadingText?: string
}

export default function TetrisLoading({ 
  size = 'md', 
  speed = 'normal',
  showLoadingText = true,
  loadingText = 'Loading...'
}: TetrisLoadingProps) {
  const sizeConfig = {
    sm: { cellSize: 'w-2 h-2', gridWidth: 8, gridHeight: 16, padding: 'p-0.5' },
    md: { cellSize: 'w-3 h-3', gridWidth: 10, gridHeight: 20, padding: 'p-1' },
    lg: { cellSize: 'w-4 h-4', gridWidth: 10, gridHeight: 20, padding: 'p-1.5' }
  }

  const speedConfig = {
    slow: 150,
    normal: 80,
    fast: 40
  }

  const config = sizeConfig[size]
  const fallSpeed = speedConfig[speed]

  const [grid, setGrid] = useState<Cell[][]>(() =>
    Array(config.gridHeight).fill(null).map(() => 
      Array(config.gridWidth).fill(null).map(() => ({ filled: false, color: '' }))
    )
  )
  const [fallingPiece, setFallingPiece] = useState<FallingPiece | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const frameRef = useRef<number | undefined>(undefined)
  const lastUpdateRef = useRef<number>(0)

  const rotateShape = useCallback((shape: number[][]): number[][] => {
    const rows = shape.length
    const cols = shape[0].length
    const rotated: number[][] = Array(cols).fill(null).map(() => Array(rows).fill(0))

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = shape[i][j]
      }
    }

    return rotated
  }, [])

  const createNewPiece = useCallback((): FallingPiece => {
    const pieceData = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)]
    let shape = pieceData.shape
    
    const rotations = Math.floor(Math.random() * 4)
    for (let i = 0; i < rotations; i++) {
      shape = rotateShape(shape)
    }

    const maxX = config.gridWidth - shape[0].length
    const x = Math.floor(Math.random() * (maxX + 1))

    return {
      shape,
      color: pieceData.color,
      x,
      y: -shape.length,
      id: Math.random().toString(36).substr(2, 9),
    }
  }, [rotateShape, config.gridWidth])

  const canPlacePiece = useCallback((piece: FallingPiece, newX: number, newY: number): boolean => {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const gridX = newX + col
          const gridY = newY + row

          if (gridX < 0 || gridX >= config.gridWidth || gridY >= config.gridHeight) {
            return false
          }

          if (gridY >= 0 && grid[gridY][gridX].filled) {
            return false
          }
        }
      }
    }
    return true
  }, [grid, config.gridWidth, config.gridHeight])

  const placePiece = useCallback((piece: FallingPiece) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })))

      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const gridX = piece.x + col
            const gridY = piece.y + row

            if (gridY >= 0 && gridY < config.gridHeight && gridX >= 0 && gridX < config.gridWidth) {
              newGrid[gridY][gridX] = { filled: true, color: piece.color }
            }
          }
        }
      }

      return newGrid
    })
  }, [config.gridHeight, config.gridWidth])

  const clearFullLines = useCallback(() => {
    setGrid(prevGrid => {
      const linesToClear: number[] = []
      
      prevGrid.forEach((row, index) => {
        if (row.every(cell => cell.filled)) {
          linesToClear.push(index)
        }
      })

      if (linesToClear.length > 0) {
        setIsClearing(true)
        
        const newGrid = prevGrid.map((row, rowIndex) => {
          if (linesToClear.includes(rowIndex)) {
            return row.map(cell => ({ ...cell, color: 'bg-white dark:bg-white animate-pulse opacity-50' }))
          }
          return row
        })

        setTimeout(() => {
          setGrid(currentGrid => {
            const filteredGrid = currentGrid.filter((_, index) => !linesToClear.includes(index))
            const emptyRows = Array(linesToClear.length).fill(null).map(() => 
              Array(config.gridWidth).fill(null).map(() => ({ filled: false, color: '' }))
            )
            setIsClearing(false)
            return [...emptyRows, ...filteredGrid]
          })
        }, 200)

        return newGrid
      }

      return prevGrid
    })
  }, [config.gridWidth])

  const gameLoop = useCallback((timestamp: number) => {
    if (!lastUpdateRef.current) lastUpdateRef.current = timestamp
    const deltaTime = timestamp - lastUpdateRef.current

    if (deltaTime >= fallSpeed && !isClearing) {
      lastUpdateRef.current = timestamp

      if (!fallingPiece) {
        setFallingPiece(createNewPiece())
      } else {
        const newY = fallingPiece.y + 1

        if (canPlacePiece(fallingPiece, fallingPiece.x, newY)) {
          setFallingPiece({ ...fallingPiece, y: newY })
        } else {
          placePiece(fallingPiece)
          setFallingPiece(null)
          clearFullLines()
        }
      }
    }

    frameRef.current = requestAnimationFrame(gameLoop)
  }, [fallingPiece, canPlacePiece, placePiece, clearFullLines, createNewPiece, fallSpeed, isClearing])

  useEffect(() => {
    frameRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [gameLoop])

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${config.padding} bg-black dark:bg-neutral-900 rounded-lg border-2 border-white dark:border-white`}>
        <div className="grid gap-[1px]" style={{ gridTemplateColumns: `repeat(${config.gridWidth}, minmax(0, 1fr))` }}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isFallingPiece = fallingPiece &&
                rowIndex >= fallingPiece.y &&
                rowIndex < fallingPiece.y + fallingPiece.shape.length &&
                colIndex >= fallingPiece.x &&
                colIndex < fallingPiece.x + fallingPiece.shape[0].length &&
                fallingPiece.shape[rowIndex - fallingPiece.y][colIndex - fallingPiece.x]

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`${config.cellSize} ${
                    isFallingPiece
                      ? fallingPiece.color
                      : cell.filled
                      ? cell.color
                      : 'bg-transparent'
                  } transition-colors duration-100`}
                />
              )
            })
          )}
        </div>
      </div>
      {showLoadingText && (
        <p className="text-white dark:text-white text-sm font-medium animate-pulse">
          {loadingText}
        </p>
      )}
    </div>
  )
}
