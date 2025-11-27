window.Memo = {
    $: function (e) {
        return this.el?.querySelector(e);
    },
    c: (e, c) => {
        const item = document.createElement(e)
        item.className = c
        return item
    },
    t: (t) => {
        const d = new Date(t);
        const f = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${f(d.getMonth() + 1)}-${f(d.getDate())} ${f(d.getHours())}:${f(d.getMinutes())}`;
    },
    f: async function () {
        const { ok, data, max } = await fetch(`${this.api}/memo/li/${this.cpage}/10`).then(e => e.json());
        if (!ok) {
            setTimeout(() => {
                this.el.innerHTML = "Unable connect to radio waves."
            }, 2000);
        }
        this.r(data, max);
    },
    r: async function (data, max) {
        var b = this
        const fragment = document.createDocumentFragment();
        for (const item of data) {
            let { text, img, date } = item

            // Create elements
            const memo_item = b.c('div', 'm-item')
            const memo_cont = b.c('div', 'm-cont')
            const memo_date = b.c('time', 'm-date')
            const view_box = b.c('ul', `view-box grid-${img.length}`)
            memo_date.dateTime = date
            memo_date.innerText = b.t(date)

            // markdown conversion
            const parser = new DOMParser();
            const content = parser.parseFromString(text.replace(/\n/g, "<br>"), "text/html").body.innerHTML
            memo_cont.innerHTML = content

            // Viewbox image
            for (const img_path of img) {
                const img_item = b.c('li', '')

                const img = b.c('img')
                img.src = `https://raw.gitcode.com/rainto/Album/raw/main/daily/${img_path}.png`
                view_box.setAttribute('view-image', '')

                img_item.appendChild(img)
                view_box.appendChild(img_item)
            }

            // Add elements
            if (img.length > 0) memo_item.appendChild(view_box)
            memo_item.appendChild(memo_cont)
            memo_item.appendChild(memo_date)
            fragment.appendChild(memo_item)
        }

        // Load More
        const more = b.el.querySelector('#m-more')

        if (b.cpage + 1 < max) {
            const loadMoreButton = b.c('div');
            loadMoreButton.textContent = 'ʕ•ᴥ•ʔ Click me to load more.';
            loadMoreButton.onclick = () => {
                more.innerHTML = b.img
                b.loadMore()
            }
            more.innerHTML = ''
            more.appendChild(loadMoreButton);
        } else {
            more.innerHTML = "૮₍•́₃•̀₎ა Really not a drop left."
        }

        this.el.querySelector('#m-cont').appendChild(fragment);

        // Initialize ViewImage only on the first load
        if (!this.view) {
            ViewImage.init();
            this.view = true;
        }
    },
    init: async function ({ el = '#memo', api, img }) {
        Object.assign(this, {
            el: document.querySelector(el),
            api,
            img: img ? `<img src="${img}">` : '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24px" height="30px" fill="#333"><rect x="0" y="0" width="4" height="15"><animate attributeName="opacity" values="1;.2;1" begin="0s" dur="0.6s" repeatCount="indefinite"></animate></rect><rect x="10" y="0" width="4" height="15"><animate attributeName="opacity" values="1;.2;1" begin="0.2s" dur="0.6s" repeatCount="indefinite"></animate></rect><rect x="20" y="0" width="4" height="15"><animate attributeName="opacity" values="1;.2;1" begin="0.4s" dur="0.6s" repeatCount="indefinite"></animate></rect></svg>',
            cpage: 0
        });
        this.el.innerHTML = '<div id="m-cont"></div><div id="m-more" style="text-align:center;padding:2em;cursor:pointer"></div>';
        this.$("#m-more").innerHTML = this.img
        this.f()
    },
    loadMore: function () {
        this.cpage += 1;
        this.f();
    }
};