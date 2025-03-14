import React from 'react';
import { Loader2 } from 'lucide-react';

interface TableLoaderProps {
  colSpan: number;
}

export function TableLoader({ colSpan }: TableLoaderProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-4 text-center text-sm text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </td>
    </tr>
  );
}