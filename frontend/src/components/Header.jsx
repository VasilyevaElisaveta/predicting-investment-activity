import React from 'react'

export default function Header({ 
    year, 
    setYear, 
    years, 
    loadingYears, 
    yearsError, 
    onNav, 
    currentTab = 'map' 
}) {
    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px 25px',
            background: '#1b64caff',
            color: 'white'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ 
                    fontSize: '22px', 
                    fontWeight: '700', 
                    marginBottom: '4px',
                    fontFamily: 'Montserrat, sans-serif'
                }}>
                    Инвестиционная карта России
                </div>
                <div style={{ fontSize: '13px', opacity: '0.9', fontFamily: 'Montserrat, sans-serif' }}>
                    Анализ социально-экономических показателей
                </div>
            </div>
            
            <nav style={{ display: 'flex', gap: '10px', margin: '0 30px' }}>
                {['map', 'data', 'stats', 'instr'].map(tab => {
                    const labels = { map: 'Карта', data: 'Данные', stats: 'Статистика', instr: 'Инструкция' }
                    return (
                        <button 
                            key={tab}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                background: currentTab === tab ? 'white' : 'rgba(255, 255, 255, 0.1)',
                                color: currentTab === tab ? '#3054b6ff' : 'white',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontFamily: 'Montserrat, sans-serif'
                            }}
                            onClick={() => onNav(tab)}
                        >
                            {labels[tab]}
                        </button>
                    )
                })}
            </nav>
            
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Montserrat, sans-serif' }}>
                    <div style={{ fontSize: '15px' }}>Год:</div>
                    
                    {/* Селектор года с обработкой состояний */}
                    {loadingYears ? (
                        <div style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            minWidth: '100px',
                            textAlign: 'center'
                        }}>
                            Загрузка...
                        </div>
                    ) : yearsError ? (
                        <div style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            minWidth: '100px',
                            textAlign: 'center',
                            fontSize: '14px'
                        }}>
                            Ошибка
                        </div>
                    ) : years && years.length > 0 ? (
                        <select 
                            style={{ 
                                padding: '8px 12px', 
                                border: 'none', 
                                borderRadius: '6px', 
                                fontFamily: 'Montserrat, sans-serif',
                                minWidth: '100px'
                            }}
                            value={year}
                            onChange={e => setYear(parseInt(e.target.value))}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    ) : (
                        <div style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            minWidth: '100px',
                            textAlign: 'center'
                        }}>
                            Нет данных
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}