const fs = require('fs')
const csvFilePath = './csv.csv'
const csv = require('csvtojson')
const xmls = {content:'', storefront:''}
let contentxml = fs.readFileSync('./content-fr.xml', {encoding : 'utf8'})
contentxml = contentxml.split('\n')
let storefrontxml = fs.readFileSync('./storefront-fr.xml', {encoding : 'utf8'})
storefrontxml = storefrontxml.split('\n')
let testLog = ''
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
function replaceTitleAndDesc( xml, tag, TITLE, DESCRIPTION ) {
    function replaceTitle(correspondance, p1, p2, p3, decalage, chaine) {
        return p1 + TITLE + p3
    }
    function replaceDesc(correspondance, p1, p2, p3, decalage, chaine) {
        return p1 + DESCRIPTION + p3
    }
    const tagClosed = tag.split(' ')[0].replace('<', '</') // eg </folder>
    const status = {
        all : ['xml', 'mainTag', 'title', 'desc'],
        now: 'xml'
    }
    for (let i = 0; i < xml.length; i++) {
        let line = xml[i]
        if ( status.now != status.all[0] && line.includes( tagClosed ) ) {
            if (status.now = status.all[1]) {
                testLog += `<div>title not found</div>`
            }
            if (status.now = status.all[2]) {
                testLog += `<div>description not found</div>`
            }
            status.now = status.all[0]
            return xml
        }
        if (status.now == status.all[0]) {
            if ( line.includes( tag ) ) {
                status.now = status.all[1]
            }
        }
        if (status.now == status.all[1]) {
            if ( line.includes('<page-title xml:lang="fr-FR">') ) {
                status.now = status.all[2]
                xml[i] = line.replace(/(<page-title xml:lang="fr-FR">)(.*)(<\/page-title>)/, replaceTitle)
                testLog += `\n<div>${line}</div>`
            }
        }
        if (status.now == status.all[2]) {
            if ( line.includes('<page-description xml:lang="fr-FR">') ) {
                status.now = status.all[3]
                xml[i] = line.replace(/(<page-description xml:lang="fr-FR">)(.*)(<\/page-description>)/, replaceDesc)
                testLog += `\n<div>${line}</div>\n`
                status.now = status.all[0]
                return xml
            }
        }
    }
}
csv({
    delimiter: [";"],
    trim:true,
})
.fromFile(csvFilePath)
.then((jsonObj)=>{
    jsonObj.forEach(line => { // pour chaque ligne du csv
        const typeAndTag = getXmlTypeAndTag(line.URL)
        testLog +=
`

<br>
<div>SOURCE DEV05 --> <a target="_blank" href="${'view-source:'+line.URL.replace('www.babyliss.fr', 'dev05-na-conair.demandware.net/s/fr-babyliss')}">${line.URL.replace('www.babyliss.fr', 'dev05-na-conair.demandware.net/s/fr-babyliss')}</a></div>
<div>SOURCE STAGING --> <a target="_blank" href="view-source:${line.URL.replace('www.babyliss.fr', 'staging-na-conair.demandware.net/s/fr-babyliss')}">${line.URL.replace('www.babyliss.fr', 'staging-na-conair.demandware.net/s/fr-babyliss')}</a></div>
<div>SOURCE PRODUCTION --> <a target="_blank" href="view-source:${line.URL}">${line.URL}</a></div>
<div>TITLE  --> ${line.TITLE}</div>
<div>DESCRIPTION  --> ${line.DESCRIPTION}</div>`
        if ( typeAndTag.xmlType == 'content' ) {
            contentxml = replaceTitleAndDesc(contentxml, typeAndTag.tag, line.TITLE, line.DESCRIPTION)
        }
        else if ( typeAndTag.xmlType == 'storefront' ) {
            storefrontxml = replaceTitleAndDesc(storefrontxml, typeAndTag.tag, line.TITLE, line.DESCRIPTION)
        }
    });
    contentxml = contentxml.join('\n')
    fs.writeFileSync('./seo-content.xml', contentxml, 'utf8')
    storefrontxml = storefrontxml.join('\n')
    fs.writeFileSync('./seo-storefront.xml', storefrontxml, 'utf8')
    fs.writeFileSync('./testLog.html', testLog, 'utf8')
    console.log("please merge seo-content.xml and seo-storefront.xml")
})