
export async function loader(URL: string) {
    const htmlResp = await fetch(URL)
    loadHtml(await htmlResp.text())
}

function loadHtml(htmlContent: string) {
    const clearScript = htmlContent.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/, "")
    const scriptMatch = htmlContent.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/)
    if (!scriptMatch) {
        throw "cant get script"
    }
    const script = scriptMatch[1]
    const outScript = script.replace(/extends +?Poi +?{/, "extends Poi {\ntemplate(){\n    return html `" + clearScript.trim() + "`\n}\n")
    eval(outScript)
}


