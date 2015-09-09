var Game;(function(d){var c=(function(){function e(f){var g=this;this.stepObjects=new Array();this.renderObjects=new Array();this.countFPS=0;this.fps=0;this.countSPS=0;this.sps=0;this.running=false;window.addEventListener("resize",function(){return g.resizeCanvas()});this.canvas=f;this.resizeCanvas();this.keyboardController=new a();this.addStepObject(this.keyboardController);this.addRenderObject({render:function(h){h.fillText(g.fps.toString(),10,10);h.fillText(g.sps.toString(),10,25)}})}e.prototype.addStepObject=function(f){this.stepObjects.push(f)};e.prototype.addRenderObject=function(f){this.renderObjects.push(f)};e.prototype.step=function(){this.stepObjects.forEach(function(f){return f.step()});this.countSPS++};e.prototype.render=function(){var h=this;var f=this.canvas.getContext("2d");f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,this.canvas.width,this.canvas.height);this.renderObjects.forEach(function(g){return g.render(f)});this.countFPS++;if(this.running){window.requestAnimationFrame(function(){return h.render()})}};e.prototype.start=function(f){var g=this;this.stop();this.running=true;window.requestAnimationFrame(function(){return g.render()});this.stepToken=setInterval(function(){return g.step()},1000/f);this.countFPSToken=setInterval(function(){g.fps=g.countFPS;g.countFPS=0;g.sps=g.countSPS;g.countSPS=0},1000)};e.prototype.stop=function(){if(this.stepToken){clearInterval(this.stepToken)}if(this.countFPSToken){clearInterval(this.countFPSToken)}this.stepToken=null;this.countFPSToken=null;this.running=false};e.prototype.addKeyListener=function(f,g){this.keyboardController.addListener(f,g)};e.prototype.resizeCanvas=function(){this.canvas.width=this.canvas.clientWidth;this.canvas.height=this.canvas.clientHeight};return e})();d.GameView=c;var a=(function(){function e(){var f=this;this.pressedKeys={};this.keyListeners={};document.addEventListener("keydown",function(g){f.pressedKeys[g.keyCode]=true});document.addEventListener("keyup",function(g){f.pressedKeys[g.keyCode]=false})}e.prototype.step=function(){for(var f in this.keyListeners){if(this.pressedKeys[f]){this.keyListeners[f].forEach(function(g){return g()})}}};e.prototype.addListener=function(g,h){var f=this.keyListeners[g];if(!f){f=[];this.keyListeners[g]=f}f.push(h)};return e})();(function(e){e[e.LEFT=37]="LEFT";e[e.UP=38]="UP";e[e.RIGHT=39]="RIGHT";e[e.DOWN=40]="DOWN"})(d.Keys||(d.Keys={}));var b=d.Keys})(Game||(Game={}));