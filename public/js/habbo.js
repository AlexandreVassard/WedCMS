function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

if (window.Prototype) {
    // patch html comments and evalScripts
    Prototype.ScriptFragment = '(?:<script.*?>\\s*(?:<!--)*)((\n|\r|.)*?)(?:<\/script>)';

    // from <http://www.vivabit.com/bollocks/2006/06/21/a-dom-ready-extension-for-prototype>
    Object.extend(Event, {
        _domReady: function () {
            if (arguments.callee.done) return;
            arguments.callee.done = true;
            if (this._timer) clearInterval(this._timer);
            this._readyCallbacks.each(function (f) {
                f()
            });
            this._readyCallbacks = null;
        },
        onDOMReady: function (f) {
            if (!this._readyCallbacks) {
                var domReady = this._domReady.bind(this);
                if (document.addEventListener) document.addEventListener("DOMContentLoaded", domReady, false);
                /*@cc_on @*/
                /*@if (@_win32)
                    var proto = "javascript:void(0)";
                    if (location.protocol == "https:") proto = "//0";
                    document.write("<script id=__ie_onload defer src=" + proto + "><\/script>");
                    document.getElementById("__ie_onload").onreadystatechange = function() {
                        if (this.readyState == "complete") domReady();
                    };
                /*@end @*/
                if (/WebKit/i.test(navigator.userAgent)) {
                    this._timer = setInterval(function () {
                        if (/loaded|complete/.test(document.readyState)) domReady();
                    }, 10);
                }
                Event.observe(window, 'load', domReady);
                Event._readyCallbacks = [];
            }
            Event._readyCallbacks.push(f);
        }
    });

    Ajax.Responders.register({
        onCreate: function (request, transport) {
            var sc = readCookie("JSESSIONID");
            if (sc) {
                if (typeof request.options.requestHeaders == 'object') {
                    request.options.requestHeaders["X-App-Key"] = sc;
                } else {
                    request.options.requestHeaders = {"X-App-Key": sc};
                }
            }
        }
    });
}

var currentPromo = 0;

function showPromo(num) {
    if (num != currentPromo) {
        $("promoimage").innerHTML = promoPages[num].image;
        $("promotext-content").innerHTML = promoPages[num].text;
        var listEl = $("promolinks-list");
        $A(listEl.childNodes).each(function (el) {
            el.parentNode.removeChild(el);
        });
        promoPages[num].links.each(function (link) {
            listEl.appendChild(document.createElement("li")).innerHTML = link;
        });

        var i = 0;
        $A($("promoheader-selectors").childNodes).each(function (node) {
            if (node.nodeName == "LI") {
                if (i == num) node.firstChild.className = "selected";
                else node.firstChild.className = "";
                i++;
            }
        });

        currentPromo = num;
    }
}


function validatorAddError(element, name, message, errorBoxId) {
    var errorBoxId = errorBoxId || "process-errors";
    var errorcontent = $(errorBoxId + "-content");
    errorcontent.appendChild(document.createTextNode(message));
    errorcontent.appendChild(document.createElement("br"));
    $(errorBoxId).style.display = "block";
}

function validatorBeforeSubmit(errorBoxId) {
    var errorBoxId = errorBoxId || "process-errors";
    $A($(errorBoxId + "-content").childNodes).each(function (el) {
        el.parentNode.removeChild(el);
    });
}

// for registration wizard
var backClicked = false;

function showOverlay(clickCallback, progressText) {
    var pageSize = getPageSize();
    var overlay = $("overlay");
    overlay.style.display = "block";
    overlay.style.height = pageSize[1] + "px";
    try {
        var topWidth = Element.getDimensions("top").width;
        if (topWidth > pageSize[2]) {
            overlay.style.minWidth = topWidth + "px";
        }
    } catch (ex) {
    }
    overlay.style.zIndex = "9000";

    if (progressText) {
        var progress = overlay.parentNode.insertBefore(Builder.node("div", {id: "overlay_progress"}, [
            Builder.node("p", [Builder.node("img", {
                src: habboStaticFilePath + "/images/progress_habbos.gif",
                alt: progressText
            })]),
            Builder.node("p", progressText)
        ]), overlay.nextSibling);
        var dim = Element.getDimensions(progress);
        var x = 0, y = 0;

        x = Math.round(pageSize[2] / 2) - Math.round(dim.width / 2);
        if (x < 0) {
            x = 0;
        }
        y = getViewportScrollY() + (Math.round(pageSize[3] / 2) - Math.round(dim.height / 2));
        if (y < 0) {
            y = 0;
        }

        progress.style.left = x + "px";
        progress.style.top = y + "px";
    }

    if (clickCallback) {
        Event.observe($("overlay"), "click", function (e) {
            clickCallback();
        }, false);
        if (progressText) {
            Event.observe($("overlay_progress"), "click", function (e) {
                clickCallback();
            }, false);
        }
    }
}

function hideOverlay() {
    if ($("overlay_progress")) {
        Element.remove($("overlay_progress"));
    }
    var overlay = $("overlay");
    overlay.style.zIndex = "9000";
    overlay.style.display = "none";
}

function moveOverlay(zIndex) {
    $("overlay").style.zIndex = zIndex;
    if ($("overlay_progress")) {
        $("overlay_progress").style.zIndex = zIndex;
    }
}

// From Lightbox by Lokesh Dhakar - http://www.huddletogether.com
// Core code from - quirksmode.org
// Edit for Firefox by pHaez
function getPageSize() {

    var xScroll, yScroll;

    if (window.innerHeight && window.scrollMaxY) {
        xScroll = document.body.scrollWidth;
        yScroll = window.innerHeight + window.scrollMaxY;
    } else if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac
        xScroll = document.body.scrollWidth;
        yScroll = document.body.scrollHeight;
    } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
        xScroll = document.body.offsetWidth;
        yScroll = document.body.offsetHeight;
    }

    var windowWidth, windowHeight;
    if (self.innerHeight) {	// all except Explorer
        windowWidth = self.innerWidth;
        windowHeight = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
        windowWidth = document.documentElement.clientWidth;
        windowHeight = document.documentElement.clientHeight;
    } else if (document.body) { // other Explorers
        windowWidth = document.body.clientWidth;
        windowHeight = document.body.clientHeight;
    }

    // for small pages with total height less then height of the viewport
    if (yScroll < windowHeight) {
        pageHeight = windowHeight;
    } else {
        pageHeight = yScroll;
    }

    // for small pages with total width less then width of the viewport
    if (xScroll < windowWidth) {
        pageWidth = windowWidth;
    } else {
        pageWidth = xScroll;
    }

    arrayPageSize = new Array(pageWidth, pageHeight, windowWidth, windowHeight)
    return arrayPageSize;
}

function getQueryParamValue(searchKey) {
    if (window.location.search) {
        var query = window.location.search.substring(1);
        var params = query.split('&');
        for (var i = 0; i < params.length; i++) {
            var pos = params[i].indexOf('=');
            if (pos > 0) {
                var key = params[i].substring(0, pos);
                if (key == searchKey) {
                    return params[i].substring(pos + 1);
                }
            }
        }
    }
    return null;
}

function ensureOpenerIsLoggedOut() {
    try {
        if (window.opener != null && window.opener.document.habboLoggedIn != null) {
            if (window.opener.document.habboLoggedIn == true) {
                window.opener.location.reload();
            }
        }
    } catch (error) {
    }
}

function ensureOpenerIsLoggedIn() {
    try {
        if (window.opener != null) {
            if (window.opener.document.logoutPage != null && window.opener.document.logoutPage == true) {
                window.opener.location.href = "/";
            } else if (window.opener.document.habboLoggedIn != null && window.opener.document.habboLoggedIn == false) {
                window.opener.location.reload();
            }
        }
    } catch (error) {
    }
}

function clearOpener() {
    if (window.opener && window.opener.openedHabbo) {
        window.opener.openedHabbo = null;
    }
}

function closePurchase(e) {
    if (e) Event.stop(e);
    Element.remove("purchase_dialog");
    hideOverlay();
}

function closeHc(e) {
    if (e) Event.stop(e);
    Element.remove("hc_dialog");
    hideOverlay();
}

function closeExtendNext(e) {
    if (e) Event.stop(e);
    Element.remove("hc_dialog_next");
    hideOverlay();
}

function showPurchaseResult(productCode) {
    new Ajax.Request(
        habboReqPath + "/furnipurchase/purchase_ajax",
        {
            method: "post", parameters: "product=" + encodeURIComponent(productCode), onComplete: function (req, json) {
                if ($("purchase_dialog")) Element.remove("purchase_dialog");
                moveOverlay("92");
                var resultDialog = createDialog("purchase_result", "", "9003", 0, -1000);
                appendDialogBody(resultDialog, req.responseText, true);
                moveDialogToCenter(resultDialog);
            }
        }
    );
}

function closePurchaseResult() {
    if ($("purchase_result")) Element.remove("purchase_result");
    if ($("purchase_dialog")) Element.remove("purchase_dialog");
    hideOverlay();

    // update credits tab
    creditsUpdated = false;
}

var currentTab = "myhabbo";
var timer = null;

function switchTab(tabName) {
    if (timer) {
        window.clearTimeout(timer);
    }
    if (tabName != currentTab) {
        $(currentTab).className = "";
        $(currentTab + "-content").className = "tabmenu-inner";
        $(tabName).className = "selected";
        $(tabName + "-content").className = "tabmenu-inner selected"
        currentTab = tabName;
        return true;
    }
    return false;
}

function fadeTab(tabName) {
    timer = window.setTimeout("switchTab('" + tabName + "')", 1500);
}

function lockCurrentTab() {
    if (timer) {
        window.clearTimeout(timer);
    }
}

var creditsUpdated = false;
var creditsUpdateOn = false;

function updateCredits() {
    if (!creditsUpdated && !creditsUpdateOn) {
        creditsUpdateOn = true;
        new Ajax.Updater("credits-status", habboReqPath + "/topbar/credits", {
            onComplete: function () {
                creditsUpdateOn = false;
            }, evalScripts: true
        });
        creditsUpdated = true;
    }
}

var habboClubUpdated = false;
var habboClubUpdateOn = false;

function updateHabboClub() {
    if (!habboClubUpdated && !habboClubUpdateOn) {
        habboClubUpdateOn = true;
        new Ajax.Updater("habboclub-status", habboReqPath + "/topbar/habboclub", {
            onComplete: function () {
                habboClubUpdateOn = false;
            }, evalScripts: true
        });
        habboClubUpdated = true;
    }
}

function updateHabboCreditAmounts(newAmount) {
    var elements = document.getElementsByClassName('habbocredits');
    elements.each(function (element) {
        element.update(newAmount);
    });
}

function createDialog(dialogId, header, dialogZIndex, dialogLeft, dialogTop, exitCallback) {
    if (!dialogId) return;
    var overlay = $("overlay");
    var headerBar = [Builder.node("div", [Builder.node("h3", [Builder.node("span", header)])])];
    if (exitCallback) {
        var exitButton = Builder.node("a", {href: "#", className: "dialog-grey-exit"}, [
            Builder.node("img", {
                src: habboStaticFilePath + "/images/dialogs/grey-exit.gif",
                width: 12,
                height: 12,
                alt: ""
            })
        ]);
        Event.observe(exitButton, "click", exitCallback, false);
        headerBar.push(exitButton);
    }
    var dialog = overlay.parentNode.insertBefore(Builder.node("div", {id: dialogId, className: "dialog-grey"}, [
        Builder.node("div", {className: "dialog-grey-top"}, headerBar),
        Builder.node("div", {className: "dialog-grey-content"}, [
            Builder.node("div", {
                id: dialogId + "-body",
                className: "dialog-grey-body"
            }, [Builder.node("div", {className: "clear"})])
        ]),
        Builder.node("div", {className: "dialog-grey-bottom"}, [Builder.node("div")])
    ]), overlay.nextSibling);
    dialog.style.zIndex = (dialogZIndex || 9001);
    dialog.style.left = (dialogLeft || -1000) + "px";
    dialog.style.top = (dialogTop || 0) + "px";
    return dialog;
}

function appendDialogBody(dialog, bodyEl, useInnerHTML) {
    var el = $(dialog);
    if (el) {
        var el2 = $(el.id + "-body");
        (useInnerHTML) ? el2.innerHTML += bodyEl : el2.insertBefore(bodyEl, el2.lastChild);
        if (bodyEl.innerHTML) bodyEl.innerHTML.evalScripts();
    }
}

function setDialogBody(dialog, bodyEl) {
    var el = $(dialog);
    if (el) {
        var el2 = $(el.id + "-body");
        el2.innerHTML = bodyEl;
    }
}

function moveDialogToView(dialog, e, coordinates) {
    var dim = Element.getDimensions(dialog);
    var pageSize = getPageSize();
    var x = 0, y = 0;

    if (coordinates) {
        x = coordinates.x;
        y = coordinates.y;
    } else if (e) {
        x = Event.pointerX(e) - 35;
        y = Event.pointerY(e) - 15;
    }

    if (x + dim.width > pageSize[2]) {
        x = pageSize[2] - dim.width;
    }
    if (x < 0) {
        x = 0;
    }
    if (y + dim.height > pageSize[3]) {
        y = pageSize[3] - dim.height;
    }
    if (y < 0) {
        y = 0;
    }

    dialog.style.left = x + "px";
    dialog.style.top = y + "px";
}

function moveDialogToCenter(dialog) {
    var topPos = Position.cumulativeOffset($("top"));

    var dim = Element.getDimensions(dialog);
    var pageSize = getPageSize();
    var x = 0, y = 0;

    x = Math.round(pageSize[2] / 2) - Math.round(dim.width / 2);
    if ($("sidebar_perso")) {
        var adPos = Position.cumulativeOffset($("sidebar_perso"));
        if (x + dim.width > adPos[0]) {
            x = adPos[0] - dim.width;
        }
    }
    if (x < 0) {
        x = 0;
    }
    y = getViewportScrollY() + 80;
    if (y + dim.height > pageSize[1]) {
        y = pageSize[1] - dim.height;
    }
    if (y < topPos[1]) {
        y = topPos[1] + 20;
    }

    dialog.style.left = x + "px";
    dialog.style.top = y + "px";
}

function moveDivToCenterOfDiv(innerDiv, outerDiv) {
    var innerDim = Element.getDimensions(innerDiv);
    var outerDim = Element.getDimensions(outerDiv);
    var outerPos = Position.cumulativeOffset(outerDiv);

    var x = 0, y = 0;
    x = outerPos[0] + Math.round((outerDim.width - innerDim.width) / 2);
    if (x < 0) {
        x = 0;
    }
    y = outerPos[1] + Math.round((outerDim.height - innerDim.height) / 2);
    if (y < 0) {
        y = 0;
    }

    innerDiv.style.left = x + "px";
    innerDiv.style.top = y + "px";
}

function getViewportScrollY() {
    var scrollY = 0;
    if (document.documentElement && document.documentElement.scrollTop) {
        scrollY = document.documentElement.scrollTop;
    } else if (document.body && document.body.scrollTop) {
        scrollY = document.body.scrollTop;
    } else if (window.pageYOffset) {
        scrollY = window.pageYOffset;
    } else if (window.scrollY) {
        scrollY = window.scrollY;
    }
    return scrollY;
};

function getProgressNode() {
    var div = Builder.node("div", [Builder.node("img", {
        src: habboStaticFilePath + "/images/progress.gif",
        width: "29",
        height: "5",
        alt: ""
    })]);
    div.style.textAlign = "center";
    return Builder.node("p", [div]).innerHTML;
}

if (window.Prototype) {
    var imgDo = false, origImg = false, newImg = false;
    Event.observe(window, "load", function () {
        if (document.habboLoggedIn) {
            var el = $("myimage");
            if (el) {
                Event.observe(document, "keydown", function (e) {
                    if (e.keyCode == Event.KEY_UP) {
                        imgDo = true;
                    }
                }, false);
                Event.observe(document, "keyup", function (e) {
                    if (imgDo) {
                        imgDo = false;
                    }
                }, false);
                Event.observe(el, "click", function (e) {
                    if (imgDo) {
                        if (!origImg) {
                            origImg = el.src;
                            if (!newImg) {
                                new Ajax.Request(habboReqPath + "/topbar/myimage", {
                                    onSuccess: function (t) {
                                        newImg = t.responseText;
                                        $("myimage").src = newImg;
                                    }
                                });
                            } else {
                                el.src = newImg;
                            }
                        } else {
                            el.src = origImg;
                            origImg = false;
                        }
                    }
                }, false);
            }
        }
    }, false);
}

function addClientUnloadHook() {
    if (habboClient == true && determineSWVersion() != "undefined") {
        Event.observe(window, "unload", function () {
            new Ajax.Request(habboReqPath + "/account/unloadclient");
        });
    }
}

function determineSWVersion() {
    if (navigator.mimeTypes && navigator.mimeTypes["application/x-director"] && navigator.mimeTypes["application/x-director"].enabledPlugin) {
        if (navigator.plugins && navigator.plugins["Shockwave for Director"] && (tVersionIndex = navigator.plugins["Shockwave for Director"].description.indexOf(".")) != -1) {
            return navigator.plugins["Shockwave for Director"].description.substring(tVersionIndex - 2, tVersionIndex + 2);
        }
    } else {
        try {
            var swControl = new ActiveXObject('SWCtl.SWCtl')
            if (swControl) {
                return swControl.ShockwaveVersion("");
            }
        } catch (e) {
        }
    }
    return "undefined";
}

function limitTextarea(id, maxLength, limitCallback) {
    new Form.Element.Observer($(id), .1, function (e) {
        var f = $(id);
        if (limitCallback) {
            limitCallback(f.value.length >= maxLength);
        }
        if (f.value.length > maxLength) {
            f.value = f.value.substring(0, maxLength);
        }
    });
}

/* habbo club subscription */
function closeSubscription(e) {
    if (e) {
        Event.stop(e);
    }
    if ($("subscription_dialog")) {
        Element.remove("subscription_dialog");
    }
    if ($("subscription_result")) {
        Element.remove("subscription_result");
    }
    hideOverlay();
}

function showSubscriptionResult(optionNumber, res_dialog_header) {
    new Ajax.Request(
        habboReqPath + "/habboclub/habboclub_subscribe",
        {
            method: "post",
            parameters: "optionNumber=" + encodeURIComponent(optionNumber),
            onComplete: function (req, json) {
                if ($("subscription_dialog")) Element.remove("subscription_dialog");
                var resultDialog = createDialog("subscription_result", res_dialog_header, "9003", 0, -1000, closeSubscription);
                appendDialogBody(resultDialog, req.responseText, true);
                moveDialogToCenter(resultDialog);
            }
        }
    );
    Element.remove("hc_confirm_box");
    getProgressNode();
}

function closeSubscriptionResult() {
    if ($("subscription_dialog")) {
        Element.remove("subscription_dialog");
        hideOverlay();
    }
    if ($("subscription_result")) {
        Element.remove("subscription_result");
        hideOverlay();
        new Ajax.Updater($("hc_ajax_content"), habboReqPath + "/habboclub/habboclub_meter_update", {asynchronous: true});
    }
}

function closeSubscriptionError() {
    Element.remove("subscription_result");
    hideOverlay();
}

/* \habbo club subscription */

var HabboCounter = {
    init: function (refreshFrequency) {
        this.refreshFrequency = refreshFrequency;
        this.start();
        this.lastValue = "0";
    },

    start: function () {
        new PeriodicalExecuter(this.onTimerEvent.bind(this), this.refreshFrequency);
    },

    onTimerEvent: function () {
        new Ajax.Request("/components/updateHabboCount", {
            onSuccess: function (response, obj) {
                if (obj && typeof obj.habboCountText != "undefined" && this.lastValue != obj.habboCountText) {
                    new Effect.Fade('habboCountUpdateTarget', {
                        duration: 0.5, afterFinish: function () {
                            Element.update('habboCountUpdateTarget', obj.habboCountText);
                            new Effect.Appear('habboCountUpdateTarget', {duration: 0.5});
                        }
                    });
                    this.lastValue = obj.habboCountText;
                }
            }
        });
    }

}