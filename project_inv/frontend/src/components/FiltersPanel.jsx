import React from 'react'

const FEATURE_LIST = [
  { key: 'investments', label: 'Инвестиции' },
  { key: 'grp', label: 'ВРП' },
  { key: 'population', label: 'Численность' },
  { key: 'average_salary', label: 'Средняя ЗП' },
  { key: 'unemployment', label: 'Безработица' },
  { key: 'crimes', label: 'Преступления' },
  { key: 'retail_turnover', label: 'Оборот роз. торговли' },
  { key: 'cash_expenses', label: 'Денежные расходы' },
  { key: 'scientific_research', label: 'Научные исследования' }
]

export default function FiltersPanel({
  feature,
  setFeature,
  minVal,
  setMinVal,
  maxVal,
  setMaxVal,
  showPos,
  setShowPos,
  showNeg,
  setShowNeg,
  showStable,
  setShowStable,
  isByDistrict,
  setIsByDistrict,
  onApply,
  onReset,
  loadingAreas = false,
  areasError = null,
  areasCount = 0
}) {

  const handleReset = () => {
    setMinVal('');
    setMaxVal('');
    setShowPos(true);
    setShowNeg(true);
    setShowStable(true);
    if (onReset) onReset();
  };

  return (
    <div className="panel filters-panel">
      <h3 style={{ marginTop: 0 }}>Фильтры</h3>

      {/* Статусы */}
      {loadingAreas && (
        <div className="loading-indicator">
          <div className="small-spinner"></div>
          Загрузка данных…
        </div>
      )}

      {areasError && (
        <div className="error-message">{areasError}</div>
      )}

      {!loadingAreas && !areasError && areasCount > 0 && (
        <div className="success-message">
          Загружено {areasCount} {isByDistrict ? 'округов' : 'регионов'}
        </div>
      )}

      {/* Показатель */}
      <div className="filter-section">
        <label className="filter-label">Показатель</label>
        <select
          className="select"
          value={feature}
          onChange={e => setFeature(e.target.value)}
          disabled={loadingAreas}
        >
          {FEATURE_LIST.map(f => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Диапазон */}
      <div className="filter-section">
        <label className="filter-label">Диапазон (от / до)</label>

        <div className="range-inputs">
          <input
            className="input"
            type="number"
            placeholder="От"
            value={minVal}
            onChange={e => setMinVal(e.target.value)}
            disabled={loadingAreas}
          />
          <input
            className="input"
            type="number"
            placeholder="До"
            value={maxVal}
            onChange={e => setMaxVal(e.target.value)}
            disabled={loadingAreas}
          />
        </div>

        <div className="hint">
          Оставьте пустым для отображения всех значений
        </div>
      </div>

      {/* Округа */}
      <div className="filter-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isByDistrict}
            onChange={e => setIsByDistrict(e.target.checked)}
            disabled={loadingAreas}
          />
          Показать по округам
        </label>
      </div>

      {/* Динамика */}
      <div className="filter-section">
        <div className="filter-label">Динамика показателя</div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showPos}
              onChange={e => setShowPos(e.target.checked)}
              disabled={loadingAreas}
            />
            Положительная динамика
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showNeg}
              onChange={e => setShowNeg(e.target.checked)}
              disabled={loadingAreas}
            />
            Отрицательная динамика
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showStable}
              onChange={e => setShowStable(e.target.checked)}
              disabled={loadingAreas}
            />
            Стабильные (±1%)
          </label>
        </div>
      </div>

      {/* Кнопки */}
      <div className="filter-buttons">
        <button
          className="btn primary-btn"
          onClick={onApply}
          disabled={loadingAreas}
        >
          Применить
        </button>

        <button
          className="btn secondary-btn"
          onClick={handleReset}
          disabled={loadingAreas}
        >
          Сброс
        </button>
      </div>

    </div>
  )
}