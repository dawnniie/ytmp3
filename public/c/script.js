const convertFS = (s) => {
    let size = s,
        exts = ['B', 'KB', 'MB'],
        ei = 0
    while (size > 1000) {
        if (ei < 2) {
            ei += 1
            size = Math.round(size / 10) / 100
        } else break
    }
    return size + " " + exts[ei]
}

function update() {
    document.querySelector('#vidinfomk2>h2').innerText = viddat.title

    if (viddat.status === 'preparing') document.querySelector('.preparing').setAttribute('status', 'loading')
    else document.querySelector('.preparing').setAttribute('status', 'complete')

    if (viddat.status === 'processing') document.querySelector('.processing').setAttribute('status', 'loading')
    else if (viddat.status === 'complete') document.querySelector('.processing').setAttribute('status', 'complete')

    if (viddat.status === 'complete') {
        document.querySelector('.complete').setAttribute('status', 'complete')
        document.querySelector('#downloadv').innerText = "Download " + convertFS(viddat.size)
        document.querySelector('#downloadv').onclick = () => location.assign(viddat.dlurl)
        document.querySelector('#downloadv').setAttribute('show', '')
    }
}

async function post() {
    let dat = await fetch(location.href.replace('/c/', '/api/dl/'), { method: 'POST' }).then(res => res.json())
    if (!dat.err) {
        viddat = dat
        update()
    }
    window.setTimeout(post, 500)
}

update()
window.setTimeout(post, 500)