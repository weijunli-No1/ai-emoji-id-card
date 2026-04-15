"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CameraView from "@/components/CameraView";
import IdCard from "@/components/IdCard";

type AppState = "camera" | "generating" | "preview" | "result";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("camera");
  const [images, setImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  const handleCapture = async (base64Image: string) => {
    setAppState("generating");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await res.json();
      if (data.results) {
        setImages(data.results);
        setPreviewIndex(0);
        setAppState("preview");
      }
    } catch (err) {
      console.error(err);
      setAppState("camera");
      alert("生成失败，请重试。");
    }
  };

  const handleSwipe = (direction: "left" | "right") => {
    setPreviewIndex((prev) => {
        if (direction === "left") {
            return (prev + 1) % images.length;
        } else {
            return (prev - 1 + images.length) % images.length;
        }
    });
  };

  const handleConfirm = () => {
    setAppState("result");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            AI Emoji 工卡照
          </h1>
          <p className="text-gray-500 text-lg">隔空手势，沉浸式交互控制体验</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] flex items-center justify-center p-4 md:p-8 relative">
          <AnimatePresence mode="wait">
            {appState === "camera" && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-3xl"
              >
                <CameraView mode="capture" onCapture={handleCapture} />
                <div className="mt-6 text-center text-gray-400">
                  对着镜头比个“剪刀手”(✌️)触发倒计时拍照！
                </div>
              </motion.div>
            )}

            {appState === "generating" && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center w-full min-h-[400px] relative overflow-hidden rounded-3xl bg-gray-900 border border-gray-800"
              >
                {/* 未来科技感背景光晕 */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-gray-900 to-black"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative flex items-center justify-center mb-8">
                     <div className="w-32 h-32 border-4 border-dashed border-cyan-500/30 rounded-full animate-[spin_4s_linear_infinite]" />
                     <div className="absolute w-24 h-24 border-4 border-blue-400 border-t-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
                     <div className="absolute text-3xl animate-pulse filter drop-shadow-[0_0_10px_#60a5fa]">⚡️</div>
                  </div>
                  <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest uppercase">
                    AI 正在为您解析面部特征...
                  </p>
                  <div className="mt-4 flex gap-2">
                     <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                     <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                     <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </motion.div>
            )}

            {appState === "preview" && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center pb-4"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 mb-2">
                    浏览并选择
                  </h2>
                  <p className="text-gray-500 font-medium">伸手左右挥动切换风格，比出 <b className="text-blue-500">大拇指(👍)</b> 确认选中</p>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-center gap-10 w-full relative">
                  {/* 左侧：大图幻灯片预览区 */}
                  <div className="relative w-[300px] sm:w-[340px] aspect-[4/5] rounded-[2.5rem] bg-gray-50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-white overflow-hidden flex-shrink-0 group">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={previewIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                        src={images[previewIndex]}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    
                    {/* 底部渐变暗角与指示器 */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-6 z-10">
                      <div className="flex gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                        {images.map((_, i) => (
                          <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === previewIndex ? 'bg-white shadow-[0_0_8px_#fff]' : 'bg-white/30'}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 右侧：交互摄像小控制台 */}
                  <div className="relative w-[280px] lg:w-[320px] aspect-[3/4] bg-black rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(59,130,246,0.2)] border flex-shrink-0 border-gray-800 group">
                    <div className="absolute -top-4 right-6 z-20 bg-blue-600 px-4 py-1 rounded-full text-white text-[11px] uppercase font-bold tracking-widest flex items-center gap-2 shadow-lg border border-blue-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_#4ade80]"></span> SENSOR ACTIVE
                    </div>
                    {/* 相机内嵌 */}
                    <div className="w-full h-full rounded-[2rem] overflow-hidden bg-gray-900 inner-shadow">
                      <CameraView 
                        mode="preview" 
                        onCapture={() => {}} 
                        onSwipe={handleSwipe}
                        onConfirm={handleConfirm}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {appState === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex justify-center py-4"
              >
                <IdCard
                  name="数字体验官"
                  department="未来实验室"
                  avatarUrl={images[previewIndex]}
                  idNumber={`EMJ-2026-00${previewIndex + 1}`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {appState !== 'camera' && (
           <div className="text-center pb-8">
              <button 
                onClick={() => {
                  setAppState("camera");
                  setPreviewIndex(0);
                }}
                className="text-gray-400 hover:text-blue-600 transition-colors font-medium border border-gray-200 rounded-full px-8 py-3 bg-white shadow-sm hover:shadow-md"
              >
                重新拍摄
              </button>
           </div>
        )}
      </div>
    </main>
  );
}
