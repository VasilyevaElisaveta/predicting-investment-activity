import React, { useEffect, useState, useRef } from 'react'
import { getFeatureGraphs } from '../api/api'

export default function StatsPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [aggregationType, setAggregationType] = useState('avg') 
    const [activeChart, setActiveChart] = useState('investments')
    const containerRef = useRef(null)

    // 4 типа агрегации
    const aggregationOptions = [
        { value: 'avg', label: 'Среднее', color: '#8b5cf6' },
        { value: 'min', label: 'Минимум', color: '#3b82f6'},
        { value: 'max', label: 'Максимум', color: '#ef4444'},
        { value: 'sum', label: 'Сумма', color: '#10b981' }
    ]

    const chartOptions = [
        { id: 'investments', label: 'Инвестиции', color: '#3b82f6', unit: 'млн руб.', type: 'float' },
        { id: 'grp', label: 'ВРП', color: '#10b981', unit: 'млн руб.', type: 'float' },
        { id: 'population', label: 'Население', color: '#8b5cf6', unit: 'чел.', type: 'float' },
        { id: 'average_salary', label: 'Средняя зарплата', color: '#f59e0b', unit: 'руб.', type: 'float' },
        { id: 'unemployment', label: 'Безработица', color: '#ec4899', unit: '%', type: 'float' },
        { id: 'crimes', label: 'Преступления', color: '#dc2626', unit: 'ед.', type: 'float' },
        { id: 'retail_turnover', label: 'Оборот розницы', color: '#06b6d4', unit: 'млн руб.', type: 'float' },
        { id: 'cash_expenses', label: 'Денежные расходы', color: '#8b5cf6', unit: 'млн руб.', type: 'float' },
        { id: 'scientific_research', label: 'Научные исследования', color: '#14b8a6', unit: 'млн руб.', type: 'float' }
    ]

    useEffect(() => {
        loadData(aggregationType)
    }, [aggregationType])

    const loadData = async (type) => {
        console.log(`Loading data with aggregation: ${type}`)
        setLoading(true)
        setError('')
        setData(null)
        
        try {
            const response = await getFeatureGraphs(type)
            console.log('Raw API response:', response)
            
            if (response && response.graphs && response.graphs.year && response.graphs.year.length > 0) {
                console.log('Data loaded successfully')
                
                // Проверяем доступные данные
                const availableCharts = chartOptions.map(option => {
                    const values = response.graphs[option.id]
                    const hasData = values && values.some(v => v !== null && v !== undefined && !isNaN(v))
                    return {
                        ...option,
                        hasData
                    }
                })
                
                console.log('Available charts:', availableCharts)
                
                setData({
                    ...response.graphs,
                    availableCharts // Добавляем информацию о доступности
                })
            } else {
                console.error('Invalid response structure:', response)
                throw new Error('Некорректный формат данных от сервера')
            }
            
        } catch (err) {
            console.error('Error loading data:', err)
            setError(`Ошибка загрузки при типе агрегации "${type}": ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const formatNumber = (num, type = null) => {
        if (num === null || num === undefined || isNaN(num)) return '—'
        
        const chartOption = type ? 
            chartOptions.find(opt => opt.id === type) : 
            chartOptions.find(opt => opt.id === activeChart)
        
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(num)
    }

    const getAvailableYears = () => {
        if (!data || !data.year) return []
        return data.year.filter(year => year !== null && year !== undefined)
    }

    const getLastAvailableValue = (chartId) => {
        if (!data || !data[chartId]) return null
        
        const values = data[chartId]
        // Ищем последнее не-null значение с конца
        for (let i = values.length - 1; i >= 0; i--) {
            if (values[i] !== null && values[i] !== undefined && !isNaN(values[i])) {
                return values[i]
            }
        }
        return null
    }

    const getFirstAvailableValue = (chartId) => {
        if (!data || !data[chartId]) return null
        
        const values = data[chartId]
        // Ищем первое не-null значение
        for (let i = 0; i < values.length; i++) {
            if (values[i] !== null && values[i] !== undefined && !isNaN(values[i])) {
                return values[i]
            }
        }
        return null
    }

    const calculateGrowth = (chartId) => {
        const lastValue = getLastAvailableValue(chartId)
        const firstValue = getFirstAvailableValue(chartId)
        
        if (firstValue && lastValue && firstValue !== 0 && !isNaN(firstValue) && !isNaN(lastValue)) {
            return ((lastValue - firstValue) / firstValue) * 100
        }
        return null
    }

    const renderSVGChart = () => {
        if (!data || !data.year || !data[activeChart]) {
            console.log('Нет данных для графика:', { 
                hasData: !!data, 
                hasYear: data?.year?.length,
                hasActiveChart: data?.[activeChart]?.length 
            })
            return (
                <div style={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#666',
                    fontStyle: 'italic'
                }}>
                    Нет данных для отображения графика
                </div>
            )
        }
        
        const years = getAvailableYears()
        const values = data[activeChart]
        const chartOption = chartOptions.find(opt => opt.id === activeChart)
        
        if (!years.length || !values.length) {
            console.log('Пустые данные:', { years: years.length, values: values.length })
            return (
                <div style={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#666',
                    fontStyle: 'italic'
                }}>
                    Недостаточно данных для построения графика
                </div>
            )
        }
        
        // Находим мин и макс для масштабирования (только не-null значения)
        const filteredValues = values.filter(v => v != null && !isNaN(v))
        if (filteredValues.length === 0) {
            return (
                <div style={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#666',
                    fontStyle: 'italic'
                }}>
                    Все значения равны нулю или отсутствуют
                </div>
            )
        }
        
        const minValue = Math.min(...filteredValues)
        const maxValue = Math.max(...filteredValues)
        const valueRange = maxValue - minValue || 1
        
        // Размеры графика
        const width = 800
        const height = 300
        const padding = { top: 30, right: 50, bottom: 50, left: 100 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom
        
        const points = values.map((value, index) => {
            if (value == null || isNaN(value)) return null
            
            const x = padding.left + (index / Math.max(years.length - 1, 1)) * chartWidth
            const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight
            
            return `${x},${y}`
        }).filter(point => point != null)
        
        const pathData = points.length > 1 ? `M ${points[0]} L ${points.slice(1).join(' ')}` : ''
        
        return (
            <svg width={width} height={height} style={{ maxWidth: '100%' }}>
                {/* Фон графика */}
                <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} fill="#f8fafc" />
                
                {/* Сетка по горизонтали */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padding.top + chartHeight - (ratio * chartHeight)
                    const value = minValue + (1 - ratio) * valueRange
                    return (
                        <g key={`hgrid-${i}`}>
                            <line 
                                x1={padding.left} 
                                y1={y} 
                                x2={padding.left + chartWidth} 
                                y2={y} 
                                stroke="#e5e7eb" 
                                strokeWidth="1" 
                            />
                            <text 
                                x={padding.left - 10} 
                                y={y} 
                                textAnchor="end" 
                                alignmentBaseline="middle"
                                fontSize="12"
                                fill="#6b7280"
                            >
                                {formatNumber(value)}
                            </text>
                        </g>
                    )
                })}
                
                {/* Линия графика */}
                {points.length > 1 && (
                    <path 
                        d={pathData} 
                        fill="none" 
                        stroke={chartOption?.color || '#3b82f6'} 
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}
                
                {/* Точки на графике */}
                {points.map((point, index) => {
                    const [x, y] = point.split(',').map(Number)
                    const value = values[index]
                    const year = years[index]
                    
                    return (
                        <g key={`point-${index}`}>
                            <circle 
                                cx={x} 
                                cy={y} 
                                r="4" 
                                fill={chartOption?.color || '#3b82f6'}
                                stroke="white"
                                strokeWidth="2"
                            />
                            <text 
                                x={x} 
                                y={y - 15} 
                                textAnchor="middle"
                                fontSize="12"
                                fontWeight="bold"
                                fill="#1f2937"
                            >
                                {formatNumber(value)}
                            </text>
                            <text 
                                x={x} 
                                y={height - padding.bottom + 20} 
                                textAnchor="middle"
                                fontSize="12"
                                fill="#6b7280"
                                transform={`rotate(45, ${x}, ${height - padding.bottom + 20})`}
                            >
                                {year}
                            </text>
                        </g>
                    )
                })}
                
                {/* Подписи осей */}
                <text 
                    x={width / 2} 
                    y={height - 10} 
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#374151"
                >
                    Год
                </text>
                <text 
                    x={10} 
                    y={height / 2} 
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#374151"
                    transform={`rotate(-90, 10, ${height / 2})`}
                >
                    {chartOption?.label} ({chartOption?.unit})
                </text>
            </svg>
        )
    }

    if (loading) {
        return (
            <div style={{ 
                padding: 40, 
                textAlign: 'center',
                color: '#666'
            }}>
                <div style={{ fontSize: 18, marginBottom: 10 }}>Загрузка данных...</div>
                <div style={{ fontSize: 14, color: '#999' }}>
                    {aggregationOptions.find(opt => opt.value === aggregationType)?.label}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ 
                padding: 20,
                background: '#fee2e2',
                borderRadius: 8,
                margin: 20
            }}>
                <h3 style={{ color: '#dc2626', marginTop: 0 }}>Ошибка загрузки данных</h3>
                <p>{error}</p>
                
                <div style={{ marginTop: 20 }}>
                    <p>Выберите другой тип агрегации:</p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                        {aggregationOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setAggregationType(option.value)}
                                style={{
                                    padding: '10px 20px',
                                    background: aggregationType === option.value ? option.color : '#e5e7eb',
                                    color: aggregationType === option.value ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}
                            >
                                <span>{option.icon}</span>
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div style={{ padding: 20 }}>
                <h2 style={{ marginTop: 0 }}>Статистика по стране</h2>
                <p>Выберите тип агрегации для загрузки данных:</p>
                
                <div style={{ display: 'flex', gap: 15, marginTop: 20, flexWrap: 'wrap' }}>
                    {aggregationOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setAggregationType(option.value)}
                            style={{
                                padding: '20px 30px',
                                background: option.color,
                                color: 'white',
                                border: 'none',
                                borderRadius: 10,
                                cursor: 'pointer',
                                fontSize: 16,
                                fontWeight: 'bold',
                                minWidth: 140,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 5,
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            <span style={{ fontSize: 24 }}>{option.icon}</span>
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    const years = getAvailableYears()
    const lastIndex = years.length - 1
    const currentAggregation = aggregationOptions.find(opt => opt.value === aggregationType)
    const activeChartOption = chartOptions.find(opt => opt.id === activeChart)

    return (
        <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }} ref={containerRef}>
            {/* Заголовок и выбор агрегации */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 30,
                flexWrap: 'wrap',
                gap: 15
            }}>
                <div>
                    <h1 style={{ margin: 0, color: '#1f2937' }}>Анализ показателей по стране</h1>
                    <p style={{ color: '#6b7280', marginTop: 5 }}>
                        {years[0] || '—'} - {years[lastIndex] || '—'} гг. • {currentAggregation?.label}
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {aggregationOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setAggregationType(option.value)}
                            style={{
                                padding: '12px 24px',
                                background: aggregationType === option.value ? option.color : '#f3f4f6',
                                color: aggregationType === option.value ? 'white' : '#374151',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontWeight: aggregationType === option.value ? 'bold' : 'normal',
                                fontSize: 14,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontSize: 16 }}>{option.icon}</span>
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Карточки с показателями */}
            <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 15,
                marginBottom: 30
            }}>
                {chartOptions.map(option => {
                    const lastValue = getLastAvailableValue(option.id)
                    const firstValue = getFirstAvailableValue(option.id)
                    const growth = calculateGrowth(option.id)
                    const hasData = lastValue !== null && lastValue !== undefined
                    
                    return (
                        <div 
                            key={option.id}
                            style={{ 
                                padding: 20,
                                background: activeChart === option.id ? `${option.color}10` : (hasData ? 'white' : '#f9fafb'),
                                borderRadius: 10,
                                boxShadow: hasData ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
                                cursor: hasData ? 'pointer' : 'default',
                                transition: hasData ? 'all 0.3s' : 'none',
                                border: `2px solid ${activeChart === option.id ? option.color : 'transparent'}`,
                                borderLeft: `5px solid ${hasData ? option.color : '#e5e7eb'}`,
                                opacity: hasData ? 1 : 0.7
                            }}
                            onClick={() => hasData && setActiveChart(option.id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4 style={{ 
                                        margin: '0 0 10px 0', 
                                        color: hasData ? option.color : '#9ca3af',
                                        fontSize: 16
                                    }}>
                                        {option.label}
                                        {!hasData && (
                                            <span style={{ 
                                                fontSize: 12, 
                                                marginLeft: 8, 
                                                color: '#9ca3af',
                                                fontStyle: 'italic'
                                            }}>
                                                (нет данных)
                                            </span>
                                        )}
                                    </h4>
                                    <div style={{ 
                                        fontSize: 28, 
                                        fontWeight: 'bold', 
                                        color: hasData ? '#1f2937' : '#9ca3af'
                                    }}>
                                        {hasData ? formatNumber(lastValue, option.id) : '—'} {hasData && option.unit}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '4px 12px',
                                    background: hasData ? currentAggregation.color : '#e5e7eb',
                                    color: hasData ? 'white' : '#6b7280',
                                    borderRadius: 12,
                                    fontSize: 12,
                                    fontWeight: 'bold'
                                }}>
                                    {currentAggregation.label}
                                </div>
                            </div>
                            
                            {hasData && growth !== null && (
                                <div style={{ 
                                    marginTop: 10,
                                    fontSize: 13,
                                    color: growth >= 0 ? '#10b981' : '#ef4444',
                                    fontWeight: '500'
                                }}>
                                    {growth >= 0 ? '↗' : '↘'} {Math.abs(growth).toFixed(1)}% за период
                                </div>
                            )}
                            
                            {!hasData && (
                                <div style={{ 
                                    marginTop: 10,
                                    fontSize: 12,
                                    color: '#9ca3af',
                                    fontStyle: 'italic'
                                }}>
                                    Данные доступны только до 2024 года
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* График */}
            <div style={{ 
                background: 'white',
                borderRadius: 12,
                padding: 25,
                marginBottom: 30,
                boxShadow: '0 2px 15px rgba(0,0,0,0.1)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20
                }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#1f2937' }}>
                            {activeChartOption?.label}
                        </h3>
                        <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: 14 }}>
                            {years[0]} - {years[lastIndex]} гг. • {currentAggregation?.label}
                        </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 10 }}>
                        {aggregationOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setAggregationType(option.value)}
                                style={{
                                    padding: '8px 16px',
                                    background: aggregationType === option.value ? option.color : '#f3f4f6',
                                    color: aggregationType === option.value ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5
                                }}
                            >
                                <span>{option.icon}</span>
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* SVG график */}
                <div style={{ overflowX: 'auto' }}>
                    {renderSVGChart()}
                </div>
                
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: 10,
                    marginTop: 20,
                    flexWrap: 'wrap'
                }}>
                    {chartOptions.map(option => {
                        const hasData = getLastAvailableValue(option.id) !== null
                        return (
                            <button
                                key={option.id}
                                onClick={() => hasData && setActiveChart(option.id)}
                                disabled={!hasData}
                                style={{
                                    padding: '8px 16px',
                                    background: activeChart === option.id ? option.color : (hasData ? '#f3f4f6' : '#f9fafb'),
                                    color: activeChart === option.id ? 'white' : (hasData ? '#374151' : '#9ca3af'),
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: hasData ? 'pointer' : 'default',
                                    fontSize: 13,
                                    transition: 'all 0.2s',
                                    opacity: hasData ? 1 : 0.6
                                }}
                            >
                                {option.label}
                                {!hasData && ' ⓘ'}
                            </button>
                        )
                    })}
                </div>
                
                {/* Информация */}
                <div style={{ 
                    marginTop: 20,
                    padding: 12,
                    background: '#f0f9ff',
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#0369a1'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <strong>Информация о данных:</strong>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li>Инвестиции доступны за все годы (2014-2026)</li>
                        <li>Остальные показатели доступны только до 2023 года включительно</li>
                    </ul>
                </div>
            </div>

            {/* Легенда */}
            <div style={{ 
                padding: 15,
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 14,
                color: '#374151'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                    {aggregationOptions.map(option => (
                        <div key={option.value} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ 
                                width: 12, 
                                height: 12, 
                                background: option.color,
                                borderRadius: '50%'
                            }}></div>
                            <span>
                                <strong>{option.label}:</strong> {
                                    option.value === 'min' ? 'минимальное значение среди всех регионов' :
                                    option.value === 'max' ? 'максимальное значение среди всех регионов' :
                                    option.value === 'sum' ? 'сумма значений по всем регионам' :
                                    'среднее значение по всем регионам'
                                }
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}