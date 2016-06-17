  /* global jQuery, html2canvas, PR*/

(function($, html2canvas, PR){
  var hash = location.hash.slice(1).toLowerCase(),
      lang;

  if(hash){
    lang = hash;
  }

  var srcMap = {
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

    $('#nav .languages').get(0).className = 'languages lang-' + lang;
    //only to load js file once.
    srcMap[lang] = true;
  }

  if(lang) loadPlugin(lang); 

  $('#nav .languages').click(function(evt){
    var target = evt.target;
    var _lang = $(target).data('lang');

    if(target.tagName === 'A' && _lang !== 'more'){
      lang = _lang;
      if(lang === 'default') lang = '';
      if(lang) loadPlugin(lang);
      else $('#nav .languages').get(0).className = 'languages lang-default';
    }
  });

  var code = document.getElementById('code');
  var textCode = document.getElementById('text-code');
  var settings = localStorage.getItem('settings') 
    || {theme: 'dark', 'width': '1280px', 'fontSize': '36px'};

  if(typeof settings === 'string'){
    settings = JSON.parse(settings);
  }

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

  //initialize settings
  $('.settings > li > a').each(function(i, o){
    var prop = $(o).data('opt');
    prop = parseProps(prop);

    for(var key in prop){
      if(settings[key] !== prop[key]){
        return;
      }
    }

    $(o).addClass('selected');
  });

  $('.settings').click(function(evt){
    evt.preventDefault();
    var target = evt.target;
    if(target.tagName === 'A'){
      var prop = $(target).data('opt');
      prop = parseProps(prop);

      $.extend(settings, prop);

      $(target).parent().parent().find('a').removeClass('selected');
      $(target).addClass('selected');

      localStorage.setItem('settings', JSON.stringify(settings));
    }
  });

  function generateCode(text){
    var codeClass = 'prettyprint';
    
    if(lang){
      codeClass += ' lang-' + lang;
    }

    $(code).css(settings);
    code.innerHTML = '<pre class="' + settings.theme + ' ' + codeClass + '"><code>' + text.replace(/</g, '&lt;').replace(/>/g,'&gt;') + '</code></pre>';

    PR.prettyPrint();

    setTimeout(function(){
      var w = $('#code').width();
      var h = $('#code').height();

      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var context = canvas.getContext('2d');

      html2canvas(document.querySelector('#code'), {
        canvas: canvas,
        onrendered: function(canvas) {
          var img = new Image();
          img.src = canvas.toDataURL('image/jpeg');
          img.style.width = canvas.width / 2 + 'px';
          img.style.minWidth = '640px';
          img.style.maxHeight = '100%';

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
          
          code.innerHTML = '';
          code.style.zoom = '1.0';
          code.appendChild(container);

          $(closeBtn).click(function(){
            code.innerHTML = '';
          });

          $(container).css({
            width: $('body').width() + 'px',
            height: $('body').height() + 'px'
          });
        }
      });
    }, 0);
  }

  $('#nav img').click(function(){
    var text = textCode.value;
    generateCode(text || 'Paste your code first!');  
  });

  $('#text-code').keydown(function(evt){
    var keyCode = evt.keyCode;

    if(keyCode === 68 && evt.ctrlKey){
      evt.preventDefault(); //prevent deletion
      return;
    }
    if(keyCode !== 9 && keyCode !== 13 & keyCode !== 221) return;

    var text = $(this).val();
    var start = $(this).get(0).selectionStart;
    var end = $(this).get(0).selectionEnd;

    if(keyCode === 9) { //handle tab
      evt.preventDefault();

      // set textarea value to: text before caret + tab + text after caret
      $(this).val(text.substring(0, start)
                  + '    '
                  + text.substring(end));

      // put caret at right position again
      $(this).get(0).selectionStart =
      $(this).get(0).selectionEnd = start + 4;
    }else if(keyCode === 13){  //handle enter
      evt.preventDefault();

      var lines = text.substring(0, start).split('\n');
      var currentLine = lines[lines.length - 1];
      var spaces = (/^\s+/.exec(currentLine) || [''])[0];

      $(this).val(text.substring(0, start)
                  + '\n' + spaces
                  + text.substring(end));

      $(this).get(0).selectionStart =
      $(this).get(0).selectionEnd = start + spaces.length + 1;
    }else if(keyCode === 221){  //handle {
      evt.preventDefault();

      var lines = text.substring(0, start).split('\n');
      var currentLine = lines[lines.length - 1];
      var spaces = (/^\s+$/.exec(currentLine) || [''])[0];
      var backspace = 0;

      if(spaces){
        backspace = Math.min(spaces.length, 4);
        spaces = spaces.slice(0, -4);
      }

      $(this).val(text.substring(0, start).replace(/^\s+$/m, spaces)
                  + '}'
                  + text.substring(end));      

      $(this).get(0).selectionStart =
      $(this).get(0).selectionEnd = start - backspace + 1;
    }
  });

  $(window).keydown(function(evt){
    if(evt.ctrlKey && evt.keyCode === 68){
      var text = textCode.value;
      generateCode(text || 'Paste your code first!');      
    }else{
      if(evt.keyCode === 27){
        code.innerHTML = '';
        code.style.zoom = '';
      }
    }
  });

})(jQuery, html2canvas, PR);
