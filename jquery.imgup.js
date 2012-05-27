/*

jQuery multi images uploader 1.0.0
	
Licensed under the MIT license:
http://www.opensource.org/licenses/mit-license.php

fabiomaulo@gmail.com

*/
(function ($) {
    var methods = {
        init: function (options) {
            return this.each(function () {
                var settings = {
                    uploadurl: "",
                    imgMaxSize: 167772160,
                    imgUploaded: function (responseText) {
                    },
                    uploaderror: function (responseText) {
                    },
                    allImgsUploaded: function () {
                    },
                    completeFormData: function (data) {
                    },
                    enableLocalFileRead: false,
                    onFileReaded: function (file, fbinary) {
                        // when the browser supports FileReader this event happens after upload success
                    }
                };

                if (options) {
                    $.extend(settings, options);
                }

                var plugin = this;
                var $plugin = $(this);

                $plugin.settings = settings;

                this.triggerUpload = function (singleFile) {
                    if ($plugin.data("imgup").hasFormData) {
                        plugin.uploadWithFormData(singleFile);
                    }
                };

                this.uploadWithFormData = function (singleFile) {
                    var datas = new FormData();
                    datas.append('image', singleFile);
                    $plugin.settings.completeFormData(datas);
                    plugin.sendDatas(singleFile, datas);
                };

                this.sendDatas = function (singleFile, datas) {
                    var xhr = new XMLHttpRequest();

                    if (xhr) {
//                        xhr.upload.addEventListener("progress", function (e) { plugin.updateProgress.call(plugin, e); }, false);
//                        xhr.addEventListener("load", function () { plugin.endUpload.call(plugin); }, false);
//                        xhr.addEventListener("abort", function () { plugin.closeXhr(plugin); }, false);
//                        document.body.addEventListener('offline', function () { plugin.endProcess(0); }, false);

                        xhr.onreadystatechange = function () {
                            if (this.readyState == 4) {
                                var status = this.status;

                                if (status == 200) {
                                    $plugin.settings.imgUploaded(xhr.responseText);

                                    if ($plugin.data("imgup").hasFileReader) {
                                        var reader = new FileReader();
                                        // Closure to capture the file information.
                                        reader.onload = (function (theFile) {
                                            return function (e) {
                                                $plugin.settings.onFileReaded(theFile, e.target.result);
                                            };
                                        })(singleFile);
                                        reader.readAsDataURL(singleFile);
                                    }
                                }
                                if (status == 404 || status == 500) {
                                    $plugin.settings.uploaderror(xhr.responseText);
                                }
                            }
                        };
                        xhr.open("POST", $plugin.settings.uploadurl);
                        plugin.processUpload(xhr, datas);
                    }
                };
                this.processUpload = function (xhr, data) {
                    if ($plugin.data("imgup").hasFormData) {
                        xhr.send(data);
                    }
                };
                this.triggerFilesUpload = function (files) {
                    for (var i = 0, len = files.length; i < len; i++) {
                        var f = files[i];
                        if (!f.type.match('image.*')) {
                            continue;
                        }
                        if (f.size > $plugin.settings.imgMaxSize) {
                            $plugin.settings.uploaderror("too big image");
                            continue;
                        }
                        plugin.triggerUpload(f);
                    }
                    $plugin.settings.allImgsUploaded();
                };

                var tFormData = false;
                try {
                    new FormData();
                    tFormData = true;
                } catch (ex) {
                    tFormData = false;
                }
                var tFileReader = window.FileReader && $plugin.settings.enableLocalFileRead;
                $plugin.data("imgup", { hasFormData: tFormData, hasFileReader: tFileReader });
                // linkedDropZone
                if ($plugin.settings.linkedDropZone) {
                    $plugin.data("imgup").dropZone = $plugin.settings.linkedDropZone;
                    $.each($plugin.settings.linkedDropZone, function (idx, dz) {
                        dz.addEventListener('dragover', function (evt) {
                            evt.stopPropagation();
                            evt.preventDefault();
                            evt.dataTransfer.dropEffect = 'copy';
                        }, false);
                        dz.addEventListener('drop', function (evt) {
                            evt.stopPropagation();
                            evt.preventDefault();
                            var files = evt.dataTransfer.files;
                            plugin.triggerFilesUpload(files);
                        }, false);
                    });
                }

                $plugin.bind("change.imgup", function () {
                    var files = plugin.files;
                    plugin.triggerFilesUpload(files);
                });
            });
        }
    };

    $.fn.imgup = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on jQuery.imgup");
        }
    };

})(jQuery);