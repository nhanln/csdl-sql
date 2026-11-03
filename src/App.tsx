/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SQL Master - Web App Học & Thực Hành SQL Tương Tác
 * Kiến trúc Split-Screen, Client-side SQLite WASM (sql.js) và Trợ lý AI Gemini.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { LeftPanel } from './components/LeftPanel';
import { SqlEditor } from './components/SqlEditor';
import { ResultPanel, HistoryItem } from './components/ResultPanel';
import { CheatSheetModal } from './components/CheatSheetModal';
import { SampleDataModal } from './components/SampleDataModal';
import { SuccessModal } from './components/SuccessModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { CHALLENGES } from './data/curriculum';
import { sqliteService, TableSchema, QueryResult } from './services/sqliteEngine';

export default function App() {
  // 1. Quản lý trạng thái bài học & Sandbox
  const [currentChallengeId, setCurrentChallengeId] = useState<string>(() => {
    return localStorage.getItem('sql_master_current') || CHALLENGES[0].id;
  });

  const [completedChallenges, setCompletedChallenges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sql_master_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);
  const [userSql, setUserSql] = useState<string>(() => {
    const ch = CHALLENGES.find(c => c.id === currentChallengeId) || CHALLENGES[0];
    return ch.initialSql;
  });

  // 2. Trạng thái SQLite & Lược đồ
  const [schemas, setSchemas] = useState<TableSchema[]>([]);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [expectedResult, setExpectedResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 3. Trạng thái AI Gemini
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [hasAiKey, setHasAiKey] = useState<boolean>(true);

  // 4. Modals & UI Trạng thái
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isDeploymentGuideOpen, setIsDeploymentGuideOpen] = useState(false);
  const [previewTable, setPreviewTable] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // 5. Tỉ lệ Split Screen kéo thả
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(42);
  const isDraggingRef = useRef(false);

  const currentChallengeIndex = CHALLENGES.findIndex(c => c.id === currentChallengeId);
  const currentChallenge = CHALLENGES[currentChallengeIndex] || CHALLENGES[0];

  // Tính tổng XP
  const totalXp = completedChallenges.reduce((sum, id) => {
    const ch = CHALLENGES.find(c => c.id === id);
    return sum + (ch ? ch.xp : 0);
  }, 0);

  // Khởi tạo SQLite WASM và nạp Schema ban đầu
  useEffect(() => {
    async function setupDb() {
      try {
        await sqliteService.init();
        const schemaData = await sqliteService.getSchema();
        setSchemas(schemaData);

        // Kiểm tra server health
        fetch('/api/health')
          .then(res => res.json())
          .then(data => setHasAiKey(data.hasGeminiKey))
          .catch(() => setHasAiKey(false));
      } catch (err) {
        console.error('Lỗi khởi động SQLite WASM:', err);
      }
    }
    setupDb();
  }, []);

  // Đổi bài tập
  const handleSelectChallenge = (id: string) => {
    setCurrentChallengeId(id);
    localStorage.setItem('sql_master_current', id);
    const target = CHALLENGES.find(c => c.id === id);
    if (target) {
      setUserSql(target.initialSql);
      setResult(null);
      setError(null);
      setAiExplanation(null);
    }
  };

  const handleNextChallenge = () => {
    if (currentChallengeIndex < CHALLENGES.length - 1) {
      handleSelectChallenge(CHALLENGES[currentChallengeIndex + 1].id);
    }
  };

  const handlePrevChallenge = () => {
    if (currentChallengeIndex > 0) {
      handleSelectChallenge(CHALLENGES[currentChallengeIndex - 1].id);
    }
  };

  // Thực thi truy vấn SQL (Client-side WASM)
  const handleExecuteQuery = async () => {
    if (!userSql.trim() || isExecuting) return;

    setIsExecuting(true);
    setError(null);

    const startTime = Date.now();

    try {
      const res = await sqliteService.executeQuery(userSql);
      setResult(res);

      // Cập nhật lại lược đồ phòng khi người dùng chạy DDL / DML
      const updatedSchemas = await sqliteService.getSchema();
      setSchemas(updatedSchemas);

      // Lưu lịch sử
      const historyEntry: HistoryItem = {
        id: String(Date.now()),
        sql: userSql.trim(),
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        success: true,
        rowCount: res.rowCount,
        durationMs: res.executionTimeMs,
      };
      setHistory(prev => [historyEntry, ...prev.slice(0, 49)]);
    } catch (err: any) {
      const duration = Date.now() - startTime;
      const errorMsg = err?.message || String(err);
      setError(errorMsg);
      setResult(null);

      const historyEntry: HistoryItem = {
        id: String(Date.now()),
        sql: userSql.trim(),
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        success: false,
        rowCount: 0,
        durationMs: duration,
        error: errorMsg,
      };
      setHistory(prev => [historyEntry, ...prev.slice(0, 49)]);
    } finally {
      setIsExecuting(false);
    }
  };

  // Chấm điểm và nộp bài tập
  const handleCheckSolution = async () => {
    if (!userSql.trim() || isChecking) return;

    setIsChecking(true);
    setError(null);

    try {
      const checkRes = await sqliteService.checkSolution(userSql, currentChallenge.solutionSql);

      if (checkRes.userResult) {
        setResult(checkRes.userResult);
      }
      if (checkRes.expectedResult) {
        setExpectedResult(checkRes.expectedResult);
      }

      if (checkRes.isCorrect) {
        if (!completedChallenges.includes(currentChallenge.id)) {
          const updated = [...completedChallenges, currentChallenge.id];
          setCompletedChallenges(updated);
          localStorage.setItem('sql_master_completed', JSON.stringify(updated));
        }
        setIsSuccessModalOpen(true);
      } else {
        setError(checkRes.feedback);
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi kiểm tra kết quả.');
    } finally {
      setIsChecking(false);
    }
  };

  // Nhờ AI giải thích câu lệnh SQL
  const handleExplainSql = async () => {
    if (!userSql.trim() || isExplaining) return;

    setIsExplaining(true);
    setAiExplanation(null);

    try {
      const schemaCtx = await sqliteService.getSchemaContextString();
      const res = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: userSql,
          schemaInfo: schemaCtx,
          context: isSandboxMode ? 'Sandbox Mode' : currentChallenge.title,
        }),
      });

      const data = await res.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation('Không thể tạo phân tích vào lúc này. Vui lòng thử lại sau.');
      }
    } catch (err: any) {
      setAiExplanation(`Lỗi kết nối AI: ${err?.message || 'Không thể liên lạc máy chủ.'}`);
    } finally {
      setIsExplaining(false);
    }
  };

  // Nhờ AI chẩn đoán lỗi
  const handleDiagnoseError = async () => {
    if (!error || isDiagnosing) return;

    setIsDiagnosing(true);
    try {
      const schemaCtx = await sqliteService.getSchemaContextString();
      const res = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: userSql,
          error,
          schemaInfo: schemaCtx,
          challengePrompt: isSandboxMode ? 'Sandbox Tự Do' : currentChallenge.task,
        }),
      });

      const data = await res.json();
      if (data.diagnosis) {
        setAiExplanation(data.diagnosis);
      }
    } catch (err: any) {
      setAiExplanation(`Lỗi kết nối AI chẩn đoán: ${err?.message || 'Không thể liên lạc máy chủ.'}`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Chạy EXPLAIN QUERY PLAN
  const handleExplainPlan = async () => {
    if (!userSql.trim()) return;
    try {
      const planRes = await sqliteService.explainQueryPlan(userSql);
      setResult(planRes);
      setError(null);
    } catch (err: any) {
      setError(`Lỗi khi tạo Kế hoạch thực thi: ${err?.message || String(err)}`);
    }
  };

  // Khôi phục CSDL ban đầu
  const handleResetDatabase = async () => {
    const confirmReset = window.confirm(
      'Bạn có chắc chắn muốn đặt lại cơ sở dữ liệu về trạng thái mẫu ban đầu? Toàn bộ các thay đổi DDL/DML sẽ được làm mới.'
    );
    if (!confirmReset) return;

    try {
      await sqliteService.resetDatabase();
      const updatedSchemas = await sqliteService.getSchema();
      setSchemas(updatedSchemas);
      setResult(null);
      setError(null);
      alert('Đã khôi phục cơ sở dữ liệu mẫu thành công!');
    } catch (err) {
      console.error('Lỗi reset DB:', err);
    }
  };

  // Xuất file database nhị phân (.db)
  const handleExportDatabase = () => {
    const binary = sqliteService.exportDatabaseBinary();
    if (!binary) return;

    const blob = new Blob([binary as unknown as BlobPart], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sql_master_database.db';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Split-screen Resizer Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const windowWidth = window.innerWidth;
      const newPercent = Math.min(Math.max((moveEvent.clientX / windowWidth) * 100, 25), 70);
      setLeftWidthPercent(newPercent);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const previewSchema = schemas.find(s => s.name === previewTable) || null;
  const tableNames = schemas.map(s => s.name);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      
      {/* 1. Header Navigation Bar */}
      <Header
        currentChallengeId={currentChallengeId}
        onSelectChallenge={handleSelectChallenge}
        completedChallenges={completedChallenges}
        totalXp={totalXp}
        isSandboxMode={isSandboxMode}
        onToggleSandbox={(sandbox) => {
          setIsSandboxMode(sandbox);
          if (sandbox) {
            setUserSql('-- Chế độ Sandbox Tự Do\n-- Thử viết bất kỳ câu lệnh SQL nào:\nSELECT * FROM khach_hang LIMIT 10;');
          } else {
            setUserSql(currentChallenge.initialSql);
          }
        }}
        onResetDatabase={handleResetDatabase}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        onOpenDeployment={() => setIsDeploymentGuideOpen(true)}
        onExportDatabase={handleExportDatabase}
        hasAiKey={hasAiKey}
      />

      {/* 2. Split Screen Main Body */}
      <main className="flex-1 flex overflow-hidden p-2 sm:p-3 gap-2 sm:gap-3">
        
        {/* LEFT PANEL: Lý thuyết, Đề bài & Lược đồ CSDL */}
        <div 
          style={{ width: `${leftWidthPercent}%` }}
          className="h-full flex flex-col shrink-0 min-w-[280px]"
        >
          <LeftPanel
            challenge={currentChallenge}
            schemas={schemas}
            onSelectColumn={(col) => setUserSql(prev => prev + (prev ? ' ' : '') + col)}
            onSelectTable={(tbl) => setUserSql(prev => prev + (prev ? ' ' : '') + tbl)}
            onPreviewTable={(tbl) => setPreviewTable(tbl)}
            onNextChallenge={handleNextChallenge}
            onPrevChallenge={handlePrevChallenge}
            hasNext={currentChallengeIndex < CHALLENGES.length - 1}
            hasPrev={currentChallengeIndex > 0}
            isCompleted={completedChallenges.includes(currentChallenge.id)}
            userSql={userSql}
          />
        </div>

        {/* Resizable Divider Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1.5 hover:w-2 -mx-1 bg-slate-800/80 hover:bg-sky-500 rounded cursor-col-resize transition-all duration-150 flex items-center justify-center group select-none shrink-0"
          title="Kéo sang trái/phải để điều chỉnh độ rộng màn hình"
        >
          <div className="w-0.5 h-6 bg-slate-600 group-hover:bg-white rounded" />
        </div>

        {/* RIGHT PANEL: SQL Editor + Result Table / AI Insights */}
        <div className="flex-1 flex flex-col h-full gap-2 sm:gap-3 overflow-hidden min-w-[340px]">
          
          {/* Top Half: Interactive SQL Editor */}
          <div className="h-[48%] shrink-0">
            <SqlEditor
              value={userSql}
              onChange={setUserSql}
              onExecute={handleExecuteQuery}
              onCheckSolution={handleCheckSolution}
              onExplain={handleExplainSql}
              onExplainPlan={handleExplainPlan}
              onResetCode={() => setUserSql(isSandboxMode ? 'SELECT * FROM khach_hang;' : currentChallenge.initialSql)}
              isExecuting={isExecuting}
              isChecking={isChecking}
              isExplaining={isExplaining}
              isSandboxMode={isSandboxMode}
              tableNames={tableNames}
            />
          </div>

          {/* Bottom Half: Tabbed Query Results, AI Insights, History & Chat */}
          <div className="flex-1 overflow-hidden">
            <ResultPanel
              result={result}
              expectedResult={expectedResult}
              error={error}
              isExecuting={isExecuting}
              aiExplanation={aiExplanation}
              isExplaining={isExplaining}
              onDiagnoseError={handleDiagnoseError}
              isDiagnosing={isDiagnosing}
              history={history}
              onLoadHistorySql={(sql) => setUserSql(sql)}
              currentSql={userSql}
              schemaInfo={schemas.map(s => `${s.name}(${s.columns.map(c => c.name).join(', ')})`).join('\n')}
            />
          </div>

        </div>

      </main>

      {/* 3. Modal Tra cứu Cú pháp (Cheat Sheet) */}
      <CheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />

      {/* 4. Modal Hướng dẫn Triển khai & CDN */}
      <DeploymentGuideModal
        isOpen={isDeploymentGuideOpen}
        onClose={() => setIsDeploymentGuideOpen(false)}
      />

      {/* 4. Modal Xem Dữ liệu Mẫu Bảng CSDL */}
      <SampleDataModal
        isOpen={!!previewTable}
        onClose={() => setPreviewTable(null)}
        tableName={previewTable}
        schema={previewSchema}
      />

      {/* 5. Modal Chúc mừng Thử thách Hoàn thành */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onNext={handleNextChallenge}
        hasNext={currentChallengeIndex < CHALLENGES.length - 1}
        xpEarned={currentChallenge.xp}
        challengeTitle={currentChallenge.title}
      />

    </div>
  );
}
