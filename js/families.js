// Rhythm families for the By family view: [id, label, member rhythm ids], in display order.
// Grouped by rhythmic lineage and feel (shared timeline, meter or scene), so related
// rhythms can be swiped between. A rhythm missing here falls back to its own `family`
// field in rhythms.js, so newly added rhythms still appear.
window.RX = window.RX || {};

RX.FAMILIES = [
  ['tresillo', 'Tresillo / 3-3-2', ['111', 'tresillo', 'habanera', 'dancehall', 'tarraxinha', 'bomba', 'bomba-sica', 'bomba-yuba', 'plena']],
  ['dembow', 'Dembow', ['dembow', 'dembow-rd', 'ponpon', 'kizomba']],
  ['cinquillo', 'Cinquillo / Antillean', ['cinquillo', 'soca', 'calypso', 'zouk']],
  ['son-clave', 'Clave / Son / Kpanlogo', ['son', 'rumba', 'bossa', 'highlife', 'gahu', 'azonto', 'kpanlogo']],
  ['latin', 'Merengue / Bachata / Cumbia', ['merengue', 'bachata', 'cumbia', 'vallenato']],
  ['samba', 'Samba / Brazilian', ['samba', 'partido-alto', 'pagode', 'samba-reggae', 'funk', 'baiao', 'forro', 'coco', 'ciranda', 'frevo', 'maracatu', 'maracatu-rural', 'afoxe']],
  ['roots', 'Afro-Caribbean & Afro-Peruvian roots', ['nyabinghi', 'kumina', 'festejo', 'lando', 'zamacueca', 'joropo']],
  ['afrobeat', 'Afrobeat / Afrobeats / street-hop', ['afrobeat', 'afrobeats', 'zanku']],
  ['lusophone', 'Kuduro / Soukous / Lusophone', ['kuduro', 'kuduro-sh', 'batida', 'funana', 'coladeira', 'batuque', 'coupe', 'ndombolo', 'ndombolo-detailed', 'soukous', 'makossa', 'singeli']],
  ['sa-club', 'South African club', ['afrohouse', 'afrohouse12', 'kwaito', 'gqom', 'amapiano', '3step', 'bacardi', 'shangaan']],
  ['sa-township', 'South African township & Zulu', ['marabi', 'mbaqanga', 'maskandi', 'isicathamiya']],
  ['djembe', 'Djembe / Mandé', ['kuku', 'djembe-kassa', 'djembe-soli', 'djembe-dununba', 'djembe-mendiani', 'djembe-yankadi', 'djembe-makru', 'yankadi-makru', 'sorsonet', 'toro']],
  ['west-ensembles', 'Ewe, Akan & Yoruba drumming', ['agbadza', 'akpoka', 'atsiagbeko', 'adzogbo', 'kete', 'fontomfrom', 'sakara']],
  ['bell12', '12/8 bell & batá', ['bell12', 'bata-yoruba', 'bata-santeria', 'bikutsi', 'salegy']],
  ['gnawa', 'Gnawa / Maloya (6/8 trance)', ['gnawa', 'gnawa-full', 'gnawa-hadra', 'maloya']],
  ['maghreb', 'Maghreb: chaabi / raï / malhun', ['chaabi-morocco', 'rai-algeria', 'malhun', 'ghaita', 'andalusi-nuba']],
  ['maqsum', 'Maqsum / Egyptian & Levantine', ['maqsum', 'baladi', 'saidi', 'masmoudi-kabir', 'wahda', 'malfuf', 'ayyub', 'nawari-dabke', 'chiftetelli']],
  ['arab-classical', 'Arab & Turkish classical cycles', ['samai-thaqil', 'samai-darij', 'jurjina', 'dawr-hindi']],
  ['balkan', 'Balkan & Anatolian odd meters', ['paidushko', 'rachenitsa', 'lesno', 'kalamatianos', 'laz', 'daychovo', 'karsilama', 'kopanitsa', 'gankino', 'sedi-donka']],
  ['tala', 'Indian talas', ['rupak-tala', 'misra-chapu', 'ektal', 'jhaptal', 'khanda-chapu']],
  ['flamenco', 'Flamenco', ['solea', 'alegrias', 'bulerias', 'tangos-flamenco', 'rumba-flamenca']],
  ['ethio', 'Ethiopian qenet', ['ethio-tizita', 'ethio-bati', 'ethio-ambassel', 'ethio-anchihoye']],
  ['swahili', 'Swahili coast & Kenya', ['taarab-kidumbak', 'taarab-orchestral', 'chakacha', 'benga']],
  ['great-lakes', 'Great Lakes & Central African ensembles', ['ingoma-burundi', 'ingoma-intore', 'baganda-akisoma', 'aka-bondo', 'aka-mongombi']],
  ['mbira', 'Mbira & xylophone', ['mbira-nyamaropa', 'mbira-karigamombe', 'baganda-amadinda']],
];

RX.FAMILY_OF = {};
RX.FAMILIES.forEach(([fam, , ids]) => ids.forEach((id) => { RX.FAMILY_OF[id] = fam; }));
