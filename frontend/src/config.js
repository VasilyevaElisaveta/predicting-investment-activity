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

// Функция для получения доступных годов
export const fetchAvailableYears = async () => {
    try {
        const response = await fetch(`${API_PREFIX}/years/`);
        if (!response.ok) {
            console.error('Не удалось получить список годов из API');
            return [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
        }
        const data = await response.json();
        return data.years || [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
    } catch (error) {
        console.error('Ошибка при получении списка годов:', error);
        return [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
    }
}

// Конфигурация карты
export const MAP_CONFIG = {
    neutralThresholdPercent: 1.0,
    colorCap: 50,
    defaultYear: 2022, // Можно обновить динамически после получения годов
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

// Функция для инициализации годов (опционально)
export const initializeAppYears = async () => {
    try {
        const years = await fetchAvailableYears();
        if (years && years.length > 0) {
            // Обновляем defaultYear на самый новый доступный год
            const maxYear = Math.max(...years);
            MAP_CONFIG.defaultYear = maxYear;
        }
        return years;
    } catch (error) {
        console.error('Ошибка инициализации годов:', error);
        return [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
    }
}
export const YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];