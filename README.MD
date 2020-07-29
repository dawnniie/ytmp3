# ytmp3

A web application for downloading high quality YouTube videos (supporting DASH). Made using [ytdl-core](https://github.com/fent/node-ytdl-core).

## Basic Setup

Setting up ytmp3 to run on a server is fairly easy. There are a couple of things that are required for installation.

- [Node.JS](https://nodejs.org/en/download/)
- [FFmpeg](https://ffmpeg.org/download.html)

Make sure these are installed and working before continuing.

Now, clone the git repository and import the packages.

```sh
git clone https://github.com/LachlanWalls/ytmp3 && cd ytmp3
npm i
```

Running is as simple as:

```sh
node index.js
```

You might want to use `screen` or a process manager such as [pm2](https://pm2.keymetrics.io/) to run ytmp3, as it will consume the shell window otherwise.

## Functionality

ytmp3 generates a unique id for each conversion. Files are stored under `./cache/:id`, which can be accessed as a static resource from `/dl/:id` on the site.

When the user sends a request to convert a file, and their input has been verified, the audio and video are separately downloaded into `AUD.ext` and `VID.ext` respectively (assuming both audio and video are being converted). `.ext` represents the container of the stream. Once both have been downloaded, FFmpeg is used to combine both into a single `.mp4` file, and the original two files are deleted. Although this can take a long time depending on the video, especially depending on internet and CPU speeds, this system allows for the conversion of DASH videos. You can read more about DASH [here](https://en.wikipedia.org/wiki/Dynamic_Adaptive_Streaming_over_HTTP).

Depending on the file size, videos are automatically deleted after a length of time. This time can be configured, read more about it under Configuration.

There is also an auto-delete time specified for incomplete conversions, which are most likely to arise from errors in the conversion process.

## Configuration

ytmp3 can be configured in `config.json`. The configuration options are listed below.

name | default | description
---- | ------- | -----------
port | 8080 | port to run the localhost server on
db | "json" | type of database to use. See Databases below
db_options | {} | options for the database
cachedir | "cache" | directory to keep video files in
autodelete.xsmall | 336 | autodelete time for xsmall sized files (hours)
autodelete.small | 168 | autodelete time for small sized files (hours)
autodelete.medium | 24 | autodelete time for medium sized files (hours)
autodelete.large | 12 | autodelete time for large sized files (hours)
autodelete.xlarge | 1 | autodelete time for xlarge sized files (hours)
autodelete.xsmall | 24 | autodelete time for incomplete conversions (hours)

## Databases

ytmp3 needs to store data for keeping track of conversions. Due to people often using different system configurations, there are a couple of built in "adapters" for using different databases.

### "json"

The JSON 'db' is the default option. Although JSON databases are usually not very optimal, this solution is very simple and arguably satisfactory for the low read/write speeds this application requires.

### "memory"

The "memory" option simply stores all data in a JS Object. Data will be lost when the application is restarted.

**It is highly recommend you do not use this option!**

### "rethinkdb"

The "rethinkdb" option connects to a rethinkdb instance.
