import { useState } from 'react';

const AP1_ITEMS = [
  'AP1 form completed and signed',
  'Official copies of title register obtained',
  'Transfer deed (TR1) executed',
  'SDLT return submitted (or exemption confirmed)',
  'Stamp duty payment made',
  'Land Registry fee calculated and ready',
  'Mortgage deed discharged (if applicable)',
  'ID verification for all parties completed',
  'Outstanding requisitions resolved',
  'AP1 submitted to Land Registry',
];

export default function AP1Checklist() {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (i: number) =>
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));

  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="card">
      <div className="flex justify-between items-center">
        <h2>AP1 Readiness Checklist</h2>
        <span className="text-muted">{doneCount} / {AP1_ITEMS.length}</span>
      </div>
      <ul className="checklist mt-2">
        {AP1_ITEMS.map((item, i) => (
          <li key={i} className={checked[i] ? 'done' : ''}>
            <input
              type="checkbox"
              id={`ap1-${i}`}
              checked={!!checked[i]}
              onChange={() => toggle(i)}
            />
            <label htmlFor={`ap1-${i}`}>{item}</label>
          </li>
        ))}
      </ul>
      <p className="text-muted mt-2" style={{ fontSize: '.8rem' }}>
        ⚠ Checklist state is local only — persistence coming in a future release.
      </p>
    </div>
  );
}
