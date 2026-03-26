document.addEventListener("DOMContentLoaded", function () {
    var cs = new CSInterface();
    var btn = document.getElementById("createBtn");

    btn.addEventListener("click", function () {
        
        var name = document.getElementById("portraitName").value;
        var text = document.getElementById("dialogueText").value;
        var speed = document.getElementById("speed").value;
        var nameColor = document.getElementById("nameColor").value;
        var textColor = document.getElementById("textColor").value;
        var bgColor = document.getElementById("bgColor").value;
        var font = document.getElementById("fontFamily").value;
        var fontSize = document.getElementById("fontSize").value;
        var nc = hexToRgb(nameColor);
        var tc = hexToRgb(textColor);
        var bc = hexToRgb(bgColor);

        text = text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");

        var script =
        'createVNDialogue("' + name + '","' + text + '",' + speed + ',' +
        '[' + nc + '],' +
        '[' + tc + '],' +
        '[' + bc + '],' +
        '"' + font + '",' +
        fontSize +
        ')';
        cs.evalScript(script, function (res) {
            return true;
        });
    });
});

function hexToRgb(hex) {
    hex = hex.replace("#", "");
    return [
        parseInt(hex.substring(0,2),16)/255,
        parseInt(hex.substring(2,4),16)/255,
        parseInt(hex.substring(4,6),16)/255
    ];
}

