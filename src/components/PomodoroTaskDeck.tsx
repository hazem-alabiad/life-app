import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Target,
  Sparkles,
  Flame,
  Check,
  FolderPlus,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PomodoroTaskGroup } from '../types';

export const PomodoroTaskDeck: React.FC = () => {
  const {
    pomodoroGroups,
    activeFocusTarget,
    setActiveFocusTarget,
    toggleTaskCompletion,
    toggleSubTaskCompletion,
    addPomodoroTask,
    addPomodoroSubTask,
    addPomodoroGroup,
    deletePomodoroTask,
    deletePomodoroSubTask,
    deletePomodoroGroup,
  } = useApp();

  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({
    'task-morning': true,
    'task-security': true,
  });

  // New task inputs
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({});
  const [newSubTaskTitle, setNewSubTaskTitle] = useState<Record<string, string>>({});
  const [activeNewSubTaskInput, setActiveNewSubTaskInput] = useState<string | null>(null);

  // New group modal
  const [showNewGroupModal, setShowNewGroupModal] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupIcon, setNewGroupIcon] = useState<string>('🎯');
  const [newGroupColor, setNewGroupColor] = useState<PomodoroTaskGroup['color']>('cyan');

  const toggleTaskAccordion = (taskId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const filteredGroups =
    selectedGroupFilter === 'all'
      ? pomodoroGroups
      : pomodoroGroups.filter((g) => g.id === selectedGroupFilter);

  const handleCreateTask = (groupId: string) => {
    const title = newTaskTitle[groupId]?.trim();
    if (title) {
      addPomodoroTask(groupId, title);
      setNewTaskTitle((prev) => ({ ...prev, [groupId]: '' }));
    }
  };

  const handleCreateSubTask = (groupId: string, taskId: string) => {
    const title = newSubTaskTitle[taskId]?.trim();
    if (title) {
      addPomodoroSubTask(groupId, taskId, title);
      setNewSubTaskTitle((prev) => ({ ...prev, [taskId]: '' }));
      setActiveNewSubTaskInput(null);
      // Ensure task is expanded
      setExpandedTasks((prev) => ({ ...prev, [taskId]: true }));
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      addPomodoroGroup(newGroupName.trim(), newGroupIcon, newGroupColor);
      setNewGroupName('');
      setShowNewGroupModal(false);
    }
  };

  const getColorClasses = (color: PomodoroTaskGroup['color']) => {
    switch (color) {
      case 'emerald':
        return {
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          bar: 'bg-emerald-400',
        };
      case 'purple':
        return {
          border: 'border-purple-500/30',
          bg: 'bg-purple-500/10',
          text: 'text-purple-400',
          bar: 'bg-purple-400',
        };
      case 'amber':
        return {
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          bar: 'bg-amber-400',
        };
      case 'rose':
        return {
          border: 'border-rose-500/30',
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          bar: 'bg-rose-400',
        };
      case 'cyan':
      default:
        return {
          border: 'border-cyan-500/30',
          bg: 'bg-cyan-500/10',
          text: 'text-cyan-400',
          bar: 'bg-cyan-400',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Focus Target Sticky Bar */}
      {activeFocusTarget && (
        <div className="p-3.5 rounded-2xl bg-[#101c24] border border-[#22d3ee]/40 flex items-center justify-between gap-3 shadow-lg shadow-[#22d3ee]/5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#22d3ee]/20 text-[#22d3ee] flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#22d3ee] block">
                CURRENT TIMER FOCUS TARGET
              </span>
              <p className="text-xs font-semibold text-white truncate">
                {activeFocusTarget.label}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveFocusTarget(null)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] font-medium transition-colors cursor-pointer shrink-0"
          >
            Clear Target
          </button>
        </div>
      )}

      {/* Filter Tabs & Add Group Action */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141822] border border-white/5">
          <button
            onClick={() => setSelectedGroupFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedGroupFilter === 'all'
                ? 'bg-[#1e2536] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Lists
          </button>
          {pomodoroGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroupFilter(group.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedGroupFilter === group.id
                  ? 'bg-[#1e2536] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{group.icon}</span>
              <span>{group.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowNewGroupModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#161b24] hover:bg-[#1d2331] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <FolderPlus className="w-3.5 h-3.5 text-[#34d399]" />
          <span>New List</span>
        </button>
      </div>

      {/* Groups List */}
      <div className="space-y-4">
        {filteredGroups.map((group) => {
          const colors = getColorClasses(group.color);
          const totalSubTasks = group.tasks.reduce((acc, t) => acc + t.subTasks.length, 0);
          const completedSubTasks = group.tasks.reduce(
            (acc, t) => acc + t.subTasks.filter((st) => st.completed).length,
            0
          );
          const percentDone =
            totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;

          return (
            <div
              key={group.id}
              className="bg-[#121620] border border-white/[0.07] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm"
            >
              {/* Group Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{group.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {group.name}
                      </h4>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}
                      >
                        {completedSubTasks}/{totalSubTasks} subtasks ({percentDone}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {pomodoroGroups.length > 1 && (
                    <button
                      onClick={() => deletePomodoroGroup(group.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete List"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-[#1b212e] overflow-hidden">
                <div
                  className={`h-full ${colors.bar} transition-all duration-300`}
                  style={{ width: `${percentDone}%` }}
                />
              </div>

              {/* Tasks in this group */}
              <div className="space-y-2 pt-1">
                {group.tasks.map((task) => {
                  const isExpanded = expandedTasks[task.id] ?? false;
                  const taskSubCount = task.subTasks.length;
                  const taskDoneSubCount = task.subTasks.filter((st) => st.completed).length;

                  return (
                    <div
                      key={task.id}
                      className="rounded-xl bg-[#161a25] border border-white/5 overflow-hidden transition-all"
                    >
                      {/* Parent Task Row */}
                      <div className="p-3 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Toggle Task Completion Checkbox */}
                          <button
                            onClick={() => toggleTaskCompletion(group.id, task.id)}
                            className="cursor-pointer shrink-0 text-slate-400 hover:text-emerald-400 transition-colors"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-xs font-semibold block truncate ${
                                task.completed
                                  ? 'text-slate-500 line-through'
                                  : 'text-slate-200'
                              }`}
                            >
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                              <span>🍅 {task.completedPoms || 0}/{task.estimatedPoms || 1} poms</span>
                              {taskSubCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {taskDoneSubCount}/{taskSubCount} subtasks
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Task Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Focus Target Button */}
                          <button
                            onClick={() =>
                              setActiveFocusTarget({
                                groupId: group.id,
                                taskId: task.id,
                                label: `${group.name} > ${task.title}`,
                              })
                            }
                            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                              activeFocusTarget?.taskId === task.id && !activeFocusTarget.subTaskId
                                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                                : 'bg-transparent border-transparent text-slate-400 hover:text-cyan-300 hover:bg-white/5'
                            }`}
                            title="Set as Active Timer Focus Target"
                          >
                            <Target className="w-3.5 h-3.5" />
                          </button>

                          {/* Accordion Toggle */}
                          <button
                            onClick={() => toggleTaskAccordion(task.id)}
                            className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Expand Subtasks"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => deletePomodoroTask(group.id, task.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Subtasks Accordion Deck */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-white/[0.04] bg-[#121620]/60 space-y-1.5">
                          {task.subTasks.map((subTask) => (
                            <div
                              key={subTask.id}
                              className="flex items-center justify-between gap-2 pl-6 pr-2 py-1.5 rounded-lg hover:bg-white/[0.02] text-xs transition-colors group"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <button
                                  onClick={() =>
                                    toggleSubTaskCompletion(group.id, task.id, subTask.id)
                                  }
                                  className="cursor-pointer shrink-0 text-slate-500 hover:text-emerald-400 transition-colors"
                                >
                                  {subTask.completed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 text-slate-500" />
                                  )}
                                </button>
                                <span
                                  className={`truncate ${
                                    subTask.completed
                                      ? 'text-slate-500 line-through'
                                      : 'text-slate-300'
                                  }`}
                                >
                                  {subTask.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() =>
                                    setActiveFocusTarget({
                                      groupId: group.id,
                                      taskId: task.id,
                                      subTaskId: subTask.id,
                                      label: `${task.title} > ${subTask.title}`,
                                    })
                                  }
                                  className={`p-1 rounded text-[10px] transition-colors cursor-pointer ${
                                    activeFocusTarget?.subTaskId === subTask.id
                                      ? 'text-cyan-400 bg-cyan-400/10'
                                      : 'text-slate-500 hover:text-cyan-400'
                                  }`}
                                  title="Focus on this Subtask"
                                >
                                  <Target className="w-3 h-3" />
                                </button>

                                <button
                                  onClick={() =>
                                    deletePomodoroSubTask(group.id, task.id, subTask.id)
                                  }
                                  className="p-1 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Delete Subtask"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Add Subtask Input */}
                          {activeNewSubTaskInput === task.id ? (
                            <div className="flex items-center gap-2 pl-6 pt-1">
                              <input
                                type="text"
                                value={newSubTaskTitle[task.id] || ''}
                                onChange={(e) =>
                                  setNewSubTaskTitle((prev) => ({
                                    ...prev,
                                    [task.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleCreateSubTask(group.id, task.id);
                                  if (e.key === 'Escape') setActiveNewSubTaskInput(null);
                                }}
                                placeholder="Subtask title... (Press Enter)"
                                autoFocus
                                className="flex-1 bg-[#0f131c] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                              />
                              <button
                                onClick={() => handleCreateSubTask(group.id, task.id)}
                                className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => setActiveNewSubTaskInput(null)}
                                className="p-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActiveNewSubTaskInput(task.id)}
                              className="pl-6 pt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add subtask</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add New Parent Task Bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                <input
                  type="text"
                  value={newTaskTitle[group.id] || ''}
                  onChange={(e) =>
                    setNewTaskTitle((prev) => ({ ...prev, [group.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateTask(group.id);
                  }}
                  placeholder={`Add new task to ${group.name}...`}
                  className="flex-1 bg-[#151924] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => handleCreateTask(group.id)}
                  className="px-3 py-1.5 bg-[#1e2535] hover:bg-[#283247] border border-white/10 text-slate-200 hover:text-white font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3 h-3 text-[#34d399]" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Group Creation Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#121620] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#34d399]" />
                <h3 className="text-sm font-bold text-white">Create New Task List</h3>
              </div>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="w-7 h-7 rounded-full bg-[#1b212d] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  List Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Design System, Side Project, Health"
                  autoFocus
                  required
                  className="w-full bg-[#161a25] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#34d399]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Select Icon Emoji
                </label>
                <div className="flex gap-2">
                  {['📅', '⚡', '✍️', '🎯', '🚀', '💡', '🧪'].map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setNewGroupIcon(icon)}
                      className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer ${
                        newGroupIcon === icon
                          ? 'bg-[#1e2536] border border-[#34d399]'
                          : 'bg-[#161a25] border border-transparent hover:bg-white/5'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  {(['emerald', 'cyan', 'purple', 'amber', 'rose'] as const).map((color) => {
                    const c = getColorClasses(color);
                    return (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setNewGroupColor(color)}
                        className={`flex-1 py-1.5 rounded-xl border text-[10px] font-semibold capitalize transition-all cursor-pointer ${
                          newGroupColor === color ? `${c.bg} ${c.text} ${c.border}` : 'border-white/5 text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#34d399] hover:bg-[#2fd094] text-[#052814] font-bold text-xs transition-colors cursor-pointer mt-2"
              >
                Create Task List
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
