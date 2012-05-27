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
                    imgUploaded: function (data) {
                    },
                    uploaderror: function (textStatus) {
                    },
                    allImsSent: function () {
                    },
                    completeFormData: function (formdata) {
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
                    
                    $.ajax({
                        url: $plugin.settings.uploadurl,
                        type: "POST",
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: datas,
                        success: function (rdata) {
                            $plugin.settings.imgUploaded(rdata);

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
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            $plugin.settings.uploaderror(textStatus);
                        }
                    });
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
                    $plugin.settings.allImsSent();
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