import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import FiltersPanel from './components/FiltersPanel'
import MapView from './components/MapView'
import RegionModal from './components/RegionModal'
import InstructionModal from './components/InstructionModal'
import DataPage from './pages/DataPage'
import StatsPage from './pages/StatsPage'
import { fetchAvailableYears, MAP_CONFIG } from './config'
import { getAreas, getRegionInfo, getDistrictInfo  } from './api/api'
import './styles.css'

export default function App() {
    // Состояния
    const [activeTab, setActiveTab] = useState('map')
    const [years, setYears] = useState([]) 
    const [year, setYear] = useState(MAP_CONFIG.defaultYear)
    const [feature, setFeature] = useState('investments')
    const [isByDistrict, setIsByDistrict] = useState(false)
    const [minVal, setMinVal] = useState('')
    const [maxVal, setMaxVal] = useState('')
    const [showPos, setShowPos] = useState(true)
    const [showNeg, setShowNeg] = useState(true)
    const [showStable, setShowStable] = useState(true)
    const [areas, setAreas] = useState([])
    const [selectedRegion, setSelectedRegion] = useState(null)
    const [showInstr, setShowInstr] = useState(false)
    const [loadingAreas, setLoadingAreas] = useState(true)
    const [loadingYears, setLoadingYears] = useState(true) 
    const [yearsError, setYearsError] = useState(null)
    const [areasError, setAreasError] = useState(null)
    const [filtersApplied, setFiltersApplied] = useState(false)

    useEffect(() => {
        const loadYears = async () => {
            setLoadingYears(true)
            setYearsError(null)
            try {
                console.log('Загрузка доступных годов из API...')
                const availableYears = await fetchAvailableYears()
                console.log('Доступные годы:', availableYears)
                
                if (availableYears && availableYears.length > 0) {
                    const sortedYears = [...availableYears].sort((a, b) => b - a)
                    setYears(sortedYears)
                    
                    const maxAvailableYear = Math.max(...availableYears)
                    if (year !== maxAvailableYear) {
                        setYear(maxAvailableYear)
                        MAP_CONFIG.defaultYear = maxAvailableYear 
                    }
                } else {
                    throw new Error('Нет доступных годов')
                }
            } catch (error) {
                console.error('Ошибка загрузки годов:', error)
                setYearsError(`Ошибка загрузки годов: ${error.message}`)
                const fallbackYears = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
                setYears(fallbackYears)
            } finally {
                setLoadingYears(false)
            }
        }

        loadYears()
    }, [])

    // Загрузка списка регионов/округов
    useEffect(() => {
        const loadAreas = async () => {
            setLoadingAreas(true)
            setAreasError(null)
            try {
                console.log(`Загрузка ${isByDistrict ? 'округов' : 'регионов'}...`)
                const response = await getAreas(isByDistrict)
                console.log('Ответ API:', response)
                
                if (response && response.areas) {
                    const areasData = response.areas
                    console.log(`Загружено ${areasData.length} ${isByDistrict ? 'округов' : 'регионов'}`)
                    console.log('Первые 5 регионов:', areasData.slice(0, 5))
                    setAreas(areasData)
                } else {
                    throw new Error('Пустой ответ от сервера')
                }
            } catch (error) {
                console.error('Ошибка загрузки регионов:', error)
                setAreasError(`Ошибка загрузки данных: ${error.message}`)
                setAreas([])
            } finally {
                setLoadingAreas(false)
            }
        }

        loadAreas()
    }, [isByDistrict])

    // Применение фильтров
    const applyFilters = () => {
        console.log('Применение фильтров...')
        console.log('Фильтры:', { 
            minVal, 
            maxVal, 
            showPos, 
            showNeg, 
            showStable 
        })
        
        // Устанавливаем флаг применения фильтров
        setFiltersApplied(!filtersApplied)
        
        if (activeTab !== "map") {
            setActiveTab('map')
        }
    }

    // Сброс фильтров
    const resetFilters = () => {
        setMinVal('')
        setMaxVal('')
        setShowPos(true)
        setShowNeg(true)
        setShowStable(true)
        setFiltersApplied(!filtersApplied) 
        console.log('Фильтры сброшены')
    }

    // Обработчик изменения года
    const handleYearChange = (newYear) => {
        if (years.length > 0) {
            const minYear = Math.min(...years)
            const maxYear = Math.max(...years)
            const validYear = Math.min(Math.max(newYear, minYear), maxYear)
            setYear(validYear)
        }
    }

    // Обработчик переключения вкладок
    const handleTabChange = (tab) => {
        setActiveTab(tab)
        if (tab === "instr") {
            setShowInstr(true)
        }
    }

    const handleRegionSelect = async (regionData) => {
        console.log('ВЫБОР РЕГИОНА')
        console.log('Данные из MapView:', regionData)
        
        // Если это округ и у нас уже есть все данные из API
        if (regionData.isDistrict && regionData.investments !== undefined) {
            console.log('Уже есть полные данные округа')
            setSelectedRegion({
                ...regionData,
                is_base_year: year === Math.min(...years),
                year: year
            });
            return;
        }
        
        if (year === Math.min(...years)) {
            console.log(`${year} год - базовый год, динамика не рассчитывается`)
        }
        
        // Если есть ID региона, пробуем получить полные данные из API
        if (regionData.id) {
            try {
                console.log(`Получение данных для региона ID ${regionData.id}, год ${year}`)
                
                let fullRegionData;
                if (regionData.isDistrict) {
                    // Для округов используем getDistrictInfo
                    console.log('Загрузка полных данных округа...')
                    
                    const districtData = await getDistrictInfo(regionData.id, year, 'sum');
                    console.log('Данные округа (sum):', districtData);
                    
                    // Количество регионов в каждом округе, которые считываются
                    const districtsWithRegionsCount = {
                        'Центральный Федеральный округ': 18,
                        'Северо-Западный Федеральный округ': 11,
                        'Южный Федеральный округ': 8,
                        'Северо-Кавказский Федеральный округ': 7,
                        'Приволжский Федеральный округ': 14,
                        'Уральский Федеральный округ': 6,
                        'Сибирский Федеральный округ': 10,
                        'Дальневосточный Федеральный округ': 11
                    };
                    
                    const regionCount = districtsWithRegionsCount[regionData.area_name] || 1;
                    console.log(`Количество регионов в округе ${regionData.area_name}: ${regionCount}`);
                    
                    // Создаем скорректированные данные
                    fullRegionData = {
                        ...districtData,
                        // Для зарплаты и безработицы делим на количество регионов
                        average_salary: districtData?.average_salary ? 
                            districtData.average_salary / regionCount : null,
                        unemployment: districtData?.unemployment ? 
                            districtData.unemployment / regionCount : null
                    };
                    
                    console.log('Скорректированные данные округа:', fullRegionData);
                    console.log(`Зарплата после коррекции: ${fullRegionData.average_salary}`);
                    console.log(`Безработица после коррекции: ${fullRegionData.unemployment}`);
                    
                } else {
                    // Для регионов используем getRegionInfo
                    console.log('Загрузка полных данных региона...')
                    fullRegionData = await getRegionInfo(regionData.id, year);
                }
                
                console.log('Полные данные из API:', fullRegionData)
                
                // Объединяем данные из MapView с данными из API
                const combinedData = {
                    ...regionData,
                    ...fullRegionData,
                    // Убедимся что есть название
                    region_name: fullRegionData?.region_name || 
                                fullRegionData?.area_name || 
                                fullRegionData?.district_name ||
                                regionData.region_name || 
                                regionData.area_name,
                    is_base_year: year === Math.min(...years),
                    year: year,
                    isDistrict: regionData.isDistrict || false
                };
                
                console.log('Объединенные данные для модального окна:', combinedData)
                setSelectedRegion(combinedData)
                
            } catch (error) {
                console.error('Ошибка получения данных региона:', error)
                console.log('Используем данные из MapView')
                setSelectedRegion({
                    ...regionData,
                    is_base_year: year === Math.min(...years),
                    year: year,
                    isDistrict: regionData.isDistrict || false
                })
            }
        } else {
            console.log('Нет ID региона, используем данные из MapView')
            setSelectedRegion({
                ...regionData,
                is_base_year: year === Math.min(...years),
                year: year,
                isDistrict: regionData.isDistrict || false
            })
        }
    }

    const handleCloseRegionModal = () => {
        console.log('Закрытие модального окна региона')
        setSelectedRegion(null)
    }

    // Обработчик закрытия инструкции
    const handleCloseInstrModal = () => {
        setShowInstr(false)
        setActiveTab('map')
    }

    // Дебаг информация
    console.log('СОСТОЯНИЕ')
    console.log('Доступные годы:', years)
    console.log('Текущий год:', year)
    console.log('Выбран регион:', !!selectedRegion)
    console.log('Активная вкладка:', activeTab)
    console.log('Показатель:', feature)
    console.log('По округам:', isByDistrict)
    console.log('Количество регионов:', areas.length)
    console.log('Фильтры:', {
        minVal, maxVal, showPos, showNeg, showStable
    })

    return (
        <div className="app">
            <Header
                year={year}
                setYear={handleYearChange}
                years={years}
                loadingYears={loadingYears}
                yearsError={yearsError}
                onNav={handleTabChange}
                currentTab={activeTab}
            />

            <div className="main">
                {activeTab === 'map' && (
                    <>
                        <aside className="sidebar">
                            <FiltersPanel
                                feature={feature}
                                setFeature={setFeature}
                                minVal={minVal}
                                setMinVal={setMinVal}
                                maxVal={maxVal}
                                setMaxVal={setMaxVal}
                                showPos={showPos}
                                setShowPos={setShowPos}
                                showNeg={showNeg}
                                setShowNeg={setShowNeg}
                                showStable={showStable}
                                setShowStable={setShowStable}
                                isByDistrict={isByDistrict}
                                setIsByDistrict={setIsByDistrict}
                                onApply={applyFilters}
                                onReset={resetFilters}
                                loadingAreas={loadingAreas}
                                areasError={areasError}
                                areasCount={areas.length}
                            />
                        </aside>

                        <main className="content">
                            {loadingAreas || loadingYears ? (
                                <div className="panel loading-panel">
                                    <div className="loader">
                                        <div className="spinner"></div>
                                        <div>Загрузка карты...</div>
                                        {loadingYears && <div style={{ fontSize: '14px', marginTop: '10px' }}>Загрузка доступных годов</div>}
                                    </div>
                                </div>
                            ) : areasError ? (
                                <div className="panel error-panel">
                                    <div style={{ fontSize: '48px', marginBottom: '20px' }}></div>
                                    <h3>Ошибка загрузки</h3>
                                    <p>{areasError}</p>
                                    <button
                                        className="btn"
                                        onClick={() => window.location.reload()}
                                        style={{ marginTop: '20px' }}
                                    >
                                        Обновить страницу
                                    </button>
                                </div>
                            ) : areas.length === 0 ? (
                                <div className="panel empty-panel">
                                    <div style={{ fontSize: '48px', marginBottom: '20px' }}></div>
                                    <h3>Нет данных</h3>
                                    <p>Не удалось загрузить данные регионов</p>
                                </div>
                            ) : (
                                <MapView
                                    key={`map-${year}-${feature}-${isByDistrict}-${minVal}-${maxVal}-${showPos}-${showNeg}-${showStable}-${filtersApplied}`}
                                    year={year}
                                    feature={feature}
                                    isByDistrict={isByDistrict}
                                    areas={areas}
                                    onRegionSelect={handleRegionSelect}
                                    // Передаем фильтры в MapView
                                    minVal={minVal}
                                    maxVal={maxVal}
                                    showPos={showPos}
                                    showNeg={showNeg}
                                    showStable={showStable}
                                />
                            )}
                        </main>
                    </>
                )}
                {activeTab === 'data' && (
                <DataPage
                    year={year}
                    isByDistrict={isByDistrict}
                />
                )}

                {activeTab === 'stats' && (
                    <StatsPage
                        year={year}
                    />
                )}

                {activeTab === 'instr' && !showInstr && (
                    <div className="panel instruction-panel">
                        <h3>Инструкция по использованию сервиса</h3>
                        <p>Инструкция загружается...</p>
                    </div>
                )}
            </div>

            {/* Модальное окно с информацией о регионе */}
            {selectedRegion && (
                <RegionModal
                    region={selectedRegion}
                    onClose={handleCloseRegionModal}
                />
            )}

            {/* Модальное окно с инструкцией */}
            {showInstr && (
                <InstructionModal
                    onClose={handleCloseInstrModal}
                />
            )}
        </div>
    );
}