var hljs=new function(){function a(a){return a.replace(/&/gm,"&amp;").replace(/</gm,"&lt;")}function b(a,b,c){return RegExp(b,"m"+(a.case_insensitive?"i":"")+(c?"g":""))}function c(a){for(var b=0;b<a.childNodes.length;b++){var c=a.childNodes[b];if(c.nodeName=="CODE")return c;if(c.nodeType!=3||!c.nodeValue.match(/\s+/))break}}function d(a,b){var c="";for(var e=0;e<a.childNodes.length;e++)if(a.childNodes[e].nodeType==3){var f=a.childNodes[e].nodeValue;b&&(f=f.replace(/\n/g,"")),c+=f}else a.childNodes[e].nodeName=="BR"?c+="\n":c+=d(a.childNodes[e]);return/MSIE [678]/.test(navigator.userAgent)&&(c=c.replace(/\r/g,"\n")),c}function e(a){var b=a.className.split(/\s+/);b=b.concat(a.parentNode.className.split(/\s+/));for(var c=0;c<b.length;c++){var d=b[c].replace(/^language-/,"");if(o[d]||d=="no-highlight")return d}}function f(a){var b=[];return function(a,c){for(var d=0;d<a.childNodes.length;d++)a.childNodes[d].nodeType==3?c+=a.childNodes[d].nodeValue.length:a.childNodes[d].nodeName=="BR"?c+=1:(b.push({event:"start",offset:c,node:a.childNodes[d]}),c=arguments.callee(a.childNodes[d],c),b.push({event:"stop",offset:c,node:a.childNodes[d]}));return c}(a,0),b}function g(b,c,d){function h(){return b.length&&c.length?b[0].offset!=c[0].offset?b[0].offset<c[0].offset?b:c:c[0].event=="start"?b:c:b.length?b:c}function i(b){var c="<"+b.nodeName.toLowerCase();for(var d=0;d<b.attributes.length;d++){var e=b.attributes[d];c+=" "+e.nodeName.toLowerCase(),e.nodeValue!=undefined&&e.nodeValue!=0&&e.nodeValue!=null&&(c+='="'+a(e.nodeValue)+'"')}return c+">"}var e=0,f="",g=[];while(b.length||c.length){var j=h().splice(0,1)[0];f+=a(d.substr(e,j.offset-e)),e=j.offset;if(j.event=="start")f+=i(j.node),g.push(j.node);else if(j.event=="stop"){var k=g.length;do{k--;var l=g[k];f+="</"+l.nodeName.toLowerCase()+">"}while(l!=j.node);g.splice(k,1);while(k<g.length)f+=i(g[k]),k++}}return f+=d.substr(e),f}function h(){function a(c,d,e){if(c.compiled)return;e||(c.beginRe=b(d,c.begin?c.begin:"\\B|\\b"),!c.end&&!c.endsWithParent&&(c.end="\\B|\\b"),c.end&&(c.endRe=b(d,c.end))),c.illegal&&(c.illegalRe=b(d,c.illegal)),c.relevance==undefined&&(c.relevance=1),c.keywords&&(c.lexemsRe=b(d,c.lexems||hljs.IDENT_RE,!0));for(var f in c.keywords){if(!c.keywords.hasOwnProperty(f))continue;c.keywords[f]instanceof Object?c.keywordGroups=c.keywords:c.keywordGroups={keyword:c.keywords};break}c.contains||(c.contains=[]),c.compiled=!0;for(var g=0;g<c.contains.length;g++)a(c.contains[g],d,!1);c.starts&&a(c.starts,d,!1)}for(var c in o){if(!o.hasOwnProperty(c))continue;a(o[c].defaultMode,o[c],!0)}}function i(c,d){function e(a,b){for(var c=0;c<b.contains.length;c++)if(b.contains[c].beginRe.test(a))return b.contains[c]}function f(a,b){if(s[a].end&&s[a].endRe.test(b))return 1;if(s[a].endsWithParent){var c=f(a-1,b);return c?c+1:0}return 0}function g(a,b){return b.illegalRe&&b.illegalRe.test(a)}function j(a,c){var d=[];for(var e=0;e<a.contains.length;e++)d.push(a.contains[e].begin);var f=s.length-1;do s[f].end&&d.push(s[f].end),f--;while(s[f+1].endsWithParent);return a.illegal&&d.push(a.illegal),b(c,"("+d.join("|")+")",!0)}function k(a,b){var c=s[s.length-1];c.terminators||(c.terminators=j(c,r)),c.terminators.lastIndex=b;var d=c.terminators.exec(a);return d?[a.substr(b,d.index-b),d[0],!1]:[a.substr(b),"",!0]}function l(a,b){var c=r.case_insensitive?b[0].toLowerCase():b[0];for(var d in a.keywordGroups){if(!a.keywordGroups.hasOwnProperty(d))continue;var e=a.keywordGroups[d].hasOwnProperty(c);if(e)return[d,e]}return!1}function m(b,c){if(!c.keywords)return a(b);var d="",e=0;c.lexemsRe.lastIndex=0;var f=c.lexemsRe.exec(b);while(f){d+=a(b.substr(e,f.index-e));var g=l(c,f);g?(u+=g[1],d+='<span class="'+g[0]+'">'+a(f[0])+"</span>"):d+=a(f[0]),e=c.lexemsRe.lastIndex,f=c.lexemsRe.exec(b)}return d+=a(b.substr(e,b.length-e)),d}function n(a,b){if(b.subLanguage&&o[b.subLanguage]){var c=i(b.subLanguage,a);return u+=c.keyword_count,c.value}return m(a,b)}function p(b,c){var d=b.className?'<span class="'+b.className+'">':"";b.returnBegin?(v+=d,b.buffer=""):b.excludeBegin?(v+=a(c)+d,b.buffer=""):(v+=d,b.buffer=c),s.push(b),t+=b.relevance}function q(b,c,d){var h=s[s.length-1];if(d)return v+=n(h.buffer+b,h),!1;var i=e(c,h);if(i)return v+=n(h.buffer+b,h),p(i,c),i.returnBegin;var j=f(s.length-1,c);if(j){var k=h.className?"</span>":"";h.returnEnd?v+=n(h.buffer+b,h)+k:h.excludeEnd?v+=n(h.buffer+b,h)+k+a(c):v+=n(h.buffer+b+c,h)+k;while(j>1)k=s[s.length-2].className?"</span>":"",v+=k,j--,s.length--;var l=s[s.length-1];return s.length--,s[s.length-1].buffer="",l.starts&&p(l.starts,""),h.returnEnd}if(g(c,h))throw"Illegal"}h.called||(h(),h.called=!0);var r=o[c],s=[r.defaultMode],t=0,u=0,v="";try{var w=0;r.defaultMode.buffer="";do{var x=k(d,w),y=q(x[0],x[1],x[2]);w+=x[0].length,y||(w+=x[1].length)}while(!x[2]);if(s.length>1)throw"Illegal";return{relevance:t,keyword_count:u,value:v}}catch(z){if(z=="Illegal")return{relevance:0,keyword_count:0,value:a(d)};throw z}}function j(b){var c={keyword_count:0,relevance:0,value:a(b)},d=c;for(var e in o){if(!o.hasOwnProperty(e))continue;var f=i(e,b);f.language=e,f.keyword_count+f.relevance>d.keyword_count+d.relevance&&(d=f),f.keyword_count+f.relevance>c.keyword_count+c.relevance&&(d=c,c=f)}return d.language&&(c.second_best=d),c}function k(a,b,c){return b&&(a=a.replace(/^((<[^>]+>|\t)+)/gm,function(a,c,d,e){return c.replace(/\t/g,b)})),c&&(a=a.replace(/\n/g,"<br>")),a}function l(a,b,c){var h=d(a,c),l=e(a);if(l=="no-highlight")return;if(l)var m=i(l,h);else{var m=j(h);l=m.language}var n=f(a);if(n.length){var o=document.createElement("pre");o.innerHTML=m.value,m.value=g(n,f(o),h)}m.value=k(m.value,b,c);var p=a.className;p.match("(\\s|^)(language-)?"+l+"(\\s|$)")||(p=p?p+" "+l:l);if(/MSIE [678]/.test(navigator.userAgent)&&a.tagName=="CODE"&&a.parentNode.tagName=="PRE"){var o=a.parentNode,q=document.createElement("div");q.innerHTML="<pre><code>"+m.value+"</code></pre>",a=q.firstChild.firstChild,q.firstChild.className=o.className,o.parentNode.replaceChild(q.firstChild,o)}else a.innerHTML=m.value;a.className=p,a.result={language:l,kw:m.keyword_count,re:m.relevance},m.second_best&&(a.second_best={language:m.second_best.language,kw:m.second_best.keyword_count,re:m.second_best.relevance})}function m(){if(m.called)return;m.called=!0;var a=document.getElementsByTagName("pre");for(var b=0;b<a.length;b++){var d=c(a[b]);d&&l(d,hljs.tabReplace)}}function n(){window.addEventListener?(window.addEventListener("DOMContentLoaded",m,!1),window.addEventListener("load",m,!1)):window.attachEvent?window.attachEvent("onload",m):window.onload=m}var o={};this.LANGUAGES=o,this.highlight=i,this.highlightAuto=j,this.fixMarkup=k,this.highlightBlock=l,this.initHighlighting=m,this.initHighlightingOnLoad=n,this.IDENT_RE="[a-zA-Z][a-zA-Z0-9_]*",this.UNDERSCORE_IDENT_RE="[a-zA-Z_][a-zA-Z0-9_]*",this.NUMBER_RE="\\b\\d+(\\.\\d+)?",this.C_NUMBER_RE="\\b(0x[A-Za-z0-9]+|\\d+(\\.\\d+)?)",this.RE_STARTERS_RE="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",this.BACKSLASH_ESCAPE={begin:"\\\\.",relevance:0},this.APOS_STRING_MODE={className:"string",begin:"'",end:"'",illegal:"\\n",contains:[this.BACKSLASH_ESCAPE],relevance:0},this.QUOTE_STRING_MODE={className:"string",begin:'"',end:'"',illegal:"\\n",contains:[this.BACKSLASH_ESCAPE],relevance:0},this.C_LINE_COMMENT_MODE={className:"comment",begin:"//",end:"$"},this.C_BLOCK_COMMENT_MODE={className:"comment",begin:"/\\*",end:"\\*/"},this.HASH_COMMENT_MODE={className:"comment",begin:"#",end:"$"},this.NUMBER_MODE={className:"number",begin:this.NUMBER_RE,relevance:0},this.C_NUMBER_MODE={className:"number",begin:this.C_NUMBER_RE,relevance:0},this.inherit=function(a,b){var c={};for(var d in a)c[d]=a[d];if(b)for(var d in b)c[d]=b[d];return c}}