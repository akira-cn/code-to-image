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

    srcMap[lang] = true;
  }

  if(lang) loadPlugin(lang);

  $('#nav').click(function(evt){
    var target = evt.target;

    if(target.tagName === 'A'){
      lang = target.innerHTML.toLowerCase();
      if(lang === 'default' || lang === 'more') lang = '';
      if(lang) loadPlugin(lang);
    }
  });

  var code = document.getElementById('code');
  var textCode = document.getElementById('text-code');

  function generateCode(text){
    var codeClass = 'prettyprint';
    
    if(lang){
      codeClass += ' lang-' + lang;
    }

    code.innerHTML = '<pre class="' + codeClass + '"><code>' + text.replace(/</g, '&lt;').replace(/>/g,'&gt;') + '</code></pre>';

    PR.prettyPrint();

    setTimeout(function(){
      var w = $('#code').width();
      var h = $('#code').height();

      var canvas = document.createElement('canvas');
      canvas.width = w * 2;
      canvas.height = h * 2;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      var context = canvas.getContext('2d');
      context.scale(2,2);

      html2canvas(document.querySelector('#code'), {
        canvas: canvas,
        onrendered: function(canvas) {
          var img = new Image();
          img.src = canvas.toDataURL('image/jpeg');
          img.style.zoom = '0.5';
          img.style.maxWidth = '100%';
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
      }
    }
  });

})(jQuery, html2canvas, PR);
