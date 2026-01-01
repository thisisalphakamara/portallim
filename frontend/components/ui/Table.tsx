import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  headerClassName?: string;
}

function Table<T extends { id?: string | number }>({ 
  columns, 
  data, 
  onRowClick,
  emptyMessage = 'No data available',
  headerClassName = 'bg-black text-white'
}: TableProps<T>) {
  const getCellValue = (row: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor] as React.ReactNode;
  };

  if (data.length === 0) {
    return (
      <div className="bg-white p-12 border border-gray-200 rounded-xl text-center shadow-sm">
        <div className="flex flex-col items-center justify-center space-y-3">
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((row, rowIndex) => (
          <div 
            key={row.id || rowIndex}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3"
          >
            {columns.map((column, colIndex) => {
              // Special handling for the first column (usually ID or primary identifier) to be the header
              if (colIndex === 0) {
                return (
                  <div key={colIndex} className="pb-2 border-b border-gray-100 mb-2">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">{column.header}</span>
                     <div className="text-lg font-bold text-gray-900">{getCellValue(row, column)}</div>
                  </div>
                );
              }
              
              return (
                <div key={colIndex} className="flex justify-between items-center py-1">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{column.header}</span>
                   <div className="text-sm font-medium text-right text-gray-900">{getCellValue(row, column)}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className={`${headerClassName} text-[10px] font-bold uppercase tracking-widest`}>
              {columns.map((column, index) => (
                <th key={index} className={`p-4 ${column.className || ''}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-gray-100">
            {data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={`p-4 ${column.className || ''}`}>
                    {getCellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Table;
