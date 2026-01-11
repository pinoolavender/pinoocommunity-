let musicStarted = false;
const audio = document.getElementById("myAudio");
let globalJsResult = "";
let jsFileContent = "";

function startApp() {
    audio.play().catch(e => console.log("Audio Error"));
    musicStarted = true;
    document.getElementById("overlay").style.opacity = "0";
    setTimeout(() => { document.getElementById("overlay").style.display = "none"; }, 800);
}

document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        audio.pause();
    } else {
        if (musicStarted) {
            audio.play();
        }
    }
});

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }

function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    document.getElementById('sidebar').classList.remove('active');
}

const fInput = document.getElementById('fInput');
if(fInput) {
    fInput.onchange = () => { if(fInput.files[0]) document.getElementById('fName').innerText = fInput.files[0].name; };
}

async function doDeploy() {
    const token = "bazMfOcKIQhtdfekRAW7Udwn"; 
    const name = document.getElementById('pName').value.trim().toLowerCase().replace(/\s+/g, '-');
    const btn = document.getElementById('dBtn');
    if(!name || !fInput.files[0]) return alert("LENGKAPI DATA!");

    btn.innerHTML = "DEPLOYING..."; btn.disabled = true;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const res = await fetch('https://api.vercel.com/v13/deployments', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name, target: 'production',
                    files: [{ file: 'index.html', data: e.target.result }],
                    projectSettings: { framework: null }
                })
            });
            if(res.ok) {
                const url = `https://${name}.vercel.app`;
                document.getElementById('rBox').style.display = "block";
                document.getElementById('rLink').innerText = url;
                document.getElementById('rLink').href = url;
                btn.innerHTML = "SUCCESS!";
            } else { alert("DEPLOY GAGAL!"); btn.disabled = false; btn.innerHTML = "DEPLOY NOW"; }
        } catch(err) { alert("ERROR!"); btn.disabled = false; btn.innerHTML = "DEPLOY NOW"; }
    };
    reader.readAsText(fInput.files[0]);
}

document.getElementById('jsFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('jsFileName').innerText = file.name;
        const reader = new FileReader();
        reader.onload = (ev) => { jsFileContent = ev.target.result; };
        reader.readAsText(file);
    }
});

function processJsCode() {
    if (!jsFileContent) return alert("PILIH FILE!");
    let code = jsFileContent;
    let isHtml = code.trim().startsWith("<") || document.getElementById('jsFileInput').files[0].name.endsWith('.html');
    
    if (isHtml) {
        let b64 = btoa(unescape(encodeURIComponent(code)));
        code = `document.write(atob("${b64}"));`;
    }

    let mode = document.querySelector('input[name="jsMode"]:checked').value;
    let opt = { compact: true, controlFlowFlattening: true, stringArray: true, stringArrayThreshold: 1 };

    if (mode === "invisible") { opt.stringArrayEncoding = ["base64"]; }
    else if (mode === "hard") { opt.stringArrayEncoding = ["rc4"]; }
    else if (mode === "ultra") {
        code = "/* Encrypted by Pinoo Hub */\n" + code;
        opt.stringArrayEncoding = ["base64", "rc4"];
        opt.splitStrings = true;
        opt.unicodeEscapeSequence = true;
    }

    try {
        let out = JavaScriptObfuscator.obfuscate(code, opt).getObfuscatedCode();
        if (isHtml) out = `<!doctype html>\n<script>${out}<\/script>`;
        globalJsResult = out;
        document.getElementById('jsOutput').value = out;
        document.getElementById('jsResultArea').style.display = "block";
    } catch (e) { alert("ERROR: " + e.message); }
}

function copyJs() { navigator.clipboard.writeText(globalJsResult); alert("COPIED!"); }
function downloadJs() {
    let b = new Blob([globalJsResult], {type: "text/plain"});
    let a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "pinoo_encrypted.js";
    a.click();
}
function clearJs() {
    document.getElementById('jsOutput').value = "";
    document.getElementById('jsResultArea').style.display = "none";
    document.getElementById('jsFileName').innerText = "PILIH JS/HTML";
    jsFileContent = "";
}
