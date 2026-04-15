"use client";

import { useEffect, useRef, useState } from "react";

interface CameraViewProps {
  onCapture: (base64Image: string) => void;
  mode: "capture" | "preview";
  onSwipe?: (direction: "left" | "right") => void;
  onConfirm?: () => void;
}

export default function CameraView({ onCapture, mode, onSwipe, onConfirm }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [feedback, setFeedback] = useState<string>("");
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [isGestureMatched, setIsGestureMatched] = useState(false);

  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const swipeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const confirmTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevWristXRef = useRef<number | null>(null);
  
  const modeRef = useRef(mode);
  const onCaptureRef = useRef(onCapture);
  const onSwipeRef = useRef(onSwipe);
  const onConfirmRef = useRef(onConfirm);

  useEffect(() => {
    modeRef.current = mode;
    onCaptureRef.current = onCapture;
    onSwipeRef.current = onSwipe;
    onConfirmRef.current = onConfirm;
  }, [mode, onCapture, onSwipe, onConfirm]);

  useEffect(() => {
    let camera: any = null;
    let hands: any = null;
    if (!videoRef.current || !canvasRef.current) return;

    if (typeof (window as any).Hands === "undefined") {
      setIsInitializing(false);
      return;
    }

    hands = new (window as any).Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    hands.onResults((results: any) => {
        const currentMode = modeRef.current;
        
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            setIsHandDetected(false);
            setIsGestureMatched(false);
            setFeedback(currentMode === "capture" ? "请将手势放置在框内" : "左右挥手切图 👍确认");
            if (currentMode === "preview") {
                prevWristXRef.current = null;
                if (confirmTimerRef.current) {
                    clearTimeout(confirmTimerRef.current);
                    confirmTimerRef.current = null;
                }
            }
            return;
        }

        setIsHandDetected(true);
        const landmarks = results.multiHandLandmarks[0];

        if (currentMode === "preview") {
            const wristX = landmarks[0].x;
            
            // 拇指朝上，其余手指弯曲
            const thumbUp = landmarks[4].y < landmarks[3].y - 0.05 && landmarks[4].y < landmarks[9].y;
            const indexCurled = landmarks[8].y > landmarks[6].y;
            const middleCurled = landmarks[12].y > landmarks[10].y;
            const ringCurled = landmarks[16].y > landmarks[14].y;
            const pinkyCurled = landmarks[20].y > landmarks[18].y;
            const isThumbsUp = thumbUp && indexCurled && middleCurled && ringCurled && pinkyCurled;

            if (isThumbsUp) {
                setIsGestureMatched(true);
                setFeedback("大拇指保持，获取中...");
                if (!confirmTimerRef.current) {
                    confirmTimerRef.current = setTimeout(() => {
                        if (onConfirmRef.current) onConfirmRef.current();
                        confirmTimerRef.current = null;
                    }, 1200);
                }
                if (swipeTimerRef.current) { 
                    clearTimeout(swipeTimerRef.current); 
                    swipeTimerRef.current = null; 
                }
            } else {
                if (confirmTimerRef.current) {
                    clearTimeout(confirmTimerRef.current);
                    confirmTimerRef.current = null;
                }
                setIsGestureMatched(false);
                
                if (!swipeTimerRef.current) {
                    if (prevWristXRef.current !== null) {
                        const deltaX = wristX - prevWristXRef.current;
                        if (Math.abs(deltaX) > 0.15) { 
                            const direction = deltaX > 0 ? "right" : "left";
                            setIsGestureMatched(true);
                            setFeedback(direction === "left" ? "向左切换 ⬅️" : "向右切换 ➡️");
                            if (onSwipeRef.current) onSwipeRef.current(direction);
                            
                            swipeTimerRef.current = setTimeout(() => {
                                swipeTimerRef.current = null;
                                setIsGestureMatched(false);
                                setFeedback("左右挥手切图 👍确认");
                            }, 1200);
                        } else if (!isGestureMatched) {
                            setFeedback("左右挥手切图 👍确认");
                        }
                    }
                    prevWristXRef.current = wristX;
                }
            }
        } else if (currentMode === "capture") {
            const isPeaceSign = 
                 landmarks[8].y < landmarks[5].y &&
                 landmarks[12].y < landmarks[9].y &&
                 landmarks[16].y > landmarks[13].y &&
                 landmarks[20].y > landmarks[17].y;
            
            setIsGestureMatched(isPeaceSign);
            
            if (isPeaceSign) {
                setFeedback("识别成功！准备拍摄");
                if (!countdownRef.current) {
                    startCountdown();
                }
            } else {
                setFeedback("识别中... 请比出剪刀手 ✌️");
            }
        }
    });

    camera = new (window as any).Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && hands) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start().then(() => setIsInitializing(false)).catch(console.error);

    return () => {
      if (camera) camera.stop();
      if (hands) hands.close();
      if (countdownRef.current) clearTimeout(countdownRef.current);
      if (swipeTimerRef.current) clearTimeout(swipeTimerRef.current);
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, []);

  const startCountdown = () => {
    let count = 5;
    setCountdown(count);
    
    const tick = () => {
      count--;
      if (count > 0) {
        setCountdown(count);
        countdownRef.current = setTimeout(tick, 1000);
      } else {
        setCountdown(null);
        countdownRef.current = null;
        captureImage();
      }
    };
    
    countdownRef.current = setTimeout(tick, 1000);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvasRef.current.toDataURL("image/jpeg");
    if (onCaptureRef.current) {
      onCaptureRef.current(base64);
    }
  };

  return (
    <div className="relative w-full h-full max-w-2xl mx-auto rounded-[2rem] overflow-hidden aspect-[3/4] sm:aspect-[4/3] bg-gray-900 shadow-inner ring-1 ring-white/10 transition-all">
      {isInitializing && (
         <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-400 bg-gray-950 z-20">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-400 rounded-full animate-spin mb-4" />
            <span className="animate-pulse tracking-widest text-sm font-mono uppercase">正在初始化_</span>
         </div>
      )}
      
      <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1] opacity-90 mix-blend-screen" playsInline muted autoPlay />
      <canvas ref={canvasRef} className="hidden" />

      {/* 相机 UI 十字准星与参考线 */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-1/3 left-0 w-full h-[1px] bg-white" />
        <div className="absolute top-2/3 left-0 w-full h-[1px] bg-white" />
        <div className="absolute top-0 left-1/3 w-[1px] h-full bg-white" />
        <div className="absolute top-0 left-2/3 w-[1px] h-full bg-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white rounded-full" />
      </div>

      {/* HUD 风格取景框 (仅在拍照时显示大框) */}
      {mode === "capture" && countdown === null && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-6">
           <div className={`relative w-[85%] sm:w-[55%] aspect-[3/4] max-w-[340px] flex flex-col items-center justify-center transition-all duration-500 ${
             isGestureMatched 
               ? "scale-105" 
               : isHandDetected ? "scale-100" : "scale-95 opacity-80"
           }`}>
             
              {/* 四个科幻风格的边角 */}
              <div className={`absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 rounded-tl-2xl transition-all duration-500 ${isGestureMatched ? 'border-green-400 shadow-[-5px_-5px_20px_rgba(74,222,128,0.4)]' : isHandDetected ? 'border-cyan-400 shadow-[-5px_-5px_20px_rgba(34,211,238,0.4)]' : 'border-white/40'}`} />
              <div className={`absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 rounded-tr-2xl transition-all duration-500 ${isGestureMatched ? 'border-green-400 shadow-[5px_-5px_20px_rgba(74,222,128,0.4)]' : isHandDetected ? 'border-cyan-400 shadow-[5px_-5px_20px_rgba(34,211,238,0.4)]' : 'border-white/40'}`} />
              <div className={`absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 rounded-bl-2xl transition-all duration-500 ${isGestureMatched ? 'border-green-400 shadow-[-5px_5px_20px_rgba(74,222,128,0.4)]' : isHandDetected ? 'border-cyan-400 shadow-[-5px_5px_20px_rgba(34,211,238,0.4)]' : 'border-white/40'}`} />
              <div className={`absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 rounded-br-2xl transition-all duration-500 ${isGestureMatched ? 'border-green-400 shadow-[5px_5px_20px_rgba(74,222,128,0.4)]' : isHandDetected ? 'border-cyan-400 shadow-[5px_5px_20px_rgba(34,211,238,0.4)]' : 'border-white/40'}`} />

              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b transition-opacity duration-500 ${isGestureMatched ? 'from-green-500/10 to-transparent opacity-100' : isHandDetected ? 'from-cyan-500/10 to-transparent opacity-100' : 'opacity-0'}`} />

              {isHandDetected && !isGestureMatched && (
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse -translate-y-1/2 opacity-70" />
              )}

              <div className="relative z-10 flex flex-col items-center">
                {(!isGestureMatched) && <span className="text-8xl mb-6 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">✌️</span>}
                <div className={`px-6 py-2 rounded-full backdrop-blur-md border tracking-wide font-bold shadow-2xl transition-colors text-sm sm:text-base ${
                  isGestureMatched 
                    ? "bg-green-500/20 border-green-400/50 text-green-300" 
                    : isHandDetected 
                      ? "bg-cyan-900/40 border-cyan-400/50 text-cyan-300" 
                      : "bg-black/40 border-white/20 text-gray-300"
                }`}>
                   {feedback || "请将双指放入框内"}
                </div>
              </div>
           </div>
        </div>
      )}
      
      {/* HUD 顶部状态栏 */}
      {mode === "capture" && (
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-10">
          <div className="flex flex-col gap-1">
             <span className="bg-red-500 text-white text-[10px] font-mono px-2 py-0.5 rounded uppercase flex items-center gap-1 w-max">
               <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> 录制
             </span>
             <span className="text-white/60 text-xs font-mono drop-shadow-md">高清 1080P</span>
          </div>
        </div>
      )}
      
      {/* Preview 模式底部反馈条 (类似通知栏) */}
      {mode === "preview" && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-10">
           <div className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-lg border transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] ${
             isGestureMatched ? "bg-green-500/80 border-green-400 text-white scale-105" : "bg-black/60 border-white/20 text-white"
           }`}>
             {feedback || "左右挥手切图 👍确认"}
           </div>
        </div>
      )}

      {/* 倒计时 */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/60 z-30 backdrop-blur-md transition-all">
          <div className="relative flex items-center justify-center">
             <div className="absolute w-48 h-48 border-t-4 border-r-4 border-white/20 rounded-full animate-[spin_2s_linear_infinite]" />
             <div className="absolute w-56 h-56 border-b-4 border-l-4 border-cyan-400/30 rounded-full animate-[spin_3s_linear_infinite_reverse]" />
             <span className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_0_40px_rgba(255,255,255,0.5)] transform scale-110">
               {countdown}
             </span>
          </div>
        </div>
      )}
    </div>
  );
}
