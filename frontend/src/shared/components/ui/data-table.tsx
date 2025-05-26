import * as React from "react"

export interface DataTableProps<TData> {
  columns: {
    title: string
    field: keyof TData
    render?: (value: any, data: TData) => React.ReactNode
  }[]
  data: TData[]
  onRowClick?: (data: TData) => void
  actions?: (data: TData) => React.ReactNode
}

export function DataTable<TData>({
  columns,
  data,
  onRowClick,
  actions,
}: DataTableProps<TData>) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            {columns.map((column) => (
              <th
                key={column.field as string}
                className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
              >
                {column.title}
              </th>
            ))}
            {actions && <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column) => (
                <td
                  key={column.field as string}
                  className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                >
                  {column.render
                    ? column.render(row[column.field], row)
                    : row[column.field] as React.ReactNode}
                </td>
              ))}
              {actions && (
                <td className="p-4 align-middle text-right">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
