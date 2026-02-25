var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
    let window = _____WB$wombat$assign$function_____("window");
    let self = _____WB$wombat$assign$function_____("self");
    let document = _____WB$wombat$assign$function_____("document");
    let location = _____WB$wombat$assign$function_____("location");
    let top = _____WB$wombat$assign$function_____("top");
    let parent = _____WB$wombat$assign$function_____("parent");
    let frames = _____WB$wombat$assign$function_____("frames");
    let opener = _____WB$wombat$assign$function_____("opener");

    Dialog = Class.create();
    Dialog.prototype = {
        initialize: function(id) {
            this.element = id;
            this.observed = false;
            this.observers = Array();
        },

        show: function() {
            if (this.beforeShow) {
                this.beforeShow();
            }

            $(this.element).style.zIndex = 9001;
            Element.show(this.element);
            this.observeAll();
            this.enable();

            if (this.afterShow) {
                this.afterShow();
            }
        },

        dispose: function() {
            if (this.beforeDispose) {
                this.beforeDispose();
            }

            Element.hide(this.element);
            this.stopObservingAll();

            if (this.afterDispose) {
                this.afterDispose();
            }
        },

        enable: function() {
            Form.enable(this.element);
            this.observeAll();
        },

        disable: function() {
            Form.disable(this.element);
            this.stopObservingAll();
        },

        clonePosition: function(el) {
            if (navigator.appVersion.match(/\bMSIE\b/)) {
                Position.clone(el, this.element, {setWidth: false, setHeight: false, offsetTop: -5,offsetLeft: -8});
            } else {
                Position.clone(el, this.element, {setWidth: false, setHeight: false, offsetTop: -5,offsetLeft: 0});
            }
        },

        cloneDialogPosition: function(dialog) {
            if (navigator.appVersion.match(/\bMSIE\b/)) {
                Position.clone(dialog.element, this.element, {setWidth: false, setHeight: false,offsetLeft: -8});
            } else {
                Position.clone(dialog.element, this.element, {setWidth: false, setHeight: false});
            }
        },

        observeAll: function () {
            if (!this.observed) {
                if (this.observers) {
                    for (var i=0; i < this.observers.length; i++) {
                        Event.observe(this.observers[i]["id"], 'click',
                            this.observers[i]["observer"], false);
                    }
                }

                this.observed = true;
            }
        },

        bringToFront: function() {
            if(this.element) {
                baseelement = $(this.element);
                baseelement.style.zIndex = 9999;
            }
        },

        stopObservingAll: function() {
            if (this.observed) {
                if (this.observers) {
                    for (var i=0; i < this.observers.length; i++) {
                        Event.stopObserving(this.observers[i]["id"], 'click',
                            this.observers[i]["observer"], false);
                    }
                }

                this.observed = false;
            }
        }
    }

//** Inappropriate content reporting *******************************************

//-- Motto reporting -----------------------------------------------------------
    MottoReportDialog = Class.create();
    Object.extend(MottoReportDialog.prototype, Dialog.prototype);

    Object.extend(MottoReportDialog.prototype, {
        initialize: function() {
            this.observers = Array();
            this.observers[0] = Array();
            this.observers[0]["id"] = "motto-report-report";
            this.observers[0]["observer"] = function(e) {
                Event.stop(e);

                if (!mottoReportDialog.accountId) {
                    return;
                }

                new Ajax.Request(
                    habboReqPath + "/mod/add_habbomotto_report", {
                        parameters: "objectId=" + mottoReportDialog.accountId,
                        onComplete: function(req) {
                            var resultDialog = reportErrorDialog;
                            if (req.responseText == "SUCCESS") {
                                resultDialog = reportSuccessDialog;
                            } else if (req.responseText == "SPAM") {
                                resultDialog = reportSpamDialog;
                            }
                            resultDialog.cloneDialogPosition(mottoReportDialog);
                            mottoReportDialog.dispose();
                            resultDialog.show();
                        }
                    }
                );
            }

            this.observers[1] = Array();
            this.observers[1]["id"] = "motto-report-cancel";
            this.observers[1]["observer"] = function(e) {
                Event.stop(e);
                mottoReportDialog.dispose();
            }
        },

        setAccountId: function(id) {
            mottoReportDialog.accountId = id;
        }
    });

    var mottoReportDialog = new MottoReportDialog();
    mottoReportDialog.element = "dialog-motto-report";


//-- Name reporting ------------------------------------------------------------
    NameReportDialog = Class.create();
    Object.extend(NameReportDialog.prototype, Dialog.prototype);

    Object.extend(NameReportDialog.prototype, {
        initialize: function() {
            this.observers = Array();
            this.observers[0] = Array();
            this.observers[0]["id"] = "name-report-report";
            this.observers[0]["observer"] = function(e) {
                Event.stop(e);

                if (!nameReportDialog.accountId) {
                    return;
                }

                new Ajax.Request(
                    habboReqPath + "/mod/add_habboname_report", {
                        parameters: "objectId=" + nameReportDialog.accountId,
                        onComplete: function(req) {
                            var resultDialog = reportErrorDialog;
                            if (req.responseText == "SUCCESS") {
                                resultDialog = reportSuccessDialog;
                            } else if (req.responseText == "SPAM") {
                                resultDialog = reportSpamDialog;
                            }
                            resultDialog.cloneDialogPosition(nameReportDialog);
                            nameReportDialog.dispose();
                            resultDialog.show();
                        }
                    }
                );
            }

            this.observers[1] = Array();
            this.observers[1]["id"] = "name-report-cancel";
            this.observers[1]["observer"] = function(e) {
                Event.stop(e);
                nameReportDialog.dispose();
            }
        },

        setAccountId: function(id) {
            nameReportDialog.accountId = id;
        }
    });

    var nameReportDialog = new NameReportDialog();
    nameReportDialog.element = "dialog-name-report";


//-- Room name reporting -------------------------------------------------------
    RoomReportDialog = Class.create();
    Object.extend(RoomReportDialog.prototype, Dialog.prototype);

    Object.extend(RoomReportDialog.prototype, {
        initialize: function() {
            this.observers = Array();
            this.observers[0] = Array();
            this.observers[0]["id"] = "room-report-report";
            this.observers[0]["observer"] = function(e) {
                Event.stop(e);

                if (!roomReportDialog.roomId) {
                    return;
                }

                new Ajax.Request(
                    habboReqPath + "/mod/add_room_report", {
                        parameters: "objectId=" + roomReportDialog.roomId,
                        method: "post",
                        onComplete: function(req) {
                            var resultDialog = reportErrorDialog;
                            if (req.responseText == "SUCCESS") {
                                resultDialog = reportSuccessDialog;
                            } else if (req.responseText == "SPAM") {
                                resultDialog = reportSpamDialog;
                            }
                            resultDialog.cloneDialogPosition(roomReportDialog);
                            roomReportDialog.dispose();
                            resultDialog.show();
                        }
                    }
                );
            }

            this.observers[1] = Array();
            this.observers[1]["id"] = "room-report-cancel";
            this.observers[1]["observer"] = function(e) {
                Event.stop(e);
                roomReportDialog.dispose();
            }
        },

        setRoomId: function(id) {
            roomReportDialog.roomId = id;
        }
    });

    var roomReportDialog = new RoomReportDialog();
    roomReportDialog.element = "dialog-room-report";


//-- Stickie note reporting ----------------------------------------------------
    StickieReportDialog = Class.create();
    Object.extend(StickieReportDialog.prototype, Dialog.prototype);

    Object.extend(StickieReportDialog.prototype, {
        initialize: function() {
            this.observers = Array();
            this.observers[0] = Array();
            this.observers[0]["id"] = "stickie-report-report";
            this.observers[0]["observer"] = function(e) {
                Event.stop(e);

                if (!stickieReportDialog.stickieId) {
                    return;
                }
                new Ajax.Request(
                    habboReqPath + "/mod/add_stickienote_report", {
                        parameters: "objectId=" + stickieReportDialog.stickieId,
                        method: "post",
                        onComplete: function(req) {
                            var resultDialog = reportErrorDialog;
                            if (req.responseText == "SUCCESS") {
                                resultDialog = reportSuccessDialog;
                            } else if (req.responseText == "SPAM") {
                                resultDialog = reportSpamDialog;
                            }
                            resultDialog.cloneDialogPosition(stickieReportDialog);
                            stickieReportDialog.dispose();
                            resultDialog.show();
                        }
                    }
                );
            }

            this.observers[1] = Array();
            this.observers[1]["id"] = "stickie-report-cancel";
            this.observers[1]["observer"] = function(e) {
                Event.stop(e);
                stickieReportDialog.dispose();
            }
        },

        setStickieId: function(id) {
            stickieReportDialog.stickieId = id;
        }
    });

    var stickieReportDialog = new StickieReportDialog();
    stickieReportDialog.element = "dialog-stickie-report";


//-- Report error --------------------------------------------------------------
    ReportErrorDialog = Class.create();
    Object.extend(ReportErrorDialog.prototype, Dialog.prototype);

    Object.extend(ReportErrorDialog.prototype, {
        initialize: function() {
            this.observers = Array();
            this.observers[0] = Array();
            this.observers[0]["id"] = "report-error-close";
            this.observers[0]["observer"] = function(e) {
                Event.stop(e);
                reportErrorDialog.dispose();
            }
        }
    });

    var reportErrorDialog = new ReportErrorDialog();
    reportErrorDialog.element = "dialog-report-error";


//-- Reporting flood ------------------------------------------------------------
    ReportSpamDialog = Class.create();
    Object.extend(ReportSpamDialog.prototype, Dialog.prototype);

    Object.extend(ReportSpamDialog.prototype, {
        initialize: function() {
            this.observers = Array();
            this.observers[0] = Array();
            this.observers[0]["id"] = "report-spam-close";
            this.observers[0]["observer"] = function(e) {
                Event.stop(e);
                reportSpamDialog.dispose();
            }
        }
    });

    var reportSpamDialog = new ReportSpamDialog();
    reportSpamDialog.element = "dialog-report-spam";


//-- Report success ------------------------------------------------------------
    ReportSuccessDialog = Class.create();
    Object.extend(ReportSuccessDialog.prototype, Dialog.prototype);

    Object.extend(ReportSuccessDialog.prototype, {
        initialize: function() {
            this.observers = Array();
            this.observers[0] = Array();
            this.observers[0]["id"] = "report-success-close";
            this.observers[0]["observer"] = function(e) {
                Event.stop(e);
                reportSuccessDialog.dispose();
            }
        }
    });

    var reportSuccessDialog = new ReportSuccessDialog();
    reportSuccessDialog.element = "dialog-report-success";

}