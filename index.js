/* 
    <category category-id="homme">
    <content content-id="garantie">
    <folder folder-id="root">
    <category category-id="brosse-lissante">
    <category category-id="brosse-soufflante">
    <category category-id="curl-secret">
    <category category-id="fer-a-boucler">
    <category category-id="lisseur">
    <category category-id="mini">
    <category category-id="multi-styler">
    <category category-id="seche-cheveux">
*/

const csvFilePath = './csv.csv'
const csv = require('csvtojson')
const xmls = {content:'', storefront:''}
function getXmlType( url ) {
    if ( url.includes('femme') || url.includes('homme') ) {
        return 'storefront'
    }
    if ( url === 'https://www.babyliss.fr/' || url.includes('blog') || url.includes('.html') ) {
        return 'content'
    }
    return `xml type not found for url ${url}`
}
csv({
    delimiter: [";"],
    trim:true,
})
.fromFile(csvFilePath)
.then((jsonObj)=>{
    jsonObj.forEach(line => {
        const xmlType = getXmlType(line.URL)
        console.log(xmlType);
        // getId
        // update xmls
        // "please merge seo-content.xml and seo-storefront.xml
    });
})