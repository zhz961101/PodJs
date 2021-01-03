const request = require('request');
const fs = require('fs');


const get = (url) => new Promise((resolve, reject) => {
  request({
    url,
    // FIXME: [zhzluke]： 这是我本地的网关，你要是想编译需要改下这里
    proxy: 'http://nas:7890',

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      return resolve(body);
    }
    reject(error);
  });
  // http.get({
  //   path: url,
  //   host: 'nas',
  //   port: 7890,
  //   headers: {
  //     Referer: `https://github.com/material-components/material-components-web-components/blob/master/README.md`,
  //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36'
  //   }
  // }, (res) => {
  //   let memo = '';
  //   res.on('data', (chunk) => {
  //     memo += chunk;
  //   })
  //   res.on('end', () => resolve(memo));
  // }).on('error', (err) => reject(err));
})

const toHump = name => name.replace(/-(\w)/g, (_, letter) => letter.toUpperCase());

const pluckPropsFromReadme = async (name, _mdText) => {
  const humpName = name[0].toUpperCase() + toHump(name).slice(1);
  const tableReg = /### Properties\/Attributes([\s\S]+?)\S+?#/gi;
  const path = `http://raw.githubusercontent.com/material-components/material-components-web-components/master/packages/${name}/README.md`;

  const mdText = _mdText || await get(path).catch(console.log);
  const match = tableReg.exec(mdText);

  if (!match || !match.length || match.length <= 1) {
    console.log(name, '[error] 没找到')
    return '';
  }
  const tableText = match[1];
  const tableArr = tableText.split('\n').filter(x => x.trim()).map(row => row.trim().split('|').map(x => x.trim().replace(/['"`]/g, '')).slice(row.trim()[0] === '|' ? 1 : 0));

  const rowToTs = ({
    name,
    type,
    description
  }) => `
${name}?: ${type}; // ${description}
  `.trim();
  const rowToJsDoc = ({
    name,
    type,
    description
  }) => `
  * @property {${type}} ${name} \t\t\t - ${description}
  `.trim();
  const keys = tableArr[0].map(x => x.trim().toLowerCase()).filter(Boolean);
  const loadRow = (row) => keys.reduce((acc, k, idx) => ({
    ...acc,
    [k]: row[idx]
  }), {})
  const tsText = `
/**
 * @typedef ${humpName}Props
 ${tableArr.slice(3).map(loadRow).map(rowToJsDoc).join('\n ')}
 */
interface ${humpName}Props {
  ${tableArr.slice(3).map(loadRow).map(rowToTs).join('\n  ')}
}
  `.trim();
  return tsText;
}

([k, t, d]) => [`${k}?: ${t}; // ${d}`, `{${t}} ${k} \t\t\t - ${d}`];

const genComponent = async (name, mdText) => {
  const humpName = name[0].toUpperCase() + toHump(name).slice(1);
  const propsDef = await pluckPropsFromReadme(name, mdText);
  return `
${propsDef}

/**
 * Material-Component ${humpName}
 * @type {Taco.MetaComponent<${humpName}Props>}
 */
export const ${humpName}: MetaComponent<${humpName}Props> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-${name}', true, {
      type: 'module',
    });
    return createVNode(
        'mwc-${name}',
        { ...props, is: 'mwc-${name}' },
        props.children,
    );
};
  `.trim();
}

const components = [
  'button',
  'checkbox',
  'circular-progress',
  'circular-progress-four-color',
  'dialog',
  'drawer',
  'fab',
  'formfield',
  'icon-button-toggle',
  'icon-button',
  'icon',
  'linear-progress',
  'list',
  'menu',
  'radio',
  'select',
  'slider',
  'snackbar',
  'switch',
  'tab-bar',
  'tab',
  'textarea',
  'textfield',
  'top-app-bar-fixed',
  'top-app-bar',
];

(async () => {
  let genedComponents = [];
  for (const name of components) {
    try {
      genedComponents.push(await genComponent(name));
      console.log(`Generated [${name}], ${components.indexOf(name) + 1}/${components.length}`)
    } catch (error) {
      console.log(`<<ERROR>> error in component [${name}].`)
      console.log('>> ' +
        error.toString().split('\n').join('\n>> '))
      continue
    }
  }

  fs.writeFileSync('./MaterialDesign.auto.gen.ts', `// AUTO-GENERATED ${new Date().toUTCString()}
  import { MetaComponent, createVNode } from '@tacopie/taco';
  import { mustRequire } from '../common';

  ${genedComponents.join('\n\n')}
  `)
})();