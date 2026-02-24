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

    var reportingButtonsObserved = false;
    var reportingZ = 8100;
    var oldZ = new Array();

    var bringToTop = function(e) {
        Event.stop(e);
        if(reportingButtonsObserved == true) {
            oldZ[this.id]=this.style.zIndex;
            this.style.zIndex = reportingZ;
            reportingZ++;
        }
    }

    var startReportingModeObserver = function(e) {
        Event.stop(e);

        document.getElementsByClassName("report-button", "playground").each(
            function (el) {
                Element.show(el);
                el.style.zIndex = 9998;
            }
        );

        document.getElementsByClassName("stickie", "playground").each(
            function (el) {
                Event.observe(el,"click",this.bringToTop.bindAsEventListener(el),false);
            }
        );

        document.getElementsByClassName("RoomsWidget", "playground").each(
            function (el) {
                Event.observe(el,"click",this.bringToTop.bindAsEventListener(el),false);
            }
        );

        document.getElementsByClassName("ProfileWidget", "playground").each(
            function (el) {
                Event.observe(el,"click",this.bringToTop.bindAsEventListener(el),false);
            }
        );

        document.getElementsByClassName("sticker", "playground").each(
            function (el) {
                Element.hide(el);
            }
        );

        document.getElementsByClassName("FriendsWidget", "playground").each(
            function (el) {
                Element.hide(el);
            }
        );

        document.getElementsByClassName("HighScoresWidget","playground").each(
            function (el) {
                Element.hide(el);
            }
        );

        if (!reportingButtonsObserved) {
            //Observe all stickie note reporting buttons
            document.getElementsByClassName("*report-button report-s*").each(
                function(el) {
                    //stickie-${id}-report
                    var stickieId = el.id.substring("stickie-".length, el.id.length-"-report".length);

                    Event.observe(el, "click",
                        function(e) {
                            Event.stop(e);
                            stickieReportDialog.setStickieId(stickieId);
                            stickieReportDialog.clonePosition(el);
                            stickieReportDialog.show();
                        },
                        false
                    );
                }
            );

            //Observe all name report buttons (usually 1 or 0)
            document.getElementsByClassName("*report-button report-n*").each(
                function(el) {
                    //name-${id}-report
                    var accountId = el.id.substring("name-".length, el.id.length-"-report".length);

                    Event.observe(el, "click", function(e) {
                        Event.stop(e);
                        nameReportDialog.setAccountId(accountId);
                        nameReportDialog.clonePosition(el);
                        nameReportDialog.show();
                    }, false);
                }
            );

            //Observe all mottos (usually 1 or 0)
            document.getElementsByClassName("*report-button report-m*").each(
                function(el) {
                    //motto-${id}-report
                    var accountId = el.id.substring("motto-".length, el.id.length-"-report".length);

                    Event.observe(el, "click", function(e) {
                        Event.stop(e);
                        mottoReportDialog.setAccountId(accountId);
                        mottoReportDialog.clonePosition(el);
                        mottoReportDialog.show();
                    }, false);
                }
            );

            //Observe all room links
            document.getElementsByClassName("*report-button report-r*").each(
                function(el) {
                    //room-${id}-report
                    var roomId = el.id.substring("room-".length, el.id.length-"-report".length);

                    Event.observe(el, "click", function(e) {
                        Event.stop(e);
                        roomReportDialog.setRoomId(roomId);
                        roomReportDialog.clonePosition(el);
                        roomReportDialog.show();
                    }, false);
                }
            );


            reportingButtonsObserved = true;
        }

        Element.hide("reporting-button");
        Element.show("stop-reporting-button");
    }

    var stopReportingModeObserver = function(e) {
        Event.stop(e);

        document.getElementsByClassName("report-button", "playground").each(
            function (el) {
                Element.hide(el);
            }
        );

        reportingZ = 8100;
        reportingButtonsObserved = false;

        document.getElementsByClassName("stickie", "playground").each(
            function (el) {
                Event.stopObserving(el,"click",this.bringToTop,false);
            }
        );

        document.getElementsByClassName("ProfileWidget", "playground").each(
            function (el) {
                Event.stopObserving(el,"click",this.bringToTop,false);
            }
        );

        document.getElementsByClassName("RoomsWidget", "playground").each(
            function (el) {
                Event.stopObserving(el,"click",this.bringToTop,false);
            }
        );

        document.getElementsByClassName("sticker", "playground").each(
            function (el) {
                Element.show(el);
            }
        );

        document.getElementsByClassName("FriendsWidget", "playground").each(
            function (el) {
                Element.show(el);
            }
        );

        document.getElementsByClassName("HighScoresWidget","playground").each(
            function (el) {
                Element.show(el);
            }
        );

        for(x in oldZ) {
            el = $(x);
            if(el) {
                el.style.zIndex=oldZ[x];
            }
        }
        oldZ = new Array();

        Element.hide("stop-reporting-button");

        stickieReportDialog.dispose();
        roomReportDialog.dispose();
        mottoReportDialog.dispose();
        nameReportDialog.dispose();
        reportSpamDialog.dispose();
        reportSuccessDialog.dispose();
        reportErrorDialog.dispose();

        Element.show("reporting-button");
        Event.observe("reporting-button", "click", startReportingModeObserver, false);
    }

    function observeAnim() {
        var p = document.getElementsByClassName("profile-figure");
        if (p.length > 0) {
            R=0; x1=.1; y1=.08; x2=.25; y2=.24; x3=1.6; y3=.24;
            x4=220; y4=200; x5=260; y5=200;
            DI = document.getElementsByClassName("movable", "mypage-wrapper");
            DIL=DI.length;
            bckup = new Array();
            for(i=0; i<DIL; i++){
                bckup[DI[i].id +  '-t'] = DI[i].style.top;
                bckup[DI[i].id +  '-l'] = DI[i].style.left;
            }
            Event.observe(p[0], "dblclick", function(e) {
                if (R < 100) {
                    Event.stop(e);
                    for(i=0; i<DIL; i++){
                        new Effect.Move(DI[i], {x : parseFloat(Math.sin(R*x1+i*x2+x3)*x4+x5), y : parseFloat(Math.cos(R*y1+i*y2+y3)*y4+y5), mode : 'absolute'});
                    }
                    setTimeout(function() {
                        B = setInterval(A,10);
                    }, 1000);
                }
            });
        }
        function A(){
            for(i=0; i<DIL; i++){
                DIS=DI[i].style;
                DIS.left=Math.sin(R*x1+i*x2+x3)*x4+x5 + "px";
                DIS.top=Math.cos(R*y1+i*y2+y3)*y4+y5 + "px";
            }
            R++;
            if (R > 100) {
                clearInterval(B);
                for(i=0; i<DIL; i++){
                    new Effect.Move(DI[i], {x : parseFloat(bckup[DI[i].id +  '-l']), y : parseFloat(bckup[DI[i].id +  '-t']), mode : 'absolute'});
                }
            }
        }
    }

}