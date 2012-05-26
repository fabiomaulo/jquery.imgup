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
                    imgUploaded: function () {
                    },
                    allImgsUploaded: function () {
                    },
                    uploaderror: function () {
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

                    plugin.sendDatas(datas);
                };
                this.sendDatas = function(datas) {
                    var xhr = new XMLHttpRequest();

                    if (xhr) {
                        xhr.upload.addEventListener("progress", function(e) { plugin.updateProgress.call(plugin, e); }, false);
                        xhr.addEventListener("load", function() { plugin.endUpload.call(plugin); }, false);
                        xhr.addEventListener("abort", function() { plugin.closeXhr(plugin); }, false);
                        document.body.addEventListener('offline', function() { plugin.endProcess(0); }, false);

                        xhr.onreadystatechange = function() {
                            if (this.readyState == 4) {
                                var status = this.status;

                                if (status == 200) {
                                    $plugin.settings.imgUploaded(xhr.responseText);
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
                this.processUpload = function(xhr, data) {
                    if ($plugin.data("imgup").hasFormData) {
                        xhr.send(data);
                    }
                };
                
                var tFormData = false;
                try {
                    new FormData();
                    tFormData = true;
                } catch (ex) {
                    tFormData = false;
                }

                $plugin.data("imgup", { hasFormData: tFormData, hasFileReader: window.FileReader });

                $plugin.bind("change.imgup", function () {
                    var files = plugin.files;
                    for (var i = 0, len = files.length; i < len; i++) {
                        plugin.triggerUpload(files[i]);
                    }
                    $plugin.settings.allImgsUploaded();
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