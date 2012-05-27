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
                    sizeExceededMessage: "too big image",
                    imgMaxSize: 167772160,
                    imgUploading: function (singleFile) {
                        // create some special data before send the request for a single file
                        // return uploadingData
                        return null;
                    },
                    imgUploaded: function (data, uploadingData) {
                        // data: the data of the response
                        // uploadingData: data created before send the request for the upload
                    },
                    uploaderror: function (uploadingData, textStatus, errorThrown) {
                        // uploadingData: data created before send the request for the upload
                        // textStatus: null, "timeout", "error", "abort", "parsererror".
                        // errorThrown: receives the textual portion of the HTTP status, such as "Not Found" or "Internal Server Error."
                    },
                    allImgsSent: function () {
                    },
                    allImgsSendStarted: function () {
                    },
                    completeFormData: function (formdata) {
                    },
                    enableLocalFileRead: false,
                    onFileReaded: function (uploadingData, file, fbinary) {
                        // when the browser supports FileReader this event happens after async upload request no matter which will be the response
                        // uploadingData: data created before send the request for the upload
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
                    var uploadingData = $plugin.settings.imgUploading(singleFile);
                    if (singleFile.size > $plugin.settings.imgMaxSize) {
                        $plugin.settings.uploaderror(uploadingData, $plugin.settings.sizeExceededMessage, null);
                        return;
                    }

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
                            $plugin.settings.imgUploaded(rdata, uploadingData);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            $plugin.settings.uploaderror(uploadingData, textStatus, errorThrown);
                        }
                    });
                    if ($plugin.data("imgup").hasFileReader) {
                        var reader = new FileReader();
                        // Closure to capture the file information.
                        reader.onload = (function (theFile) {
                            return function (e) {
                                $plugin.settings.onFileReaded(uploadingData, theFile, e.target.result);
                            };
                        })(singleFile);
                        reader.readAsDataURL(singleFile);
                    };
                };

                this.triggerFilesUpload = function (files) {
                    $plugin.settings.allImgsSendStarted();
                    for (var i = 0, len = files.length; i < len; i++) {
                        var f = files[i];
                        if (!f.type.match('image.*')) {
                            continue;
                        }
                        plugin.triggerUpload(f);
                    }
                    $plugin.settings.allImgsSent();
                };

                this.configureDropZone = function () {
                    if ($plugin.settings.linkedDropZone) {
                        $.each($plugin.settings.linkedDropZone, function (idx, dz) {
                            $(dz).on('dragover.imgup', function (e) {
                                e.stopPropagation();
                                e.preventDefault();
                                e.originalEvent.dataTransfer.dropEffect = 'copy';
                            });
                            $(dz).on('drop.imgup', function (e) {
                                e.stopPropagation();
                                e.preventDefault();
                                var files = e.originalEvent.dataTransfer.files;
                                plugin.triggerFilesUpload(files);
                            });
                        });
                    }
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
                plugin.configureDropZone();

                $plugin.on("change.imgup", function () {
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