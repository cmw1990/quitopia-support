
import { TopNav } from "@/components/layout/TopNav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Brain, RotateCcw } from "lucide-react"

export default function Reversi() {
  const [board, setBoard] = useState<number[][]>(Array(8).fill(null).map(() => Array(8).fill(0)))
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1)
  const [score, setScore] = useState({ player1: 2, player2: 2 })

  useEffect(() => {
    initializeBoard()
  }, [])

  const initializeBoard = () => {
    const newBoard = Array(8).fill(null).map(() => Array(8).fill(0))
    // Set initial pieces
    newBoard[3][3] = 1
    newBoard[3][4] = 2
    newBoard[4][3] = 2
    newBoard[4][4] = 1
    setBoard(newBoard)
    setCurrentPlayer(1)
    setScore({ player1: 2, player2: 2 })
  }

  const makeMove = (row: number, col: number) => {
    if (board[row][col] !== 0) return
    
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ]

    let validMove = false
    const newBoard = [...board.map(row => [...row])]

    for (const [dx, dy] of directions) {
      let x = row + dx
      let y = col + dy
      const flips: [number, number][] = []

      while (x >= 0 && x < 8 && y >= 0 && y < 8 && board[x][y] === (currentPlayer === 1 ? 2 : 1)) {
        flips.push([x, y])
        x += dx
        y += dy
      }

      if (flips.length > 0 && x >= 0 && x < 8 && y >= 0 && y < 8 && board[x][y] === currentPlayer) {
        validMove = true
        flips.forEach(([fx, fy]) => {
          newBoard[fx][fy] = currentPlayer
        })
      }
    }

    if (validMove) {
      newBoard[row][col] = currentPlayer
      setBoard(newBoard)
      updateScore(newBoard)
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
    }
  }

  const updateScore = (newBoard: number[][]) => {
    const newScore = newBoard.reduce((acc, row) => {
      const rowScore = row.reduce((rowAcc, cell) => {
        if (cell === 1) rowAcc.player1++
        if (cell === 2) rowAcc.player2++
        return rowAcc
      }, { player1: 0, player2: 0 })
      return {
        player1: acc.player1 + rowScore.player1,
        player2: acc.player2 + rowScore.player2
      }
    }, { player1: 0, player2: 0 })
    setScore(newScore)
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <CardTitle>Reversi</CardTitle>
            </div>
            <CardDescription>
              Place pieces to flip your opponent's pieces. The player with the most pieces wins!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="flex justify-between w-full max-w-md mb-4">
                <div className="text-lg">
                  Player 1 (Black): {score.player1}
                </div>
                <div className="text-lg">
                  Player 2 (White): {score.player2}
                </div>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-8 gap-1 bg-green-800 p-4 rounded-lg">
                  {board.map((row, rowIndex) => (
                    row.map((cell, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => makeMove(rowIndex, colIndex)}
                        className="w-12 h-12 bg-green-600 hover:bg-green-500 transition-colors rounded-sm flex items-center justify-center"
                      >
                        {cell > 0 && (
                          <div className={`w-10 h-10 rounded-full ${
                            cell === 1 ? 'bg-black' : 'bg-white'
                          } transition-all duration-300 transform hover:scale-105`} />
                        )}
                      </button>
                    ))
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <Button onClick={initializeBoard} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
