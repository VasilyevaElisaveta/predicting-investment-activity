import React, { useEffect } from 'react';

export default function InstructionModal({ onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(5px)'
      }}
    >
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateY(-30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>

        {/* Заголовок */}
        <div style={{
          background: 'linear-gradient(135deg, #1b64caff 0%, #2563eb 100%)',
          padding: '28px 32px',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          color: 'white',
          position: 'relative'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '26px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            Инструкция по использованию сервиса
          </h2>
          <p style={{
            margin: '10px 0 0 0',
            opacity: 0.9,
            fontSize: '15px'
          }}>
            Интерактивная инвестиционная карта России
          </p>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '20px',
              top: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              fontSize: '28px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ×
          </button>
        </div>

        {/* Содержимое инструкции */}
        <div style={{ padding: '32px' }}>
          <div className="instruction" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            
            {/* Шаг 1 */}
            <div className="step" style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '28px',
              alignItems: 'flex-start',
              padding: '20px',
              background: 'linear-gradient(90deg, rgba(239, 246, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)',
              borderRadius: '12px',
              borderLeft: '4px solid #3b82f6'
            }}>
              <div className="step-number" style={{
                flexShrink: 0,
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #3b82f6, #1b64caff)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '20px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
              }}>
                1
              </div>
              <div className="step-content" style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '20px' }}>
                  Выберите год анализа
                </h3>
                <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>
                  В верхней панели выберите интересующий год из поддерживаемоего диапазона. Карта автоматически обновится с данными за выбранный период.
                </p>
              </div>
            </div>

            {/* Шаг 2 */}
            <div className="step" style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '28px',
              alignItems: 'flex-start',
              padding: '20px',
              background: 'linear-gradient(90deg, rgba(254, 242, 242, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)',
              borderRadius: '12px',
              borderLeft: '4px solid #ef4444'
            }}>
              <div className="step-number" style={{
                flexShrink: 0,
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #ef4444, #e02222ff)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '20px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
              }}>
                2
              </div>
              <div className="step-content" style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#991b1b', fontSize: '20px' }}>
                  Настройте фильтры в левой панели
                </h3>
                <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>
                  Выберите показатель для анализа (инвестиции, ВРП, население и др.), задайте диапазон значений, если нужно.
                  Включите опцию <em>"Показать по округам"</em> для агрегированных данных по федеральным округам.
                  Используйте фильтры динамики для выделения регионов с ростом/падением показателей.
                </p>
              </div>
            </div>

            {/* Шаг 3 */}
            <div className="step" style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '28px',
              alignItems: 'flex-start',
              padding: '20px',
              background: 'linear-gradient(90deg, rgba(240, 253, 244, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)',
              borderRadius: '12px',
              borderLeft: '4px solid #10b981'
            }}>
              <div className="step-number" style={{
                flexShrink: 0,
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '20px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
              }}>
                3
              </div>
              <div className="step-content" style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#065f46', fontSize: '20px' }}>
                  Изучите интерактивную карту
                </h3>
                <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>Синие регионы</span> — рост показателя,
                  <span style={{ color: '#dc2626', fontWeight: 'bold' }}> красные</span> — снижение,
                  <span style={{ color: '#d89ef5ff', fontWeight: 'bold' }}> фиолетовые</span> — стабильность (±1%).
                  <br/>
                  <strong>Наведите курсор</strong> — увидите название региона и выбранный показатель.
                  <strong> Кликните по региону</strong> — откроется детальная статистика.
                </p>
              </div>
            </div>

            {/* Шаг 4 */}
            <div className="step" style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '28px',
              alignItems: 'flex-start',
              padding: '20px',
              background: 'linear-gradient(90deg, rgba(254, 249, 195, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)',
              borderRadius: '12px',
              borderLeft: '4px solid #eab308'
            }}>
              <div className="step-number" style={{
                flexShrink: 0,
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #eab308, #f4c45cff)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '20px',
                boxShadow: '0 4px 12px rgba(218, 137, 22, 1)'
              }}>
                4
              </div>
              <div className="step-content" style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#cc930eff', fontSize: '20px' }}>
                  Работайте с таблицей данных
                </h3>
                <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>
                  Перейдите во вкладку <strong>"Данные"</strong> для просмотра полной таблицы. 
                  Доступны: сортировка по столбцам, поиск по всем данным, выбор отображаемых колонок.
                  Экспортируйте данные в <strong>CSV</strong> или <strong>Excel</strong> для внешнего анализа.
                </p>
              </div>
            </div>

            {/* Шаг 5 */}
            <div className="step" style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '28px',
              alignItems: 'flex-start',
              padding: '20px',
              background: 'linear-gradient(90deg, rgba(237, 233, 254, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)',
              borderRadius: '12px',
              borderLeft: '4px solid #8b5cf6'
            }}>
              <div className="step-number" style={{
                flexShrink: 0,
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '20px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
              }}>
                5
              </div>
              <div className="step-content" style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#5b21b6', fontSize: '20px' }}>
                  Анализируйте статистику
                </h3>
                <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>
                  Во вкладке <strong>"Статистика"</strong> доступны: графики динамики показателей по годам,
                  общие показатели по стране. Используйте различные типы 
                  агрегации (среднее, сумма, минимум, максимум) для вашего анализа.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Футер */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          background: 'linear-gradient(90deg, #f9fafb 0%, #ffffff 100%)',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px'
        }}>
          <button 
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '16px 40px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
              marginBottom: '12px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
          >
            Начать
          </button>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            Инструкция всегда доступна через кнопку "Инструкция" в верхней панели
          </p>
        </div>
      </div>
    </div>
  );
}