function createDialogueAE(name, text, speed, nameColor, textColor, bgColor, font, fontSize) {
    try {
        var proj = app.project;
        var comp = proj.activeItem;
        if (!comp || !(comp instanceof CompItem)) return "Выдели композицию!";

        if (!app.DIALOGUE_COLLECTION) app.DIALOGUE_COLLECTION = [];

        app.beginUndoGroup("VN Dialogue");

        var startTime = comp.time;
        var textDuration = text.length / speed + 2;

        // === Фон диалога ===
        var bg = comp.layers.addSolid([bgColor[0], bgColor[1], bgColor[2]], "Dialogue BG", comp.width, 220, 1);
        bg.property("Transform").position.setValue([comp.width/2, comp.height - 110]);
        bg.opacity.setValue(70);
        bg.inPoint = startTime;
        bg.outPoint = startTime + textDuration;

        // === Контроллер скорости ===
        var ctrl = comp.layers.addNull();
        ctrl.name = "VN CTRL";
        var speedCtrl = ctrl.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
        speedCtrl.name = "Speed";
        speedCtrl.property(1).setValue(speed);
        ctrl.inPoint = startTime;
        ctrl.outPoint = startTime + textDuration;

        // === Имя персонажа ===
        var nameLayer = comp.layers.addText(name);
        nameLayer.name = "Name";
        nameLayer.property("Transform").position.setValue([300, comp.height - 180]);
        var nameProp = nameLayer.property("Source Text");
        var nameTD = nameProp.value;
        nameTD.fillColor = nameColor;
        nameTD.font = font;
        nameTD.fontSize = fontSize;
        nameProp.setValue(nameTD);
        nameLayer.inPoint = startTime;
        nameLayer.outPoint = startTime + textDuration;

        // === Диалоговый текст ===
        var textLayer = comp.layers.addText(text);
        textLayer.name = "Dialogue";
        textLayer.property("Transform").position.setValue([300, comp.height - 130]);
        var textProp = textLayer.property("Source Text");
        var td = textProp.value;
        td.fillColor = textColor;
        td.font = font;
        td.fontSize = fontSize;
        textProp.setValue(td);
        textLayer.inPoint = startTime;
        textLayer.outPoint = startTime + textDuration;

        // === Typewriter expression ===
        textLayer.property("Source Text").expression =
            "txt = value.toString();\n" +
            "spd = thisComp.layer('VN CTRL').effect('Speed')('Slider');\n" +
            "chars = Math.floor((time - inPoint)*spd);\n" +
            "chars = Math.min(chars, txt.length);\n" +
            "txt.substr(0,chars);";

        // === Найти blip.wav ===
        var blipItem = null;
        for (var i = 1; i <= proj.numItems; i++) {
            var it = proj.item(i);
            if (it instanceof FootageItem && it.name.toLowerCase().indexOf("blip") !== -1) {
                blipItem = it;
                break;
            }
        }

        // === Добавить blip с ускорением ===
        if (blipItem) {
            var blipLayer = comp.layers.add(blipItem);
            blipLayer.name = "Blip";
            blipLayer.audioEnabled = true;
            blipLayer.inPoint = startTime;
            blipLayer.outPoint = startTime + textDuration;

            var audio = blipLayer.property("Audio").property("ADBE Audio Levels");
            audio.expression =
                "txt = thisComp.layer('Dialogue').text.sourceText.toString();\n" +
                "spd = thisComp.layer('VN CTRL').effect('Speed')('Slider');\n" +
                "t = time - inPoint;\n" +
                "chars = Math.floor(t*spd);\n" +
                "chars = Math.min(chars, txt.length-1);\n" +
                "if(chars < txt.length-1){\n" +
                "    nextCharTime = inPoint + (chars+1)/spd;\n" +
                "}else{\n" +
                "    nextCharTime = outPoint;\n" +
                "}\n" +
                "if(time >= inPoint + chars/spd && time < nextCharTime){\n" +
                "    [0,0];\n" +
                "}else{\n" +
                "    [-48,-48];\n" +
                "}";
        }

        // === Портрет персонажа ===
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
            img.property("Transform").position.setValue([150, comp.height - 130]);
            img.property("Transform").scale.setValue([30,30]);
            img.inPoint = startTime;
            img.outPoint = startTime + textDuration;
        }

        app.endUndoGroup();
        return "OK";

    } catch (err) {
        alert("Ошибка:\n" + err.toString());
    }
}