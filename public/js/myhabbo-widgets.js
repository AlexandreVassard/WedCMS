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

    var FriendsWidget = {

        init : function(pages, theRange, accountIdentity) {
            this.slider = new Control.Slider('slider-handle', 'slider-bar', {
                range:$R(1,pages), axis:'horizontal', alignX: -10,
                values: theRange
            });
            this.slider.options.onChange = function(value) {

                $("number").innerHTML = value + "/"+ pages;

                new Ajax.Updater($("friends"), habboReqPath + "/myhabbo/friends_ajax", {
                    method : "get",
                    parameters :"name=" + encodeURIComponent(accountIdentity) +  "&index=" + encodeURIComponent(value-1),
                    evalScripts : true
                });

            };
            this.timer = false;
        },

        showFriendData : function(ind, amount) {
            this.stopHideTimer();

            for (x = 0; x < amount; x++) {
                $('finf-' + x).style.display = 'none';
                $('f' + x).className = 'friend';
            }

            $('finf-' + ind).style.display = 'block';
            $('f' + ind).className = 'friend friend-selected';
        },

        hideFriendData : function(ind, delay) {
            this.timer = window.setTimeout(function() {
                $('finf-' + ind).style.display = 'none';
                $('f' + ind).className = 'friend';
            }, delay);
        },

        stopHideTimer: function() {
            if (this.timer) {
                window.clearTimeout(this.timer);
            }
        }
    };

}