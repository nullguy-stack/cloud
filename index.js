const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const path = require('path')

const app = express()

app.use(express.json())
app.use(fileUpload({
    createParentPath: true
}))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

const configs = {
    host: "127.0.0.1",
    port: 8080,
}

const url = configs.host + ":" + configs.port

app.listen(configs.port, _=> {
    console.log("Cloud loaded in port 8080\nurl: " + url);
})

app.get('/',(req,res)=>{
    res.redirect('/uploads')
})

app.get('/:path', (req,res) =>{
    let path = req.params.path
    if(!fs.existsSync(path.replace('-','/'))){
        res.send("Error loading dir, make sure to use '-' instead of '/' and that dir exists")
        return
    }
    let files = getFiles(path.replace('-','/'))
    res.render('index', {
        files: files,
        path: path.replace('-','/')
    })
})

app.get('/download/:path', (req,res)=>{
    let path = req.params.path.replace('-','/')
    res.download(path)
})

app.get('/delete/:path/:file', (req,res)=>{
    let path = req.params.path.replace('-','/')
    let dir = path + "/" + req.params.file
    fs.rmdirSync(dir,{recursive: true})
    res.redirect("/"+path)
})

app.get('/previous/:path', (req,res)=>{
    let newpath = req.params.path.substring(0, url.lastIndexOf('/'));
    res.redirect("/"+newpath)
})

app.post('/createDir', (req,res)=>{
    if(!fs.existsSync(req.body.path+"/"+req.body.dirname)){
        fs.mkdirSync(req.body.path+"/"+req.body.dirname)
        console.log("created folder at " + req.body.path+"/"+req.body.dirname)
    }
    else
        console.log("that folder already exist");
    res.redirect("/"+req.body.path.replace('/','-'))
})

app.post('/upload', (req,res)=>{
    fs.writeFileSync('./'+req.body.path+"/"+req.files.file.name, req.files.file.data)
    console.log("uploaded file "+req.files.file.name+" at " + req.body.path);
    res.redirect('/'+req.body.path.replace('/','-'))
})

function getFiles(dir){
    let files = fs.readdirSync(dir)
    let items = []
    files.forEach(file=>{
        items.push({
            name: file,
            ext: path.extname(file),
            size: fs.statSync(dir+"/"+file).size
        })
    })
    return items
}
