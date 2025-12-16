const PREFIX = 'invest_map_v1_'

export function saveCache(key, data){
  try{ localStorage.setItem(PREFIX + key, JSON.stringify({t:Date.now(), d:data})) }catch(e){}
}

export function loadCache(key, maxAgeMs = 1000*60*60){
  try{
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const obj = JSON.parse(raw)
    if (Date.now() - obj.t > maxAgeMs) return null
    return obj.d
  }catch(e){ return null }
}
