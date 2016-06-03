var uglifyJS = require('uglify-js');
var cleanCSS = require('clean-css');
var fs = require('fs');
var gulp = require('gulp');
var through = require('through2');

var config = JSON.parse(fs.readFileSync('./package.json'));
var cdnconf, cdnBucket, cdnDomain;

try{
  cdnconf = JSON.parse(fs.readFileSync('.cdnconf.json'));
  
  var qiniu = require('node-qiniu');
  qiniu.config(cdnconf);
  
  cdnBucket = require('node-qiniu').bucket(cdnconf.bucket);
  cdnDomain = cdnconf.domain;
}catch(ex){
  cdnconf = null;
}

function compile(src){

  var query = require('path').parse(src);

  var name = query.name;
  var ext = query.ext;

  var path = srcToFilePath(src);
  var contents = '';
  var prePromise = Promise.resolve();

  if(ext === '.js'){
    contents = uglifyJS.minify(path).code;
    if(name === 'app'){
      var extensions = contents.match(/lang-[a-z]+?\.js/g);
      var promises = [];

      var prefix = '/static/module/code-prettify/';

      //console.log(extensions);
      extensions.forEach(function(extension){
        var src = prefix + extension;
        promises.push(compile(src).then(function(res){
          contents = contents.replace(extension, res);
        }));
      });
      prePromise = Promise.all(promises).then(function(){
        contents = contents.replace(prefix, '');
      });
    }
  }else if(ext === '.css'){
    var cssText = fs.readFileSync(path);
    contents = new cleanCSS().minify(cssText).styles;      
  }

  var re = new RegExp(name + ext + '$');
  var compressed = name + '.min' + ext;

  path = path.replace(re, compressed);

  if(cdnBucket){
    return prePromise.then(function(){
      fs.writeFileSync(path, contents, 'utf-8');
      
      return new Promise(function(resolve, reject){
        require('checksum').file(path, function(err, sum){
          var cdnFile = 'static/!ssl' + sum.slice(20) + '/' + compressed;

          cdnBucket.putFile(cdnFile, path, function(err, reply){
            if(!err){
              var url = cdnDomain +'/'+ reply.key;
              resolve(url);
            }else{
              reject(err);
            }
          });  
        });
      });  
    });
  }else{
    return prePromise.then(function(){
      fs.writeFileSync(path, contents, 'utf-8');
      
      return Promise.resolve(src.replace(re, compressed) + '?v=' + config.version);
    });
  }
}

function srcToFilePath(src){
  src = require('url').parse(src).pathname;
  return __dirname  + '/src' + src;
}

gulp.task('resource', function() {
  gulp.src(['./src/**/*.min.js', './src/**/*.min.css'])
      .pipe(gulp.dest('./dist'));
});

gulp.task('default', function() {
  gulp.src(['./src/index.html'])
      .pipe(through.obj(function(file, encode, cb) {
        var contents = file.contents.toString(encode);
        var $ = require('cheerio').load(contents, {decodeEntities: false});

        var promises = [];

        var links = $('link');
        for(var i = 0; i < links.length; i++){
          var link = $(links[i]);
          if(link.attr('rel') === 'stylesheet'){
            var href = link.attr('href');
            if(/^\/static\//.test(href)){
              (function(link){
                promises.push(compile(href).then(function(res){
                  link.attr('href', res);
                }).catch(function(err){
                  console.log(err);
                }));
              })(link);
            }
          }
        }

        var scripts = $('script');
        for(var i = 0; i < scripts.length; i++){
          var s = $(scripts[i]);

          if(s.attr('type') == null 
            || s.attr('type') === 'text/javascript'){
            var src = s.attr('src');
            
            if(src){
              if(/^\/static\//.test(src)){
                (function(s, src){
                  promises.push(compile(src).then(function(res){
                    s.attr('src', res);
                  }).catch(function(err){
                    console.log(err);
                  }));
                })(s, src);
              }
            }
          }
        }

        Promise.all(promises).then(function(){
          contents = $.html();

          var HTMLMinifier = require('html-minifier').minify;

          var minified = HTMLMinifier(contents, {
            minifyCSS: true,
            minifyJS: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true
          });   

          file.contents = new Buffer(minified, encode);

          if(!cdnBucket) gulp.start('resource');

          cb(null, file, encode);
        });

      })).pipe(gulp.dest('./dist'));
});