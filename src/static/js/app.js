  /* global jQuery, html2canvas, prettyPrint*/

(function($){

  var code = document.getElementById('code');
  var textCode = document.getElementById('text-code');

  function generateCode(text){
    code.innerHTML = '<pre class="prettyprint"><code>' + text.replace(/</g, '&lt;').replace(/>/g,'&gt;') + '</code></pre>';
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
