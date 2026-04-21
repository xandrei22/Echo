/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Target, 
  Activity, 
  Command, 
  ChevronRight, 
  Menu, 
  X, 
  Sparkles,
  Focus,
  Brain,
  Calendar,
  Layers,
  LogOut,
  LogIn,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
  Settings
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { auth, googleProvider, signInWithPopup, onAuthStateChanged, User } from "./lib/firebase";
import { dbService, Task } from "./services/dbService";

// Initialization of Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [context, setContext] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);

  const categories = ["Work", "Personal", "Fitness", "Design", "Research"];
  const filteredTasks = selectedCategory 
    ? tasks.filter(t => t.category === selectedCategory) 
    : tasks;

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        dbService.ensureUserDoc(user.uid, user.email || '', user.displayName || 'Architect');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const unsubTasks = dbService.subscribeTasks(currentUser.uid, (data) => {
        setTasks(data);
      });
      const unsubLogs = dbService.subscribeLogs(currentUser.uid, (logs) => fetchContext(logs));
      return () => {
        unsubTasks();
        unsubLogs();
      };
    }
  }, [currentUser]);

  async function fetchContext(logs: any[]) {
    try {
      const res = await fetch("/api/context");
      const data = await res.json();
      setContext({ ...data, history: logs });
    } catch (err) {
      console.error("Failed to fetch context", err);
    }
  }

  async function handleLogin() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed", err);
    }
  }

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-echo-light">
      <Activity className="w-8 h-8 text-echo-accent animate-spin" />
    </div>
  );

  if (!currentUser) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-echo-light p-6 overflow-hidden relative">
        {/* Background Accents */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-echo-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-echo-accent/5 rounded-full blur-[100px]" />

        <div className="flex items-center gap-4 mb-20 z-10">
          <div className="w-16 h-16 bg-echo-accent rounded-3xl flex items-center justify-center shadow-2xl shadow-echo-accent/40 rotate-3">
            <Activity className="text-white w-9 h-9" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter leading-none">ECHO</h1>
            <p className="text-echo-accent font-bold uppercase tracking-[0.3em] text-[10px] mt-1">Smart Life Engine</p>
          </div>
        </div>

        <div className="card max-w-md w-full text-center relative z-10 border-2 border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Focus starts here.</h2>
          <p className="text-echo-muted mb-10 text-lg">ECHO matches your tasks to your energy using predictive AI.</p>
          
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-4 bg-echo-accent text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-echo-accent/30 mb-6"
          >
            <LogIn className="w-5 h-5" />
            Get Started
          </button>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2 text-echo-muted text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-echo-accent" />
              Powered by AI & Secure Cloud
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-echo-light text-echo-dark overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <motion.aside 
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        className="bg-white border-r border-echo-border flex flex-col z-30 shadow-sm relative shrink-0 overflow-hidden"
      >
        <div className="p-6 h-20 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-echo-accent rounded-xl flex items-center justify-center shadow-lg shadow-echo-accent/20 rotate-3">
                  <Activity className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter leading-none">ECHO</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-echo-nav-hover rounded-xl text-echo-muted transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-8 mt-4 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            <SidebarItem 
              icon={<Layers className="w-5 h-5" />} 
              label="Dashboard" 
              active={activeTab === "dashboard"} 
              collapsed={isSidebarCollapsed}
              onClick={() => { setActiveTab("dashboard"); setSelectedCategory(null); }}
            />
            <SidebarItem 
              icon={<Activity className="w-5 h-5" />} 
              label="Task Hub" 
              active={activeTab === "tasks"} 
              collapsed={isSidebarCollapsed}
              onClick={() => { setActiveTab("tasks"); setSelectedCategory(null); }}
            />
            <SidebarItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Settings" 
              active={activeTab === "settings"} 
              collapsed={isSidebarCollapsed}
              onClick={() => setActiveTab("settings")}
            />
          </div>

          {!isSidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-echo-muted px-4">Categories</span>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setActiveTab("tasks"); }}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-echo-accent/5 text-echo-accent' : 'text-echo-muted hover:bg-echo-nav-hover'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedCategory === cat ? 'bg-echo-accent' : 'bg-echo-border'}`} />
                      {cat}
                    </div>
                    <span className="text-[10px] opacity-40">{tasks.filter(t => t.category === cat).length}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </nav>

        <div className="p-6 border-t border-echo-border bg-echo-nav-hover/30">
          <div className={`flex items-center gap-3 overflow-hidden ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-echo-accent text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-echo-accent/20 shrink-0">
              {currentUser.displayName?.[0]}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black truncate">{currentUser.displayName}</div>
                <button onClick={() => auth.signOut()} className="text-[10px] text-red-500 font-black uppercase tracking-widest hover:underline">Logout</button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-echo-light relative overflow-x-hidden">
        <header className="h-20 border-b border-echo-border bg-white/80 backdrop-blur-md flex items-center justify-between px-10 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
             <h2 className="text-sm font-black uppercase tracking-widest text-echo-muted">
               {selectedCategory ? `Categories / ${selectedCategory}` : activeTab === 'dashboard' ? 'Overview' : activeTab.toUpperCase()}
             </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
               <span className="text-[10px] font-black uppercase text-echo-muted">Daily Momentum</span>
               <div className="flex items-center gap-3">
                 <div className="h-1.5 w-32 bg-echo-border rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: `${progressPercent}%` }} 
                      className="h-full bg-echo-accent shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                    />
                 </div>
                 <span className="text-xs font-black">{Math.round(progressPercent)}%</span>
               </div>
            </div>
            <div className="w-px h-8 bg-echo-border mx-2" />
            <button className="p-2 hover:bg-echo-nav-hover rounded-xl text-echo-muted relative"><Zap className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="p-10 max-w-7xl w-full mx-auto space-y-12 pb-32">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <PredictiveInsightSummary context={context} tasks={tasks} onHighlightTask={setHighlightedTaskId} />
                    <div className="bg-white rounded-[32px] p-10 border border-echo-border shadow-sm">
                       <TaskHubPreview userId={currentUser.uid} tasks={tasks} context={context} highlightedTaskId={highlightedTaskId} />
                    </div>
                  </div>
                  <div className="space-y-8">
                    <AIConsultationSection onActionGenerated={() => dbService.createLog(currentUser.uid, 90, 85)} />
                    <EnergyCurveWidget history={context?.history} />
                  </div>
                </section>
              </motion.div>
            ) : activeTab === 'tasks' ? (
              <motion.div key="tasks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
                  <div className="max-w-xl">
                    <h1 className="text-5xl font-black tracking-tighter leading-tight">{selectedCategory || "Registry"} Hub</h1>
                    <p className="text-echo-muted mt-4 text-xl font-medium">Refining and managing your cognitive intents.</p>
                  </div>
                </div>
                <div className="bg-white rounded-[40px] p-12 border border-echo-border shadow-xl">
                  <TaskCreator userId={currentUser.uid} categories={categories} />
                  <div className="mt-16 space-y-4">
                    {filteredTasks.map(task => (
                      <div key={task.id}>
                        <TaskRow 
                          task={task} 
                          userId={currentUser.uid} 
                          context={context} 
                          isHighlighted={highlightedTaskId === task.id} 
                        />
                      </div>
                    ))}
                    {filteredTasks.length === 0 && <EmptyState />}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="other" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-40 bg-white rounded-[40px] border border-echo-border border-dashed">
                <div className="text-center">
                  <Settings className="w-16 h-16 text-echo-border mx-auto mb-6" />
                  <h3 className="text-2xl font-black">{activeTab.toUpperCase()} System</h3>
                  <p className="text-echo-muted mt-2 font-medium">Module under development. Calibrating logic units...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, collapsed, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${active ? 'bg-echo-accent text-white shadow-xl shadow-echo-accent/20' : 'text-echo-muted hover:bg-echo-nav-hover hover:text-echo-dark'}`}
    >
      <div className="shrink-0">{icon}</div>
      {!collapsed && <span className="font-bold text-sm tracking-tight">{label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-echo-dark text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-32 bg-echo-nav-hover/30 rounded-[32px] border-2 border-dashed border-echo-border">
      <Sparkles className="w-12 h-12 text-echo-border mx-auto mb-6" />
      <p className="text-echo-muted font-bold text-sm">No tasks found. Begin your journey by defining a cognitive goal.</p>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-echo-light p-6 overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-echo-accent/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-echo-accent/5 rounded-full blur-[100px]" />

      <div className="flex items-center gap-4 mb-20 z-10">
        <div className="w-16 h-16 bg-echo-accent rounded-3xl flex items-center justify-center shadow-2xl shadow-echo-accent/40 rotate-3">
          <Activity className="text-white w-9 h-9" />
        </div>
        <div>
          <h1 className="text-5xl font-black tracking-tighter leading-none">ECHO</h1>
          <p className="text-echo-accent font-bold uppercase tracking-[0.3em] text-[10px] mt-1">Smart Life Engine</p>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[40px] max-w-md w-full text-center relative z-10 border border-echo-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]">
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Focus starts here.</h2>
        <p className="text-echo-muted mb-10 text-lg">Predictive orchestration for your deep work state.</p>
        <button 
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-4 bg-echo-accent text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-echo-accent/30 mb-6"
        >
          <LogIn className="w-5 h-5" />
          Synchronize Identity
        </button>
      </div>
    </div>
  );
}

function TaskCreator({ userId, categories }: { userId: string, categories: string[] }) {
  const [title, setTitle] = useState("");
  const [energy, setEnergy] = useState("med");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      await dbService.createTask(userId, title, energy as any, priority as any, category, dueDate);
      setTitle("");
      setExpanded(false);
    } catch (err) {
      console.error("Cloud Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-echo-nav-hover/30 p-2 rounded-[32px] border border-echo-border focus-within:border-echo-accent/40 focus-within:bg-white transition-all">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={title}
            onFocus={() => setExpanded(true)}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs cognitive resolution?"
            className="flex-1 bg-transparent px-6 py-4 text-lg font-bold focus:outline-none placeholder:text-echo-muted/40"
          />
          {!expanded && (
             <button type="submit" disabled={!title} className="p-4 bg-echo-dark text-white rounded-2xl hover:bg-echo-accent transition-all disabled:opacity-20"><ChevronRight className="w-6 h-6" /></button>
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pb-6 pt-4 border-t border-echo-border mt-2 space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-echo-muted px-1">Energy</label>
                  <select value={energy} onChange={(e) => setEnergy(e.target.value)} className="w-full bg-white border border-echo-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-echo-accent/20">
                    <option value="low">Low</option>
                    <option value="med">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-echo-muted px-1">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-white border border-echo-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-echo-accent/20">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-echo-muted px-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white border border-echo-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-echo-accent/20">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-echo-muted px-1">Deadline</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-white border border-echo-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-echo-accent/20" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setExpanded(false)} className="px-6 py-3 text-xs font-black uppercase text-echo-muted">Cancel</button>
                <button type="submit" disabled={loading || !title} className="bg-echo-accent text-white px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-echo-accent/20 transition-all hover:scale-105">
                  {loading ? "Encrypting..." : "Commit Intent"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

function TaskRow({ task, userId, context, isHighlighted }: { task: Task, userId: string, context: any, isHighlighted?: boolean }) {
  const isCompleted = task.status === 'completed';
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group flex items-center gap-6 p-6 rounded-[32px] border transition-all relative overflow-hidden ${isCompleted ? 'bg-echo-nav-hover/50 border-echo-border opacity-60' : 'bg-white hover:border-echo-accent hover:shadow-2xl hover:shadow-echo-accent/5'} ${isHighlighted ? 'ring-2 ring-echo-accent ring-offset-4' : 'border-echo-border shadow-sm'}`}
    >
      <button 
        onClick={() => dbService.toggleTaskStatus(userId, task.id!, task.status)}
        className={`w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 ${isCompleted ? 'bg-green-500 border-green-500' : 'border-echo-border group-hover:border-echo-accent'}`}
      >
        {isCompleted && <Target className="w-5 h-5 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h4 className={`text-lg font-black tracking-tight truncate ${isCompleted ? 'line-through text-echo-muted' : ''}`}>{task.title}</h4>
          <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${task.priority === 'high' ? 'bg-red-50 text-red-500 border-red-100' : task.priority === 'low' ? 'bg-blue-50 text-blue-500 border-blue-100' : 'bg-echo-accent/5 text-echo-accent border-echo-accent/10'}`}>
            {task.priority || 'Medium'}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-echo-muted tracking-widest">
            <Layers className="w-3 h-3" />
            {task.category || 'General'}
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-500 tracking-widest">
              <Clock className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-echo-accent tracking-widest">
            <Zap className="w-3 h-3" />
            {task.energy} Energy
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); dbService.deleteTask(userId, task.id!); }}
          className="p-3 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-2xl transition-all"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {isHighlighted && !isCompleted && (
        <div className="absolute top-0 right-10 bottom-0 flex items-center">
           <span className="px-3 py-1 bg-echo-accent text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">AI Recommendation</span>
        </div>
      )}
    </motion.div>
  );
}

function TaskHubPreview({ userId, tasks, context, highlightedTaskId }: { userId: string, tasks: Task[], context: any, highlightedTaskId: string | null }) {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-echo-accent font-black text-[10px] uppercase tracking-widest">Active Registry</span>
          <h3 className="text-2xl font-bold tracking-tight">Your Tasks & Intents</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-xl">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-green-700 font-bold uppercase tracking-widest text-center">Connected</span>
        </div>
      </div>
      
      <TaskCreator userId={userId} categories={["Work", "Personal", "Fitness", "Design", "Research"]} />

      <div className="space-y-3 mt-8">
        {tasks.slice(0, 5).map(task => (
          <div key={task.id}>
            <TaskRow 
              task={task} 
              userId={userId} 
              context={context} 
              isHighlighted={highlightedTaskId === task.id} 
            />
          </div>
        ))}
        {tasks.length > 5 && (
           <p className="text-center text-[10px] text-echo-muted uppercase font-black tracking-[0.2em] pt-4"> +{tasks.length - 5} More in Task Hub</p>
        )}
        {tasks.length === 0 && <EmptyState />}
      </div>
    </>
  );
}


function SecurityAuditCard() {
  const securityFeatures = [
    { label: "WAF Filtering", status: "Active" },
    { label: "Input Sanitization", status: "Enabled" },
    { label: "Rate Limiting", status: "100 req/15min" },
    { label: "CSP Policy", status: "Strict" }
  ];

  return (
    <div className="rounded-[32px] bg-echo-dark text-white border border-white/5 shadow-xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <Target className="text-echo-accent w-6 h-6" />
        <span className="label text-echo-light/80">Security Protocol</span>
      </div>
      <div className="space-y-6">
        {securityFeatures.map(f => (
          <div key={f.label} className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-xs opacity-60 font-semibold uppercase">{f.label}</span>
            <span className="text-xs font-mono text-echo-accent">{f.status}</span>
          </div>
        ))}
      </div>
      <button className="w-full mt-8 py-3 bg-echo-accent/20 border border-echo-accent text-echo-accent rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-echo-accent hover:text-white transition-all">
        Run Compliance Check
      </button>
    </div>
  );
}

function PredictiveInsightSummary({ context, tasks, onHighlightTask }: { context: any, tasks: any[], onHighlightTask: (taskId: string | null) => void }) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (context && tasks.length > 0) {
      generateInsight();
    }
  }, [context, tasks.length]);

  async function generateInsight() {
    setLoading(true);
    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Context: Energy is ${context?.prediction?.energy || 'normal'}. 
        Pending tasks: ${tasks.filter(t => t.status !== 'completed').map(t => t.id + ':' + t.title).join(', ')}.
        Action: Synthesize a predictive, direct behavioral nudge. 
        MANDATORY: You MUST recommend a specific task from the list.
        FORMAT: Return a JSON object with: { "text": "The nudge text mentioning the task", "recommendedTaskId": "The exact ID of the task you recommended" }
        Tone: High-end SaaS, direct, 15 words max.`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(result.text || "{}");
      setInsight(data.text || "Synchronizing with your behavioral patterns...");
      onHighlightTask(data.recommendedTaskId || null);
    } catch (e) {
      setInsight("Optimization logic calibrating...");
      onHighlightTask(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[32px] bg-echo-dark text-echo-light shadow-2xl relative overflow-hidden group min-h-[160px] flex flex-col justify-center border border-white/10 p-8"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all duration-700">
        <Sparkles className="w-32 h-32 rotate-12 text-echo-accent" />
      </div>
      
      {/* Decorative Glow */}
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-echo-accent/20 rounded-full blur-[80px]" />

      <div className="relative z-10 p-2">
        <div className="flex items-center gap-2 mb-4">
          <span className="label text-echo-accent uppercase tracking-widest font-bold text-[10px] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-echo-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-echo-accent"></span>
            </span>
            ECHO Behavioral Result
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        {loading ? (
          <div className="space-y-4">
            <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
          </div>
        ) : (
          <h2 className="text-xl md:text-2xl font-medium mb-2 tracking-tight leading-snug">
            {insight?.split(/('[^']+')/).map((part, i) => 
              part.startsWith("'") ? <span key={i} className="text-echo-accent font-bold italic underline underline-offset-4 decoration-echo-accent/30">{part}</span> : part
            )}
          </h2>
        )}
      </div>
    </motion.div>
  );
}

function EnergyCurveWidget({ history }: { history?: any[] }) {
  const defaultCurve = [20, 45, 70, 90, 85, 30, 60, 40, 20];
  const displayCurve = history && history.length > 0 
    ? [...defaultCurve.slice(history.length), ...history.map(l => l.energy)].slice(-9)
    : defaultCurve;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-1">
        <span className="label">Observed Biometrics</span>
        <span className="text-[8px] text-echo-accent font-bold uppercase tracking-widest">Live Sync</span>
      </div>
      <div className="mt-8 flex items-end gap-1.5 h-32 px-2">
        {displayCurve.map((h, i) => (
          <motion.div 
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            className={`w-full rounded-t-lg ${h > 80 ? 'bg-echo-accent shadow-[0_0_12px_rgba(99,102,241,0.4)]' : h > 50 ? 'bg-echo-accent/40' : 'bg-echo-nav-hover'}`}
          />
        ))}
      </div>
      <p className="text-[10px] text-echo-muted mt-6 text-center font-bold tracking-widest uppercase italic opacity-70">
        AI Projecting: <span className="text-echo-accent not-italic">Hyper-focus window imminent</span>
      </p>
    </div>
  );
}

function ProblemSolutionSection() {
  return (
    <section className="py-20 border-t border-echo-border">
      <div className="grid md:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-8">Digital fragmentation meets its match.</h2>
          <div className="space-y-6 text-echo-muted leading-relaxed">
            <p>ECHO solves the "context switching" crisis by acting as a Cognitive Layer between you and the noise, predicting what you need before you reach for a distraction.</p>
          </div>
          <button className="mt-10 flex items-center gap-2 group text-echo-accent font-bold text-sm uppercase tracking-widest">
            Explore Architecture
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        <div className="card bg-echo-accent text-white flex items-center justify-center py-16 shadow-xl shadow-echo-accent/20">
          <Zap className="w-20 h-20" />
        </div>
      </div>
    </section>
  );
}

function FeatureBento() {
  const features = [
    { title: "Adaptive Focus", desc: "UI morphs based on intent.", icon: <Focus />, tag: "Dynamics" },
    { title: "Energy Prediction", desc: "Suggests task timing.", icon: <Zap />, tag: "Intelligence" },
    { title: "Intentional Inbox", desc: "Reflection-gate filtering.", icon: <Layers />, tag: "Psychology" },
    { title: "Momentum Engine", desc: "Smart micro-reminders.", icon: <Sparkles />, tag: "Automation" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((f, i) => (
        <div key={i} className="card hover:shadow-md cursor-pointer group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 bg-echo-nav-hover text-echo-accent rounded-xl flex items-center justify-center transition-colors group-hover:bg-echo-accent group-hover:text-white">
              {f.icon}
            </div>
            <span className="label opacity-50">{f.tag}</span>
          </div>
          <h4 className="text-lg font-bold mb-2 tracking-tight">{f.title}</h4>
          <p className="text-sm text-echo-muted mt-4 p-4 bg-echo-light rounded-xl border border-transparent group-hover:border-echo-border transition-all">
            {f.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

function AIConsultationSection({ onActionGenerated }: { onActionGenerated: (action: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleConsult() {
    if (!prompt) return;
    setLoading(true);
    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are the ECHO AI, a predictive life engine. The user feels: "${prompt}". Suggest a "Momentum Action" – a tiny, frictionless step they can take right now to align with their deep intentions. Respond with a short, punchy, high-end startup vibe. Format as JSON: { "action": "...", "logic": "..." }`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(result.text || "{}");
      setResponse(data);
      if (data.action) onActionGenerated(data.action);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card bg-echo-surface border-2 border-echo-accent/20">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="text-echo-accent w-6 h-6" />
        <span className="label text-echo-dark">Intelligence Interface</span>
      </div>
      
      <p className="text-sm text-echo-muted mb-6">Enter your current state to synchronize context.</p>
      
      <div className="relative mb-6">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Current vibe..."
          className="w-full bg-echo-nav-hover border border-echo-border font-medium px-5 py-4 rounded-xl focus:outline-none focus:border-echo-accent focus:ring-1 focus:ring-echo-accent transition-all text-sm placeholder:text-echo-muted/50"
        />
      </div>
      
      <button 
        onClick={handleConsult}
        disabled={loading}
        className="w-full bg-echo-accent text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-echo-accent/20 hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {loading ? "Calibrating..." : "Synchronize Focus"}
      </button>

      <AnimatePresence>
        {response && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-6 bg-echo-dark text-white rounded-2xl border-l-[6px] border-echo-accent shadow-xl"
          >
            <div className="text-[10px] uppercase font-bold tracking-widest mb-2 text-echo-accent/80">Momentum Action</div>
            <div className="text-lg font-bold leading-tight mb-3">{(response as any).action}</div>
            <div className="text-xs text-echo-light/50 italic font-medium leading-relaxed">{(response as any).logic}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Footer() {
  return (
    <footer className="py-20 border-t border-echo-border flex flex-col md:flex-row justify-between items-center gap-8 text-echo-muted">
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-echo-accent" />
        <span className="text-xs font-bold uppercase tracking-widest">© 2026 Echo Systems</span>
      </div>
      <div className="flex gap-10">
        {["Privacy", "Ethics", "Whitepaper"].map(l => (
          <button key={l} className="text-xs font-bold uppercase tracking-widest hover:text-echo-dark transition-colors">{l}</button>
        ))}
      </div>
    </footer>
  );
}
