const renderer = new marked.Renderer();
renderer.code = (code, language) => {
  const validLang = !!(language && hljs.getLanguage(language));
  const highlighted = validLang ? hljs.highlight(language, code).value : code;
  return `<pre><span class="langflag">${language}</span><code class="hljs ${language}">${highlighted}</code></pre>`;
};

marked.setOptions({renderer});

const $$ = (...args) => document.querySelectorAll.apply(document,args)
function task_li() {
    for (const tl of $$("li input[type=checkbox]")) {
        tl.parentNode.classList.add("task")
    }
}

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
                sanitize: false,
                smartLists: true,
                smartypants: false
            })
        }
    },
    mount:{
        renderAfter(dom){
            aScroll(dom.children[0],dom.children[1])
            task_li()
        }
    }
})

