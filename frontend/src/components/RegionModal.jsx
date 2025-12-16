import React, { useEffect } from 'react';

export default function RegionModal({ region, onClose }) {
    // Закрытие по ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Если регион не передан, не рендерим
    if (!region) {
        console.log("RegionModal: No region data provided");
        return null;
    }

    console.log("RegionModal rendering with:", region);

    // Все поля которые могут быть в данных
    const fields = [
        ['investments', 'Инвестиции', 'млн руб.'],
        ['grp', 'ВРП', 'млн руб.'],
        ['population', 'Численность населения', 'чел.'],
        ['average_salary', 'Средняя зарплата', 'руб.'],
        ['unemployment', 'Уровень безработицы', '%'],
        ['crimes', 'Количество преступлений', 'ед.'],
        ['retail_turnover', 'Оборот розничной торговли', 'млн руб.'],
        ['cash_expenses', 'Денежные доходы', 'млн руб.'],
        ['scientific_research', 'Научные исследования', 'млн руб.'],
        ['feature_value', 'Значение показателя', ''],
        ['feature_ratio', 'Динамика', '%']
    ];

    // Форматирование чисел
    const formatNumber = (num) => {
        if (num === undefined || num === null || num === '') return 'нет данных';
        if (typeof num === 'number') {
            return new Intl.NumberFormat('ru-RU').format(num);
        }
        return String(num);
    };

    return (
        <div 
            className="modal-overlay" 
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }}
        >
            <div 
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                    position: 'relative'
                }}
            >
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#666',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        backgroundColor: '#f3f4f6'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                    ×
                </button>

                <h2 style={{ 
                    marginTop: 0, 
                    color: '#1e40af',
                    marginRight: '40px'
                }}>
                    {region.region_name || region.area_name || 'Регион'}
                </h2>
                
                {region.year && (
                    <div style={{ 
                        color: '#6b7280',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        Год: {region.year}
                    </div>
                )}
                
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px',
                    marginTop: '20px'
                }}>
                    {fields.map(([key, label, unit]) => {
                        const value = region[key];
                        const hasValue = value !== undefined && value !== null && value !== '';
                        
                        return (
                            <div 
                                key={key} 
                                style={{ 
                                    padding: '12px',
                                    background: hasValue ? '#f8fafc' : '#fef2f2',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${hasValue ? '#3b82f6' : '#ef4444'}`
                                }}
                            >
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: '#6b7280',
                                    marginBottom: '4px'
                                }}>
                                    {label}
                                </div>
                                <div style={{ 
                                    fontSize: hasValue ? '16px' : '14px',
                                    fontWeight: hasValue ? '600' : '400',
                                    color: hasValue ? '#1f2937' : '#dc2626',
                                    fontStyle: hasValue ? 'normal' : 'italic'
                                }}>
                                    {hasValue ? formatNumber(value) : 'нет данных'} {unit}
                                </div>
                            </div>
                        );
                    })}
                </div>



                <button
                    onClick={onClose}
                    style={{
                        marginTop: '24px',
                        width: '100%',
                        padding: '12px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                >
                    Закрыть
                </button>
            </div>
        </div>
    );
}