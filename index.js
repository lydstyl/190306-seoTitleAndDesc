const fs = require('fs')
const contentxml = fs.readFileSync('./content-fr.xml', {encoding : 'utf8'})
const storefrontxml = fs.readFileSync('./storefront-fr.xml', {encoding : 'utf8'})
const csvFilePath = './csv.csv'
const csv = require('csvtojson')
const xmls = {content:'', storefront:''}
function getXmlTypeAndTag( url ) {
    const xt = {xmlType: '', tag: ''}
    if ( 
        ( url.includes('femme') && !url.includes('blog') )
        || ( url.includes('homme') && !url.includes('blog') ) // <category category-id="homme">
    ) {
            if ( url.includes('HERODESIGNER') ) {
                return xt
            }
            xt.xmlType = 'storefront'
            xt.tag = '<category category-id="!!ID">'
            const urlParts = url.split('/')
            const ID = urlParts[ urlParts.length - 2 ]
            xt.tag = xt.tag.replace('!!ID', ID)
    }
    else {
        xt.xmlType = 'content'
        if ( url === 'https://www.babyliss.fr/' ) {
            xt.tag = '<folder folder-id="root">'
        } 
        else if ( url.includes('points-de-vente') ) {
            xt.tag = '<content content-id="store-locator">'
        }
        else if ( url.includes('.html') ) {
            xt.tag = '<content content-id="!!ID">'
            let ID = url.split('/')
            ID = ID[ID.length - 1]
            ID = ID.split('.html')[0]
            xt.tag = xt.tag.replace('!!ID', ID) // xt.tag = '<content content-id="garantie">'
        }
        else if (
                url.includes('formulaire-de-contact')
                || url.includes('demande-information-produit')
                || url.includes('babyliss-sav')
                || url.includes('commander-accessoires')
                || url.includes('manuel-utilisation')
                || url.includes('recrutement')
            ){
                    xt.tag = '<folder folder-id="contact-us-new">'
            }
        else if ( url.includes('blog') ) {

            xt.tag = '<folder folder-id="blog">'
            if (url.includes('femme')) {
                xt.tag = '<folder folder-id="Conseils-femme">'
            }
            else if (url.includes('homme')) {
                xt.tag = '<folder folder-id="Conseils-homme">'
            }
        }
    }
    return xt
}
csv({
    delimiter: [";"],
    trim:true,
})
.fromFile(csvFilePath)
.then((jsonObj)=>{
    jsonObj.forEach(line => {
        const typeAndTag = getXmlTypeAndTag(line.URL)
        console.log(
`
${line.URL}
${typeAndTag.xmlType}
${line.TITLE}
${line.DESCRIPTION}
${typeAndTag.tag}
`)
        // update xmls



    });
    fs.writeFileSync('./seo-content.xml', contentxml, 'utf8')
    fs.writeFileSync('./seo-storefront.xml', storefrontxml, 'utf8')
    console.log("please merge seo-content.xml and seo-storefront.xml")
    
})