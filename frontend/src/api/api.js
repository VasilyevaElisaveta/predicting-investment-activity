// api.js
import { API_PREFIX } from '../config'

async function httpGet(path, params = {}) {
    try {
        const url = new URL(API_PREFIX + path, window.location.origin)

        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                    value.forEach(v => {
                        if (v !== null && v !== undefined) {
                            url.searchParams.append(key, v.toString())
                        }
                    })
                } else {
                    url.searchParams.append(key, value.toString())
                }
            }
        })

        console.log('Fetching API:', url.toString())

        const response = await fetch(url.toString())

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`API Error ${response.status}:`, errorText)
            throw new Error(`API ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log('API Response:', data)
        return data
    } catch (error) {
        console.error('API Request failed:', error)
        throw error
    }
}

// Get available years
export async function getAvailableYears() {
    console.log('Getting available years')
    try {
        const response = await fetch(`${API_PREFIX}/years/`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data.years || []
    } catch (error) {
        console.error('Error fetching available years:', error)
        throw error
    }
}

// Get available columns for a specific year
export async function getAvailableColumns(year) {
    console.log(`Getting available columns for year: ${year}`)
    return httpGet('/available-columns/', {
        year: year.toString()
    })
}

// Areas
export function getAreas(areDistricts = false) {
    console.log(`Getting ${areDistricts ? 'districts' : 'regions'}`)
    return httpGet(areDistricts ? '/districts/' : '/regions/')
}

// Region info 
export function getRegionInfo(id, year) {
    console.log(`Getting region info: ID=${id}, Year=${year}`)
    return httpGet('/region-info/', {
        id: id.toString(),
        year: year.toString()
    })
}

// District info
export function getDistrictInfo(id, year, aggregationType) {
    console.log(`Getting district info: ID=${id}, Year=${year}, Aggregation=${aggregationType}`)
    return httpGet('/district-info/', {
        id: id.toString(),
        year: year.toString(),
        aggregation_type: aggregationType
    })
}

// Feature info
export function getFeatureInfo(
    feature,
    year,
    isByDistrict = false,
    aggregationType = null,
    useFilter = false,
    minVal = null,
    maxVal = null
) {
    const params = {
        feature,
        year: year.toString(),
        is_by_district: isByDistrict,
        use_filter: useFilter
    }

    if (aggregationType) params.aggregation_type = aggregationType

    if (useFilter) {
        if (minVal !== null) params.min_filter_value = minVal
        if (maxVal !== null) params.max_filter_value = maxVal
    }

    console.log('Getting feature info:', params)
    return httpGet('/feature-info/', params)
}

// Statistics
export function getStatistics(
    requiredColumns,
    year,
    isByDistrict = false,
    aggregationType = null
) {
    const params = {
        year: year.toString(),
        is_by_district: isByDistrict
    }

    if (Array.isArray(requiredColumns)) {
        params.required_columns = requiredColumns
    } else if (requiredColumns) {
        params.required_columns = [requiredColumns]
    }

    if (aggregationType) params.aggregation_type = aggregationType

    console.log('Getting statistics:', params)
    return httpGet('/statistics/', params)
}

// Feature graphs
export async function getFeatureGraphs(aggregationType = 'avg') {
    console.log('Getting feature graphs for:', aggregationType)

    const allowedTypes = ['avg', 'min', 'max', 'sum']

    if (!allowedTypes.includes(aggregationType)) {
        throw new Error(`Unsupported aggregation type: ${aggregationType}`)
    }

    return httpGet('/feature-graphs/', {
        aggregation_type: aggregationType
    })
}

// Download statistics
export async function downloadStatistics(
    requiredColumns,
    year,
    isByDistrict = false,
    aggregationType = null,
    fileExtension = 'csv'
) {
    try {
        const params = new URLSearchParams({
            year: year.toString(),
            is_by_district: isByDistrict.toString(),
            file_extension: fileExtension
        })

        // Добавляем колонки как массив
        if (Array.isArray(requiredColumns)) {
            requiredColumns.forEach(col => {
                if (col !== null && col !== undefined) {
                    params.append('required_columns', col.toString())
                }
            })
        } else if (requiredColumns) {
            params.append('required_columns', requiredColumns.toString())
        }

        if (aggregationType) {
            params.append('aggregation_type', aggregationType)
        }

        console.log('Downloading statistics with params:', Object.fromEntries(params))

        const url = `${API_PREFIX}/download-statistics/?${params.toString()}`
        console.log('Download URL:', url)

        const response = await fetch(url)
        
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        // Определяем тип контента для разных форматов
        let mimeType
        let filename
        if (fileExtension === 'csv') {
            mimeType = 'text/csv;charset=utf-8'
            filename = `statistics_${year}_${isByDistrict ? 'districts' : 'regions'}.csv`
        } else if (fileExtension === 'xlsx') {
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            filename = `statistics_${year}_${isByDistrict ? 'districts' : 'regions'}.xlsx`
        } else {
            mimeType = response.headers.get('Content-Type') || 'application/octet-stream'
            filename = `statistics_${year}_${isByDistrict ? 'districts' : 'regions'}.${fileExtension}`
        }

        const blob = await response.blob()
        
        // Создаем URL для скачивания
        const downloadUrl = window.URL.createObjectURL(new Blob([blob], { type: mimeType }))
        const link = document.createElement('a')
        link.href = downloadUrl
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(downloadUrl)

        return { success: true, filename }
    } catch (error) {
        console.error('Download error:', error)
        throw error
    }
}

// Альтернативная версия скачивания - возвращает URL для скачивания
export function getDownloadStatisticsUrl(
    requiredColumns,
    year,
    isByDistrict = false,
    aggregationType = null,
    fileExtension = 'csv'
) {
    const params = new URLSearchParams({
        year: year.toString(),
        is_by_district: isByDistrict.toString(),
        file_extension: fileExtension
    })

    if (Array.isArray(requiredColumns)) {
        requiredColumns.forEach(col => {
            if (col !== null && col !== undefined) {
                params.append('required_columns', col.toString())
            }
        })
    } else if (requiredColumns) {
        params.append('required_columns', requiredColumns.toString())
    }

    if (aggregationType) {
        params.append('aggregation_type', aggregationType)
    }

    const url = `${API_PREFIX}/download-statistics/?${params.toString()}`
    console.log('Generated download URL:', url)
    return url
}

// Тестирование всех эндпоинтов
export async function testAllEndpoints() {
    console.log('Testing all API endpoints...')

    try {
        // 1. Получаем доступные годы
        console.log('1. Testing /years/')
        const yearsResponse = await getAvailableYears()
        console.log('Years:', yearsResponse)

        if (!yearsResponse?.length) {
            throw new Error('No years returned')
        }

        const testYear = yearsResponse[Math.floor(yearsResponse.length / 2)]

        // 2. Получаем доступные колонки
        console.log(`2. Testing /available-columns/ for year ${testYear}`)
        const columnsResponse = await getAvailableColumns(testYear)
        console.log('Available columns:', columnsResponse.columns_status)

        // 3. Получаем регионы
        console.log('3. Testing /regions/')
        const areasResponse = await getAreas(false)
        console.log('Regions count:', areasResponse.areas?.length)

        if (!areasResponse?.areas?.length) {
            throw new Error('No areas returned')
        }

        const firstArea = areasResponse.areas[0]

        // 4. Тестируем информацию о регионе
        console.log(`4. Testing /region-info/ for area ID ${firstArea.id}`)
        await getRegionInfo(firstArea.id, testYear)

        // 5. Тестируем информацию о показателе
        console.log(`5. Testing /feature-info/ for investments`)
        await getFeatureInfo('investments', testYear, false)

        // 6. Тестируем статистику
        console.log(`6. Testing /statistics/`)
        await getStatistics(['investments', 'population'], testYear, false)

        // 7. Тестируем графики
        console.log(`7. Testing /feature-graphs/`)
        await getFeatureGraphs('avg')

        // 8. Получаем округа (если есть)
        console.log('8. Testing /districts/')
        try {
            const districtsResponse = await getAreas(true)
            console.log('Districts count:', districtsResponse.areas?.length)
            
            if (districtsResponse.areas?.length > 0) {
                const firstDistrict = districtsResponse.areas[0]
                console.log(`9. Testing /district-info/ for district ID ${firstDistrict.id}`)
                await getDistrictInfo(firstDistrict.id, testYear, 'sum')
            }
        } catch (districtError) {
            console.log('Districts endpoint not available or error:', districtError.message)
        }

        console.log('All API tests passed!')
        return { 
            success: true, 
            years: yearsResponse,
            regionsCount: areasResponse.areas?.length,
            testYear 
        }
    } catch (error) {
        console.error('API test failed:', error)
        return { 
            success: false, 
            error: error.message,
            stack: error.stack 
        }
    }
}

// Утилита для форматирования чисел
export function formatNumber(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) {
        return '—'
    }
    
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    }).format(value)
}

// Утилита для расчета роста в процентах
export function calculateGrowth(current, previous) {
    if (previous === null || previous === undefined || previous === 0 || isNaN(previous) || isNaN(current)) {
        return null
    }
    
    return ((current - previous) / previous) * 100
}

// Экспорт всех функций
export const API = {
    // Основные функции
    getAvailableYears,
    getAvailableColumns,
    getAreas,
    getRegionInfo,
    getDistrictInfo,
    getFeatureInfo,
    getStatistics,
    getFeatureGraphs,
    downloadStatistics,
    getDownloadStatisticsUrl,
    
    // Утилиты
    formatNumber,
    calculateGrowth,
    
    // Тестирование
    testAllEndpoints
}

// Default export
export default {
    getAvailableYears,
    getAvailableColumns,
    getAreas,
    getRegionInfo,
    getDistrictInfo,
    getFeatureInfo,
    getStatistics,
    getFeatureGraphs,
    downloadStatistics,
    getDownloadStatisticsUrl,
    formatNumber,
    calculateGrowth,
    testAllEndpoints,
    API
}