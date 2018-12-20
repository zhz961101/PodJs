const renderer = new marked.Renderer();
renderer.code = (code, language) => {
  const validLang = !!(language && hljs.getLanguage(language));
  const highlighted = validLang ? hljs.highlight(language, code).value : code;
  return `<pre><span class="langflag">${language}</span><code class="hljs ${language}">${highlighted}</code></pre>`;
};

marked.setOptions({renderer});
const app = new Poi({
    el: "#app",
    tpl: "#appTpl",
    data:{
        text: `# Makerdown
\`\`\`js
const $ = q => document.querySelector(q)
\`\`\``,
        compiledMarkdown(){
            return marked(this.text, {
                gfm: true,
                tables: true,
                breaks: false,
                pedantic: false,
                sanitize: true,
                smartLists: true,
                smartypants: false
            })
        }
    }
})

