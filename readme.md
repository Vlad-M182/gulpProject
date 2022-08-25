# My Gulp Project

Gulp project for making layout using modern technologies such as html5, css3, scss, js, typescript.

List of using plugins:

- @rollup/plugin-typescript
- browser-sync
- del
- gulp
- gulp-autoprefixer
- gulp-better-rollup
- gulp-clean-css
- gulp-file-include
- gulp-group-css-media-queries
- gulp-imagemin
- gulp-rename
- gulp-sass
- gulp-sourcemaps
- gulp-svg-sprite
- gulp-ttf2woff
- gulp-ttf2woff2
- gulp-webp
- rollup-plugin-terser
- sass
- tslib

## Concept

First you start working part gulp project it creates temp folder with partially or completely compiled files, that is displayed in the browser.

When project finished or partly finished you can execute buildProject function that will complitely compile all the files and insert them into new folder which will be called the same as the root folder.

## 1: Working part

Function watching starts and executes watchFiles, browserSenc and work functions.

WatchFiless is used for watching for html, css, ts, images, audio and video files.<br/>
BrwserSync is used for reloading page in browser.

Work function first executes clean which delete folder #temp if it exists.

Then in paralell starts functions: script, css, html, images, video_audio, fonts;

### html function

Get all the html files, pass throw fileinclude and insert into #temp folder.

### css function

Get all the scss files, pass throw scss, autoprefixer and insert them into #temp/css folder.

### script function

Get all the ts files, creates sourcemaps, then pass throw rollup plugin and insert compiled js files into #temp/js folder.

### images, video, audio function

In this part all of this functions just copy files into #temp in appropriate folder.

### fonts function

Acceps only ttf fonts. Get all the font files and pass them throw ttf2woff, ttf2woff2 plugins, and inserts them into #temp/fonts folder.

### svgSprites - aditional function

It is used for converting all svg icons into svg sprites. It get all the icons, pass throw "gulp-svg-sprite" plugin then it creates "icons/icons.svg" file with all icons.

## 2: Building project part

This is final stage in creating project.

BuildProject function executes clean, htmlBuild, cssBuild, jsBuild, imgBuild, video_audioBuild, fontsBuild functions that will fully compile all the files, create final folder with name of the root folder.

All the functions get files from src folder.

### htmlBuild function

It pass html files throw gulp-file-include plugin and insert them into final folder.

### cssBuild function

It pass css files throw gulp-sass, gulp-group-css-media-queries, gulp-autoprefixer, gulp-clean-css and gulp-rename and create two css files with expanded and minified format.

### jsBuild function

It pass ts files throw gulp-sourcemaps and rollup, creates two js files with expanded and mified format and insert them into final folder.

### imgBuild function

This function works with images in turn:

- jpg, png, webp images pass them throw gulp-webp plugin
- svg, gif, ico images just copy into final folder
- jpg, png, svg, gif images pass throw gulp-imagemin

As a result in final image folder will appear minified or converted into webp images.

### video_audioBuild function

This function just copy video and audio files into final folder.

### fontsBuild function

This function convert ttf files into woff and woff2 files and insert them into final folder.
