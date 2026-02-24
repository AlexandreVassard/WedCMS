// ── Globals expected by myhabbo-edit.js ──────────────────────
var habboReqPath = '';
var _editorOriginalPositions = {};
var _editorOriginalBg = '';

// ── Missing helpers (called by myhabbo-edit.js) ───────────────

function isNotWithinPlayground(element) {
    var pg = $('playground');
    if (!pg) return false;
    var pgDims = Element.getDimensions(pg);
    var elDims = Element.getDimensions(element);
    var top = parseInt(element.style.top) || 0;
    var left = parseInt(element.style.left) || 0;
    return (top < 0 || left < 0 ||
            top + elDims.height > pgDims.height ||
            left + elDims.width > pgDims.width);
}

function cancelEditing() {
    $$('#playground .movable').each(function(el) {
        var saved = _editorOriginalPositions[el.id];
        if (saved) {
            el.style.left = saved.left;
            el.style.top = saved.top;
            if (saved.display !== undefined) el.style.display = saved.display;
        }
    });
    if (_editorOriginalBg) $('mypage-bg').className = _editorOriginalBg;
    clearDraggables();
    document.body.id = '';
    Element.show('edit-page-button');
    closeAllEditorDialogs();
}

function getSaveEditingActionName() {
    return '/myhabbo/save';
}

function showSaveOverlay() {
    console.log('[Editor] Saved (mock):', generatePostBody());
    clearDraggables();
    document.body.id = '';
    Effect.SlideUp($('top-toolbar'), { duration: 1 });
    Element.show('edit-page-button');
    closeAllEditorDialogs();
    return false;
}

function showOverlay() {}
function hideOverlay() {}
function moveOverlay(z) {}

function closeWidgetInventory() {
    var d = $('dialog-widget-inventory'); if (d) d.hide();
}
function closeBackgroundInventory() {
    var d = $('dialog-background-inventory'); if (d) d.hide();
}
function closeStickerInventory() {
    var d = $('dialog-sticker-inventory'); if (d) d.hide();
}
function closeAllEditorDialogs() {
    closeWidgetInventory();
    closeBackgroundInventory();
    closeStickerInventory();
    if (typeof closeEditMenu === 'function') closeEditMenu();
}

function initDraggableDialogs() {}

function createDialog(id, title, z) {
    var d = new Element('div', { id: id, style: 'position:fixed;z-index:'+z+';background:#fff;border:1px solid #000;padding:8px;' });
    d.innerHTML = '<h3>' + title + '</h3>';
    document.body.appendChild(d);
    return d;
}
function appendDialogBody(dialog, node) { dialog.appendChild(node); }
function makeDialogDraggable(dialog) {}
function moveDialogToCenter(dialog) {
    dialog.style.left = ((document.viewport.getWidth() - 200) / 2) + 'px';
    dialog.style.top  = ((document.viewport.getHeight() - 100) / 2) + 'px';
}
function isElementLimitReached() { return false; }

// ── Override AJAX-heavy functions with mock versions ──────────

function placeWidget(type) {
    var w = $$('#playground .movable.' + type)[0];
    if (w) {
        w.show();
        new Effect.Appear(w, { duration: 0.4 });
        savePosition(w);
    }
    closeWidgetInventory();
}

function handleEditSkinChange(e) {
    Event.stop(e);
    if (!chosenElement) return;
    var skinId = $F('edit-menu-skins-select');
    var element = $('widget-' + chosenElement.id) || $(chosenElement.elementId);
    if (element) {
        var inner = findFirstDivChild(element);
        ['w_skin_goldenskin','w_skin_metalskin','w_skin_defaultskin',
         'w_skin_notepadskin','w_skin_noteitskin'].each(function(c) {
            inner.removeClassName(c);
        });
        inner.addClassName(skinId);
    }
    closeEditMenu();
}

function handleEditRemove(e) {
    Event.stop(e);
    if (!chosenElement) return;
    var element = $('widget-' + chosenElement.id);
    if (element) {
        new Effect.Fade(element, { duration: 0.4, afterFinish: function() { element.hide(); } });
    }
    closeEditMenu();
}

// ── Enter edit mode ───────────────────────────────────────────

function enterEditMode() {
    _editorOriginalBg = $('mypage-bg').className;
    $$('#playground .movable').each(function(el) {
        _editorOriginalPositions[el.id] = {
            left: el.style.left,
            top: el.style.top,
            display: el.style.display
        };
    });

    document.body.id = 'editmode';
    Element.hide('edit-page-button');

    initEditToolbar();
    initMovableItems();
}

// ── DOM-ready initialization ──────────────────────────────────

window.addEventListener('DOMContentLoaded', function() {
    var editBtn = $('edit-page-button');
    if (editBtn) {
        Event.observe(editBtn, 'click', function(e) {
            Event.stop(e);
            enterEditMode();
        });
    }

    var bgBtn = $('btn-backgrounds');
    if (bgBtn) {
        Event.observe(bgBtn, 'click', function(e) {
            Event.stop(e);
            closeAllEditorDialogs();
            var dlg = $('dialog-background-inventory');
            var pos = Position.cumulativeOffset(bgBtn);
            dlg.style.position = 'absolute';
            dlg.style.left = pos[0] + 'px';
            dlg.style.top = (pos[1] + Element.getHeight(bgBtn) + 4) + 'px';
            dlg.show();
        });
    }

    $$('.bg-item').each(function(item) {
        item.style.cursor = 'pointer';
        Event.observe(item, 'click', function(e) {
            Event.stop(e);
            changeBg(item.getAttribute('data-bg'), item.getAttribute('data-bg-id'));
        });
    });
    var closeBg = $('close-bg-inventory');
    if (closeBg) Event.observe(closeBg, 'click', function(e) { Event.stop(e); closeBackgroundInventory(); });

    var widgetsBtn = $('btn-widgets');
    if (widgetsBtn) {
        Event.observe(widgetsBtn, 'click', function(e) {
            Event.stop(e);
            closeAllEditorDialogs();
            var dlg = $('dialog-widget-inventory');
            var pos = Position.cumulativeOffset(widgetsBtn);
            dlg.style.position = 'absolute';
            dlg.style.left = pos[0] + 'px';
            dlg.style.top = (pos[1] + Element.getHeight(widgetsBtn) + 4) + 'px';
            dlg.show();
        });
    }

    $$('.widget-add-btn').each(function(btn) {
        Event.observe(btn, 'click', function(e) {
            Event.stop(e);
            placeWidget(btn.getAttribute('data-type'));
        });
    });
    var closeWI = $('close-widget-inventory');
    if (closeWI) Event.observe(closeWI, 'click', function(e) { Event.stop(e); closeWidgetInventory(); });

    var closeEM = $('close-edit-menu');
    if (closeEM) Event.observe(closeEM, 'click', function(e) { Event.stop(e); closeEditMenu(); });

    var skinApply = $('edit-menu-skins-apply');
    if (skinApply) Event.observe(skinApply, 'click', handleEditSkinChange);

    var removeBtn = $('edit-menu-remove');
    if (removeBtn) Event.observe(removeBtn, 'click', handleEditRemove);
});
