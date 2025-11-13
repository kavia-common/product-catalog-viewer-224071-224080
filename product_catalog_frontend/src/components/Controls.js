import React from "react";

// PUBLIC_INTERFACE
export function SearchInput({ value, onChange, placeholder = "Search products..." }) {
  /** Accessible search input */
  return (
    <div className="ctrl ctrl-search">
      <input
        aria-label="Search products"
        type="search"
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// PUBLIC_INTERFACE
export function CheckboxList({ label, options, selected = [], onChange }) {
  /** Multi-select checkbox list */
  const set = new Set(selected);
  const toggle = (opt) => {
    const next = new Set(set);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    onChange(Array.from(next));
  };
  return (
    <div className="ctrl">
      <div className="ctrl-label">{label}</div>
      <div className="ctrl-list">
        {options.map((opt) => (
          <label key={opt} className="ctrl-item">
            <input
              type="checkbox"
              checked={set.has(opt)}
              onChange={() => toggle(opt)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function Range({ label, min, max, valueMin, valueMax, onChange }) {
  /** Price range control with two numeric boxes */
  const handleMin = (v) => {
    const n = v === "" ? "" : Number(v);
    onChange({ min: n, max: valueMax });
  };
  const handleMax = (v) => {
    const n = v === "" ? "" : Number(v);
    onChange({ min: valueMin, max: n });
  };
  return (
    <div className="ctrl">
      <div className="ctrl-label">{label}</div>
      <div className="ctrl-row">
        <input
          className="input input-sm"
          type="number"
          placeholder={String(min)}
          value={valueMin === "" ? "" : valueMin}
          min={min}
          max={max}
          onChange={(e) => handleMin(e.target.value)}
          aria-label={`${label} minimum`}
        />
        <span className="ctrl-sep">—</span>
        <input
          className="input input-sm"
          type="number"
          placeholder={String(max)}
          value={valueMax === "" ? "" : valueMax}
          min={min}
          max={max}
          onChange={(e) => handleMax(e.target.value)}
          aria-label={`${label} maximum`}
        />
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function Pagination({ page, pages, onChange }) {
  /** Simple pagination bar */
  const canPrev = page > 1;
  const canNext = page < pages;
  const go = (p) => {
    if (p >= 1 && p <= pages && p !== page) onChange(p);
  };
  return (
    <div className="pagination">
      <button className="btn" onClick={() => go(1)} disabled={!canPrev} aria-label="First page">
        «
      </button>
      <button className="btn" onClick={() => go(page - 1)} disabled={!canPrev} aria-label="Previous page">
        ‹
      </button>
      <span className="pagination-info">
        Page {page} of {pages}
      </span>
      <button className="btn" onClick={() => go(page + 1)} disabled={!canNext} aria-label="Next page">
        ›
      </button>
      <button className="btn" onClick={() => go(pages)} disabled={!canNext} aria-label="Last page">
        »
      </button>
    </div>
  );
}
