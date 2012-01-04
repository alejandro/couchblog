article
  nav.article
  a.previous(href='/twittering-with-d3.html', title='Twittering with D3') ❬
  header
    time(datetime=new Date(date.date), pubdate='#{date.now}')
      span.day #{date.day}-
      span.month #{date.month}-
      span.year #{date.year}
    h1.entry-title
      a(href='/mustache.html') #{post.title}
  .entry-content!= post.content
  footer
    p.meta
      | Este post fue escrito por
      a(href=post.author.contact) #{post.author.name}
      | en
      time(datetime=new Date(date.date), pubdate='#{date.now}')
        span.day #{date.day}-
        span.month #{date.month}-
        span.year #{date.year}
      | en
      span.categories
      - try {
        - post.tags.forEach(function(tag){
            a.category(href='/tags/'+ tag) #{tag} ,
        - });
      - } catch (exc){
        a.category(href='/tags/') sin tags
      - }
      | con
      a(href='/mustache.html#disqus_thread', data-disqus-identifier='http://nimbupani.com/mustache.html')  1 Comment
      | . Si te gustaria actualizar o modificar haz un
      a(href='https://github.com/nimbupani/nimbupani.github.com/blob/source/source/_posts/2012-01-01-mustache.md') pull request
      | .