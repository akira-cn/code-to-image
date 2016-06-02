  /* global jQuery, html2canvas, prettyPrint*/

(function($){
  function queryUrl(url, key) {
    url = url.replace(/^[^?=]*\?/ig, '').split('#')[0]; //去除网址与hash信息
    var json = {};
    //考虑到key中可能有特殊符号如“[].”等，而[]却有是否被编码的可能，所以，牺牲效率以求严谨，就算传了key参数，也是全部解析url。
    url.replace(/(^|&)([^&=]+)=([^&]*)/g, function (a, b, key , value){
      //对url这样不可信的内容进行decode，可能会抛异常，try一下；另外为了得到最合适的结果，这里要分别try
      try {
        key = decodeURIComponent(key);
      } catch(e) {}

      try {
        value = decodeURIComponent(value);
      } catch(e) {}

      if (!(key in json)) {
        json[key] = /\[\]$/.test(key) ? [value] : value; //如果参数名以[]结尾，则当作数组
      }
      else if (json[key] instanceof Array) {
        json[key].push(value);
      }
      else {
        json[key] = [json[key], value];
      }
    });
    return key ? json[key] : json;
  }

  var lang = queryUrl(location.search, 'lang');

  var code = document.getElementById('code');
  var textCode = document.getElementById('text-code');

  function generateCode(text){
    var codeClass = 'prettyprint';
    
    if(lang){
      codeClass += ' lang-' + lang;
    }

    code.innerHTML = '<pre class="' + codeClass + '"><code>' + text.replace(/</g, '&lt;').replace(/>/g,'&gt;') + '</code></pre>';

    prettyPrint();

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
          //document.body.appendChild(canvas);
          //console.log(canvas.toDataURL());
          var img = new Image();
          img.src = canvas.toDataURL('image/jpeg');
          img.style.zoom = '0.5';

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

  $(window).keydown(function(evt){
    if(evt.ctrlKey && evt.keyCode === 68){
      var text = textCode.value.trim();
      generateCode(text || 'Paste your code first!');      
    }else{
      if(evt.keyCode === 27){
        code.innerHTML = '';
      }
    }
  });

})(jQuery, html2canvas, prettyPrint);
