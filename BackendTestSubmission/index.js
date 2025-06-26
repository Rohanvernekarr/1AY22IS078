const express= require("express")
const bodyparser= require("body-parser")
const requestLogger = require("../Logging Middleware/Logger")
const nanoid = require("nanoid");
const bodyParser = require("body-parser");
const app = express();
const port = 5000;
  

app.use(bodyParser.json());
app.use(requestLogger);

const urlmap= new Map();

function isValidUrl(url){
    try {
        new Url(url);
        return true;
    } catch {
        return false;
        
    }
}

app.post('/shorturls',async (req,res)=>{
    const { url , validity=30,shortcode}= req.body;


    if(!url || !isValidUrl(url)){
        await Log('backend','error','validation','invalid URL');
        return res.status(409).json({error:"Invalid url"})

    }
    const code = shortcode || nanoid(6);
    if(urlmap.has(code)){
         return res.status(409).json({error:" Short code exists already"})
    }

    const createdAt = new Date();
    const expiry = new Date(createdAt.getTime() + validity* 60000)

    urlmap.set(code, {
        url,
        createdAt,
        expiry,
        clicks:[]
    });

    await Log('backend','info','shorten',`shortened url ${url} as ${code}`);

    return res.status(201).json({
        shortLink:`http://localhost:${port}/${code}`,
        expiry: expiry.toISOString()
    });

});