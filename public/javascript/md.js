;((function(){var b,c,d,e,f,g,h,i,j,k,l,a={newline:/^\n+/,code:/^ {4,}[^\n]*(?:\n {4,}[^\n]*|\n)*(?=\n| *$)/,gfm_code:/^ *``` *(\w+)? *\n([^\0]+?)\s*```(?= *\n| *$)/,hr:/^( *[\-*_]){3,} *\n/,heading:/^ *(#{1,6}) *([^\0]+?) *#* *\n+/,lheading:/^([^\n]+)\n *(=|-){3,}/,blockquote:/^ *>[^\n]*(?:\n *>[^\n]*)*/,list:/^( *)([*+-]|\d+\.) [^\0]+?(?:\n{2,}(?! )|\s*$)(?!\1\2|\1\d+\.)/,html:/^ *(?:<!--[^\0]*?-->|<(\w+)[^\0]+?<\/\1>|<\w+[^>]*>) *(?:\n{2,}|\s*$)/,text:/^[^\n]+/,paragraph:/^/};a.html=function(){var b="(article|aside|audio|blockquote|canvas|caption|col|colgroup|dialog|div|d[ltd]|embed|fieldset|figure|figcaption|footer|form|h[1-6r]|header|hgroup|input|label|legend|li|nav|noscript|object|[ou]l|optgroup|option|p|param|pre|script|section|select|source|table|t(?:body|foot|head)|t[dhr]|textarea|video)";return new RegExp(a.html.source.replace("(\\w+)",b))}(),a.paragraph=function(){var b=[];return function c(d){return d=a[d].source.replace("\\1","\\w+"),b.push(d.replace(/(^|[^\[])\^/g,"$1")),c}("gfm_code")("hr")("heading")("lheading")("blockquote")("html"),b=b.join("|"),new RegExp("^([^\\n]+\\n?(?!"+b+"))+\\n*")}(),a.lexer=function(b){var c=[],d={};return b=b.replace(/\r\n|\r/g,"\n").replace(/\t/g,"    "),b=b.replace(/^ {0,3}\[([^\]]+)\]: *([^ ]+)(?: +"([^\n]+)")? *$/gm,function(a,b,c,e){return d[b]={href:c,title:e},""}),c.links=d,a.token(b,c,!0)},a.token=function(b,c,d){var e,f,g,h,i,j,b=b.replace(/^ +$/gm,"");while(b){if(f=a.newline.exec(b))b=b.substring(f[0].length),f[0].length>1&&c.push({type:"space"});if(f=a.code.exec(b)){b=b.substring(f[0].length),f=f[0].replace(/^ {4}/gm,""),c.push({type:"code",text:f[f.length-1]==="\n"?f.slice(0,-1):f});continue}if(f=a.gfm_code.exec(b)){b=b.substring(f[0].length),c.push({type:"code",lang:f[1],text:f[2]});continue}if(f=a.heading.exec(b)){b=b.substring(f[0].length),c.push({type:"heading",depth:f[1].length,text:f[2]});continue}if(f=a.lheading.exec(b)){b=b.substring(f[0].length),c.push({type:"heading",depth:f[2]==="="?1:2,text:f[1]});continue}if(f=a.hr.exec(b)){b=b.substring(f[0].length),c.push({type:"hr"});continue}if(f=a.blockquote.exec(b)){b=b.substring(f[0].length),c.push({type:"blockquote_start"}),f=f[0].replace(/^ *>/gm,""),a.token(f,c,d),c.push({type:"blockquote_end"});continue}if(f=a.list.exec(b)){b=b.substring(f[0].length),c.push({type:"list_start",ordered:isFinite(f[2])}),e=/\n *\n *(?:[*+-]|\d+\.)/.test(f[0]),f=f[0].match(/^( *)([*+-]|\d+\.)[^\n]*(?:\n(?!\1\2|\1\d+\.)[^\n]*)*/gm),i=0,j=f.length;for(;i<j;i++)g=f[i].replace(/^ *([*+-]|\d+\.) */,""),h=/\n( +)/.exec(g),h&&(h=new RegExp("^"+h[1],"gm"),g=g.replace(h,"")),c.push({type:e?"loose_item_start":"list_item_start"}),a.token(g,c),c.push({type:"list_item_end"});c.push({type:"list_end"});continue}if(f=a.html.exec(b)){b=b.substring(f[0].length),c.push({type:"html",text:f[0]});continue}if(d&&(f=a.paragraph.exec(b))){b=b.substring(f[0].length),c.push({type:"paragraph",text:f[0]});continue}if(f=a.text.exec(b)){b=b.substring(f[0].length),c.push({type:"text",text:f[0]});continue}}return c};b={escape:/^\\([\\`*{}\[\]()#+\-.!_])/,autolink:/^<([^ >]+(@|:\/)[^ >]+)>/,gfm_autolink:/^(\w+:\/\/[^\s]+[^.,:;"')\]\s])/,tag:/^<!--[^\0]*?-->|^<\/?\w+[^>]*>/,link:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]\(([^\)]*)\)/,reflink:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]\s*\[([^\]]*)\]/,nolink:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,strong:/^__(?=\S)([^\0]*?\S)__(?!_)|^\*\*(?=\S)([^\0]*?\S)\*\*(?!\*)/,em:/^\b_(?=\S)([^\0]*?\S)_\b|^\*(?=\S)([^\0]*?\S)\*/,code:/^`([^`]+)`|^``([^\0]+?)``/,br:/^ {2,}\n(?!\s*$)/,text:/^/};b.text=function(){var a=[];return function c(d){return d=b[d].source,a.push(d.replace(/(^|[^\[])\^/g,"$1")),c}("escape")("gfm_autolink")("tag")("nolink")("strong")("em")("code")("br"),new RegExp("^[^\\0]+?(?="+a.join("|")+"|$)")}(),b.lexer=function(a){var g,h,i,l,e="",f=d.links;while(a){if(l=b.escape.exec(a)){a=a.substring(l[0].length),e+=l[1];continue}if(l=b.autolink.exec(a)){a=a.substring(l[0].length),l[2]==="@"?(h=l[1][6]===":"?k(l[1].substring(7)):k(l[1]),i=k("mailto:")+h):(h=j(l[1]),i=h),e+='<a href="'+i+'">'+h+"</a>";continue}if(l=b.gfm_autolink.exec(a)){a=a.substring(l[0].length),h=j(l[1]),i=h,e+='<a href="'+i+'">'+h+"</a>";continue}if(l=b.tag.exec(a)){a=a.substring(l[0].length),e+=l[0];continue}if(l=b.link.exec(a)){a=a.substring(l[0].length),h=/^\s*<?([^\s]*?)>?(?:\s+"([^\n]+)")?\s*$/.exec(l[2]),g={href:h[1],title:h[2]},e+=c(l,g);continue}if((l=b.reflink.exec(a))||(l=b.nolink.exec(a))){a=a.substring(l[0].length),g=(l[2]||l[1]).replace(/\s+/g," "),g=f[g];if(!g){e+=l[0][0],a=l[0].substring(1)+a;continue}e+=c(l,g);continue}if(l=b.strong.exec(a)){a=a.substring(l[0].length),e+="<strong>"+b.lexer(l[2]||l[1])+"</strong>";continue}if(l=b.em.exec(a)){a=a.substring(l[0].length),e+="<em>"+b.lexer(l[2]||l[1])+"</em>";continue}if(l=b.code.exec(a)){a=a.substring(l[0].length),e+="<code>"+j(l[2]||l[1],!0)+"</code>";continue}if(l=b.br.exec(a)){a=a.substring(l[0].length),e+="<br>";continue}if(l=b.text.exec(a)){a=a.substring(l[0].length),e+=j(l[0]);continue}}return e};c=function(a,c){return a[0][0]!=="!"?'<a href="'+j(c.href)+'"'+(c.title?' title="'+j(c.title)+'"':"")+">"+b.lexer(a[1])+"</a>":'<img src="'+j(c.href)+'" alt="'+j(a[1])+'"'+(c.title?' title="'+j(c.title)+'"':"")+">"},f=function(){return e=d.pop()},g=function(){switch(e.type){case"space":return"";case"hr":return"<hr>";case"heading":return"<h"+e.depth+">"+b.lexer(e.text)+"</h"+e.depth+">";case"code":return"<pre><code"+(e.lang?' class="lang-'+e.lang+'"':"")+">"+(e.escaped?e.text:j(e.text,!0))+"</code></pre>";case"blockquote_start":var a=[];while(f().type!=="blockquote_end")a.push(g());return"<blockquote>"+a.join("")+"</blockquote>";case"list_start":var c=e.ordered?"ol":"ul",a=[];while(f().type!=="list_end")a.push(g());return"<"+c+">"+a.join("")+"</"+c+">";case"list_item_start":var a=[];while(f().type!=="list_item_end")a.push(e.type==="text"?h():g());return"<li>"+a.join(" ")+"</li>";case"loose_item_start":var a=[];while(f().type!=="list_item_end")a.push(g());return"<li>"+a.join(" ")+"</li>";case"html":return b.lexer(e.text);case"paragraph":return"<p>"+b.lexer(e.text)+"</p>";case"text":return"<p>"+h()+"</p>"}},h=function(){var a=[e.text],c;while((c=d[d.length-1])&&c.type==="text")a.push(f().text);return b.lexer(a.join("\n"))},i=function(a){d=a.reverse();var b=[];while(f())b.push(g());return d=null,e=null,b.join("\n")},j=function(a,b){return a.replace(b?/&/g:/&(?!#?\w+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")},k=function(a){var b="",c,d=0,e=a.length;for(;d<e;d++)c=a.charCodeAt(d),Math.random()>.5&&(c="x"+c.toString(16)),b+="&#"+c+";";return b},l=function(b){return i(a.lexer(b))};l.parser=i,l.lexer=a.lexer,l.parse=l,typeof module!="undefined"?module.exports=l:this.marked=l})).call(this)