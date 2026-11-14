// Approximate centre of origin for every rhythm: [latitude, longitude, place]. Used by the node map's World
// layout (js/nodemap.js). Points are deliberately rough (a city or area the style is associated with), not a claim
// about a single birthplace. Rhythms that share a point are fanned out into a small ring on the map.
window.RX = window.RX || {};

(function () {
  const P = {
    conakry: [9.6, -13.6, 'Conakry, Guinea'], hamana: [10.6, -9.9, 'Hamana (Kouroussa), Guinea'], forest: [8.7, -8.6, 'Forest region, Guinea'],
    wassolon: [11.0, -8.2, 'Wassolon, Mali / Guinea'], kankan: [10.4, -9.3, 'Kankan, Guinea'],
    essaouira: [31.5, -9.8, 'Essaouira, Morocco'], addis: [9.0, 38.7, 'Addis Ababa, Ethiopia'], harare: [-17.8, 31.0, 'Harare, Zimbabwe'],
    kampala: [0.35, 32.6, 'Kampala, Uganda'], volta: [6.6, 0.5, 'Volta region, Ghana / Togo'], abomey: [7.2, 2.0, 'Abomey, Benin'],
    kumasi: [6.7, -1.6, 'Kumasi, Ghana'], accra: [5.6, -0.2, 'Accra, Ghana'], portonovo: [6.5, 2.6, 'Porto-Novo, Benin'],
    abidjan: [5.35, -4.0, 'Abidjan, Côte d\'Ivoire'], lagos: [6.5, 3.4, 'Lagos, Nigeria'],
    johannesburg: [-26.2, 28.05, 'Johannesburg, South Africa'], durban: [-29.9, 31.0, 'Durban, South Africa'], soweto: [-26.2, 27.9, 'Soweto, South Africa'], pretoria: [-25.7, 28.2, 'Pretoria, South Africa'],
    limpopo: [-23.9, 30.5, 'Limpopo, South Africa'],
    kingston: [18.0, -76.8, 'Kingston, Jamaica'], santodomingo: [18.5, -69.9, 'Santo Domingo, Dominican Republic'], cibao: [19.45, -70.7, 'Cibao, Dominican Republic'],
    portofspain: [10.65, -61.5, 'Port of Spain, Trinidad'], guadeloupe: [16.2, -61.5, 'Guadeloupe / Martinique'], sanjuan: [18.4, -66.1, 'San Juan, Puerto Rico'],
    loiza: [18.43, -65.9, 'Loíza, Puerto Rico'], rio: [-22.9, -43.2, 'Rio de Janeiro, Brazil'], salvador: [-12.97, -38.5, 'Salvador, Bahia, Brazil'],
    havana: [23.1, -82.4, 'Havana, Cuba'], matanzas: [23.05, -81.6, 'Matanzas, Cuba'], santiagocuba: [20.0, -75.8, 'Santiago de Cuba'],
    recife: [-8.05, -34.9, 'Recife, Pernambuco, Brazil'], caruaru: [-8.3, -36.0, 'Agreste, Pernambuco, Brazil'], paraiba: [-7.1, -34.9, 'Paraíba / Alagoas, Brazil'],
    luanda: [-8.8, 13.2, 'Luanda, Angola'], kinshasa: [-4.3, 15.3, 'Kinshasa, DR Congo'], yaounde: [3.85, 11.5, 'Yaoundé, Cameroon'],
    lisbon: [38.7, -9.1, 'Lisbon, Portugal'], santiagocv: [15.0, -23.6, 'Santiago, Cape Verde'],
    dar: [-6.8, 39.3, 'Dar es Salaam, Tanzania'], mahajanga: [-15.7, 46.3, 'Mahajanga, Madagascar'], reunion: [-21.1, 55.5, 'Réunion'],
    mombasa: [-4.05, 39.7, 'Mombasa, Kenya'], kigali: [-1.95, 30.1, 'Kigali, Rwanda'], lobaye: [3.6, 17.9, 'Lobaye forest, Central African Republic'],
    cairo: [30.0, 31.2, 'Cairo, Egypt'], luxor: [25.7, 32.6, 'Upper Egypt (Sa\'id)'], beirut: [33.7, 35.9, 'Lebanon / Syria'],
    istanbul: [41.0, 29.0, 'Istanbul, Turkey'], aleppo: [36.2, 37.2, 'Aleppo, Syria'], baghdad: [33.3, 44.4, 'Baghdad, Iraq'],
    izmir: [38.4, 27.1, 'Izmir (Smyrna), Turkey'], edirne: [41.7, 26.6, 'Thrace (Edirne)'], trabzon: [41.0, 40.5, 'Black Sea coast, Turkey'],
    kalamata: [37.0, 22.1, 'Peloponnese, Greece'], sofia: [42.7, 23.3, 'Shopluk (Sofia), Bulgaria'], plovdiv: [42.15, 24.75, 'Plovdiv, Bulgaria'],
    kyustendil: [42.3, 22.7, 'Bulgaria / North Macedonia border'], pleven: [43.4, 24.6, 'Northern Bulgaria'], skopje: [42.0, 21.4, 'Skopje, North Macedonia'],
    starazagora: [42.4, 25.6, 'Thrace, Bulgaria'], chennai: [13.1, 80.3, 'Chennai, South India'], lucknow: [26.8, 80.9, 'Lucknow / Delhi, North India'],
    seville: [37.4, -6.0, 'Seville, Andalusia'], jerez: [36.7, -6.1, 'Jerez, Andalusia'], cadiz: [36.5, -6.3, 'Cádiz, Andalusia'],
    cartagena: [10.4, -75.5, 'Cartagena, Colombia'],
  };
  const ORIGIN_OF = {
    '111': 'johannesburg', afrohouse: 'johannesburg', afrohouse12: 'johannesburg',
    kuku: 'forest', 'djembe-kassa': 'hamana', 'djembe-soli': 'hamana', 'djembe-dununba': 'hamana', 'djembe-mendiani': 'wassolon',
    'djembe-yankadi': 'conakry', 'djembe-makru': 'conakry', 'yankadi-makru': 'conakry', toro: 'kankan',
    'gnawa-full': 'essaouira', gnawa: 'essaouira',
    'ethio-tizita': 'addis', 'ethio-ambassel': 'addis', 'ethio-anchihoye': 'addis',
    'mbira-karigamombe': 'harare', 'baganda-akisoma': 'kampala',
    agbadza: 'volta', akpoka: 'volta', atsiagbeko: 'volta', adzogbo: 'abomey', gahu: 'portonovo', bell12: 'volta',
    kete: 'kumasi', fontomfrom: 'kumasi', kpanlogo: 'accra', highlife: 'accra', azonto: 'accra', coupe: 'abidjan',
    afrobeats: 'lagos', afrobeat: 'lagos', ponpon: 'lagos', zanku: 'lagos',
    gqom: 'durban', 'gqom-unison': 'durban', '3step': 'durban', mbaqanga: 'soweto', kwaito: 'soweto', amapiano: 'pretoria', bacardi: 'pretoria', shangaan: 'limpopo',
    dembow: 'kingston', dancehall: 'kingston', 'dembow-rd': 'santodomingo', merengue: 'cibao',
    soca: 'portofspain', calypso: 'portofspain', zouk: 'guadeloupe', bomba: 'sanjuan', 'bomba-sica': 'loiza',
    funk: 'rio', samba: 'rio', bossa: 'rio', 'partido-alto': 'rio', afoxe: 'salvador',
    tresillo: 'havana', habanera: 'havana', rumba: 'matanzas', son: 'santiagocuba', cinquillo: 'santiagocuba',
    baiao: 'caruaru', forro: 'caruaru', coco: 'paraiba', maracatu: 'recife', frevo: 'recife',
    kuduro: 'luanda', 'kuduro-sh': 'luanda', kizomba: 'luanda', tarraxinha: 'luanda', ndombolo: 'kinshasa', 'ndombolo-detailed': 'kinshasa',
    bikutsi: 'yaounde', batida: 'lisbon', funana: 'santiagocv', batuque: 'santiagocv',
    singeli: 'dar', salegy: 'mahajanga', maloya: 'reunion', chakacha: 'mombasa', 'ingoma-intore': 'kigali', 'aka-mongombi': 'lobaye',
    maqsum: 'cairo', malfuf: 'cairo', baladi: 'cairo', 'masmoudi-kabir': 'cairo', ayyub: 'cairo', wahda: 'cairo', saidi: 'luxor',
    'nawari-dabke': 'beirut', 'samai-thaqil': 'istanbul', 'samai-darij': 'istanbul', 'dawr-hindi': 'aleppo', jurjina: 'baghdad',
    chiftetelli: 'izmir', karsilama: 'edirne', laz: 'trabzon', kalamatianos: 'kalamata',
    kopanitsa: 'sofia', rachenitsa: 'plovdiv', 'sedi-donka': 'plovdiv', paidushko: 'kyustendil', gankino: 'pleven', lesno: 'skopje', daychovo: 'starazagora',
    'misra-chapu': 'chennai', 'rupak-tala': 'lucknow', ektal: 'lucknow', jhaptal: 'lucknow',
    solea: 'seville', 'tangos-flamenco': 'seville', bulerias: 'jerez', alegrias: 'cadiz',
    cumbia: 'cartagena',
  };
  RX.ORIGIN = Object.fromEntries(Object.entries(ORIGIN_OF).map(([id, p]) => [id, P[p]]));
})();
