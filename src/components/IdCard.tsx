"use client";

import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { useRef } from "react";

interface IdCardProps {
  name: string;
  department: string;
  avatarUrl: string;
  idNumber: string;
}

export default function IdCard({ name, department, avatarUrl, idNumber }: IdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 2 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Emoji-Card-${name}.png`;
      link.click();
    } catch (err) {
      console.error("生成图片失败", err);
      alert("工卡生成失败，请重试");
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        ref={cardRef}
        className="w-[340px] aspect-[3/4] bg-gray-900 rounded-[2.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden border border-gray-800"
      >
        {/* 背景光晕与纹理 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 transition-opacity bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* 核心：放大并填充的头像区域 */}
        <div className="relative w-full flex-1 rounded-[1.5rem] overflow-hidden bg-black shadow-inner border border-white/10 group">
          <img
            src={avatarUrl}
            alt="Emoji Avatar"
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          />
          
          {/* 左上角极客风角标 */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]"></span>
            <span className="text-white/90 text-xs font-mono uppercase tracking-widest leading-none">AI EMOJI</span>
          </div>
        </div>

        {/* 底部信息与二维码区 */}
        <div className="h-24 w-full mt-4 flex items-center justify-between px-2 z-10">
           {/* 左侧极简介绍 */}
           <div className="flex flex-col justify-center">
             <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 tracking-wider mb-1">
               DIGITAL ID
             </h2>
             <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase leading-snug">
               Scan Code to<br/>Download Asset
             </p>
           </div>
           
           {/* 右侧二维码 */}
           <div className="bg-white p-1.5 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20 transform rotate-2 hover:rotate-0 hover:scale-105 transition-all">
             <QRCodeSVG value={`https://example.com/card/${idNumber}`} size={64} level="H" />
           </div>
        </div>
      </div>

      <button
        onClick={downloadCard}
        className="group relative px-8 py-4 bg-gray-900 text-white rounded-full font-bold shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 overflow-hidden border border-gray-700"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/20 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <svg className="w-5 h-5 text-blue-400 group-hover:-translate-y-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="relative z-10 tracking-widest font-mono text-sm uppercase text-gray-200">下载我的生图照片</span>
      </button>
    </div>
  );
}
