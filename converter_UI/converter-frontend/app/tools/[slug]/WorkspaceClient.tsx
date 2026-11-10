'use client';

import React, { useState, useRef, ChangeEvent } from 'react';

interface ClientProps {
  toolTitle: string;
  apiRoute: string;
}

export default function WorkspaceClient({ toolTitle, apiRoute }: ClientProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pipelineState, setPipelineState] = useState<'IDLE' | 'UPLOADING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [downloadTarget, setDownloadTarget] = useState<string | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const captureFileStream = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPipelineState('IDLE');
      setDownloadTarget(null);
    }
  };

  const startCachePollingLoop = (taskId: string) => {
    setPipelineState('PROCESSING');
    
    pollingTimerRef.current = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/pipeline/status/${taskId}`);
        const report = await response.json();

        if (report.status === 'SUCCESS') {
          setPipelineState('SUCCESS');
          setDownloadTarget(report.download_target);
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        } else if (report.status === 'FAILED') {
          setPipelineState('FAILED');
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        }
      } catch (err) {
        console.error("Connection polling interruption:", err);
        setPipelineState('FAILED');
        if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      }
    }, 1500);
  };

  const transmitMultipartPayload = async () => {
    if (!selectedFile) return;
    setPipelineState('UPLOADING');

    const multipartPack = new FormData();
    multipartPack.append('file', selectedFile);

    try {
      const response = await fetch(`http://localhost:8000/api/v1/pipeline/ingest/${apiRoute}`, {
        method: 'POST',
        body: multipartPack,
      });

      if (!response.ok) throw new Error("FastAPI Ingestion Failure");
      
      const receipt = await response.json();
      if (receipt.task_id) {
        startCachePollingLoop(receipt.task_id);
      }
    } catch (error) {
      console.error("Payload transmission breakout:", error);
      setPipelineState('FAILED');
    }
  };

  return (
    <div className="w-full max-w-xl bg-white border border-slate-100 rounded-3xl shadow-xl p-6 sm:p-8 text-slate-800 font-sans">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">
          Workspace Terminal Node
        </span>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2">{toolTitle}</h1>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 rounded-2xl p-8 text-center transition-colors relative cursor-pointer">
          <input type="file" onChange={captureFileStream} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
          <p className="text-sm font-bold text-slate-700 truncate">{selectedFile ? selectedFile.name : "Select or Drop Target Document"}</p>
          <p className="text-[10px] text-slate-400 mt-1">Maximum transfer limit: 50MB per conversion batch</p>
        </div>

        <button
          onClick={transmitMultipartPayload}
          disabled={!selectedFile || pipelineState === 'UPLOADING' || pipelineState === 'PROCESSING'}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:bg-slate-100 disabled:text-slate-400 shadow-md shadow-indigo-100 disabled:shadow-none"
        >
          {pipelineState === 'UPLOADING' && "Streaming Binary Data to Backend..."}
          {pipelineState === 'PROCESSING' && "Python Queue Workers Executing Task..."}
          {pipelineState === 'IDLE' && `Execute ${toolTitle}`}
          {pipelineState === 'SUCCESS' && "Conversion Array Success"}
          {pipelineState === 'FAILED' && "Pipeline Timeout - Retrigger Process"}
        </button>

        {pipelineState === 'SUCCESS' && downloadTarget && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mt-4 space-y-2">
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider">Output Ready</h4>
            <a href={downloadTarget} download className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md">
              📥 Download Converted File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
