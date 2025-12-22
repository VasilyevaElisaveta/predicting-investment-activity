import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { getFeatureInfo,  getDistrictInfo  } from "../api/api";
import { colorForRatio } from "../utils/colorScale";
import { YEARS } from "../config"; // Импортируем YEARS из конфига

function normalizeGeoJSON(geo) {
    function fixCoords(coords) {
        return coords.map((c) => {
            if (typeof c[0] === "number") {
                const lon = c[0] < 0 ? c[0] + 360 : c[0];
                return [lon, c[1]];
            }
            return fixCoords(c);
        });
    }

    return {
        ...geo,
        features: geo.features.map((f) => ({
            ...f,
            geometry: {
                ...f.geometry,
                coordinates: fixCoords(f.geometry.coordinates),
            },
        })),
    };
}

// Конфигурация файлов федеральных округов
const DISTRICT_GEOJSON_FILES = [
    { filename: "ДФО FEFO.geojson", name: "Дальневосточный Федеральный округ", key: "ДФО" },
    { filename: "ПФО VFD.geojson", name: "Приволжский Федеральный округ", key: "ПФО" },
    { filename: "СЗФО NWFO.geojson", name: "Северо-Западный Федеральный округ", key: "СЗФО" },
    { filename: "СКФО NCFD.geojson", name: "Северо-Кавказский Федеральный округ", key: "СКФО" },
    { filename: "СФО SFD.geojson", name: "Сибирский Федеральный округ", key: "СФО" },
    { filename: "УрФО UrFO.geojson", name: "Уральский Федеральный округ", key: "УрФО" },
    { filename: "ЦФО CFD.geojson", name: "Центральный Федеральный округ", key: "ЦФО" },
    { filename: "ЮФО SFO.geojson", name: "Южный Федеральный округ", key: "ЮФО" },
];

// Маппинг названий для сопоставления с вашими данными
const DISTRICT_NAME_MAPPING = {
    "Дальневосточный Федеральный округ": "Дальневосточный Федеральный округ",
    "Приволжский Федеральный округ": "Приволжский Федеральный округ",
    "Северо-Западный Федеральный округ": "Северо-Западный Федеральный округ",
    "Северо-Кавказский Федеральный округ": "Северо-Кавказский Федеральный округ",
    "Сибирский Федеральный округ": "Сибирский Федеральный округ",
    "Уральский Федеральный округ": "Уральский Федеральный округ",
    "Центральный Федеральный округ": "Центральный Федеральный округ",
    "Южный Федеральный округ": "Южный Федеральный округ",
};

// Маппинг названий регионов
const REGION_MAPPING = {
    "Adygey": "Республика Адыгея",
    "Altay": "Алтайский край",
    "Amur": "Амурская область",
    "Arkhangel'sk": "Архангельская область",
    "Astrakhan'": "Астраханская область",
    "Bashkortostan": "Республика Башкортостан",
    "Belgorod": "Белгородская область",
    "Bryansk": "Брянская область",
    "Buryat": "Республика Бурятия",
    "Chechnya": "Чеченская Республика",
    "Chelyabinsk": "Челябинская область",
    "Chukot": "Чукотский автономный округ",
    "Chuvash": "Чувашская Республика",
    "CityofSt.Petersburg": "г.Санкт-Петербург",
    "Dagestan": "Республика Дагестан",
    "Gorno-Altay": "Республика Алтай",
    "Ingush": "Республика Ингушетия",
    "Irkutsk": "Иркутская область",
    "Ivanovo": "Ивановская область",
    "Kabardin-Balkar": "Кабардино-Балкарская Республика",
    "Kaliningrad": "Калининградская область",
    "Kalmyk": "Республика Калмыкия",
    "Kaluga": "Калужская область",
    "Kamchatka": "Камчатский край",
    "Karachay-Cherkess": "Карачаево-Черкесская Республика",
    "Karelia": "Республика Карелия",
    "Kemerovo": "Кемеровская область",
    "Khabarovsk": "Хабаровский край",
    "Khakass": "Республика Хакасия",
    "Khanty-Mansiy": "Ханты-Мансийский автономный округ- Югра",
    "Kirov": "Кировская область",
    "Komi": "Республика Коми",
    "Kostroma": "Костромская область",
    "Krasnodar": "Краснодарский край",
    "Krasnoyarsk": "Красноярский край",
    "Kurgan": "Курганская область",
    "Kursk": "Курская область",
    "Leningrad": "Ленинградская область",
    "Lipetsk": "Липецкая область",
    "Magadan": "Магаданская область",
    "Mariy-El": "Республика Марий Эл",
    "Mordovia": "Республика Мордовия",
    "MoscowCity": "г.Москва",
    "Moskva": "Московская область",
    "Murmansk": "Мурманская область",
    "Nenets": "Ненецкий автономный округ",
    "Nizhegorod": "Нижегородская область",
    "NorthOssetia": "Республика Северная Осетия - Алания",
    "Novgorod": "Новгородская область",
    "Novosibirsk": "Новосибирская область",
    "Omsk": "Омская область",
    "Orel": "Орловская область",
    "Orenburg": "Оренбургская область",
    "Penza": "Пензенская область",
    "Perm'": "Пермский край",
    "Primor'ye": "Приморский край",
    "Pskov": "Псковская область",
    "Rostov": "Ростовская область",
    "Ryazan'": "Рязанская область",
    "Sakha": "Республика Саха (Якутия)",
    "Sakhalin": "Сахалинская область",
    "Samara": "Самарская область",
    "Saratov": "Саратовская область",
    "Smolensk": "Смоленская область",
    "Stavropol'": "Ставропольский край",
    "Sverdlovsk": "Свердловская область",
    "Tambov": "Тамбовская область",
    "Tatarstan": "Республика Татарстан",
    "Tomsk": "Томская область",
    "Tula": "Тульская область",
    "Tuva": "Республика Тыва",
    "Tver'": "Тверская область",
    "Tyumen'": "Тюменская область",
    "Udmurt": "Удмуртская Республика",
    "Ul'yanovsk": "Ульяновская область",
    "Vladimir": "Владимирская область",
    "Volgograd": "Волгоградская область",
    "Vologda": "Вологодская область",
    "Voronezh": "Воронежская область",
    "Yamal-Nenets": "Ямало-Ненецкий автономный округ",
    "Yaroslavl'": "Ярославская область",
    "Yevrey": "Еврейская автономная область",
    "Zabaykal'ye": "Забайкальский край",
};

export default function MapView({
    year,
    feature,
    isByDistrict,
    areas,
    onRegionSelect,
    minVal = '',
    maxVal = '',
    showPos = true,
    showNeg = true,
    showStable = true,
}) {
    const containerRef = useRef(null);
    const [regionsGeo, setRegionsGeo] = useState(null);
    const [districtsGeo, setDistrictsGeo] = useState(null);
    const [featuresData, setFeaturesData] = useState([]);
    const [districtFeaturesData, setDistrictFeaturesData] = useState([]);
    const [geoError, setGeoError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    // Получаем минимальный год из доступных
    const minAvailableYear = YEARS.length > 0 ? Math.min(...YEARS) : 2014;

    console.log("MapView received:", {
        year,
        minAvailableYear,
        feature,
        minVal,
        maxVal,
        showPos,
        showNeg,
        showStable,
        isByDistrict
    });

    // Load GeoJSON для регионов
    useEffect(() => {
        fetch("/russia-regions.geojson")
            .then((r) => {
                if (!r.ok) throw new Error("GeoJSON load error");
                return r.json();
            })
            .then((data) => setRegionsGeo(normalizeGeoJSON(data)))
            .catch((e) => {
                console.error(e);
                setGeoError("Не удалось загрузить карту регионов");
            });
    }, []);

    // Load GeoJSON для федеральных округов
    useEffect(() => {
        setLoadingDistricts(true);
        
        const loadDistrictsGeoJSON = async () => {
            try {
                const districtPromises = DISTRICT_GEOJSON_FILES.map(async (district) => {
                    try {
                        const response = await fetch(`/${district.filename}`);
                        if (!response.ok) {
                            console.warn(`Could not load ${district.filename}`);
                            return null;
                        }
                        const geoData = await response.json();
                        
                        // Добавляем свойства к каждому feature
                        const features = geoData.features.map(feature => ({
                            ...feature,
                            properties: {
                                ...feature.properties,
                                DISTRICT_NAME: district.name,
                                DISTRICT_KEY: district.key,
                                NAME_1: district.name 
                            }
                        }));
                        
                        return {
                            type: "FeatureCollection",
                            features: features
                        };
                    } catch (error) {
                        console.error(`Error loading ${district.filename}:`, error);
                        return null;
                    }
                });

                const districtGeos = await Promise.all(districtPromises);
                const validGeos = districtGeos.filter(geo => geo !== null);
                
                if (validGeos.length > 0) {
                    // Объединяем все features в один FeatureCollection
                    const combinedFeatures = validGeos.flatMap(geo => geo.features);
                    const combinedGeo = {
                        type: "FeatureCollection",
                        features: combinedFeatures
                    };
                    
                    console.log(`Loaded ${validGeos.length} district GeoJSON files`);
                    console.log("District names:", validGeos.map(g => g.features[0]?.properties.DISTRICT_NAME));
                    
                    setDistrictsGeo(normalizeGeoJSON(combinedGeo));
                } else {
                    console.warn("No district GeoJSON files loaded");
                }
            } catch (error) {
                console.error("Error loading district GeoJSON files:", error);
            } finally {
                setLoadingDistricts(false);
            }
        };

        loadDistrictsGeoJSON();
    }, []);

    // Load feature data
    useEffect(() => {
        const loadData = async () => {
            try {
                console.log("Loading features data for:", {
                    feature,
                    year,
                    isByDistrict
                });

                const aggregationType = isByDistrict ? 
                    (feature === 'unemployment' ? 'avg' : 'sum') : 
                    null;

                const response = await getFeatureInfo(
                    feature,
                    year,
                    isByDistrict, 
                    aggregationType,
                    false,
                    null, 
                    null 
                );
                
                console.log("Features data loaded:", response);
                
                if (response && response.features) {
                    if (isByDistrict) {
                        // Для округов
                        let filteredData = response.features;
                        
                        if (minVal !== '' || maxVal !== '') {
                            filteredData = filteredData.filter(f => {
                                const value = f.feature_value;
                                if (value === undefined || value === null) return false;
                                
                                const numValue = Number(value);
                                if (isNaN(numValue)) return false;
                                
                                if (minVal !== '' && numValue < Number(minVal)) return false;
                                if (maxVal !== '' && numValue > Number(maxVal)) return false;
                                
                                return true;
                            });
                        }
                        
                        setDistrictFeaturesData(filteredData);
                        console.log(`District data: ${filteredData.length} округов`);
                    } else {
                        // Для регионов
                        let filteredData = response.features;
                        
                        if (minVal !== '' || maxVal !== '') {
                            filteredData = filteredData.filter(f => {
                                const value = f.feature_value;
                                if (value === undefined || value === null) return false;
                                
                                const numValue = Number(value);
                                if (isNaN(numValue)) return false;
                                
                                if (minVal !== '' && numValue < Number(minVal)) return false;
                                if (maxVal !== '' && numValue > Number(maxVal)) return false;
                                
                                return true;
                            });
                        }
                        
                        setFeaturesData(filteredData);
                        console.log(`Region data: ${filteredData.length} регионов`);
                    }
                } else {
                    console.log("No features data received");
                    if (isByDistrict) {
                        setDistrictFeaturesData([]);
                    } else {
                        setFeaturesData([]);
                    }
                }
            } catch (error) {
                console.error("Error loading features:", error);
                if (isByDistrict) {
                    setDistrictFeaturesData([]);
                } else {
                    setFeaturesData([]);
                }
            }
        };

        if (isByDistrict) {
            // Для округов ждем загрузки гео-данных
            if (districtsGeo) {
                loadData();
            }
        } else {
            // Для регионов ждем загрузки гео-данных
            if (regionsGeo) {
                loadData();
            }
        }
    }, [regionsGeo, districtsGeo, feature, year, isByDistrict, minVal, maxVal]);

    useEffect(() => {
        if (!containerRef.current) return;
        
        const container = containerRef.current;
        container.innerHTML = "";
        
        if (isByDistrict && (!districtsGeo || loadingDistricts)) {
            container.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #666;
                    font-size: 16px;
                ">
                    ${loadingDistricts ? 'Загрузка карты федеральных округов...' : 'Карта округов не загружена'}
                </div>
            `;
            return;
        }
        
        // Если пытаемся показать регионы, но они еще не загружены
        if (!isByDistrict && !regionsGeo) {
            container.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #666;
                    font-size: 16px;
                ">
                    Загрузка карты регионов...
                </div>
            `;
            return;
        }

        const width = container.clientWidth;
        const height = container.clientHeight;

        const svg = d3.select(container)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const projection = d3.geoAlbers()
            .rotate([-105, 0])
            .center([-40, 70])
            .parallels([50, 70])
            .scale(width * 0.7)
            .clipAngle(180);

        const path = d3.geoPath(projection);

        if (isByDistrict) {
            // ОКРУГИ
            
            console.log("RENDERING DISTRICTS MODE");
            console.log("Districts Geo features count:", districtsGeo.features.length);
            console.log("First district feature:", districtsGeo.features[0]);
            
            const districtDataMap = new Map();
            districtFeaturesData.forEach(f => {
                if (f.area_name) {
                    districtDataMap.set(f.area_name, f);
                    console.log(`District data for ${f.area_name}:`, f);
                }
            });

            console.log("Drawing DISTRICTS map:", {
                totalDistricts: districtsGeo.features.length,
                districtFeaturesData: districtFeaturesData.length,
                availableDistricts: Array.from(districtDataMap.keys())
            });

            const districts = svg.append("g")
                .selectAll("path")
                .data(districtsGeo.features)
                .enter()
                .append("path")
                .attr("class", "district-path")
                .attr("d", path)
                .attr("stroke", "#1e3a8a")
                .attr("stroke-width", 1.5)
                .style("cursor", "pointer")
                .attr("fill", (d) => {
                    const districtName = d.properties.DISTRICT_NAME;
                    
                    if (!districtName) {
                        console.log("No district name for feature:", d);
                        return "#e5e7eb";
                    }
                    
                    console.log(`Processing district: ${districtName}`);
                    
                    // Получаем данные по округу
                    const featureData = districtDataMap.get(districtName);
                    
                    // Если нет данных для округа
                    if (!featureData) {
                        console.log(`No feature data for district: ${districtName}`);
                        return "#e5e7eb";
                    }
                    
                    // Для минимального года - серый цвет (нет динамики)
                    if (year === minAvailableYear) {
                        console.log(`${minAvailableYear} год (базовый) - серый цвет для ${districtName}`);
                        return "#e5e7eb";
                    }
                    
                    // Получаем feature_ratio (динамику)
                    const ratio = featureData.feature_ratio;
                    
                    if (ratio === undefined || ratio === null || isNaN(ratio)) {
                        console.log(`No ratio for district ${districtName}:`, ratio);
                        return "#e5e7eb";
                    }
                    
                    const ratioValue = Number(ratio);
                    
                    // Стабильные (±1%)
                    const isStable = Math.abs(ratioValue) <= 1;
                    const isPositive = ratioValue > 1;
                    const isNegative = ratioValue < -1;
                    
                    console.log(`District ${districtName}: ratio=${ratioValue}, stable=${isStable}, positive=${isPositive}, negative=${isNegative}`);
                    
                    if (isStable && !showStable) {
                        console.log(`Filtered out (stable): ${districtName}`);
                        return "#e5e7eb";
                    }
                    
                    if (isPositive && !showPos) {
                        console.log(`Filtered out (positive): ${districtName}`);
                        return "#e5e7eb";
                    }
                    
                    if (isNegative && !showNeg) {
                        console.log(`Filtered out (negative): ${districtName}`);
                        return "#e5e7eb";
                    }
                    
                    // Все фильтры пройдены - красим по шкале
                    const color = colorForRatio(ratioValue);
                    console.log(`District ${districtName}: ratio=${ratioValue}, color=${color}`);
                    return color;
                })
                .on("click", async (event, d) => {
                    event.stopPropagation();
                    console.log("CLICK ON DISTRICT");
                    
                    const districtName = d.properties.DISTRICT_NAME;
                    
                    if (!districtName) {
                        console.log("No district name for clicked feature");
                        return;
                    }
                    
                    console.log("Clicked district:", districtName);
                    
                    // Показываем индикатор загрузки
                    const container = containerRef.current;
                    const loadingDiv = document.createElement("div");
                    loadingDiv.innerHTML = `
                        <div style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(255, 255, 255, 0.8);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 1000;
                        ">
                            <div style="
                                background: white;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                                text-align: center;
                            ">
                                <div style="
                                    width: 40px;
                                    height: 40px;
                                    border: 4px solid #f3f3f3;
                                    border-top: 4px solid #3498db;
                                    border-radius: 50%;
                                    margin: 0 auto 15px;
                                    animation: spin 1s linear infinite;
                                "></div>
                                <div>Загрузка данных округа...</div>
                            </div>
                        </div>
                    `;
                    container.appendChild(loadingDiv);
                    
                    try {
                        const districtArea = areas.find(area => 
                            area.area_name === districtName
                        );
                        
                        if (!districtArea) {
                            console.log("District not found in areas for:", districtName);
                            console.log("Available areas:", areas.map(a => a.area_name));
                            container.removeChild(loadingDiv);
                            return;
                        }
                        
                        console.log("Found district in areas:", districtArea);
                        
                        let fullDistrictData = null;
                        try {
                            console.log(`Загрузка данных округа ID ${districtArea.id}, год ${year}...`);
                            
                            fullDistrictData = await getDistrictInfo(districtArea.id, year, 'sum');
                            
                            console.log("Данные округа (sum):", fullDistrictData);
                            
                        } catch (apiError) {
                            console.error("Ошибка загрузки данных округа:", apiError);
                            container.removeChild(loadingDiv);
                            return;
                        }
                        
                        const districtDataMap = new Map();
                        districtFeaturesData.forEach(f => {
                            if (f.area_name) {
                                districtDataMap.set(f.area_name, f);
                            }
                        });
                        
                        const districtFeatureData = districtDataMap.get(districtName);
                        console.log("Данные по основному показателю:", districtFeatureData);
                        
                        // Делим зарплату и безработицу на количество регионов
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
                        
                        const regionCount = districtsWithRegionsCount[districtName] || 1;
                        console.log(`Количество регионов в округе ${districtName}: ${regionCount}`);
                        
                        // Создаем скорректированные данные
                        const correctedDistrictData = {
                            ...fullDistrictData,
                            average_salary: fullDistrictData?.average_salary ? 
                                Math.round(fullDistrictData.average_salary / regionCount * 10) / 10 : null,
                            unemployment: fullDistrictData?.unemployment ? 
                                Math.round(fullDistrictData.unemployment / regionCount * 10) / 10 : null
                        };
                        
                        console.log("Скорректированные данные:", correctedDistrictData);
                        
                        const districtData = {
                            id: districtArea.id,
                            area_name: districtName,
                            region_name: districtName,
                            year: year,
                            isDistrict: true,
                            is_base_year: year === minAvailableYear, // Используем minAvailableYear
                            
                            feature_value: districtFeatureData?.feature_value || correctedDistrictData?.[feature] || null,
                            feature_ratio: districtFeatureData?.feature_ratio || null,
                            
                            investments: correctedDistrictData?.investments || null,
                            grp: correctedDistrictData?.grp || null,
                            population: correctedDistrictData?.population || null,
                            average_salary: correctedDistrictData?.average_salary || null,
                            unemployment: correctedDistrictData?.unemployment || null,
                            crimes: correctedDistrictData?.crimes || null,
                            retail_turnover: correctedDistrictData?.retail_turnover || null,
                            cash_expenses: correctedDistrictData?.cash_expenses || null,
                            scientific_research: correctedDistrictData?.scientific_research || null,
                            district_name: correctedDistrictData?.district_name || districtName
                        };
                        
                        console.log("Итоговые данные для модального окна:", districtData);
                        
                        setSelectedId(String(districtArea.id));
                        
                        if (onRegionSelect) {
                            onRegionSelect(districtData);
                        } else {
                            console.error("onRegionSelect is not defined!");
                        }
                        
                    } catch (error) {
                        console.error("Error processing district click:", error);
                    } finally {
                        // Убираем индикатор загрузки
                        if (container && container.contains(loadingDiv)) {
                            container.removeChild(loadingDiv);
                        }
                    }
                })
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .attr("stroke-width", 3.0)
                        .attr("stroke", "#ef4444");
                    
                    const districtName = d.properties.DISTRICT_NAME;
                    const featureData = districtDataMap.get(districtName);
                    
                    let tooltipText = districtName || "Неизвестный округ";
                    
                    if (featureData) {
                        tooltipText += `\nГод: ${year}`;
                        
                        if (featureData.feature_value !== undefined && featureData.feature_value !== null) {
                            const formattedValue = new Intl.NumberFormat('ru-RU').format(featureData.feature_value);
                            tooltipText += `\n${feature}: ${formattedValue}`;
                        }
                        
                        // Для минимального года динамики нет
                        if (year === minAvailableYear) {
                            tooltipText += `\nДинамика: базовый год (${minAvailableYear})`;
                        } else if (featureData.feature_ratio !== undefined && featureData.feature_ratio !== null) {
                            const ratioValue = Number(featureData.feature_ratio);
                            const sign = ratioValue > 0 ? '+' : '';
                            tooltipText += `\nДинамика: ${sign}${ratioValue.toFixed(1)}%`;
                        }
                    } else {
                        tooltipText += `\nДанные не найдены`;
                    }
                    
                    const title = d3.select(this).select("title");
                    if (title.empty()) {
                        d3.select(this).append("title").text(tooltipText);
                    } else {
                        title.text(tooltipText);
                    }
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .attr("stroke-width", 1.5)
                        .attr("stroke", "#1e3a8a");
                })
                .append("title")
                .text(d => {
                    const districtName = d.properties.DISTRICT_NAME;
                    return districtName || "Неизвестный округ";
                });

            districts.style("stroke-width", (d) => {
                const districtName = d.properties.DISTRICT_NAME;
                if (!districtName) return 1.5;
                
                const foundDistrict = areas.find(a => a.area_name === districtName);
                if (foundDistrict && String(foundDistrict.id) === selectedId) {
                    console.log(`Selected district: ${districtName}`);
                    return 3.5;
                }
                return 1.5;
            })
            .style("stroke", (d) => {
                const districtName = d.properties.DISTRICT_NAME;
                if (!districtName) return "#1e3a8a";
                
                const foundDistrict = areas.find(a => a.area_name === districtName);
                if (foundDistrict && String(foundDistrict.id) === selectedId) {
                    return "#ff6b6b";
                }
                return "#1e3a8a";
            });

        } else {
            // РЕГИОНЫ
            
            console.log("RENDERING REGIONS MODE");
            
            const featuresMap = new Map();
            featuresData.forEach(f => {
                if (f.area_name) {
                    featuresMap.set(f.area_name, f);
                }
                if (f.area_id) {
                    featuresMap.set(String(f.area_id), f);
                }
            });

            console.log("Drawing REGIONS map:", {
                totalRegions: regionsGeo.features.length,
                featuresData: featuresData.length,
                filters: { showPos, showNeg, showStable }
            });

            const regions = svg.append("g")
                .selectAll("path")
                .data(regionsGeo.features)
                .enter()
                .append("path")
                .attr("class", "region-path")
                .attr("d", path)
                .attr("stroke", "#1e3a8a")
                .attr("stroke-width", 0.6)
                .style("cursor", "pointer")
                .attr("fill", (d) => {
                    const geoName = d.properties.NAME_1;
                    if (!geoName) {
                        return "#e5e7eb";
                    }
                    
                    const russianName = REGION_MAPPING[geoName];
                    if (!russianName) {
                        return "#e5e7eb";
                    }
                    
                    const featureData = featuresMap.get(russianName);
                    
                    // Если нет данных для региона
                    if (!featureData) {
                        return "#e5e7eb";
                    }
                    
                    // Для минимального года - серый цвет (нет динамики)
                    if (year === minAvailableYear) {
                        return "#e5e7eb";
                    }
                    
                    // Получаем feature_ratio (динамику)
                    const ratio = featureData.feature_ratio;
                    
                    // Если нет данных о динамике
                    if (ratio === undefined || ratio === null || isNaN(ratio)) {
                        return "#e5e7eb";
                    }
                    
                    const ratioValue = Number(ratio);
                    
                    // Стабильные (±1%)
                    const isStable = Math.abs(ratioValue) <= 1;
                    const isPositive = ratioValue > 1;
                    const isNegative = ratioValue < -1;
                    
                    if (isStable && !showStable) {
                        return "#e5e7eb";
                    }
                    
                    if (isPositive && !showPos) {
                        return "#e5e7eb";
                    }
                    
                    if (isNegative && !showNeg) {
                        return "#e5e7eb";
                    }
                    
                    // Все фильтры пройдены - красим по шкале
                    return colorForRatio(ratioValue);
                })
                .on("click", (event, d) => {
                    event.stopPropagation();
                    console.log("CLICK ON REGION");
                    
                    const geoName = d.properties.NAME_1;
                    const russianName = REGION_MAPPING[geoName];
                    
                    if (!russianName) {
                        return;
                    }
                    
                    console.log("Clicked region:", russianName);
                    
                    // Ищем area по русскому названию
                    const foundArea = areas.find(area => 
                        area.area_name === russianName
                    );
                    
                    if (!foundArea) {
                        console.log("Area not found for:", russianName);
                        return;
                    }
                    
                    console.log("Found area:", foundArea);
                    
                    // Ищем feature data для этого area
                    const featureData = featuresMap.get(russianName);
                    
                    console.log("Feature data for click:", featureData);
                    
                    // Формируем данные для модального окна
                    const regionData = {
                        id: foundArea.id,
                        area_name: foundArea.area_name,
                        region_name: russianName,
                        year: year,
                        is_base_year: year === minAvailableYear, // Используем minAvailableYear
                        // Копируем все данные из featureData
                        ...(featureData || {}),
                        feature_value: featureData?.feature_value || null,
                        feature_ratio: featureData?.feature_ratio || null
                    };
                    
                    console.log("Sending to modal:", regionData);
                    
                    setSelectedId(String(foundArea.id));
                    
                    if (onRegionSelect) {
                        onRegionSelect(regionData);
                    } else {
                        console.error("onRegionSelect is not defined!");
                    }
                })
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .attr("stroke-width", 2)
                        .attr("stroke", "#ef4444");
                    
                    const geoName = d.properties.NAME_1;
                    const russianName = REGION_MAPPING[geoName];
                    const featureData = featuresMap.get(russianName);
                    
                    let tooltipText = russianName || geoName || "Неизвестный регион";
                    
                    if (featureData) {
                        tooltipText += `\nГод: ${year}`;
                        
                        if (featureData.feature_value !== undefined && featureData.feature_value !== null) {
                            const formattedValue = new Intl.NumberFormat('ru-RU').format(featureData.feature_value);
                            tooltipText += `\n${feature}: ${formattedValue}`;
                        }
                        
                        if (year === minAvailableYear) {
                            tooltipText += `\nДинамика: базовый год (${minAvailableYear})`;
                        } else if (featureData.feature_ratio !== undefined && featureData.feature_ratio !== null) {
                            const ratioValue = Number(featureData.feature_ratio);
                            const sign = ratioValue > 0 ? '+' : '';
                            tooltipText += `\nДинамика: ${sign}${ratioValue.toFixed(1)}%`;
                        }
                    } else {
                        tooltipText += `\nДанные не найдены`;
                    }
                    
                    const title = d3.select(this).select("title");
                    if (title.empty()) {
                        d3.select(this).append("title").text(tooltipText);
                    } else {
                        title.text(tooltipText);
                    }
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .attr("stroke-width", 0.6)
                        .attr("stroke", "#1e3a8a");
                })
                .append("title")
                .text(d => {
                    const geoName = d.properties.NAME_1;
                    const russianName = REGION_MAPPING[geoName];
                    return russianName || geoName || "Неизвестный регион";
                });

            // Выделение выбранного региона
            regions.style("stroke-width", (d) => {
                const geoName = d.properties.NAME_1;
                const russianName = REGION_MAPPING[geoName];
                if (!russianName) return 0.6;
                
                const foundArea = areas.find(a => a.area_name === russianName);
                if (foundArea && String(foundArea.id) === selectedId) {
                    return 2.5;
                }
                return 0.6;
            })
            .style("stroke", (d) => {
                const geoName = d.properties.NAME_1;
                const russianName = REGION_MAPPING[geoName];
                if (!russianName) return "#1e3a8a";
                
                const foundArea = areas.find(a => a.area_name === russianName);
                if (foundArea && String(foundArea.id) === selectedId) {
                    return "#ff6b6b";
                }
                return "#1e3a8a";
            });
        }

        // Заголовок карты
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 28)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "700")
            .style("font-family", "Montserrat, sans-serif")
            .text(`Россия - ${year} (${isByDistrict ? 'Федеральные округа' : 'Регионы'})`);

    }, [
        regionsGeo, districtsGeo, featuresData, districtFeaturesData, 
        year, feature, areas, onRegionSelect, selectedId, 
        showPos, showNeg, showStable, isByDistrict, loadingDistricts,
        minAvailableYear // Добавляем в зависимости
    ]);

    if (geoError) return <div className="panel error-panel">{geoError}</div>;

    return (
        <div 
            ref={containerRef} 
            className="panel map-panel" 
            style={{ 
                width: "100%", 
                height: "85vh",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative"
            }}
        />
    );
}
