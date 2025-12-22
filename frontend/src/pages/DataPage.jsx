import React, { useEffect, useState, useRef } from 'react';
import { getStatistics, getAvailableColumns } from '../api/api';
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
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [loadingColumns, setLoadingColumns] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Используем useRef чтобы не терять выбранные колонки при изменении года
  const selectedColumnsRef = useRef([]);

  // Загрузка доступных колонок для выбранного года
  useEffect(() => {
    const loadAvailableColumns = async () => {
      setLoadingColumns(true);
      try {
        console.log(`Загрузка доступных колонок для года ${year}...`);
        const response = await getAvailableColumns(year);
        console.log('Доступные колонки:', response);
        
        if (response && response.columns_status) {
          // Преобразуем объект {column: true/false} в массив доступных колонок
          const columns = Object.entries(response.columns_status)
            .filter(([_, isAvailable]) => isAvailable)
            .map(([column]) => column);
          
          setAvailableColumns(columns);
          
          // Сохраняем выбранные колонки из предыдущего состояния
          // Фильтруем только те, которые доступны в новом году
          const filteredSelected = selectedColumnsRef.current.filter(col => 
            columns.includes(col)
          );
          
          // Если после фильтрации ничего не осталось, выбираем все доступные
          const newSelected = filteredSelected.length > 0 ? filteredSelected : columns;
          setSelectedColumns(newSelected);
          selectedColumnsRef.current = newSelected;
          
        } else {
          setAvailableColumns(ALL_COLUMNS);
          
          // Сохраняем выбранные колонки из предыдущего состояния
          const filteredSelected = selectedColumnsRef.current.filter(col => 
            ALL_COLUMNS.includes(col)
          );
          const newSelected = filteredSelected.length > 0 ? filteredSelected : ALL_COLUMNS;
          setSelectedColumns(newSelected);
          selectedColumnsRef.current = newSelected;
        }
      } catch (err) {
        console.error('Ошибка загрузки доступных колонок:', err);
        // Fallback на все колонки при ошибке
        setAvailableColumns(ALL_COLUMNS);
        
        const filteredSelected = selectedColumnsRef.current.filter(col => 
          ALL_COLUMNS.includes(col)
        );
        const newSelected = filteredSelected.length > 0 ? filteredSelected : ALL_COLUMNS;
        setSelectedColumns(newSelected);
        selectedColumnsRef.current = newSelected;
      } finally {
        setLoadingColumns(false);
      }
    };

    loadAvailableColumns();
  }, [year]);

  // Инициализация при первом рендере
  useEffect(() => {
    selectedColumnsRef.current = selectedColumns;
  }, []);

  // Загрузка данных при изменении параметров
  useEffect(() => {
    const loadData = async () => {
      // Не загружаем данные если нет выбранных колонок
      if (selectedColumns.length === 0) {
        setTableData([]);
        return;
      }
      
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
        setTableData([]);
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
    setSelectedColumns(prev => {
      const newSelected = prev.includes(column) 
        ? prev.filter(c => c !== column)
        : [...prev, column];
      
      // Сохраняем в ref
      selectedColumnsRef.current = newSelected;
      return newSelected;
    });
    setPage(1); // Сбрасываем на первую страницу
  };

  const handleSelectAll = () => {
    setSelectedColumns(prev => {
      let newSelected;
      if (prev.length === availableColumns.length) {
        newSelected = [];
      } else {
        newSelected = [...availableColumns];
      }
      
      // Сохраняем в ref
      selectedColumnsRef.current = newSelected;
      return newSelected;
    });
  };

  // Функция для скачивания через API
  const handleDownloadFile = async (fileExtension) => {
    if (selectedColumns.length === 0) {
      alert('Пожалуйста, выберите хотя бы один показатель для экспорта');
      return;
    }
    
    setExportLoading(true);
    
    try {
      // Создаем URL для скачивания
      const baseUrl = '/api/v1/download-statistics/';
      const params = new URLSearchParams();
      
      // required_columns нужно передавать как отдельные параметры
      selectedColumns.forEach(col => {
        params.append('required_columns', col);
      });
      
      params.append('year', year);
      params.append('is_by_district', isByDistrict);
      params.append('file_extension', fileExtension);
      
      if (isByDistrict) {
        params.append('aggregation_type', 'sum');
      }
      
      const url = `${baseUrl}?${params.toString()}`;
      
      console.log('Скачивание файла по URL:', url);
      
      // Открываем в новой вкладке
      window.open(url, '_blank');
      
    } catch (err) {
      console.error('Ошибка скачивания файла:', err);
      alert('Ошибка при скачивании файла');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    handleDownloadFile('csv');
  };

  const handleDownloadExcel = () => {
    handleDownloadFile('xlsx');
  };

  // Определяем колонки для отображения
  const displayColumns = [
    'district_names',
    ...(isByDistrict ? [] : ['region_names']),
    ...selectedColumns
  ];

  return (
    <div className="data-panel">
      {/* Фиксированная панель управления */}
      <div className="data-controls" style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        zIndex: 100,
        padding: '15px',
        borderBottom: '2px solid #e5e7eb',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
          <input
            className="data-search"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 15px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
          
          <div className="export-buttons" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <button 
              onClick={handleDownloadCSV}
              disabled={selectedColumns.length === 0 || exportLoading}
              title={selectedColumns.length === 0 ? 'Выберите хотя бы один показатель' : ''}
              style={{
                padding: '10px 15',
                backgroundColor: selectedColumns.length === 0 ? '#d1d5db' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                cursor: selectedColumns.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {exportLoading ? 'Скачивание...' : 'CSV'}
            </button>
            <button 
              onClick={handleDownloadExcel}
              disabled={selectedColumns.length === 0 || exportLoading}
              title={selectedColumns.length === 0 ? 'Выберите хотя бы один показатель' : ''}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedColumns.length === 0 ? '#d1d5db' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: selectedColumns.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {exportLoading ? 'Скачивание...' : 'Excel'}
            </button>
          </div>
        </div>
        
        <div className="columns-select">
          <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Выберите показатели:</h4>
          
          {loadingColumns ? (
            <div className="loading-columns">Загрузка доступных показателей...</div>
          ) : (
            <>
              <div className="column-select-all" style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedColumns.length === availableColumns.length && availableColumns.length > 0}
                    onChange={handleSelectAll}
                    disabled={availableColumns.length === 0}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <strong>Выбрать все</strong>
                  <span className="hint" style={{ color: '#6b7280', marginLeft: '5px' }}>
                    ({availableColumns.length} доступно)
                  </span>
                </label>
              </div>
              
              {availableColumns.length === 0 ? (
                <div className="no-columns" style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  Нет доступных показателей для выбранного года
                </div>
              ) : (
                <div className="columns-list" style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '10px',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  padding: '5px'
                }}>
                  {availableColumns.map(col => (
                    <label 
                      key={col} 
                      className="column-checkbox"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        backgroundColor: selectedColumns.includes(col) ? '#dbeafe' : '#f3f4f6',
                        border: `1px solid ${selectedColumns.includes(col) ? '#3b82f6' : '#d1d5db'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(col)}
                        onChange={() => toggleColumn(col)}
                        style={{ width: '16px', height: '16px' }}
                      />
                      {DISPLAY_NAMES[col] || col}
                    </label>
                  ))}
                </div>
              )}
              
              {selectedColumns.length === 0 && availableColumns.length > 0 && (
                <div className="warning-message" style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fbbf24',
                  borderRadius: '6px',
                  color: '#92400e'
                }}>
                   Не выбран ни один показатель. Выберите хотя бы один.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Контейнер таблицы */}
      <div className="table-container" style={{
        marginTop: '20px',
        maxHeight: 'calc(100vh - 300px)',
        overflowY: 'auto'
      }}>
        {loading || loadingColumns ? (
          <div className="loader" style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6b7280' 
          }}>
            Загрузка данных...
          </div>
        ) : error ? (
          <div className="error-message" style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#dc2626' 
          }}>
            {error}
          </div>
        ) : selectedColumns.length === 0 ? (
          <div className="no-data" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}></div>
            <h3>Не выбраны показатели</h3>
            <p>Выберите хотя бы один показатель из списка выше для отображения данных</p>
          </div>
        ) : tableData.length === 0 ? (
          <div className="no-data" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
            <h3>Нет данных</h3>
            <p>Для выбранных параметров нет доступных данных</p>
          </div>
        ) : (
          <>
            <table className="data-table" style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  {displayColumns.map(col => (
                    <th 
                      key={col} 
                      onClick={() => handleSort(col)}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        borderBottom: '2px solid #e5e7eb',
                        cursor: 'pointer',
                        position: 'sticky',
                        top: 0,
                        backgroundColor: '#f9fafb',
                        zIndex: 10
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{DISPLAY_NAMES[col] || col}</span>
                        {sortConfig.key === col && (
                          <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row, index) => (
                  <tr 
                    key={index} 
                    className={index % 2 === 0 ? 'even' : 'odd'}
                    style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    {displayColumns.map(col => (
                      <td 
                        key={col}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #e5e7eb'
                        }}
                      >
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
            
            <div className="data-info" style={{
              padding: '15px',
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Показано {pageData.length} из {sortedData.length} записей</span>
              {selectedColumns.length > 0 && (
                <span>
                  Выбрано показателей: {selectedColumns.length}/{availableColumns.length}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="pagination-container" style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'white',
          padding: '15px',
          borderTop: '2px solid #e5e7eb',
          zIndex: 50
        }}>
          <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                backgroundColor: page === 1 ? '#f3f4f6' : 'white',
                color: page === 1 ? '#9ca3af' : '#374151',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                borderRadius: '6px'
              }}
            >
              ◀
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={page === i + 1 ? 'active' : ''}
                onClick={() => setPage(i + 1)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  backgroundColor: page === i + 1 ? '#3b82f6' : 'white',
                  color: page === i + 1 ? 'white' : '#374151',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  fontWeight: page === i + 1 ? 'bold' : 'normal'
                }}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(page + 1)}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                backgroundColor: page === totalPages ? '#f3f4f6' : 'white',
                color: page === totalPages ? '#9ca3af' : '#374151',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                borderRadius: '6px'
              }}
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}