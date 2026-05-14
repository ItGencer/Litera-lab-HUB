
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "preload": [
      "chunk-NS7CZPBE.js"
    ],
    "route": "/"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-LVTUK4SD.js"
    ],
    "route": "/genres"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-DBUUBO34.js"
    ],
    "route": "/years"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-ISF2SY2V.js"
    ],
    "route": "/authors"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-RXJTP7PE.js"
    ],
    "route": "/alphabet"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-RZ2AU7WL.js"
    ],
    "route": "/news"
  },
  {
    "renderMode": 0,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 723, hash: '14ce43974db476f30e158cec2ecca0c8189ed6098686b86764d4bd83ac46fa4f', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1052, hash: 'e3b6eea3609dc58c2edbe7145e672667610d547351a3f8640ab430d3e9b6c2d7', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'news/index.html': {size: 12673, hash: 'ee992c61bc3a28f47c9b81cf355f2f1160b70184dea2ee1852f23a2f4cdafec2', text: () => import('./assets-chunks/news_index_html.mjs').then(m => m.default)},
    'years/index.html': {size: 12693, hash: '34984a550c5924a5fcacfdb1db854a31832e29283f2ce921c1ae44a516bf721c', text: () => import('./assets-chunks/years_index_html.mjs').then(m => m.default)},
    'alphabet/index.html': {size: 12694, hash: '9db9c20e615a30ce419b955f0aff628feb7d83a92e5f6c22993b652810beef72', text: () => import('./assets-chunks/alphabet_index_html.mjs').then(m => m.default)},
    'authors/index.html': {size: 12682, hash: '6c1bc75304497134b481633ec003601b85e758574c60da4c48f0024daeb1bee2', text: () => import('./assets-chunks/authors_index_html.mjs').then(m => m.default)},
    'genres/index.html': {size: 12677, hash: 'dc0fc25b700f9fbeaac59fd37fc4425d466f17d520d5117216bd3445c29bbecd', text: () => import('./assets-chunks/genres_index_html.mjs').then(m => m.default)},
    'index.html': {size: 15233, hash: '37407f856fc69617967df9b52fc1bd531474849ad0ab6277c4c6db82df863ac2', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-ZYWAU7LW.css': {size: 90, hash: 'baqruGqhd0A', text: () => import('./assets-chunks/styles-ZYWAU7LW_css.mjs').then(m => m.default)}
  },
};
