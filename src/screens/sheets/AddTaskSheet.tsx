import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Sheet } from '../../components/Sheet';
import { Button } from '../../components/Button';
import { Stepper } from '../../components/Controls';
import { useStore } from '../../state/store';

export function AddTaskSheet({ onClose, taskId }: { onClose: () => void; taskId?: string }) {
  const { dispatch, state } = useStore();
  const editing = taskId != null ? state.tasks.find((t) => t.id === taskId) ?? null : null;
  const [name, setName] = useState(editing?.name ?? '');
  const [planned, setPlanned] = useState(editing?.planned ?? 2);

  // The task may have been removed while the sheet was open.
  if (taskId != null && !editing) {
    onClose();
    return null;
  }

  const submit = () => {
    if (name.trim().length < 2) return;
    if (editing) dispatch({ type: 'task/edit', id: editing.id, name: name.trim(), planned });
    else dispatch({ type: 'task/add', name: name.trim(), planned });
    onClose();
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={editing ? 'Edit task' : 'Add a task'}
      subtitle={editing ? 'Estimates can change — progress is kept' : 'Planned pomodoros are a guess, not a promise'}
      footer={
        <Button
          accent="focus"
          block
          disabled={name.trim().length < 2}
          icon={editing ? <Check size={16} /> : <Plus size={16} />}
          onClick={submit}
        >
          {editing ? 'Save changes' : 'Add task'}
        </Button>
      }
    >
      <label className="block">
        <span className="mb-2 block text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
          What are you working on?
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          enterKeyHint="done"
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="e.g. Write the migration"
          className="h-12 w-full rounded-2xl border border-line bg-field px-4 text-[0.875rem] text-ink placeholder:text-ink-3 focus:border-focus/50"
        />
      </label>

      <div className="mt-4">
        <Stepper
          label="Planned pomodoros"
          description="Shown as tomato dots on the task"
          value={planned}
          min={1}
          max={12}
          onChange={setPlanned}
        />
      </div>

      {!editing && state.tasks.length > 0 && (
        <p className="pt-2 text-[0.75rem] leading-5 text-ink-3">
          {state.tasks.length} task{state.tasks.length === 1 ? '' : 's'} already on the list. Nothing
          carries over as a debt — unticked dots stay unticked.
        </p>
      )}
    </Sheet>
  );
}
