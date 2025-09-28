class Memo {
  constructor(options) {
    this.el = document.querySelector(options.el)
    this.url = options.url
    this.img = options.img ? `<img src="${options.img}">` : '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24px" height="30px" fill="#333"><rect x="0" y="0" width="4" height="15"><animate attributeName="opacity" values="1;.2;1" begin="0s" dur="0.6s" repeatCount="indefinite"></animate></rect><rect x="10" y="0" width="4" height="15"><animate attributeName="opacity" values="1;.2;1" begin="0.2s" dur="0.6s" repeatCount="indefinite"></animate></rect><rect x="20" y="0" width="4" height="15"><animate attributeName="opacity" values="1;.2;1" begin="0.4s" dur="0.6s" repeatCount="indefinite"></animate></rect></svg>'
    this.cpage = 0
    this.init()
  }

  $(e) {
    return this.el.querySelector(e)
  }

  T(t) {
    const i = new Date(t)
    const ps = (p) => { return String(p).padStart(2, "0") }
    const [e, n, a, s, d] = [i.getFullYear(), ps(i.getMonth() + 1), ps(i.getDate()), ps(i.getHours()), ps(i.getMinutes())];
    return `${e}-${n}-${a} ${s}:${d}`
  }

  cr(e) {
    return document.createElement(e)
  }

  async init() {
    const main = `<div id="memo-cont"></div><div id="memo-more" style="text-align:center;padding:2em"></div>`
    this.el.innerHTML = main
    this.$('#memo-more').innerHTML = this.img
    this.FD()
  }

  async FD() {
    const reply = await fetch(`${this.url}/memo/li/${this.cpage}/10`)

    if (!reply.ok) {
      setTimeout(() => {
        this.el.innerHTML = "•︡ᯅ•︠ Unable connect to radio waves."
      }, 2000);
    }
    this.RD(await reply.json());
  }
  RD(params) {
    const { data, max } = params
    const fragment = document.createDocumentFragment();
    for (const item of data) {
      let { text, img, date } = item
      const memoItem = this.cr('div')
      let image = ''
      if (img.length >= 1) image = `<img src="https://raw.gitcode.com/rainto/Album/raw/main/daily/${img[0]}.png">`
      memoItem.className = 'm-item'
      const memoContent = `<div class="i-cont">${image}${text}</div><div class="i-meta"><time datetime="${date}">${this.T(date)}</time></div>`
      memoItem.innerHTML = memoContent
      fragment.appendChild(memoItem)
    }

    const more = this.$('#memo-more')

    if (this.cpage + 1 < max) {
      const loadMoreButton = this.cr('div');
      loadMoreButton.textContent = 'ʕ•ᴥ•ʔ Click me to load more.';
      loadMoreButton.onclick = () => {
        more.innerHTML = this.img
        this.loadMore()
      }
      more.innerHTML = ''
      more.appendChild(loadMoreButton);
    } else {
      more.innerHTML = "૮₍•́₃•̀₎ა Really not a drop left."
    }

    this.$('#memo-cont').appendChild(fragment);
  }

  loadMore() {
    this.cpage += 1;
    this.FD();
  }
}