"use client";
import { useState } from "react";

type PaginationProps = {
  totalItems: number;
  setPageSize?: (size: number) => void;
  setPageIndex?: (index: number) => void;
};

export default function Pagination(props: PaginationProps) {
  const { totalItems } = props;
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);

  const totalPages = Math.ceil(totalItems / pageSize);
  const firstRowIndex = Math.ceil(pageSize * pageIndex);

  function prevPage() {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  }

  function nextPage() {
    setPageIndex((prev) => Math.min(prev + 1, totalPages - 1));
  }

  return (
    <div className="flex items-center justify-start gap-4">
      <p>
        {firstRowIndex || 1} - {firstRowIndex + pageSize} von {totalItems}
      </p>

      <div className="flex items-center gap-4">
        <div>
          <label>Einträge pro Seite</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded p-1 text-white">
            <option value={5}></option>
            <option value={10}></option>
            <option value={25}></option>
            <option value={50}></option>
          </select>
        </div>

        <div>
          <button onClick={prevPage}>Prev</button>
          <button onClick={nextPage}>Next</button>
        </div>
      </div>
    </div>
  );
}
