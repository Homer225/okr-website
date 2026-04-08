import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Edit3, 
  Trash2,
  Calendar,
  BarChart3,
  ChevronRight,
  Save,
  X
} from 'lucide-react';

// --- 类型定义 ---
interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

interface Objective {
  id: string;
  title: string;
  description: string;
  category: 'growth' | 'project' | 'operation' | 'innovation';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: 'on_track' | 'at_risk' | 'delayed' | 'completed';
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

// --- 配置与模拟数据 ---
const INITIAL_OBJECTIVES: Objective[] = [
  {
    id: '1',
    title: 'Q2 产品功能迭代',
    description: '完成核心模块的重构与新功能开发，提升系统稳定性',
    category: 'project',
    targetValue: 100,
    currentValue: 65,
    unit: '%',
    deadline: '2026-06-30',
    status: 'on_track',
    milestones: [
      { id: 'm1', title: '需求评审完成', completed: true, dueDate: '2026-04-01' },
      { id: 'm2', title: '技术方案确定', completed: true, dueDate: '2026-04-10' },
    ],
    createdAt: '2026-03-01',
    updatedAt: '2026-04-08',
  }
];

const CATEGORIES = {
  growth: { label: '个人成长', color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  project: { label: '项目交付', color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-700' },
  operation: { label: '运营优化', color: 'bg-amber-500', lightColor: 'bg-amber-50', textColor: 'text-amber-700' },
  innovation: { label: '创新探索', color: 'bg-purple-500', lightColor: 'bg-purple-50', textColor: 'text-purple-700' },
};

const STATUS_CONFIG = {
  on_track: { label: '正常推进', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  at_risk: { label: '存在风险', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertCircle },
  delayed: { label: '已延期', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: Clock },
  completed: { label: '已完成', color: 'bg-slate-100 text-slate-800 border-slate-200', icon: CheckCircle2 },
};

// --- 主应用组件 ---
export default function OKRDashboard() {
  const [objectives, setObjectives] = useState<Objective[]>(() => {
    const saved = localStorage.getItem('okr-data');
    return saved ? JSON.parse(saved) : INITIAL_OBJECTIVES;
  });
  
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // 同步本地存储
  useEffect(() => {
    localStorage.setItem('okr-data', JSON.stringify(objectives));
  }, [objectives]);

  // 计算统计数据
  const stats = {
    total: objectives.length,
    completed: objectives.filter(o => o.status === 'completed').length,
    onTrack: objectives.filter(o => o.status === 'on_track').length,
    atRisk: objectives.filter(o => o.status === 'at_risk' || o.status === 'delayed').length,
    avgProgress: objectives.length > 0 
      ? Math.round(objectives.reduce((acc, o) => acc + (o.currentValue / o.targetValue) * 100, 0) / objectives.length)
      : 0,
  };

  const handleUpdateProgress = (id: string, newValue: number) => {
    setObjectives(prev => prev.map(obj => 
      obj.id === id ? { 
        ...obj, 
        currentValue: newValue,
        updatedAt: new Date().toISOString(),
        status: newValue >= obj.targetValue ? 'completed' : obj.status
      } : obj
    ));
    setLastUpdated(new Date());
  };

  const handleAddObjective = (newObjective: any) => {
    const objective: Objective = {
      ...newObjective,
      id: Date.now().toString(),
      milestones: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setObjectives([...objectives, objective]);
    setShowAddModal(false);
    setLastUpdated(new Date());
  };

  const handleDeleteObjective = (id: string) => {
    if (window.confirm('确定要删除这个目标吗？')) {
      setObjectives(prev => prev.filter(o => o.id !== id));
      if (selectedObjective?.id === id) setSelectedObjective(null);
      setLastUpdated(new Date());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-lg shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-900 to-slate-800 bg-clip-text text-transparent">
                工作目标追踪
              </h1>
              <p className="text-xs text-slate-500">实时更新 • 个人管理系统</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">最后更新</p>
              <p className="text-sm font-medium text-slate-700">{lastUpdated.toLocaleTimeString()}</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>新建目标</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="总目标数" value={stats.total} icon={Target} color="indigo" />
          <StatCard title="已完成" value={stats.completed} icon={CheckCircle2} color="emerald" />
          <StatCard title="需关注" value={stats.atRisk} icon={AlertCircle} color="amber" />
          <StatCard title="平均进度" value={`${stats.avgProgress}%`} icon={TrendingUp} color="blue" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧列表 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                目标概览
              </h2>
            </div>

            <div className="space-y-4">
              {objectives.map(objective => (
                <ObjectiveCard 
                  key={objective.id}
                  objective={objective}
                  onClick={() => setSelectedObjective(objective)}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
              {objectives.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                  <p className="text-slate-400">暂无目标，点击右上角新建一个吧</p>
                </div>
              )}
            </div>
          </div>

          {/* 右侧详情 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {selectedObjective ? (
                <DetailPanel 
                  objective={selectedObjective}
                  onClose={() => setSelectedObjective(null)}
                  onUpdate={handleUpdateProgress}
                  onDelete={handleDeleteObjective}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">选择目标查看详情</h3>
                  <p className="text-slate-500 text-sm">点击左侧卡片查看里程碑和更新记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showAddModal && (
        <AddObjectiveModal 
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddObjective}
        />
      )}
    </div>
  );
}

// --- 子组件 ---

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorMap: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500">{title}</div>
    </div>
  );
}

function ObjectiveCard({ objective, onClick, onUpdateProgress }: any) {
  const progress = objective.targetValue > 0 ? (objective.currentValue / objective.targetValue) * 100 : 0;
  const category = CATEGORIES[objective.category as keyof typeof CATEGORIES];
  const status = STATUS_CONFIG[objective.status as keyof typeof STATUS_CONFIG];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden" onClick={onClick}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className={`w-1 h-10 rounded-full ${category.color}`} />
            <div>
              <h3 className="font-bold text-slate-900 mb-1">{objective.title}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.color} flex items-center gap-1 w-fit`}>
                <status.icon className="w-3 h-3" />{status.label}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">进度: {objective.currentValue}{objective.unit}</span>
            <span className="font-bold text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${category.color}`} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-5 py-2 border-t border-slate-100 flex justify-end gap-2" onClick={e => e.stopPropagation()}>
        <button onClick={() => onUpdateProgress(objective.id, Math.max(0, objective.currentValue - 1))} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded hover:bg-indigo-50">-</button>
        <button onClick={() => onUpdateProgress(objective.id, Math.min(objective.targetValue, objective.currentValue + 1))} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded hover:bg-indigo-50">+</button>
      </div>
    </div>
  );
}

function DetailPanel({ objective, onClose, onUpdate, onDelete }: any) {
  const [editMode, setEditMode] = useState(false);
  const [tempValue, setTempValue] = useState(objective.currentValue);
  const category = CATEGORIES[objective.category as keyof typeof CATEGORIES];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className={`h-1.5 ${category.color}`} />
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className={`text-xs font-bold px-2 py-1 rounded ${category.lightColor} ${category.textColor}`}>{category.label}</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">{objective.title}</h2>
        <p className="text-slate-500 text-sm mb-6">{objective.description}</p>
        
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">数值更新</span>
            {editMode ? (
              <div className="flex items-center gap-2">
                <input type="number" value={tempValue} onChange={e => setTempValue(Number(e.target.value))} className="w-16 px-1 border rounded text-sm" />
                <button onClick={() => { onUpdate(objective.id, tempValue); setEditMode(false); }} className="text-emerald-600"><Save className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setEditMode(true)} className="text-slate-400"><Edit3 className="w-4 h-4" /></button>
            )}
          </div>
          <div className="text-xl font-bold text-indigo-600">{objective.currentValue} / {objective.targetValue} {objective.unit}</div>
        </div>

        <button onClick={() => onDelete(objective.id)} className="w-full py-2 flex items-center justify-center gap-2 text-rose-600 bg-rose-50 rounded-lg text-sm hover:bg-rose-100 transition-colors">
          <Trash2 className="w-4 h-4" /> 删除目标
        </button>
      </div>
    </div>
  );
}

function AddObjectiveModal({ onClose, onAdd }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'project',
    targetValue: 100,
    currentValue: 0,
    unit: '%',
    deadline: new Date().toISOString().split('T')[0],
    status: 'on_track'
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4">新建 OKR 目标</h2>
        <div className="space-y-4">
          <input placeholder="目标名称" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, title: e.target.value})} />
          <textarea placeholder="具体描述" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, description: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
             <input type="number" placeholder="目标值" className="border p-2 rounded" onChange={e => setFormData({...formData, targetValue: Number(e.target.value)})} />
             <input placeholder="单位 (如 %)" className="border p-2 rounded" onChange={e => setFormData({...formData, unit: e.target.value})} />
          </div>
          <select className="w-full border p-2 rounded" onChange={e => setFormData({...formData, category: e.target.value})}>
            <option value="project">项目交付</option>
            <option value="growth">个人成长</option>
            <option value="operation">运营优化</option>
            <option value="innovation">创新探索</option>
          </select>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2 border rounded">取消</button>
            <button onClick={() => onAdd(formData)} className="flex-1 py-2 bg-indigo-600 text-white rounded shadow-md">保存目标</button>
          </div>
        </div>
      </div>
    </div>
  );
}