// Приоритет полей для сопоставления регионов в GeoJSON
export const GEO_MATCH_PROP_PRIORITY = [
    'region_name',
    'NAME',
    'name',
    'region',
    'name:ru',
    'name:en',
    'federal_district',
    'area_name',
    'GID_1',
    'id'
]

export const API_PREFIX = '/api/v1'
export const YEARS = [2018, 2019, 2020, 2021, 2022]


// Конфигурация карты
export const MAP_CONFIG = {
    neutralThresholdPercent: 1.0,
    colorCap: 50,
    defaultYear: 2022,
    defaultFeature: 'investments'
}

// Список доступных показателей
export const FEATURES = [
    { key: 'investments', label: 'Инвестиции', unit: 'млн руб.' },
    { key: 'grp', label: 'ВРП', unit: 'млн руб.' },
    { key: 'population', label: 'Численность населения', unit: 'чел.' },
    { key: 'average_salary', label: 'Средняя зарплата', unit: 'руб.' },
    { key: 'unemployment', label: 'Уровень безработицы', unit: '%' },
    { key: 'crimes', label: 'Количество преступлений', unit: 'ед.' },
    { key: 'retail_turnover', label: 'Оборот розничной торговли', unit: 'млн руб.' },
    { key: 'cash_expenses', label: 'Денежные расходы', unit: 'млн руб.' },
    { key: 'scientific_research', label: 'Научные исследования', unit: 'млн руб.' }
]

// Настройки агрегации
export const AGGREGATION_TYPES = [
    { key: 'avg', label: 'Среднее значение' },
    { key: 'sum', label: 'Сумма' },
    { key: 'min', label: 'Минимальное значение' },
    { key: 'max', label: 'Максимальное значение' }
]
