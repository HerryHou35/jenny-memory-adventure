// Emit an apply_patch patch; never modify source files or recompress media.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../dist'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const release=/name="jenny-release" content="([^"]+)"/.exec(fs.readFileSync(path.join(root,'index.html'),'utf8'))[1];
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(path.join(dir,f.name)):[path.join(dir,f.name)]);}
const files=walk(root).filter(f=>!f.endsWith('precache-manifest.json')&&!f.endsWith('.gitkeep')).sort().map(f=>{const data=fs.readFileSync(f);return {path:path.relative(root,f).split(path.sep).join('/'),bytes:data.length,sha256:sha(data)};});
const version=sha(JSON.stringify({release,files})).slice(0,16),manifest={release,version,totalBytes:files.reduce((s,f)=>s+f.bytes,0),files};
const dest='dist/precache-manifest.json',existing=fs.existsSync(path.join(root,'precache-manifest.json'));
if(process.argv.includes('--check')){
  if(!existing||JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'precache-manifest.json'),'utf8')))!==JSON.stringify(manifest))throw Error('Preparation manifest is stale; generate and apply its update before publishing.');
  console.log(JSON.stringify({valid:true,version,files:files.length}));process.exit(0);
}
let patch='*** Begin Patch\n';
if(existing)patch+='*** Update File: '+dest+'\n@@\n'+fs.readFileSync(path.join(root,'precache-manifest.json'),'utf8').trimEnd().split(/\r?\n/).map(x=>'-'+x).join('\n')+'\n';
else patch+='*** Add File: '+dest+'\n';
patch+=JSON.stringify(manifest,null,2).split('\n').map(x=>'+'+x).join('\n')+'\n*** End Patch';
process.stdout.write(patch);
