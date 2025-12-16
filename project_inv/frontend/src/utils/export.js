import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

export function exportToCsv(rows, columns, filename='export.csv'){
  const header = columns
  const lines = [header.join(',')]
  rows.forEach(r=>{
    const vals = columns.map(c => `"${String(r[c] ?? '').replace(/"/g,'""')}"`)
    lines.push(vals.join(','))
  })
  const blob = new Blob([lines.join('\n')], {type:'text/csv;charset=utf-8;'})
  saveAs(blob, filename)
}

export function exportToXlsx(rows, columns, filename='export.xlsx'){
  const data = rows.map(r=>{
    const o = {}
    columns.forEach(c=> o[c] = r[c] ?? '')
    return o
  })
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'})
  saveAs(new Blob([wbout], {type:'application/octet-stream'}), filename)
}
