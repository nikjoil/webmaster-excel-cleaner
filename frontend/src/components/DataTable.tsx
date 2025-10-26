
import React from 'react';

type TableRow = Record<string, any>;

interface DataTableProps {
  headers: string[];
  data: TableRow[];
}

export const DataTable: React.FC<DataTableProps> = ({ headers, data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-800 rounded-lg">
        <p>No data to display.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-slate-700">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider sticky top-0 bg-slate-800"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-800/50 divide-y divide-slate-800">
            {data.slice(0, 100).map((row, rowIndex) => ( // Display up to 100 rows for performance
              <tr key={rowIndex} className="hover:bg-slate-700/50 transition-colors duration-200">
                {headers.map((header, colIndex) => (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-slate-300"
                  >
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 100 &&
        <div className="bg-slate-800 px-6 py-3 text-center text-sm text-slate-400">
          Showing first 100 rows. The downloaded file will contain all {data.length} rows.
        </div>
      }
    </div>
  );
};
