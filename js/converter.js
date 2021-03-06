'use strict';

    class Root {
        constructor(width, height, viewPortWidth, viewPortHeight) {
        this.width = width;
        this.height = height;
        this.viewPortWidth = viewPortWidth;
        this.viewPortHeight = viewPortHeight;
        }
    }

    class Path {
        constructor(d, fill, id){
            this.d = d;
            this.fill = fill;
            this.id = id;
        }
    }

    function readBlob() {

        var names = [];
        var root = new Root();

        var files = document.getElementById('files').files;
    
        if (!files.length) {
            alert('Please select a file!');
            return;
        }

        for (let j = 0; j < files.length; j++) {
            var name = files[j].name.split('.')[0] + ".xml";
            names.push(name);
        }

        for (var i = 0, file; file = files[i]; i++){

            var reader = new FileReader();

            reader.onloadend = function(evt) {
                if (evt.target.readyState == FileReader.DONE) {
                    var parser = new DOMParser();
                    var xmlDoc = parser.parseFromString(evt.target.result,"text/xml");

                    var svgElement = xmlDoc.getElementsByTagName("svg")[0];

                    var width = svgElement.getAttribute("width");
                    if(width != null)
                        root.width = width;

                    var height = svgElement.getAttribute("height");
                    if(height != null)
                        root.height = height;

                    var viewPort = svgElement.getAttribute("viewBox");
                    if(viewPort != null){
                        var viewPortList = viewPort.split(' ');
                        root.viewPortHeight = viewPortList.pop();
                        root.viewPortWidth = viewPortList.pop();
                    }

                    var paths = xmlDoc.getElementsByTagName("path");
                    var pathList = [];
                    for (var index = 0, path; path = paths[index]; index++) {
                        var d = path.getAttribute("d");
                        if(d != null){
                            var pathData = new Path();
                            pathData.d = d;

                            var fill = path.getAttribute("fill");
                            if(fill != null && fill[0] == '#')
                                pathData.fill = fill;

                            var id = path.getAttribute("id");
                            if(id != null)
                                pathData.id = id;

                            pathList.push(pathData);
                        };
                    }

                    var additionals = xmlDoc.getElementsByTagName("g");
                    for (var index = 0, g; g = additionals[index]; index++) {
                        var fill = g.getAttribute("fill");
                        if(fill != null && fill[0] == '#'){
                            var id = g.getAttribute("id");
                            if(id != null){
                                pathList.forEach(path => {
                                    if(id.includes(path.id))
                                        path.fill = fill; 
                                });
                            }
                        }
                    }

                    var xmlString = "<?xml version='1.0' encoding='utf-8'?> <vector></vector>";
                    var parser = new DOMParser();
                    var xmlDoc = parser.parseFromString(xmlString, "text/xml");
                    var vector = xmlDoc.getElementsByTagName("vector");
                    vector[0].setAttribute("xmlns:android", "http://schemas.android.com/apk/res/android");
                    vector[0].setAttribute("android:height", root.height);
                    vector[0].setAttribute("android:width", root.width);
                    vector[0].setAttribute("android:viewportWidth", root.viewPortWidth);
                    vector[0].setAttribute("android:viewportHeight", root.viewPortHeight);

                    pathList.forEach(path => {
                        var node = xmlDoc.createElement("path");
                        if(path.fill != null){
                            node.setAttribute("android:fillColor", path.fill);
                        }
                        else{
                            node.setAttribute("android:fillColor", "#000");
                        }

                        node.setAttribute("android:pathData", path.d);
                        vector[0].appendChild(node);
                    });

                    var s = new XMLSerializer();
                    var xmlString = s.serializeToString(xmlDoc);
                    
                    //split text by '>' for add after new line
                    var xmlList = xmlString.split('>');
                    var parsedXml = "";

                    for (let index = 0; index < xmlList.length - 1; index++) {
                        parsedXml += xmlList[index] + '>\n';
                    }

                    var fileBlob = new Blob([parsedXml], {type: "text/xml"});

                    var anchor = document.createElement("a");
                    anchor.download = names.shift();
                    anchor.href = (window.webkitURL || window.URL).createObjectURL(fileBlob);
                    anchor.dataset.downloadurl = ['text/xml', anchor.download, anchor.href].join(':');
                    anchor.click();
                }
            }
            reader.readAsBinaryString(file);
        }
    }

    function handleFileSelect(evt) {
        var files = evt.target.files;
        document.getElementById('byte_content').textContent = "";
        var output = [];
        for (var i = 0, f; f = files[i]; i++) {
            if(f.type == "image/svg+xml"){
                output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ')', '</li>');
            }
            else{
                alert("Please, choose only svg files!")
            }
        }

        document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
    }

    document.getElementById('files').addEventListener('change', handleFileSelect, false);