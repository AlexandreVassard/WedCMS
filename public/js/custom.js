// THIS FILE NEEDS builder.js FROM HABBO

// HABBOS CONNECTED
function habbosConnected() {
  var counter = document.querySelector('.counter-reload span');
  var habboLoggedSpan = document.querySelector('#habbo-logged-span');
  var habbosLoggedSpan = document.querySelector('#habbos-logged-span');
  window.fetch('/api/settings/players.online').then((result) => {
    result.json().then((json) => {
      if (counter.innerHTML !== json.value) {
        counter.innerHTML = json.value;
        if (json.value > 0) {
          habboLoggedSpan.style.display = 'inline';
          habbosLoggedSpan.style.display = 'none';
        } else {
          habboLoggedSpan.style.display = 'none';
          habbosLoggedSpan.style.display = 'inline';
        }
      }
    });
  });
}
habbosConnected();
setInterval(habbosConnected, 5000);

// CLIENT

var openedHabbo;

function _isHabboClient(win) {
  return win.location.pathname.startsWith('/client');
}

function openHabbo(url, forceOpen = false) {
  var win = _openHabboWindow('', 'client');
  if (!_isHabboClient(win) || forceOpen) {
    win.location.href = url;
  }
  openedHabbo = win;
}

function openOrFocusHabbo(url) {
  if (!_isHabboOpen()) {
    openHabbo(url);
  }
  openedHabbo.focus();
}

function openAndFocusHabbo(url) {
  openHabbo(url, true);
  openedHabbo.focus();
}

function _openHabboWindow(url, target) {
  return window.open(
    url,
    target,
    'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=no,width=740,height=597',
  );
}

function _isHabboOpen() {
  return openedHabbo !== undefined && !openedHabbo.closed;
}

function enterHotel() {
  openOrFocusHabbo('/client');
}

function enterHotelRoom(type, roomId) {
  console.log(type, roomId);
  window
    .fetch('/api/rcon/forward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: +type,
        roomId,
      }),
    })
    .then((result) => {
      result
        .json()
        .then((json) => {
          if (json.code !== 200) {
            // open client with forwarding parameters if rcon command failed (ex: client not running)
            openAndFocusHabbo(
              '/client?forwardType=' + type + '&forwardId=' + roomId,
            );
          } else {
            openOrFocusHabbo('/client');
          }
        })
        .catch(() => {
          openAndFocusHabbo(
            '/client?forwardType=' + type + '&forwardId=' + roomId,
          );
        });
    })
    .catch(() => {
      openAndFocusHabbo('/client?forwardType=' + type + '&forwardId=' + roomId);
    });
  /*
  if (_isHabboOpen() && _isHabboClient(openedHabbo)) {
    try {
      var plugin = openedHabbo.document.getElementById('habbo');
      plugin.SetVariable('forward.type', '2');
      plugin.SetVariable('forward.id', String(roomId));
      openedHabbo.focus();
      return;
    } catch (e) {
      // Plugin doesn't support SetVariable while running — fall through
    }
  }*/
  //openAndFocusHabbo('/client?room=' + roomId);
}

// DIALOGS

/*
    showDialog('test', 'Acheter un mobi',
        `
                <p>Est-tu sûr de vouloir l'acheter ?</p>
                <p><a href="javascript:closeDialog('test')" class="colorlink orange" style="margin-top:-10px;"><span>Fermer</span></a></p>
              `
    );
*/

function showDialog(dialogId, title, body) {
  moveOverlay('100');
  var resultDialog = newDialog(dialogId, title, '9003', 0, -1000);
  appendDialogBody(resultDialog, body, true);
  moveDialogToCenter(resultDialog);
}

function closeDialog(dialogId) {
  document.querySelector('#' + dialogId).remove();
  hideOverlay();
}

function newDialog(dialogId, header, dialogZIndex, dialogLeft, dialogTop) {
  var overlay = document.querySelector('#overlay');
  var headerBar = [
    Builder.node('div', [Builder.node('h3', [Builder.node('span', header)])]),
  ];
  var dialog = overlay.parentNode.insertBefore(
    Builder.node('div', { id: dialogId, className: 'dialog-grey' }, [
      Builder.node('div', { className: 'dialog-grey-top' }, headerBar),
      Builder.node('div', { className: 'dialog-grey-content' }, [
        Builder.node(
          'div',
          {
            id: dialogId + '-body',
            className: 'dialog-grey-body',
          },
          [Builder.node('div', { className: 'clear' })],
        ),
      ]),
      Builder.node('div', { className: 'dialog-grey-bottom' }, [
        Builder.node('div'),
      ]),
    ]),
    overlay.nextSibling,
  );
  dialog.style.zIndex = dialogZIndex || 9001;
  dialog.style.left = (dialogLeft || -1000) + 'px';
  dialog.style.top = (dialogTop || 0) + 'px';
  return dialog;
}

// BUY RARE
function buyRare(headerText, subscribeContent) {
  var dialog = createDialog(
    'purchase_dialog',
    headerText,
    9001,
    0,
    -1000,
    closePurchase,
  );
  appendDialogBody(dialog, 'Chargement...', true);
  moveDialogToCenter(dialog);
  showOverlay();
  setDialogBody(dialog, subscribeContent);
}

function hcSubscribe(headerText, subscribeContent) {
  var dialog = createDialog('hc_dialog', headerText, 9001, 0, -1000, closeHc);
  appendDialogBody(dialog, 'Chargement...', true);
  moveDialogToCenter(dialog);
  showOverlay();
  setDialogBody(dialog, subscribeContent);
}

function hcSubscribeNext(headerText, subscribeNextContent) {
  closeDialog('hc_dialog');
  var dialog = createDialog(
    'hc_dialog_next',
    headerText,
    9001,
    0,
    -1000,
    closeExtendNext,
  );
  appendDialogBody(dialog, 'Chargement...', true);
  moveDialogToCenter(dialog);
  showOverlay();
  setDialogBody(dialog, subscribeNextContent);
}
