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
        params.required_columns = requiredColumns
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
export function downloadStatistics(
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
        params.required_columns = requiredColumns
    }

    if (aggregationType) params.aggregation_type = aggregationType

    console.log('Downloading statistics:', params)

    const url = new URL(API_PREFIX + '/download-statistics/', window.location.origin)

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
                value.forEach(v => url.searchParams.append(key, v))
            } else {
                url.searchParams.append(key, value)
            }
        }
    })

    return url.toString()
}
export async function testAllEndpoints() {
    console.log('esting all API endpoints...')

    try {
        const areas = await getAreas(false)

        if (!areas?.areas?.length) {
            throw new Error('No areas returned')
        }

        const firstArea = areas.areas[0]

        await getRegionInfo(firstArea.id, 2022)
        await getFeatureInfo('investments', 2022, false)
        await getStatistics(['investments', 'population'], 2022, false)
        await getFeatureGraphs('avg')

        return { success: true }
    } catch (error) {
        console.error('API test failed:', error)
        return { success: false, error: error.message }
    }
}

// Export API
export const API = {
    getAreas,
    getRegionInfo,
    getDistrictInfo,
    getFeatureInfo,
    getStatistics,
    getFeatureGraphs,
    downloadStatistics,
    testAllEndpoints
}

export default API