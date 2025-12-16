import React, { useEffect, useState } from 'react';
import { getStatistics, downloadStatistics } from '../api/api';
import { exportToCsv, exportToXlsx } from '../utils/export';
import '../styles.css';

const PAGE_SIZE = 20;
const ALL_COLUMNS = [
  'investments', 'grp', 'population', 'average_salary', 'unemployment', 
  'crimes', 'retail_turnover', 'cash_expenses', 'scientific_research'
];
const DISPLAY_NAMES = {
  'district_names': 'Округ',
  'region_names': 'Регион',
  'investments': 'Инвестиции',
  'grp': 'ВРП',
  'population': 'Население',
  'average_salary': 'Средняя зарплата',
  'unemployment': 'Безработица',
  'crimes': 'Преступления',
  'retail_turnover': 'Оборот розницы',
  'cash_expenses': 'Денежные доходы',
  'scientific_research': 'Научные исследования'
};

export default function DataPage({ year, isByDistrict }) {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(1);
  const [selectedColumns, setSelectedColumns] = useState(ALL_COLUMNS);

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Определяем тип агрегации
        const aggregationType = isByDistrict ? 'sum' : null;
        
        const response = await getStatistics(
          selectedColumns,
          year,
          isByDistrict,
          aggregationType
        );
        
        console.log('Data from API:', response);
        
        if (response && response.table) {
          const formattedData = formatApiData(response.table, isByDistrict);
          setTableData(formattedData);
        } else {
          setTableData([]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [year, isByDistrict, selectedColumns]);

  const formatApiData = (apiTable, isDistrictMode) => {
    const result = [];
    const rowCount = apiTable.district_names?.length || 0;
    
    for (let i = 0; i < rowCount; i++) {
      const row = {};
      
      if (apiTable.district_names && apiTable.district_names[i]) {
        row.district_names = apiTable.district_names[i];
      }
      
      if (!isDistrictMode && apiTable.region_names && apiTable.region_names[i]) {
        row.region_names = apiTable.region_names[i];
      }
      
      // Добавляем выбранные колонки
      selectedColumns.forEach(col => {
        if (apiTable[col] && apiTable[col][i] !== undefined) {
          row[col] = apiTable[col][i];
        }
      });
      
      result.push(row);
    }
    
    return result;
  };

  // Поиск
  const filteredData = tableData.filter(row => {
    if (!searchQuery) return true;
    
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Сортировка
  const sortedData = [...filteredData];
  if (sortConfig.key) {
    sortedData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === bValue) return 0;
      
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      
      // Числовая сортировка
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return (parseFloat(aValue) - parseFloat(bValue)) * direction;
      }
      
      // Строковая сортировка
      return String(aValue).localeCompare(String(bValue)) * direction;
    });
  }

  // Пагинация
  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
  const pageData = sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Обработчики
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleColumn = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
    setPage(1); // Сбрасываем на первую страницу
  };

  const handleDownloadCSV = async () => {
    try {
      const url = downloadStatistics(
        selectedColumns,
        year,
        isByDistrict,
        isByDistrict ? 'sum' : null
      );
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error downloading CSV:', err);
      alert('Ошибка при скачивании файла');
    }
  };

  const handleExportExcel = () => {
    exportToXlsx(sortedData, selectedColumns, `данные_${year}_${isByDistrict ? 'округа' : 'регионы'}.xlsx`);
  };

  // Определяем колонки для отображения
  const displayColumns = [
    'district_names',
    ...(isByDistrict ? [] : ['region_names']),
    ...selectedColumns
  ];

  return (
    <div className="data-panel">
      <div className="data-controls">
        <input
          className="data-search"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        
        <div className="columns-select">
          <h4>Выберите показатели:</h4>
          {ALL_COLUMNS.map(col => (
            <label key={col}>
              <input
                type="checkbox"
                checked={selectedColumns.includes(col)}
                onChange={() => toggleColumn(col)}
              />
              {DISPLAY_NAMES[col]}
            </label>
          ))}
        </div>
        
        <div className="export-buttons">
          <button onClick={handleDownloadCSV}>Скачать CSV</button>
          <button onClick={handleExportExcel}>Скачать Excel</button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loader">Загрузка данных...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : sortedData.length === 0 ? (
          <div className="no-data">Нет данных для отображения</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {displayColumns.map(col => (
                  <th key={col} onClick={() => handleSort(col)}>
                    {DISPLAY_NAMES[col] || col}
                    {sortConfig.key === col && (
                      <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                  {displayColumns.map(col => (
                    <td key={col}>
                      {col === 'average_salary' || col === 'investments' || col === 'grp' || 
                       col === 'retail_turnover' || col === 'cash_expenses' || col === 'scientific_research'
                        ? new Intl.NumberFormat('ru-RU').format(row[col] || 0)
                        : row[col] || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>◀</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={page === i + 1 ? 'active' : ''}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>▶</button>
          </div>
        </div>
      )}
    </div>
  );
}