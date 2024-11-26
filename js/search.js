(async () => {
  const $ = (e) => {
    return document.getElementById(e)
  }
  const cr = (e) => {
    return document.createElement(e)
  }
  const list = await (async () => {
    const response = await fetch(document.currentScript.getAttribute("path"))
    return await response.json();
  })()
  const add = (a, b) => { a.appendChild(b) }
  if (!list) return
  const searchResult = $('s-res')
  $('s-txt').focus()
  $('s-txt').oninput = (e) => {
    searchResult.innerHTML = ''
    const keyWord = e.target.value.trim().split(/[\s\-]+/)
    if (!keyWord[0]) return

    $('s-res').innerHTML = ''
    const box = document.createDocumentFragment()
    list.forEach(ele => {
      var title = ele.title.trim()
      var content = ele.content
        .trim()
        .replace(/<[^>]+>/g, '')
        .toLowerCase()
      var indexTitle = -1, indexContent = -1
      for (const key of keyWord) {
        indexTitle = title.indexOf(key)
        indexContent = content.indexOf(key)
        // No results
        if (indexTitle < 0 && indexContent < 0) {
          return
        }
        const reg = new RegExp(`(${key})`, 'gi')
        const highLight = '<span class="s-key">$1</span>'
        // Highlight titles containing keywords
        const matchTitle = title.replace(reg, highLight)
        // The front and back of keywords.
        const matchContent = (content.substring(
          indexContent - 10,
          indexContent + 50
        )).replace(reg, highLight)

        const item = cr('a')
        const itemTitle = cr('span')
        const itemContent = cr('span')
        item.href = ele.link
        item.className = "s-item"
        itemTitle.innerHTML = matchTitle
        itemContent.innerHTML = matchContent + "..."
        itemTitle.className = "s-title"
        itemContent.className = "s-cont"
        add(item,itemTitle)
        add(item,itemContent)
        add(box,item)
      }
    })
    add(searchResult,box)
    var num = 0
    let len = searchResult.childNodes.length
    // Keymap
    window.addEventListener("keydown", e => {
      if (e.code === "ArrowDown") {
        num < len ? num++ : num = 1
        searchResult.childNodes[num - 1].focus()
      }
      if (e.code === "ArrowUp") {
        num > 1 ? num-- : num = len
        searchResult.childNodes[num - 1].focus()
      }
      if (e.code === "Escape") {
        $('s-txt').focus()
      }
    })
  }

})()
