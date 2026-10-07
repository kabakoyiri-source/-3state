(function(){
  var header=document.querySelector('header'),burger=document.querySelector('.burger'),mobile=document.querySelector('.mobile');
  window.addEventListener('scroll',function(){header.classList.toggle('scrolled',window.scrollY>8)},{passive:true});
  burger.addEventListener('click',function(){var o=mobile.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
  document.querySelectorAll('h1,h2,.leader-txt h3,.center-title').forEach(function(h){
    var n=0;
    (function walk(node){Array.prototype.slice.call(node.childNodes).forEach(function(c){
      if(c.nodeType===3){var f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(function(t){
        if(!t)return; if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(' '));return}
        var o=document.createElement('span');o.className='w';var i=document.createElement('span');i.textContent=t;i.style.transitionDelay=(n++*0.06)+'s';o.appendChild(i);f.appendChild(o)});
        c.parentNode.replaceChild(f,c)} else if(c.nodeType===1)walk(c)})})(h);
    h.classList.add('words');
    if(!h.closest('.reveal'))h.classList.add('reveal');
  });
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    els.forEach(function(el){io.observe(el)});
  } else els.forEach(function(el){el.classList.add('in')});
  setTimeout(function(){els.forEach(function(el){el.classList.add('in')})},1200);
  window.addEventListener('beforeprint',function(){els.forEach(function(el){el.classList.add('in')})});
})();
