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

const getSelectedStreams = () => {
    let av, vv
    document.querySelectorAll("input[type='radio'][name='astream']").forEach(rad => { if (rad.checked) av = rad.value })
    document.querySelectorAll("input[type='radio'][name='vstream']").forEach(rad => { if (rad.checked) vv = rad.value })
    let asr = streams.filter(stream => stream.itag == av)[0] || 'none'
    let vsr = streams.filter(stream => stream.itag == vv)[0] || 'none'
    return [asr, vsr]
}

const calculateSize = () => {
    let streams = getSelectedStreams()
    let asr = streams[0],
        vsr = streams[1]
    if (asr == 'none' && vsr == 'none') {
        document.querySelector("#download").setAttribute("disabled", "")
        document.querySelector("#download").innerHTML = "Convert"
    } else {
        document.querySelector("#download").removeAttribute("disabled")
        document.querySelector("#download").innerHTML = "Convert " + ((asr != 'none' && vsr == 'none') ? ".mp3" : ".mp4") + " (" + convertFS((asr['filesize'] || 0) + (vsr['filesize'] || 0)) + ")"
    }
}

let streams = []
let title = ""

document.querySelector("#continue").onclick = async() => {
    document.querySelector("#continue").removeAttribute("show")
    document.querySelector("#content>.spinner").setAttribute("show", "")
    document.querySelector("#downloadv").removeAttribute("show")

    let info = await fetch(location.origin + "/api/info", {
        method: "POST",
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: document.querySelector("input").value })
    }).then(res => res.json())

    if (info.err) return alert("An unexpected error has occured. Please refresh and try again.\n\nCode: " + info.err)

    let video = info.playerResponse.videoDetails
    let tmbs = video.thumbnail.thumbnails
    document.querySelector("#vidinfo>img").src = tmbs[tmbs.length - 1].url
    document.querySelector("#vidinfo>h2").innerHTML = video.title
    title = video.title
    document.querySelector("#vidinfo").setAttribute("show", "")

    let settype = (s, t) => {
        s.type = t
        return s
    }
    let sortbr = (a, b) => (b.averageBitrate || b.bitrate || (b.audioBitrate * 1000) || 0) - (a.averageBitrate || a.bitrate || (a.audioBitrate * 1000) || 0)
    let audiostreams = info.formats.filter(stream => stream.mimeType.includes("audio/")).sort(sortbr).map(s => settype(s, "a"))
    let videostreams = info.formats.filter(stream => stream.mimeType.includes("video/")).sort(sortbr).map(s => settype(s, "v"))

    streams = audiostreams.concat(videostreams)

    let acns = document.querySelector("#options>.audio>table").childNodes
    while (acns.length > 2) acns[2].parentElement.removeChild(acns[2])
    let vcns = document.querySelector("#options>.video>table").childNodes
    while (vcns.length > 2) vcns[2].parentElement.removeChild(vcns[2])

    streams.forEach((stream, i) => {
        let br = (stream.averageBitrate || stream.bitrate || (stream.audioBitrate * 1000) || 0)
        let tr = document.createElement("tr")

        function makeTD(h) {
            let td = document.createElement("td")
            td.innerHTML = h
            tr.appendChild(td)
        }

        makeTD('<input type="radio" name="' + stream.type + 'stream" value="' + stream.itag + '">')

        if (stream.type == "v") {
            makeTD(stream.qualityLabel)
            makeTD((stream.fps) ? stream.fps + "fps":"-")
        }

        makeTD(Math.round(br / 1000) + "kb/s")
        makeTD(stream.codecs)
        let len = (Number(stream.approxDurationMs) / 1000) || Number(info.length_seconds) || 0
        makeTD(convertFS(br * len / 8))
        streams[i].filesize = br * len / 8
        document.querySelector("#options>." + ((stream.type == "v") ? "video" : "audio") + ">table").appendChild(tr)
    })

    document.querySelector("#options>.audio").setAttribute("show", "")
    document.querySelector("#options>.video").setAttribute("show", "")

    calculateSize()
    document.querySelector("#download").setAttribute("show", "")

    document.querySelectorAll("input[type='radio']").forEach(input => input.addEventListener('click', calculateSize))

    document.querySelector("#content>.spinner").removeAttribute("show")
    document.querySelector("#continue").setAttribute("show", "")
    document.querySelector("#content").setAttribute("up", "")

}


document.querySelector("#download").onclick = async() => {
    document.querySelector("#download").setAttribute("disabled", "")

    let sstreams = getSelectedStreams()
    document.querySelector("#download").innerHTML = "Preparing..."

    let res = await fetch(location.origin + '/api/convert', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url: document.querySelector("input").value,
            aitag: sstreams[0].itag,
            vitag: sstreams[1].itag
        })
    }).then(res => res.json())

    if (res.err) {
        alert("Sorry, something went wrong preparing your video! " + JSON.stringify(res))
        window.location = window.location
    } else location.assign('/c/' + res.id)
}