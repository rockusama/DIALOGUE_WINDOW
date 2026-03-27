function createVNDialogue(name, text, speed, nameColor, textColor, bgColor, font, fontSize) {
    try {
        var proj = app.project;
        if (!proj) return "Проект не открыт";

        app.beginUndoGroup("VN Dialogue");

        var compName = "dial." + name;
        var compWidth = 1920;
        var compHeight = 1080;
        var compDuration = text.length / speed + 2;
        var comp = proj.items.addComp(compName, compWidth, compHeight, 1, compDuration, 30);

        var startTime = 0;

        // === Фон ===
        var bg = comp.layers.addSolid([bgColor[0], bgColor[1], bgColor[2]], "Dialogue BG", compWidth, 220, 1);
        bg.property("Transform").position.setValue([compWidth/2, compHeight - 110]);
        bg.opacity.setValue(70);
        bg.inPoint = startTime;
        bg.outPoint = compDuration;

        var ctrl = comp.layers.addNull();
        ctrl.name = "VN CTRL";
        var speedCtrl = ctrl.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        speedCtrl.name = "Speed";
        speedCtrl.property(1).setValue(speed);
        ctrl.inPoint = startTime;
        ctrl.outPoint = compDuration;

        var nameLayer = comp.layers.addText(name);
        nameLayer.name = "Name";
        nameLayer.property("Transform").position.setValue([300, compHeight - 180]);
        var nameProp = nameLayer.property("Source Text");
        var nameTD = nameProp.value;
        nameTD.fillColor = nameColor;
        nameTD.font = font;
        nameTD.fontSize = fontSize;
        nameProp.setValue(nameTD);
        nameLayer.inPoint = startTime;
        nameLayer.outPoint = compDuration;

        var textLayer = comp.layers.addText(text);
        textLayer.name = "Dialogue";
        textLayer.property("Transform").position.setValue([300, compHeight - 130]);
        var textProp = textLayer.property("Source Text");
        var td = textProp.value;
        td.fillColor = textColor;
        td.font = font;
        td.fontSize = fontSize;
        textProp.setValue(td);
        textLayer.inPoint = startTime;
        textLayer.outPoint = compDuration;

        textLayer.property("Source Text").expression =
            "txt = value.toString();\n" +
            "spd = thisComp.layer('VN CTRL').effect('Speed')('Slider');\n" +
            "chars = Math.floor((time - inPoint)*spd);\n" +
            "chars = Math.min(chars, txt.length);\n" +
            "txt.substr(0,chars);";

        var blipItem = null;
        for (var i = 1; i <= proj.numItems; i++) {
            var it = proj.item(i);
            if (it instanceof FootageItem && it.name.toLowerCase().indexOf("blip") !== -1) {
                blipItem = it;
                break;
            }
        }

        if (blipItem) {
            for (var i = 0; i < text.length; i++) {
                var ch = text[i];
                if (ch === " " || ch === "\n") continue;
                var t = startTime + (i / speed);
                var layer = comp.layers.add(blipItem);
                layer.startTime = t;
                layer.audioEnabled = true;
            }
        }

        var portrait = null;
        for (var i = 1; i <= proj.numItems; i++) {
            var it = proj.item(i);
            if (it instanceof FootageItem) {
                var n = it.name.toLowerCase();
                if (n.indexOf(name.toLowerCase()) !== -1 || n.indexOf("portrait") !== -1) {
                    portrait = it;
                    break;
                }
            }
        }

        if (portrait) {
            var img = comp.layers.add(portrait);
            img.name = "Portrait";
            img.property("Transform").position.setValue([150, compHeight - 130]);
            img.property("Transform").scale.setValue([30,30]);
            img.inPoint = startTime;
            img.outPoint = compDuration;
        }

        var mainComp = proj.activeItem;
        if (mainComp && mainComp instanceof CompItem) {
            var nestedLayer = mainComp.layers.add(comp);
            nestedLayer.inPoint = mainComp.time;
            nestedLayer.outPoint = mainComp.time + compDuration;
        }

        app.endUndoGroup();
        return "OK";

    } catch(err) {
        alert("Ошибка:\n" + err.toString());
    }
}