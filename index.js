var DebuggerMain = new (class {
    constructor() {
        this.consoleLogging = true;
        this.types = ["log", "error", "warn"];
        this.types.forEach((n) => this[n] = (e, ...t) => this.debug(n, e, ...t));
        this.saveLog = [];
    }

    logParam(p) {
        switch (typeof p) {
            case "string":
                return p;
            case "boolean":
                return p ? "true" : "false";
            case "object":
                return JSON.stringify(p);
            default:
                return p.toString();
        }
    }

    debug(type, n, ...t) {
        if (this.consoleLogging) console[type]("[" + n + "] " + t[0], ...t.slice(1));
        this.saveLog.push({ time: new Date(), name: n, log: t });
    }
});
var Debug = class {
    constructor(name, parent) {
        var getname = (o) => typeof o == "object" ? o.constructor.name : o;
        this.name = getname(name);
        if (parent) this.name = getname(parent) + "." + this.name;
        DebuggerMain.types.forEach((n) => this[n] = (...t) => this.debug(n, ...t));
    }

    debug(type, ...t) {
        DebuggerMain[type](this.name, ...t);
    }
};
const BombTools = {
    LocalizationManager: class {
        constructor(locale) {
            this.locale = locale || "en";

            // commented out languages that are not in the main shipped build
            this.languageData = [
                { locale: "en", name: "English", code: "241", version: "1" },
                //{ locale: "ar", name: "Arabic", code: "850", version: "aaaaaa" },
                //{ locale: "zh-CN", name: "Chinese-Simplified", code: "931", version: "aaaaaa" },
                //{ locale: "zh-TW", name: "Chinese-Traditional", code: "917", version: "aaaaaa" },
                //{ locale: "cs", name: "Czech", code: "058" },
                { locale: "da", name: "Danish", code: "354", version: "1-da" },
                { locale: "nl", name: "Dutch", code: "474", version: "2-nl" },
                { locale: "eo", name: "Esperanto", code: "547", version: "1-eo" },
                { locale: "fi", name: "Finnish", code: "873", version: "1-fi" },
                { locale: "fr", name: "French", code: "750", version: "1-fr" },
                //{ locale: "de", name: "German", code: "558", version: "aaaaaa" },
                //{ locale: "he", name: "Hebrew", code: "614", version: "aaaaaa" },
                //{ locale: "hu", name: "Hungarian", code: "517", version: "aaaaaa" },
                { locale: "it", name: "Italian", code: "345", version: "1-it" },
                { locale: "ja", name: "Japanese", code: "122", version: "1-ja" },
                //{ locale: "ko", name: "Korean", code: "964" },
                { locale: "nb", name: "Norwegian", code: "477", version: "1-nb" },
                { locale: "pl", name: "Polish", code: "856", version: "2-pl" },
                { locale: "pt-BR", name: "Portuguese-Brazil", code: "622", version: "1-pt-BR" },
                //{ locale: "pt-PT", name: "Portuguese-Portugal", code: "806", version: "aaaaaa" },
                { locale: "ro", name: "Romanian", code: "626", version: "1-ro" },
                { locale: "ru", name: "Russian", code: "317", version: "1-ru" },
                { locale: "es", name: "Spanish", code: "925", version: "1-es" },
                //{ locale: "sv", name: "Swedish", code: "453", version: "aaaaaa" },
                //{ locale: "th", name: "Thai", code: "248", version: "aaaaaa" },
                { locale: "tr", name: "Turkish", code: "993", version: "1-tr" },
                //{ locale: "uk", name: "Ukrainian", code: "775", version: "aaaaaa" },
            ];
        }

        LoadGameTerms() {
            return new Promise((resolve) => {
                $.getJSON("data/Localization.json", (data) => {
                    this.GameTerms = data;
                    resolve();
                });
            });
        }

        GetLanguageData() {
            return this.languageData.find((l => l.locale == this.locale));
        }

        GetLanguageName() {
            return this.GetLanguageData().name;
        }

        GetVerificationCode() {
            return this.GetLanguageData().code;
        }

        GetManualVersion() {
            return this.GetLanguageData().version;
        }

        GetSheetName() {
            return (this.GetLanguageName() + this.locale).toLowerCase();
        }

        GetTerm(term) {
            if (!this.GameTerms) return "Loc_Error";
            var gtt = this.GameTerms.feed.entry.find((e) => e.title.$t == term);
            if (!gtt) return "Loc_Error";
            var keys = Object.keys(gtt).filter((k) => /^gsx\$/.test(k)).map((k) => k.replace(/^gsx\$/, ""));
            if (!keys.includes(this.GetSheetName())) return "Loc_Error";
            return gtt["gsx$" + this.GetSheetName()].$t;
        }
    },
    WidgetManager: class {
        constructor() {
            this.debug = new Debug(this);
            this.widgets = [];
        }

        addWidget(widget) {
            this.widgets.push(widget);
            this.debug.log("Added widget: %s", JSON.stringify(widget));
        }
    },
    WidgetGenerator: class {
        constructor() {
            this.debug = new Debug(this);
            this.manager = new BombTools.WidgetManager();
            this.serialLetters = "ABCDEFGHIJKLMNEPQRSTUVWXZ";
            this.serialVowels = "AEIOU";
            this.serialValidDigits = "0123456789";
            this.indicatorLabels = ["SND", "CLR", "CAR", "IND", "FRQ", "SIG", "NSA", "MSA", "TRN", "BOB", "FRK"];
            this.originalLabels = [].concat(this.indicatorLabels);
            //this.portTypes = ["DVI", "Parallel", "PS2", "RJ45", "Serial", "StereoRCA"];
            this.portGroups = [
                ["Parallel", "Serial"],
                ["DVI", "PS2", "RJ45", "StereoRCA"]
            ];
            this.batteryTypes = ["DoubleA", "DCell"];
            this.batteryCounts = [2, 1];
        }

        generateSerial() {
            this.serialPossibleCharArray = (this.serialLetters + this.serialValidDigits).split("");
            this.serialNumber = "";
            var getChar = (length) => this.serialPossibleCharArray[Math.floor(Math.random() * length)];
            for (var i = 0; i < 2; i++) this.serialNumber += getChar(this.serialPossibleCharArray.length);
            this.serialNumber += Math.floor(Math.random() * 10);
            for (var i = 0; i < 2; i++) this.serialNumber += getChar(this.serialPossibleCharArray.length - 10);
            this.serialNumber += Math.floor(Math.random() * 10);
            this.debug.log("Generated serial number %s", this.serialNumber);
            this.manager.addWidget({ type: "serial", number: this.serialNumber });
        }

        generateIndicator() {
            if (!this.indicatorLabels.length) {
                this.debug.warn("All indicator labels in use, using NLL");
                this.indicatorLabels = ["NLL"];
            }
            var index = Math.floor(Math.random() * this.indicatorLabels.length);
            var label = this.indicatorLabels[index];
            var localizedLabel = LocalizationManager.GetTerm("IndicatorWidget/LABEL" + (label == "NLL" ? 12 : (index + 1)));
            this.indicatorLabels.splice(index, 1);
            var lit = Math.random() > 0.4;
            this.debug.log("Generated %s %s indicator", lit ? "lit" : "unlit", label);
            this.manager.addWidget({ type: "indicator", label, localizedLabel, lit });
        }

        generatePortPlate() {
            var group = this.portGroups[Math.floor(Math.random() * this.portGroups.length)];
            var plate = group.filter(() => Math.random() > 0.5);
            this.debug.log("Generated port plate with port(s): %s", plate.length ? plate.join(", ") : "[none]");
            this.manager.addWidget({ type: "port", ports: plate });
        }

        generateBattery() {
            var index = Math.floor(Math.random() * this.batteryTypes.length);
            var type = this.batteryTypes[index];
            this.debug.log("Generated %s battery widget", type);
            this.manager.addWidget({ type: "battery", battery: type, count: this.batteryCounts[index] });
        }

        generateRandomWidget() {
            var optionalWidgets = ["indicator", "port", "battery"];
            var widgetType = optionalWidgets[Math.floor(Math.random() * optionalWidgets.length)];
            switch (widgetType) {
                case "indicator":
                    this.generateIndicator();
                    break;
                case "port":
                    this.generatePortPlate();
                    break;
                case "battery":
                    this.generateBattery();
                    break;
            }
        }
    },
    RepoManager: class {
        constructor() {
            this.debug = new Debug(this);
            this.repoProtocol = "https://";
            this.repoHostName = "ktane.timwi.de";
            this.repoPath = "/json/raw";
            this.repoURL = this.repoProtocol + this.repoHostName + this.repoPath;
        }

        loadData() {
            return new Promise((resolve, reject) => {
                this.debug.log("Fetching repository data from %s...", this.repoHostName);
                $.getJSON(this.repoURL)
                    .then((data) => {
                        var modules = data.KtaneModules;
                        if (!modules) return this.onLoadError(reject);
                        this.modules = modules;
                        this.debug.log("Successfully loaded %i repository entries (%i regular modules)", this.modules.length, this.modules.filter((m) => m.Type === "Regular").length);
                        resolve();
                    })
                    .catch(() => this.onLoadError(reject));
            });
        }

        onLoadError(r) {
            this.debug.error("Failed to load repository data");
            r();
        }
    },
    SFXManager: class {
        constructor(list, game) {
            this.debug = new Debug(this, game);
            this.list = list;
            this.debug.log("Loading %i file(s)...", this.list.length);
            this.audio = {};
            var numloaded = 0;
            this.list.forEach((n) => {
                var src = "audio/" + n[0] + ".wav";
                var aud = new Howl({
                    src: [src],
                    format: ["wav"],
                    volume: n[1],
                    loop: !!n[2],
                    autoplay: false,
                    onload: () => {
                        this.debug.log("Loaded %s", n[0]);
                        if (++numloaded == this.list.length) {
                            this.debug.log("All files loaded");
                            if (this.onloaded) this.onloaded(this.audio);
                        }
                    }
                });
                this.audio[n[0]] = aud;
            });
        }
    },
    BombManager: class {
        constructor(settings, repoData) {
            this.debug = new Debug(this);

            if (!settings) return this.debug.error("Failed to generate bomb: missing settings");

            if (!settings.hasOwnProperty("Mission")) settings.Mission = { Type: "Mission" };
            if (!settings.hasOwnProperty("Time")) settings.Time = 300;
            if (!settings.hasOwnProperty("NumStrikes")) settings.NumStrikes = 3;
            if (!settings.hasOwnProperty("FrontFaceOnly")) settings.FrontFaceOnly = false;
            if (!settings.hasOwnProperty("TimeBeforeNeedyActivation")) settings.TimeBeforeNeedyActivation = 90;
            if (!settings.hasOwnProperty("OptionalWidgetCount")) settings.OptionalWidgetCount = 5;
            if (!settings.hasOwnProperty("Pools")) return this.debug.error("Failed to generate bomb: settings missing Pools property");


            if (!settings.Pools.some((p) => p.Count)) return this.debug.error("Failed to generate bomb: no modules");
            if (!repoData) return this.debug.error("Failed to generate bomb: missing repository data");


            this.debug.log("Initializing bomb with settings: %s", JSON.stringify(settings));
            this.repoData = repoData;
            this.settings = settings;


            this.isFreePlay = this.settings.Mission.Type == "FreePlay";


            this.sizes = {
                module: { width: 220, height: 220 },
                padding: [20, 20, 20, 20],
                border: [2, 2, 2, 2],
                betweenModules: [20, 20]
            };
            /* this.casing = {
                front: [
                    [0, 0], [1, 0], [2, 0],
                    [0, 1], [1, 1], [2, 1]
                ],
                rear: [
                    [2, 0], [1, 0], [0, 0],
                    [2, 1], [1, 1], [0, 1]
                ]
            }; */
            this.casing = {
                front: [
                    [0, 0], [1, 0], [2, 0],
                    [0, 1], [1, 1], [2, 1]
                ],
                rear: [
                    [2, 0], [1, 0], [0, 0],
                    [2, 1], [1, 1], [0, 1]
                ]
            };
            /* for (var x = 0; x < 10; x++) {
                for (var y = 0; y < 10; y++) {
                    var o = [y, x];
                    this.casing.front.push(o);
                }
            } */
            this.wrapper = $("<div/>").addClass("bomb-wrapper").appendTo(document.body);
            this.faces = [];
            var maxFaceSize = { width: 0, height: 0 };
            Object.entries(this.casing).forEach((s) => {
                var wrap = $("<div/>").addClass("bomb-face bomb-face-" + s[0]).appendTo(this.wrapper);
                var moduleCount = s[1].length;
                var modulePositions = [];
                var wX = 0;
                var wY = 0;
                for (var i = 0; i < moduleCount; i++) {
                    var cm = s[1][i];
                    var pos = {
                        cm,
                        x: this.sizes.border[3] + this.sizes.border[1] + this.sizes.padding[3] + cm[0] * (this.sizes.module.width + this.sizes.betweenModules[0]),
                        y: this.sizes.border[0] + this.sizes.border[2] + this.sizes.padding[0] + cm[1] * (this.sizes.module.height + this.sizes.betweenModules[1])
                    };
                    wX = Math.max(wX, this.sizes.padding[3] + pos.x + this.sizes.module.width + this.sizes.padding[1] - this.sizes.border[1] - this.sizes.border[3]);
                    wY = Math.max(wY, this.sizes.padding[0] + pos.y + this.sizes.module.height + this.sizes.padding[2] - this.sizes.border[2] - this.sizes.border[0]);
                    modulePositions.push(pos);
                }
                wrap.css({ width: wX, height: wY });
                maxFaceSize.width = Math.max(maxFaceSize.width, wX);
                maxFaceSize.height = Math.max(maxFaceSize.height, wY);
                this.faces.push({
                    name: s[0],
                    wrapper: wrap,
                    moduleCount,
                    modulePositions,
                    usedSpawns: []
                });
                anime.set(wrap[0], { top: "50%", left: "50%", translateX: "-50%", translateY: "-50%" });
            });
            this.wrapper.css({ width: maxFaceSize.width, height: maxFaceSize.height });



            this.widgetArea = $("<div/>").addClass("widget-area").appendTo(document.body);
            var widgetGenerator = new BombTools.WidgetGenerator();
            widgetGenerator.generateSerial();
            for (var i = 0; i < this.settings.OptionalWidgetCount; i++) widgetGenerator.generateRandomWidget();
            this.widgetManager = widgetGenerator.manager;
            this.widgetManager.widgets.forEach((w) => new BombTools.WidgetRenderer(w, this.widgetArea));


            window.BombInfo = new BombTools.BombInfoHelper(this.widgetManager, this);
            var resizeWrapper = () => {

            };
            $(window).on("resize", () => resizeWrapper());


            this.currentStrikes = 0;


            this.moduleCounts = {};
            this.moduleCount = 0;
            this.modulesSolved = [];
            this.moduleSpawnPool = [];
            this.addModule({ special: "timer" }, 0);
            this.settings.Pools.forEach((p) => this.addModulesFromPool(p));
            this.spawnModulesFromSpawnPool();
            this.faces.forEach((f, i) => {
                var possibleSpawns = f.modulePositions.map((_, i) => i).filter((i) => !f.usedSpawns.includes(i));
                possibleSpawns.forEach(() => this.addModule({ special: "empty" }, i));
            });
            this.spawnModulesFromSpawnPool();
            var facesLog = this.faces.map((f) => {
                return {
                    name: f.name, moduleCount: f.moduleCount, modulePositions: f.modulePositions.map((p) => {
                        var m = p.hasOwnProperty("module") && p.module.special ? { special: true, type: p.module.type } : { special: false, id: p.hasOwnProperty("module") ? p.module.id : null };
                        return { column: p.cm[0], row: p.cm[1], module: m };
                    })
                };
            });
            this.debug.log("Bomb faces: %s", JSON.stringify(facesLog));


            this.viewingFace = 0;
            this.setViewingFace(null, true);
            /* setTimeout(() => {
                this.viewingFace = 1;
                this.setViewingFace(true);
                setTimeout(() => {
                    this.viewingFace = 0;
                    this.setViewingFace();
                }, 1200);
            }, 1200); */

            this.explosions = ["explosion concrete small", "explosion metal small", "explosion stones", "imphenzia-soundtrack-explosion-079-fast-blast-with-much-scattered-debris-and-some-rumble", "Long_63_Debris", "Long_64_Debris"];
            this.sfxmanager = new BombTools.SFXManager([
                ["doublebeep", 0.3],
                ["doublebeep_1.25", 0.3],
                ["singlebeep", 0.3],
                ["emergencyalarm", 0.3],
                ["Strike", 0.3],
                ["bomb_defused", 0.5],
                ["GameOver_Fanfare", 0.5],
                ...this.explosions.map((e) => [e, 1])
            ], this);
            this.sfx = this.sfxmanager.audio;
            this.musicmanager = new BombTools.MusicManager(this);
            this.musicmanager.loadTracks().then(() => {
                this.startTimerTimeout = setTimeout(() => this.startTimer(), 1000);
            });

            var doReplace = (n, v, e) => {
                //[i2p_Few]
                var term = LocalizationManager.GetTerm("BombBinder/txt" + n + "Count");
                //if (term.split("[i2p_Few]").length == 2)
                return;
            };

            var posterTime = BombTools.FormatMissionTime(this.settings.Time, true);
            var posterModules = LocalizationManager.GetTerm("BombBinder/txtModuleCount").split("[i2p_One]")[this.moduleCount == 1 ? 1 : 0].replace("{[MODULE_COUNT]}", this.moduleCount);
            var posterStrikes = LocalizationManager.GetTerm("BombBinder/txtStrikeCount").split("[i2p_One]")[this.settings.NumStrikes == 1 ? 1 : 0].replace("{[STRIKE_COUNT]}", this.settings.NumStrikes);
            this.background = new BombTools.GameRoomBackground(this.isFreePlay ? LocalizationManager.GetTerm("FreeplayDevice/label_freePlayCover") : (["en", "fr"].includes(LocalizationManager.locale) ? "Mission" : LocalizationManager.GetTerm("Missions/DefaultToCName")), this.isFreePlay ? [posterTime, posterModules, LocalizationManager.GetTerm(this.settings.Needy ? "BombBinder/results_NeedyOn" : "BombBinder/results_NeedyOff"), LocalizationManager.GetTerm(this.settings.NumStrikes == 1 ? "BombBinder/results_HardcoreOn" : "BombBinder/results_HardcoreOff")] : [this.settings.Mission.Name && this.settings.Mission.Name.trim() ? this.settings.Mission.Name.trim() : "Unknown", posterTime, posterModules, posterStrikes]);
        }

        setViewingFace(movedRight, instant) {
            this.faces.forEach((f, i) => {
                var isViewing = i === this.viewingFace;
                f.wrapper.css({ pointerEvents: isViewing ? "auto" : "none" });
                anime({
                    targets: f.wrapper[0],
                    left: isViewing ? "50%" : movedRight ? "-50%" : "150%",
                    easing: "easeOutQuart",
                    opacity: isViewing ? 1 : 0,
                    duration: instant ? 0 : 500
                });
            });
        }

        getModule(id) {
            var module = ModuleComponents.find((m) => m.id === id);
            if (!module) return this.debug.error("Failed to get module with id \"%s\"", id);
            var repoEntry = this.repoData.find((m) => m.ModuleID === id);
            if (!repoEntry) return this.debug.error("Failed to get repository entry with id \"%s\"", id);
            return Object.assign(repoEntry, module);
        }

        getSpecial(type, face) {
            switch (type) {
                case "timer":
                    this.timerFace = face;
                    return { special: true, type: "timer", time: this.settings.Time, strikes: this.settings.NumStrikes };
                case "empty":
                    return { special: true, type: "empty" };
                default:
                    return { special: true };
            }
        }

        addModule(mm, faceOverride) {
            if (!mm) return;
            this.moduleSpawnPool.push([mm, faceOverride]);
        }

        spawnModulesFromSpawnPool() {
            var sortFunc = (a) => {
                var mm = a[0];
                if (typeof mm == "object" && mm.hasOwnProperty("special")) return 2;
                var mo = this.getModule(mm);
                return mo.config && mo.config.RequiresTimerVisibility ? 1 : -1;
            };
            this.moduleSpawnPool.sort((a, b) => sortFunc(b) - sortFunc(a));
            this.moduleSpawnPool.forEach((m) => this.spawnModule(...m));
            this.moduleSpawnPool = [];
        }

        spawnModule(mm, faceOverride) {
            var isSpecial = typeof mm == "object" && mm.hasOwnProperty("special");
            var id = isSpecial ? mm.special : mm;
            var getPossibleModulePositions = (f) => this.faces[f].modulePositions.map((_, i) => i).filter((i) => !this.faces[f].usedSpawns.includes(i));
            var normalModule = isSpecial ? null : this.getModule(id);
            if (!isSpecial && !normalModule) return this.debug.error("Cannot add %s module: module not found", id);
            var face = faceOverride;
            if (face == null) {
                var frontFace = this.faces.findIndex((f) => f.name.toLowerCase().includes("front"));
                if (frontFace < 0) this.debug.warn("FrontFaceOnly is enabled but no face containing \"front\" was found, using random face");
                var frontFaceFull = false;
                if (frontFace >= 0 && this.settings.FrontFaceOnly) {
                    frontFaceFull = !getPossibleModulePositions(frontFace).length;
                    if (frontFaceFull) this.debug.warn("FrontFaceOnly is enabled but %s face has no remaining space, using random face", this.faces[frontFace].name);
                }
                var possibleFaces = this.faces.map((_, i) => i).filter((i) => getPossibleModulePositions(i).length);
                if (!possibleFaces.length) return this.debug.error("Failed to add %s module: all module spawns are in use", id);
                var randomFaceIndex = possibleFaces[Math.floor(Math.random() * possibleFaces.length)];
                var canUseTimer = false;
                if (!isSpecial) {
                    var timerFacePositions = getPossibleModulePositions(this.timerFace);
                    var shouldUseTimer = normalModule.config && normalModule.config.RequiresTimerVisibility;
                    canUseTimer = shouldUseTimer && !!timerFacePositions.length;
                    if (shouldUseTimer && !canUseTimer && !frontFaceFull) this.debug.warn("Module %s requires timer visibility but timer face (%s) has no remaining space, using random face", id, this.faces[this.timerFace].name);
                }
                var randomFaceIndexIncludingTimer = canUseTimer ? this.timerFace : randomFaceIndex;
                face = this.settings.FrontFaceOnly ? frontFace < 0 || frontFaceFull ? randomFaceIndexIncludingTimer : frontFace : randomFaceIndexIncludingTimer;
            }
            var spawns = getPossibleModulePositions(face);
            var spawn = spawns[Math.floor(Math.random() * spawns.length)];
            this.faces[face].usedSpawns.push(spawn);
            if (!isSpecial) {
                this.moduleCount++;
                if (!this.moduleCounts[id]) this.moduleCounts[id] = 0;
                normalModule.index = this.moduleCounts[id]++;
            }
            var module = isSpecial ? this.getSpecial(mm.special, face) : normalModule;
            this.faces[face].modulePositions[spawn].module = module;
            this.debug.log("Instantiating %s on %s face at spawn index %i", isSpecial ? id : module.Name + " [" + id + "]", this.faces[face].name, spawn);
            var r = new BombTools.ModuleRenderer(module, this.faces[face].wrapper, this.sizes.module, this.faces[face].modulePositions[spawn], (c) => this.moduleCommand(r, c));
            if (isSpecial && id === "timer") this.timerRenderer = r;
        }

        moduleCommand(rend, comm) {
            switch (comm) {
                case "HandlePass":
                case "HandleStrike":
                    clearTimeout(rend.strikestatuslighttimeout);
                    var isStrike = "HandleStrike" === comm;
                    if (rend.modulesvg && rend.modulesvg.find("[data-statuslight]").length) {
                        var light = rend.modulesvg.find("[data-statuslight]");
                        light.css({ fill: isStrike ? "#f33" : "#3f3" });
                        if (isStrike) {
                            rend.strikestatuslighttimeout = setTimeout(() => light.css({ fill: this.modulesSolved.includes(rend.uniqueID) ? "#3f3" : "none" }), 500);
                        }
                    }
                    if (isStrike) this.doStrike({ module: true, id: rend.data.id, name: rend.data.Name });
                    else {
                        this.debug.log("Module solved: %s", JSON.stringify(Object.assign(rend.data, { time: new Date().getTime(), bombtime: this.getCurrentTime() })));
                        if (!this.modulesSolved.includes(rend.uniqueID)) {
                            this.modulesSolved.push(rend.uniqueID);
                            if (this.modulesSolved.length >= this.moduleCount) {
                                this.bombSolved();
                            }
                        }
                    }
                    break;
            }
        }

        doStrike(reason) {
            this.sfx.Strike.play();
            this.currentStrikes++;
            reason.time = new Date().getTime();
            reason.bombtime = this.getCurrentTime();
            reason.strikes = this.currentStrikes;
            this.debug.log("Bomb strike! %s", JSON.stringify(reason));
            this.timerRenderer.setStrikes(this.currentStrikes);
            if (this.currentStrikes <= 4) this.timeLastStriked = new Date().getTime();
            this.timerSpeedStage = Math.min(this.currentStrikes, 4);
            if (this.currentStrikes >= this.settings.NumStrikes) return this.exploded(reason);
        }

        get timerSpeed() {
            return 1 + (this.timerSpeedStage || 0) * 0.25;
        }

        addModulesFromPool(pool) {
            var mix = [pool.ComponentTypes];
            var a = [];
            mix.forEach((m) => a = a.concat(m));
            for (var i = 0; i < pool.Count; i++) {
                var mi = Math.floor(Math.random() * a.length);
                var m = a[mi];
                this.addModule(m);
            }
        }

        startTimer() {
            //this.timerStarted = new Date().getTime();
            this.timerTime = this.settings.Time;
            var frame = (step) => {
                if (step != null) {
                    if (this.timerStarted == null) this.timerStarted = step;
                    this.timeElapsedPerFrame = (step - this.timerStarted) / 1000;
                    this.timerStarted = step;
                    this.timerTime -= this.timeElapsedPerFrame * this.timerSpeed;
                    if (this.getCurrentTime() <= 0) return this.exploded({ timer: true });
                    this.timerRenderer.setTime(this.getCurrentTime(), this.sfx.emergencyalarm, this.background);
                    this.musicmanager.checkForStinger(this.getCurrentTime(), this.timerSpeed);
                    var timerSecond = Math.floor(this.getCurrentTime());
                    if (this.lastTimerSecond != null && this.lastTimerSecond != timerSecond) {
                        this.lastTimerSecond = timerSecond;
                        this.timerbeepsfx = this.sfx[["doublebeep", "doublebeep_1.25", "singlebeep", "singlebeep", "singlebeep"][this.timerSpeedStage || 0]];
                        this.timerbeepsfx.play();
                    } else if (this.lastTimerSecond == null) this.lastTimerSecond = timerSecond;
                }
                this.timerFrame = requestAnimationFrame((s) => frame(s));
            };
            frame();
        }

        stopTimer() {
            if (this.timerFrame) cancelAnimationFrame(this.timerFrame);
            this.timerEnded = new Date().getTime();
        }

        resetEnd() {
            window.BombInfo = null;
            this.stopTimer();
            this.musicmanager.endMusic();
            clearTimeout(this.startTimerTimeout);
            if (this.timerbeepsfx) this.timerbeepsfx.stop();
        }
        resetAll() {
            this.timerRenderer.stopEmergencyLight();
            this.background.wrapper.remove();
            this.wrapper.remove();
            this.widgetArea.remove();
            this.timerRenderer.cornertw.remove();
        }

        exploded(reason) {
            this.resetEnd();
            this.resetAll();
            this.explodedtime = this.getCurrentTime();
            this.debug.log("Bomb exploded! %s", JSON.stringify(reason));
            this.sfx.bomb_defused.stop();
            this.sfx.GameOver_Fanfare.stop();
            this.sfx.Strike.stop();
            this.sfx[this.explosions[Math.floor(Math.random() * this.explosions.length)]].play();
            BombTools.FadeToBlack(true, 0);
            setTimeout(() => {
                new BombTools.ResultsScreen(this, false);
            }, 3000);
        }

        bombSolved() {
            this.resetEnd();
            this.solvedtime = this.getCurrentTime();
            this.debug.log("Bomb solved! %s", JSON.stringify({
                time: new Date().getTime(),
                bombtime: this.solvedtime,
                strikes: this.currentStrikes
            }));

            this.timerRenderer.timert.hide();
            setTimeout(() => {
                this.timerRenderer.timert.show();
                setTimeout(() => {
                    this.timerRenderer.timert.hide();
                    setTimeout(() => {
                        this.timerRenderer.timert.show();
                    }, 500);
                }, 500);
            }, 500);

            this.sfx.bomb_defused.play();
            setTimeout(() => this.sfx.GameOver_Fanfare.play(), 1000);
            this.sfx.GameOver_Fanfare.on("end", () => {
                BombTools.FadeToBlack(true, 2000).then(() => {
                    this.resetAll();
                    new BombTools.ResultsScreen(this, true);
                });
            });
        }

        getCurrentTime() {
            return this.timerTime;
        }
    },
    ResultsScreen: class {
        constructor(gamemanager, win) {
            var sfl = [
                ["GameOver_Lose", 0.4, true],
                ["GameOver_Win", 0.4, true],
                ["Stamp", 1]
            ];
            for (var i = 0; i < 11; i++) sfl.push([BombTools.getKeySFXName(i), 0.7]);
            this.sfxmanager = new BombTools.SFXManager(sfl, this);
            this.sfxmanager.onloaded = (sfx) => {
                this.sfx = sfx;
                BombTools.FadeToBlack(false, 1000);
                this.gamemanager = gamemanager;
                this.win = win;
                this.music = this.sfx[this.win ? "GameOver_Win" : "GameOver_Lose"]
                this.music.play();
                this.music.fade(0, 0.4, 1000);
                setTimeout(() => {
                    this.sfx.Stamp.play();
                }, 2000);
            };
        }
    },
    getKeySFXName: (index) => {
        return "Key " + (index % 11 + 1).toString().padStart(2, "0");
    },
    MusicManager: class {
        constructor(BombManager, customPlaylists, mixCustomAndVanillaPlaylists) {
            this.debug = new Debug(this);
            this.BombManager = BombManager;
            var vanillaPlaylists = [
                this.createVanillaPlaylist("GameRoomA", 8),
                this.createVanillaPlaylist("GameRoomB", 6),
                this.createVanillaPlaylist("GameRoomC", 6),
                this.createVanillaPlaylist("GameRoomD", 8),
                this.createVanillaPlaylist("GameRoomE", 8),
                this.createVanillaPlaylist("GameRoomF", 7),
                this.createVanillaPlaylist("GameRoomG", 11)
            ];
            this.playlists = customPlaylists && customPlaylists.length ? mixCustomAndVanillaPlaylists ? vanillaPlaylists.concat(customPlaylists) : customPlaylists : vanillaPlaylists;
            this.playlist = this.playlists[Math.floor(Math.random() * this.playlists.length)];
            this.playlistLength = this.playlist.length;
            this.playFirstTrack = true;
            this.stingerIsPlayingOrHasPlayed = false;
        }

        createVanillaPlaylist(name, length) {
            var a = [];
            for (var i = 0; i < length; i++) a.push("audio/" + name + "_" + (i + 1) + ".wav");
            return a;
        }

        loadTracks() {
            this.loadedAudio = new Array(this.playlistLength).fill(false);
            this.stingerAudio = new Howl({
                src: "audio/Stinger.wav",
                format: ["wav"],
                volume: 1,
                autoplay: false
            });
            this.volume = 0.4;
            return new Promise((resolve, reject) => {
                this.loadedAudio.forEach((_, i) => {
                    var src = this.playlist[i];
                    var aud = new Howl({
                        src: [src],
                        format: ["wav"],
                        volume: this.volume,
                        autoplay: false,
                        onload: () => {
                            this.loadedAudio[i] = aud;
                            if (this.loadedAudio.every((a) => a)) {
                                if (this.cancelstart) return;
                                this.decideNextLoop();
                                resolve();
                            }
                        },
                        onend: () => this.decideNextLoop()
                    });
                });
            });
        }

        playTrack(num, fadeIn) {
            this.debug.log("Playing loop %i (%s)", num, this.playlist[num]);
            var aud = this.loadedAudio[num];
            aud.play();
            if (fadeIn) aud.fade(0, this.volume, 3000);
        }

        decideNextLoop() {
            if (this.playLastTrack) {
                this.playTrack(this.playlistLength - 1);
            } else if (this.playFirstTrack) {
                this.playFirstTrack = false;
                this.playTrack(0, true);
            } else {
                var timeRemaining = this.BombManager.getCurrentTime();
                var totalRoundTime = this.BombManager.settings.Time;
                this.playTrack(Math.max(0, Math.min(this.playlistLength - 2, Math.floor(this.playlistLength - timeRemaining / totalRoundTime * (this.playlistLength - 1)))));
            }
        }

        checkForStinger(bombtime, rate) {
            var stingerlength = 7;
            if (!this.stingerIsPlayingOrHasPlayed && bombtime <= 30 + stingerlength * rate) {
                this.stingerIsPlayingOrHasPlayed = true;
                this.stingerAudio.play();
                this.stingerTimeout = setTimeout(() => {
                    this.playLastTrack = true;
                    this.loadedAudio.forEach((a) => a.stop());
                    this.decideNextLoop();
                }, stingerlength * 1000);
            }
        }

        endMusic() {
            this.cancelstart = true;
            if (this.stingerAudio) this.stingerAudio.stop();
            clearTimeout(this.stingerTimeout);
            if (this.loadedAudio) this.loadedAudio.forEach((a) => {
                if (a) a.stop();
            });
        }
    },
    SVGGenerator: (url) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                dataType: "text"
            }).then((data) => {
                var e = $("<div/>").html(data).find("svg");
                e.removeAttr("id class");
                resolve(e);
            }).catch(reject);
        });
    },
    WidgetRenderer: class {
        constructor(data, append) {
            this.data = data;
            this.wrapper = $("<div/>").addClass("widget-wrapper widget-wrapper-" + this.data.type).appendTo(append);
            BombTools.SVGGenerator("images/widget/" + this.getWidgetSVGPath()).then((e) => {
                this.svg = e.addClass("widget-svg").appendTo(this.wrapper);
                this.runWidgetFunction();
            });
        }

        runWidgetFunction() {
            switch (this.data.type) {
                case "serial":
                    return this.serialWidget();
                case "indicator":
                    return this.indicatorWidget();
                case "port":
                    return this.portWidget();
                case "battery":
                    return this.batteryWidget();
            }
        }

        getWidgetSVGPath() {
            switch (this.data.type) {
                case "port":
                    return "portmain.svg";
                default:
                    return this.data.type + ".svg";
            }
        }

        serialWidget() {
            this.svg.find(".serial-number").html(this.data.number);
            this.svg.find(".serial-label").html(LocalizationManager.GetTerm("SerialNumber/label_serialHashmark"));
        }

        indicatorWidget() {
            this.svg.find(".indicator-label").html(this.data.localizedLabel || this.data.label);
            this.svg.find(".indicator-led").css({ fill: this.data.lit ? "#000000" : "#ffffff" });
        }

        portWidget() {
            this.svg.find("[data-port]").each((_, e) => {
                var u = $(e);
                var h = this.data.ports.some((t) => u.data("port") === t);
                if (!h) u.remove();
            });
        }

        batteryWidget() {
            this.svg.find("[data-battery]").each((_, e) => {
                var u = $(e);
                if (u.data("battery") != this.data.battery) u.remove();
            });
        }
    },
    ModuleRenderer: class {
        constructor(data, append, sizes, spawn, command) {
            this.sizes = sizes;
            this.data = data;
            this.spawn = spawn;
            this.wrapper = $("<div/>").addClass("bomb-module-wrapper").css({
                width: this.sizes.width,
                height: this.sizes.height,
                left: spawn.x,
                top: spawn.y
            }).appendTo(append);
            this.zIndexCount = 0;
            this.imagePath = this.data.special ? "images/widget/" : "images/modules/" + this.data.id + "/";

            var loggingNumber = this.data.index + 1;
            this.uniqueID = this.data.id + "#" + this.data.index;

            this.image(this.data.special ? this.getSpecialImage() : "module.svg").then((i) => {
                this.modulesvg = i;
                this.selectableArea = i.clone().empty().removeClass("bomb-module-image").addClass("bomb-module-selectable-area").appendTo(this.wrapper);
                var o = {};
                ["HandlePass", "HandleStrike", "GetRuleGenerationSeed"].forEach((n) => o[n] = () => command(n));
                var sel = this.getSelectables(i);
                if (!Object.keys(sel).length) this.selectableArea.remove();
                if (this.data.create) this.data.create(o, sel, (s) => i.find(s), new Debug(this.data.Name + " #" + loggingNumber));
                if (this.data.special) this.runSpecialFunction();
            });
        }

        getSelectables(svg) {
            var s = {};
            svg.find("[data-selectable]").each((_, e) => {
                var j = $(e);
                s[j.data("selectable")] = this.addSelectable(j);
            });
            return s;
        }

        addSelectable(e) {
            var o = { element: e };
            var d = e.clone()
                .appendTo(this.selectableArea)
                .addClass("bomb-module-selectable")
                .removeAttr("style");
            var anm = null;
            var mouseenter = () => {
                if (anm) mouseleave();
                anm = anime({
                    targets: d[0],
                    keyframes: [
                        { opacity: 1, duration: 0 },
                        { opacity: 0.8, duration: 700 },
                        { opacity: 1, duration: 0 },
                        { opacity: 0.9, duration: 300 }
                    ],
                    easing: "easeInOutQuart",
                    loop: true
                });
                anime.set(d[0], { opacity: 1 });
                if (o.hasOwnProperty("OnHighlight")) o.OnHighlight();
            };
            var mouseleave = () => {
                if (anm) anm.pause();
                anm = null;
                anime.set(d[0], { opacity: 0 });
                if (o.hasOwnProperty("OnHighlightEnded")) o.OnHighlightEnded();
            };
            var mousedown = () => {
                if (o.hasOwnProperty("OnInteract")) o.OnInteract();
            };
            var mouseup = () => {
                if (o.hasOwnProperty("OnInteractEnded")) o.OnInteractEnded();
            };
            anime.set(d[0], { opacity: 0 });
            d.on("mouseenter", mouseenter)
                .on("mouseleave", mouseleave)
                .on("mousedown", mousedown)
                .on("mouseup", mouseup)
                .on("touchstart", mouseenter)
                .on("touchend", mouseleave)
                .on("touchstart", mousedown)
                .on("touchend", mouseup);

            o.remove = () => {
                mouseup();
                mouseleave();
                d.remove();
            };

            return o;
        }

        text(string, x, y, size) {
            $("<div/>").addClass("bomb-module-text").css({
                left: x + "%",
                top: y + "%",
                fontSize: size,
                zIndex: this.zIndexCount + 2
            }).html(string).appendTo(this.wrapper);
            this.zIndexCount++;
        }

        image(name) {
            var c = this.zIndexCount++;
            return new Promise((resolve, reject) => {
                BombTools.SVGGenerator(this.imagePath + name).then((e) => {
                    var w = $("<div/>").addClass("bomb-module-image-wrapper").css({ zIndex: c + 2 }).appendTo(this.wrapper);
                    e.addClass("bomb-module-image").appendTo(w);
                    resolve(e);
                }).catch(reject);
            });
        }

        runSpecialFunction() {
            switch (this.data.type) {
                case "timer":
                    return this.specialTimer();
            }
        }

        getSpecialImage() {
            switch (this.data.type) {
                case "timer":
                    return "timer.svg";
                case "empty":
                    return "empty2.svg";
                default:
                    return this.data.type + ".svg";
            }
        }

        specialTimer() {
            if (this.data.strikes <= 1) {
                this.modulesvg.css({ top: "-100%" });
                this.setStrikes = () => { };
            } else {
                this.strike1 = $("<div/>").addClass("bomb-strike bomb-strike-1").appendTo(this.wrapper);
                this.strike2 = $("<div/>").addClass("bomb-strike bomb-strike-2").appendTo(this.wrapper);
                this.strikecounter = $("<div/>").addClass("bomb-strike-counter").appendTo(this.wrapper);
                this.strikebacking = $("<div/>").addClass("bomb-strike-counter-backing").html("8888").appendTo(this.wrapper);
                this.setStrikes = (count) => {
                    var set = (s, o) => {
                        this.strikecounter.hide();
                        this.strikebacking.hide();
                        this.strike1.show();
                        this.strike2.show();
                        if (o) {
                            s.addClass("bomb-strike-striked");
                            if (count == this.data.strikes - 1) s.addClass("bomb-strike-striked-double");
                        } else s.removeClass("bomb-strike-striked bomb-strike-striked-double");
                    };
                    switch (count) {
                        case 0:
                            set(this.strike1, false);
                            set(this.strike2, false);
                            break;
                        case 1:
                            set(this.strike1, true);
                            set(this.strike2, false);
                            break;
                        case 2:
                            set(this.strike1, true);
                            set(this.strike2, true);
                            break;
                        default:
                            this.strike1.hide();
                            this.strike2.hide();
                            this.strikecounter.show().html(count);
                            this.strikebacking.show();
                            this.strikecounter[(count == this.data.strikes - 1) ? "addClass" : "removeClass"]("bomb-strike-counter-double");
                            break;
                    }
                };
                this.setStrikes(0);
            }
            var timertw = $("<div/>").addClass("bomb-timer-time-wrapper").appendTo(this.wrapper);
            this.cornertw = $("<div/>").addClass("corner-timer-time-wrapper").append($("<div/>").addClass("corner-timer-backdrop")).appendTo(document.body);
            this.timert = $("<div/>").addClass("bomb-timer-time").appendTo(timertw);
            this.cornert = this.timert.clone().appendTo(this.cornertw);
            var backing = $("<div/>").addClass("bomb-timer-time-backing").text("88:88").appendTo(timertw);
            var backing2 = backing.clone().appendTo(this.cornertw);
            var alarmOn = false;
            var emgnc = null;
            var emgsf = null;
            var backg = null;
            this.setTime = (t, emergencySFX, background) => {
                if (emergencySFX && !emgsf) emgsf = emergencySFX;
                if (background && !backg) backg = background;
                var debugTimer = false;
                var s = debugTimer ? Math.floor(t).toString() : BombTools.FormatBombTime(t);
                if (debugTimer) {
                    var backingtext = "8".repeat(s.length);
                    backing.text(backingtext);
                    backing2.text(backingtext);
                }
                this.timert.text(s);
                this.cornert.text(s);
                if (t <= 60 && !alarmOn) {
                    alarmOn = true;
                    var loop = () => {
                        emgnc = setTimeout(() => {
                            if (backg) backg.setRedLight(true);
                            if (emgsf) emgsf.play();
                            emgnc = setTimeout(() => {
                                if (backg) backg.setRedLight(false);
                                loop();
                            }, 1250);
                        }, 1000);
                    };
                    loop();
                }
            };
            this.setTime(this.data.time);
            this.stopEmergencyLight = () => {
                clearTimeout(emgnc);
                if (emgsf) emgsf.stop();
                if (backg) backg.setRedLight(false);
            };
        }
    },
    FormatBombTime: (t) => {
        if (t == null || isNaN(t) || t < 0) t = 0;
        var pad = (n) => n.toString().padStart(2, "0");
        if (t < 60) {
            var s = Math.floor(t);
            var ns = Math.floor(t * 100 % 100);
            return pad(s) + "." + pad(ns);
        }
        var m = Math.floor(t / 60);
        var rs = Math.floor(t % 60);
        return pad(m) + ":" + pad(rs);
    },
    FormatMissionTime: (t) => {
        if (t == null || isNaN(t) || t < 0) t = 0;
        var m = Math.floor(t / 60);
        var rs = Math.floor(t % 60).toString().padStart(2, "0");
        return m + ":" + rs;
    },
    FadeToBlack: (fade, duration, showtext, dontremove) => {
        if (BombTools.fadeToBlackCover && !dontremove) BombTools.fadeToBlackCover.remove();
        if (BombTools.fadeToBlackCoverAnim) BombTools.fadeToBlackCoverAnim.pause();
        BombTools.fadeToBlackCover = $("<div/>").addClass("fade-to-black-cover").appendTo(document.body);
        if (showtext) BombTools.fadeToBlackCover.append($("<div/>").addClass("fade-to-black-cover-text").html(LocalizationManager.GetTerm("LoadingScreen/label_defuserwarning_youreyesonly").split("\n\n").map((x) => "<span>" + x.replace(/\n/g, "<br/>") + "</span>")));
        if (fade) {
            return new Promise((resolve) => {
                BombTools.fadeToBlackCoverAnim = anime({
                    targets: BombTools.fadeToBlackCover[0],
                    opacity: [0, 1],
                    duration,
                    easing: "linear",
                    complete: () => resolve()
                });
            });
        } else {
            return new Promise((resolve) => {
                BombTools.fadeToBlackCoverAnim = anime({
                    targets: BombTools.fadeToBlackCover[0],
                    opacity: [1, 0],
                    duration,
                    easing: "linear",
                    complete: () => {
                        BombTools.fadeToBlackCover.remove();
                        resolve();
                    }
                });
            });
        }
    },
    BombInfoHelper: class {
        constructor(widgetManager, bombGenerator) {
            this.wm = widgetManager;
            this.bg = bombGenerator;
        }

        getWidgetsOfType(t) {
            return this.wm.widgets.filter((w) => w.type === t);
        }

        IsIndicatorPresent(indicatorLabel) {
            return this.wm.widgets.some((w) => w.type === "indicator" && w.label === indicatorLabel);
        }

        IsIndicatorOn(indicatorLabel) {
            return this.wm.widgets.some((w) => w.type === "indicator" && w.label === indicatorLabel && w.lit);
        }

        IsIndicatorOff(indicatorLabel) {
            return this.wm.widgets.some((w) => w.type === "indicator" && w.label === indicatorLabel && !w.lit);
        }

        GetIndicators() {
            return this.getWidgetsOfType("indicator").map((w) => w.label);
        }

        GetOnIndicators() {
            return this.getWidgetsOfType("indicator").filter((w) => w.lit).map((w) => w.label);
        }

        GetOffIndicators() {
            return this.getWidgetsOfType("indicator").filter((w) => !w.lit).map((w) => w.label);
        }

        GetBatteryCount(type) {
            return this.getWidgetsOfType("battery").filter((w) => type == null ? true : (w.battery === type)).map((w) => w.count).reduce((a, b) => a + b, 0);
        }

        GetBatteryHolderCount(type) {
            return this.getWidgetsOfType("battery").filter((w) => type == null ? true : (w.battery === type)).length;
        }

        GetPortCount(type) {
            return this.GetPorts().filter((w) => type == null ? true : (w === type)).length;
        }

        GetPortPlateCount() {
            return this.getWidgetsOfType("port").length;
        }

        GetPorts() {
            return [].concat.apply([], this.getWidgetsOfType("port").map((w) => w.ports));
        }

        GetPortPlates() {
            return this.getWidgetsOfType("port").map((w) => w.ports);
        }

        IsPortPresent(type) {
            return this.GetPorts().includes(type);
        }

        onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        CountUniquePorts() {
            return this.GetPorts().filter(this.onlyUnique).length;
        }

        IsDuplicatePortPresent(type) {
            if (type != null) return this.GetPortCount(type) > 1;
            return this.GetPorts().length != this.CountUniquePorts();
        }

        CountDuplicatePorts() {
            return this.GetPorts().filter(this.onlyUnique).filter((p) => this.IsDuplicatePortPresent(p)).length;
        }

        GetSerialNumber() {
            return this.getWidgetsOfType("serial")[0].number;
        }

        GetSerialNumberLetters() {
            return this.GetSerialNumber().split("").filter((c) => /[A-Z]/.test(c));
        }

        GetSerialNumberNumbers() {
            return this.GetSerialNumber().split("").filter((c) => /[0-9]/.test(c));
        }

        IsBombPresent() {
            return true;
        }

        GetTime() {
            return this.bg.getCurrentTime();
        }

        GetStrikes() {
            return this.bg.currentStrikes;
        }

        GetFormattedTime() {
            return BombTools.FormatBombTime(this.GetTime());
        }
    },
    GameRoomBackground: class {
        constructor(header, tabledata, walltext) {
            this.wrapper = $("<div/>").addClass("gameroom-background").appendTo(document.body);
            this.images = {};
            ["0006", "0002", "0001"].forEach((n, ind) => {
                var i = $("<img/>").addClass("background-image gr-background-image").attr({
                    src: "images/renders/" + n + ".png"
                }).css({
                    zIndex: ind + 2
                }).on("load", () => this.resize()).appendTo(this.wrapper);
                this.images[n] = i;
            });

            /* var cc = [];
            this.wrapper.on("click", (e) => {
                var rect = this.wrapper.offset();
                var x = Math.round(e.pageX - rect.left);
                var y = Math.round(e.pageY - rect.top);
                cc.push(x, y);
                console.log(JSON.stringify(cc));
            }); */

            var posterCorners = [1477, 310, 1736, 246, 1448, 725, 1671, 856];
            var alarmClockTimeCorners = [506.4, 871, 553, 853, 508, 890, 554, 872];
            var alarmClockLabelCorners = [495, 847, 563, 822, 504, 853, 573, 827];

            this.poster = $("<div/>").addClass("poster-wrapper").appendTo(this.wrapper);
            this.transform2d(this.poster[0], ...posterCorners);

            this.postertext1 = $("<div/>").addClass("poster-header").html(header).appendTo(this.poster);
            this.postertable = $("<table/>").addClass("poster-table").appendTo(this.poster);
            tabledata.forEach((row) => {
                var r = $("<tr/>").appendTo(this.postertable);
                $("<td/>").html(row).appendTo(r);
            });

            $("<div/>").addClass("poster-manualversion").html(LocalizationManager.GetTerm("ControlsPoster/manualversionurl").replace(/\n/g, "<br/>").replace("{[MANUAL_VERSION]}", LocalizationManager.GetManualVersion()).replace("{[MANUAL_URL]}", LocalizationManager.GetTerm("General/bombManualURL"))).appendTo(this.poster);

            this.alarmClockTime = $("<div/>").addClass("alarm-clock-time").html("88:88").appendTo(this.wrapper);
            this.transform2d(this.alarmClockTime[0], ...alarmClockTimeCorners);

            this.alarmClockLabel = $("<div/>").addClass("alarm-clock-label").html(LocalizationManager.GetTerm("AlarmClock/button_snooze")).appendTo(this.wrapper);
            this.transform2d(this.alarmClockLabel[0], ...alarmClockLabelCorners);

            //this.walltext = $("<div/>").addClass("poster-walltext").html(walltext).appendTo(this.poster);


            $(window).on("resize", () => this.resize());
            this.setRedLight(false);
            this.setLightsOn(true);
            this.setAlarmClockTime();
            setInterval(() => this.setAlarmClockTime(), 1000);
        }

        resize() {
            //return;
            this.wrapperScale = Math.max(window.innerWidth / this.wrapper.outerWidth(), window.innerHeight / this.wrapper.outerHeight());
            this.wrapper.css({
                transform: "translate(-50%, -50%) scale(" + this.wrapperScale + ")"
            });
        }

        setLightsOn(on) {
            this.images["0001"].css({ opacity: on ? 0 : 1 });
        }

        setRedLight(on) {
            this.images["0002"].css({ opacity: on ? 0 : 1 });
            //this.walltext.css({ color: on ? "#f99" : "#aaa" });
        }

        setAlarmClockTime() {
            var d = new Date();
            var h = d.getHours();
            var m = d.getMinutes();
            var p = (t) => t.toString().padStart(2, "0");
            var s = p(h) + ":" + p(m);
            this.alarmClockTime.html(s);
        }


        /* the below code (and comments) was written by MvG on the Math StackExchange */
        /* https://math.stackexchange.com/questions/296794/finding-the-transform-matrix-from-4-projected-points-with-javascript/339033#339033 */

        adj(m) { // Compute the adjugate of m
            return [
                m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
                m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
                m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]
            ];
        }
        multmm(a, b) { // multiply two matrices
            var c = Array(9);
            for (var i = 0; i != 3; ++i) {
                for (var j = 0; j != 3; ++j) {
                    var cij = 0;
                    for (var k = 0; k != 3; ++k) {
                        cij += a[3 * i + k] * b[3 * k + j];
                    }
                    c[3 * i + j] = cij;
                }
            }
            return c;
        }
        multmv(m, v) { // multiply matrix and vector
            return [
                m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
                m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
                m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
            ];
        }
        pdbg(m, v) {
            var r = this.multmv(m, v);
            return r + " (" + r[0] / r[2] + ", " + r[1] / r[2] + ")";
        }
        basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
            var m = [
                x1, x2, x3,
                y1, y2, y3,
                1, 1, 1
            ];
            var v = this.multmv(this.adj(m), [x4, y4, 1]);
            return this.multmm(m, [
                v[0], 0, 0,
                0, v[1], 0,
                0, 0, v[2]
            ]);
        }
        general2DProjection(
            x1s, y1s, x1d, y1d,
            x2s, y2s, x2d, y2d,
            x3s, y3s, x3d, y3d,
            x4s, y4s, x4d, y4d
        ) {
            var s = this.basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
            var d = this.basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
            return this.multmm(d, this.adj(s));
        }
        project(m, x, y) {
            var v = this.multmv(m, [x, y, 1]);
            return [v[0] / v[2], v[1] / v[2]];
        }
        transform2d(elt, x1, y1, x2, y2, x3, y3, x4, y4) {
            var w = elt.offsetWidth, h = elt.offsetHeight;
            var t = this.general2DProjection
                (0, 0, x1, y1, w, 0, x2, y2, 0, h, x3, y3, w, h, x4, y4);
            for (var i = 0; i != 9; ++i) t[i] = t[i] / t[8];
            t = [t[0], t[3], 0, t[6],
            t[1], t[4], 0, t[7],
                0, 0, 1, 0,
            t[2], t[5], 0, t[8]];
            t = "matrix3d(" + t.join(", ") + ")";
            elt.style["-webkit-transform"] = t;
            elt.style["-moz-transform"] = t;
            elt.style["-o-transform"] = t;
            elt.style.transform = t;
        }
    }
};
window.LocalizationManager = new BombTools.LocalizationManager("pl");
window.LocalizationManager.LoadGameTerms().then(() => {
    /* BombTools.FadeToBlack(true, 1000).then(() => {
        var c = BombTools.fadeToBlackCover;
        BombTools.FadeToBlack(true, 1000, true, true).then(() => {
            BombTools.FadeToBlack(false, 1000, true).then(() => {
                c.remove();
                BombTools.FadeToBlack(false, 1000);
            });
        });
    }); */
    /* var repo = new BombTools.RepoManager();
    repo.loadData().then(() => {
        new BombTools.BombManager({
            Mission: { Type: "FreePlay" },
            Time: 180,
            NumStrikes: 200,
            FrontFaceOnly: true,
            OptionalWidgetCount: 5,
            Pools: [
                { Count: 1, ComponentTypes: ["Keypad"] },
                { Count: 1, ComponentTypes: ["BigButton"] },
                { Count: 1, ComponentTypes: ["WhosOnFirst"] }
            ]
        }, repo.modules);
    }); */
    var bg = new BombTools.GameRoomBackground("Mission", [
        "Something Old, Something New",
        "5:00",
        "3 Modules",
        "3 Strikes"
    ], "Something Old, Something New");
});
/* BombTools.FadeToBlack(true, 1000).then(() => {
    var c = BombTools.fadeToBlackCover;
    BombTools.FadeToBlack(true, 1000, true, true).then(() => {
        BombTools.FadeToBlack(false, 1000, true).then(() => {
            c.remove();
            BombTools.FadeToBlack(false, 1000);
        });
    });
}); */
/* var bg = new BombTools.GameRoomBackground("Mission", [
    "Something Old, Something New",
    "5:00",
    "3 Modules",
    "3 Strikes"
], "Something Old, Something New"); */
/* var repo = new BombTools.RepoManager();
repo.loadData().then(() => {
    new BombTools.BombManager({
        Mission: { Type: "FreePlay" },
        Time: 180,
        NumStrikes: 200,
        FrontFaceOnly: true,
        OptionalWidgetCount: 5,
        Pools: [
            { Count: 1, ComponentTypes: ["SimpleButton"] },
            { Count: 1, ComponentTypes: ["Keypad"] }
        ]
    }, repo.modules);
}); */