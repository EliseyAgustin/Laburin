import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const STACK_SUGERIDO = [
  'React',
  'Angular',
  'Vue',
  'Node.js',
  'TypeScript',
  'Python',
  'Java',
  'SQL',
  'AWS',
  'Docker',
  'Selenium',
  'PostgreSQL',
];

interface StackStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function StackStep({ value, onChange }: StackStepProps) {
  const [draft, setDraft] = useState('');

  function toggle(tech: string) {
    onChange(value.includes(tech) ? value.filter((t) => t !== tech) : [...value, tech]);
  }

  function addCustom() {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustom();
    }
  }

  const extras = value.filter((t) => !STACK_SUGERIDO.includes(t));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xl font-heading font-semibold text-on-surface mb-1">¿Qué tecnologías te interesan?</h3>
        <p className="text-sm text-on-surface-variant">Elegí las que quieras — vamos a priorizar ofertas que las mencionen.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STACK_SUGERIDO.map((tech) => {
          const active = value.includes(tech);
          return (
            <button
              key={tech}
              type="button"
              onClick={() => toggle(tech)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer',
                active
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface text-on-surface-variant border-outline-variant hover:border-primary'
              )}
            >
              {tech}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Otra tecnología…"
          className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          Agregar
        </button>
      </div>

      {extras.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {extras.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center gap-1 bg-primary-container text-on-primary-container text-xs font-medium px-2 py-1 rounded-md"
            >
              {tech}
              <button type="button" onClick={() => toggle(tech)} className="hover:text-error cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
