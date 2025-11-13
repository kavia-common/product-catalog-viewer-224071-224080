import React from "react";
import { SearchInput, CheckboxList, Range } from "./Controls";

// PUBLIC_INTERFACE
export default function SidebarFilters({
  search,
  onSearch,
  categories,
  selectedCategories,
  onCategories,
  brands,
  selectedBrands,
  onBrands,
  priceBounds,
  priceValues,
  onPrice,
  onClear,
}) {
  /** Sidebar with search and filter controls */
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="title">Filters</div>
        <button className="btn btn-ghost" onClick={onClear} aria-label="Clear filters">
          Clear
        </button>
      </div>

      <SearchInput value={search} onChange={onSearch} />

      <div className="divider" />

      <CheckboxList
        label="Categories"
        options={categories}
        selected={selectedCategories}
        onChange={onCategories}
      />

      <div className="divider" />

      <CheckboxList label="Brands" options={brands} selected={selectedBrands} onChange={onBrands} />

      <div className="divider" />

      <Range
        label={`Price (${priceBounds.min} - ${priceBounds.max})`}
        min={priceBounds.min}
        max={priceBounds.max}
        valueMin={priceValues.min === "" ? "" : priceValues.min}
        valueMax={priceValues.max === "" ? "" : priceValues.max}
        onChange={({ min, max }) => onPrice({ min, max })}
      />
    </aside>
  );
}
