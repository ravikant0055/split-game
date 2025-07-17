import React, { useEffect, useState } from 'react'
import { Progress } from "./ui/progress"
import { Dialog, DialogTrigger, DialogTitle, DialogHeader, DialogContent, DialogDescription } from "./ui/dialog"
import { BiAlarm } from "react-icons/bi"

const Main = () => {
  const [progress, setProgress] = useState(100)
  const [countdown, setCountdown] = useState(60)
  const [started, setStarted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(true)

  // ⏱️ Countdown and audio only after "Start"
  useEffect(() => {
    if (!started) return;

    const audio = new Audio('/song.mp3')
    audio.play().catch(e => console.warn("Audio play failed:", e))

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })

      setProgress(prev => {
        if (prev <= 0) return 0
        return prev - (100 / 60)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [started])

  const handleStart = () => {
    setStarted(true)
    setDialogOpen(false)
  }

  return (
    <div className='bg-[#f3f4f6] flex justify-center w-full h-screen'>
      <div className='bg-white flex flex-col items-center justify-between py-5 w-[550px] my-6 rounded-xl shadow-xl'>
        <h1 className='font-extrabold text-xl'>Split<span className='text-[#0800ff]'>Cards</span></h1>
        <div className='w-[92%] flex flex-col gap-5 items-center rounded-md border-slate-400 p-2'>
          <span className={`flex gap-2 text-md items-center font-bold ${countdown < 10 ? "text-[#f10000]" : ''}`}>
            <BiAlarm className='text-2xl' />{countdown}s
          </span>
          <Progress value={progress} className="w-[100%] h-[10px] [&>div]:bg-[#53b2ff]" />
        </div>
        <div className='grid grid-cols-4 gap-5 h-fit items-end'>
          {[...Array(12)].map((_, i) => (
            <div key={i} className='bg-gradient-to-tl shadow-lg from-[#00ffd0] to-[#06b5ac] w-[110px] h-[150px]'></div>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">How To Play?</DialogTitle>
            <DialogDescription>
              <h1 className='text-lg text-slate-800'>Match all the cards within 60 seconds!</h1>
              <ul className='list-disc px-4 py-2 text-slate-900'>
                <li>See all the match cards for first 2 seconds</li>
                <li>Split a card to see the exact card</li>
                <li>You will get points for right guesses</li>
                <li>If you use undo or refresh, you lose time.</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={handleStart}
            className='px-10 py-2 w-fit cursor-pointer bordeer-none rounded-md text-white bg-gradient-to-r from-[#0162d0] to-[#02e6ff]'
          >
            Start
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Main
