import React, { useState } from 'react';
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

// 类型定义
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

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

// 模拟初始数据
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
      { id: 'm3', title: '开发阶段完成', completed: false, dueDate: '2026-05-15' },
      { id: 'm4', title: '测试验收通过', completed: false, dueDate: '2026-06-20' },
    ],
    createdAt: '2026-03-01',
    updatedAt: '2026-04-08',
  },
  {
    id: '2',
    title: '团队效能提升',
    description: '优化工作流程，提升团队交付效率与代码质量',
    category: 'operation',
    targetValue: 25,
    currentValue: 18,
    unit: '%',
    deadline: '2026-12-31',
    status: 'on_track',
    milestones: [
      { id: 'm5', title: 'CI/CD流程优化', completed: true, dueDate: '2026-03-15' },
      { id: 'm6', title: '代码审查规范制定', completed: false, dueDate: '2026-04-30' },
    ],
    createdAt: '2026-01-15',
    updatedAt: '2026-04-05',
  },
  {
    id: '3',
    title: '新技术预研',
    description: '探索AI辅助编程工具在团队中的应用',
    category: 'innovation',
    targetValue: 3,
    currentValue: 1,
    unit: '个',
    deadline: '2026-09-30',
    status: 'at_risk',
    milestones: [
      { id: 'm7', title: '工具选型评估', completed: true, dueDate: '2026-03-30' },
      { id: 'm8', title: '试点项目验证', completed: false, dueDate: '2026-05-30' },
    ],
    createdAt: '2026-02-01',
    updatedAt: '2026-04-08',
  },
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

// 主应用组件
export default function OKRDashboard() {
  const [objectives, setObjectives] = useState<Objective[]>(INITIAL_OBJECTIVES);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const stats = {
    total: objectives.length,
    completed: objectives.filter(o => o.status === 'completed').length,
    onTrack: objectives.filter(o => o.status === 'on_track').length,
    atRisk: objectives.filter(o => o.status === 'at_risk' || o.status === 'delayed').length,
    avgProgress: Math.round(objectives.reduce((acc, o) => acc + (o.currentValue / o.targetValue) * 100, 0) / objectives.length),
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

  const handleAddObjective = (newObjective: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>) => {
    const objective: Objective = {
      ...newObjective,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setObjectives([...objectives, objective]);
    setShowAddModal(false);
    setLastUpdated(new Date());
  };

  const handleDeleteObjective = (id: string) => {
    setObjectives(prev => prev.filter(o => o.id !== id));
    if (selectedObjective?.id === id) setSelectedObjective(null);
    setLastUpdated(new Date());
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
              <p className="text-xs text-slate-500">实时更新 • 团队协作</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">最后更新</p>
              <p className="text-sm font-medium text-slate-700">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">新建目标</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="总目标数" value={stats.total} icon={Target} trend="+2 本月新增" color="indigo" />
          <StatCard title="已完成" value={stats.completed} icon={CheckCircle2} trend="按时交付" color="emerald" />
          <StatCard title="需关注" value={stats.atRisk} icon={AlertCircle} trend="及时跟进" color="amber" />
          <StatCard title="平均进度" value={`${stats.avgProgress}%`} icon={TrendingUp} trend="稳步提升" color="blue" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                目标概览
              </h2>
              <div className="flex gap-2">
                {Object.entries(CATEGORIES).map(([key, config]) => (
                  <span key={key} className={`text-xs px-2 py-1 rounded-full ${config.lightColor} ${config.textColor} font-medium`}>
                    {config.label}
                  </span>
                ))}
              </div>
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
            </div>
          </div>

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
                  <p className="text-slate-500 text-sm">点击左侧目标卡片查看详细进度、里程碑和更新记录</p>
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

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colorMap: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{trend}</span>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm text-slate-500">{title}</div>
    </div>
  );
}

function ObjectiveCard({ objective, onClick, onUpdateProgress }: { 
  objective: Objective; 
  onClick: () => void;
  onUpdateProgress: (id: string, value: number) => void;
}) {
  const progress = (objective.currentValue / objective.targetValue) * 100;
  const category = CATEGORIES[objective.category];
  const status = STATUS_CONFIG[objective.status];

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer overflow-hidden" onClick={onClick}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`w-2 h-12 rounded-full ${category.color}`} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{objective.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${status.color} flex items-center gap-1`}>
                  <status.icon className="w-3 h-3" />{status.label}
                </span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">{objective.description}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">进度</span>
            <span className="font-semibold text-slate-900">{objective.currentValue} / {objective.targetValue} {objective.unit}</span>
          </div>
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`absolute h-full rounded-full transition-all duration-500 ${category.color}`} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />截止 {objective.deadline}</span>
              <span className={`px-2 py-0.5 rounded ${category.lightColor} ${category.textColor}`}>{category.label}</span>
            </div>
            <span className="font-medium text-indigo-600">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between" onClick={e => e.stopPropagation()}>
        <span className="text-xs text-slate-500">快速更新进度</span>
        <div className="flex gap-2">
          <button onClick={() => onUpdateProgress(objective.id, Math.max(0, objective.currentValue - 5))} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 flex items-center justify-center transition-colors text-slate-600 font-bold">-</button>
          <button onClick={() => onUpdateProgress(objective.id, Math.min(objective.targetValue, objective.currentValue + 5))} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 flex items-center justify-center transition-colors text-slate-600 font-bold">+</button>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ objective, onClose, onUpdate, onDelete }: {
  objective: Objective;
  onClose: () => void;
  onUpdate: (id: string, value: number) => void;
  onDelete: (id: string) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [tempValue, setTempValue] = useState(objective.currentValue);
  const category = CATEGORIES[objective.category];
  const progress = (objective.currentValue / objective.targetValue) * 100;

  const handleSave = () => {
    onUpdate(objective.id, tempValue);
    setEditMode(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className={`h-2 ${category.color}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${category.lightColor} ${category.textColor}`}>{category.label}</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{objective.title}</h2>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">{objective.description}</p>
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">当前进度</span>
            {editMode ? (
              <div className="flex items-center gap-2">
                <input type="number" value={tempValue} onChange={e => setTempValue(Number(e.target.value))} className="w-20 px-2 py-1 border border-slate-300 rounded text-right font-bold text-indigo-600" />
                <span className="text-slate-500">/ {objective.targetValue} {objective.unit}</span>
                <button onClick={handleSave} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Save className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-indigo-600">{objective.currentValue}</span>
                <span className="text-slate-400">/ {objective.targetValue} {objective.unit}</span>
                <button onClick={() => setEditMode(true)} className="p-1 text-slate-400 hover:text-indigo-600"><Edit3 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
            <div className={`absolute h-full rounded-full transition-all duration-500 ${category.color}`} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400" />关键里程碑</h3>
          <div className="space-y-3">
            {objective.milestones.map((milestone, idx) => (
              <div key={milestone.id} className={`flex items-start gap-3 p-3 rounded-lg border ${milestone.completed ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200'}`}>
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${milestone.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {milestone.completed ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-xs">{idx + 1}</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${milestone.completed ? 'text-emerald-900 line-through opacity-70' : 'text-slate-800'}`}>{milestone.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">截止 {milestone.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
          <div className="flex justify-between"><span>创建时间</span><span>{new Date(objective.createdAt).toLocaleDateString()}</span></div>
          <div className="flex justify-between"><span>最后更新</span><span>{new Date(objective.updatedAt).toLocaleDateString()}</span></div>
          <div className="flex justify-between"><span>截止日期</span><span className="font-medium text-slate-700">{objective.deadline}</span></div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
          <button onClick={() => onDelete(objective.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors text-sm font-medium"><Trash2 className="w-4 h-4" />删除</button>
        </div>
      </div>
    </div>
  );
}

function AddObjectiveModal({ onClose, onAdd }: { onClose: () => void; onAdd: (obj: any) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'project' as const,
    targetValue: 100,
    currentValue: 0,
    unit: '%',
    deadline: new Date().toISOString().split('T')[0],
    status: 'on_track' as const,
    milestones: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-900">新建工作目标</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">目标标题</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="例如：完成Q2产品迭代" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">详细描述</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none" placeholder="描述具体要达成的目标和关键结果..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="project">项目交付</option>
                <option value="growth">个人成长</option>
                <option value="operation">运营优化</option>
                <option value="innovation">创新探索</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">截止日期</label>
              <input type="date" required value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">目标值</label>
              <input type="number" min="1" value={formData.targetValue} onChange={e => setFormData({...formData, targetValue: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">单位</label>
              <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="%, 个, 万元" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">当前值</label>
              <input type="number" min="0" value={formData.currentValue} onChange={e => setFormData({...formData, currentValue: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors">取消</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-lg shadow-indigo-200">创建目标</button>
          </div>
        </form>
      </div>
    </div>
  );
}