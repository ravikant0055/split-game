import React, { useEffect, useState } from 'react';
import { Progress } from "./ui/progress";
import { Dialog, DialogTrigger, DialogTitle, DialogHeader, DialogContent, DialogDescription } from "./ui/dialog";
import { BiAlarm } from "react-icons/bi";
import { AiOutlineQq } from "react-icons/ai";
import a1 from '../assets/a1.jpg';
import a2 from '../assets/a2.jpg';
import a3 from '../assets/a3.jpg';
import a4 from '../assets/a4.jpg';
import a5 from '../assets/a5.jpg';
import a6 from '../assets/a6.jpg';

const images = [a1, a2, a3, a4, a5, a6];

const shuffleCardsWithImages = (imgSrcs) => {
  const doubleCards = imgSrcs.flatMap((img, index) => [
    { id: index, img, isFlipped: false, isMatched: false },
    { id: index, img, isFlipped: false, isMatched: false }
  ]);
  return doubleCards.sort(() => Math.random() - 0.5);
};


const Main = () => {
  const [progress, setProgress] = useState(100);
  const [countdown, setCountdown] = useState(60);
  const [started, setStarted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(true);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [endGameDialog, setEndGameDialog] = useState(false);
  const [gameResult, setGameResult] = useState(''); // "win" | "lose"

  const preloadImages = (imageArray) => {
  return Promise.all(
    imageArray.map(
      (src) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(img); // resolve with loaded <img> element
          img.onerror = reject;
        })
    )
  );
};


  // Start the game
const handleStart = async () => {
  setDialogOpen(false);
  setStarted(true);
  setShowPreview(true);

  const loadedImgs = await preloadImages(images); // returns array of <img> elements

  const imageSrcs = loadedImgs.map(img => img.src); // Extract URLs from loaded <img>
  const shuffled = shuffleCardsWithImages(imageSrcs); // Use this below

  setCards(shuffled);

  setTimeout(() => {
    setCards(prev => prev.map(card => ({ ...card, isFlipped: true })));
    setTimeout(() => {
      setCards(prev => prev.map(card => ({ ...card, isFlipped: false })));
      setShowPreview(false);
    }, 2000);
  }, 100);
};

  // Countdown and progress bar
  useEffect(() => {
    if (!started) return;
    const audio = new Audio('/song.mp3');
    audio.play().catch(e => console.warn("Audio play failed:", e));
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
      setProgress(prev => (prev <= 0 ? 0 : prev - (100 / 60)));
    }, 1000);
    return () => clearInterval(interval);
  }, [started]);

  useEffect(() => {
    if (!started) return;

    if (countdown === 0 && cards.some(c => !c.isMatched)) {
      setGameResult("lose");
      setEndGameDialog(true);
    } else if (cards.length > 0 && cards.every(c => c.isMatched)) {
      setGameResult("win");
      setEndGameDialog(true);
    }
  }, [countdown, cards, started]);


  const handleCardClick = (index) => {
    if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    const newFlipped = [...flippedCards, { ...newCards[index], index }];
    setCards(newCards);
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (first.id === second.id) {
        newCards[first.index].isMatched = true;
        newCards[second.index].isMatched = true;
        setCards(newCards);
        setScore(score + 5);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          newCards[first.index].isFlipped = false;
          newCards[second.index].isFlipped = false;
          setCards([...newCards]);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className='bg-[#ffcea0] flex justify-center w-full h-screen'>
      <div className='bg-white flex flex-col items-center justify-between py-5 w-[550px] my-6 rounded-xl shadow-xl'>
        <h1 className='font-extrabold text-xl'>Split<span className='text-[#ff005d]'>Cards</span></h1>

        <div className='w-[92%] flex flex-col gap-5 items-center rounded-md border-slate-400 p-2'>
          <span className={`flex gap-2 text-md items-center font-bold ${countdown < 10 ? "text-[#f10000]" : ''}`}>
            <BiAlarm className='text-2xl' />{countdown}s
          </span>
          <Progress value={progress} className="w-[100%] h-[10px] [&>div]:bg-[#ff5353]" />
          <div className='text-md font-semibold'>Score: {score}</div>
        </div>

        <div className='grid grid-cols-4 gap-5 h-fit items-end'>
          {cards.map((card, i) => (
            <div
              key={i}
              onClick={() => handleCardClick(i)}
              className={`card w-[110px] h-[150px] rounded shadow-lg cursor-pointer ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
            >
              <div className="card-inner">
                <div className="card-front bg-gradient-to-tl from-[#ff9500] to-[#ff9589] w-full h-full flex items-center justify-center">
                  <AiOutlineQq className='text-4xl text-white' />
                </div>
                <div className="card-back">
                  <img src={card.img} alt="card" className="w-full h-full object-cover" loading="eager" />
                 
                </div>
              </div>
            </div>

          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">How To Play?</DialogTitle>
            <DialogDescription>
              <h1 className='text-lg text-slate-800'>Match all the cards within 60 seconds!</h1>
              <ul className='list-disc px-4 py-2 space-y-1 text-slate-700'>
                <li>See all the match cards for first 2 seconds</li>
                <li>Split a card to see the exact card</li>
                <li>You will get 5 points for each correct match</li>
                <li>If you use undo or refresh, you lose time.</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={handleStart}
            className='px-10 py-2 w-fit cursor-pointer bordeer-none rounded-md text-white bg-gradient-to-r from-[#f50a0a] to-[#ff5f02]'
          >
            Start
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={endGameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">
              {gameResult === "win" ? "🎉 You Win!" : "⏱️ Game Over"}
            </DialogTitle>
            <DialogDescription className="text-md text-slate-700">
              {gameResult === "win"
                ? `Great job! Your score is ${score} points.`
                : `Time’s up! Try again to beat the clock.`}
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 px-6 py-2 rounded-md text-white bg-gradient-to-r from-[#f50a0a] to-[#ff5f02]'
          >
            Restart Game
          </button>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Main;
