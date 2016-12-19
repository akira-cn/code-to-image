  /* global jQuery, html2canvas, PR*/

(function(html2canvas, PR){'use strict'
  var hash = location.hash.slice(1).toLowerCase(),
      lang;

  const langEl = document.querySelector('#nav .languages');

  if(hash){
    lang = hash;
  }

  const srcMap = {
    'apollo': 'lang-apollo.js',
    'basic': 'lang-basic.js',
    'clojure': 'lang-clj.js',
    'css': 'lang-css.js',
    'dart': 'lang-dart.js',
    'erlang': 'lang-erlang.js',
    'go': 'lang-go.js',
    'haskell': 'lang-hs.js',
    'lasso': 'lang-lasso.js',
    'lisp': 'lang-lisp.js',
    'scheme': 'lang-lisp.js',
    'llvm': 'lang-llvm.js',
    'logtalk': 'lang-logtalk.js',
    'lua': 'lang-lua.js',
    'matlab': 'lang-matlab.js',
    'ml': 'lang-ml.js',
    'mumps': 'lang-mumps.js',
    'nemerle': 'lang-n.js',
    'pascal': 'lang-pascal.js',
    'protocol': 'lang-proto.js',
    'r': 'lang-r.js',
    'rd': 'lang-rd.js',
    'rust': 'lang-rust.js',
    'scala': 'lang-scala.js',
    'sql': 'lang-sql.js',
    'swift': 'lang-swift.js',
    'tcl': 'lang-tcl.js',
    'latek': 'lang-tex.js',
    'vb': 'lang-vb.js',
    'vhdl': 'lang-vhdl.js',
    'wiki': 'lang-wiki.js',
    'xq': 'lang-xq.js',
    'yaml': 'lang-yaml.js'
  };

  function loadPlugin(lang){
    var js = srcMap[lang.toLowerCase()];  

    if(typeof js === 'string'){
      var script = document.createElement('script');
      script.src = '/static/module/code-prettify/' + js;
      document.body.appendChild(script);
    }

    langEl.className = 'languages lang-' + lang;

    //only to load js file once.
    srcMap[lang] = true;
  }

  if(lang) loadPlugin(lang); 

  langEl.addEventListener('click', function(evt){
      var target = evt.target;
      var _lang = target.dataset.lang;

      if(target.tagName === 'A' && _lang !== 'more'){
        lang = _lang;
        if(lang === 'default') lang = '';
        if(lang) loadPlugin(lang);
        else langEl.className = 'languages lang-default';
      }
    });


  const codeEl = document.getElementById('code');
  const textCodeEl = document.getElementById('text-code');

  const settingVersion = '1.0';

  function loadSettings(){
    var settings = localStorage.getItem('settings') || {};

    if(typeof settings === 'string'){
      try{
        settings = JSON.parse(settings);
        document.querySelector('input#setting-theme-' + settings.theme).checked = 'checked';
        document.querySelector('input#setting-width-' + settings.width).checked = 'checked';
        document.querySelector('input#setting-format-' + settings.format).checked = 'checked';
      }catch(ex){
        console.error('settings loaded failed! ' + ex.message);
        settings = {};
      }
    }
  }

  loadSettings();

  function generateCode(text){

    function parseProps(propStr){
      var props = propStr.trim().split(';');
      var ret = {};

      for(var i = 0; i < props.length; i++){
        if(props[i]){
          var pair = props[i].split(':');
          ret[pair[0].trim()] = pair[1].trim();
        }
      }
      return ret;
    }

    var codeClass = 'prettyprint';
    
    if(lang){
      codeClass += ' lang-' + lang;
    }

    var settings = {
        theme : document.querySelector('input[name="setting-theme"]:checked').value,
        width: document.querySelector('input[name="setting-width"]:checked').value,
        format: document.querySelector('input[name="setting-format"]:checked').value
    };

    localStorage.setItem('settings', JSON.stringify(settings));

    codeEl.innerHTML = '<pre class="' + [settings.theme,settings.width,settings.format,codeClass].join(' ') + '"><code>' + text.replace(/</g, '&lt;').replace(/>/g,'&gt;') + '</code></pre>';

    PR.prettyPrint();

    setTimeout(function(){
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');

      html2canvas(codeEl, {
        canvas: canvas,
        onrendered: function(canvas) {
          var img = new Image();
          img.src = canvas.toDataURL('image/jpeg');

          Object.assign(img.style, {
            'max-width': '100%',
            'max-height': '100%',
            'zoom': Math.min(1.0, Math.max(0.5, 480 / img.width))
          });

          var a = document.createElement('a');
          a.href = img.src;
          a.className = 'img';
          a.appendChild(img);

          var container = document.createElement('div');
          container.appendChild(a);

          var closeBtn = document.createElement('a');
          closeBtn.className = 'close';
          closeBtn.innerHTML = 'X';
          container.appendChild(closeBtn);
          
          codeEl.innerHTML = '';
          codeEl.style.zoom = '1.0';
          codeEl.appendChild(container);

          closeBtn.addEventListener('click', function(){
            codeEl.innerHTML = '';
          });

          Object.assign(container.style, {
            width: document.documentElement.clientWidth + 'px',
            height: document.documentElement.clientHeight + 'px'
          });
        }
      });
    }, 0);
  }

  const codeImgEl = document.querySelector('#nav img');

  codeImgEl.addEventListener('click', function(){
    var text = textCodeEl.value;
    generateCode(text || 'Paste your code first!');  
  });

 textCodeEl.addEventListener('keydown', function(evt){
    var keyCode = evt.keyCode;
    var target = evt.target;

    if(keyCode === 68 && evt.ctrlKey){
      evt.preventDefault(); //prevent deletion
      return;
    }
    if(keyCode !== 9 && keyCode !== 13 & keyCode !== 221) return;

    var text = target.value;
    var start = target.selectionStart;
    var end = target.selectionEnd;

    if(keyCode === 9) { //handle tab
      evt.preventDefault();

      // set textarea value to: text before caret + tab + text after caret
      target.value = text.substring(0, start)
                   + '    '
                   + text.substring(end);

      // put caret at right position again
      target.selectionStart = target.selectionEnd = start + 4;
    }else if(keyCode === 13){  //handle enter
      evt.preventDefault();

      var lines = text.substring(0, start).split('\n');
      var currentLine = lines[lines.length - 1];
      var spaces = (/^\s+/.exec(currentLine) || [''])[0];

      target.value = text.substring(0, start)
                   + '\n' + spaces
                   + text.substring(end);

      target.selectionStart = target.selectionEnd = start + spaces.length + 1;
    }else if(keyCode === 221){  //handle }
      evt.preventDefault();

      var lines = text.substring(0, start).split('\n');
      var currentLine = lines[lines.length - 1];
      var spaces = (/^\s+$/.exec(currentLine) || [''])[0];
      var backspace = 0;

      if(spaces){
        backspace = Math.min(spaces.length, 4);
        spaces = spaces.slice(0, -4);
      }

      target.value = text.substring(0, start).replace(/^\s+$/m, spaces)
                   + '}'
                   + text.substring(end);      

      target.selectionStart = target.selectionEnd = start - backspace + 1;
    }
  });

  window.addEventListener('keydown', function(evt){
    if(evt.ctrlKey && evt.keyCode === 68){
      var text = textCodeEl.value;
      generateCode(text || 'Paste your code first!');      
    }else{
      if(evt.keyCode === 27){
        codeEl.innerHTML = '';
        codeEl.style.zoom = '';
      }
    }
  });

})(html2canvas, PR);
